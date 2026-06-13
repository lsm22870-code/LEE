import { Router } from "express";
import { db } from "@workspace/db";
import { districtRiskTable, weatherForecastTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getKMAForecast, districtToGrid, computeWeatherScore } from "../lib/kma.js";

const router = Router();

// ── 날씨 데이터 취득 (KMA 우선 → DB 폴백) ───────────────────────────────────

interface WeatherSnap {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitationProb: number;
  isDry: boolean;
  isHeatwave: boolean;
  isColdwave: boolean;
  isStrongWind: boolean;
  riskFactors: string[];
}

async function getLiveWeather(): Promise<WeatherSnap | null> {
  if (process.env["KMA_SERVICE_KEY"]) {
    try {
      const result = await getKMAForecast(60, 127); // 서울 기본 격자
      if (result) {
        const t = result.today;
        return {
          temperature: t.temperature,
          humidity: t.humidity,
          windSpeed: t.windSpeed,
          precipitationProb: t.precipitationProb,
          isDry: t.isDry,
          isHeatwave: t.isHeatwave,
          isColdwave: t.isColdwave,
          isStrongWind: t.isStrongWind,
          riskFactors: t.riskFactors,
        };
      }
    } catch {
      // KMA 실패 시 DB로 폴백
    }
  }

  // DB 폴백
  const rows = await db
    .select()
    .from(weatherForecastTable)
    .where(eq(weatherForecastTable.isToday, true))
    .limit(1);

  if (!rows[0]) return null;
  const w = rows[0];
  return {
    temperature: w.temperature,
    humidity: w.humidity,
    windSpeed: w.windSpeed,
    precipitationProb: w.precipitationProb,
    isDry: w.isDry,
    isHeatwave: w.isHeatwave,
    isColdwave: w.isColdwave,
    isStrongWind: w.isStrongWind,
    riskFactors: w.riskFactors ?? [],
  };
}

// ── GET /risk/today ───────────────────────────────────────────────────────────

router.get("/risk/today", async (req, res) => {
  try {
    const [districts, weather] = await Promise.all([
      db.select().from(districtRiskTable),
      getLiveWeather(),
    ]);

    if (districts.length === 0) {
      res.status(503).json({ error: "데이터가 아직 준비되지 않았습니다." });
      return;
    }

    const totalScore = districts.reduce((sum, d) => sum + d.score, 0);
    const overallScore = Math.round(totalScore / districts.length);

    let riskLevel: "관심" | "주의" | "경계" | "위험" = "관심";
    if (overallScore > 80) riskLevel = "위험";
    else if (overallScore > 60) riskLevel = "경계";
    else if (overallScore > 30) riskLevel = "주의";

    const highRiskDistricts = districts.filter(
      (d) => d.riskLevel === "위험" || d.riskLevel === "경계"
    );
    const topDistrict = [...districts].sort((a, b) => b.score - a.score)[0];

    // 기상청 실황 기반 위험요인
    const topRiskFactors: string[] = [];
    if (weather) {
      if (weather.isColdwave) topRiskFactors.push("한파특보: 전기장판·난방기기 화재 위험");
      if (weather.isHeatwave) topRiskFactors.push("폭염특보: 냉방기기·실외기 과부하 화재 위험");
      if (weather.isDry) topRiskFactors.push("건조특보: 산림 및 야외화재 위험");
      if (weather.isStrongWind) topRiskFactors.push("강풍특보: 화재 급격 확산 위험");
      if (weather.humidity < 40 && !weather.isDry)
        topRiskFactors.push(`낮은 습도(${weather.humidity}%): 화재 확산 위험 증가`);
      if (weather.temperature >= 33 && !weather.isHeatwave)
        topRiskFactors.push(`고온(${weather.temperature}°C): 냉방기기·실외기 화재 위험`);
      if (weather.temperature <= -5 && !weather.isColdwave)
        topRiskFactors.push(`저온(${weather.temperature}°C): 난방기기·전기장판 화재 위험`);
      if (weather.windSpeed >= 6 && !weather.isStrongWind)
        topRiskFactors.push(`강풍(${weather.windSpeed}m/s): 야외 화재 확산 위험`);
    }
    if (topRiskFactors.length === 0) {
      topRiskFactors.push("야간 시간대 전열기구 사용 주의");
      topRiskFactors.push("노후건축물 밀집지역 전기화재 위험");
    }

    res.json({
      overallScore,
      riskLevel,
      mainFireType: topDistrict?.mainFireType ?? "전기화재",
      topRiskFactors,
      preventionMessage:
        topDistrict?.preventionMessage ??
        "오늘 서울 주요 지역의 화재위험도를 확인하고 예방수칙을 준수하세요.",
      date: new Date().toISOString().split("T")[0],
      highRiskDistrictCount: highRiskDistricts.length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get today risk");
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

// ── GET /risk/districts ───────────────────────────────────────────────────────

router.get("/risk/districts", async (req, res) => {
  try {
    const districts = await db
      .select()
      .from(districtRiskTable)
      .orderBy(districtRiskTable.score);

    const result = [...districts].reverse().map((d) => ({
      name: d.name,
      score: d.score,
      riskLevel: d.riskLevel,
      mainFireType: d.mainFireType,
      dangerTime: d.dangerTime,
      weatherFactor: d.weatherFactor ?? "",
      preventionMessage: d.preventionMessage ?? "",
      lat: d.lat,
      lng: d.lng,
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get districts");
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

// ── GET /risk/districts/:districtName ────────────────────────────────────────

router.get("/risk/districts/:districtName", async (req, res) => {
  try {
    const { districtName } = req.params;

    // 지역 정보 + 기상청 날씨 병렬 취득
    const [district, kmaResult] = await Promise.all([
      db
        .select()
        .from(districtRiskTable)
        .where(eq(districtRiskTable.name, districtName))
        .limit(1),
      (async () => {
        if (!process.env["KMA_SERVICE_KEY"]) return null;
        const { nx, ny } = districtToGrid(districtName);
        try {
          return await getKMAForecast(nx, ny);
        } catch {
          return null;
        }
      })(),
    ]);

    if (district.length === 0) {
      res.status(404).json({ error: "해당 자치구를 찾을 수 없습니다." });
      return;
    }

    const d = district[0];

    // 기상청 데이터가 있으면 weatherRisk 동적 계산
    let liveWeatherScore = d.scoreWeatherRisk;
    let liveWeatherFactor = d.weatherFactor ?? "";
    if (kmaResult) {
      const t = kmaResult.today;
      liveWeatherScore = computeWeatherScore(
        {
          TMP: String(t.temperature),
          REH: String(t.humidity),
          WSD: String(t.windSpeed),
          POP: String(t.precipitationProb),
        },
        d.hasForestArea ?? false,
      );
      // 동적 weatherFactor 조합
      const parts: string[] = [];
      if (t.isDry) parts.push("건조특보");
      if (t.isHeatwave) parts.push("폭염특보");
      if (t.isColdwave) parts.push("한파특보");
      if (t.isStrongWind) parts.push("강풍특보");
      if (t.humidity < 40 && !t.isDry) parts.push(`낮은 습도(${t.humidity}%)`);
      if (t.temperature >= 33 && !t.isHeatwave) parts.push(`고온(${t.temperature}°C)`);
      if (t.temperature <= -5 && !t.isColdwave) parts.push(`저온(${t.temperature}°C)`);
      if (parts.length > 0) liveWeatherFactor = parts.join(", ") + ": 화재위험 증가";
    }

    // 총점을 live weatherScore 반영으로 재산출
    const liveScore = Math.min(
      100,
      d.scoreHistoricalFrequency +
        d.scoreRegionalHistory +
        d.scoreCausePersistence +
        liveWeatherScore +
        d.scoreRegionRisk,
    );

    let liveRiskLevel: "관심" | "주의" | "경계" | "위험" = "관심";
    if (liveScore > 80) liveRiskLevel = "위험";
    else if (liveScore > 60) liveRiskLevel = "경계";
    else if (liveScore > 30) liveRiskLevel = "주의";

    res.json({
      name: d.name,
      score: liveScore,
      riskLevel: liveRiskLevel,
      mainFireType: d.mainFireType,
      dangerTime: d.dangerTime,
      weatherFactor: liveWeatherFactor,
      regionFactors: d.regionFactors ?? [],
      citizenAdvice: d.citizenAdvice ?? [],
      firefighterAdvice: d.firefighterAdvice ?? [],
      lat: d.lat,
      lng: d.lng,
      scoreBreakdown: {
        historicalFrequency: d.scoreHistoricalFrequency,
        regionalHistory: d.scoreRegionalHistory,
        causePersistence: d.scoreCausePersistence,
        weatherRisk: liveWeatherScore,
        regionRisk: d.scoreRegionRisk,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get district detail");
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

// ── GET /risk/top-danger ──────────────────────────────────────────────────────

router.get("/risk/top-danger", async (req, res) => {
  try {
    const districts = await db.select().from(districtRiskTable);
    const sorted = [...districts]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((d) => ({
        name: d.name,
        score: d.score,
        riskLevel: d.riskLevel,
        mainFireType: d.mainFireType,
        dangerTime: d.dangerTime,
        weatherFactor: d.weatherFactor ?? "",
        preventionMessage: d.preventionMessage ?? "",
        lat: d.lat,
        lng: d.lng,
      }));

    res.json(sorted);
  } catch (err) {
    req.log.error({ err }, "Failed to get top danger districts");
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

// ── GET /dashboard/firefighter ────────────────────────────────────────────────

router.get("/dashboard/firefighter", async (req, res) => {
  try {
    const districts = await db.select().from(districtRiskTable);
    const sorted = [...districts].sort((a, b) => b.score - a.score);

    const highRisk = sorted.filter(
      (d) => d.riskLevel === "위험" || d.riskLevel === "경계"
    );

    const riskTypeCounts: Record<string, number> = {};
    districts.forEach((d) => {
      riskTypeCounts[d.mainFireType] = (riskTypeCounts[d.mainFireType] ?? 0) + 1;
    });

    const riskTypeBreakdown = Object.entries(riskTypeCounts).map(
      ([type, count]) => ({ type, count })
    );

    const patrolRecommendations = sorted.slice(0, 5).map((d, i) => ({
      district: d.name,
      priority: i + 1,
      reason: d.weatherFactor ?? `${d.mainFireType} 위험 지역`,
      action: d.firefighterAdvice?.[0] ?? "예방순찰 및 안전점검 실시",
      timeRange: d.dangerTime,
    }));

    res.json({
      date: new Date().toISOString().split("T")[0],
      totalHighRiskAreas: highRisk.length,
      priorityDistricts: sorted.slice(0, 5).map((d) => ({
        name: d.name,
        score: d.score,
        riskLevel: d.riskLevel,
        mainFireType: d.mainFireType,
        dangerTime: d.dangerTime,
        weatherFactor: d.weatherFactor ?? "",
        preventionMessage: d.preventionMessage ?? "",
        lat: d.lat,
        lng: d.lng,
      })),
      riskTypeBreakdown,
      patrolRecommendations,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get firefighter dashboard");
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

export default router;

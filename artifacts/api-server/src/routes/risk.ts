import { Router } from "express";
import { db } from "@workspace/db";
import { districtRiskTable, weatherForecastTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/risk/today", async (req, res) => {
  try {
    const districts = await db.select().from(districtRiskTable);
    const weather = await db
      .select()
      .from(weatherForecastTable)
      .where(eq(weatherForecastTable.isToday, true))
      .limit(1);

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
    const topDistrict = districts.sort((a, b) => b.score - a.score)[0];

    const topRiskFactors: string[] = [];
    if (weather[0]) {
      if (weather[0].isColdwave) topRiskFactors.push("한파특보: 난방기기 화재 위험");
      if (weather[0].isHeatwave) topRiskFactors.push("폭염특보: 냉방기기 화재 위험");
      if (weather[0].isDry) topRiskFactors.push("건조특보: 산림 및 야외화재 위험");
      if (weather[0].isStrongWind) topRiskFactors.push("강풍특보: 화재 확산 위험");
      if (weather[0].humidity < 40) topRiskFactors.push(`낮은 습도(${weather[0].humidity}%): 화재 확산 위험 증가`);
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

router.get("/risk/districts", async (req, res) => {
  try {
    const districts = await db
      .select()
      .from(districtRiskTable)
      .orderBy(districtRiskTable.score);

    const result = districts.reverse().map((d) => ({
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

router.get("/risk/districts/:districtName", async (req, res) => {
  try {
    const { districtName } = req.params;
    const district = await db
      .select()
      .from(districtRiskTable)
      .where(eq(districtRiskTable.name, districtName))
      .limit(1);

    if (district.length === 0) {
      res.status(404).json({ error: "해당 자치구를 찾을 수 없습니다." });
      return;
    }

    const d = district[0];
    res.json({
      name: d.name,
      score: d.score,
      riskLevel: d.riskLevel,
      mainFireType: d.mainFireType,
      dangerTime: d.dangerTime,
      weatherFactor: d.weatherFactor ?? "",
      regionFactors: d.regionFactors ?? [],
      citizenAdvice: d.citizenAdvice ?? [],
      firefighterAdvice: d.firefighterAdvice ?? [],
      lat: d.lat,
      lng: d.lng,
      scoreBreakdown: {
        historicalFrequency: d.scoreHistoricalFrequency,
        regionalHistory: d.scoreRegionalHistory,
        causePersistence: d.scoreCausePersistence,
        weatherRisk: d.scoreWeatherRisk,
        regionRisk: d.scoreRegionRisk,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get district detail");
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

router.get("/risk/top-danger", async (req, res) => {
  try {
    const districts = await db.select().from(districtRiskTable);
    const sorted = districts
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

router.get("/dashboard/firefighter", async (req, res) => {
  try {
    const districts = await db.select().from(districtRiskTable);
    const sorted = districts.sort((a, b) => b.score - a.score);

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

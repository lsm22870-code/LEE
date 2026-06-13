import { Router } from "express";
import { db } from "@workspace/db";
import { weatherForecastTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  getCurrentWeather,
  getKMAForecast,
  districtToGrid,
  type KMADayForecast,
} from "../lib/kma.js";

const router = Router();

// ── GET /weather/current?district=성동구  ─────────────────────────────────────
router.get("/weather/current", async (req, res) => {
  const district = (req.query["district"] as string | undefined) ?? "서울";
  try {
    const current = await getCurrentWeather(district);
    res.json(current);
  } catch (err) {
    req.log.error({ err }, "Failed to get current weather");
    res.status(500).json({
      temperature: null,
      humidity: null,
      windSpeed: null,
      windDirection: null,
      precipitation: null,
      skyCondition: null,
      precipitationType: null,
      source: "ERROR",
      sourceMessage: "기상청 예보 연결 실패",
      observedAt: null,
    });
  }
});

// ── GET /weather/forecast?district=성동구  OR  ?nx=60&ny=127  ─────────────────
router.get("/weather/forecast", async (req, res) => {
  try {
    // 격자 좌표 결정
    let nx = Number(req.query["nx"] ?? 60);
    let ny = Number(req.query["ny"] ?? 127);
    const district = req.query["district"] as string | undefined;
    if (district) {
      const grid = districtToGrid(district);
      nx = grid.nx;
      ny = grid.ny;
    }

    // KMA API 시도
    let kmaResult: Awaited<ReturnType<typeof getKMAForecast>> = null;
    const hasKey = !!process.env["KMA_SERVICE_KEY"];

    if (hasKey) {
      try {
        kmaResult = await getKMAForecast(nx, ny);
      } catch {
        kmaResult = null;
      }
    }

    if (kmaResult) {
      // KMA 성공 → 실시간 데이터 반환 + DB 업데이트(비동기)
      updateDbWeather(kmaResult.today, kmaResult.tomorrow).catch(() => {
        // DB 업데이트 실패는 무시
      });

      res.json({
        today: { ...kmaResult.today, source: "KMA", sourceMessage: "기상청 예보 연동 완료" },
        tomorrow: { ...kmaResult.tomorrow, source: "KMA", sourceMessage: "기상청 예보 연동 완료" },
        source: "KMA",
        sourceMessage: "기상청 예보 연동 완료",
      });
      return;
    }

    // KMA 실패 → DB fallback
    const forecasts = await db
      .select()
      .from(weatherForecastTable)
      .orderBy(weatherForecastTable.forecastDate);

    if (forecasts.length < 2) {
      res.status(503).json({ error: "기상 예보 데이터가 아직 준비되지 않았습니다." });
      return;
    }

    const todayRec = forecasts.find((f) => f.isToday) ?? forecasts[0];
    const tomorrowRec = forecasts.find((f) => !f.isToday) ?? forecasts[1];

    const source = hasKey ? "ERROR" : "NO_KEY";
    const sourceMessage = hasKey ? "기상청 예보 연결 실패" : "기상청 API 키 미등록";

    const toDto = (f: typeof todayRec) => ({
      date: f.forecastDate,
      temperature: f.temperature,
      maxTemp: f.maxTemp,
      minTemp: f.minTemp,
      humidity: f.humidity,
      precipitationProb: f.precipitationProb,
      precipitation: f.precipitation ?? 0,
      windSpeed: f.windSpeed,
      windDirection: f.windDirection ?? "북서",
      skyCondition: f.skyCondition,
      precipitationType: f.precipitationType ?? "없음",
      isDry: f.isDry,
      isHeatwave: f.isHeatwave,
      isColdwave: f.isColdwave,
      isStrongWind: f.isStrongWind,
      riskFactors: f.riskFactors ?? [],
      weatherScore: calcWeatherScore(f),
      source,
      sourceMessage: `${sourceMessage} — 샘플 데이터 표시 중`,
    });

    res.json({
      today: toDto(todayRec),
      tomorrow: toDto(tomorrowRec),
      source,
      sourceMessage,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get weather forecast");
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

// ── 헬퍼: 날씨 위험점수 (DB 레코드용) ─────────────────────────────────────────
function calcWeatherScore(f: {
  humidity: number;
  temperature: number;
  windSpeed: number;
  precipitationProb: number;
}): number {
  let score = 0;
  if (f.humidity < 30) score += 6;
  else if (f.humidity < 40) score += 4;
  else if (f.humidity < 50) score += 2;
  if (f.temperature >= 35) score += 4;
  else if (f.temperature >= 33) score += 2;
  if (f.temperature <= -10) score += 4;
  else if (f.temperature <= -5) score += 2;
  if (f.windSpeed >= 9) score += 5;
  else if (f.windSpeed >= 6) score += 3;
  if (f.precipitationProb >= 70) score -= 4;
  else if (f.precipitationProb >= 50) score -= 2;
  return Math.max(0, Math.min(20, score));
}

// ── 헬퍼: KMA 데이터로 DB 업데이트 ────────────────────────────────────────────
async function updateDbWeather(
  today: KMADayForecast,
  tomorrow: KMADayForecast,
): Promise<void> {
  const todayDate = today.date;
  const tomorrowDate = tomorrow.date;

  await db
    .update(weatherForecastTable)
    .set({
      forecastDate: todayDate,
      temperature: today.temperature,
      maxTemp: today.maxTemp,
      minTemp: today.minTemp,
      humidity: today.humidity,
      precipitationProb: today.precipitationProb,
      precipitation: today.precipitation,
      windSpeed: today.windSpeed,
      windDirection: today.windDirection,
      skyCondition: today.skyCondition,
      precipitationType: today.precipitationType,
      isDry: today.isDry,
      isHeatwave: today.isHeatwave,
      isColdwave: today.isColdwave,
      isStrongWind: today.isStrongWind,
      riskFactors: today.riskFactors,
      updatedAt: new Date(),
    })
    .where(eq(weatherForecastTable.isToday, true));

  await db
    .update(weatherForecastTable)
    .set({
      forecastDate: tomorrowDate,
      temperature: tomorrow.temperature,
      maxTemp: tomorrow.maxTemp,
      minTemp: tomorrow.minTemp,
      humidity: tomorrow.humidity,
      precipitationProb: tomorrow.precipitationProb,
      precipitation: tomorrow.precipitation,
      windSpeed: tomorrow.windSpeed,
      windDirection: tomorrow.windDirection,
      skyCondition: tomorrow.skyCondition,
      precipitationType: tomorrow.precipitationType,
      isDry: tomorrow.isDry,
      isHeatwave: tomorrow.isHeatwave,
      isColdwave: tomorrow.isColdwave,
      isStrongWind: tomorrow.isStrongWind,
      riskFactors: tomorrow.riskFactors,
      updatedAt: new Date(),
    })
    .where(eq(weatherForecastTable.isToday, false));
}

export default router;

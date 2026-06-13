import { Router } from "express";
import { db } from "@workspace/db";
import { weatherForecastTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/weather/forecast", async (req, res) => {
  try {
    const forecasts = await db.select().from(weatherForecastTable).orderBy(weatherForecastTable.forecastDate);

    if (forecasts.length < 2) {
      res.status(503).json({ error: "기상 예보 데이터가 아직 준비되지 않았습니다." });
      return;
    }

    const today = forecasts.find((f) => f.isToday) ?? forecasts[0];
    const tomorrow = forecasts.find((f) => !f.isToday) ?? forecasts[1];

    const toDto = (f: typeof today) => ({
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
    });

    res.json({ today: toDto(today), tomorrow: toDto(tomorrow) });
  } catch (err) {
    req.log.error({ err }, "Failed to get weather forecast");
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

export default router;

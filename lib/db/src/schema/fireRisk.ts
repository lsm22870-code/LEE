import { pgTable, serial, text, integer, real, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const riskLevelEnum = pgEnum("risk_level", ["관심", "주의", "경계", "위험"]);
export const userTypeEnum = pgEnum("user_type", ["citizen", "firefighter", "all"]);

export const districtRiskTable = pgTable("district_risk", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  score: integer("score").notNull(),
  riskLevel: riskLevelEnum("risk_level").notNull(),
  mainFireType: text("main_fire_type").notNull(),
  dangerTime: text("danger_time").notNull(),
  weatherFactor: text("weather_factor"),
  preventionMessage: text("prevention_message"),
  citizenAdvice: text("citizen_advice").array(),
  firefighterAdvice: text("firefighter_advice").array(),
  regionFactors: text("region_factors").array(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  scoreHistoricalFrequency: integer("score_historical_frequency").notNull().default(0),
  scoreRegionalHistory: integer("score_regional_history").notNull().default(0),
  scoreCausePersistence: integer("score_cause_persistence").notNull().default(0),
  scoreWeatherRisk: integer("score_weather_risk").notNull().default(0),
  scoreRegionRisk: integer("score_region_risk").notNull().default(0),
  hasTraditionalMarket: boolean("has_traditional_market").default(false),
  hasForestArea: boolean("has_forest_area").default(false),
  hasOldBuildings: boolean("has_old_buildings").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDistrictRiskSchema = createInsertSchema(districtRiskTable).omit({ id: true, updatedAt: true });
export type InsertDistrictRisk = z.infer<typeof insertDistrictRiskSchema>;
export type DistrictRisk = typeof districtRiskTable.$inferSelect;

export const weatherForecastTable = pgTable("weather_forecast", {
  id: serial("id").primaryKey(),
  forecastDate: text("forecast_date").notNull(),
  isToday: boolean("is_today").notNull().default(true),
  temperature: real("temperature").notNull(),
  maxTemp: real("max_temp").notNull(),
  minTemp: real("min_temp").notNull(),
  humidity: integer("humidity").notNull(),
  precipitationProb: integer("precipitation_prob").notNull(),
  precipitation: real("precipitation").default(0),
  windSpeed: real("wind_speed").notNull(),
  windDirection: text("wind_direction"),
  skyCondition: text("sky_condition").notNull(),
  precipitationType: text("precipitation_type"),
  isDry: boolean("is_dry").notNull().default(false),
  isHeatwave: boolean("is_heatwave").notNull().default(false),
  isColdwave: boolean("is_coldwave").notNull().default(false),
  isStrongWind: boolean("is_strong_wind").notNull().default(false),
  riskFactors: text("risk_factors").array(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWeatherForecastSchema = createInsertSchema(weatherForecastTable).omit({ id: true, updatedAt: true });
export type InsertWeatherForecast = z.infer<typeof insertWeatherForecastSchema>;
export type WeatherForecast = typeof weatherForecastTable.$inferSelect;

export const alertMessageTable = pgTable("alert_message", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: riskLevelEnum("severity").notNull(),
  category: text("category").notNull(),
  targetAudience: userTypeEnum("target_audience").notNull(),
  timeRange: text("time_range"),
  district: text("district"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAlertMessageSchema = createInsertSchema(alertMessageTable).omit({ id: true, createdAt: true });
export type InsertAlertMessage = z.infer<typeof insertAlertMessageSchema>;
export type AlertMessage = typeof alertMessageTable.$inferSelect;

export const monthlyStatTable = pgTable("monthly_stat", {
  id: serial("id").primaryKey(),
  month: integer("month").notNull(),
  monthName: text("month_name").notNull(),
  count: integer("count").notNull(),
  avgScore: real("avg_score").notNull(),
  season: text("season").notNull(),
});

export const hourlyStatTable = pgTable("hourly_stat", {
  id: serial("id").primaryKey(),
  hour: integer("hour").notNull(),
  label: text("label").notNull(),
  count: integer("count").notNull(),
  percentage: real("percentage").notNull(),
});

export const fireCauseStatTable = pgTable("fire_cause_stat", {
  id: serial("id").primaryKey(),
  cause: text("cause").notNull(),
  count: integer("count").notNull(),
  percentage: real("percentage").notNull(),
});

export const seasonalStatTable = pgTable("seasonal_stat", {
  id: serial("id").primaryKey(),
  season: text("season").notNull(),
  count: integer("count").notNull(),
  mainCause: text("main_cause").notNull(),
  riskLevel: riskLevelEnum("risk_level").notNull(),
});

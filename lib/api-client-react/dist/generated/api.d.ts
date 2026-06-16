import type { QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AlertMessage, DistrictRisk, DistrictRiskDetail, FireCauseStat, FirefighterDashboard, GetTodayAlertsParams, GetWeatherCurrentParams, GetWeatherForecastParams, HealthStatus, HourlyStatistic, MapDistrict, MonthlyStatistic, SeasonalStatistic, TodayRiskSummary, WeatherCurrentResponse, WeatherForecast } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetTodayRiskUrl: () => string;
/**
 * @summary Get today's overall Seoul fire risk
 */
export declare const getTodayRisk: (options?: RequestInit) => Promise<TodayRiskSummary>;
export declare const getGetTodayRiskQueryKey: () => readonly ["/api/risk/today"];
export declare const getGetTodayRiskQueryOptions: <TData = Awaited<ReturnType<typeof getTodayRisk>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTodayRisk>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTodayRisk>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTodayRiskQueryResult = NonNullable<Awaited<ReturnType<typeof getTodayRisk>>>;
export type GetTodayRiskQueryError = ErrorType<unknown>;
/**
 * @summary Get today's overall Seoul fire risk
 */
export declare function useGetTodayRisk<TData = Awaited<ReturnType<typeof getTodayRisk>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTodayRisk>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetRiskDistrictsUrl: () => string;
/**
 * @summary Get fire risk for all 25 Seoul districts
 */
export declare const getRiskDistricts: (options?: RequestInit) => Promise<DistrictRisk[]>;
export declare const getGetRiskDistrictsQueryKey: () => readonly ["/api/risk/districts"];
export declare const getGetRiskDistrictsQueryOptions: <TData = Awaited<ReturnType<typeof getRiskDistricts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRiskDistricts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRiskDistricts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRiskDistrictsQueryResult = NonNullable<Awaited<ReturnType<typeof getRiskDistricts>>>;
export type GetRiskDistrictsQueryError = ErrorType<unknown>;
/**
 * @summary Get fire risk for all 25 Seoul districts
 */
export declare function useGetRiskDistricts<TData = Awaited<ReturnType<typeof getRiskDistricts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRiskDistricts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetRiskByDistrictUrl: (districtName: string) => string;
/**
 * @summary Get fire risk for a specific district
 */
export declare const getRiskByDistrict: (districtName: string, options?: RequestInit) => Promise<DistrictRiskDetail>;
export declare const getGetRiskByDistrictQueryKey: (districtName: string) => readonly [`/api/risk/districts/${string}`];
export declare const getGetRiskByDistrictQueryOptions: <TData = Awaited<ReturnType<typeof getRiskByDistrict>>, TError = ErrorType<void>>(districtName: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRiskByDistrict>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRiskByDistrict>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRiskByDistrictQueryResult = NonNullable<Awaited<ReturnType<typeof getRiskByDistrict>>>;
export type GetRiskByDistrictQueryError = ErrorType<void>;
/**
 * @summary Get fire risk for a specific district
 */
export declare function useGetRiskByDistrict<TData = Awaited<ReturnType<typeof getRiskByDistrict>>, TError = ErrorType<void>>(districtName: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRiskByDistrict>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetTopDangerDistrictsUrl: () => string;
/**
 * @summary Get top dangerous districts today
 */
export declare const getTopDangerDistricts: (options?: RequestInit) => Promise<DistrictRisk[]>;
export declare const getGetTopDangerDistrictsQueryKey: () => readonly ["/api/risk/top-danger"];
export declare const getGetTopDangerDistrictsQueryOptions: <TData = Awaited<ReturnType<typeof getTopDangerDistricts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTopDangerDistricts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTopDangerDistricts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTopDangerDistrictsQueryResult = NonNullable<Awaited<ReturnType<typeof getTopDangerDistricts>>>;
export type GetTopDangerDistrictsQueryError = ErrorType<unknown>;
/**
 * @summary Get top dangerous districts today
 */
export declare function useGetTopDangerDistricts<TData = Awaited<ReturnType<typeof getTopDangerDistricts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTopDangerDistricts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetWeatherCurrentUrl: (params?: GetWeatherCurrentParams) => string;
/**
 * @summary Get current real-time weather (초단기실황)
 */
export declare const getWeatherCurrent: (params?: GetWeatherCurrentParams, options?: RequestInit) => Promise<WeatherCurrentResponse>;
export declare const getGetWeatherCurrentQueryKey: (params?: GetWeatherCurrentParams) => readonly ["/api/weather/current", ...GetWeatherCurrentParams[]];
export declare const getGetWeatherCurrentQueryOptions: <TData = Awaited<ReturnType<typeof getWeatherCurrent>>, TError = ErrorType<unknown>>(params?: GetWeatherCurrentParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWeatherCurrent>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getWeatherCurrent>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetWeatherCurrentQueryResult = NonNullable<Awaited<ReturnType<typeof getWeatherCurrent>>>;
export type GetWeatherCurrentQueryError = ErrorType<unknown>;
/**
 * @summary Get current real-time weather (초단기실황)
 */
export declare function useGetWeatherCurrent<TData = Awaited<ReturnType<typeof getWeatherCurrent>>, TError = ErrorType<unknown>>(params?: GetWeatherCurrentParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWeatherCurrent>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetWeatherForecastUrl: (params?: GetWeatherForecastParams) => string;
/**
 * @summary Get today and tomorrow weather forecast (단기예보)
 */
export declare const getWeatherForecast: (params?: GetWeatherForecastParams, options?: RequestInit) => Promise<WeatherForecast>;
export declare const getGetWeatherForecastQueryKey: (params?: GetWeatherForecastParams) => readonly ["/api/weather/forecast", ...GetWeatherForecastParams[]];
export declare const getGetWeatherForecastQueryOptions: <TData = Awaited<ReturnType<typeof getWeatherForecast>>, TError = ErrorType<unknown>>(params?: GetWeatherForecastParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWeatherForecast>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getWeatherForecast>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetWeatherForecastQueryResult = NonNullable<Awaited<ReturnType<typeof getWeatherForecast>>>;
export type GetWeatherForecastQueryError = ErrorType<unknown>;
/**
 * @summary Get today and tomorrow weather forecast (단기예보)
 */
export declare function useGetWeatherForecast<TData = Awaited<ReturnType<typeof getWeatherForecast>>, TError = ErrorType<unknown>>(params?: GetWeatherForecastParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWeatherForecast>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetTodayAlertsUrl: (params?: GetTodayAlertsParams) => string;
/**
 * @summary Get today's fire prevention alerts
 */
export declare const getTodayAlerts: (params?: GetTodayAlertsParams, options?: RequestInit) => Promise<AlertMessage[]>;
export declare const getGetTodayAlertsQueryKey: (params?: GetTodayAlertsParams) => readonly ["/api/alerts/today", ...GetTodayAlertsParams[]];
export declare const getGetTodayAlertsQueryOptions: <TData = Awaited<ReturnType<typeof getTodayAlerts>>, TError = ErrorType<unknown>>(params?: GetTodayAlertsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTodayAlerts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTodayAlerts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTodayAlertsQueryResult = NonNullable<Awaited<ReturnType<typeof getTodayAlerts>>>;
export type GetTodayAlertsQueryError = ErrorType<unknown>;
/**
 * @summary Get today's fire prevention alerts
 */
export declare function useGetTodayAlerts<TData = Awaited<ReturnType<typeof getTodayAlerts>>, TError = ErrorType<unknown>>(params?: GetTodayAlertsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTodayAlerts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetMonthlyStatisticsUrl: () => string;
/**
 * @summary Get monthly fire statistics
 */
export declare const getMonthlyStatistics: (options?: RequestInit) => Promise<MonthlyStatistic[]>;
export declare const getGetMonthlyStatisticsQueryKey: () => readonly ["/api/statistics/monthly"];
export declare const getGetMonthlyStatisticsQueryOptions: <TData = Awaited<ReturnType<typeof getMonthlyStatistics>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMonthlyStatistics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMonthlyStatistics>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMonthlyStatisticsQueryResult = NonNullable<Awaited<ReturnType<typeof getMonthlyStatistics>>>;
export type GetMonthlyStatisticsQueryError = ErrorType<unknown>;
/**
 * @summary Get monthly fire statistics
 */
export declare function useGetMonthlyStatistics<TData = Awaited<ReturnType<typeof getMonthlyStatistics>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMonthlyStatistics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetHourlyStatisticsUrl: () => string;
/**
 * @summary Get hourly fire occurrence statistics
 */
export declare const getHourlyStatistics: (options?: RequestInit) => Promise<HourlyStatistic[]>;
export declare const getGetHourlyStatisticsQueryKey: () => readonly ["/api/statistics/hourly"];
export declare const getGetHourlyStatisticsQueryOptions: <TData = Awaited<ReturnType<typeof getHourlyStatistics>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getHourlyStatistics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getHourlyStatistics>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetHourlyStatisticsQueryResult = NonNullable<Awaited<ReturnType<typeof getHourlyStatistics>>>;
export type GetHourlyStatisticsQueryError = ErrorType<unknown>;
/**
 * @summary Get hourly fire occurrence statistics
 */
export declare function useGetHourlyStatistics<TData = Awaited<ReturnType<typeof getHourlyStatistics>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getHourlyStatistics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetFireCauseStatisticsUrl: () => string;
/**
 * @summary Get fire cause breakdown statistics
 */
export declare const getFireCauseStatistics: (options?: RequestInit) => Promise<FireCauseStat[]>;
export declare const getGetFireCauseStatisticsQueryKey: () => readonly ["/api/statistics/causes"];
export declare const getGetFireCauseStatisticsQueryOptions: <TData = Awaited<ReturnType<typeof getFireCauseStatistics>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFireCauseStatistics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getFireCauseStatistics>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetFireCauseStatisticsQueryResult = NonNullable<Awaited<ReturnType<typeof getFireCauseStatistics>>>;
export type GetFireCauseStatisticsQueryError = ErrorType<unknown>;
/**
 * @summary Get fire cause breakdown statistics
 */
export declare function useGetFireCauseStatistics<TData = Awaited<ReturnType<typeof getFireCauseStatistics>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFireCauseStatistics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetSeasonalStatisticsUrl: () => string;
/**
 * @summary Get seasonal fire statistics
 */
export declare const getSeasonalStatistics: (options?: RequestInit) => Promise<SeasonalStatistic[]>;
export declare const getGetSeasonalStatisticsQueryKey: () => readonly ["/api/statistics/seasonal"];
export declare const getGetSeasonalStatisticsQueryOptions: <TData = Awaited<ReturnType<typeof getSeasonalStatistics>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSeasonalStatistics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSeasonalStatistics>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSeasonalStatisticsQueryResult = NonNullable<Awaited<ReturnType<typeof getSeasonalStatistics>>>;
export type GetSeasonalStatisticsQueryError = ErrorType<unknown>;
/**
 * @summary Get seasonal fire statistics
 */
export declare function useGetSeasonalStatistics<TData = Awaited<ReturnType<typeof getSeasonalStatistics>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSeasonalStatistics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetMapDistrictsUrl: () => string;
/**
 * @summary Get district map data with center coordinates and risk
 */
export declare const getMapDistricts: (options?: RequestInit) => Promise<MapDistrict[]>;
export declare const getGetMapDistrictsQueryKey: () => readonly ["/api/map/districts"];
export declare const getGetMapDistrictsQueryOptions: <TData = Awaited<ReturnType<typeof getMapDistricts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMapDistricts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMapDistricts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMapDistrictsQueryResult = NonNullable<Awaited<ReturnType<typeof getMapDistricts>>>;
export type GetMapDistrictsQueryError = ErrorType<unknown>;
/**
 * @summary Get district map data with center coordinates and risk
 */
export declare function useGetMapDistricts<TData = Awaited<ReturnType<typeof getMapDistricts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMapDistricts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetFirefighterDashboardUrl: () => string;
/**
 * @summary Get firefighter dashboard data
 */
export declare const getFirefighterDashboard: (options?: RequestInit) => Promise<FirefighterDashboard>;
export declare const getGetFirefighterDashboardQueryKey: () => readonly ["/api/dashboard/firefighter"];
export declare const getGetFirefighterDashboardQueryOptions: <TData = Awaited<ReturnType<typeof getFirefighterDashboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFirefighterDashboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getFirefighterDashboard>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetFirefighterDashboardQueryResult = NonNullable<Awaited<ReturnType<typeof getFirefighterDashboard>>>;
export type GetFirefighterDashboardQueryError = ErrorType<unknown>;
/**
 * @summary Get firefighter dashboard data
 */
export declare function useGetFirefighterDashboard<TData = Awaited<ReturnType<typeof getFirefighterDashboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFirefighterDashboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map
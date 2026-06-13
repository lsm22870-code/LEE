import { Layout } from "@/components/Layout";
import { useGetRiskByDistrict, getGetRiskByDistrictQueryKey, useGetWeatherForecast, useGetMonthlyStatistics, useGetHourlyStatistics } from "@workspace/api-client-react";
import { useParams } from "wouter";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell,
} from "recharts";
import { ArrowLeft, Thermometer, Wind, Droplets, CloudRain, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

type RiskLevel = "관심" | "주의" | "경계" | "위험";

function getRiskColor(level: RiskLevel) {
  switch (level) {
    case "위험": return "#ef4444";
    case "경계": return "#f97316";
    case "주의": return "#eab308";
    case "관심": return "#22c55e";
    default: return "#94a3b8";
  }
}

function getRiskBg(level: RiskLevel) {
  switch (level) {
    case "위험": return "bg-red-500";
    case "경계": return "bg-orange-500";
    case "주의": return "bg-yellow-400";
    case "관심": return "bg-green-500";
    default: return "bg-slate-400";
  }
}

const SCORE_BREAKDOWN_LABELS = [
  { key: "historicalFrequency", label: "과거 화재빈도", max: 30, color: "#ef4444" },
  { key: "regionalHistory", label: "지역 화재이력", max: 20, color: "#f97316" },
  { key: "causePersistence", label: "발화요인 반복성", max: 15, color: "#eab308" },
  { key: "weatherRisk", label: "기상 위험도", max: 20, color: "#3b82f6" },
  { key: "regionRisk", label: "지역 위험요인", max: 15, color: "#8b5cf6" },
];

export default function DistrictDetail() {
  const params = useParams<{ name: string }>();
  const name = decodeURIComponent(params.name ?? "");

  const { data: district, isLoading } = useGetRiskByDistrict(name, {
    query: { enabled: !!name, queryKey: getGetRiskByDistrictQueryKey(name) },
  });
  const { data: weather } = useGetWeatherForecast();
  const { data: monthly } = useGetMonthlyStatistics();
  const { data: hourly } = useGetHourlyStatistics();

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-4">
          <div className="h-10 w-40 bg-slate-200 animate-pulse rounded" />
          <div className="h-40 bg-slate-200 animate-pulse rounded-xl" />
          <div className="h-64 bg-slate-200 animate-pulse rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (!district) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-xl text-slate-500 mb-4">해당 자치구 정보를 찾을 수 없습니다.</p>
          <Link href="/map">
            <Button>지도로 돌아가기</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const level = district.riskLevel as RiskLevel;
  const breakdownData = SCORE_BREAKDOWN_LABELS.map((b) => ({
    label: b.label,
    value: district.scoreBreakdown?.[b.key as keyof typeof district.scoreBreakdown] ?? 0,
    max: b.max,
    color: b.color,
  }));

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back */}
        <Link href="/map">
          <Button variant="ghost" className="flex items-center gap-2 text-base pl-0">
            <ArrowLeft className="w-5 h-5" />
            지도로 돌아가기
          </Button>
        </Link>

        {/* Hero */}
        <div
          className="rounded-2xl p-6 text-white"
          style={{ backgroundColor: getRiskColor(level) }}
          data-testid="district-hero"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold">{district.name}</h2>
              <p className="text-xl mt-1 opacity-90">{district.mainFireType}</p>
            </div>
            <div className="text-right">
              <p className="text-6xl font-extrabold">{district.score}<span className="text-2xl">점</span></p>
              <div className={`inline-block mt-1 px-4 py-1.5 rounded-full bg-white font-extrabold text-xl`} style={{ color: getRiskColor(level) }}>
                {district.riskLevel}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-base opacity-90">
            <span>위험 시간대: {district.dangerTime}</span>
            {district.weatherFactor && <span>{district.weatherFactor}</span>}
          </div>
        </div>

        {/* Score Breakdown */}
        {district.scoreBreakdown && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xl font-extrabold text-slate-900 mb-4">위험도 점수 구성</h3>
            <div className="space-y-3">
              {breakdownData.map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-base font-semibold text-slate-700">{b.label}</span>
                    <span className="text-base font-extrabold text-slate-900">{b.value} / {b.max}점</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-4">
                    <div
                      className="h-4 rounded-full transition-all"
                      style={{
                        width: `${(b.value / b.max) * 100}%`,
                        backgroundColor: b.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monthly trend */}
        {monthly && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xl font-extrabold text-slate-900 mb-4">서울시 월별 화재 발생 추이</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthly} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="monthName" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`${v}건`, "화재 발생"]} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {monthly.map((_, i) => (
                    <Cell key={i} fill={i === (new Date().getMonth()) ? getRiskColor(level) : "#cbd5e1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Hourly */}
        {hourly && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xl font-extrabold text-slate-900 mb-4">시간대별 화재 발생 분포</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={hourly} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getRiskColor(level)} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={getRiskColor(level)} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={3} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`${v}건`, "화재 발생"]} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={getRiskColor(level)}
                  strokeWidth={2.5}
                  fill="url(#distGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Weather */}
        {weather && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xl font-extrabold text-slate-900 mb-4">기상청 예보</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[{ label: "오늘", fw: weather.today }, { label: "내일", fw: weather.tomorrow }].map(({ label, fw }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-base font-extrabold text-slate-700 mb-3">{label} ({fw.date})</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-5 h-5 text-red-400" />
                      <div>
                        <p className="text-xs text-slate-500">기온</p>
                        <p className="text-base font-bold">{fw.temperature}°C</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-xs text-slate-500">습도</p>
                        <p className="text-base font-bold">{fw.humidity}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">풍속</p>
                        <p className="text-base font-bold">{fw.windSpeed}m/s</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CloudRain className="w-5 h-5 text-sky-400" />
                      <div>
                        <p className="text-xs text-slate-500">강수확률</p>
                        <p className="text-base font-bold">{fw.precipitationProb}%</p>
                      </div>
                    </div>
                  </div>
                  {fw.riskFactors && fw.riskFactors.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {fw.riskFactors.map((f, i) => (
                        <p key={i} className="text-sm text-orange-700 bg-orange-50 rounded-lg px-3 py-1.5">{f}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Citizen + Firefighter Advice */}
        <div className="grid md:grid-cols-2 gap-6">
          {district.citizenAdvice && district.citizenAdvice.length > 0 && (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
              <h3 className="text-lg font-extrabold text-green-800 mb-3">시민 예방수칙</h3>
              <ul className="space-y-2">
                {district.citizenAdvice.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-base text-green-900">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {district.firefighterAdvice && district.firefighterAdvice.length > 0 && (
            <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5">
              <h3 className="text-lg font-extrabold text-blue-800 mb-3">소방관서 권고 조치</h3>
              <ul className="space-y-2">
                {district.firefighterAdvice.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-base text-blue-900">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Region Factors */}
        {district.regionFactors && district.regionFactors.length > 0 && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
            <h3 className="text-lg font-extrabold text-amber-800 mb-3">지역 특성 위험요인</h3>
            <div className="flex flex-wrap gap-2">
              {district.regionFactors.map((f, i) => (
                <span key={i} className="px-3 py-1.5 bg-amber-100 border border-amber-300 rounded-full text-sm font-semibold text-amber-800">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

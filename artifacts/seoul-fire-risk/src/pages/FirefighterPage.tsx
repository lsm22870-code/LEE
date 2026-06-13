import { Layout } from "@/components/Layout";
import { useGetFirefighterDashboard } from "@workspace/api-client-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { ShieldAlert, MapPin, Clock, AlertTriangle } from "lucide-react";
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

function getRiskBadge(level: RiskLevel) {
  switch (level) {
    case "위험": return "bg-red-500 text-white";
    case "경계": return "bg-orange-500 text-white";
    case "주의": return "bg-yellow-400 text-black";
    case "관심": return "bg-green-500 text-white";
    default: return "bg-slate-400 text-white";
  }
}

const PRIORITY_COLORS = ["#ef4444", "#f97316", "#eab308", "#3b82f6", "#8b5cf6"];

export default function FirefighterPage() {
  const { data, isLoading } = useGetFirefighterDashboard();

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-4">
          <div className="h-10 w-48 bg-slate-200 animate-pulse rounded" />
          <div className="h-64 bg-slate-200 animate-pulse rounded-xl" />
          <div className="h-64 bg-slate-200 animate-pulse rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (!data) return <Layout><div className="text-xl text-slate-500 p-8">데이터를 불러올 수 없습니다.</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">소방관서 대시보드</h2>
            <p className="text-slate-500 text-base mt-1">{data.date} 기준</p>
          </div>
          <div
            data-testid="stat-high-risk-count"
            className="bg-red-50 border-2 border-red-500 rounded-2xl px-6 py-3 text-center"
          >
            <p className="text-sm font-semibold text-red-600">오늘 고위험 지역</p>
            <p className="text-4xl font-extrabold text-red-600">{data.totalHighRiskAreas}개</p>
          </div>
        </div>

        {/* Priority Districts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              예방순찰 우선지역 TOP {data.priorityDistricts.length}
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {data.priorityDistricts.map((district, idx) => (
              <div
                key={district.name}
                data-testid={`priority-district-${idx}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-extrabold text-base flex-shrink-0"
                  style={{ backgroundColor: PRIORITY_COLORS[idx] ?? "#94a3b8" }}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-lg font-extrabold text-slate-900">{district.name}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-sm font-bold ${getRiskBadge(district.riskLevel as RiskLevel)}`}>
                      {district.riskLevel}
                    </span>
                    <span className="text-base font-bold text-slate-700">{district.score}점</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {district.mainFireType}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {district.dangerTime}
                    </span>
                  </div>
                  {district.weatherFactor && (
                    <p className="text-sm text-blue-600 mt-0.5">{district.weatherFactor}</p>
                  )}
                </div>
                <Link href={`/district/${district.name}`} className="flex-shrink-0">
                  <Button variant="outline" size="sm" className="text-sm">
                    상세보기
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Type Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-xl font-extrabold text-slate-900 mb-4">화재위험 유형별 분포 (상위 8개)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={[...data.riskTypeBreakdown].sort((a, b) => b.count - a.count).slice(0, 8)}
              layout="vertical"
              margin={{ left: 10, right: 30, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 13 }} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="type"
                width={170}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(v) => [`${v}개 자치구`, "해당 지역 수"]} />
              <Bar dataKey="count" radius={[0, 5, 5, 0]} barSize={22}>
                {[...data.riskTypeBreakdown].sort((a, b) => b.count - a.count).slice(0, 8).map((_, i) => (
                  <Cell key={i} fill={PRIORITY_COLORS[i % PRIORITY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Patrol Recommendations */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-xl font-extrabold text-slate-900">예방순찰 추천 계획</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {data.patrolRecommendations.map((rec, idx) => (
              <div key={idx} data-testid={`patrol-rec-${idx}`} className="px-6 py-4">
                <div className="flex items-start gap-4">
                  <div className="bg-slate-100 rounded-xl px-3 py-2 text-center flex-shrink-0">
                    <p className="text-xs text-slate-500 font-medium">우선순위</p>
                    <p className="text-2xl font-extrabold text-slate-800">{rec.priority}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex items-center gap-1 text-base font-extrabold text-slate-900">
                        <MapPin className="w-4 h-4 text-red-500" />
                        {rec.district}
                      </span>
                      {rec.timeRange && (
                        <span className="flex items-center gap-1 text-sm text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          {rec.timeRange}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-1">
                      <span className="font-semibold">위험 사유:</span> {rec.reason}
                    </p>
                    <p className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg inline-block">
                      권고 조치: {rec.action}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

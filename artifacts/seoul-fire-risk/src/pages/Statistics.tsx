import { Layout } from "@/components/Layout";
import {
  useGetMonthlyStatistics,
  useGetHourlyStatistics,
  useGetFireCauseStatistics,
  useGetSeasonalStatistics,
} from "@workspace/api-client-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from "recharts";

const SEASON_COLORS: Record<string, string> = {
  "봄": "#22c55e",
  "여름": "#3b82f6",
  "가을": "#f97316",
  "겨울": "#ef4444",
};

const CAUSE_COLORS = ["#ef4444", "#f97316", "#eab308", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#94a3b8"];

const RISK_COLORS: Record<string, string> = {
  "경계": "#f97316",
  "주의": "#eab308",
  "관심": "#22c55e",
  "위험": "#ef4444",
};

export default function Statistics() {
  const { data: monthly, isLoading: loadingMonthly } = useGetMonthlyStatistics();
  const { data: hourly, isLoading: loadingHourly } = useGetHourlyStatistics();
  const { data: causes, isLoading: loadingCauses } = useGetFireCauseStatistics();
  const { data: seasonal, isLoading: loadingSeasonal } = useGetSeasonalStatistics();

  const monthlyWithColor = monthly?.map((m) => ({
    ...m,
    fill: (m.season ? SEASON_COLORS[m.season] : undefined) ?? "#94a3b8",
  }));

  return (
    <Layout>
      <div className="space-y-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">화재 통계 분석</h2>

        {/* Monthly */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-xl font-extrabold text-slate-900 mb-1">월별 화재 발생 추이</h3>
          <p className="text-sm text-slate-500 mb-4">최근 5년 평균 월별 화재 발생 건수</p>
          {loadingMonthly ? (
            <div className="h-64 bg-slate-100 animate-pulse rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyWithColor} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="monthName" tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 13 }} />
                <Tooltip
                  formatter={(v: number) => [`${v}건`, "화재 발생"]}
                  labelFormatter={(l) => `${l}`}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {monthlyWithColor?.map((m, i) => (
                    <Cell key={i} fill={m.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-4 mt-3 justify-center flex-wrap">
            {Object.entries(SEASON_COLORS).map(([s, c]) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
                <span className="text-sm font-medium text-slate-600">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-xl font-extrabold text-slate-900 mb-1">시간대별 화재 발생 분포</h3>
          <p className="text-sm text-slate-500 mb-4">24시간 화재 발생 비율 (%)·건수</p>
          {loadingHourly ? (
            <div className="h-64 bg-slate-100 animate-pulse rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={hourly} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={2} />
                <YAxis tick={{ fontSize: 13 }} />
                <Tooltip
                  formatter={(v: number, name: string) =>
                    name === "percentage" ? [`${v}%`, "비율"] : [`${v}건`, "건수"]
                  }
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#hourGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Causes + Seasonal */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Causes */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xl font-extrabold text-slate-900 mb-1">발화요인별 비율</h3>
            <p className="text-sm text-slate-500 mb-4">주요 화재 발화 원인</p>
            {loadingCauses ? (
              <div className="h-64 bg-slate-100 animate-pulse rounded-xl" />
            ) : (
              <div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={causes}
                      dataKey="percentage"
                      nameKey="cause"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      innerRadius={45}
                    >
                      {causes?.map((_, i) => (
                        <Cell key={i} fill={CAUSE_COLORS[i % CAUSE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v}%`, "비율"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {causes?.map((c, i) => (
                    <div key={c.cause} className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CAUSE_COLORS[i % CAUSE_COLORS.length] }}
                      />
                      <span className="text-xs text-slate-600 truncate">{c.cause}</span>
                      <span className="text-xs font-bold text-slate-800 ml-auto">{c.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Seasonal */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xl font-extrabold text-slate-900 mb-1">계절별 화재 분석</h3>
            <p className="text-sm text-slate-500 mb-4">계절별 발생 건수 및 주요 원인</p>
            {loadingSeasonal ? (
              <div className="h-64 bg-slate-100 animate-pulse rounded-xl" />
            ) : (
              <div className="space-y-4">
                {seasonal?.map((s) => {
                  const seasonName = s.season.split("(")[0];
                  const color = SEASON_COLORS[seasonName] ?? "#94a3b8";
                  const riskColor = RISK_COLORS[s.riskLevel] ?? "#94a3b8";
                  const maxCount = Math.max(...(seasonal?.map((x) => x.count) ?? [1]));
                  return (
                    <div key={s.season} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-extrabold text-slate-800">{s.season}</span>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: riskColor }}
                          >
                            {s.riskLevel}
                          </span>
                        </div>
                        <span className="text-base font-bold text-slate-700">{s.count.toLocaleString()}건</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all"
                          style={{ width: `${(s.count / maxCount) * 100}%`, backgroundColor: color }}
                        />
                      </div>
                      <p className="text-xs text-slate-500">{s.mainCause}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

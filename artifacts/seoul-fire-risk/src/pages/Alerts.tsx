import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useGetTodayAlerts } from "@workspace/api-client-react";
import { Bell, ShieldAlert, MapPin, Clock } from "lucide-react";

type RiskLevel = "관심" | "주의" | "경계" | "위험";

function getSeverityColor(level: RiskLevel) {
  switch (level) {
    case "위험": return "border-red-500 bg-red-50";
    case "경계": return "border-orange-500 bg-orange-50";
    case "주의": return "border-yellow-400 bg-yellow-50";
    case "관심": return "border-green-500 bg-green-50";
    default: return "border-slate-300 bg-slate-50";
  }
}

function getSeverityBadge(level: RiskLevel) {
  switch (level) {
    case "위험": return "bg-red-500 text-white";
    case "경계": return "bg-orange-500 text-white";
    case "주의": return "bg-yellow-400 text-black";
    case "관심": return "bg-green-500 text-white";
    default: return "bg-slate-400 text-white";
  }
}

export default function Alerts() {
  const [tab, setTab] = useState<"citizen" | "firefighter">("citizen");
  const { data: alerts, isLoading } = useGetTodayAlerts(
    { userType: tab },
    { query: { queryKey: ["alerts", tab] } }
  );

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">오늘의 화재 알림</h2>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            data-testid="tab-citizen"
            onClick={() => setTab("citizen")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-bold transition-colors ${
              tab === "citizen"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Bell className="w-5 h-5" />
            시민용
          </button>
          <button
            data-testid="tab-firefighter"
            onClick={() => setTab("firefighter")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-bold transition-colors ${
              tab === "firefighter"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
            소방관서용
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : alerts && alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                data-testid={`alert-card-${alert.id}`}
                className={`rounded-2xl border-2 p-5 ${getSeverityColor(alert.severity as RiskLevel)}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${getSeverityBadge(alert.severity as RiskLevel)}`}
                    >
                      {alert.severity}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white border border-slate-200 text-slate-600">
                      {alert.category}
                    </span>
                  </div>
                  {alert.district && (
                    <span className="flex items-center gap-1 text-sm text-slate-600 font-medium">
                      <MapPin className="w-4 h-4" />
                      {alert.district}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">{alert.title}</h3>
                <p className="text-base text-slate-700 leading-relaxed">{alert.message}</p>
                {alert.timeRange && (
                  <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                    <Clock className="w-4 h-4" />
                    위험 시간대: {alert.timeRange}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-xl text-slate-500">현재 발송된 알림이 없습니다.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

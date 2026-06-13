import { Layout } from "@/components/Layout";
import {
  useGetTodayRisk,
  useGetTopDangerDistricts,
  useGetWeatherForecast,
  useGetRiskByDistrict,
  getGetRiskByDistrictQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  AlertTriangle,
  Info,
  Map,
  Thermometer,
  Wind,
  Droplets,
  CloudRain,
  Star,
  StarOff,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { useMyDistrict } from "@/hooks/useMyDistrict";

type RiskLevel = "관심" | "주의" | "경계" | "위험";

function getRiskGradient(level: RiskLevel | string) {
  switch (level) {
    case "위험": return "from-red-500 to-red-600";
    case "경계": return "from-orange-400 to-orange-500";
    case "주의": return "from-yellow-400 to-yellow-500";
    default:     return "from-green-500 to-green-600";
  }
}

function getRiskBadgeClass(level: RiskLevel | string) {
  switch (level) {
    case "위험": return "bg-red-500 text-white";
    case "경계": return "bg-orange-500 text-white";
    case "주의": return "bg-yellow-400 text-black";
    default:     return "bg-green-500 text-white";
  }
}

function getRiskTextColor(level: RiskLevel | string) {
  switch (level) {
    case "위험": return "text-red-600";
    case "경계": return "text-orange-500";
    case "주의": return "text-yellow-600";
    default:     return "text-green-600";
  }
}

function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`bg-slate-200 animate-pulse rounded-2xl ${className}`} />;
}

const ALL_DISTRICTS = [
  "종로구","중구","용산구","성동구","광진구","동대문구","중랑구","성북구",
  "강북구","도봉구","노원구","은평구","서대문구","마포구","양천구","강서구",
  "구로구","금천구","영등포구","동작구","관악구","서초구","강남구","송파구","강동구",
];

export default function Home() {
  const [, navigate] = useLocation();
  const { myDistrict, setMyDistrict } = useMyDistrict();

  const { data: todayRisk, isLoading: loadingRisk } = useGetTodayRisk();
  const { data: topDistricts, isLoading: loadingTop } = useGetTopDangerDistricts();
  const { data: weather, isLoading: loadingWeather } = useGetWeatherForecast();
  const { data: myDistrictData } = useGetRiskByDistrict(myDistrict ?? "", {
    query: {
      enabled: !!myDistrict,
      queryKey: getGetRiskByDistrictQueryKey(myDistrict ?? ""),
    },
  });

  const isLoading = loadingRisk || loadingTop;

  return (
    <Layout>
      <div className="space-y-5">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">오늘의 화재위험 예보</h2>

        {/* ── 메인 위험도 배너 ── */}
        {isLoading ? (
          <SkeletonCard className="h-44" />
        ) : todayRisk ? (
          <div
            className={`bg-gradient-to-br ${getRiskGradient(todayRisk.riskLevel)} rounded-2xl p-6 text-white shadow-lg`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold opacity-90">서울시 전체 위험도</p>
                <div className="flex items-end gap-3 mt-1">
                  <span className="text-6xl md:text-7xl font-extrabold leading-none">
                    {todayRisk.riskLevel}
                  </span>
                  <span className="text-3xl font-bold opacity-80 mb-1">
                    {todayRisk.overallScore}점
                  </span>
                </div>
                <p className="text-base font-medium opacity-90 mt-2">
                  주요 위험: {todayRisk.mainFireType}
                </p>
              </div>
              <div className="bg-white/20 rounded-xl p-4 text-right backdrop-blur-sm">
                <p className="text-sm font-semibold opacity-90">{todayRisk.date}</p>
                <p className="text-base font-bold mt-1">
                  고위험 자치구 {todayRisk.highRiskDistrictCount}개
                </p>
              </div>
            </div>
            {todayRisk.topRiskFactors && todayRisk.topRiskFactors.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {(todayRisk.topRiskFactors as string[]).map((f, i) => (
                  <span
                    key={i}
                    className="bg-white/25 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* ── 시민 행동 요령 ── */}
        {todayRisk && (
          <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl flex items-start gap-4">
            <Info className="w-7 h-7 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-1">시민 행동 요령</h3>
              <p className="text-base text-blue-800 leading-relaxed">{todayRisk.preventionMessage}</p>
            </div>
          </div>
        )}

        {/* ── 내 동네 ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              내 동네
            </h3>
            {myDistrict && (
              <button
                onClick={() => setMyDistrict(null)}
                className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                <StarOff className="w-4 h-4" /> 해제
              </button>
            )}
          </div>

          {myDistrict && myDistrictData ? (
            <div
              className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => navigate(`/district/${myDistrict}`)}
            >
              <div>
                <p className="text-xl font-extrabold text-slate-900">{myDistrict}</p>
                <p className="text-sm text-slate-500 mt-0.5">{myDistrictData.mainFireType}</p>
                <p className="text-sm text-slate-500">위험 시간대: {myDistrictData.dangerTime}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className={`text-3xl font-extrabold ${getRiskTextColor(myDistrictData.riskLevel)}`}>
                    {myDistrictData.score}점
                  </p>
                  <span className={`text-sm px-3 py-1 rounded-full font-bold ${getRiskBadgeClass(myDistrictData.riskLevel)}`}>
                    {myDistrictData.riskLevel}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          ) : myDistrict ? (
            <div className="px-5 py-4">
              <div className="h-16 bg-slate-100 animate-pulse rounded-xl" />
            </div>
          ) : (
            <div className="px-5 py-4">
              <p className="text-sm text-slate-500 mb-3">자주 확인하는 자치구를 설정하세요.</p>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {ALL_DISTRICTS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setMyDistrict(d)}
                    className="px-3 py-1.5 rounded-full border border-slate-300 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary hover:bg-blue-50 transition-colors"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── 지도 바로가기 버튼 ── */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/map">
            <Button size="lg" className="w-full text-base h-14 rounded-xl gap-2">
              <Map className="w-5 h-5" /> 위험지도 보기
            </Button>
          </Link>
          <Link href="/alerts">
            <Button size="lg" variant="outline" className="w-full text-base h-14 rounded-xl gap-2">
              <ShieldAlert className="w-5 h-5" /> 오늘의 알림
            </Button>
          </Link>
        </div>

        {/* ── 날씨 현황 ── */}
        {loadingWeather ? (
          <SkeletonCard className="h-44" />
        ) : weather ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">기상 현황 & 화재 위험 기상</h3>
            </div>
            <div className="grid grid-cols-2 gap-0 divide-x divide-slate-100">
              {/* 오늘 */}
              <div className="p-5">
                <p className="text-sm font-bold text-slate-500 mb-3">
                  오늘 ({weather.today.date})
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <WeatherStat icon={<Thermometer className="w-5 h-5 text-red-400" />} label="기온" value={`${weather.today.temperature}°C`} />
                  <WeatherStat icon={<Droplets className="w-5 h-5 text-blue-400" />} label="습도" value={`${weather.today.humidity}%`} />
                  <WeatherStat icon={<Wind className="w-5 h-5 text-slate-400" />} label="풍속" value={`${weather.today.windSpeed}m/s`} />
                  <WeatherStat icon={<CloudRain className="w-5 h-5 text-sky-400" />} label="강수" value={`${weather.today.precipitationProb}%`} />
                </div>
                {weather.today.riskFactors && weather.today.riskFactors.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {(weather.today.riskFactors as string[]).map((f, i) => (
                      <p key={i} className="text-xs text-orange-700 bg-orange-50 rounded-lg px-2.5 py-1.5 font-medium">
                        ⚠ {f}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              {/* 내일 */}
              <div className="p-5">
                <p className="text-sm font-bold text-slate-500 mb-3">
                  내일 ({weather.tomorrow.date})
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <WeatherStat icon={<Thermometer className="w-5 h-5 text-red-400" />} label="기온" value={`${weather.tomorrow.temperature}°C`} />
                  <WeatherStat icon={<Droplets className="w-5 h-5 text-blue-400" />} label="습도" value={`${weather.tomorrow.humidity}%`} />
                  <WeatherStat icon={<Wind className="w-5 h-5 text-slate-400" />} label="풍속" value={`${weather.tomorrow.windSpeed}m/s`} />
                  <WeatherStat icon={<CloudRain className="w-5 h-5 text-sky-400" />} label="강수" value={`${weather.tomorrow.precipitationProb}%`} />
                </div>
                {weather.tomorrow.riskFactors && weather.tomorrow.riskFactors.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {(weather.tomorrow.riskFactors as string[]).map((f, i) => (
                      <p key={i} className="text-xs text-red-700 bg-red-50 rounded-lg px-2.5 py-1.5 font-medium">
                        ⚠ {f}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* ── 가장 위험한 지역 Top 5 ── */}
        {loadingTop ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} className="h-20" />)}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-extrabold text-slate-900">오늘 위험 지역 Top 5</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {topDistricts?.slice(0, 5).map((district, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/district/${district.name}`)}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-extrabold text-slate-700 flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-extrabold text-slate-900">{district.name}</p>
                    <p className="text-sm text-slate-500 truncate">{district.mainFireType}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className={`text-xl font-extrabold ${getRiskTextColor(district.riskLevel)}`}>
                      {district.score}점
                    </p>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${getRiskBadgeClass(district.riskLevel)}`}>
                      {district.riskLevel}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function WeatherStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

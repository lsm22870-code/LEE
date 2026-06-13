import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { useGetMapDistricts } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KakaoMapView } from "@/components/KakaoMap";
import { useKakaoMap } from "@/hooks/useKakaoMap";

type RiskLevel = "관심" | "주의" | "경계" | "위험";

function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case "위험": return "#ef4444";
    case "경계": return "#f97316";
    case "주의": return "#eab308";
    case "관심": return "#22c55e";
    default: return "#94a3b8";
  }
}

function getRiskBg(level: RiskLevel): string {
  switch (level) {
    case "위험": return "bg-red-500";
    case "경계": return "bg-orange-500";
    case "주의": return "bg-yellow-400";
    case "관심": return "bg-green-500";
    default: return "bg-slate-400";
  }
}

interface DistrictShape {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const DISTRICT_SHAPES: DistrictShape[] = [
  { name: "도봉구",    x: 340, y: 10,  w: 90,  h: 70 },
  { name: "강북구",   x: 260, y: 10,  w: 80,  h: 70 },
  { name: "노원구",   x: 430, y: 10,  w: 100, h: 80 },
  { name: "은평구",   x: 110, y: 50,  w: 100, h: 90 },
  { name: "성북구",   x: 270, y: 80,  w: 110, h: 80 },
  { name: "중랑구",   x: 430, y: 90,  w: 100, h: 80 },
  { name: "서대문구", x: 110, y: 140, w: 90,  h: 80 },
  { name: "종로구",   x: 200, y: 140, w: 110, h: 75 },
  { name: "동대문구", x: 330, y: 155, w: 100, h: 75 },
  { name: "광진구",   x: 430, y: 170, w: 100, h: 75 },
  { name: "마포구",   x: 80,  y: 210, w: 110, h: 80 },
  { name: "중구",     x: 200, y: 210, w: 80,  h: 70 },
  { name: "성동구",   x: 310, y: 220, w: 120, h: 70 },
  { name: "용산구",   x: 175, y: 280, w: 105, h: 70 },
  { name: "강동구",   x: 430, y: 245, w: 100, h: 90 },
  { name: "양천구",   x: 60,  y: 290, w: 95,  h: 80 },
  { name: "영등포구", x: 110, y: 350, w: 110, h: 75 },
  { name: "구로구",   x: 55,  y: 370, w: 100, h: 75 },
  { name: "동작구",   x: 200, y: 350, w: 110, h: 75 },
  { name: "강서구",   x: 20,  y: 280, w: 100, h: 90 },
  { name: "금천구",   x: 55,  y: 445, w: 100, h: 75 },
  { name: "관악구",   x: 155, y: 425, w: 115, h: 80 },
  { name: "서초구",   x: 215, y: 425, w: 130, h: 80 },
  { name: "강남구",   x: 310, y: 350, w: 120, h: 95 },
  { name: "송파구",   x: 380, y: 340, w: 120, h: 110 },
];

interface PopupData {
  name: string;
  score: number;
  riskLevel: RiskLevel;
  mainFireType: string;
  x: number;
  y: number;
}

function SvgMap({
  districtMap,
  search,
  onDistrictClick,
}: {
  districtMap: Map<string, { score: number; riskLevel: string; mainFireType?: string }>;
  search: string;
  onDistrictClick: (name: string) => void;
}) {
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [, navigate] = useLocation();

  return (
    <div className="relative" style={{ width: "100%", paddingBottom: "88%" }}>
      <svg
        viewBox="0 0 560 530"
        className="absolute inset-0 w-full h-full"
        style={{ fontFamily: "inherit" }}
        onClick={() => setPopup(null)}
      >
        <text x="10" y="515" fontSize="11" fill="#94a3b8">서울특별시 자치구별 화재위험도</text>
        {DISTRICT_SHAPES.map((shape) => {
          const data = districtMap.get(shape.name);
          const level = (data?.riskLevel ?? "관심") as RiskLevel;
          const highlighted = search && shape.name.includes(search);
          return (
            <g
              key={shape.name}
              data-testid={`map-district-${shape.name}`}
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                if (data) {
                  setPopup({
                    name: shape.name,
                    score: data.score,
                    riskLevel: level,
                    mainFireType: data.mainFireType ?? "",
                    x: shape.x + shape.w / 2,
                    y: shape.y,
                  });
                }
              }}
            >
              <rect
                x={shape.x} y={shape.y}
                width={shape.w} height={shape.h}
                rx={6}
                fill={getRiskColor(level)}
                opacity={highlighted ? 1 : 0.78}
                stroke={highlighted ? "#1e293b" : "white"}
                strokeWidth={highlighted ? 2.5 : 1.2}
              />
              <text
                x={shape.x + shape.w / 2}
                y={shape.y + shape.h / 2 - 6}
                textAnchor="middle" fontSize="11" fontWeight="700" fill="white"
                style={{ pointerEvents: "none", textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
              >
                {shape.name}
              </text>
              {data && (
                <text
                  x={shape.x + shape.w / 2}
                  y={shape.y + shape.h / 2 + 10}
                  textAnchor="middle" fontSize="11" fontWeight="600" fill="white"
                  style={{ pointerEvents: "none", textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
                >
                  {data.score}점
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {popup && (
        <div
          className="absolute bg-white rounded-xl border-2 border-slate-200 shadow-xl p-4 z-10 min-w-[220px]"
          style={{
            left: `${Math.min(popup.x / 560 * 100, 60)}%`,
            top: `${popup.y / 530 * 100}%`,
            transform: "translate(-50%, -110%)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-extrabold text-slate-900">{popup.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-sm font-bold text-white ${getRiskBg(popup.riskLevel)}`}>
              {popup.riskLevel}
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800 mb-1">{popup.score}점</p>
          <p className="text-sm text-slate-600 mb-3">{popup.mainFireType}</p>
          <Button size="sm" className="w-full text-sm" onClick={() => navigate(`/district/${popup.name}`)}>
            상세 분석 보기
          </Button>
        </div>
      )}
    </div>
  );
}

export default function MapPage() {
  const { data: districts, isLoading } = useGetMapDistricts();
  const [search, setSearch] = useState("");
  const [, navigate] = useLocation();
  const kakaoState = useKakaoMap();

  const districtMap = new Map(districts?.map((d) => [d.name, d]) ?? []);
  const filtered = search.trim()
    ? DISTRICT_SHAPES.filter((s) => s.name.includes(search.trim()))
    : DISTRICT_SHAPES;

  const kakaoDistricts = districts?.map((d) => ({
    name: d.name,
    score: d.score,
    riskLevel: d.riskLevel as RiskLevel,
    mainFireType: d.mainFireType ?? undefined,
  })) ?? [];

  const handleDistrictClick = useCallback((name: string) => {
    navigate(`/district/${name}`);
  }, [navigate]);

  const useKakao = kakaoState === "ready";

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">위험지도</h2>
          {useKakao && (
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full font-medium">
              카카오맵 연동
            </span>
          )}
        </div>

        {/* Search */}
        <div className="flex gap-2 max-w-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="자치구 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-base"
            />
          </div>
          {search && (
            <Button variant="outline" size="icon" onClick={() => setSearch("")}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {(["관심", "주의", "경계", "위험"] as RiskLevel[]).map((level) => (
            <div key={level} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded" style={{ backgroundColor: getRiskColor(level), opacity: 0.85 }} />
              <span className="text-base font-semibold text-slate-700">{level}</span>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          style={{ height: useKakao ? 520 : undefined }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-[520px]">
              <p className="text-xl text-slate-500">지도 데이터를 불러오는 중...</p>
            </div>
          ) : useKakao ? (
            <KakaoMapView
              districts={kakaoDistricts}
              onDistrictClick={handleDistrictClick}
            />
          ) : (
            <div className="p-4">
              <SvgMap
                districtMap={districtMap}
                search={search}
                onDistrictClick={handleDistrictClick}
              />
            </div>
          )}
        </div>

        {/* District list */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {filtered.map((shape) => {
            const data = districtMap.get(shape.name);
            const level = (data?.riskLevel ?? "관심") as RiskLevel;
            return (
              <Link key={shape.name} href={`/district/${shape.name}`}>
                <div
                  className="rounded-xl border p-3 cursor-pointer hover:shadow-md transition-shadow"
                  style={{ borderColor: getRiskColor(level), borderWidth: 2 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-800">{shape.name}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-bold text-white"
                      style={{ backgroundColor: getRiskColor(level) }}
                    >
                      {level}
                    </span>
                  </div>
                  <p className="text-lg font-extrabold text-slate-900">{data?.score ?? "-"}점</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

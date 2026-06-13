import { useEffect, useRef } from "react";
import { useKakaoMap } from "@/hooks/useKakaoMap";

type RiskLevel = "관심" | "주의" | "경계" | "위험";

interface District {
  name: string;
  score: number;
  riskLevel: RiskLevel;
  mainFireType?: string;
}

interface KakaoMapViewProps {
  districts: District[];
  onDistrictClick: (name: string) => void;
}

function getRiskColor(level: RiskLevel) {
  switch (level) {
    case "위험": return "#ef4444";
    case "경계": return "#f97316";
    case "주의": return "#eab308";
    case "관심": return "#22c55e";
    default: return "#94a3b8";
  }
}

// 서울 25개 자치구 중심 좌표 (위도, 경도)
const DISTRICT_CENTERS: Record<string, [number, number]> = {
  "종로구":   [37.5909, 126.9748],
  "중구":     [37.5641, 126.9979],
  "용산구":   [37.5313, 126.9819],
  "성동구":   [37.5634, 127.0369],
  "광진구":   [37.5385, 127.0823],
  "동대문구": [37.5744, 127.0395],
  "중랑구":   [37.6063, 127.0927],
  "성북구":   [37.5894, 127.0167],
  "강북구":   [37.6397, 127.0257],
  "도봉구":   [37.6688, 127.0471],
  "노원구":   [37.6542, 127.0568],
  "은평구":   [37.6027, 126.9291],
  "서대문구": [37.5791, 126.9368],
  "마포구":   [37.5638, 126.9084],
  "양천구":   [37.5169, 126.8664],
  "강서구":   [37.5509, 126.8496],
  "구로구":   [37.4954, 126.8877],
  "금천구":   [37.4601, 126.9001],
  "영등포구": [37.5264, 126.8962],
  "동작구":   [37.5124, 126.9393],
  "관악구":   [37.4784, 126.9516],
  "서초구":   [37.4836, 127.0323],
  "강남구":   [37.5172, 127.0473],
  "송파구":   [37.5145, 127.1059],
  "강동구":   [37.5301, 127.1238],
};

// 자치구 경계 폴리곤 (간략화된 좌표)
const DISTRICT_POLYGONS: Record<string, [number, number][]> = {
  "종로구":   [[37.606,126.956],[37.600,126.995],[37.584,126.998],[37.571,126.985],[37.573,126.955],[37.588,126.948]],
  "중구":     [[37.571,126.985],[37.564,126.994],[37.554,126.996],[37.550,126.985],[37.556,126.970],[37.566,126.972]],
  "용산구":   [[37.550,126.985],[37.554,126.996],[37.548,127.012],[37.527,127.004],[37.519,126.981],[37.537,126.967]],
  "성동구":   [[37.584,126.998],[37.571,126.985],[37.566,126.972],[37.574,127.020],[37.582,127.058],[37.560,127.056],[37.559,127.016]],
  "광진구":   [[37.558,127.058],[37.560,127.056],[37.582,127.058],[37.584,127.098],[37.567,127.100],[37.546,127.080]],
  "동대문구": [[37.600,126.995],[37.584,126.998],[37.559,127.016],[37.560,127.056],[37.582,127.058],[37.600,127.040]],
  "중랑구":   [[37.600,126.995],[37.600,127.040],[37.618,127.078],[37.634,127.075],[37.630,127.040],[37.620,127.010]],
  "성북구":   [[37.606,126.956],[37.600,126.995],[37.620,127.010],[37.630,127.040],[37.634,127.075],[37.619,127.070],[37.615,127.030],[37.617,126.990],[37.616,126.960]],
  "강북구":   [[37.616,126.960],[37.617,126.990],[37.615,127.030],[37.629,127.020],[37.650,127.012],[37.657,126.985],[37.644,126.960]],
  "도봉구":   [[37.644,126.960],[37.657,126.985],[37.686,127.047],[37.693,127.025],[37.682,126.988],[37.668,126.962]],
  "노원구":   [[37.657,126.985],[37.650,127.012],[37.629,127.020],[37.634,127.075],[37.660,127.090],[37.690,127.087],[37.693,127.025],[37.686,127.047]],
  "은평구":   [[37.638,126.900],[37.638,126.940],[37.616,126.960],[37.606,126.956],[37.588,126.948],[37.583,126.920],[37.596,126.895]],
  "서대문구": [[37.588,126.948],[37.573,126.955],[37.571,126.985],[37.556,126.970],[37.550,126.957],[37.557,126.930],[37.571,126.920]],
  "마포구":   [[37.583,126.920],[37.571,126.920],[37.557,126.930],[37.550,126.957],[37.537,126.967],[37.519,126.981],[37.527,126.943],[37.545,126.915],[37.560,126.903]],
  "양천구":   [[37.536,126.855],[37.533,126.888],[37.519,126.907],[37.507,126.896],[37.504,126.858],[37.518,126.843]],
  "강서구":   [[37.560,126.803],[37.560,126.855],[37.536,126.855],[37.518,126.843],[37.504,126.858],[37.496,126.820],[37.519,126.800]],
  "구로구":   [[37.519,126.907],[37.533,126.888],[37.536,126.855],[37.504,126.858],[37.481,126.877],[37.482,126.903]],
  "금천구":   [[37.481,126.877],[37.504,126.858],[37.507,126.896],[37.494,126.918],[37.462,126.913],[37.453,126.883]],
  "영등포구": [[37.545,126.915],[37.527,126.943],[37.519,126.981],[37.503,126.961],[37.501,126.934],[37.507,126.896],[37.519,126.907],[37.519,126.935]],
  "동작구":   [[37.519,126.981],[37.537,126.967],[37.527,127.004],[37.516,127.013],[37.499,126.999],[37.503,126.961]],
  "관악구":   [[37.501,126.934],[37.503,126.961],[37.499,126.999],[37.483,126.990],[37.462,126.966],[37.457,126.940],[37.467,126.913],[37.494,126.918],[37.507,126.896]],
  "서초구":   [[37.516,127.013],[37.527,127.004],[37.548,127.012],[37.554,127.040],[37.496,127.060],[37.470,127.010],[37.457,126.998],[37.483,126.990],[37.499,126.999]],
  "강남구":   [[37.548,127.012],[37.559,127.016],[37.574,127.020],[37.566,127.072],[37.530,127.072],[37.496,127.060],[37.554,127.040]],
  "송파구":   [[37.574,127.020],[37.582,127.058],[37.558,127.058],[37.546,127.080],[37.504,127.112],[37.497,127.088],[37.530,127.072],[37.566,127.072]],
  "강동구":   [[37.582,127.058],[37.584,127.098],[37.567,127.100],[37.546,127.080],[37.558,127.058]],
};

export function KakaoMapView({ districts, onDistrictClick }: KakaoMapViewProps) {
  const mapState = useKakaoMap();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const overlaysRef = useRef<unknown[]>([]);
  const polygonsRef = useRef<unknown[]>([]);

  useEffect(() => {
    if (mapState !== "ready" || !containerRef.current) return;

    const kakao = window.kakao;

    // 지도 생성 (서울 중심)
    const map = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(37.5665, 126.9780),
      level: 9,
    });
    mapRef.current = map;

    const districtMap = new Map(districts.map((d) => [d.name, d]));

    // 기존 오버레이/폴리곤 정리
    overlaysRef.current.forEach((o: unknown) => (o as { setMap: (m: null) => void }).setMap(null));
    polygonsRef.current.forEach((p: unknown) => (p as { setMap: (m: null) => void }).setMap(null));
    overlaysRef.current = [];
    polygonsRef.current = [];

    Object.entries(DISTRICT_POLYGONS).forEach(([name, coords]) => {
      const data = districtMap.get(name);
      const level = (data?.riskLevel ?? "관심") as RiskLevel;
      const color = getRiskColor(level);

      const path = coords.map(([lat, lng]) => new kakao.maps.LatLng(lat, lng));

      const polygon = new kakao.maps.Polygon({
        map,
        path,
        strokeWeight: 2,
        strokeColor: "#fff",
        strokeOpacity: 0.9,
        fillColor: color,
        fillOpacity: 0.72,
      });

      kakao.maps.event.addListener(polygon, "click", () => {
        onDistrictClick(name);
      });

      polygonsRef.current.push(polygon);

      // 자치구 이름 + 점수 오버레이
      const center = DISTRICT_CENTERS[name];
      if (center && data) {
        const content = `
          <div style="
            background: rgba(255,255,255,0.92);
            border: 2px solid ${color};
            border-radius: 8px;
            padding: 4px 8px;
            font-size: 12px;
            font-weight: 700;
            color: #1e293b;
            line-height: 1.4;
            text-align: center;
            pointer-events: none;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          ">
            ${name}<br/><span style="color:${color}">${data.score}점</span>
          </div>`;

        const overlay = new kakao.maps.CustomOverlay({
          map,
          position: new kakao.maps.LatLng(center[0], center[1]),
          content,
          yAnchor: 0.5,
          zIndex: 3,
        });
        overlaysRef.current.push(overlay);
      }
    });

    return () => {
      overlaysRef.current.forEach((o: unknown) => (o as { setMap: (m: null) => void }).setMap(null));
      polygonsRef.current.forEach((p: unknown) => (p as { setMap: (m: null) => void }).setMap(null));
    };
  }, [mapState, districts, onDistrictClick]);

  if (mapState === "loading") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-slate-500">카카오맵 불러오는 중...</p>
      </div>
    );
  }

  if (mapState === "error") {
    return null;
  }

  return <div ref={containerRef} className="w-full h-full" />;
}

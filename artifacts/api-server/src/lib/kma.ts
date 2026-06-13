/**
 * 기상청 단기예보 조회서비스 API 클라이언트
 * Endpoint: https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0
 */

const BASE_URL = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0";

// ── KST(한국 표준시) 헬퍼 ──────────────────────────────────────────────────

function getKST() {
  const nowMs = Date.now() + 9 * 3600 * 1000; // UTC → KST
  const d = new Date(nowMs);
  const date = d.toISOString().slice(0, 10).replace(/-/g, "");
  return { date, hours: d.getUTCHours(), minutes: d.getUTCMinutes() };
}

function prevDate(date: string): string {
  const y = Number(date.slice(0, 4));
  const m = Number(date.slice(4, 6)) - 1;
  const day = Number(date.slice(6, 8));
  return new Date(Date.UTC(y, m, day - 1)).toISOString().slice(0, 10).replace(/-/g, "");
}

function nextDate(date: string): string {
  const y = Number(date.slice(0, 4));
  const m = Number(date.slice(4, 6)) - 1;
  const day = Number(date.slice(6, 8));
  return new Date(Date.UTC(y, m, day + 1)).toISOString().slice(0, 10).replace(/-/g, "");
}

function formatDate(d: string): string {
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

// ── 격자 좌표(nx/ny) 매핑 ────────────────────────────────────────────────────

const DISTRICT_GRID: Record<string, { nx: number; ny: number }> = {
  종로구:  { nx: 60, ny: 127 },
  중구:    { nx: 60, ny: 127 },
  용산구:  { nx: 60, ny: 126 },
  성동구:  { nx: 61, ny: 127 },
  광진구:  { nx: 62, ny: 127 },
  동대문구:{ nx: 61, ny: 127 },
  중랑구:  { nx: 62, ny: 128 },
  성북구:  { nx: 61, ny: 128 },
  강북구:  { nx: 61, ny: 129 },
  도봉구:  { nx: 61, ny: 130 },
  노원구:  { nx: 62, ny: 129 },
  은평구:  { nx: 59, ny: 128 },
  서대문구:{ nx: 59, ny: 127 },
  마포구:  { nx: 59, ny: 127 },
  양천구:  { nx: 58, ny: 126 },
  강서구:  { nx: 57, ny: 126 },
  구로구:  { nx: 58, ny: 125 },
  금천구:  { nx: 59, ny: 124 },
  영등포구:{ nx: 58, ny: 126 },
  동작구:  { nx: 59, ny: 125 },
  관악구:  { nx: 59, ny: 124 },
  서초구:  { nx: 61, ny: 125 },
  강남구:  { nx: 61, ny: 126 },
  송파구:  { nx: 62, ny: 126 },
  강동구:  { nx: 63, ny: 126 },
};

export function districtToGrid(district: string): { nx: number; ny: number } {
  return DISTRICT_GRID[district] ?? { nx: 60, ny: 127 };
}

// ── 발표시각(base_time) 자동 선택 ────────────────────────────────────────────

type BaseTimeType = "ncst" | "ultraFcst" | "vilageFcst";

function getBaseTime(type: BaseTimeType): { base_date: string; base_time: string } {
  const { date, hours, minutes } = getKST();

  if (type === "ncst") {
    // 초단기실황: 매시 :40 발표 → MM < 40 이면 이전 시각 사용
    let h = hours;
    let d = date;
    if (minutes < 40) {
      if (h === 0) { h = 23; d = prevDate(date); }
      else h--;
    }
    return { base_date: d, base_time: `${String(h).padStart(2, "0")}00` };
  }

  if (type === "ultraFcst") {
    // 초단기예보: 매시 :45 발표, base_time = HH30
    let h = hours;
    let d = date;
    if (minutes < 45) {
      if (h === 0) { h = 23; d = prevDate(date); }
      else h--;
    }
    return { base_date: d, base_time: `${String(h).padStart(2, "0")}30` };
  }

  // 단기예보: 0200/0500/0800/1100/1400/1700/2000/2300, 10분 후 공개
  const slots = [2, 5, 8, 11, 14, 17, 20, 23];
  const totalMins = hours * 60 + minutes;
  let chosen = -1;
  for (const s of slots) {
    if (totalMins >= s * 60 + 10) chosen = s;
  }
  let d = date;
  let h = chosen;
  if (chosen === -1) { h = 23; d = prevDate(date); }
  return { base_date: d, base_time: `${String(h).padStart(2, "0")}00` };
}

// ── KMA API 호출 ─────────────────────────────────────────────────────────────

type KMAItem = Record<string, string>;

async function callKMA(
  operation: string,
  params: Record<string, string | number>,
): Promise<KMAItem[]> {
  const key = process.env["KMA_SERVICE_KEY"];
  if (!key) throw new Error("NO_KEY");

  const url = new URL(`${BASE_URL}/${operation}`);
  url.searchParams.set("serviceKey", key);
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", "1000");
  url.searchParams.set("dataType", "JSON");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP_${res.status}`);

  const data = (await res.json()) as {
    response?: {
      header?: { resultCode?: string; resultMsg?: string };
      body?: { items?: { item?: KMAItem[] } };
    };
  };

  const header = data?.response?.header;
  if (header?.resultCode !== "00") {
    throw new Error(`KMA_ERROR:${header?.resultMsg ?? "Unknown"}`);
  }

  const items = data?.response?.body?.items?.item;
  return Array.isArray(items) ? items : [];
}

// ── 파싱 헬퍼 ────────────────────────────────────────────────────────────────

function skyCodeToText(code: string): string {
  if (code === "3") return "구름많음";
  if (code === "4") return "흐림";
  return "맑음"; // 1
}

function ptyCodeToText(code: string): string {
  if (code === "1") return "비";
  if (code === "2") return "비/눈";
  if (code === "3") return "눈";
  if (code === "4") return "소나기";
  return "없음"; // 0
}

function vecToDirName(vec: number): string {
  const dirs = [
    "북","북북동","북동","동북동","동","동남동","남동","남남동",
    "남","남남서","남서","서남서","서","서북서","북서","북북서",
  ];
  return dirs[Math.round(vec / 22.5) % 16] ?? "북서";
}

function parsePCP(val: string | undefined): number {
  if (!val || val === "강수없음" || val === "0") return 0;
  if (val.includes("미만")) return 0.4;
  const m = val.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

function computeRiskFactors(
  slot: Record<string, string>,
  windSpeed?: number,
): string[] {
  const factors: string[] = [];
  const temp = Number(slot["TMP"] ?? slot["T1H"] ?? 999);
  const hum = Number(slot["REH"] ?? 999);
  const ws = windSpeed ?? Number(slot["WSD"] ?? 0);
  const pop = Number(slot["POP"] ?? 0);

  if (temp !== 999) {
    if (temp >= 33) factors.push("폭염: 냉방기기·실외기 과부하 화재 위험");
    if (temp <= -5) factors.push("한파: 전기장판·난방기기 화재 위험 증가");
  }
  if (hum !== 999 && hum < 40) factors.push(`낮은 습도(${hum}%): 산림·야외 화재 확산 위험`);
  if (ws >= 9) factors.push(`강풍(${ws}m/s): 화재 급격 확산 위험`);
  if (pop >= 70) factors.push("강수확률 높음: 야외 화재 위험 감소");
  return factors;
}

function computeWeatherScore(slot: Record<string, string>, hasForest = false): number {
  let score = 0;
  const hum = Number(slot["REH"] ?? slot["humidity"] ?? 60);
  const temp = Number(slot["TMP"] ?? slot["T1H"] ?? slot["temperature"] ?? 25);
  const ws = Number(slot["WSD"] ?? slot["windSpeed"] ?? 2);
  const pop = Number(slot["POP"] ?? slot["precipitationProb"] ?? 0);

  if (hum < 30) score += 6;
  else if (hum < 40) score += 4;
  else if (hum < 50) score += 2;

  if (temp >= 35) score += 4;
  else if (temp >= 33) score += 2;
  if (temp <= -10) score += 4;
  else if (temp <= -5) score += 2;

  if (ws >= 9) score += 5;
  else if (ws >= 6) score += 3;
  else if (ws >= 4) score += 1;

  if (pop >= 70) score -= 4;
  else if (pop >= 50) score -= 2;

  if (hasForest && hum < 50) score += 2; // 산림지역 건조 가중

  return Math.max(0, Math.min(20, score));
}

// ── 공개 API ─────────────────────────────────────────────────────────────────

export type WeatherSource = "KMA" | "NO_KEY" | "ERROR" | "DB_FALLBACK";

export interface KMACurrentWeather {
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  windDirection: string | null;
  precipitation: number | null;
  skyCondition: string | null;
  precipitationType: string | null;
  source: WeatherSource;
  sourceMessage: string;
  observedAt: string | null;
}

export interface KMADayForecast {
  date: string;
  temperature: number;
  maxTemp: number;
  minTemp: number;
  humidity: number;
  precipitationProb: number;
  precipitation: number;
  windSpeed: number;
  windDirection: string;
  skyCondition: string;
  precipitationType: string;
  isDry: boolean;
  isHeatwave: boolean;
  isColdwave: boolean;
  isStrongWind: boolean;
  riskFactors: string[];
  weatherScore: number;
}

export interface KMAForecastResult {
  today: KMADayForecast;
  tomorrow: KMADayForecast;
  source: WeatherSource;
  sourceMessage: string;
}

/** 초단기실황 + 초단기예보 → 현재 기상 */
export async function getCurrentWeather(
  district: string,
): Promise<KMACurrentWeather> {
  const { nx, ny } = districtToGrid(district);
  const { base_date, base_time } = getBaseTime("ncst");
  const { base_date: ufd, base_time: uft } = getBaseTime("ultraFcst");

  try {
    const [ncstItems, fcstItems] = await Promise.all([
      callKMA("getUltraSrtNcst", { base_date, base_time, nx, ny }),
      callKMA("getUltraSrtFcst", { base_date: ufd, base_time: uft, nx, ny }),
    ]);

    // ncst: category → obsrValue
    const ncst: Record<string, string> = {};
    for (const item of ncstItems) ncst[item["category"] ?? ""] = item["obsrValue"] ?? "";

    // ultraFcst: 가장 가까운 미래 시각 슬롯 사용
    const { hours, minutes } = getKST();
    const nowStr = `${String(hours).padStart(2, "0")}${String(minutes).padStart(2, "0")}`;
    const fcstByTime: Record<string, Record<string, string>> = {};
    for (const item of fcstItems) {
      const ft = item["fcstTime"] ?? "";
      fcstByTime[ft] ??= {};
      fcstByTime[ft][item["category"] ?? ""] = item["fcstValue"] ?? "";
    }
    const futureTimes = Object.keys(fcstByTime).sort().filter(t => t >= nowStr);
    const slot = fcstByTime[futureTimes[0] ?? Object.keys(fcstByTime).sort()[0]] ?? {};

    return {
      temperature: Number(ncst["T1H"]),
      humidity: Number(ncst["REH"]),
      windSpeed: Number(ncst["WSD"]),
      windDirection: vecToDirName(Number(ncst["VEC"] ?? "315")),
      precipitation: parsePCP(ncst["RN1"]),
      skyCondition: skyCodeToText(slot["SKY"] ?? "1"),
      precipitationType: ptyCodeToText(ncst["PTY"] ?? "0"),
      source: "KMA",
      sourceMessage: "기상청 예보 연동 완료",
      observedAt: `${base_date.slice(0, 4)}-${base_date.slice(4, 6)}-${base_date.slice(6, 8)}T${base_time.slice(0, 2)}:00:00+09:00`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "NO_KEY") {
      return { temperature: null, humidity: null, windSpeed: null, windDirection: null, precipitation: null, skyCondition: null, precipitationType: null, source: "NO_KEY", sourceMessage: "기상청 API 키 미등록", observedAt: null };
    }
    return { temperature: null, humidity: null, windSpeed: null, windDirection: null, precipitation: null, skyCondition: null, precipitationType: null, source: "ERROR", sourceMessage: "기상청 예보 연결 실패", observedAt: null };
  }
}

/** 단기예보 → 오늘·내일 예보 */
export async function getKMAForecast(
  nx: number,
  ny: number,
): Promise<Omit<KMAForecastResult, "source" | "sourceMessage"> | null> {
  const { base_date, base_time } = getBaseTime("vilageFcst");
  const items = await callKMA("getVilageFcst", { base_date, base_time, nx, ny });

  const { date: todayDate } = getKST();
  const tomorrowDate = nextDate(todayDate);

  // Slot 구조: byDate → byTime → category → value
  const byDate: Record<string, Record<string, Record<string, string>>> = {};
  for (const item of items) {
    const fd = item["fcstDate"] ?? "";
    const ft = item["fcstTime"] ?? "";
    const cat = item["category"] ?? "";
    const val = item["fcstValue"] ?? "";
    byDate[fd] ??= {};
    byDate[fd][ft] ??= {};
    byDate[fd][ft][cat] = val;
  }

  const buildDay = (dateStr: string): KMADayForecast | null => {
    const slots = byDate[dateStr];
    if (!slots) return null;

    // TMN/TMX: 특정 시각에 한 번 등장
    let minTemp = 999, maxTemp = -999;
    let sumHum = 0, sumPop = 0, sumWs = 0, n = 0;
    let daySlot: Record<string, string> = {};
    const times = Object.keys(slots).sort();

    for (const t of times) {
      const s = slots[t];
      if (s["TMN"]) minTemp = Math.min(minTemp, Number(s["TMN"]));
      if (s["TMX"]) maxTemp = Math.max(maxTemp, Number(s["TMX"]));
      sumHum += Number(s["REH"] ?? 0);
      sumPop += Number(s["POP"] ?? 0);
      sumWs  += Number(s["WSD"] ?? 0);
      n++;
    }

    // 낮 시간대(1200) 슬롯 우선, 없으면 중간 슬롯
    const midIdx = Math.floor(times.length / 2);
    daySlot = slots["1200"] ?? slots[times[midIdx]] ?? {};

    const hum  = n > 0 ? Math.round(sumHum / n) : Number(daySlot["REH"] ?? 60);
    const pop  = n > 0 ? Math.round(sumPop / n) : Number(daySlot["POP"] ?? 0);
    const ws   = n > 0 ? Math.round((sumWs / n) * 10) / 10 : Number(daySlot["WSD"] ?? 2);
    const temp = Number(daySlot["TMP"] ?? 25);
    const effMin = minTemp !== 999 ? minTemp : temp - 4;
    const effMax = maxTemp !== -999 ? maxTemp : temp + 4;

    const scoreSlot = { TMP: String(temp), REH: String(hum), WSD: String(ws), POP: String(pop) };

    return {
      date: formatDate(dateStr),
      temperature: temp,
      maxTemp: effMax,
      minTemp: effMin,
      humidity: hum,
      precipitationProb: pop,
      precipitation: parsePCP(daySlot["PCP"]),
      windSpeed: ws,
      windDirection: vecToDirName(Number(daySlot["VEC"] ?? 315)),
      skyCondition: skyCodeToText(daySlot["SKY"] ?? "1"),
      precipitationType: ptyCodeToText(daySlot["PTY"] ?? "0"),
      isDry: hum < 40,
      isHeatwave: effMax >= 33,
      isColdwave: effMin <= -5,
      isStrongWind: ws >= 9,
      riskFactors: computeRiskFactors(scoreSlot),
      weatherScore: computeWeatherScore(scoreSlot),
    };
  };

  const today = buildDay(todayDate);
  const tomorrow = buildDay(tomorrowDate);
  if (!today || !tomorrow) return null;

  return { today, tomorrow };
}

export { computeWeatherScore, computeRiskFactors };

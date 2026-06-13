import { Layout } from "@/components/Layout";
import { useGetTodayRisk, useGetTopDangerDistricts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AlertTriangle, Info, Map } from "lucide-react";

function getRiskColor(level: string) {
  switch(level) {
    case '위험': return 'bg-risk-red text-white';
    case '경계': return 'bg-risk-orange text-white';
    case '주의': return 'bg-risk-yellow text-black';
    default: return 'bg-risk-green text-white';
  }
}

export default function Home() {
  const { data: todayRisk, isLoading: isLoadingRisk } = useGetTodayRisk();
  const { data: topDistricts, isLoading: isLoadingDistricts } = useGetTopDangerDistricts();

  if (isLoadingRisk || isLoadingDistricts) {
    return <Layout><div className="flex h-64 items-center justify-center text-xl font-bold">데이터를 불러오는 중입니다...</div></Layout>;
  }

  if (!todayRisk) return <Layout><div>Error</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">오늘의 화재위험 예보</h2>
        
        {/* Main Banner */}
        <Card className="border-2 shadow-sm overflow-hidden">
          <div className={`${getRiskColor(todayRisk.riskLevel)} p-6 flex flex-col md:flex-row items-center justify-between gap-6`}>
            <div className="flex flex-col items-center md:items-start">
              <span className="text-xl md:text-2xl font-bold opacity-90">서울시 전체 위험도</span>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-5xl md:text-7xl font-extrabold">{todayRisk.riskLevel}</span>
                <span className="text-4xl md:text-5xl font-bold opacity-90">({todayRisk.overallScore}점)</span>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-lg md:text-xl font-medium opacity-90">{todayRisk.date}</p>
              <p className="text-lg font-bold mt-1">주요 위험: {todayRisk.mainFireType}</p>
            </div>
          </div>
        </Card>

        {/* Prevention Message */}
        <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 flex items-start gap-4">
          <Info className="w-8 h-8 text-primary shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">시민 행동 요령</h3>
            <p className="text-lg text-slate-700 leading-relaxed">{todayRisk.preventionMessage}</p>
          </div>
        </div>

        {/* Action button */}
        <Link href="/map" className="block w-full">
          <Button size="lg" className="w-full text-xl h-16 rounded-xl flex items-center gap-3">
            <Map className="w-6 h-6" /> 위험지도에서 우리 동네 확인하기
          </Button>
        </Link>

        {/* Top Districts */}
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-risk-red" /> 가장 위험한 지역 Top 3
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {topDistricts?.slice(0,3).map((district, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex justify-between items-center">
                    {district.name}
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRiskColor(district.riskLevel)}`}>
                      {district.riskLevel}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold mb-2">{district.score}점</p>
                  <p className="text-slate-600 font-medium">주요 위험: {district.mainFireType}</p>
                  <Link href={`/district/${district.name}`} className="mt-4 block">
                    <Button variant="outline" className="w-full text-lg">상세보기</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

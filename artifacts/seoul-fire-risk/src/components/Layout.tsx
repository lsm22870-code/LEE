import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, Map, Bell, ShieldAlert, BarChart2 } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "메인", icon: Home },
    { href: "/map", label: "위험지도", icon: Map },
    { href: "/alerts", label: "알림", icon: Bell },
    { href: "/firefighter", label: "소방관서", icon: ShieldAlert },
    { href: "/statistics", label: "통계", icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            서울 119<br />화재위험 예보
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = location === link.href;
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-lg ${active ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                <Icon className="w-6 h-6" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center px-2 py-3 z-50">
        {links.map((link) => {
          const Icon = link.icon;
          const active = location === link.href;
          return (
            <Link key={link.href} href={link.href} className={`flex flex-col items-center gap-1 p-2 min-w-[4rem] ${active ? "text-primary" : "text-slate-500"}`}>
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

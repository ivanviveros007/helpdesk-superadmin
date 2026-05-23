"use client";

import { BarChart3, Building2, Ticket, Clock, TrendingUp, Calendar } from "lucide-react";
import { useGlobalMetrics } from "@/hooks/useMetrics";

function MetricCard({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: React.ElementType; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { data: metrics, isLoading } = useGlobalMetrics();

  if (isLoading) return <div className="flex h-full items-center justify-center text-slate-400">Cargando métricas...</div>;
  if (!metrics) return null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-slate-400">Métricas globales del sistema</p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        <MetricCard label="Organizaciones totales" value={metrics.total_orgs} icon={Building2} sub={`${metrics.orgs_activas} activas`} />
        <MetricCard label="Tickets (all time)" value={metrics.total_tickets_all_time} icon={Ticket} />
        <MetricCard label="Tickets hoy" value={metrics.tickets_hoy} icon={TrendingUp} />
        <MetricCard label="Tickets este mes" value={metrics.tickets_este_mes} icon={Calendar} />
        <MetricCard label="Tiempo promedio resolución" value={metrics.avg_resolution_hours ? `${metrics.avg_resolution_hours}h` : "—"} icon={Clock} sub="tickets resueltos" />
        <MetricCard label="Orgs activas este mes" value={metrics.orgs_con_tickets_este_mes} icon={BarChart3} sub="con al menos 1 ticket" />
      </div>
    </div>
  );
}

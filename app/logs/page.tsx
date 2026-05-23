"use client";

import { AlertTriangle, Ticket, UserPlus, Building2, RefreshCw } from "lucide-react";
import { useLogs } from "@/hooks/useMetrics";
import type { LogEntry } from "@/types";

const iconMap: Record<LogEntry["type"], React.ElementType> = {
  ticket_created: Ticket,
  user_registered: UserPlus,
  org_created: Building2,
  ai_error: AlertTriangle,
};

const colorMap: Record<LogEntry["type"], string> = {
  ticket_created: "text-blue-400",
  user_registered: "text-green-400",
  org_created: "text-violet-400",
  ai_error: "text-red-400",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
}

export default function LogsPage() {
  const { data: logs = [], isLoading, refetch } = useLogs();

  const aiErrors = logs.filter((l) => l.type === "ai_error");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Logs</h1>
          <p className="text-sm text-slate-400">Últimos 50 eventos del sistema · actualiza cada 15s</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 hover:bg-slate-800">
          <RefreshCw className="h-4 w-4" /> Actualizar
        </button>
      </div>

      {aiErrors.length > 0 && (
        <div className="rounded-xl border border-red-900/50 bg-red-900/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-sm font-semibold text-red-400">{aiErrors.length} ticket{aiErrors.length !== 1 ? "s" : ""} atascado{aiErrors.length !== 1 ? "s" : ""} en PENDIENTE_IA</span>
          </div>
          <ul className="text-xs text-red-300 space-y-1">
            {aiErrors.map((e, i) => <li key={i}>{e.message} — {formatTime(e.timestamp)}</li>)}
          </ul>
        </div>
      )}

      {isLoading ? (
        <p className="text-slate-400">Cargando logs...</p>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <ul className="divide-y divide-slate-800">
            {logs.map((log, i) => {
              const Icon = iconMap[log.type];
              const color = colorMap[log.type];
              return (
                <li key={i} className="flex items-start gap-3 px-5 py-3">
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200">{log.message}</p>
                    {log.meta && <p className="text-xs text-slate-500 truncate">{JSON.stringify(log.meta)}</p>}
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">{formatTime(log.timestamp)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

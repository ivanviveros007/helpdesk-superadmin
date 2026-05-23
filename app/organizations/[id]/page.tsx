"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useOrganization, useUpdateOrg } from "@/hooks/useOrganizations";
import apiClient from "@/lib/api-client";

export default function OrgDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: org, isLoading } = useOrganization(id);
  const { mutate: updateOrg, isPending } = useUpdateOrg();
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminForm, setAdminForm] = useState({ nombre: "", email: "", password: "" });
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState(false);

  const handleToggleStatus = () => {
    if (!org) return;
    updateOrg({ id: org.id, estado_activo: !org.estado_activo });
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    try {
      await apiClient.post(`/super-admin/organizations/${id}/admin`, adminForm);
      setAdminSuccess(true);
      setShowAdminForm(false);
      setAdminForm({ nombre: "", email: "", password: "" });
    } catch (err: any) {
      setAdminError(err?.response?.data?.message ?? "Error al crear admin");
    }
  };

  const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500";

  if (isLoading) return <div className="text-slate-400">Cargando...</div>;
  if (!org) return <div className="text-slate-400">Organización no encontrada</div>;

  const stats = [
    { label: "Tickets totales", value: org.stats.total_tickets },
    { label: "Tickets abiertos", value: org.stats.tickets_abiertos },
    { label: "Tickets resueltos", value: org.stats.tickets_resueltos },
    { label: "Tickets este mes", value: org.stats.tickets_este_mes },
    { label: "Técnicos", value: org.stats.total_tecnicos },
    { label: "Usuarios", value: org.stats.total_usuarios },
    { label: "Tiempo resol. promedio", value: org.stats.avg_resolution_hours ? `${org.stats.avg_resolution_hours}h` : "—" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{org.nombre}</h1>
          <p className="text-sm text-slate-400">slug: {org.slug} · plan: {org.plan}</p>
        </div>
        <button onClick={handleToggleStatus} disabled={isPending}
          className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 ${org.estado_activo ? "bg-red-900/40 text-red-400 hover:bg-red-900/60" : "bg-green-900/40 text-green-400 hover:bg-green-900/60"}`}>
          {isPending ? "..." : org.estado_activo ? "Suspender org" : "Activar org"}
        </button>
        <button onClick={() => setShowAdminForm(!showAdminForm)}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500">
          <UserPlus className="h-4 w-4" /> Nuevo admin
        </button>
      </div>

      {showAdminForm && (
        <form onSubmit={handleCreateAdmin} className="rounded-xl border border-slate-700 bg-slate-900 p-5 flex flex-col gap-3">
          <h2 className="font-semibold text-white text-sm">Crear admin para {org.nombre}</h2>
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Nombre" value={adminForm.nombre} onChange={(e) => setAdminForm({ ...adminForm, nombre: e.target.value })} required className={inputCls} />
            <input placeholder="Email" type="email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} required className={inputCls} />
            <input placeholder="Contraseña" type="password" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} required className={inputCls} />
          </div>
          {adminError && <p className="text-sm text-red-400">{adminError}</p>}
          {adminSuccess && <p className="text-sm text-green-400">Admin creado exitosamente.</p>}
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500">Crear admin</button>
            <button type="button" onClick={() => setShowAdminForm(false)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800">Cancelar</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

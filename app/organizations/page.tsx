"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Plus, ChevronRight } from "lucide-react";
import { useOrganizations, useCreateOrg } from "@/hooks/useOrganizations";

export default function OrganizationsPage() {
  const { data: orgs = [], isLoading } = useOrganizations();
  const { mutate: createOrg, isPending } = useCreateOrg();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: "", slug: "", plan: "trial", company_type: "", admin_nombre: "", admin_email: "", admin_password: "" });
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createOrg(form, {
      onSuccess: () => { setShowForm(false); setForm({ nombre: "", slug: "", plan: "trial", company_type: "", admin_nombre: "", admin_email: "", admin_password: "" }); },
      onError: (err: any) => setError(err?.response?.data?.message ?? "Error al crear la organización"),
    });
  };

  const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Organizaciones</h1>
          <p className="text-sm text-slate-400">{orgs.length} empresa{orgs.length !== 1 ? "s" : ""} registrada{orgs.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500">
          <Plus className="h-4 w-4" /> Nueva org
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border border-slate-700 bg-slate-900 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-white">Nueva organización</h2>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Nombre de la empresa" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required className={inputCls} />
            <input placeholder="Slug (ej: acme)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s/g, "-") })} required className={inputCls} />
            <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className={inputCls}>
              <option value="trial">Trial</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <select value={form.company_type} onChange={(e) => setForm({ ...form, company_type: e.target.value })} className={inputCls}>
              <option value="">Tipo de empresa (opcional)</option>
              <option value="tech_saas">Tech SaaS</option>
              <option value="ecommerce">E-commerce</option>
              <option value="healthcare">Healthcare</option>
              <option value="retail">Retail</option>
              <option value="it_services">IT Services / MSP</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Admin inicial</p>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Nombre del admin" value={form.admin_nombre} onChange={(e) => setForm({ ...form, admin_nombre: e.target.value })} required className={inputCls} />
            <input placeholder="Email del admin" type="email" value={form.admin_email} onChange={(e) => setForm({ ...form, admin_email: e.target.value })} required className={inputCls} />
            <input placeholder="Contraseña (mín. 8)" type="password" value={form.admin_password} onChange={(e) => setForm({ ...form, admin_password: e.target.value })} required className={inputCls} />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50">
              {isPending ? "Creando..." : "Crear"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800">Cancelar</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-slate-400">Cargando...</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full">
            <thead className="border-b border-slate-800 bg-slate-900">
              <tr>
                {["Organización", "Plan", "Tickets/mes", "Técnicos", "Usuarios", "Resol. promedio", "Estado", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/50">
              {orgs.map((org) => (
                <tr key={org.id} className="hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-white">{org.nombre}</p>
                      <p className="text-xs text-slate-500">{org.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300 capitalize">{org.plan}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{org.stats.tickets_este_mes}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{org.stats.total_tecnicos}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{org.stats.total_usuarios}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{org.stats.avg_resolution_hours ? `${org.stats.avg_resolution_hours}h` : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${org.estado_activo ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>
                      {org.estado_activo ? "Activa" : "Suspendida"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/organizations/${org.id}`} className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300">
                      Ver <ChevronRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Bot, Users, ShieldCheck, User, PowerOff, Power, Trash2, UserPlus, Pencil, X } from "lucide-react";
import { useOrganization, useUpdateOrg, useUpdateAiConfig } from "@/hooks/useOrganizations";
import { useOrgMembers, useToggleMemberStatus, useDeleteMember, useUpdateTechnician } from "@/hooks/useOrgMembers";
import apiClient from "@/lib/api-client";

const COMPANY_TYPE_OPTIONS = [
  { value: "", label: "Sin configurar" },
  { value: "tech_saas", label: "Tech SaaS" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "healthcare", label: "Healthcare" },
  { value: "retail", label: "Retail" },
  { value: "it_services", label: "IT Services / MSP" },
  { value: "other", label: "Otro" },
];

type EditForm = { memberId: string; nombre: string; email: string; password: string };

export default function OrgDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: org, isLoading } = useOrganization(id);
  const { mutate: updateOrg, isPending } = useUpdateOrg();
  const { mutate: updateAiConfig, isPending: isSavingAi } = useUpdateAiConfig();

  const { data: members, isLoading: isLoadingMembers } = useOrgMembers(id);
  const { mutate: toggleMember } = useToggleMemberStatus(id);
  const { mutate: deleteMember } = useDeleteMember(id);
  const { mutate: updateTechnician, isPending: isSavingMember } = useUpdateTechnician(id);

  // New admin form (inside Members section)
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminForm, setAdminForm] = useState({ nombre: "", email: "", password: "" });
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState(false);

  // Edit technician form (inline per row)
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // AI config form
  const [aiForm, setAiForm] = useState<{ company_type: string; ai_custom_instructions: string } | null>(null);
  const [aiSuccess, setAiSuccess] = useState(false);

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
      setAdminForm({ nombre: "", email: "", password: "" });
      setTimeout(() => { setShowAdminForm(false); setAdminSuccess(false); }, 1200);
    } catch (err: any) {
      setAdminError(err?.response?.data?.message ?? "Error al crear admin");
    }
  };

  const handleOpenEdit = (m: { id: string; nombre: string; email: string }) => {
    setEditForm({ memberId: m.id, nombre: m.nombre, email: m.email, password: "" });
    setEditError(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    setEditError(null);
    const payload: Record<string, string> = {};
    if (editForm.nombre) payload.nombre = editForm.nombre;
    if (editForm.email) payload.email = editForm.email;
    if (editForm.password) payload.password = editForm.password;
    updateTechnician(
      { memberId: editForm.memberId, ...payload },
      {
        onSuccess: () => setEditForm(null),
        onError: (err: any) => setEditError(err?.response?.data?.message ?? "Error al guardar"),
      }
    );
  };

  const handleOpenAiForm = () => {
    if (!org) return;
    setAiForm({ company_type: org.company_type ?? "", ai_custom_instructions: org.ai_custom_instructions ?? "" });
    setAiSuccess(false);
  };

  const handleSaveAiConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiForm) return;
    updateAiConfig(
      { id, ...aiForm },
      { onSuccess: () => { setAiSuccess(true); setTimeout(() => { setAiForm(null); setAiSuccess(false); }, 1200); } }
    );
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

  const companyTypeLabel = COMPANY_TYPE_OPTIONS.find((o) => o.value === org.company_type)?.label ?? "Sin configurar";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Members */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-violet-400" />
            <h2 className="font-semibold text-white">Miembros</h2>
            {isLoadingMembers && <span className="text-xs text-slate-500">Cargando...</span>}
          </div>
          <button
            onClick={() => { setShowAdminForm(!showAdminForm); setAdminError(null); setAdminSuccess(false); }}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500"
          >
            <UserPlus className="h-3.5 w-3.5" /> Nuevo admin
          </button>
        </div>

        {/* New admin form */}
        {showAdminForm && (
          <form onSubmit={handleCreateAdmin} className="mb-4 rounded-lg border border-slate-600 bg-slate-800 p-4 flex flex-col gap-3">
            <p className="text-xs font-medium text-slate-300">Crear nuevo admin para {org.nombre}</p>
            <div className="grid grid-cols-3 gap-3">
              <input placeholder="Nombre" value={adminForm.nombre} onChange={(e) => setAdminForm({ ...adminForm, nombre: e.target.value })} required className={inputCls} />
              <input placeholder="Email" type="email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} required className={inputCls} />
              <input placeholder="Contraseña" type="password" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} required className={inputCls} />
            </div>
            {adminError && <p className="text-xs text-red-400">{adminError}</p>}
            {adminSuccess && <p className="text-xs text-green-400">Admin creado exitosamente.</p>}
            <div className="flex gap-2">
              <button type="submit" className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500">Crear admin</button>
              <button type="button" onClick={() => setShowAdminForm(false)} className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-700">Cancelar</button>
            </div>
          </form>
        )}

        {members && (members.technicians.length > 0 || members.users.length > 0) ? (
          <div className="flex flex-col gap-4">
            {/* Technicians & Admins */}
            {members.technicians.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Técnicos & Admins</p>
                <div className="flex flex-col gap-1">
                  {members.technicians.map((m) => (
                    <div key={m.id}>
                      <div className="flex items-center gap-3 rounded-lg bg-slate-800 px-3 py-2">
                        <ShieldCheck className={`h-4 w-4 shrink-0 ${m.role === "admin" ? "text-violet-400" : "text-slate-400"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{m.nombre}</p>
                          <p className="text-xs text-slate-400 truncate">{m.email}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${m.role === "admin" ? "bg-violet-900/40 text-violet-300" : "bg-slate-700 text-slate-300"}`}>
                          {m.role}
                        </span>
                        <span className={`h-2 w-2 shrink-0 rounded-full ${m.estado_activo ? "bg-green-500" : "bg-slate-600"}`} />
                        <button
                          onClick={() => editForm?.memberId === m.id ? setEditForm(null) : handleOpenEdit(m)}
                          title="Editar"
                          className={`shrink-0 transition-colors ${editForm?.memberId === m.id ? "text-violet-400" : "text-slate-500 hover:text-violet-400"}`}
                        >
                          {editForm?.memberId === m.id ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => toggleMember({ type: "technician", memberId: m.id })}
                          title={m.estado_activo ? "Suspender" : "Activar"}
                          className={`shrink-0 transition-colors ${m.estado_activo ? "text-slate-500 hover:text-yellow-400" : "text-slate-500 hover:text-green-400"}`}
                        >
                          {m.estado_activo ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Inline edit form */}
                      {editForm?.memberId === m.id && (
                        <form onSubmit={handleSaveEdit} className="mt-1 rounded-lg border border-slate-600 bg-slate-800 p-3 flex flex-col gap-3">
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="mb-1 block text-xs text-slate-400">Nombre</label>
                              <input value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs text-slate-400">Email</label>
                              <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs text-slate-400">Nueva contraseña (opcional)</label>
                              <input type="password" placeholder="Sin cambios" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} className={inputCls} />
                            </div>
                          </div>
                          {editError && <p className="text-xs text-red-400">{editError}</p>}
                          <div className="flex gap-2">
                            <button type="submit" disabled={isSavingMember}
                              className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-50">
                              {isSavingMember ? "Guardando..." : "Guardar cambios"}
                            </button>
                            <button type="button" onClick={() => setEditForm(null)}
                              className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-700">
                              Cancelar
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users */}
            {members.users.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Usuarios</p>
                <div className="flex flex-col gap-1">
                  {members.users.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 rounded-lg bg-slate-800 px-3 py-2">
                      <User className="h-4 w-4 shrink-0 text-slate-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{m.nombre}</p>
                        <p className="text-xs text-slate-400 truncate">{m.email}</p>
                      </div>
                      <span className={`h-2 w-2 shrink-0 rounded-full ${m.estado_activo ? "bg-green-500" : "bg-slate-600"}`} />
                      <button
                        onClick={() => toggleMember({ type: "user", memberId: m.id })}
                        title={m.estado_activo ? "Suspender" : "Activar"}
                        className={`shrink-0 transition-colors ${m.estado_activo ? "text-slate-500 hover:text-yellow-400" : "text-slate-500 hover:text-green-400"}`}
                      >
                        {m.estado_activo ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => { if (window.confirm(`¿Eliminar a ${m.nombre}?`)) deleteMember({ memberId: m.id }); }}
                        title="Eliminar"
                        className="shrink-0 text-slate-500 transition-colors hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          !isLoadingMembers && <p className="text-sm italic text-slate-500">Sin miembros aún.</p>
        )}
      </div>

      {/* AI Configuration */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-violet-400" />
            <h2 className="font-semibold text-white">Configuración de IA</h2>
          </div>
          {aiForm === null && (
            <button onClick={handleOpenAiForm}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800">
              Editar
            </button>
          )}
        </div>

        {aiForm === null ? (
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 w-36">Tipo de empresa</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${org.company_type ? "bg-violet-900/40 text-violet-300" : "bg-slate-800 text-slate-500"}`}>
                {companyTypeLabel}
              </span>
            </div>
            <div className="flex gap-3">
              <span className="text-slate-400 w-36 shrink-0">Instrucciones custom</span>
              <span className="text-slate-300 text-xs leading-relaxed">
                {org.ai_custom_instructions || <span className="text-slate-600 italic">Sin instrucciones adicionales</span>}
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveAiConfig} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Tipo de empresa</label>
              <select value={aiForm.company_type} onChange={(e) => setAiForm({ ...aiForm, company_type: e.target.value })} className={inputCls}>
                {COMPANY_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">La IA usará el perfil de este sector para ajustar prioridades y categorización.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Instrucciones adicionales para la IA</label>
              <textarea
                value={aiForm.ai_custom_instructions}
                onChange={(e) => setAiForm({ ...aiForm, ai_custom_instructions: e.target.value })}
                placeholder={'Ej: "Tickets que mencionen error 500 deben tener prioridad máxima."'}
                rows={4}
                className={`${inputCls} resize-none`}
              />
              <p className="mt-1 text-xs text-slate-500">Estas instrucciones se inyectan directamente en el prompt del agente con máxima prioridad.</p>
            </div>
            {aiSuccess && <p className="text-sm text-green-400">Configuración guardada.</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={isSavingAi}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50">
                {isSavingAi ? "Guardando..." : "Guardar configuración"}
              </button>
              <button type="button" onClick={() => setAiForm(null)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800">
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

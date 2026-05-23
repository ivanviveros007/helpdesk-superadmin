export interface SuperAdminUser {
  id: string;
  nombre: string;
  email: string;
  role: "superadmin";
}

export interface OrgStats {
  total_tickets: number;
  tickets_abiertos: number;
  tickets_resueltos: number;
  avg_resolution_hours: string | null;
  total_tecnicos: number;
  total_usuarios: number;
  tickets_este_mes: number;
}

export interface Organization {
  id: string;
  nombre: string;
  slug: string;
  plan: string;
  estado_activo: boolean;
  created_at: string;
  stats: OrgStats;
}

export interface GlobalMetrics {
  total_orgs: number;
  orgs_activas: number;
  total_tickets_all_time: number;
  tickets_hoy: number;
  tickets_este_mes: number;
  avg_resolution_hours: string | null;
  orgs_con_tickets_este_mes: number;
}

export interface LogEntry {
  type: "ticket_created" | "user_registered" | "org_created" | "ai_error";
  message: string;
  timestamp: string;
  meta?: Record<string, string>;
}

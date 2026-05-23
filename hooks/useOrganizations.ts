"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { Organization } from "@/types";

export function useOrganizations() {
  return useQuery<Organization[]>({
    queryKey: ["organizations"],
    queryFn: async () => (await apiClient.get<Organization[]>("/super-admin/organizations")).data,
  });
}

export function useOrganization(id: string) {
  return useQuery<Organization>({
    queryKey: ["organizations", id],
    queryFn: async () => (await apiClient.get<Organization>(`/super-admin/organizations/${id}`)).data,
    enabled: !!id,
  });
}

export function useCreateOrg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { nombre: string; slug: string; plan?: string; admin_nombre: string; admin_email: string; admin_password: string }) =>
      (await apiClient.post<Organization>("/super-admin/organizations", payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["organizations"] }),
  });
}

export function useUpdateOrg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; nombre?: string; plan?: string; estado_activo?: boolean }) =>
      (await apiClient.patch<Organization>(`/super-admin/organizations/${id}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["organizations"] }),
  });
}

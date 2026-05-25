"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface OrgMember {
  id: string;
  nombre: string;
  email: string;
  role: string;
  estado_activo: boolean;
  created_at: string;
}

export interface OrgMembers {
  technicians: OrgMember[];
  users: OrgMember[];
}

export function useOrgMembers(orgId: string) {
  return useQuery<OrgMembers>({
    queryKey: ["org-members", orgId],
    queryFn: async () =>
      (await apiClient.get<OrgMembers>(`/super-admin/organizations/${orgId}/members`)).data,
    enabled: !!orgId,
  });
}

export function useToggleMemberStatus(orgId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, { type: "technician" | "user"; memberId: string }>({
    mutationFn: async ({ type, memberId }) => {
      await apiClient.patch(
        `/super-admin/organizations/${orgId}/members/${type}/${memberId}/toggle-status`
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org-members", orgId] }),
  });
}

export function useDeleteMember(orgId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, { memberId: string }>({
    mutationFn: async ({ memberId }) => {
      await apiClient.delete(`/super-admin/organizations/${orgId}/members/users/${memberId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org-members", orgId] }),
  });
}

export function useUpdateTechnician(orgId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, { memberId: string; nombre?: string; email?: string; password?: string }>({
    mutationFn: async ({ memberId, ...data }) => {
      await apiClient.patch(`/super-admin/organizations/${orgId}/members/technicians/${memberId}`, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org-members", orgId] }),
  });
}

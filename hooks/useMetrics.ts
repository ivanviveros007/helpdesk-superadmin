"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { GlobalMetrics, LogEntry } from "@/types";

export function useGlobalMetrics() {
  return useQuery<GlobalMetrics>({
    queryKey: ["metrics"],
    queryFn: async () => (await apiClient.get<GlobalMetrics>("/super-admin/metrics")).data,
    refetchInterval: 30000,
  });
}

export function useLogs() {
  return useQuery<LogEntry[]>({
    queryKey: ["logs"],
    queryFn: async () => (await apiClient.get<LogEntry[]>("/super-admin/logs")).data,
    refetchInterval: 15000,
  });
}

"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import apiClient from "@/lib/api-client";
import type { SuperAdminUser } from "@/types";

interface AuthContextValue {
  user: SuperAdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SuperAdminUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("sa_user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.post<{ access_token: string; user: SuperAdminUser }>(
        "/super-admin/auth/login", { email, password }
      );
      localStorage.setItem("sa_token", data.access_token);
      localStorage.setItem("sa_user", JSON.stringify(data.user));
      setUser(data.user);
      window.location.href = "/dashboard";
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("sa_token");
    localStorage.removeItem("sa_user");
    setUser(null);
    window.location.href = "/login";
  }, []);

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

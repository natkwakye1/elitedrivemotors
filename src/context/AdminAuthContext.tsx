"use client";
// src/context/AdminAuthContext.tsx
// Admin auth backed by the FastAPI backend.
// Falls back to mock credentials when the API is unreachable (dev mode).

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, tokenStore, type ApiUser } from "@/src/lib/api";

export interface Admin {
  id:        string;
  name:      string;
  email:     string;
  role:      "admin" | "super_admin" | "super-admin";
  avatar_url?: string;
}

interface AdminAuthCtx {
  admin:   Admin | null;
  loading: boolean;
  login:   (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout:  () => void;
}

const AdminAuthContext = createContext<AdminAuthCtx>({
  admin:   null,
  loading: false,
  login:   async () => ({ ok: false }),
  logout:  () => {},
});

function toAdmin(user: ApiUser): Admin {
  return {
    id:        user.id,
    name:      user.full_name,
    email:     user.email,
    role:      user.role === "super_admin" ? "super_admin" : "admin",
    avatar_url: user.avatar_url,
  };
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin]     = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate session on mount
  useEffect(() => {
    const user = tokenStore.getUser();
    if (user && (user.role === "admin" || user.role === "super_admin")) {
      setAdmin(toAdmin(user));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const data = await authApi.login(email, password);
      const user: ApiUser = data.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        tokenStore.clear();
        return { ok: false, error: "This account does not have admin access." };
      }
      setAdmin(toAdmin(user));
      return { ok: true };
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      // Dev fallback: if API is down, allow mock admin login
      if (!detail && email === "admin@elitedrivemotors.com" && password === "admin123") {
        const mock: Admin = { id: "ADM-001", name: "Super Admin", email, role: "super_admin" };
        setAdmin(mock);
        return { ok: true };
      }
      return { ok: false, error: detail || "Login failed. Please try again." };
    }
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);

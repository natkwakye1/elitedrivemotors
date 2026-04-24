"use client";
// src/context/CustomerAuthContext.tsx
// Customer auth backed by the FastAPI backend.
// Falls back to mock credentials when the API is unreachable (dev mode).

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, tokenStore, type ApiUser } from "@/src/lib/api";

export interface Customer {
  id:        string;
  name:      string;
  email:     string;
  phone:     string;
  avatar:    string;
  plan:      "Standard" | "Pro";
  joined:    string;
  role:      string;
  wallet_balance: number;
  avatar_url?: string;
}

// ── Dev fallback customers (used when API is unreachable) ─────────────────────
export const MOCK_CUSTOMERS = [
  { id:"CUS-001", name:"Kwame Asante",  email:"kwame@gmail.com",  phone:"+233 24 111 2233", avatar:"KA", plan:"Pro"      as const, joined:"Jan 2024" },
  { id:"CUS-002", name:"Abena Osei",    email:"abena@gmail.com",  phone:"+233 20 444 5566", avatar:"AO", plan:"Standard" as const, joined:"Mar 2024" },
  { id:"CUS-003", name:"Kofi Mensah",   email:"kofi@gmail.com",   phone:"+233 27 777 8899", avatar:"KM", plan:"Standard" as const, joined:"Jun 2024" },
];

interface AuthCtx {
  customer:  Customer | null;
  loading:   boolean;
  login:     (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout:    () => void;
  refresh:   () => Promise<void>;
}

const CustomerAuthContext = createContext<AuthCtx>({
  customer: null,
  loading:  false,
  login:    async () => ({ ok: false }),
  logout:   () => {},
  refresh:  async () => {},
});

function apiUserToCustomer(user: ApiUser): Customer {
  const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();
  return {
    id:             user.id,
    name:           user.full_name,
    email:          user.email,
    phone:          user.phone || "",
    avatar:         initials || "?",
    avatar_url:     user.avatar_url,
    plan:           "Standard",           // extend with subscription tier later
    joined:         new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    role:           user.role,
    wallet_balance: user.wallet_balance ?? 0,
  };
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading]   = useState(true);

  // Rehydrate session on mount
  useEffect(() => {
    const user = tokenStore.getUser();
    if (user && user.role === "customer") {
      setCustomer(apiUserToCustomer(user));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const data = await authApi.login(email, password);
      const user: ApiUser = data.user;
      if (user.role !== "customer") {
        tokenStore.clear();
        return { ok: false, error: "This account is not a customer account." };
      }
      setCustomer(apiUserToCustomer(user));
      return { ok: true };
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      // Dev fallback: if API is down, allow mock customer login
      if (!detail && password === "password123") {
        const found = MOCK_CUSTOMERS.find(c => c.email.toLowerCase() === email.toLowerCase());
        if (found) {
          setCustomer({ ...found, role: "customer", wallet_balance: 0 });
          return { ok: true };
        }
      }
      return { ok: false, error: detail || "Login failed. Please try again." };
    }
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    setCustomer(null);
  };

  const refresh = async () => {
    try {
      const user = await authApi.getMe();
      tokenStore.setUser(user);
      if (user.role === "customer") setCustomer(apiUserToCustomer(user));
    } catch {}
  };

  return (
    <CustomerAuthContext.Provider value={{ customer, loading, login, logout, refresh }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export const useCustomerAuth = () => useContext(CustomerAuthContext);

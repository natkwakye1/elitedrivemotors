"use client";
// src/context/SaasContext.tsx
// Multi-tenant SaaS context: company creation, user management, role/permission control.
// All data is persisted to localStorage for the demo; swap storage calls for real API in prod.

import React, {
  createContext, useContext, useState, useEffect, useCallback, ReactNode,
} from "react";
import {
  Company, CompanyUser, LeaveRequest, CompanyRole, PermissionKey,
  CompanyCar, ServiceType, CarStatus,
  SAAS_STORAGE, DEFAULT_ROLE_PERMISSIONS, PlanTier, PLANS,
} from "@/src/lib/saas-types";

// ── Simple demo password hash (SHA-256 via Web Crypto) ────────────────────────
async function hashPassword(pw: string): Promise<string> {
  if (typeof window === "undefined") return pw;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) || "company";
}

function buildEmail(firstName: string, slug: string): string {
  return `${firstName.toLowerCase().replace(/\s+/g, "")}@${slug}.com`;
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function avatarInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  "#2563eb","#7c3aed","#db2777","#ea580c","#16a34a","#0891b2","#9333ea",
];
function randomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

// ── Storage helpers ───────────────────────────────────────────────────────────
function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
}
function writeLS(key: string, value: unknown) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value));
}

// ── Context types ─────────────────────────────────────────────────────────────
interface SaasCtx {
  // Auth
  currentUser:    CompanyUser | null;
  currentCompany: Company | null;
  loading:        boolean;

  // Company
  createCompany:  (payload: Omit<Company, "id" | "createdAt" | "ownerId" | "slug" | "onboardingComplete"> & { ownerName: string; ownerPassword: string }) => Promise<{ ok: boolean; company?: Company; user?: CompanyUser; error?: string }>;
  updateCompany:  (updates: Partial<Company>) => void;

  // Session
  saasLogin:      (email: string, password: string) => Promise<{ ok: boolean; error?: string; redirect?: string }>;
  saasLogout:     () => void;

  // Users
  allUsers:       CompanyUser[];
  addUser:        (payload: { name: string; role: CompanyRole; position?: string; phone?: string }) => Promise<{ ok: boolean; user?: CompanyUser; error?: string }>;
  updateUser:     (id: string, updates: Partial<CompanyUser>) => void;
  removeUser:     (id: string) => void;
  grantPermission:(userId: string, perm: PermissionKey) => void;
  revokePermission:(userId: string, perm: PermissionKey) => void;
  setUserRole:    (userId: string, role: CompanyRole) => void;

  // Permissions check
  can:            (perm: PermissionKey) => boolean;

  // Block / unblock / reset
  blockUser:        (id: string) => void;
  unblockUser:      (id: string) => void;
  resetCredentials: (id: string) => Promise<{ email: string; tempPassword: string }>;

  // Company cars
  companyCars: CompanyCar[];
  addCar:      (payload: Omit<CompanyCar, "id" | "companyId" | "createdAt">) => CompanyCar;
  updateCar:   (id: string, updates: Partial<CompanyCar>) => void;
  removeCar:   (id: string) => void;

  // Leaves
  leaves:         LeaveRequest[];
  submitLeave:    (payload: Omit<LeaveRequest, "id" | "employeeId" | "employeeName" | "companyId" | "status" | "createdAt">) => void;
  reviewLeave:    (id: string, action: "approved" | "rejected", note?: string) => void;
}

const SaasContext = createContext<SaasCtx>({} as SaasCtx);

export function SaasProvider({ children }: { children: ReactNode }) {
  const [currentUser,    setCurrentUser]    = useState<CompanyUser | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [allUsers,       setAllUsers]       = useState<CompanyUser[]>([]);
  const [leaves,         setLeaves]         = useState<LeaveRequest[]>([]);
  const [companyCars,    setCompanyCars]    = useState<CompanyCar[]>([]);

  // Rehydrate session
  useEffect(() => {
    const user    = readLS<CompanyUser | null>(SAAS_STORAGE.currentUser, null);
    const company = readLS<Company | null>(SAAS_STORAGE.currentCompany, null);
    if (user && company) {
      setCurrentUser(user);
      setCurrentCompany(company);
      const allU = readLS<CompanyUser[]>(SAAS_STORAGE.users, []);
      setAllUsers(allU.filter(u => u.companyId === company.id));
      setLeaves(readLS<LeaveRequest[]>(SAAS_STORAGE.leaves, []).filter(l => l.companyId === company.id));
      setCompanyCars(readLS<CompanyCar[]>(SAAS_STORAGE.cars, []).filter(c => c.companyId === company.id));
    }
    setLoading(false);
  }, []);

  // Create a new company + owner admin account
  const createCompany = useCallback(async (payload: {
    name: string; industry: string; size: number; plan: PlanTier;
    address?: string; phone?: string; website?: string;
    logoDataUrl?: string; primaryColor?: string;
    ownerName: string; ownerPassword: string;
  }) => {
    const slug = slugify(payload.name);
    const allCompanies = readLS<Company[]>(SAAS_STORAGE.companies, []);
    if (allCompanies.some(c => c.slug === slug)) {
      return { ok: false, error: "A company with that name already exists. Please choose a different name." };
    }

    const companyId = generateId("CMP");
    const ownerId   = generateId("USR");
    const hash      = await hashPassword(payload.ownerPassword);

    const company: Company = {
      id: companyId, name: payload.name, slug, industry: payload.industry,
      size: payload.size, plan: payload.plan,
      address: payload.address, phone: payload.phone, website: payload.website,
      logoDataUrl: payload.logoDataUrl, primaryColor: payload.primaryColor || "#2563eb",
      ownerId, createdAt: new Date().toISOString(), onboardingComplete: false,
    };

    const firstName = payload.ownerName.split(" ")[0];
    const ownerUser: CompanyUser = {
      id: ownerId, companyId, companySlug: slug,
      name: payload.ownerName,
      email: buildEmail(firstName, slug),
      passwordHash: hash,
      role: "owner",
      permissions: [...DEFAULT_ROLE_PERMISSIONS.owner],
      avatar: avatarInitials(payload.ownerName),
      avatarColor: randomColor(),
      status: "active",
      createdAt: new Date().toISOString(),
    };

    const companies = [...allCompanies, company];
    const users     = [...readLS<CompanyUser[]>(SAAS_STORAGE.users, []), ownerUser];
    writeLS(SAAS_STORAGE.companies, companies);
    writeLS(SAAS_STORAGE.users, users);
    writeLS(SAAS_STORAGE.currentUser, ownerUser);
    writeLS(SAAS_STORAGE.currentCompany, company);

    setCurrentUser(ownerUser);
    setCurrentCompany(company);
    setAllUsers([ownerUser]);
    return { ok: true, company, user: ownerUser };
  }, []);

  const updateCompany = useCallback((updates: Partial<Company>) => {
    setCurrentCompany(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      const companies = readLS<Company[]>(SAAS_STORAGE.companies, []);
      writeLS(SAAS_STORAGE.companies, companies.map(c => c.id === updated.id ? updated : c));
      writeLS(SAAS_STORAGE.currentCompany, updated);
      return updated;
    });
  }, []);

  // Login: matches any company user email + password
  const saasLogin = useCallback(async (email: string, password: string) => {
    const users = readLS<CompanyUser[]>(SAAS_STORAGE.users, []);
    const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { ok: false, error: "No account found with that email." };
    if (user.status !== "active") return { ok: false, error: "Your account is inactive. Contact your company admin." };

    const hash = await hashPassword(password);
    if (user.passwordHash !== hash) return { ok: false, error: "Incorrect password." };

    const companies = readLS<Company[]>(SAAS_STORAGE.companies, []);
    const company   = companies.find(c => c.id === user.companyId);
    if (!company) return { ok: false, error: "Company not found." };

    // Update last login
    const updated = { ...user, lastLogin: new Date().toISOString() };
    writeLS(SAAS_STORAGE.users, users.map(u => u.id === updated.id ? updated : u));
    writeLS(SAAS_STORAGE.currentUser, updated);
    writeLS(SAAS_STORAGE.currentCompany, company);

    setCurrentUser(updated);
    setCurrentCompany(company);
    const companyUsers = users.filter(u => u.companyId === company.id);
    setAllUsers(companyUsers);
    setLeaves(readLS<LeaveRequest[]>(SAAS_STORAGE.leaves, []).filter(l => l.companyId === company.id));

    // Route by role
    const roleRoutes: Record<CompanyRole, string> = {
      owner:    "/company/portal/admin",
      admin:    "/company/portal/admin",
      finance:  "/company/portal/finance",
      employee: "/company/portal/employee",
    };
    return { ok: true, redirect: roleRoutes[user.role] };
  }, []);

  const saasLogout = useCallback(() => {
    localStorage.removeItem(SAAS_STORAGE.currentUser);
    localStorage.removeItem(SAAS_STORAGE.currentCompany);
    setCurrentUser(null);
    setCurrentCompany(null);
    setAllUsers([]);
  }, []);

  // Add a new user to the current company
  const addUser = useCallback(async (payload: {
    name: string; role: CompanyRole; position?: string; phone?: string;
  }) => {
    if (!currentCompany) return { ok: false, error: "No active company." };

    // Check plan limits
    const plan = PLANS.find(p => p.tier === currentCompany.plan);
    const currentCount = allUsers.filter(u => u.status === "active").length;
    if (plan && currentCount >= plan.employeeLimit) {
      return { ok: false, error: `Your plan allows up to ${plan.employeeLimit} team members. Upgrade to add more.` };
    }

    const firstName = payload.name.split(" ")[0];
    const email     = buildEmail(firstName, currentCompany.slug);
    const tempPw    = `${payload.name.split(" ")[0].toLowerCase()}@${currentCompany.slug}`;
    const hash      = await hashPassword(tempPw);

    const newUser: CompanyUser = {
      id: generateId("USR"),
      companyId: currentCompany.id,
      companySlug: currentCompany.slug,
      name: payload.name,
      email,
      passwordHash: hash,
      role: payload.role,
      permissions: [...DEFAULT_ROLE_PERMISSIONS[payload.role]],
      avatar: avatarInitials(payload.name),
      avatarColor: randomColor(),
      status: "pending",
      position: payload.position,
      phone: payload.phone,
      createdAt: new Date().toISOString(),
    };

    const allU = readLS<CompanyUser[]>(SAAS_STORAGE.users, []);
    writeLS(SAAS_STORAGE.users, [...allU, newUser]);
    setAllUsers(prev => [...prev, newUser]);

    // In prod: trigger email/SMS here with credentials
    // sendInviteEmail({ to: email, name: payload.name, password: tempPw, company: currentCompany.name });

    return { ok: true, user: newUser };
  }, [currentCompany, allUsers]);

  const updateUser = useCallback((id: string, updates: Partial<CompanyUser>) => {
    const allU = readLS<CompanyUser[]>(SAAS_STORAGE.users, []);
    const updated = allU.map(u => u.id === id ? { ...u, ...updates } : u);
    writeLS(SAAS_STORAGE.users, updated);
    setAllUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser?.id === id) {
      const u = updated.find(u => u.id === id)!;
      setCurrentUser(u);
      writeLS(SAAS_STORAGE.currentUser, u);
    }
  }, [currentUser]);

  const removeUser = useCallback((id: string) => {
    const allU = readLS<CompanyUser[]>(SAAS_STORAGE.users, []).filter(u => u.id !== id);
    writeLS(SAAS_STORAGE.users, allU);
    setAllUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  const grantPermission = useCallback((userId: string, perm: PermissionKey) => {
    updateUser(userId, {
      permissions: [...(allUsers.find(u => u.id === userId)?.permissions ?? []).filter(p => p !== perm), perm],
    });
  }, [allUsers, updateUser]);

  const revokePermission = useCallback((userId: string, perm: PermissionKey) => {
    updateUser(userId, {
      permissions: (allUsers.find(u => u.id === userId)?.permissions ?? []).filter(p => p !== perm),
    });
  }, [allUsers, updateUser]);

  const setUserRole = useCallback((userId: string, role: CompanyRole) => {
    updateUser(userId, { role, permissions: [...DEFAULT_ROLE_PERMISSIONS[role]] });
  }, [updateUser]);

  const blockUser = useCallback((id: string) => {
    updateUser(id, { status: "inactive" });
  }, [updateUser]);

  const unblockUser = useCallback((id: string) => {
    updateUser(id, { status: "active" });
  }, [updateUser]);

  // ── Company cars ─────────────────────────────────────────────────────────────
  const addCar = useCallback((payload: Omit<CompanyCar, "id" | "companyId" | "createdAt">): CompanyCar => {
    if (!currentCompany) throw new Error("No active company");
    const car: CompanyCar = {
      ...payload,
      id: generateId("CAR"),
      companyId: currentCompany.id,
      createdAt: new Date().toISOString(),
    };
    const all = [...readLS<CompanyCar[]>(SAAS_STORAGE.cars, []), car];
    writeLS(SAAS_STORAGE.cars, all);
    setCompanyCars(prev => [...prev, car]);
    return car;
  }, [currentCompany]);

  const updateCar = useCallback((id: string, updates: Partial<CompanyCar>) => {
    const all = readLS<CompanyCar[]>(SAAS_STORAGE.cars, []).map(c => c.id === id ? { ...c, ...updates } : c);
    writeLS(SAAS_STORAGE.cars, all);
    setCompanyCars(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const removeCar = useCallback((id: string) => {
    const all = readLS<CompanyCar[]>(SAAS_STORAGE.cars, []).filter(c => c.id !== id);
    writeLS(SAAS_STORAGE.cars, all);
    setCompanyCars(prev => prev.filter(c => c.id !== id));
  }, []);

  const resetCredentials = useCallback(async (id: string): Promise<{ email: string; tempPassword: string }> => {
    const user = readLS<CompanyUser[]>(SAAS_STORAGE.users, []).find(u => u.id === id);
    if (!user || !currentCompany) return { email: "", tempPassword: "" };
    const rnd = Math.floor(1000 + Math.random() * 9000);
    const tempPw = `${user.name.split(" ")[0].toLowerCase()}${rnd}@${currentCompany.slug}`;
    const hash = await hashPassword(tempPw);
    updateUser(id, { passwordHash: hash });
    return { email: user.email, tempPassword: tempPw };
  }, [currentCompany, updateUser]);

  const can = useCallback((perm: PermissionKey): boolean => {
    if (!currentUser) return false;
    return currentUser.permissions.includes(perm);
  }, [currentUser]);

  // Leave management
  const submitLeave = useCallback((payload: Omit<LeaveRequest, "id" | "employeeId" | "employeeName" | "companyId" | "status" | "createdAt">) => {
    if (!currentUser || !currentCompany) return;
    if (!can("submit_leave")) return; // silently blocked if permission revoked
    const leave: LeaveRequest = {
      id: generateId("LVE"),
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      companyId: currentCompany.id,
      status: "pending",
      createdAt: new Date().toISOString(),
      ...payload,
    };
    const all = [...readLS<LeaveRequest[]>(SAAS_STORAGE.leaves, []), leave];
    writeLS(SAAS_STORAGE.leaves, all);
    setLeaves(prev => [...prev, leave]);
  }, [currentUser, currentCompany, can]);

  const reviewLeave = useCallback((id: string, action: "approved" | "rejected", note?: string) => {
    if (!can("approve_leave")) return;
    const all = readLS<LeaveRequest[]>(SAAS_STORAGE.leaves, []).map(l =>
      l.id === id ? { ...l, status: action, reviewedBy: currentUser?.name, reviewNote: note } : l
    );
    writeLS(SAAS_STORAGE.leaves, all);
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: action, reviewedBy: currentUser?.name, reviewNote: note } : l));
  }, [can, currentUser]);

  return (
    <SaasContext.Provider value={{
      currentUser, currentCompany, loading,
      createCompany, updateCompany,
      saasLogin, saasLogout,
      allUsers, addUser, updateUser, removeUser,
      grantPermission, revokePermission, setUserRole,
      can,
      blockUser, unblockUser, resetCredentials,
      companyCars, addCar, updateCar, removeCar,
      leaves, submitLeave, reviewLeave,
    }}>
      {children}
    </SaasContext.Provider>
  );
}

export const useSaas = () => useContext(SaasContext);

"use client";
// src/app/dashboard/layout.tsx
// Auth guard for all /dashboard/* pages.
// Redirects to /auth/login if not signed in as admin.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/src/context/AdminAuthContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { admin } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (admin === null) {
      router.replace("/auth/login");
    }
  }, [admin, router]);

  if (!admin) return null;

  return <>{children}</>;
}

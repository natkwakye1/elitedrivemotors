"use client";
// src/app/customer/layout.tsx
// Wraps all /customer/* pages. Provides auth context + customer shell.

import { CustomerAuthProvider } from "@/src/context/Customerauthcontext";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerAuthProvider>
      {children}
    </CustomerAuthProvider>
  );
}
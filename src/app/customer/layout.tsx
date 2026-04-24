"use client";
// src/app/customer/layout.tsx

import { Suspense } from "react";
import { CustomerAuthProvider } from "@/src/context/Customerauthcontext";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerAuthProvider>
      <Suspense fallback={null}>{children}</Suspense>
    </CustomerAuthProvider>
  );
}
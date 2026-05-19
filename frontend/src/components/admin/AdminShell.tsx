"use client";

import { AdminSubNav } from "@/components/admin/AdminSubNav";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <AdminSubNav />
      {children}
    </div>
  );
}

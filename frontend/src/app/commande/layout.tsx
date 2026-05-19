"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";

export default function CommandeLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowed={["admin", "commande"]} loginPath="/login?redirect=/commande">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">{children}</div>
    </RoleGuard>
  );
}

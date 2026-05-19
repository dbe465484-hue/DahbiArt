"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { StudioShell } from "@/components/studio/StudioShell";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowed={["admin", "artiste"]} loginPath="/login?redirect=/studio">
      <StudioShell>{children}</StudioShell>
    </RoleGuard>
  );
}

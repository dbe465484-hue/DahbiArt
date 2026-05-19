"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/api";
import { defaultHomeForRole } from "@/lib/roles";

type Props = {
  children: ReactNode;
  allowed: UserRole[];
  loginPath?: string;
};

export function RoleGuard({ children, allowed, loginPath = "/login" }: Props) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      router.replace(loginPath);
      return;
    }
    if (!allowed.includes(user.role)) {
      router.replace(defaultHomeForRole(user.role));
    }
  }, [isLoading, isAuthenticated, user, allowed, loginPath, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-stone-500">Chargement…</p>
      </div>
    );
  }

  if (!isAuthenticated || !user || !allowed.includes(user.role)) return null;

  return <>{children}</>;
}

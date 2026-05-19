"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { resolvePostLoginPath } from "@/lib/roles";

type Props = {
  redirectParam?: string;
};

/** Redirige un utilisateur déjà connecté (ex. page /login). */
export function AuthSessionRedirect({ redirectParam }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;
    const redirect = redirectParam ?? searchParams.get("redirect") ?? "/";
    router.replace(resolvePostLoginPath(user.role, redirect));
  }, [isLoading, isAuthenticated, user, redirectParam, searchParams, router]);

  return null;
}

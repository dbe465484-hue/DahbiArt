"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminUserForm, type UserFormInput } from "@/components/admin/AdminUserForm";
import { useAuth } from "@/context/AuthContext";
import { api, type UserRecord } from "@/lib/api";

export default function AdminEditUserPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getToken } = useAuth();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token || !id) return;
    api.admin.users
      .get(token, id)
      .then(setUser)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"));
  }, [getToken, id]);

  async function handleSubmit(data: UserFormInput) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");
    await api.admin.users.update(token, id, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      ...(data.password ? { password: data.password } : {}),
    });
    router.push("/admin/users");
  }

  if (error) {
    return <p className="text-red-800">{error}</p>;
  }

  if (!user) {
    return <p className="text-stone-500">Chargement…</p>;
  }

  return (
    <div>
      <Link
        href="/admin/users"
        className="text-sm text-stone-500 transition hover:text-amber-900"
      >
        ← Retour aux utilisateurs
      </Link>
      <h1 className="mt-4 font-serif text-3xl text-stone-900">Modifier l&apos;utilisateur</h1>
      <p className="mt-2 text-stone-600">
        {user.firstName} {user.lastName} — {user.email}
      </p>
      <div className="mt-10">
        <AdminUserForm
          initial={{
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
          }}
          passwordRequired={false}
          submitLabel="Enregistrer"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

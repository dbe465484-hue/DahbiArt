"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminUserForm, type UserFormInput } from "@/components/admin/AdminUserForm";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function AdminNewUserPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  async function handleSubmit(data: UserFormInput) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");
    await api.admin.users.create(token, data);
    router.push("/admin/users");
  }

  return (
    <div>
      <Link
        href="/admin/users"
        className="text-sm text-stone-500 transition hover:text-amber-900"
      >
        ← Retour aux utilisateurs
      </Link>
      <h1 className="mt-4 font-serif text-3xl text-stone-900">Nouvel utilisateur</h1>
      <p className="mt-2 text-stone-600">
        Créez un compte client, admin, artiste ou gestionnaire commandes.
      </p>
      <div className="mt-10">
        <AdminUserForm submitLabel="Créer l'utilisateur" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

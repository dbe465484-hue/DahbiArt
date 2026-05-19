"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { IconPlus } from "@/components/admin/AdminDashboardIcons";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminRowActionsMenu } from "@/components/admin/AdminRowActionsMenu";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAuth } from "@/context/AuthContext";
import { api, type UserRecord, type UserRole } from "@/lib/api";
import { defaultHomeForRole, roleLabel } from "@/lib/roles";

const ROLES: UserRole[] = ["customer", "admin", "artiste", "commande"];

const roleTone = (role: UserRole) => {
  switch (role) {
    case "admin":
      return "sky" as const;
    case "artiste":
      return "warning" as const;
    case "commande":
      return "success" as const;
    default:
      return "muted" as const;
  }
};

export function AdminUsersPageContent() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setUsers(await api.admin.users.list(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer l'utilisateur « ${name} » ?`)) return;
    const token = getToken();
    if (!token) return;
    setDeletingId(id);
    try {
      await api.admin.users.delete(token, id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRoleChange(id: string, role: UserRole) {
    const token = getToken();
    if (!token) return;
    setUpdatingId(id);
    try {
      const updated = await api.admin.users.updateRole(token, id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Utilisateurs"
        description="Gérez les comptes et les rôles d'accès (client, admin, artiste, commandes)."
        actions={
          <Link
            href="/admin/users/new"
            className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-amber-950"
          >
            <IconPlus />
            Ajouter un utilisateur
          </Link>
        }
      />

      {error && (
        <p className="mt-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <AdminDataTable
        rows={users}
        isLoading={loading}
        getRowKey={(u) => u.id}
        getSearchText={(u) => `${u.firstName} ${u.lastName} ${u.email} ${u.role}`}
        searchPlaceholder="Rechercher un utilisateur…"
        emptyMessage="Aucun utilisateur."
        tabs={[
          { id: "all", label: "Tous", match: () => true },
          { id: "customer", label: "Clients", match: (u) => u.role === "customer" },
          { id: "admin", label: "Admins", match: (u) => u.role === "admin" },
          { id: "artiste", label: "Artistes", match: (u) => u.role === "artiste" },
          { id: "commande", label: "Commandes", match: (u) => u.role === "commande" },
        ]}
        columns={[
          {
            id: "name",
            header: "Utilisateur",
            sortValue: (u) => `${u.lastName} ${u.firstName}`,
            cell: (u) => (
              <div>
                <p className="font-medium text-stone-900">
                  {u.firstName} {u.lastName}
                </p>
                <p className="text-xs text-stone-500">{u.email}</p>
              </div>
            ),
          },
          {
            id: "phone",
            header: "Téléphone",
            cell: (u) => u.phone ?? "—",
          },
          {
            id: "role",
            header: "Rôle",
            sortValue: (u) => u.role,
            cell: (u) => <AdminStatusBadge label={roleLabel(u.role)} tone={roleTone(u.role)} />,
          },
          {
            id: "actions",
            header: "",
            className: "w-12 text-right",
            cell: (u) => (
              <AdminRowActionsMenu
                editHref={`/admin/users/${u.id}/edit`}
                viewHref={
                  u.role === "customer"
                    ? undefined
                    : defaultHomeForRole(u.role)
                }
                statusMenuLabel="Changer le rôle"
                statusLoading={updatingId === u.id}
                statusOptions={ROLES.map((r) => ({
                  label: roleLabel(r),
                  active: u.role === r,
                  onSelect: () => handleRoleChange(u.id, r),
                }))}
                onDelete={() =>
                  handleDelete(u.id, `${u.firstName} ${u.lastName}`.trim())
                }
                deleteLoading={deletingId === u.id}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

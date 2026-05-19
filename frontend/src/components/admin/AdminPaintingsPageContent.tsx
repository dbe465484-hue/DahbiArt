"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IconCheck, IconPaintings, IconPlus, IconTag } from "@/components/admin/AdminDashboardIcons";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminKpiGrid, AdminKpiSkeleton } from "@/components/admin/AdminKpi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminRowActionsMenu } from "@/components/admin/AdminRowActionsMenu";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAuth } from "@/context/AuthContext";
import { api, type PaintingRecord } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
import { formatPrice } from "@/lib/paintings";
import { slugify } from "@/lib/slugify";

function IconImport() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 3v12M8 11l4 4 4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AdminPaintingsPageContent() {
  const { getToken } = useAuth();
  const [paintings, setPaintings] = useState<PaintingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [statusId, setStatusId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setPaintings(await api.admin.paintings.list(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(() => {
    const available = paintings.filter((p) => p.status === "available").length;
    const sold = paintings.filter((p) => p.status === "sold").length;
    const featured = paintings.filter((p) => p.featured).length;
    return { total: paintings.length, available, sold, featured };
  }, [paintings]);

  async function handleSyncCatalog() {
    const token = getToken();
    if (!token) return;
    setSyncing(true);
    setError(null);
    try {
      const result = await api.admin.paintings.syncCatalog(token);
      await load();
      if (result.created > 0) {
        alert(`${result.created} tableau(x) importé(s). Total : ${result.total}.`);
      } else {
        alert(`Catalogue complet : ${result.already} / ${result.total} en base.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSyncing(false);
    }
  }

  async function handleDuplicate(p: PaintingRecord) {
    const token = getToken();
    if (!token) return;
    setDuplicatingId(p.id);
    try {
      const { id: _id, slug: _slug, createdAt, updatedAt, ...data } = p;
      const copySlug = slugify(`${p.slug}-copie-${Date.now().toString(36).slice(-4)}`);
      const created = await api.admin.paintings.create(token, {
        ...data,
        title: `${p.title} (copie)`,
        slug: copySlug,
      });
      setPaintings((prev) => [created, ...prev]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setDuplicatingId(null);
    }
  }

  async function handleStatusChange(id: string, status: "available" | "sold") {
    const token = getToken();
    if (!token) return;
    setStatusId(id);
    try {
      const updated = await api.admin.paintings.update(token, id, { status });
      setPaintings((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setStatusId(null);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Supprimer « ${title} » ?`)) return;
    const token = getToken();
    if (!token) return;
    setDeletingId(id);
    try {
      await api.admin.paintings.delete(token, id);
      setPaintings((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setDeletingId(null);
    }
  }

  const kpiItems = [
    {
      label: "Total",
      value: summary.total,
      tone: "sky" as const,
      icon: <IconPaintings />,
      hint: "Œuvres en base",
    },
    {
      label: "Disponibles",
      value: summary.available,
      tone: "green" as const,
      icon: <IconCheck />,
      hint: "En vente",
    },
    {
      label: "Vendus",
      value: summary.sold,
      tone: "stone" as const,
      icon: <IconTag />,
      hint: "Hors catalogue actif",
    },
    {
      label: "En vedette",
      value: summary.featured,
      tone: "amber" as const,
      icon: <span className="text-sm leading-none">★</span>,
      hint: "Page d'accueil",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Peintures"
        description={
          <>
            {summary.total} tableau{summary.total !== 1 ? "x" : ""} au catalogue
            <span className="text-stone-400"> · </span>
            Gérez les œuvres, statuts et tirages
          </>
        }
        actions={
          <>
            <button
              type="button"
              disabled={syncing || loading}
              onClick={handleSyncCatalog}
              className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition hover:border-stone-300 hover:bg-stone-50 disabled:opacity-50"
            >
              <IconImport />
              {syncing ? "Import…" : "Importer catalogue"}
            </button>
            <Link
              href="/admin/paintings/new"
              className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-amber-950"
            >
              <IconPlus />
              Ajouter
            </Link>
          </>
        }
      />

      {error && (
        <p className="mt-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <section className="mt-8">
        <h2 className="sr-only">Statistiques du catalogue</h2>
        {loading && paintings.length === 0 ? (
          <AdminKpiSkeleton count={4} columns={4} />
        ) : (
          <AdminKpiGrid items={kpiItems} columns={4} />
        )}
      </section>

      <AdminDataTable
        rows={paintings}
        isLoading={loading}
        getRowKey={(p) => p.id}
        getSearchText={(p) =>
          `${p.title} ${p.slug} ${p.collection} ${p.subject} ${p.year} ${p.medium}`
        }
        searchPlaceholder="Rechercher un tableau, slug, collection…"
        emptyMessage="Aucun tableau. Ajoutez-en un ou importez le catalogue."
        tabs={[
          { id: "all", label: "Tous", match: () => true },
          { id: "available", label: "Disponibles", match: (p) => p.status === "available" },
          { id: "sold", label: "Vendus", match: (p) => p.status === "sold" },
          { id: "featured", label: "En vedette", match: (p) => !!p.featured },
        ]}
        columns={[
          {
            id: "image",
            header: "Œuvre",
            cell: (p) => (
              <Link
                href={`/admin/paintings/${p.id}/edit`}
                className="relative block h-16 w-16 overflow-hidden rounded-lg bg-stone-100 ring-1 ring-stone-200/80 transition hover:ring-sky-200"
              >
                <Image
                  src={resolveMediaUrl(p.image)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized
                />
              </Link>
            ),
          },
          {
            id: "title",
            header: "Titre",
            sortValue: (p) => p.title,
            cell: (p) => (
              <div className="min-w-[12rem]">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/paintings/${p.id}/edit`}
                    className="font-medium text-stone-900 hover:text-sky-800"
                  >
                    {p.title}
                  </Link>
                  {p.featured && (
                    <AdminStatusBadge label="Vedette" tone="warning" />
                  )}
                </div>
                <p className="mt-0.5 text-xs text-stone-500">{p.slug}</p>
                <p className="mt-1 text-xs text-stone-400">
                  {p.collection.replace(/-/g, " ")} · {p.year}
                </p>
              </div>
            ),
          },
          {
            id: "details",
            header: "Détails",
            sortValue: (p) => p.medium,
            cell: (p) => (
              <div className="text-sm text-stone-600">
                <p>{p.dimensions}</p>
                <p className="mt-0.5 text-xs text-stone-400">{p.medium}</p>
              </div>
            ),
          },
          {
            id: "price",
            header: "Prix",
            sortValue: (p) => p.price,
            className: "tabular-nums",
            cell: (p) =>
              p.price > 0 ? (
                <span className="font-medium text-stone-900">{formatPrice(p.price)}</span>
              ) : (
                <span className="text-stone-400">—</span>
              ),
          },
          {
            id: "status",
            header: "Statut",
            sortValue: (p) => p.status,
            cell: (p) => (
              <AdminStatusBadge
                label={p.status === "available" ? "Disponible" : "Vendu"}
                tone={p.status === "available" ? "success" : "muted"}
              />
            ),
          },
          {
            id: "actions",
            header: "",
            className: "w-12 text-right",
            cell: (p) => (
              <AdminRowActionsMenu
                viewHref={`/paintings/${p.slug}`}
                editHref={`/admin/paintings/${p.id}/edit`}
                onDuplicate={() => handleDuplicate(p)}
                duplicateLoading={duplicatingId === p.id}
                statusLoading={statusId === p.id}
                statusOptions={[
                  {
                    label: "Disponible",
                    active: p.status === "available",
                    onSelect: () => handleStatusChange(p.id, "available"),
                  },
                  {
                    label: "Vendu",
                    active: p.status === "sold",
                    onSelect: () => handleStatusChange(p.id, "sold"),
                  },
                ]}
                onDelete={() => handleDelete(p.id, p.title)}
                deleteLoading={deletingId === p.id}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

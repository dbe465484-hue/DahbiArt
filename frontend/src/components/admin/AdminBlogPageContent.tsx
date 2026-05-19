"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IconArticle, IconCheck, IconPlus } from "@/components/admin/AdminDashboardIcons";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminKpiGrid, AdminKpiSkeleton } from "@/components/admin/AdminKpi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminRowActionsMenu } from "@/components/admin/AdminRowActionsMenu";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAuth } from "@/context/AuthContext";
import { api, type BlogPostRecord } from "@/lib/api";
import { formatFrenchDate } from "@/lib/format-date";
import { resolveMediaUrl } from "@/lib/media";
import { slugify } from "@/lib/slugify";

type Props = { mode?: "admin" | "studio" };

export function AdminBlogPageContent({ mode = "admin" }: Props) {
  const base = mode === "studio" ? "/studio/blog" : "/admin/blog";
  const blogApi = mode === "studio" ? api.studio.blogPosts : api.admin.blogPosts;
  const { getToken } = useAuth();
  const [posts, setPosts] = useState<BlogPostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [statusId, setStatusId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setPosts(await blogApi.list(token));
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
    const published = posts.filter((p) => p.published !== false).length;
    const drafts = posts.filter((p) => p.published === false).length;
    return { total: posts.length, published, drafts };
  }, [posts]);

  async function handleDuplicate(p: BlogPostRecord) {
    const token = getToken();
    if (!token) return;
    setDuplicatingId(p.id);
    try {
      const { id: _id, slug: _slug, createdAt, updatedAt, ...data } = p;
      const created = await blogApi.create(token, {
        ...data,
        title: `${p.title} (copie)`,
        slug: slugify(`${p.slug}-copie-${Date.now().toString(36).slice(-4)}`),
        published: false,
      });
      setPosts((prev) => [created, ...prev]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setDuplicatingId(null);
    }
  }

  async function handlePublishedChange(id: string, published: boolean) {
    const token = getToken();
    if (!token) return;
    setStatusId(id);
    try {
      const updated = await blogApi.update(token, id, { published });
      setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
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
      await blogApi.delete(token, id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
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
      icon: <IconArticle />,
      hint: "Articles en base",
    },
    {
      label: "Publiés",
      value: summary.published,
      tone: "green" as const,
      icon: <IconCheck />,
      hint: "Visibles sur le site",
    },
    {
      label: "Brouillons",
      value: summary.drafts,
      tone: "amber" as const,
      icon: <span className="text-sm leading-none">✎</span>,
      hint: "Non publiés",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title={mode === "studio" ? "Blog — Espace artiste" : "Blog"}
        description={
          <>
            {summary.total} article{summary.total !== 1 ? "s" : ""} au total
            <span className="text-stone-400"> · </span>
            {mode === "studio" ? "Publiez vos articles" : "Rédaction et publication"}
          </>
        }
        actions={
          <Link
            href={`${base}/new`}
            className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-amber-950"
          >
            <IconPlus />
            Ajouter
          </Link>
        }
      />

      {error && (
        <p className="mt-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <section className="mt-8">
        <h2 className="sr-only">Statistiques du blog</h2>
        {loading && posts.length === 0 ? (
          <AdminKpiSkeleton count={3} columns={4} />
        ) : (
          <AdminKpiGrid items={kpiItems} columns={4} />
        )}
      </section>

      <AdminDataTable
        rows={posts}
        isLoading={loading}
        getRowKey={(p) => p.id}
        getSearchText={(p) => `${p.title} ${p.slug} ${p.excerpt}`}
        searchPlaceholder="Rechercher un article, slug, extrait…"
        emptyMessage="Aucun article. Créez le premier."
        tabs={[
          { id: "all", label: "Tous", match: () => true },
          { id: "published", label: "Publiés", match: (p) => p.published !== false },
          { id: "draft", label: "Brouillons", match: (p) => p.published === false },
        ]}
        columns={[
          {
            id: "image",
            header: "Visuel",
            cell: (p) => (
              <Link
                href={`${base}/${p.id}/edit`}
                className="relative block h-16 w-24 overflow-hidden rounded-lg bg-stone-100 ring-1 ring-stone-200/80 transition hover:ring-sky-200"
              >
                <Image
                  src={resolveMediaUrl(p.image)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized
                />
              </Link>
            ),
          },
          {
            id: "title",
            header: "Article",
            sortValue: (p) => p.title,
            cell: (p) => (
              <div className="min-w-[14rem] max-w-md">
                <Link
                  href={`${base}/${p.id}/edit`}
                  className="font-medium text-stone-900 hover:text-sky-800"
                >
                  {p.title}
                </Link>
                <p className="mt-0.5 text-xs text-stone-500">{p.slug}</p>
                {p.excerpt && (
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-stone-400">
                    {p.excerpt}
                  </p>
                )}
              </div>
            ),
          },
          {
            id: "date",
            header: "Publication",
            sortValue: (p) => p.publishedAt,
            cell: (p) => (
              <div className="text-sm text-stone-600">
                <p className="font-medium text-stone-800">{formatFrenchDate(p.publishedAt)}</p>
              </div>
            ),
          },
          {
            id: "status",
            header: "Statut",
            sortValue: (p) => (p.published === false ? 0 : 1),
            cell: (p) => (
              <AdminStatusBadge
                label={p.published === false ? "Brouillon" : "Publié"}
                tone={p.published === false ? "warning" : "success"}
              />
            ),
          },
          {
            id: "actions",
            header: "",
            className: "w-12 text-right",
            cell: (p) => (
              <AdminRowActionsMenu
                viewHref={p.published !== false ? `/blog/${p.slug}` : undefined}
                editHref={`${base}/${p.id}/edit`}
                onDuplicate={() => handleDuplicate(p)}
                duplicateLoading={duplicatingId === p.id}
                statusLoading={statusId === p.id}
                statusOptions={[
                  {
                    label: "Publié",
                    active: p.published !== false,
                    onSelect: () => handlePublishedChange(p.id, true),
                  },
                  {
                    label: "Brouillon",
                    active: p.published === false,
                    onSelect: () => handlePublishedChange(p.id, false),
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

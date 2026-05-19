"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IconCalendar, IconCheck, IconPlus, IconTag } from "@/components/admin/AdminDashboardIcons";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminKpiGrid, AdminKpiSkeleton } from "@/components/admin/AdminKpi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminRowActionsMenu } from "@/components/admin/AdminRowActionsMenu";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAuth } from "@/context/AuthContext";
import { api, type EventRecord } from "@/lib/api";
import { formatFrenchDate } from "@/lib/format-date";

function isUpcoming(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
}

type Props = { mode?: "admin" | "studio" };

export function AdminEventsPageContent({ mode = "admin" }: Props) {
  const base = mode === "studio" ? "/studio/events" : "/admin/events";
  const eventsApi = mode === "studio" ? api.studio.events : api.admin.events;
  const { getToken } = useAuth();
  const [events, setEvents] = useState<EventRecord[]>([]);
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
      setEvents(await eventsApi.list(token));
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
    const published = events.filter((e) => e.published !== false).length;
    const hidden = events.filter((e) => e.published === false).length;
    const upcoming = events.filter((e) => isUpcoming(e.eventDate)).length;
    return { total: events.length, published, hidden, upcoming };
  }, [events]);

  async function handleDuplicate(e: EventRecord) {
    const token = getToken();
    if (!token) return;
    setDuplicatingId(e.id);
    try {
      const { id: _id, createdAt, updatedAt, ...data } = e;
      const created = await eventsApi.create(token, {
        ...data,
        title: `${e.title} (copie)`,
        published: false,
      });
      setEvents((prev) => [created, ...prev]);
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
      const updated = await eventsApi.update(token, id, { published });
      setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
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
      await eventsApi.delete(token, id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
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
      icon: <IconCalendar />,
      hint: "Événements en base",
    },
    {
      label: "Publiés",
      value: summary.published,
      tone: "green" as const,
      icon: <IconCheck />,
      hint: "Visibles sur le site",
    },
    {
      label: "À venir",
      value: summary.upcoming,
      tone: "amber" as const,
      icon: <span className="text-sm leading-none">↗</span>,
      hint: "Dates futures",
    },
    {
      label: "Masqués",
      value: summary.hidden,
      tone: "stone" as const,
      icon: <IconTag />,
      hint: "Non publiés",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title={mode === "studio" ? "Événements — Espace artiste" : "Événements"}
        description={
          <>
            {summary.total} événement{summary.total !== 1 ? "s" : ""} au total
            <span className="text-stone-400"> · </span>
            {mode === "studio" ? "Vos expositions et dates" : "Expositions, vernissages et agenda"}
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
        <h2 className="sr-only">Statistiques des événements</h2>
        {loading && events.length === 0 ? (
          <AdminKpiSkeleton count={4} columns={4} />
        ) : (
          <AdminKpiGrid items={kpiItems} columns={4} />
        )}
      </section>

      <AdminDataTable
        rows={events}
        isLoading={loading}
        getRowKey={(e) => e.id}
        getSearchText={(e) => `${e.title} ${e.city} ${e.description ?? ""}`}
        searchPlaceholder="Rechercher un événement, ville…"
        emptyMessage="Aucun événement. Ajoutez le premier."
        tabs={[
          { id: "all", label: "Tous", match: () => true },
          { id: "published", label: "Publiés", match: (e) => e.published !== false },
          { id: "upcoming", label: "À venir", match: (e) => isUpcoming(e.eventDate) },
          { id: "hidden", label: "Masqués", match: (e) => e.published === false },
        ]}
        columns={[
          {
            id: "event",
            header: "Événement",
            sortValue: (e) => e.title,
            cell: (e) => (
              <div className="min-w-[14rem]">
                <Link
                  href={`${base}/${e.id}/edit`}
                  className="font-medium text-stone-900 hover:text-sky-800"
                >
                  {e.title}
                </Link>
                {e.description && (
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-stone-400">
                    {e.description}
                  </p>
                )}
              </div>
            ),
          },
          {
            id: "place",
            header: "Lieu",
            sortValue: (e) => e.city,
            cell: (e) => (
              <div className="text-sm text-stone-600">
                <p className="font-medium text-stone-800">{e.city}</p>
              </div>
            ),
          },
          {
            id: "date",
            header: "Date",
            sortValue: (e) => e.eventDate,
            cell: (e) => (
              <p className="text-sm font-medium text-stone-800">{formatFrenchDate(e.eventDate)}</p>
            ),
          },
          {
            id: "status",
            header: "Statut",
            sortValue: (e) => (e.published === false ? 0 : 1),
            cell: (e) => (
              <div className="flex flex-wrap gap-1.5">
                <AdminStatusBadge
                  label={e.published === false ? "Masqué" : "Publié"}
                  tone={e.published === false ? "muted" : "success"}
                />
                {isUpcoming(e.eventDate) && (
                  <AdminStatusBadge label="À venir" tone="warning" />
                )}
              </div>
            ),
          },
          {
            id: "actions",
            header: "",
            className: "w-12 text-right",
            cell: (e) => (
              <AdminRowActionsMenu
                viewHref="/calendar"
                editHref={`${base}/${e.id}/edit`}
                onDuplicate={() => handleDuplicate(e)}
                duplicateLoading={duplicatingId === e.id}
                statusLoading={statusId === e.id}
                statusOptions={[
                  {
                    label: "Publié",
                    active: e.published !== false,
                    onSelect: () => handlePublishedChange(e.id, true),
                  },
                  {
                    label: "Masqué",
                    active: e.published === false,
                    onSelect: () => handlePublishedChange(e.id, false),
                  },
                ]}
                onDelete={() => handleDelete(e.id, e.title)}
                deleteLoading={deletingId === e.id}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

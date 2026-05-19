"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  IconArticle,
  IconCalendar,
  IconCheck,
  IconExternal,
  IconPaintings,
  IconPlus,
  IconTag,
  IconUsers,
} from "@/components/admin/AdminDashboardIcons";
import { AdminKpiGrid, AdminKpiSkeleton } from "@/components/admin/AdminKpi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAuth } from "@/context/AuthContext";
import { api, type AdminStats } from "@/lib/api";

const quickActions = [
  {
    title: "Nouveau tableau",
    description: "Ajouter une œuvre au catalogue",
    href: "/admin/paintings/new",
    primary: true,
  },
  {
    title: "Nouvel article",
    description: "Publier sur le blog",
    href: "/admin/blog/new",
    primary: false,
  },
  {
    title: "Nouvel événement",
    description: "Exposition ou vernissage",
    href: "/admin/events/new",
    primary: false,
  },
] as const;

const manageLinks = [
  {
    title: "Peintures",
    description: "Catalogue, statuts et tirages",
    href: "/admin/paintings",
    statKey: "totalPaintings" as const,
    label: "tableaux",
  },
  {
    title: "Blog",
    description: "Articles et brouillons",
    href: "/admin/blog",
    statKey: "blogPosts" as const,
    label: "articles",
  },
  {
    title: "Événements",
    description: "Agenda et publications",
    href: "/admin/events",
    statKey: "events" as const,
    label: "événements",
  },
  {
    title: "Utilisateurs",
    description: "Rôles et comptes",
    href: "/admin/users",
    statKey: "customers" as const,
    label: "clients",
  },
] as const;

function todayLabel() {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function CatalogOverview({ stats }: { stats: AdminStats }) {
  const total = stats.totalPaintings || 1;
  const availablePct = Math.round((stats.available / total) * 100);
  const soldPct = Math.round((stats.sold / total) * 100);

  return (
    <div className="rounded-xl border border-stone-200/90 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-stone-900">Catalogue peintures</h2>
          <p className="mt-1 text-sm text-stone-500">
            Répartition des œuvres par statut
          </p>
        </div>
        <Link
          href="/admin/paintings"
          className="shrink-0 text-sm font-medium text-sky-700 hover:text-sky-900"
        >
          Gérer →
        </Link>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium text-green-800">Disponibles</span>
            <span className="tabular-nums text-stone-600">
              {stats.available}{" "}
              <span className="text-stone-400">({availablePct}%)</span>
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${availablePct}%` }}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium text-stone-600">Vendus</span>
            <span className="tabular-nums text-stone-600">
              {stats.sold}{" "}
              <span className="text-stone-400">({soldPct}%)</span>
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-stone-400 transition-all duration-500"
              style={{ width: `${soldPct}%` }}
            />
          </div>
        </div>
      </div>

      <p className="mt-6 border-t border-stone-100 pt-4 text-sm text-stone-500">
        <span className="font-serif text-2xl text-stone-900">{stats.totalPaintings}</span>{" "}
        œuvres au total · {stats.customers} client{stats.customers !== 1 ? "s" : ""} inscrit
        {stats.customers !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { getToken, user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    api.admin
      .stats(token)
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [getToken]);

  const greeting = useMemo(() => {
    if (user?.firstName) return `Bonjour, ${user.firstName}`;
    return "Bonjour";
  }, [user?.firstName]);

  const kpiItems = stats
    ? [
        {
          label: "Tableaux",
          value: stats.totalPaintings,
          href: "/admin/paintings",
          icon: <IconPaintings />,
          tone: "sky" as const,
        },
        {
          label: "Disponibles",
          value: stats.available,
          href: "/admin/paintings",
          icon: <IconCheck />,
          tone: "green" as const,
          hint: "En vente",
        },
        {
          label: "Vendus",
          value: stats.sold,
          href: "/admin/paintings",
          icon: <IconTag />,
          tone: "stone" as const,
        },
        {
          label: "Articles blog",
          value: stats.blogPosts,
          href: "/admin/blog",
          icon: <IconArticle />,
          tone: "amber" as const,
        },
        {
          label: "Événements",
          value: stats.events,
          href: "/admin/events",
          icon: <IconCalendar />,
          tone: "default" as const,
        },
        {
          label: "Clients",
          value: stats.customers,
          icon: <IconUsers />,
          tone: "default" as const,
          hint: "Comptes créés",
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title={greeting}
        description={
          <>
            <span className="capitalize">{todayLabel()}</span>
            <span className="text-stone-400"> · </span>
            Vue d&apos;ensemble de la galerie Mayn
          </>
        }
        actions={
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition hover:border-stone-300 hover:bg-stone-50"
          >
            Voir le site
            <IconExternal />
          </Link>
        }
      />

      {error && (
        <p className="mt-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <section className="mt-8">
        <h2 className="sr-only">Indicateurs</h2>
        {loading ? <AdminKpiSkeleton /> : stats && <AdminKpiGrid items={kpiItems} />}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-500">
            Actions rapides
          </h2>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`group flex items-center gap-4 rounded-xl border p-4 shadow-sm transition ${
                  action.primary
                    ? "border-stone-900 bg-stone-900 text-white hover:bg-amber-950"
                    : "border-stone-200/90 bg-white hover:border-sky-200 hover:shadow-md"
                }`}
              >
                <span
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    action.primary
                      ? "bg-white/10 text-white"
                      : "bg-sky-50 text-sky-700 group-hover:bg-sky-100"
                  }`}
                >
                  <IconPlus />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{action.title}</span>
                  <span
                    className={`mt-0.5 block text-sm ${
                      action.primary ? "text-stone-300" : "text-stone-500"
                    }`}
                  >
                    {action.description}
                  </span>
                </span>
                <span
                  className={
                    action.primary ? "text-white/50 group-hover:text-white" : "text-stone-300 group-hover:text-sky-500"
                  }
                  aria-hidden
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="lg:col-span-3">
          {stats ? (
            <CatalogOverview stats={stats} />
          ) : loading ? (
            <div className="h-64 animate-pulse rounded-xl bg-stone-200/50" />
          ) : null}
        </section>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-500">
          Gestion du contenu
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {manageLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-xl border border-stone-200/90 bg-white p-5 shadow-sm transition hover:border-sky-200 hover:shadow-md"
            >
              <p className="font-medium text-stone-900 group-hover:text-sky-900">{link.title}</p>
              <p className="mt-1 text-sm text-stone-500">{link.description}</p>
              {stats && (
                <p className="mt-4 font-serif text-2xl tabular-nums text-stone-900">
                  {stats[link.statKey]}
                  <span className="ml-1.5 font-sans text-sm font-normal text-stone-400">
                    {link.label}
                  </span>
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

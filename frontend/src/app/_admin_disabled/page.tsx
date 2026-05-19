"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, type AdminStats } from "@/lib/api";

function StatCard({ label, value, href }: { label: string; value: number; href?: string }) {
  const inner = (
    <div className="rounded border border-stone-200 bg-white p-6">
      <p className="text-sm uppercase tracking-wider text-stone-500">{label}</p>
      <p className="mt-2 font-serif text-4xl text-stone-900">{value}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition hover:border-amber-800">
        {inner}
      </Link>
    );
  }

  return inner;
}

export default function AdminDashboardPage() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    api.admin
      .stats(token)
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"));
  }, [getToken]);

  return (
    <div>
      <h1 className="font-serif text-3xl text-stone-900">Tableau de bord</h1>
      <p className="mt-2 text-stone-600">Vue d&apos;ensemble de la galerie.</p>

      {error && (
        <p className="mt-6 rounded bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      )}

      {stats && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Tableaux" value={stats.totalPaintings} href="/admin/paintings" />
          <StatCard label="Disponibles" value={stats.available} href="/admin/paintings" />
          <StatCard label="Vendus" value={stats.sold} href="/admin/paintings" />
          <StatCard label="Articles blog" value={stats.blogPosts} href="/admin/blog" />
          <StatCard label="Événements" value={stats.events} href="/admin/events" />
          <StatCard label="Clients" value={stats.customers} />
        </div>
      )}

      <div className="mt-12 flex flex-wrap gap-4">
        <Link
          href="/admin/paintings/new"
          className="bg-stone-900 px-6 py-3 text-sm uppercase tracking-wider text-white hover:bg-amber-950"
        >
          Ajouter un tableau
        </Link>
        <Link
          href="/admin/paintings"
          className="border border-stone-300 bg-white px-6 py-3 text-sm uppercase tracking-wider text-stone-800 hover:border-stone-900"
        >
          Gérer les peintures
        </Link>
        <Link
          href="/admin/blog"
          className="border border-stone-300 bg-white px-6 py-3 text-sm uppercase tracking-wider text-stone-800 hover:border-stone-900"
        >
          Gérer le blog
        </Link>
        <Link
          href="/admin/events"
          className="border border-stone-300 bg-white px-6 py-3 text-sm uppercase tracking-wider text-stone-800 hover:border-stone-900"
        >
          Gérer les événements
        </Link>
      </div>
    </div>
  );
}

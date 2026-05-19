"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, type EventRecord } from "@/lib/api";
import { formatFrenchDate } from "@/lib/format-date";

export default function AdminEventsPage() {
  const { getToken } = useAuth();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setEvents(await api.admin.events.list(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Supprimer « ${title} » ?`)) return;
    const token = getToken();
    if (!token) return;
    setDeletingId(id);
    try {
      await api.admin.events.delete(token, id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Événements</h1>
          <p className="mt-2 text-stone-600">
            {events.length} événement{events.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="bg-stone-900 px-5 py-2.5 text-sm uppercase tracking-wider text-white hover:bg-amber-950"
        >
          Nouvel événement
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      )}

      {loading ? (
        <p className="mt-10 text-stone-500">Chargement…</p>
      ) : (
        <ul className="mt-10 space-y-4">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded border border-stone-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-stone-900">{event.title}</p>
                <p className="text-sm text-stone-500">
                  {formatFrenchDate(event.eventDate)} · {event.city}
                  {!event.published && " · Masqué"}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/events/${event.id}/edit`}
                  className="border border-stone-300 px-3 py-1.5 text-sm hover:border-stone-900"
                >
                  Modifier
                </Link>
                <button
                  type="button"
                  disabled={deletingId === event.id}
                  onClick={() => handleDelete(event.id, event.title)}
                  className="border border-red-200 px-3 py-1.5 text-sm text-red-800 hover:bg-red-50 disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, type PaintingRecord } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";

export default function AdminPaintingsPage() {
  const { getToken } = useAuth();
  const [paintings, setPaintings] = useState<PaintingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const list = await api.admin.paintings.list(token);
      setPaintings(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSyncCatalog() {
    const token = getToken();
    if (!token) return;
    setSyncing(true);
    setError(null);
    try {
      const result = await api.admin.paintings.syncCatalog(token);
      await load();
      if (result.created > 0) {
        alert(`${result.created} tableau(x) importé(s). Total catalogue : ${result.total}.`);
      } else {
        alert(`Catalogue complet : ${result.already} / ${result.total} tableaux en base.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSyncing(false);
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

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Peintures</h1>
          <p className="mt-2 text-stone-600">{paintings.length} tableau{paintings.length !== 1 ? "x" : ""}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={syncing}
            onClick={handleSyncCatalog}
            className="border border-stone-300 px-5 py-2.5 text-sm uppercase tracking-wider text-stone-800 hover:border-amber-900 hover:text-amber-950 disabled:opacity-50"
          >
            {syncing ? "Import…" : "Importer tout le catalogue"}
          </button>
          <Link
            href="/admin/paintings/new"
            className="bg-stone-900 px-5 py-2.5 text-sm uppercase tracking-wider text-white hover:bg-amber-950"
          >
            Nouveau
          </Link>
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      )}

      {loading ? (
        <p className="mt-10 text-sm text-stone-500">Chargement…</p>
      ) : paintings.length === 0 ? (
        <p className="mt-10 text-stone-500">Aucun tableau. Créez le premier.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded border border-stone-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Prix</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paintings.map((p) => (
                <tr key={p.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="relative h-14 w-14 overflow-hidden bg-stone-100">
                      <Image
                        src={resolveMediaUrl(p.image)}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="56px"
                        unoptimized
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-900">{p.title}</p>
                    <p className="text-xs text-stone-500">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3">{p.price} €</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs uppercase ${
                        p.status === "available"
                          ? "bg-green-50 text-green-800"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {p.status === "available" ? "Disponible" : "Vendu"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/paintings/${p.id}/edit`}
                      className="mr-3 text-amber-900 hover:underline"
                    >
                      Modifier
                    </Link>
                    <button
                      type="button"
                      disabled={deletingId === p.id}
                      onClick={() => handleDelete(p.id, p.title)}
                      className="text-red-700 hover:underline disabled:opacity-50"
                    >
                      {deletingId === p.id ? "…" : "Supprimer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

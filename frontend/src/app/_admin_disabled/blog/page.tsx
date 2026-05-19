"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, type BlogPostRecord } from "@/lib/api";
import { formatFrenchDate } from "@/lib/format-date";
import { resolveMediaUrl } from "@/lib/media";

export default function AdminBlogPage() {
  const { getToken } = useAuth();
  const [posts, setPosts] = useState<BlogPostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setPosts(await api.admin.blogPosts.list(token));
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
      await api.admin.blogPosts.delete(token, id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
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
          <h1 className="font-serif text-3xl text-stone-900">Blog</h1>
          <p className="mt-2 text-stone-600">
            {posts.length} article{posts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="bg-stone-900 px-5 py-2.5 text-sm uppercase tracking-wider text-white hover:bg-amber-950"
        >
          Nouvel article
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      )}

      {loading ? (
        <p className="mt-10 text-stone-500">Chargement…</p>
      ) : (
        <ul className="mt-10 space-y-4">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex flex-wrap items-center gap-4 rounded border border-stone-200 bg-white p-4"
            >
              <div className="relative h-16 w-24 shrink-0 overflow-hidden bg-stone-100">
                <Image
                  src={resolveMediaUrl(post.image)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-stone-900">{post.title}</p>
                <p className="text-sm text-stone-500">
                  {formatFrenchDate(post.publishedAt)}
                  {!post.published && " · Brouillon"}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/blog/${post.id}/edit`}
                  className="border border-stone-300 px-3 py-1.5 text-sm hover:border-stone-900"
                >
                  Modifier
                </Link>
                <button
                  type="button"
                  disabled={deletingId === post.id}
                  onClick={() => handleDelete(post.id, post.title)}
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

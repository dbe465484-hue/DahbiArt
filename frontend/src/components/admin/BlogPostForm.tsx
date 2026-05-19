"use client";

import { useMemo, useState } from "react";
import type { BlogPostInput, BlogPostRecord } from "@/lib/api";
import { slugify } from "@/lib/slugify";
import { ImageUploadField } from "./ImageUploadField";

type Props = {
  initial?: BlogPostRecord;
  onSubmit: (data: BlogPostInput) => Promise<void>;
  submitLabel: string;
  studio?: boolean;
};

const today = new Date().toISOString().slice(0, 10);

const defaultValues: BlogPostInput = {
  title: "",
  excerpt: "",
  content: "",
  image: "",
  publishedAt: today,
  published: true,
};

export function BlogPostForm({ initial, onSubmit, submitLabel, studio = false }: Props) {
  const [form, setForm] = useState<BlogPostInput>(initial ?? defaultValues);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const imageSlug = useMemo(
    () => slugify(form.slug?.trim() || form.title),
    [form.slug, form.title],
  );

  const set = <K extends keyof BlogPostInput>(key: K, value: BlogPostInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!form.image) {
        setError("Ajoutez une image à l’article");
        return;
      }
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {error && (
        <p className="rounded bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      <section className="space-y-4 rounded border border-stone-200 bg-white p-6">
        <label className="block">
          <span className="mb-1 block text-sm text-stone-600">Titre</span>
          <input
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="w-full border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-stone-600">Slug (optionnel)</span>
          <input
            value={form.slug ?? ""}
            onChange={(e) => set("slug", e.target.value || undefined)}
            className="w-full border border-stone-300 px-3 py-2"
            placeholder="genere-automatiquement"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-stone-600">Date de publication</span>
          <input
            required
            type="date"
            value={form.publishedAt.slice(0, 10)}
            onChange={(e) => set("publishedAt", e.target.value)}
            className="w-full border border-stone-300 px-3 py-2"
          />
        </label>
        <ImageUploadField
          kind="blog"
          slug={imageSlug}
          value={form.image}
          onChange={(url) => set("image", url)}
          required
          studio={studio}
        />
        {!imageSlug && (
          <p className="text-xs text-amber-800">Saisissez le titre ou le slug pour activer l’upload.</p>
        )}
        <label className="block">
          <span className="mb-1 block text-sm text-stone-600">Extrait</span>
          <textarea
            required
            rows={2}
            value={form.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            className="w-full border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-stone-600">Contenu</span>
          <textarea
            required
            rows={10}
            value={form.content}
            onChange={(e) => set("content", e.target.value)}
            className="w-full border border-stone-300 px-3 py-2 font-mono text-sm"
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.published ?? true}
            onChange={(e) => set("published", e.target.checked)}
          />
          <span className="text-sm text-stone-600">Publié (visible sur le site)</span>
        </label>
      </section>

      <button
        type="submit"
        disabled={loading}
        className="bg-stone-900 px-6 py-3 text-sm uppercase tracking-wider text-white hover:bg-amber-950 disabled:opacity-60"
      >
        {loading ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}

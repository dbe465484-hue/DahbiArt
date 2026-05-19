"use client";

import { useMemo, useState } from "react";
import type { PaintingInput, PaintingRecord } from "@/lib/api";
import { subjects, locations } from "@/lib/navigation";
import { collectionOptions } from "@/lib/paintings";
import { paintingPayload } from "@/lib/admin-form-payloads";
import { slugify } from "@/lib/slugify";
import { ImageUploadField } from "./ImageUploadField";

type Props = {
  initial?: PaintingRecord;
  onSubmit: (data: PaintingInput) => Promise<void>;
  submitLabel: string;
};

const defaultValues: PaintingInput = {
  title: "",
  year: new Date().getFullYear(),
  dimensions: "18×24",
  medium: "Huile sur toile",
  price: 0,
  status: "available",
  printAvailable: false,
  printPrice: undefined,
  image: "",
  description: "",
  subject: "landscape",
  location: "rabat",
  collection: "figures-symboliques",
  featured: false,
  bestSeller: false,
};

export function PaintingForm({ initial, onSubmit, submitLabel }: Props) {
  const [form, setForm] = useState<PaintingInput>(initial ?? defaultValues);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const imageSlug = useMemo(
    () => slugify(form.slug?.trim() || form.title),
    [form.slug, form.title],
  );

  const set = <K extends keyof PaintingInput>(key: K, value: PaintingInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!form.image) {
        setError("Ajoutez une image du tableau");
        return;
      }
      await onSubmit(paintingPayload(form));
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
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
          Informations
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm text-stone-600">Titre</span>
            <input
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="w-full border border-stone-300 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-stone-600">Année</span>
            <input
              type="number"
              required
              value={form.year}
              onChange={(e) => set("year", Number(e.target.value))}
              className="w-full border border-stone-300 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-stone-600">Dimensions</span>
            <input
              required
              value={form.dimensions}
              onChange={(e) => set("dimensions", e.target.value)}
              className="w-full border border-stone-300 px-3 py-2"
              placeholder="18×24"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm text-stone-600">Technique</span>
            <input
              required
              value={form.medium}
              onChange={(e) => set("medium", e.target.value)}
              className="w-full border border-stone-300 px-3 py-2"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm text-stone-600">Description</span>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="w-full border border-stone-300 px-3 py-2"
            />
          </label>
          <div className="md:col-span-2">
            <ImageUploadField
              kind="painting"
              slug={imageSlug}
              value={form.image}
              onChange={(url) => set("image", url)}
              required
            />
            {!imageSlug && (
              <p className="mt-1 text-xs text-amber-800">Saisissez le titre pour activer l’upload.</p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded border border-stone-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
          Prix & statut
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-stone-600">Prix (€)</span>
            <input
              type="number"
              min={0}
              required
              value={form.price}
              onChange={(e) => set("price", Number(e.target.value))}
              className="w-full border border-stone-300 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-stone-600">Statut</span>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value as PaintingInput["status"])}
              className="w-full border border-stone-300 px-3 py-2"
            >
              <option value="available">Disponible</option>
              <option value="sold">Vendu</option>
            </select>
          </label>
          <label className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              checked={form.printAvailable}
              onChange={(e) => set("printAvailable", e.target.checked)}
            />
            <span className="text-sm text-stone-700">Tirages disponibles</span>
          </label>
          {form.printAvailable && (
            <label className="block">
              <span className="mb-1 block text-sm text-stone-600">Prix tirage (€)</span>
              <input
                type="number"
                min={0}
                value={form.printPrice ?? ""}
                onChange={(e) => set("printPrice", Number(e.target.value))}
                className="w-full border border-stone-300 px-3 py-2"
              />
            </label>
          )}
        </div>
      </section>

      <section className="space-y-4 rounded border border-stone-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
          Classification
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-sm text-stone-600">Sujet</span>
            <select
              value={form.subject}
              onChange={(e) => set("subject", e.target.value)}
              className="w-full border border-stone-300 px-3 py-2"
            >
              {subjects.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-stone-600">Lieu</span>
            <select
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              className="w-full border border-stone-300 px-3 py-2"
            >
              {locations.map((l) => (
                <option key={l.slug} value={l.slug}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-stone-600">Collection</span>
            <select
              value={form.collection}
              onChange={(e) => set("collection", e.target.value)}
              className="w-full border border-stone-300 px-3 py-2"
            >
              {collectionOptions.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
            />
            <span className="text-sm">En vedette</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.bestSeller}
              onChange={(e) => set("bestSeller", e.target.checked)}
            />
            <span className="text-sm">Meilleure vente</span>
          </label>
        </div>
      </section>

      <button
        type="submit"
        disabled={loading}
        className="bg-stone-900 px-8 py-3 text-sm uppercase tracking-wider text-white hover:bg-amber-950 disabled:opacity-60"
      >
        {loading ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}

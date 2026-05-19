"use client";

import { useState } from "react";
import type { EventInput, EventRecord } from "@/lib/api";
import { eventPayload } from "@/lib/admin-form-payloads";

type Props = {
  initial?: EventRecord;
  onSubmit: (data: EventInput) => Promise<void>;
  submitLabel: string;
};

const today = new Date().toISOString().slice(0, 10);

const defaultValues: EventInput = {
  title: "",
  city: "",
  eventDate: today,
  description: "",
  published: true,
};

export function EventForm({ initial, onSubmit, submitLabel }: Props) {
  const [form, setForm] = useState<EventInput>(initial ?? defaultValues);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof EventInput>(key: K, value: EventInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit(eventPayload(form));
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
          <span className="mb-1 block text-sm text-stone-600">Ville</span>
          <input
            required
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            className="w-full border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-stone-600">Date de l&apos;événement</span>
          <input
            required
            type="date"
            value={form.eventDate.slice(0, 10)}
            onChange={(e) => set("eventDate", e.target.value)}
            className="w-full border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-stone-600">Description (optionnel)</span>
          <textarea
            rows={4}
            value={form.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
            className="w-full border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.published ?? true}
            onChange={(e) => set("published", e.target.checked)}
          />
          <span className="text-sm text-stone-600">Publié (visible sur le calendrier)</span>
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

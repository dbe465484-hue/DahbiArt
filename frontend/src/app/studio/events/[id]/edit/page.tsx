"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EventForm } from "@/components/admin/EventForm";
import { useAuth } from "@/context/AuthContext";
import { api, type EventInput, type EventRecord } from "@/lib/api";

export default function StudioEditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getToken } = useAuth();
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token || !id) return;
    api.studio.events
      .get(token, id)
      .then(setEvent)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"));
  }, [getToken, id]);

  async function handleSubmit(data: EventInput) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");
    await api.studio.events.update(token, id, data);
    router.push("/studio/events");
  }

  if (error) return <p className="text-red-800">{error}</p>;
  if (!event) return <p className="text-stone-500">Chargement…</p>;

  return (
    <div>
      <h1 className="font-serif text-3xl text-stone-900">Modifier l&apos;événement</h1>
      <div className="mt-10">
        <EventForm initial={event} submitLabel="Enregistrer" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

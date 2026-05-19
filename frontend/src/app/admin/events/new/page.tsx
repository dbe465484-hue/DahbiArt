"use client";

import { useRouter } from "next/navigation";
import { EventForm } from "@/components/admin/EventForm";
import { useAuth } from "@/context/AuthContext";
import { api, type EventInput } from "@/lib/api";

export default function AdminNewEventPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  async function handleSubmit(data: EventInput) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");
    await api.admin.events.create(token, data);
    router.push("/admin/events");
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-stone-900">Nouvel événement</h1>
      <p className="mt-2 text-stone-600">Ajoutez une date au calendrier public.</p>
      <div className="mt-10">
        <EventForm submitLabel="Créer l'événement" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

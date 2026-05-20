"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PaintingForm } from "@/components/admin/PaintingForm";
import { useAuth } from "@/context/AuthContext";
import { api, type PaintingInput, type PaintingRecord } from "@/lib/api";

export default function AdminEditPaintingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getToken } = useAuth();
  const [painting, setPainting] = useState<PaintingRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token || !id) return;

    api.admin.paintings
      .get(token, id)
      .then(setPainting)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"));
  }, [getToken, id]);

  async function handleSubmit(data: PaintingInput) {
    const token = getToken();
    if (!token || !id) throw new Error("Non authentifié");
    await api.admin.paintings.update(token, id, data);
    router.push("/admin/paintings");
    router.refresh();
    alert("Modifications enregistrées.");
  }

  if (error) {
    return (
      <div>
        <p className="rounded bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
        <Link href="/admin/paintings" className="mt-4 inline-block text-sm text-amber-900 hover:underline">
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  if (!painting) {
    return <p className="text-sm text-stone-500">Chargement…</p>;
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-stone-900">Modifier</h1>
      <p className="mt-2 text-stone-600">{painting.title}</p>
      <div className="mt-10">
        <PaintingForm
          initial={painting}
          submitLabel="Enregistrer"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

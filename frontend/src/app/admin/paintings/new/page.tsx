"use client";

import { useRouter } from "next/navigation";
import { PaintingForm } from "@/components/admin/PaintingForm";
import { useAuth } from "@/context/AuthContext";
import { api, type PaintingInput } from "@/lib/api";

export default function AdminNewPaintingPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  async function handleSubmit(data: PaintingInput) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");
    await api.admin.paintings.create(token, data);
    router.push("/admin/paintings");
    router.refresh();
    alert("Tableau enregistré dans la base de données.");
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-stone-900">Nouveau tableau</h1>
      <p className="mt-2 text-stone-600">Ajoutez une œuvre au catalogue.</p>
      <div className="mt-10">
        <PaintingForm submitLabel="Créer le tableau" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

import { Suspense } from "react";
import { PaintingsCatalog } from "@/components/paintings/PaintingsCatalog";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPaintings } from "@/lib/paintings";

export const metadata = { title: "Toutes les peintures" };

export const dynamic = "force-dynamic";

export default async function AllPaintingsPage() {
  const paintings = await getPaintings();

  return (
    <>
      <PageHeader
        title="Toutes les peintures"
        description={`Originaux et tirages — ${paintings.length} œuvre${paintings.length > 1 ? "s" : ""} dans la galerie.`}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <Suspense fallback={<p className="text-center text-stone-500">Chargement…</p>}>
          <PaintingsCatalog paintings={paintings} />
        </Suspense>
      </section>
    </>
  );
}

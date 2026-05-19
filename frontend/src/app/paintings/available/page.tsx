import { PaintingGrid } from "@/components/paintings/PaintingGrid";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAvailable, getPaintings } from "@/lib/paintings";

export const metadata = { title: "Originaux disponibles" };

export default async function AvailablePage() {
  const paintings = await getPaintings();

  return (
    <>
      <PageHeader
        title="Originaux disponibles"
        description="Œuvres prêtes à rejoindre votre collection. Livraison soignée."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <PaintingGrid paintings={getAvailable(paintings)} />
      </section>
    </>
  );
}

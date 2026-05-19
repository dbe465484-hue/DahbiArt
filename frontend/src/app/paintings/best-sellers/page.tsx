import { PaintingGrid } from "@/components/paintings/PaintingGrid";
import { PageHeader } from "@/components/ui/PageHeader";
import { getBestSellers, getPaintings } from "@/lib/paintings";

export const metadata = { title: "Meilleures ventes" };

export default async function BestSellersPage() {
  const paintings = await getPaintings();

  return (
    <>
      <PageHeader
        title="Les plus appréciées"
        description="Les œuvres préférées des collectionneurs."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <PaintingGrid paintings={getBestSellers(paintings)} />
      </section>
    </>
  );
}

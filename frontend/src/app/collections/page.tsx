import { CollectionsPageContent } from "@/components/collections/CollectionsPageContent";
import { buildCollections, getPaintings } from "@/lib/paintings";

export const metadata = {
  title: "Collections",
  description:
    "Parcourez les œuvres de Dahbi Machrouhi par thème : figures symboliques, oiseaux, terres chaudes, nocturnes, signes & étoiles et petits formats.",
};

export default async function CollectionsPage() {
  const paintings = await getPaintings();
  const collections = buildCollections(paintings);

  return (
    <CollectionsPageContent
      collections={collections}
      totalPaintings={paintings.length}
    />
  );
}

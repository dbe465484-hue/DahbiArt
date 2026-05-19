import { CollectionDetailHeader } from "@/components/collections/CollectionDetailHeader";
import { PaintingGrid } from "@/components/paintings/PaintingGrid";
import {
  buildCollections,
  collectionOptions,
  getByCollection,
  getPaintings,
} from "@/lib/paintings";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return collectionOptions.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const paintings = await getPaintings();
  const collection = buildCollections(paintings).find((c) => c.slug === slug);
  return {
    title: collection?.title ?? "Collection",
    description: collection?.description,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const paintings = await getPaintings();
  const collections = buildCollections(paintings);
  const collection = collections.find((c) => c.slug === slug);
  if (!collection) notFound();

  const items = getByCollection(paintings, slug);

  return (
    <>
      <CollectionDetailHeader collection={collection} />
      <section className="mx-auto max-w-7xl bg-[#faf7f2] px-4 py-16 lg:px-8 lg:py-20">
        <PaintingGrid paintings={items} />
      </section>
    </>
  );
}

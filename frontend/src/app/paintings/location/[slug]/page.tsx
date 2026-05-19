import { PaintingGrid } from "@/components/paintings/PaintingGrid";
import { PageHeader } from "@/components/ui/PageHeader";
import { locations } from "@/lib/navigation";
import { getByLocation, getPaintings } from "@/lib/paintings";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return locations.map((l) => ({ slug: l.slug }));
}

export default async function LocationPage({ params }: Props) {
  const { slug } = await params;
  const location = locations.find((l) => l.slug === slug);
  if (!location) notFound();

  const paintings = await getPaintings();

  return (
    <>
      <PageHeader
        title={location.label}
        description={`${location.region} — paysages et scènes de vie.`}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <PaintingGrid paintings={getByLocation(paintings, slug)} />
      </section>
    </>
  );
}

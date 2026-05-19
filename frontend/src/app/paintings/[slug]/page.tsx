import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButtons } from "@/components/paintings/AddToCartButtons";
import { PaintingDetailMedia } from "@/components/paintings/PaintingDetailMedia";
import { RoomVisualizer } from "@/components/paintings/RoomVisualizer";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatPrice, getPainting, getStaticPaintingSlugs } from "@/lib/paintings";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getStaticPaintingSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const painting = await getPainting(slug);
  return { title: painting?.title ?? "Peinture" };
}

export default async function PaintingDetailPage({ params }: Props) {
  const { slug } = await params;
  const painting = await getPainting(slug);
  if (!painting) notFound();

  const sold = painting.status === "sold";

  return (
    <>
      <PageHeader title={painting.title} />
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <PaintingDetailMedia painting={painting} />
          <div>
            <p className="text-sm text-stone-500">
              {painting.year} · {painting.dimensions} · {painting.medium}
            </p>
            <p className="mt-6 text-stone-700">{painting.description}</p>
            <p className="mt-8 font-serif text-2xl text-amber-800">
              {sold
                ? painting.printAvailable
                  ? `Vendu — tirage dès ${formatPrice(painting.printPrice ?? 0)}`
                  : "Vendu"
                : formatPrice(painting.price)}
            </p>
            <AddToCartButtons painting={painting} />
            <RoomVisualizer
              paintingImage={painting.image}
              paintingTitle={painting.title}
              dimensions={painting.dimensions}
            />
            <p className="mt-8 text-sm text-stone-500">
              Livraison offerte au Maroc et en Europe sur les originaux. Emballage professionnel.
            </p>
            <Link href="/paintings" className="mt-6 inline-block text-sm text-amber-800 hover:underline">
              ← Retour au catalogue
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

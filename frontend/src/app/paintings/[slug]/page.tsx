import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButtons } from "@/components/paintings/AddToCartButtons";
import { PaintingDetailMedia } from "@/components/paintings/PaintingDetailMedia";
import { PaintingRelated } from "@/components/paintings/PaintingRelated";
import { RoomVisualizer } from "@/components/paintings/RoomVisualizer";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatPrice, getPainting, getPaintings, getStaticPaintingSlugs } from "@/lib/paintings";
import {
  resolveShippingZone,
  shippingCostEur,
  shippingDelayHint,
  shippingZoneLabel,
} from "@/lib/shipping";

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
  const [painting, allPaintings] = await Promise.all([getPainting(slug), getPaintings()]);
  if (!painting) notFound();

  const sold = painting.status === "sold";
  const canPrint = Boolean(painting.printAvailable && (painting.printPrice ?? 0) > 0);
  const zone = resolveShippingZone("MA");
  const sampleShipping = shippingCostEur("MA");

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
                ? canPrint
                  ? `Vendu — tirage dès ${formatPrice(painting.printPrice ?? 0)}`
                  : "Vendu"
                : canPrint
                  ? `${formatPrice(painting.price)} · tirage dès ${formatPrice(painting.printPrice ?? 0)}`
                  : formatPrice(painting.price)}
            </p>
            <AddToCartButtons painting={painting} />
            <RoomVisualizer
              paintingImage={painting.image}
              paintingTitle={painting.title}
              dimensions={painting.dimensions}
            />
            <div className="mt-8 space-y-2 text-sm text-stone-500">
              <p>
                Livraison {shippingZoneLabel(zone)} à partir de{" "}
                {sampleShipping > 0 ? formatPrice(sampleShipping) : "sur devis"} — délai indicatif{" "}
                {shippingDelayHint(zone)}. Emballage professionnel et assurance transport.
              </p>
              <p>
                Une question sur cette œuvre ?{" "}
                <Link
                  href={`/contact?subject=${encodeURIComponent(`Œuvre : ${painting.title}`)}`}
                  className="text-amber-800 underline hover:text-amber-950"
                >
                  Contactez l&apos;atelier
                </Link>
              </p>
            </div>
            <Link href="/paintings" className="mt-6 inline-block text-sm text-amber-800 hover:underline">
              ← Retour au catalogue
            </Link>
          </div>
        </div>
        <PaintingRelated paintings={allPaintings} currentSlug={slug} />
      </section>
    </>
  );
}

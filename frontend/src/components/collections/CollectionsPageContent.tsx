import Link from "next/link";
import { CollectionCard } from "@/components/collections/CollectionCard";
import {
  homeBtnPrimary,
  homeEyebrow,
  homeLead,
  homeTitle,
  homeTitleItalic,
} from "@/components/home/home-theme";
import type { Collection } from "@/lib/types";

type Props = {
  collections: Collection[];
  totalPaintings: number;
};

export function CollectionsPageContent({ collections, totalPaintings }: Props) {
  return (
    <div className="bg-[#faf7f2]">
      <section className="relative overflow-hidden border-b border-stone-200/80 bg-[#f6f1ea]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center lg:px-8 lg:py-24">
          <p className={homeEyebrow}>Galerie</p>
          <h1 className={`mt-3 ${homeTitle} sm:text-5xl`}>
            Les collections
            <span className={`mt-2 block ${homeTitleItalic}`}>de l&apos;atelier</span>
          </h1>
          <p className={`mx-auto mt-6 max-w-2xl ${homeLead}`}>
            Six univers thématiques regroupant {totalPaintings} toiles — figures symboliques,
            oiseaux, terres chaudes, nocturnes, signes célestes et petits formats.
          </p>
          <Link href="/paintings" className={`mt-10 inline-flex ${homeBtnPrimary}`}>
            Voir toutes les œuvres
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-12 max-w-xl border-l border-amber-900/30 pl-6 md:pl-8">
            <p className={homeEyebrow}>Parcourir</p>
            <h2 className={`mt-2 ${homeTitle}`}>
              Choisissez
              <span className={`mt-1 block ${homeTitleItalic}`}>votre univers</span>
            </h2>
          </div>

          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
            {collections.map((col) => (
              <CollectionCard key={col.slug} collection={col} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

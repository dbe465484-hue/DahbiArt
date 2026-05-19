import Link from "next/link";
import { ArtisticPaintingFrame } from "@/components/paintings/ArtisticPaintingFrame";
import { PaintingFrame } from "@/components/paintings/PaintingFrame";
import {
  homeEyebrow,
  homeLead,
  homeLink,
  homeLinkUnderline,
  homeTitle,
  homeTitleItalic,
} from "@/components/home/home-theme";
import type { Collection } from "@/lib/types";

export function CollectionDetailHeader({ collection }: { collection: Collection }) {
  return (
    <section className="border-b border-stone-200/80 bg-[#f6f1ea]">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <Link
          href="/collections"
          className={`mb-8 inline-block text-sm uppercase tracking-[0.14em] text-stone-500 transition hover:text-amber-900`}
        >
          ← Toutes les collections
        </Link>

        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <ArtisticPaintingFrame>
              <PaintingFrame
                src={collection.image}
                alt={collection.title}
                aspectClass="aspect-[4/3]"
                sizes="(max-width:1024px) 100vw, 40vw"
                priority
                imageClassName="p-2"
              />
            </ArtisticPaintingFrame>
          </div>

          <div className="lg:col-span-7">
            <div className="border-l border-amber-900/30 pl-6 md:pl-8">
              <p className={homeEyebrow}>{collection.themes}</p>
              <h1 className={`mt-2 ${homeTitle} sm:text-4xl lg:text-5xl`}>
                {collection.title}
              </h1>
              <p className={`mt-6 ${homeLead}`}>{collection.description}</p>
              <p className="mt-4 text-sm uppercase tracking-[0.12em] text-stone-500">
                {collection.count} œuvre{collection.count > 1 ? "s" : ""}
                {collection.availableCount > 0 && (
                  <>
                    {" "}
                    ·{" "}
                    <span className="text-amber-900">
                      {collection.availableCount} disponible
                      {collection.availableCount > 1 ? "s" : ""}
                    </span>
                  </>
                )}
              </p>
              <Link
                href="/paintings"
                className={`mt-8 inline-block ${homeLink} ${homeLinkUnderline}`}
              >
                Toute la galerie →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

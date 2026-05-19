"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { Collection } from "@/lib/types";
import { HomeSection } from "./HomeSection";
import { HomeSectionHeader } from "./HomeSectionHeader";
import { homeCarouselBtn, homeFrame, homeLink, homeLinkUnderline } from "./home-theme";

type Props = { collections: Collection[] };

export function CollectionsCarousel({ collections }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 360, behavior: "smooth" });
  };

  return (
    <HomeSection variant="cream">
      <HomeSectionHeader
        eyebrow="Collections"
        title="Dernières"
        titleAccent="séries"
        href="/collections"
        linkLabel="Toutes les collections →"
      />

      <div className="relative">
        <button
          type="button"
          onClick={() => scroll(-1)}
          className={`${homeCarouselBtn} -left-2`}
          aria-label="Précédent"
        >
          ‹
        </button>
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
        >
          {collections.map((col) => (
            <Link
              key={col.slug}
              href={`/collections/${col.slug}`}
              className="group w-[min(340px,85vw)] shrink-0 snap-start"
            >
              <div className={`${homeFrame} overflow-hidden`}>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={col.image}
                    alt={col.title}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                    sizes="340px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/75 via-stone-900/15 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5 text-white">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/75 sm:text-sm">
                      {col.count}+ œuvres
                    </p>
                    <h3 className="mt-1 font-serif text-2xl font-light">{col.title}</h3>
                    <span
                      className={`mt-3 inline-block ${homeLink} !text-white/90 ${homeLinkUnderline} !border-white/40 group-hover:!border-white`}
                    >
                      Découvrir →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <button
          type="button"
          onClick={() => scroll(1)}
          className={`${homeCarouselBtn} -right-2`}
          aria-label="Suivant"
        >
          ›
        </button>
      </div>

      <p className="mt-8 text-center sm:hidden">
        <Link href="/collections" className={`${homeLink} ${homeLinkUnderline}`}>
          Toutes les collections →
        </Link>
      </p>
    </HomeSection>
  );
}

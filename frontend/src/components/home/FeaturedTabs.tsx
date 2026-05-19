"use client";

import Link from "next/link";
import { PaintingFrame } from "@/components/paintings/PaintingFrame";
import { useState } from "react";
import { ARTIST } from "@/lib/artist";
import { formatPrice } from "@/lib/paintings";
import type { Painting } from "@/lib/types";
import { HomeSection } from "./HomeSection";
import {
  homeBtnPrimary,
  homeEyebrow,
  homeFrame,
  homeTitle,
  homeTitleItalic,
} from "./home-theme";

type Tab = "available" | "sold";

function StatusBadge({ painting }: { painting: Painting }) {
  if (painting.status === "sold") {
    return (
      <span className="inline-block bg-stone-900/90 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-white backdrop-blur-sm">
        {painting.printAvailable ? "Tirages disponibles" : "Vendu"}
      </span>
    );
  }
  return (
    <span className="inline-block bg-amber-900/90 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-white backdrop-blur-sm">
      Original disponible
    </span>
  );
}

function FeaturedHeroCard({ painting, index }: { painting: Painting; index: number }) {
  const sold = painting.status === "sold";
  const priceLabel = sold
    ? painting.printAvailable
      ? `À partir de ${formatPrice(painting.printPrice ?? 0)}`
      : "Vendu"
    : formatPrice(painting.price);

  return (
    <Link
      href={`/paintings/${painting.slug}`}
      className="group relative flex h-full min-h-[360px] flex-col lg:min-h-0"
    >
      <div
        className={`relative flex-1 overflow-hidden ${homeFrame} shadow-[0_20px_56px_-16px_rgba(28,25,23,0.45)] transition duration-500 group-hover:shadow-[0_28px_64px_-12px_rgba(28,25,23,0.5)]`}
      >
        <PaintingFrame
          src={painting.image}
          alt={painting.title}
          aspectClass="aspect-[3/4] h-full w-full lg:aspect-auto lg:min-h-[520px]"
          sizes="(max-width:1024px) 100vw, 55vw"
          priority
          imageClassName="p-3 transition duration-700 group-hover:scale-[1.015]"
        />

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-stone-900/25 via-transparent to-transparent"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute right-5 top-5 font-serif text-6xl font-light leading-none text-white/20 md:text-7xl"
          aria-hidden
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="absolute left-5 top-5">
          <StatusBadge painting={painting} />
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-900/85 via-stone-900/40 to-transparent px-5 pb-5 pt-16 md:px-7 md:pb-7">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/70">
            {ARTIST.name} · {painting.year} · {painting.dimensions}
          </p>
          <h3 className="mt-2 font-serif text-2xl font-light text-white md:text-3xl">
            {painting.title}
          </h3>
          <p className="mt-2 text-sm tracking-wide text-amber-100/95">{priceLabel}</p>
          <span className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/0 transition duration-300 group-hover:text-white/90">
            Voir l&apos;œuvre
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function FeaturedCompactCard({ painting, index }: { painting: Painting; index: number }) {
  const sold = painting.status === "sold";
  const priceLabel = sold
    ? painting.printAvailable
      ? `À partir de ${formatPrice(painting.printPrice ?? 0)}`
      : "Vendu"
    : formatPrice(painting.price);

  return (
    <Link
      href={`/paintings/${painting.slug}`}
      className="group flex h-full gap-4 sm:gap-5"
    >
      <div
        className={`relative w-[38%] max-w-[148px] shrink-0 overflow-hidden sm:max-w-[168px] ${homeFrame} shadow-[0_12px_32px_-12px_rgba(28,25,23,0.35)] transition duration-500 group-hover:shadow-[0_16px_40px_-10px_rgba(28,25,23,0.42)]`}
      >
        <PaintingFrame
          src={painting.image}
          alt={painting.title}
          aspectClass="aspect-[4/5]"
          sizes="168px"
          imageClassName="p-1.5 transition duration-700 group-hover:scale-[1.03]"
        />
        <span
          className="pointer-events-none absolute bottom-2 right-2 font-serif text-2xl font-light text-stone-900/10"
          aria-hidden
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center border-l border-amber-900/15 py-1 pl-4 sm:pl-5">
        <StatusBadge painting={painting} />
        <h3 className="mt-3 font-serif text-lg leading-snug text-stone-900 transition group-hover:text-amber-900 md:text-xl">
          {painting.title}
        </h3>
        <p className="mt-2 text-xs uppercase tracking-[0.12em] text-stone-500">
          {painting.dimensions}
        </p>
        <p className="mt-2 text-sm font-medium text-amber-900/90">{priceLabel}</p>
        <span className="mt-4 text-xs uppercase tracking-[0.14em] text-stone-400 transition group-hover:text-amber-900">
          Découvrir →
        </span>
      </div>
    </Link>
  );
}

export function FeaturedTabs({
  available,
  sold,
}: {
  available: Painting[];
  sold: Painting[];
}) {
  const [tab, setTab] = useState<Tab>("available");
  const items = tab === "available" ? available : sold;
  const gridItems = items.slice(0, 3);
  const [hero, ...compact] = gridItems;

  return (
    <HomeSection variant="paper">
      <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl border-l border-amber-900/30 pl-6 md:pl-8">
          <p className={homeEyebrow}>Sélection</p>
          <h2 className={`mt-2 ${homeTitle}`}>
            En vedette
            <span className={`mt-1 block ${homeTitleItalic}`}>de l&apos;atelier</span>
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-stone-600">
            Originaux et tirages signés, choisis parmi les dernières créations de l&apos;atelier.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Filtrer les œuvres"
          className="inline-flex self-start border border-stone-200 bg-white p-1 shadow-sm md:self-auto"
        >
          {(["available", "sold"] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`relative px-5 py-3 text-xs uppercase tracking-[0.14em] transition-all duration-300 sm:text-sm ${
                tab === key
                  ? "bg-stone-900 text-white shadow-sm"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              {key === "available" ? "Disponibles" : "Vendus · Tirages"}
            </button>
          ))}
        </div>
      </div>

      {gridItems.length > 0 ? (
        <div
          key={tab}
          className="grid gap-8 lg:grid-cols-12 lg:grid-rows-2 lg:gap-x-8 lg:gap-y-6 [&]:animate-[featuredFade_0.55s_ease-out]"
        >
          {hero && (
            <div className="lg:col-span-7 lg:row-span-2">
              <FeaturedHeroCard painting={hero} index={0} />
            </div>
          )}

          <div className="flex flex-col gap-8 lg:col-span-5 lg:row-span-2 lg:justify-center lg:gap-10 lg:py-4">
            {compact.map((p, i) => (
              <div
                key={p.id}
                className="border-t border-stone-200/80 pt-8 first:border-t-0 first:pt-0 lg:border-t lg:pt-10 lg:first:pt-0"
              >
                <FeaturedCompactCard painting={p} index={i + 1} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="rounded-sm border border-dashed border-stone-300 bg-white/50 py-16 text-center text-stone-500">
          Aucune œuvre dans cette sélection pour le moment.
        </p>
      )}

      <div className="mt-14 border-t border-stone-200/80 pt-12 text-center">
        <Link href="/paintings" className={homeBtnPrimary}>
          Voir toute la galerie
          <span aria-hidden>→</span>
        </Link>
      </div>
    </HomeSection>
  );
}

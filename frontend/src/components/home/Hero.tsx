"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ARTIST } from "@/lib/artist";
import { formatPrice } from "@/lib/paintings";
import type { Painting } from "@/lib/types";

export function Hero({ featured }: { featured: Painting }) {
  const { addItem } = useCart();

  return (
    <section className="relative min-h-[85vh] overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={ARTIST.heroPoster}
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={ARTIST.heroVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-stone-900/80" />

      <div className="relative mx-auto flex min-h-[85vh] max-w-7xl flex-col items-center justify-end px-4 pb-16 pt-32 text-center text-white lg:px-8">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/80">
          En vedette
        </p>
        <p className="mb-6 text-sm text-white/90">
          Peinture à l&apos;huile originale · Livraison offerte
        </p>

        <div className="mb-8 max-w-md">
          <div className="relative mx-auto aspect-[4/5] w-48 overflow-hidden shadow-2xl sm:w-56">
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              className="object-cover"
              priority
              sizes="224px"
            />
          </div>
          <h1 className="mt-6 font-serif text-2xl sm:text-3xl">{featured.title}</h1>
          <p className="mt-1 text-sm text-white/80">
            {featured.year} · {featured.dimensions} · {formatPrice(featured.price)}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={`/paintings/${featured.slug}`}
            className="min-w-[140px] border border-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-white hover:text-stone-900"
          >
            Voir l&apos;original
          </Link>
          <button
            type="button"
            onClick={() => addItem(featured, "original")}
            className="min-w-[140px] bg-white px-6 py-3 text-xs uppercase tracking-widest text-stone-900 hover:bg-stone-100"
          >
            Acheter
          </button>
        </div>

        <p className="mt-12 text-sm tracking-wide text-white/70">
          {ARTIST.brand}
        </p>
        <p className="text-xs text-white/60">{ARTIST.tagline}</p>
        <a href="#collections" className="mt-8 animate-bounce text-white/60" aria-label="Défiler">
          ↓
        </a>
      </div>
    </section>
  );
}

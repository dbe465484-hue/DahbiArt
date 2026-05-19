"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ARTIST } from "@/lib/artist";
import type { Painting } from "@/lib/types";

type Slide = {
  id: string;
  artistLine: string;
  title: string;
  subtitle: string;
  href: string;
  cta: string;
};

function buildSlides(featured: Painting): Slide[] {
  return [
    {
      id: "featured",
      artistLine: ARTIST.name.toUpperCase(),
      title: featured.title.toUpperCase(),
      subtitle: `${featured.year} · Original disponible`,
      href: `/paintings/${featured.slug}`,
      cta: "Découvrir l'œuvre",
    },
    {
      id: "collection",
      artistLine: "COLLECTION",
      title: "FIGURES SYMBOLIQUES",
      subtitle: "Silhouettes · Mouvement · Symbolisme",
      href: "/collections/figures-symboliques",
      cta: "Voir la collection",
    },
    {
      id: "commission",
      artistLine: ARTIST.name.toUpperCase(),
      title: "SUR COMMANDE",
      subtitle: "Une toile unique, pensée pour vous",
      href: "/commission",
      cta: "Demander une commande",
    },
  ];
}

export function HeroCarousel({ featured }: { featured: Painting }) {
  const slides = buildSlides(featured);
  const [active, setActive] = useState(0);
  const [videoOk, setVideoOk] = useState(true);

  const next = useCallback(() => {
    setActive((i) => (i + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const id = setInterval(next, 9000);
    return () => clearInterval(id);
  }, [next]);

  const slide = slides[active];

  const scrollDown = () => {
    document.getElementById("home-content")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[100dvh] w-full max-w-[100vw] overflow-hidden bg-black">
      {/* Vidéo plein écran sous la navbar transparente */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {videoOk ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={ARTIST.heroPoster}
            src={ARTIST.heroVideo}
            className="h-full w-full object-cover"
            onError={() => setVideoOk(false)}
          />
        ) : (
          <Image
            src={ARTIST.heroPoster}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}
      </div>
      <div className="absolute inset-0 z-[1] bg-black/40" />

      {/* Texte carousel par-dessus la vidéo */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pt-24 text-center text-white transition-opacity duration-1000 ${
            i === active ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.28em] text-white/90 sm:text-base">
            {s.artistLine}
          </p>
          <h1 className="w-full max-w-5xl break-words px-2 font-sans text-4xl font-normal uppercase tracking-[0.1em] sm:text-5xl md:text-6xl lg:text-7xl">
            {s.title}
          </h1>
          {s.subtitle && (
            <p className="mt-5 text-base uppercase tracking-[0.14em] text-white/85 sm:text-lg">{s.subtitle}</p>
          )}
          <Link
            href={s.href}
            className="mt-12 min-w-[220px] bg-white px-10 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-stone-100"
          >
            {s.cta}
          </Link>
        </div>
      ))}

      <div className="absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActive(i)}
            className={`h-1 transition-all ${i === active ? "w-10 bg-white" : "w-1 bg-white/40"}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={scrollDown}
        className="absolute bottom-8 left-1/2 z-20 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-white/60 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
        aria-label="Défiler vers le contenu"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </section>
  );
}

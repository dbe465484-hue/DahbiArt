"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PaintingFrame } from "@/components/paintings/PaintingFrame";
import type { Painting } from "@/lib/types";
import { homeCarouselBtn, homeFrame } from "./home-theme";

const INTERVAL_MS = 4500;

export function CommissionPaintingCarousel({ paintings }: { paintings: Painting[] }) {
  const count = paintings.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    if (count < 2) return;
    setActive((i) => (i + 1) % count);
  }, [count]);

  const prev = useCallback(() => {
    if (count < 2) return;
    setActive((i) => (i - 1 + count) % count);
  }, [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    const id = setInterval(next, INTERVAL_MS);
    return () => clearInterval(id);
  }, [next, count, paused]);

  if (count === 0) return null;

  const current = paintings[active];

  return (
    <div
      className={`relative mx-auto w-full max-w-md lg:max-w-none ${homeFrame}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Link
        href={`/paintings/${current.slug}`}
        className="group block"
        aria-label={`Voir ${current.title}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          {paintings.map((p, i) => (
            <div
              key={p.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                i === active ? "z-10 opacity-100" : "z-0 opacity-0"
              }`}
              aria-hidden={i !== active}
            >
              <PaintingFrame
                src={p.image}
                alt={p.title}
                aspectClass="aspect-[4/5] h-full w-full"
                sizes="(max-width:1024px) 100vw, 50vw"
                priority={i === 0}
                imageClassName="transition duration-700 group-hover:scale-[1.02]"
              />
            </div>
          ))}
        </div>

        <div className="mt-3 border-t border-stone-200/80 pt-3 text-center">
          <p className="font-serif text-lg text-stone-900 transition group-hover:text-amber-900">
            {current.title}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-stone-500">
            {current.year} · {current.dimensions}
          </p>
        </div>
      </Link>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              prev();
            }}
            className={`${homeCarouselBtn} left-2`}
            aria-label="Tableau précédent"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              next();
            }}
            className={`${homeCarouselBtn} right-2`}
            aria-label="Tableau suivant"
          >
            ›
          </button>
          <p className="pointer-events-none absolute top-4 right-4 z-20 bg-white/85 px-2.5 py-1 text-xs tabular-nums uppercase tracking-[0.12em] text-stone-600 backdrop-blur-sm">
            {active + 1} / {count}
          </p>
        </>
      )}

      <span
        className="pointer-events-none absolute -bottom-1 -right-1 h-16 w-16 border-b border-r border-amber-800/35"
        aria-hidden
      />
    </div>
  );
}

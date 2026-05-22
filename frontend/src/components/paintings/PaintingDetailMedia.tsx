"use client";

import { useState } from "react";
import { ArtisticPaintingFrame } from "@/components/paintings/ArtisticPaintingFrame";
import { FavoriteButton } from "@/components/paintings/FavoriteButton";
import { PaintingFrame } from "@/components/paintings/PaintingFrame";
import { PaintingImageLightbox } from "@/components/paintings/PaintingImageLightbox";
import { resolvePaintingImageSrc } from "@/lib/paintings";
import type { Painting } from "@/lib/types";

export function PaintingDetailMedia({ painting }: { painting: Painting }) {
  const [lightbox, setLightbox] = useState(false);
  const imageSrc = resolvePaintingImageSrc(painting.image, painting.slug);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setLightbox(true)}
        className="group block w-full text-left"
        aria-label={`Agrandir ${painting.title}`}
      >
        <ArtisticPaintingFrame>
          <PaintingFrame
            src={imageSrc}
            alt={painting.title}
            aspectClass="aspect-[4/5]"
            sizes="(max-width:1024px) 100vw, 50vw"
            priority
            imageClassName="p-2 transition duration-300 group-hover:opacity-95"
          />
        </ArtisticPaintingFrame>
        <span className="mt-2 inline-block text-xs uppercase tracking-[0.14em] text-stone-400 transition group-hover:text-amber-900">
          Cliquer pour agrandir
        </span>
      </button>
      <FavoriteButton paintingSlug={painting.slug} className="absolute right-4 top-4 z-10" />
      {painting.status === "sold" && (
        <span className="absolute left-4 top-4 z-10 bg-stone-900/85 px-3 py-1.5 text-xs uppercase tracking-wider text-white backdrop-blur-sm">
          Vendu
        </span>
      )}
      <PaintingImageLightbox
        src={imageSrc}
        alt={painting.title}
        open={lightbox}
        onClose={() => setLightbox(false)}
      />
    </div>
  );
}

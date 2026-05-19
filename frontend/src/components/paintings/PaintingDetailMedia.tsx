"use client";

import { ArtisticPaintingFrame } from "@/components/paintings/ArtisticPaintingFrame";
import { FavoriteButton } from "@/components/paintings/FavoriteButton";
import { PaintingFrame } from "@/components/paintings/PaintingFrame";
import type { Painting } from "@/lib/types";

export function PaintingDetailMedia({ painting }: { painting: Painting }) {
  return (
    <div className="relative">
      <ArtisticPaintingFrame>
        <PaintingFrame
          src={painting.image}
          alt={painting.title}
          aspectClass="aspect-[4/5]"
          sizes="(max-width:1024px) 100vw, 50vw"
          priority
          imageClassName="p-2"
        />
      </ArtisticPaintingFrame>
      <FavoriteButton paintingSlug={painting.slug} className="absolute right-4 top-4 z-10" />
      {painting.status === "sold" && (
        <span className="absolute left-4 top-4 z-10 bg-stone-900/85 px-3 py-1.5 text-xs uppercase tracking-wider text-white backdrop-blur-sm">
          Vendu
        </span>
      )}
    </div>
  );
}

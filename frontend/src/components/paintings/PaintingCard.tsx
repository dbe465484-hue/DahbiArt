"use client";

import Link from "next/link";
import { ArtisticPaintingFrame } from "@/components/paintings/ArtisticPaintingFrame";
import { FavoriteButton } from "@/components/paintings/FavoriteButton";
import { PaintingFrame } from "@/components/paintings/PaintingFrame";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/paintings";
import type { Painting } from "@/lib/types";

type Props = { painting: Painting; compact?: boolean };

export function PaintingCard({ painting, compact }: Props) {
  const { addItem } = useCart();
  const sold = painting.status === "sold";
  const priceLabel = sold
    ? painting.printAvailable
      ? `Vendu — tirage ${formatPrice(painting.printPrice ?? 0)}`
      : "Vendu"
    : formatPrice(painting.price);

  return (
    <article className="group">
      <div className="relative">
        <Link href={`/paintings/${painting.slug}`} className="block">
          <ArtisticPaintingFrame>
            <PaintingFrame
              src={painting.image}
              alt={painting.title}
              aspectClass={compact ? "aspect-[4/5]" : "aspect-[3/4]"}
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              imageClassName="p-1.5 transition duration-500 group-hover:scale-[1.015]"
            />
          </ArtisticPaintingFrame>
        </Link>
        <FavoriteButton
          paintingSlug={painting.slug}
          className="absolute right-3 top-3 z-10"
        />
        {sold && (
          <span className="absolute left-3 top-3 z-10 bg-stone-900/85 px-2.5 py-1 text-xs uppercase tracking-wider text-white backdrop-blur-sm">
            Vendu
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.1em] text-stone-500">
          {painting.year} · {painting.dimensions}
          {sold && painting.printAvailable ? " · Tirages disponibles" : ""}
        </p>
        <h3 className="mt-1.5 font-serif text-lg text-stone-900">
          <Link href={`/paintings/${painting.slug}`} className="hover:text-amber-900">
            {painting.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm font-medium text-amber-900/90">{priceLabel}</p>
        <div className="mt-4 flex gap-2">
          <Link
            href={`/paintings/${painting.slug}`}
            className="flex-1 border border-stone-300 py-2.5 text-center text-sm uppercase tracking-wider transition hover:border-stone-900"
          >
            Voir
          </Link>
          {!sold && (
            <button
              type="button"
              onClick={() => addItem(painting, "original")}
              className="flex-1 bg-stone-900 py-2.5 text-sm uppercase tracking-wider text-white transition hover:bg-amber-950"
            >
              Ajouter
            </button>
          )}
          {sold && painting.printAvailable && (
            <button
              type="button"
              onClick={() => addItem(painting, "print")}
              className="flex-1 bg-stone-900 py-2.5 text-sm uppercase tracking-wider text-white transition hover:bg-amber-950"
            >
              Tirage
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

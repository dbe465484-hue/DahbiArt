import Image from "next/image";
import Link from "next/link";
import { formatPrice, paintingImage } from "@/lib/paintings";
import type { Painting } from "@/lib/types";

export function PaintingRelated({
  paintings,
  currentSlug,
}: {
  paintings: Painting[];
  currentSlug: string;
}) {
  const current = paintings.find((p) => p.slug === currentSlug);
  const sameCollection = current?.collection
    ? paintings.filter(
        (p) => p.slug !== currentSlug && p.collection === current.collection,
      )
    : [];

  const fallback = paintings.filter(
    (p) => p.slug !== currentSlug && p.status === "available",
  );

  const items = (sameCollection.length >= 2 ? sameCollection : fallback).slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section className="mt-20 border-t border-stone-200 pt-16">
      <h2 className="font-serif text-2xl text-stone-900">Œuvres similaires</h2>
      <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => (
          <li key={p.slug}>
            <Link href={`/paintings/${p.slug}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#f5f2eb]">
                <Image
                  src={p.image || paintingImage(p.slug)}
                  alt={p.title}
                  fill
                  className="object-contain p-2 transition duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width:640px) 50vw, 25vw"
                />
              </div>
              <p className="mt-3 font-serif text-lg text-stone-900 group-hover:text-amber-900">
                {p.title}
              </p>
              <p className="text-sm text-stone-500">
                {p.status === "sold" ? "Vendu" : formatPrice(p.price)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

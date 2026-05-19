import Link from "next/link";
import { ArtisticPaintingFrame } from "@/components/paintings/ArtisticPaintingFrame";
import { PaintingFrame } from "@/components/paintings/PaintingFrame";
import type { Collection } from "@/lib/types";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group flex h-full flex-col"
    >
      <ArtisticPaintingFrame className="flex-1">
        <PaintingFrame
          src={collection.image}
          alt={collection.title}
          aspectClass="aspect-[4/3]"
          sizes="(max-width:768px) 100vw, 33vw"
          imageClassName="p-2 transition duration-700 group-hover:scale-[1.02]"
        />
      </ArtisticPaintingFrame>

      {collection.previewImages.length > 1 && (
        <div className="-mt-1 flex justify-center gap-2 px-4 pb-1">
          {collection.previewImages.slice(0, 3).map((src, i) => (
            <div
              key={`${collection.slug}-preview-${i}`}
              className="relative h-14 w-12 overflow-hidden border border-stone-200/80 bg-[#f5f2eb] shadow-sm sm:h-16 sm:w-14"
            >
              <PaintingFrame
                src={src}
                alt=""
                aspectClass="aspect-square h-full w-full"
                sizes="56px"
                imageClassName="p-0.5"
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 border-l border-amber-900/25 pl-5">
        <p className="text-[0.65rem] uppercase tracking-[0.16em] text-amber-900/80">
          {collection.themes}
        </p>
        <h2 className="mt-2 font-serif text-xl text-stone-900 transition group-hover:text-amber-900 md:text-2xl">
          {collection.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">
          {collection.description}
        </p>
        <p className="mt-4 text-xs uppercase tracking-[0.12em] text-stone-500">
          {collection.count} œuvre{collection.count > 1 ? "s" : ""}
          {collection.availableCount > 0 && (
            <span className="text-amber-900/90">
              {" "}
              · {collection.availableCount} disponible
              {collection.availableCount > 1 ? "s" : ""}
            </span>
          )}
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-xs uppercase tracking-[0.14em] text-stone-400 transition group-hover:text-amber-900">
          Explorer la collection
          <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

import type { Painting } from "@/lib/types";
import { PaintingCard } from "./PaintingCard";

export function PaintingGrid({
  paintings,
  compact,
}: {
  paintings: Painting[];
  compact?: boolean;
}) {
  if (paintings.length === 0) {
    return (
      <p className="py-16 text-center text-stone-500">
        Aucune œuvre dans cette sélection pour le moment.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
      {paintings.map((p) => (
        <PaintingCard key={p.id} painting={p} compact={compact} />
      ))}
    </div>
  );
}

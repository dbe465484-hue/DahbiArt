"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PaintingGrid } from "@/components/paintings/PaintingGrid";
import { searchPaintings } from "@/lib/paintings";
import type { Painting } from "@/lib/types";

export function PaintingsCatalog({ paintings }: { paintings: Painting[] }) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";

  const filtered = useMemo(
    () => (query ? searchPaintings(paintings, query, 999) : paintings),
    [paintings, query],
  );

  if (query && filtered.length === 0) {
    return (
      <p className="text-center text-stone-600">
        Aucune œuvre ne correspond à « {query} ».{" "}
        <a href="/paintings" className="text-amber-900 hover:underline">
          Voir toute la galerie
        </a>
      </p>
    );
  }

  return <PaintingGrid paintings={filtered} />;
}

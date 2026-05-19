import { getPaintings } from "./paintings";
import type { Painting } from "./types";

export type PaintingIndex = {
  paintings: Painting[];
  idBySlug: Map<string, string>;
  slugById: Map<string, string>;
};

let cache: PaintingIndex | null = null;
let loading: Promise<PaintingIndex> | null = null;

/** Index slug ↔ id UUID (API) — partagé wishlist / panier */
export async function getPaintingIndex(): Promise<PaintingIndex> {
  if (cache) return cache;
  if (loading) return loading;

  loading = (async () => {
    const paintings = await getPaintings();
    const idBySlug = new Map<string, string>();
    const slugById = new Map<string, string>();
    for (const p of paintings) {
      idBySlug.set(p.slug, p.id);
      slugById.set(p.id, p.slug);
    }
    cache = { paintings, idBySlug, slugById };
    loading = null;
    return cache;
  })();

  return loading;
}

export function clearPaintingIndexCache() {
  cache = null;
  loading = null;
}

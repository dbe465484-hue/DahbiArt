import catalog from "@/data/paintings-catalog.json";
import type { Collection, Painting } from "./types";

import { fetchApi } from "./fetch-api";

/** Images locales (dossier `tableaux/` → `npm run tableaux:sync`) */
export const paintingImage = (slug: string) => `/paintings/${slug}.webp`;

export const PAINTING_PLACEHOLDER = "/paintings/placeholder.svg";

/** URL affichable : API/Blob, chemin local, ou placeholder. */
export function resolvePaintingImageSrc(
  image: string | undefined | null,
  slug: string,
): string {
  const trimmed = image?.trim();
  if (
    trimmed &&
    (trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("/uploads/") ||
      trimmed.startsWith("/paintings/"))
  ) {
    return trimmed;
  }
  return paintingImage(slug);
}

const COLLECTION_DEFS = [
  {
    slug: "figures-symboliques",
    title: "Figures symboliques",
    description:
      "Silhouettes humaines stylisées, corps en mouvement et présences graphiques — l'émotion avant le réalisme.",
    themes: "Figures · Mouvement · Symbolisme",
    coverSlug: "oeuvre-9404",
  },
  {
    slug: "oiseaux-et-envol",
    title: "Oiseaux & envol",
    description:
      "Oiseaux en vol, figures ailées et rencontres entre le ciel et le corps — messagers d'atelier.",
    themes: "Oiseaux · Vol · Liberté",
    coverSlug: "oeuvre-9403",
  },
  {
    slug: "terres-chaudes",
    title: "Terres chaudes",
    description:
      "Ocres, jaunes miel et terres brûlées — la chaleur du Maroc dans des compositions lumineuses.",
    themes: "Ocre · Lumière · Chaleur",
    coverSlug: "oeuvre-9437",
  },
  {
    slug: "nocturnes",
    title: "Nocturnes",
    description:
      "Fonds bleu nuit, gris profond et contrastes — figures qui émergent de l'obscurité.",
    themes: "Nuit · Bleu · Contraste",
    coverSlug: "oeuvre-9408",
  },
  {
    slug: "signes-et-etoiles",
    title: "Signes & étoiles",
    description:
      "Étoiles, symboles et marques graphiques — un langage intime entre signe et matière.",
    themes: "Étoiles · Signes · Graphisme",
    coverSlug: "oeuvre-9409",
  },
  {
    slug: "petits-formats",
    title: "Petits formats",
    description:
      "Toiles de format intime — idéales pour une première acquisition ou un cadeau précieux.",
    themes: "Format compact · Intimité",
    coverSlug: "oeuvre-9405",
  },
] as const;

/** Catalogue local — secours si l'API est indisponible */
function getStaticPaintings(): Painting[] {
  const raw = catalog.paintings as Array<Painting & { sourceFile?: string }>;
  return raw.map(({ sourceFile: _, ...p }) => ({
    ...p,
    medium: p.medium ?? "Huile sur toile",
    image: paintingImage(p.slug),
  }));
}

function paintingsInCollection(paintings: Painting[], slug: string) {
  return paintings.filter((p) => p.collection === slug);
}

function pickCoverImage(items: Painting[], fallbackSlug: string) {
  return (
    items.find((p) => p.featured)?.image ??
    items.find((p) => p.bestSeller)?.image ??
    items[0]?.image ??
    paintingImage(fallbackSlug)
  );
}

export function buildCollections(paintings: Painting[]): Collection[] {
  return COLLECTION_DEFS.map((c) => {
    const items = paintingsInCollection(paintings, c.slug);
    return {
      slug: c.slug,
      title: c.title,
      description: c.description,
      themes: c.themes,
      count: items.length,
      availableCount: items.filter((p) => p.status === "available").length,
      image: pickCoverImage(items, c.coverSlug),
      previewImages: items.slice(0, 3).map((p) => p.image),
    };
  }).filter((c) => c.count > 0);
}

/** Options pour le formulaire admin */
export const collectionOptions = COLLECTION_DEFS.map((c) => ({
  slug: c.slug,
  title: c.title,
}));

/** Slugs pour generateStaticParams (build / export statique) */
export function getStaticPaintingSlugs(): string[] {
  return getStaticPaintings().map((p) => p.slug);
}

export async function getPaintings(): Promise<Painting[]> {
  try {
    const res = await fetchApi("/paintings", { cache: "no-store" });
    if (!res.ok) return getStaticPaintings();
    const data = (await res.json()) as Painting[];
    return data.map((p) => ({
      ...p,
      price: Number(p.price),
      printPrice: p.printPrice != null ? Number(p.printPrice) : undefined,
      image: resolvePaintingImageSrc(p.image, p.slug),
    }));
  } catch {
    return getStaticPaintings();
  }
}

export async function getPainting(slug: string) {
  try {
    const res = await fetchApi(`/paintings/${slug}`, { cache: "no-store" });
    if (!res.ok) return getStaticPaintings().find((p) => p.slug === slug);
    const p = (await res.json()) as Painting;
    return {
      ...p,
      price: Number(p.price),
      printPrice: p.printPrice != null ? Number(p.printPrice) : undefined,
      image: resolvePaintingImageSrc(p.image, p.slug),
    };
  } catch {
    return getStaticPaintings().find((p) => p.slug === slug);
  }
}

export function getFeatured(paintings: Painting[]) {
  return paintings.find((p) => p.featured) ?? paintings[0];
}

export function getBestSellers(paintings: Painting[]) {
  return paintings.filter((p) => p.bestSeller);
}

export function getAvailable(paintings: Painting[]) {
  return paintings.filter((p) => p.status === "available");
}

export function getByLocation(paintings: Painting[], location: string) {
  return paintings.filter((p) => p.location === location);
}

export function getBySubject(paintings: Painting[], subject: string) {
  return paintings.filter((p) => p.subject === subject);
}

export function getByCollection(paintings: Painting[], collection: string) {
  return paintings.filter((p) => p.collection === collection);
}

export function formatPrice(amount: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

function collectionTitle(slug: string) {
  return COLLECTION_DEFS.find((c) => c.slug === slug)?.title ?? slug.replace(/-/g, " ");
}

/** Recherche textuelle sur toutes les métadonnées d'une œuvre */
export function searchPaintings(paintings: Painting[], query: string, limit = 8): Painting[] {
  const words = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return [];

  return paintings
    .filter((p) => {
      const haystack = [
        p.title,
        p.description,
        String(p.year),
        p.dimensions,
        p.medium,
        p.subject,
        p.location,
        p.collection,
        collectionTitle(p.collection),
        p.slug.replace(/-/g, " "),
        p.status === "available" ? "disponible original" : "vendu",
        p.printAvailable ? "tirage" : "",
      ]
        .join(" ")
        .toLowerCase();
      return words.every((w) => haystack.includes(w));
    })
    .slice(0, limit);
}

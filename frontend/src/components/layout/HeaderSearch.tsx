"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import catalog from "@/data/paintings-catalog.json";
import {
  formatPrice,
  paintingImage,
  searchPaintings,
} from "@/lib/paintings";
import type { Painting } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function staticPaintings(): Painting[] {
  return (catalog.paintings as unknown as Painting[]).map((p) => ({
    ...p,
    medium: p.medium ?? "Huile sur toile",
    image: paintingImage(p.slug),
  }));
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" strokeLinecap="round" />
    </svg>
  );
}

export function HeaderSearch({ iconClass }: { iconClass: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [loaded, setLoaded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadPaintings = useCallback(async () => {
    if (loaded) return;
    try {
      const res = await fetch(`${API_URL}/paintings`);
      if (res.ok) {
        const data = (await res.json()) as Painting[];
        setPaintings(
          data.map((p) => ({
            ...p,
            price: Number(p.price),
            printPrice: p.printPrice != null ? Number(p.printPrice) : undefined,
            image: p.image || paintingImage(p.slug),
          })),
        );
      } else {
        setPaintings(staticPaintings());
      }
    } catch {
      setPaintings(staticPaintings());
    } finally {
      setLoaded(true);
    }
  }, [loaded]);

  const openPanel = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
    void loadPaintings();
  }, [loadPaintings]);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 220);
  }, []);

  const results = useMemo(
    () => searchPaintings(paintings, query, 8),
    [paintings, query],
  );

  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={openPanel}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center ${iconClass}`}
        aria-label="Rechercher une œuvre"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => {
          if (open) setOpen(false);
          else openPanel();
        }}
      >
        <IconSearch />
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+0.65rem)] z-[80] w-[min(92vw,22rem)] overflow-hidden rounded-sm border border-stone-200 bg-white shadow-2xl sm:w-[24rem]"
          role="dialog"
          aria-label="Recherche d'œuvres"
          onMouseEnter={openPanel}
          onMouseLeave={scheduleClose}
        >
          <div className="border-b border-stone-100 p-3">
            <div className="flex items-center gap-2">
              <IconSearch className="shrink-0 text-stone-400" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Titre, année, collection…"
                className="min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
                autoComplete="off"
                aria-label="Rechercher par titre, année, description…"
              />
            </div>
          </div>

          <div className="max-h-[min(60vh,22rem)] overflow-y-auto">
            {!hasQuery ? (
              <p className="px-4 py-6 text-center text-sm text-stone-500">
                Tapez pour rechercher parmi les œuvres
              </p>
            ) : !loaded ? (
              <p className="px-4 py-6 text-center text-sm text-stone-500">Chargement…</p>
            ) : results.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-stone-500">
                Aucune œuvre trouvée pour « {query.trim()} »
              </p>
            ) : (
              <ul className="py-1">
                {results.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/paintings/${p.slug}`}
                      className="flex gap-3 px-3 py-2.5 transition hover:bg-stone-50"
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-[#f5f2eb]">
                        <Image
                          src={p.image || paintingImage(p.slug)}
                          alt=""
                          fill
                          className="object-contain p-0.5"
                          sizes="44px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-stone-900">{p.title}</p>
                        <p className="mt-0.5 text-xs text-stone-500">
                          {p.year} · {p.dimensions}
                          {p.status === "available" && p.price > 0
                            ? ` · ${formatPrice(p.price)}`
                            : p.status === "sold"
                              ? " · Vendu"
                              : ""}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {hasQuery && results.length > 0 && (
            <div className="border-t border-stone-100 px-3 py-2.5">
              <Link
                href={`/paintings?q=${encodeURIComponent(query.trim())}`}
                className="block text-center text-xs uppercase tracking-[0.12em] text-amber-900 transition hover:text-amber-950"
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                }}
              >
                Voir tous les résultats →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CATEGORY_LABELS,
  detectOrientation,
  getAllMockups,
  getMockupsByCategory,
  recommendMockups,
} from "@/lib/mockups/catalog";
import { downloadDataUrl, renderMockupCached } from "@/lib/mockups/compositor";
import type { MockupCategory, MockupDefinition } from "@/lib/mockups/types";

const CATEGORIES: MockupCategory[] = ["maison", "commercial", "style"];

type Props = {
  paintingImage: string;
  paintingTitle: string;
  dimensions?: string;
};

export function RoomVisualizer({ paintingImage, paintingTitle, dimensions }: Props) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<MockupCategory>("maison");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<"portrait" | "landscape" | "square">("portrait");

  const allMockups = useMemo(() => getAllMockups(), []);
  const filtered = useMemo(() => getMockupsByCategory(category), [category]);
  const recommended = useMemo(() => recommendMockups(orientation, 4), [orientation]);

  const selected = useMemo(() => {
    if (selectedId) return allMockups.find((m) => m.id === selectedId);
    return filtered[0] ?? allMockups[0];
  }, [allMockups, filtered, selectedId]);

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setOrientation(detectOrientation(img.naturalWidth, img.naturalHeight));
    img.src = paintingImage;
  }, [paintingImage]);

  const renderPreview = useCallback(
    async (mockup: MockupDefinition) => {
      setLoading(true);
      setError(null);
      try {
        setPreviewUrl(
          await renderMockupCached({ paintingSrc: paintingImage, mockup, outputWidth: 1200 }),
        );
      } catch {
        setError("Aperçu indisponible. Utilisez l’export HD ou réessayez.");
      } finally {
        setLoading(false);
      }
    },
    [paintingImage],
  );

  useEffect(() => {
    if (open && selected) void renderPreview(selected);
  }, [open, selected, renderPreview]);

  const handleExportHd = async () => {
    if (!selected) return;
    setExporting(true);
    try {
      const q = new URLSearchParams({
        paintingUrl: paintingImage,
        mockupId: selected.id,
        width: "1920",
      });
      const res = await fetch(`/api/mockups/render?${q}`);
      if (!res.ok) throw new Error("fail");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${paintingTitle}-${selected.id}-hd.jpg`.replace(/\s+/g, "-").toLowerCase();
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      if (previewUrl) downloadDataUrl(previewUrl, `${selected.id}.jpg`);
      else setError("Export impossible.");
    } finally {
      setExporting(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 flex w-full items-center justify-center gap-2 border border-amber-900/30 bg-[#f6f1ea] px-6 py-4 text-sm uppercase tracking-[0.12em] text-stone-900 transition hover:border-amber-900/60"
      >
        Voir dans un espace
      </button>
    );
  }

  return (
    <section className="mt-8 overflow-hidden border border-stone-200/80 bg-[#f6f1ea]">
      <div className="flex items-center justify-between border-b border-stone-200/80 bg-white/60 px-4 py-4 sm:px-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-amber-900/80">Visualisation</p>
          <h3 className="font-serif text-xl text-stone-900">Voir dans un espace</h3>
          <p className="mt-1 max-w-md text-xs text-stone-500">
            Votre tableau est présenté dans un cadre artistique (passe-partout et baguette), centré et en entier.
          </p>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-stone-500 hover:text-stone-900">
          Fermer ×
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_260px]">
        <div className="relative min-h-[320px] bg-stone-200/40 lg:min-h-[480px]">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-900 border-t-transparent" />
            </div>
          )}
          {previewUrl && !loading && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="h-full w-full object-contain" />
          )}
          {error && <p className="absolute bottom-4 left-4 right-4 rounded bg-white px-3 py-2 text-sm text-red-800">{error}</p>}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <button
              type="button"
              disabled={exporting}
              onClick={() => void handleExportHd()}
              className="bg-stone-900 px-4 py-2 text-xs uppercase tracking-wider text-white disabled:opacity-50"
            >
              {exporting ? "Export…" : "Télécharger HD"}
            </button>
            {dimensions && (
              <span className="bg-white/90 px-3 py-2 text-xs uppercase text-stone-600">{dimensions}</span>
            )}
          </div>
        </div>

        <aside className="border-t border-stone-200/80 lg:border-l lg:border-t-0">
          <div className="border-b border-stone-200/60 p-3">
            <p className="mb-2 text-xs uppercase text-stone-500">Recommandé</p>
            <div className="flex gap-2 overflow-x-auto">
              {recommended.map((m) => (
                <Thumb key={m.id} mockup={m} active={selected?.id === m.id} onSelect={() => setSelectedId(m.id)} />
              ))}
            </div>
          </div>
          <div className="flex gap-1 p-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`flex-1 py-2 text-[10px] uppercase sm:text-xs ${
                  category === c ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
          <div className="grid max-h-[340px] grid-cols-2 gap-2 overflow-y-auto p-3">
            {filtered.map((m) => (
              <Thumb
                key={m.id}
                mockup={m}
                active={selected?.id === m.id}
                onSelect={() => setSelectedId(m.id)}
                label
              />
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function Thumb({
  mockup,
  active,
  onSelect,
  label,
}: {
  mockup: MockupDefinition;
  active: boolean;
  onSelect: () => void;
  label?: boolean;
}) {
  const src =
    typeof window !== "undefined"
      ? `${window.location.origin}${mockup.background}`
      : mockup.background;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left ${active ? "ring-2 ring-amber-900 ring-offset-1" : ""}`}
    >
      <div className="relative aspect-[4/3] bg-stone-200">
        <Image src={src} alt={mockup.name} fill className="object-cover" sizes="120px" unoptimized />
      </div>
      {label && <p className="mt-1 truncate text-[10px] uppercase text-stone-600">{mockup.name}</p>}
    </button>
  );
}

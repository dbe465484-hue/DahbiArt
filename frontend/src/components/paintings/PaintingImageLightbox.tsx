"use client";

import Image from "next/image";
import { useCallback, useEffect } from "react";

type Props = {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
};

export function PaintingImageLightbox({ src, alt, open, onClose }: Props) {
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onKey]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Agrandir : ${alt}`}
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute right-4 top-4 z-10 rounded-sm bg-white/10 px-3 py-2 text-sm text-white backdrop-blur hover:bg-white/20"
        onClick={onClose}
      >
        Fermer
      </button>
      <div
        className="relative max-h-[90vh] w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={1500}
          className="mx-auto max-h-[90vh] w-auto object-contain"
          sizes="100vw"
          priority
        />
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
import { prepareImageForUpload } from "@/lib/prepare-upload-image";

type UploadKind = "painting" | "blog";

type Props = {
  label?: string;
  kind: UploadKind;
  slug: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  /** Upload via l’API studio (blog artiste) */
  studio?: boolean;
};

export function ImageUploadField({
  label = "Image",
  kind,
  slug,
  value,
  onChange,
  required,
  studio = false,
}: Props) {
  const { getToken } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    const token = getToken();
    if (!token) {
      setError("Session expirée — reconnectez-vous");
      return;
    }
    if (!slug.trim()) {
      setError("Renseignez d’abord le titre (ou le slug) pour nommer le fichier");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const prepared = await prepareImageForUpload(file);
      const { url } =
        studio && kind === "blog"
          ? await api.studio.uploadImage(token, prepared, slug)
          : await api.admin.uploadImage(token, kind, prepared, slug);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l’upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const previewSrc = value ? resolveMediaUrl(value) : null;

  return (
    <div className="block">
      <span className="mb-1 block text-sm text-stone-600">{label}</span>

      {previewSrc && (
        <div className="relative mb-3 h-48 w-full max-w-sm overflow-hidden border border-stone-200 bg-stone-100">
          <Image
            src={previewSrc}
            alt=""
            fill
            className="object-contain"
            sizes="384px"
            unoptimized
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label
          className={`cursor-pointer border border-stone-300 bg-white px-4 py-2 text-sm hover:border-stone-900 ${
            uploading ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {uploading ? "Préparation & envoi…" : value ? "Changer l’image" : "Choisir une image"}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="sr-only"
            required={required && !value}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
        </label>
        {value && (
          <button
            type="button"
            className="text-sm text-stone-500 hover:text-red-800"
            onClick={() => onChange("")}
          >
            Retirer
          </button>
        )}
      </div>

      {value && (
        <p className="mt-2 text-xs text-stone-400">
          Fichier : <span className="font-mono">{value}</span>
        </p>
      )}

      <p className="mt-2 text-xs text-stone-500">
        JPEG, PNG ou WebP — grosses photos et iPhone (HEIC) sont compressés automatiquement.
      </p>

      {error && (
        <div className="mt-2 space-y-1 text-sm text-red-800" role="alert">
          <p>{error}</p>
          {error.includes("Vercel Blob") && (
            <p className="text-xs text-red-700">
              Vercel → projet <strong>dahbi-art-api</strong> → Storage → Blob → lier le store →
              redeploy. L’enregistrement du tableau n’est possible qu’après un upload réussi.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

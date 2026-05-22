"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { PAINTING_PLACEHOLDER } from "@/lib/paintings";

type Props = {
  src: string;
  alt: string;
  aspectClass?: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
};

/** Affiche un tableau en entier (object-contain), avec repli si image absente. */
export function PaintingFrame({
  src,
  alt,
  aspectClass = "aspect-[3/4]",
  className = "",
  imageClassName = "",
  sizes = "300px",
  priority,
}: Props) {
  const [currentSrc, setCurrentSrc] = useState(src || PAINTING_PLACEHOLDER);

  useEffect(() => {
    setCurrentSrc(src || PAINTING_PLACEHOLDER);
  }, [src]);

  const onError = useCallback(() => {
    setCurrentSrc((prev) =>
      prev === PAINTING_PLACEHOLDER ? prev : PAINTING_PLACEHOLDER,
    );
  }, []);

  return (
    <div className={`relative ${aspectClass} overflow-hidden bg-[#f5f2eb] ${className}`}>
      <Image
        src={currentSrc}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onError={onError}
        className={`object-contain object-center p-2 ${imageClassName}`}
      />
    </div>
  );
}

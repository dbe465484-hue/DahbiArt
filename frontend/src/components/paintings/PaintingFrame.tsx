import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  /** Zone d’affichage (le tableau reste entier à l’intérieur). */
  aspectClass?: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
};

/** Affiche un tableau en entier (object-contain), sans recadrage. */
export function PaintingFrame({
  src,
  alt,
  aspectClass = "aspect-[3/4]",
  className = "",
  imageClassName = "",
  sizes = "300px",
  priority,
}: Props) {
  return (
    <div className={`relative ${aspectClass} overflow-hidden bg-[#f5f2eb] ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-contain object-center p-2 ${imageClassName}`}
      />
    </div>
  );
}

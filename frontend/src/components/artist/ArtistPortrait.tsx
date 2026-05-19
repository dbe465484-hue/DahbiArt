import Image from "next/image";
import { ARTIST } from "@/lib/artist";
import { homeFrame } from "@/components/home/home-theme";

type Variant = "light" | "dark";

type Props = {
  variant?: Variant;
  className?: string;
  priority?: boolean;
  sizes?: string;
  showCaption?: boolean;
  caption?: string;
  /** Légende en surimpression (bandeau sombre). */
  overlayLabel?: boolean;
};

/** Cadrage portrait : focus visage, passe-partout galerie, léger vignettage. */
export function ArtistPortrait({
  variant = "light",
  className = "",
  priority = false,
  sizes = "(max-width:1024px) 100vw, 42vw",
  showCaption = false,
  caption,
  overlayLabel = false,
}: Props) {
  const isDark = variant === "dark";

  const outerFrame = isDark
    ? "bg-gradient-to-br from-amber-700/50 via-amber-900/35 to-stone-800 p-[3px] shadow-[0_28px_72px_-20px_rgba(0,0,0,0.65)]"
    : homeFrame;

  const mat = isDark ? "bg-[#f7f4ef] p-3 md:p-4" : "bg-white p-2 sm:p-3";

  return (
    <figure className={className}>
      <div className={outerFrame}>
        <div className={mat}>
          <div className="relative aspect-[4/5] overflow-hidden bg-stone-200">
            <Image
              src={ARTIST.portrait}
              alt={ARTIST.name}
              fill
              priority={priority}
              sizes={sizes}
              className="scale-[1.14] object-cover object-[48%_24%]"
            />
            <span
              className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-stone-900/10"
              aria-hidden
            />
            <span
              className={`pointer-events-none absolute inset-0 block ${
                isDark
                  ? "bg-gradient-to-t from-stone-900/55 via-stone-900/5 to-amber-950/20"
                  : "bg-gradient-to-t from-stone-900/25 via-transparent to-stone-900/8"
              }`}
              aria-hidden
            />
            <span
              className="pointer-events-none absolute inset-0 block shadow-[inset_0_0_48px_rgba(28,25,23,0.12)]"
              aria-hidden
            />
            {overlayLabel && (
              <p className="absolute bottom-4 left-4 z-10 text-xs uppercase tracking-[0.18em] text-white/90">
                {ARTIST.name}
              </p>
            )}
          </div>
        </div>
      </div>
      {showCaption && (
        <figcaption className="mt-4 text-center text-xs uppercase tracking-[0.16em] text-stone-500 lg:text-left">
          {caption ?? `${ARTIST.name} · ${ARTIST.location}`}
        </figcaption>
      )}
    </figure>
  );
}

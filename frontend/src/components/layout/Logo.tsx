import Link from "next/link";
import { ARTIST } from "@/lib/artist";

export function Logo({
  className = "",
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  const primary = light ? "text-white" : "text-stone-900";
  const secondary = light ? "text-white/90" : "text-stone-600";
  const muted = light ? "text-white/70" : "text-stone-400";

  return (
    <Link href="/" className={`group block ${className}`}>
      <span className={`block font-sans text-base font-bold tracking-[0.14em] uppercase md:text-lg ${primary}`}>
        {ARTIST.name.split(" ")[0]}
      </span>
      <span className={`block font-sans text-base font-light tracking-[0.14em] uppercase md:text-lg ${secondary}`}>
        {ARTIST.name.split(" ").slice(1).join(" ")}
      </span>
      <span className={`mt-0.5 block text-xs tracking-[0.18em] uppercase md:text-sm ${muted}`}>
        Fine Art
      </span>
    </Link>
  );
}

import Link from "next/link";
import { ArtistPortrait } from "@/components/artist/ArtistPortrait";
import { ARTIST } from "@/lib/artist";
import { homeLink, homeLinkUnderline } from "./home-theme";

export function ArtistExhibitionBand() {
  return (
    <section className="relative overflow-hidden border-b border-stone-800 bg-stone-900 py-16 md:py-20 lg:py-28">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-950/20 via-transparent to-stone-950"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="border-l border-amber-500/30 pl-6 md:pl-8">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-amber-200/80">
            L&apos;atelier · {ARTIST.location}
          </p>
          <blockquote className="mt-8 font-serif text-2xl font-light italic leading-relaxed text-white sm:text-3xl lg:text-[2rem] lg:leading-snug">
            « {ARTIST.quote} »
          </blockquote>
          <footer className="mt-6 text-sm uppercase tracking-[0.2em] text-stone-400">
            — {ARTIST.name}
          </footer>
          <Link
            href="/about"
            className={`mt-10 inline-block ${homeLink} !text-amber-100 ${homeLinkUnderline} !border-amber-200/40 hover:!border-amber-100`}
          >
            L&apos;histoire de l&apos;artiste →
          </Link>
        </div>

        <ArtistPortrait
          variant="dark"
          overlayLabel
          sizes="(max-width:1024px) 100vw, 50vw"
        />
      </div>
    </section>
  );
}

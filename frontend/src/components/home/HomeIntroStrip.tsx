import Link from "next/link";
import { PaintingFrame } from "@/components/paintings/PaintingFrame";
import { ARTIST } from "@/lib/artist";
import type { Painting } from "@/lib/types";
import { HomeBackdrop } from "./HomeSection";
import {
  homeBg,
  homeBtnPrimary,
  homeEyebrow,
  homeEyebrowMuted,
  homeFrame,
  homeSection,
  homeTitle,
  homeTitleItalic,
} from "./home-theme";

function Frame({
  src,
  alt,
  className,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <div className={`group relative overflow-hidden ${homeFrame} ${className ?? ""}`}>
      <PaintingFrame
        src={src}
        alt={alt}
        aspectClass="aspect-[4/5]"
        sizes={sizes}
        priority={priority}
        imageClassName="transition duration-700 group-hover:scale-[1.02]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-900/25 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
    </div>
  );
}

type Props = {
  paintings: Painting[];
  featured: Painting;
};

export function HomeIntroStrip({ paintings, featured }: Props) {
  const second =
    paintings.find((p) => p.slug === "coucher-essaouira") ?? paintings[1];
  const third =
    paintings.find((p) => p.slug === "jasmin-sur-zellige") ?? paintings[2];
  const firstName = ARTIST.name.split(" ")[0];

  if (!second || !third) return null;

  return (
    <section className={`${homeSection} ${homeBg.cream} lg:py-28`}>
      <HomeBackdrop />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 md:grid-cols-12 md:items-center md:gap-10 lg:px-8">
        <div className="md:col-span-5 lg:col-span-5">
          <div className="relative border-l border-amber-900/25 pl-6 md:pl-8">
            <p className={homeEyebrow}>Peintures originales</p>
            <p className={`mt-2 ${homeEyebrowMuted}`}>
              Tirages signés · Atelier {ARTIST.location}
            </p>

            <h2 className={`mt-8 ${homeTitle} sm:text-5xl lg:text-[3.4rem]`}>
              L&apos;art contemporain
              <span className={`mt-1 block ${homeTitleItalic}`}>de {firstName}</span>
            </h2>

            <p className="mt-8 max-w-md text-base leading-relaxed text-stone-600 md:text-lg">
              {ARTIST.shortBio}
            </p>

            <div className="mt-10">
              <Link href="/about" className={`${homeBtnPrimary} group`}>
                Découvrir l&apos;artiste
                <span
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg md:col-span-7 md:max-w-none lg:col-span-7">
          <div className="relative aspect-[4/5] min-h-[320px] sm:min-h-[380px] md:min-h-[440px]">
            <Frame
              src={featured.image}
              alt={featured.title}
              className="absolute right-0 top-0 z-10 w-[58%] rotate-1"
              sizes="(max-width:768px) 55vw, 28vw"
              priority
            />
            <Frame
              src={second.image}
              alt={second.title}
              className="absolute left-0 top-[8%] z-20 w-[48%] -rotate-2"
              sizes="(max-width:768px) 45vw, 22vw"
            />
            <Frame
              src={third.image}
              alt={third.title}
              className="absolute bottom-0 left-[22%] z-30 w-[42%] rotate-2"
              sizes="(max-width:768px) 40vw, 20vw"
            />

            <span
              className="pointer-events-none absolute -left-2 top-[18%] z-0 h-24 w-24 border-l border-t border-amber-800/30"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute bottom-[12%] right-4 z-40 h-20 w-20 border-b border-r border-amber-800/30"
              aria-hidden
            />

            <div className="absolute -bottom-2 right-[6%] z-40 hidden bg-white/90 px-4 py-2 text-xs uppercase tracking-[0.2em] text-stone-600 backdrop-blur-sm sm:block">
              Huile sur toile · {ARTIST.location}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

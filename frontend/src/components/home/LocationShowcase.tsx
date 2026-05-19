import Link from "next/link";
import { PaintingFrame } from "@/components/paintings/PaintingFrame";
import { locations } from "@/lib/navigation";
import { getByLocation } from "@/lib/paintings";
import type { Painting } from "@/lib/types";
import { HomeSection } from "./HomeSection";
import { HomeSectionHeader } from "./HomeSectionHeader";
import { homeFrame, homeLead } from "./home-theme";

type Props = { paintings: Painting[] };

export function LocationShowcase({ paintings }: Props) {
  const featuredLocations = locations.slice(0, 5);

  return (
    <HomeSection variant="paper">
      <HomeSectionHeader
        eyebrow="Maroc"
        title="Les lieux"
        titleAccent="que vous aimez"
        href="/collections"
        linkLabel="Tous les lieux →"
      />
      <p className={`-mt-4 mb-12 ${homeLead}`}>
        Des médinas aux criques de l&apos;Atlantique — trouvez la toile qui ramène chez vous
        votre lieu préféré.
      </p>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {featuredLocations.map((loc) => {
          const byLoc = getByLocation(paintings, loc.slug);
          const sample = byLoc[0] ?? paintings[0];
          const count = byLoc.length || 12;
          if (!sample) return null;
          return (
            <Link
              key={loc.slug}
              href={`/paintings/location/${loc.slug}`}
              className="group"
            >
              <div className={`${homeFrame} overflow-hidden transition duration-300 group-hover:shadow-[0_16px_48px_-12px_rgba(28,25,23,0.4)]`}>
                <div className="relative">
                  <PaintingFrame
                    src={sample.image}
                    alt={loc.label}
                    aspectClass="aspect-[16/10]"
                    sizes="(max-width:768px) 100vw, 33vw"
                    imageClassName="transition duration-700 group-hover:scale-[1.02]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-900/65 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-serif text-xl font-light">{loc.label}</h3>
                    <p className="mt-1 text-sm uppercase tracking-[0.14em] text-white/80">
                      {count}+ œuvres
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </HomeSection>
  );
}

import Link from "next/link";
import { ARTIST } from "@/lib/artist";
import type { Painting } from "@/lib/types";
import { CommissionPaintingCarousel } from "./CommissionPaintingCarousel";
import { HomeSection } from "./HomeSection";
import {
  homeBtnPrimary,
  homeEyebrowMuted,
  homeLead,
  homeTitle,
  homeTitleItalic,
} from "./home-theme";

export function CommissionCTA({ paintings }: { paintings: Painting[] }) {
  return (
    <HomeSection variant="cream">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="border-l border-amber-900/25 pl-6 md:pl-8">
          <p className={homeEyebrowMuted}>
            {ARTIST.brand} · {ARTIST.location}
          </p>
          <h2 className={`mt-4 ${homeTitle}`}>
            Vous cherchez quelque chose
            <span className={`block ${homeTitleItalic}`}>de précis ?</span>
          </h2>
          <p className={`mt-6 ${homeLead}`}>
            Commandez une peinture sur mesure : votre lieu favori au Maroc, un animal de
            compagnie, un instant de famille. Dahbi travaille avec vous sur le format et la
            palette.
          </p>
          <div className="mt-8">
            <Link href="/commission" className={homeBtnPrimary}>
              Demander une commande
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <CommissionPaintingCarousel paintings={paintings} />
      </div>
    </HomeSection>
  );
}

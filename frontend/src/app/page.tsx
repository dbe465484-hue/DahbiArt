import { ArtistExhibitionBand } from "@/components/home/ArtistExhibitionBand";
import { BlogStrip } from "@/components/home/BlogStrip";
import { CommissionCTA } from "@/components/home/CommissionCTA";
import { FeaturedTabs } from "@/components/home/FeaturedTabs";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { HomeIntroStrip } from "@/components/home/HomeIntroStrip";
import { Newsletter } from "@/components/home/Newsletter";
import { SplashIntro } from "@/components/home/SplashIntro";
import {
  getAvailable,
  getBestSellers,
  getFeatured,
  getPaintings,
} from "@/lib/paintings";

export default async function HomePage() {
  const paintings = await getPaintings();
  const featured = getFeatured(paintings);
  const available = getAvailable(paintings);
  const sold = paintings.filter((p) => p.status === "sold" && p.printAvailable);

  return (
    <>
      <SplashIntro />
      <div id="home-main" className="overflow-x-hidden">
        <HeroCarousel featured={featured} />
        <div id="home-content">
          <FeaturedTabs
            available={available.length > 0 ? available : getBestSellers(paintings).slice(0, 8)}
            sold={sold.length > 0 ? sold : getBestSellers(paintings).slice(0, 8)}
          />
          <HomeIntroStrip paintings={paintings} featured={featured} />
          <ArtistExhibitionBand />
          <CommissionCTA paintings={paintings} />
          <BlogStrip />
          <Newsletter />
        </div>
      </div>
    </>
  );
}

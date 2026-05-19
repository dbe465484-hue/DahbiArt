import { ArtistAboutPage } from "@/components/about/ArtistAboutPage";
import { ARTIST } from "@/lib/artist";

export const metadata = {
  title: "L'artiste",
  description: ARTIST.shortBio,
};

export default function AboutPage() {
  return <ArtistAboutPage />;
}

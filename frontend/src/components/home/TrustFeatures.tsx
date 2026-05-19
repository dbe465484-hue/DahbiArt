import Link from "next/link";
import { HomeSection } from "./HomeSection";
import {
  homeEyebrow,
  homeLink,
  homeLinkUnderline,
  homeTitle,
  homeTitleItalic,
} from "./home-theme";

const features = [
  {
    title: "15 ans de création",
    text: "Depuis l'installation de l'atelier à Rabat, des centaines de toiles ont rejoint des collections en Europe et au Maroc.",
  },
  {
    title: "Savoir-faire & qualité",
    text: "Chaque œuvre est peinte à la main sur toile, avec des pigments et vernis choisis pour la longévité.",
  },
  {
    title: "Fait pour durer",
    text: "Une passion pour la lumière et le geste — des collectionneurs fidèles depuis les premières expositions.",
  },
  {
    title: "Livraison soignée",
    text: "Emballage professionnel et livraison offerte au Maroc et en Europe sur les originaux.",
  },
];

export function TrustFeatures() {
  return (
    <HomeSection variant="paper">
      <div className="mx-auto max-w-3xl text-center">
        <p className={homeEyebrow}>L&apos;atelier</p>
        <h2 className={`mt-3 ${homeTitle}`}>
          Des œuvres uniques
          <span className={`mt-1 block ${homeTitleItalic}`}>pour votre intérieur</span>
        </h2>
        <Link
          href="/paintings"
          className={`mt-6 inline-block ${homeLink} ${homeLinkUnderline}`}
        >
          S&apos;inspirer
        </Link>
      </div>

      <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="relative border-l border-amber-900/20 pl-6 transition hover:border-amber-900/40"
          >
            <span
              className="mb-3 block font-serif text-3xl font-light text-amber-900/25"
              aria-hidden
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-serif text-lg text-stone-900">{f.title}</h3>
            <p className="mt-3 text-base leading-relaxed text-stone-600">{f.text}</p>
          </div>
        ))}
      </div>
    </HomeSection>
  );
}

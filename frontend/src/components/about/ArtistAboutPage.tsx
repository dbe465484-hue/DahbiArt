import Link from "next/link";
import { ArtistPortrait } from "@/components/artist/ArtistPortrait";
import { ARTIST } from "@/lib/artist";
import {
  homeBtnGhost,
  homeBtnPrimary,
  homeEyebrow,
  homeFrame,
  homeLead,
  homeLink,
  homeLinkUnderline,
  homeTitle,
  homeTitleItalic,
} from "@/components/home/home-theme";

export function ArtistAboutPage() {
  const introParagraphs = ARTIST.intro.split("\n\n").filter(Boolean);

  return (
    <div className="bg-[#faf7f2]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-stone-200/80 bg-[#f6f1ea]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:py-20 lg:grid-cols-12 lg:gap-14 lg:px-8 lg:py-24">
          <div className="lg:col-span-5">
            <ArtistPortrait variant="light" priority showCaption sizes="(max-width:1024px) 100vw, 42vw" />
          </div>

          <div className="lg:col-span-7">
            <div className="border-l border-amber-900/30 pl-6 md:pl-8">
              <p className={homeEyebrow}>L&apos;artiste</p>
              <h1 className={`mt-3 ${homeTitle} sm:text-5xl lg:text-[3.25rem]`}>
                {ARTIST.name}
                <span className={`mt-2 block text-2xl sm:text-3xl ${homeTitleItalic}`}>
                  Écrivain · Peintre
                </span>
              </h1>
              <p className={`mt-6 ${homeLead}`}>{ARTIST.shortBio}</p>
              <p className="mt-4 text-base leading-relaxed text-stone-600">
                {introParagraphs[0]}
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/paintings" className={homeBtnPrimary}>
                  Voir la galerie
                  <span aria-hidden>→</span>
                </Link>
                <Link href="/commission" className={homeBtnGhost}>
                  Sur commande
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Citation */}
      <section className="border-b border-stone-800 bg-stone-900 py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-amber-200/75">
            Sa démarche
          </p>
          <blockquote className="mt-6 font-serif text-2xl font-light italic leading-relaxed text-white md:text-3xl md:leading-snug">
            « {ARTIST.quote} »
          </blockquote>
          <footer className="mt-6 text-sm uppercase tracking-[0.2em] text-stone-400">
            — {ARTIST.name}
          </footer>
        </div>
      </section>

      {/* Biographie */}
      <section className="border-b border-stone-200/80 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl border-l border-amber-900/25 pl-6 md:pl-8">
            <p className={homeEyebrow}>Biographie</p>
            <h2 className={`mt-2 ${homeTitle}`}>
              Un parcours
              <span className={`mt-1 block ${homeTitleItalic}`}>de sens et de création</span>
            </h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="space-y-6 lg:col-span-7">
              {introParagraphs.map((paragraph) => (
                <p
                  key={`intro-${paragraph.slice(0, 48)}`}
                  className="text-base leading-relaxed text-stone-600 md:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <aside className="lg:col-span-5">
              <div className="border border-stone-200 bg-white p-6 shadow-sm md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-900/80">
                  Contact
                </p>
                <ul className="mt-6 space-y-4 text-sm text-stone-600">
                  <li>
                    <span className="block text-xs uppercase tracking-wider text-stone-400">
                      Email
                    </span>
                    <a
                      href={`mailto:${ARTIST.studio.email}`}
                      className="hover:text-amber-900"
                    >
                      {ARTIST.studio.email}
                    </a>
                  </li>
                  <li>
                    <span className="block text-xs uppercase tracking-wider text-stone-400">
                      Téléphone
                    </span>
                    <a href={`tel:${ARTIST.studio.phone}`} className="hover:text-amber-900">
                      {ARTIST.studio.phone}
                    </a>
                  </li>
                </ul>
                <div className="mt-8 flex flex-wrap gap-4 border-t border-stone-100 pt-6">
                  <a
                    href={ARTIST.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${homeLink} ${homeLinkUnderline}`}
                  >
                    Instagram
                  </a>
                  <a
                    href={ARTIST.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${homeLink} ${homeLinkUnderline}`}
                  >
                    Facebook
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Parcours */}
      <section className="border-b border-stone-200/80 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <p className={`${homeEyebrow} text-center`}>Parcours</p>
          <h2 className={`mt-2 text-center ${homeTitle}`}>
            Les étapes
            <span className={`mt-1 block ${homeTitleItalic}`}>d&apos;une vie d&apos;artiste</span>
          </h2>
          <ol className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {ARTIST.milestones.map((m, i) => (
              <li key={`${m.year}-${m.label}`} className="relative border-l border-amber-900/25 pl-6">
                <span
                  className="font-serif text-3xl font-light text-amber-900/20"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-sm font-medium uppercase tracking-[0.14em] text-amber-900">
                  {m.year}
                </p>
                <h3 className="mt-1 font-serif text-lg text-stone-900">{m.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">{m.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Création */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="relative order-2 lg:order-1">
              <ArtistPortrait
                variant="light"
                sizes="(max-width:1024px) 100vw, 50vw"
              />
            </div>
            <div className="order-1 border-l border-amber-900/25 pl-6 lg:order-2 lg:pl-8">
              <p className={homeEyebrow}>Création</p>
              <h2 className={`mt-2 ${homeTitle}`}>
                Écriture
                <span className={`mt-1 block ${homeTitleItalic}`}>et peinture</span>
              </h2>
              <p className={`mt-6 ${homeLead}`}>{ARTIST.atelierText}</p>
              <Link
                href="/contact"
                className={`mt-8 inline-block ${homeLink} ${homeLinkUnderline}`}
              >
                Prendre contact →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Processus */}
      <section className="border-t border-stone-200/80 bg-[#f6f1ea] py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="border-l border-amber-900/25 pl-6 md:pl-8">
            <p className={homeEyebrow}>Univers artistique</p>
            <h2 className={`mt-2 ${homeTitle}`}>
              Symboles
              <span className={`mt-1 block ${homeTitleItalic}`}>et émotions</span>
            </h2>
            <p className={`mt-4 max-w-2xl ${homeLead}`}>{ARTIST.processText}</p>
          </div>

          <div
            className={`mt-10 ${homeFrame} overflow-hidden shadow-[0_16px_48px_-14px_rgba(28,25,23,0.35)]`}
          >
            <div className="relative aspect-video overflow-hidden bg-stone-900">
              <video
                controls
                playsInline
                poster={ARTIST.heroPoster}
                className="h-full w-full object-cover"
              >
                <source src={ARTIST.heroVideo} type="video/mp4" />
              </video>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-stone-500">
            Extrait vidéo · {ARTIST.name}
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-stone-200/80 bg-stone-900 py-16 text-center md:py-20">
        <div className="mx-auto max-w-2xl px-4 lg:px-8">
          <h2 className="font-serif text-3xl font-light text-white md:text-4xl">
            Découvrir les œuvres
          </h2>
          <p className="mt-4 text-stone-400">
            Un univers singulier où l&apos;art dialogue avec l&apos;expérience humaine.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/paintings"
              className="inline-flex items-center gap-2 bg-white px-8 py-3.5 text-sm uppercase tracking-[0.12em] text-stone-900 transition hover:bg-stone-100"
            >
              Parcourir la galerie
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/commission"
              className="inline-flex items-center gap-2 border border-white/40 px-8 py-3.5 text-sm uppercase tracking-[0.12em] text-white transition hover:border-white"
            >
              Commander une toile
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

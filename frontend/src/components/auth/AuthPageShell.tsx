import type { ReactNode } from "react";
import Link from "next/link";
import {
  homeEyebrow,
  homeTextureStyle,
  homeTitle,
  homeTitleItalic,
} from "@/components/home/home-theme";
import { ARTIST } from "@/lib/artist";

const BENEFITS = [
  "Acheter des originaux et tirages signés",
  "Enregistrer vos œuvres favorites",
  "Suivre vos commandes en ligne",
] as const;

type Mode = "login" | "register";

const COPY: Record<
  Mode,
  { eyebrow: string; title: string; titleItalic: string; lead: string; formTitle: string; formLead: string }
> = {
  login: {
    eyebrow: "Espace client",
    title: "Bon retour",
    titleItalic: "parmi nous",
    lead: "Connectez-vous pour finaliser un achat, retrouver vos favoris et suivre vos commandes.",
    formTitle: "Connexion",
    formLead: "Entrez vos identifiants pour accéder à votre compte.",
  },
  register: {
    eyebrow: "Rejoindre la galerie",
    title: "Créer",
    titleItalic: "votre compte",
    lead: "Inscrivez-vous en quelques instants pour acheter des œuvres et vivre l'expérience de la galerie en ligne.",
    formTitle: "Inscription",
    formLead: "Remplissez le formulaire ci-dessous — c'est gratuit et sans engagement.",
  },
};

export function AuthPageShell({
  mode,
  children,
}: {
  mode: Mode;
  children: ReactNode;
}) {
  const copy = COPY[mode];

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[#faf7f2] lg:min-h-[calc(100dvh-5rem)]">
      <div className="grid min-h-[inherit] lg:grid-cols-2">
        <aside
          className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 p-10 text-white lg:flex xl:p-14"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.2]"
            style={homeTextureStyle}
            aria-hidden
          />
          <div className="relative">
            <Link
              href="/"
              className={`${homeEyebrow} text-amber-200/90 transition hover:text-white`}
            >
              {ARTIST.brand}
            </Link>
            <h1 className={`mt-10 ${homeTitle} text-white sm:text-4xl xl:text-5xl`}>
              {copy.title}
              <span className={`mt-2 block ${homeTitleItalic} text-amber-100/95`}>
                {copy.titleItalic}
              </span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-stone-300">
              {copy.lead}
            </p>
          </div>

          <div className="relative mt-12">
            <p className="text-[0.65rem] uppercase tracking-[0.22em] text-amber-200/70">
              Votre espace
            </p>
            <ul className="mt-4 space-y-3">
              {BENEFITS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-stone-300">
                  <span
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-10 font-serif text-lg italic text-amber-100/80">
              « L&apos;art appartient à ceux qui osent le regarder de près. »
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-stone-500">
              — {ARTIST.name}
            </p>
          </div>
        </aside>

        <div className="flex items-center justify-center px-4 py-12 sm:px-8 lg:py-16">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <p className={homeEyebrow}>{copy.eyebrow}</p>
              <h1 className={`mt-2 font-serif text-3xl font-light text-stone-900`}>
                {copy.formTitle}
              </h1>
            </div>

            <div
              className="border border-stone-200/90 bg-white p-8 shadow-[0_20px_56px_-20px_rgba(28,25,23,0.28)] sm:p-10"
            >
              <div className="mb-8 hidden border-b border-stone-100 pb-8 lg:block">
                <p className={homeEyebrow}>{copy.eyebrow}</p>
                <h2 className="mt-2 font-serif text-2xl font-light text-stone-900">
                  {copy.formTitle}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">{copy.formLead}</p>
              </div>

              <div className="mb-6 border-b border-stone-100 pb-6 lg:hidden">
                <p className="text-sm leading-relaxed text-stone-500">{copy.formLead}</p>
              </div>

              {children}
            </div>

            <p className="mt-8 text-center">
              <Link
                href="/"
                className="text-xs uppercase tracking-[0.16em] text-stone-400 transition hover:text-amber-900"
              >
                ← Retour à la galerie
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

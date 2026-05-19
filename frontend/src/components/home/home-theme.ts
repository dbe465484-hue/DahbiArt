/** Palette & classes partagées — style galerie (accueil) */
export const homeBg = {
  cream: "bg-[#f6f1ea]",
  paper: "bg-[#faf7f2]",
  dark: "bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950",
} as const;

export const homeSection =
  "relative overflow-hidden border-b border-stone-200/80 py-16 md:py-20 lg:py-24";

export const homeContainer = "relative mx-auto max-w-7xl px-4 lg:px-8";

export const homeEyebrow =
  "text-sm font-medium uppercase tracking-[0.28em] text-amber-900/80";

export const homeEyebrowMuted =
  "text-sm uppercase tracking-[0.18em] text-stone-500";

export const homeTitle =
  "font-serif text-3xl font-light leading-tight text-stone-900 sm:text-4xl lg:text-[2.75rem]";

export const homeTitleItalic = "italic text-amber-950/90";

export const homeLead = "max-w-2xl text-base leading-relaxed text-stone-600 md:text-lg";

export const homeFrame =
  "bg-white p-2 shadow-[0_12px_40px_-12px_rgba(28,25,23,0.35)]";

export const homeLink =
  "text-sm uppercase tracking-[0.14em] text-amber-900 transition hover:text-amber-950";

export const homeLinkUnderline =
  "border-b border-amber-900/40 pb-0.5 transition hover:border-amber-900";

export const homeBtnPrimary =
  "inline-flex items-center justify-center gap-2 bg-stone-900 px-8 py-3.5 text-sm uppercase tracking-[0.12em] text-white transition hover:bg-amber-950";

export const homeBtnGhost =
  "inline-flex items-center gap-2 border border-stone-300/90 bg-white/60 px-8 py-3.5 text-sm uppercase tracking-[0.12em] text-stone-800 backdrop-blur-sm transition hover:border-amber-900/50 hover:text-amber-950";

export const homeCarouselBtn =
  "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-stone-300/80 bg-white/90 text-lg text-stone-700 shadow-sm backdrop-blur-sm transition hover:border-amber-900/40 hover:text-amber-900 md:flex";

export const homeTextureStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
} as const;

import { HERO_VIDEO_SRC } from "./hero-video.generated";

/** Portrait officiel — `public/artist/` */
const ARTIST_PORTRAIT = "/artist/691704984_986930290371936_7709414301268689721_n.png";

export const ARTIST = {
  name: "Dahbi Machrouhi",
  brand: "Dahbi Machrouhi Fine Art",
  tagline: "Écrivain · Peintre · Art symbolique et figuratif",
  location: "Maroc",
  studio: {
    name: "ATELIER MACHROUHI",
    address: "12 Rue des Oudayas, Rabat 10030, Maroc",
    phone: "+212 537 00 00 00",
    email: "contact@dahbimachrouhi.art",
  },
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
  },
  heroVideo: HERO_VIDEO_SRC,
  heroPoster: "/paintings/medina-au-matin-rabat.webp",
  portrait: ARTIST_PORTRAIT,
  studioImage: ARTIST_PORTRAIT,
  footerImage: ARTIST_PORTRAIT,
  shortBio:
    "Écrivain, peintre et doctorant en sciences de l'éducation · Né en 1959 à Bejaâd",
  intro: `Né en 1959 à Bejaâd, au Maroc, Dahbi Machrouhi est écrivain, peintre et doctorant en sciences de l'éducation. Son parcours artistique et intellectuel est profondément marqué par une sensibilité humaine et une réflexion intérieure nourries par les épreuves de la vie.

C'est durant son temps passé en prison qu'il découvre la peinture, un moyen d'expression devenu pour lui un espace de liberté, de mémoire et de création. À travers ses œuvres, Dahbi Machrouhi explore les symboles, les formes et les émotions, donnant naissance à un univers singulier où l'art dialogue avec l'expérience humaine.

Entre écriture et peinture, son travail témoigne d'un regard authentique sur le monde, mêlant profondeur, patience et identité artistique propre.`,
  quote:
    "La peinture est devenue pour moi un espace de liberté, de mémoire et de création — un langage où l'art dialogue avec l'expérience humaine.",
  milestones: [
    {
      year: "1959",
      label: "Naissance à Bejaâd",
      detail: "Au Maroc, entre sensibilité humaine et quête de sens",
    },
    {
      year: "Découverte",
      label: "La peinture",
      detail: "Un moyen d'expression trouvé en prison — liberté, mémoire, création",
    },
    {
      year: "Double voix",
      label: "Écriture & peinture",
      detail: "Symboles, formes et émotions au service d'un regard authentique",
    },
    {
      year: "Aujourd'hui",
      label: "Doctorant & artiste",
      detail: "Sciences de l'éducation · œuvres originales et univers singulier",
    },
  ],
  atelierText: `Dahbi Machrouhi y poursuit un travail patient : écrire, peindre, explorer les symboles et les émotions qui traversent son parcours. Chaque toile est une conversation entre mémoire, expérience humaine et identité artistique propre.`,
  processText:
    "Symboles, silhouettes, couleurs saturées — un geste nourri par la réflexion intérieure et par des années où la peinture est devenue refuge et langage.",
} as const;

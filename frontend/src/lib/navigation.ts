/** Ordre pensé pour la grille 2 colonnes du méga-menu (ligne par ligne) */
export const subjects = [
  { slug: "landscape", label: "Paysages" },
  { slug: "seascape", label: "Marines" },
  { slug: "flowers", label: "Fleurs" },
  { slug: "still-life", label: "Nature morte" },
  { slug: "people", label: "Personnages" },
  { slug: "animals", label: "Animaux" },
  { slug: "abstract", label: "Abstrait" },
  { slug: "food-drink", label: "Nourriture & boissons" },
] as const;

export const locations = [
  { slug: "rabat", label: "Rabat", region: "Côte atlantique" },
  { slug: "casablanca", label: "Casablanca", region: "Côte atlantique" },
  { slug: "tanger", label: "Tanger", region: "Nord" },
  { slug: "essaouira", label: "Essaouira", region: "Côte atlantique" },
  { slug: "marrakech", label: "Marrakech", region: "Sud" },
  { slug: "fes", label: "Fès", region: "Intérieur" },
  { slug: "chefchaouen", label: "Chefchaouen", region: "Rif" },
  { slug: "atlas", label: "Atlas", region: "Montagnes" },
] as const;

export const mainNav = [
  {
    label: "Peintures",
    href: "/paintings",
    children: {
      primary: [
        { label: "Originaux disponibles", href: "/paintings/available" },
        { label: "Toutes les collections", href: "/collections" },
        { label: "Toutes les peintures", href: "/paintings" },
        { label: "Meilleures ventes", href: "/paintings/best-sellers" },
        { label: "Sur commande", href: "/commission" },
      ],
      subjects,
      locations,
    },
  },
  { label: "À propos", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Rejoindre", href: "/join" },
] as const;

export const moreNav = [
  { label: "Calendrier", href: "/calendar" },
  { label: "Ateliers", href: "/classes" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
] as const;

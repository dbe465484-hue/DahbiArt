/** Contenu confiance — témoignages, presse, FAQ achat (priorité 2). */

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  location?: string;
};

export type PressMention = {
  title: string;
  source: string;
  year?: string;
  excerpt?: string;
};

export type FaqItem = {
  q: string;
  a: string;
};

export type FaqSection = {
  id: string;
  title: string;
  items: FaqItem[];
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Une œuvre qui résonne longtemps après l'accrochage. L'emballage et la livraison depuis le Maroc ont été impeccables.",
    author: "S. Benali",
    role: "Collectionneur",
    location: "Casablanca",
  },
  {
    quote:
      "Le tirage sur toile conserve la présence des couleurs de l'original. Un vrai dialogue avec l'atelier pour le choix du format.",
    author: "M. Laurent",
    role: "Collectionneuse",
    location: "Paris",
  },
  {
    quote:
      "Dahbi Machrouhi lie mémoire et symbole avec une force rare. Chaque toile raconte une histoire au-delà du décor.",
    author: "Galerie partenaire",
    role: "Curateur",
    location: "Rabat",
  },
];

export const PRESS_MENTIONS: PressMention[] = [
  {
    title: "Peinture et mémoire",
    source: "Exposition collective — Rabat",
    year: "2024",
    excerpt: "Présentation d'une série de figures symboliques et d'envols.",
  },
  {
    title: "Entre écriture et toile",
    source: "Portes ouvertes atelier",
    year: "2023",
    excerpt: "Rencontre avec le public autour du parcours de l'artiste.",
  },
];

export const FAQ_SECTIONS: FaqSection[] = [
  {
    id: "achat",
    title: "Achat & paiement",
    items: [
      {
        q: "Quels moyens de paiement acceptez-vous ?",
        a: "Paiement sécurisé par carte bancaire (Stripe). Apple Pay, Google Pay et PayPal peuvent être activés selon votre région via Stripe.",
      },
      {
        q: "Dois-je créer un compte pour commander ?",
        a: "Vous pouvez ajouter des œuvres au panier sans compte. La finalisation de la commande nécessite une connexion (email et adresse de livraison).",
      },
      {
        q: "Original ou tirage : quelle différence ?",
        a: "L'original est la toile unique peinte par l'artiste. Le tirage est une reproduction sur toile, produite sur commande, pour certaines œuvres déjà vendues ou en complément.",
      },
      {
        q: "Proposez-vous un certificat d'authenticité ?",
        a: "Chaque original est accompagné d'un certificat signé (titre, dimensions, année, référence). Les tirages sont numérotés et certifiés lorsque la série est limitée.",
      },
    ],
  },
  {
    id: "livraison",
    title: "Livraison",
    items: [
      {
        q: "Comment est expédiée une toile originale ?",
        a: "Emballage professionnel (carton renforcé ou caisse bois pour grands formats), assurance transport incluse. Numéro de suivi communiqué à l'expédition.",
      },
      {
        q: "Quels sont les délais et frais ?",
        a: "Maroc : 5 à 10 jours ouvrés. Europe : 10 à 20 jours. International : 15 à 30 jours. Les frais dépendent de la zone (affichés au checkout).",
      },
      {
        q: "Livrez-vous à l'international ?",
        a: "Oui, vers le Maroc, l'Europe et le reste du monde. Les droits de douane éventuels restent à la charge du destinataire hors Union européenne.",
      },
    ],
  },
  {
    id: "retours",
    title: "Retours & garanties",
    items: [
      {
        q: "Puis-je retourner une œuvre ?",
        a: "Les originaux et tirages sur mesure ne sont pas repris sauf dommage constaté à la livraison. Contactez-nous sous 48 h avec photos pour ouvrir un dossier.",
      },
      {
        q: "Que faire en cas de dommage à la réception ?",
        a: "Photographiez l'emballage et l'œuvre, refusez le colis si nécessaire, et écrivez à contact@dahbimachrouhi.art avec votre référence commande.",
      },
    ],
  },
  {
    id: "atelier",
    title: "Atelier & visites",
    items: [
      {
        q: "Puis-je visiter l'atelier ?",
        a: "Sur rendez-vous à Rabat, lors des portes ouvertes annoncées sur le calendrier, ou par email.",
      },
      {
        q: "Commande sur mesure ?",
        a: "Oui — dimensions, palette et thème discutés ensemble. Voir la page Sur commande ou nous contacter.",
      },
    ],
  },
];

export const PAINTING_TRUST_POINTS = [
  "Certificat d'authenticité pour chaque original",
  "Emballage professionnel et assurance transport",
  "Suivi de commande dans votre espace client",
] as const;

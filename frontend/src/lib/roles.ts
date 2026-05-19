import type { UserRole } from "@/lib/api";

export const ROLE_LABELS: Record<UserRole, string> = {
  customer: "Client",
  admin: "Administrateur",
  artiste: "Artiste",
  commande: "Commandes",
};

export function roleLabel(role: UserRole) {
  return ROLE_LABELS[role] ?? role;
}

export function isAdminRole(role?: UserRole | null) {
  return role === "admin";
}

export function isArtisteRole(role?: UserRole | null) {
  return role === "artiste" || role === "admin";
}

export function isCommandeRole(role?: UserRole | null) {
  return role === "commande" || role === "admin";
}

export type PanelLink = {
  href: string;
  label: string;
};

export function panelLinksForRole(role?: UserRole | null): PanelLink[] {
  if (!role) return [];
  const links: PanelLink[] = [];
  if (role === "admin") {
    links.push({ href: "/admin", label: "Panneau admin" });
  }
  if (role === "artiste" || role === "admin") {
    links.push({ href: "/studio", label: "Espace artiste" });
  }
  if (role === "commande" || role === "admin") {
    links.push({ href: "/commande", label: "Gestion commandes" });
    links.push({ href: "/commande/alertes", label: "Gestion alertes" });
  }
  return links;
}

export function defaultHomeForRole(role: UserRole) {
  switch (role) {
    case "admin":
      return "/admin";
    case "artiste":
      return "/studio";
    case "commande":
      return "/commande";
    default:
      return "/account";
  }
}

const GENERIC_AUTH_REDIRECTS = new Set(["/", "/account", "/login", "/register"]);

/** Chemins boutique : on respecte la redirection après connexion. */
const SHOP_INTENT_PREFIXES = ["/checkout", "/wishlist"];

export function resolvePostLoginPath(role: UserRole, redirect: string) {
  const path = redirect?.trim() || "/";
  if (GENERIC_AUTH_REDIRECTS.has(path)) {
    return defaultHomeForRole(role);
  }
  if (SHOP_INTENT_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
    return path;
  }
  if (role === "customer") {
    return path;
  }
  return defaultHomeForRole(role);
}

export function isStaffRole(role?: UserRole | null) {
  return role === "admin" || role === "artiste" || role === "commande";
}

/** Compte boutique : panier, favoris et historique d'achats (clients uniquement). */
export function isCustomerRole(role?: UserRole | null) {
  return role === "customer";
}

export function hasPersonalShop(role?: UserRole | null) {
  return isCustomerRole(role);
}

export type NavLink = {
  label: string;
  href: string;
  mega?: boolean;
};

export type NavbarConfig = {
  centerNav: NavLink[];
  showCurrency: boolean;
  showSearch: boolean;
  showWishlist: boolean;
  showCart: boolean;
  showPersonalOrders: boolean;
  accountHref: string;
  accountMenuLabel: string;
};

const PUBLIC_NAV: NavLink[] = [
  { label: "Boutique", href: "/paintings", mega: true },
  { label: "Artiste", href: "/about" },
  { label: "Collections", href: "/collections" },
  { label: "Événements", href: "/calendar" },
  { label: "Inspiration", href: "/blog" },
];

const BOUTIQUE_NAV: NavLink[] = [
  { label: "Boutique", href: "/paintings", mega: true },
  { label: "Artiste", href: "/about" },
];

/** Navigation et actions du header selon le rôle connecté (ou visiteur). */
export function navbarConfigForRole(
  role?: UserRole | null,
  isAuthenticated = false,
): NavbarConfig {
  if (!isAuthenticated || !role) {
    return {
      centerNav: PUBLIC_NAV,
      showCurrency: true,
      showSearch: true,
      showWishlist: false,
      showCart: false,
      showPersonalOrders: false,
      accountHref: "/login",
      accountMenuLabel: "Connexion",
    };
  }

  switch (role) {
    case "commande":
      return {
        centerNav: [
          { label: "Commandes", href: "/commande" },
          { label: "Alertes", href: "/commande/alertes" },
          ...BOUTIQUE_NAV,
        ],
        showCurrency: false,
        showSearch: true,
        showWishlist: false,
        showCart: false,
        showPersonalOrders: false,
        accountHref: "/commande",
        accountMenuLabel: "Gestion commandes",
      };
    case "artiste":
      return {
        centerNav: [{ label: "Studio", href: "/studio" }, ...PUBLIC_NAV],
        showCurrency: true,
        showSearch: true,
        showWishlist: false,
        showCart: false,
        showPersonalOrders: false,
        accountHref: "/studio",
        accountMenuLabel: "Espace artiste",
      };
    case "admin":
      return {
        centerNav: [{ label: "Admin", href: "/admin" }, ...PUBLIC_NAV],
        showCurrency: true,
        showSearch: true,
        showWishlist: false,
        showCart: false,
        showPersonalOrders: false,
        accountHref: "/admin",
        accountMenuLabel: "Panneau admin",
      };
    case "customer":
    default:
      return {
        centerNav: PUBLIC_NAV,
        showCurrency: true,
        showSearch: true,
        showWishlist: true,
        showCart: true,
        showPersonalOrders: true,
        accountHref: "/account",
        accountMenuLabel: "Mon compte",
      };
  }
}

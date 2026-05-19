import catalog from "@/data/paintings-catalog.json";
import { mainNav } from "./navigation";
import { paintingImage } from "./paintings";

/** Liens boutique + œuvres en vedette pour le méga-menu */
export function buildShopMegaMenu() {
  const paintings = catalog.paintings;

  const shopNav = mainNav.find((n) => n.label === "Peintures");
  const primary =
    shopNav && "children" in shopNav ? shopNav.children.primary : [];

  const featured = paintings
    .filter((p) => p.featured || p.bestSeller)
    .slice(0, 4)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      image: paintingImage(p.slug),
      href: `/paintings/${p.slug}`,
    }));

  return { primary, featured };
}

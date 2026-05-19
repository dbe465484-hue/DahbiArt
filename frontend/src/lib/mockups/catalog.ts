import type { MockupCatalog, MockupDefinition, MockupCategory } from "./types";
import catalogJson from "../../../public/mockups/catalog.json";

export const mockupCatalog = catalogJson as MockupCatalog;

export function getAllMockups() {
  return mockupCatalog.mockups;
}

export function getMockupById(id: string) {
  return mockupCatalog.mockups.find((m) => m.id === id);
}

export function getMockupsByCategory(category: MockupCategory) {
  return mockupCatalog.mockups.filter((m) => m.category === category);
}

export function resolveMockupBackground(mockup: MockupDefinition) {
  if (typeof window !== "undefined" && mockup.background.startsWith("/")) {
    return `${window.location.origin}${mockup.background}`;
  }
  return mockup.background;
}

export type PaintingOrientation = "portrait" | "landscape" | "square";

export function detectOrientation(w: number, h: number): PaintingOrientation {
  const r = w / h;
  if (r > 1.15) return "landscape";
  if (r < 0.87) return "portrait";
  return "square";
}

export function recommendMockups(orientation: PaintingOrientation, limit = 4) {
  return [...mockupCatalog.mockups]
    .sort((a, b) => {
      const sa = a.recommendedOrientations.includes(orientation) ? 1 : 0;
      const sb = b.recommendedOrientations.includes(orientation) ? 1 : 0;
      return sb - sa;
    })
    .slice(0, limit);
}

export const CATEGORY_LABELS: Record<MockupCategory, string> = {
  maison: "Maison",
  commercial: "Commercial",
  style: "Style",
};

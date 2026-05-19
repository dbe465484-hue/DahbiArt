export type MockupCategory = "maison" | "commercial" | "style";

export type MockupStyleTag =
  | "minimaliste"
  | "industriel"
  | "scandinave"
  | "japonais"
  | "boheme"
  | "noir-premium"
  | "luxe";

export type Placement = {
  /** Zone intérieure du cadre vide (0–1) — le tableau va ICI uniquement */
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};

/** inset = cadre blanc sur la photo · hang = mur vide, tableau accroché */
export type MockupMode = "inset" | "hang";

export type MockupDefinition = {
  id: string;
  name: string;
  category: MockupCategory;
  styles: MockupStyleTag[];
  mode: MockupMode;
  background: string;
  backgroundSource?: string;
  placement: Placement;
  /** Adoucissement des bords (fraction de la taille, ex. 0.04) */
  feather: number;
  /** Couleur du passe-partout / zone blanche à recouvrir avant d’insérer l’œuvre */
  wallTone: string;
  blend?: { brightness: number; contrast: number; saturation: number };
  recommendedOrientations: ("portrait" | "landscape" | "square")[];
  tags: string[];
};

export type MockupCatalog = { version: number; mockups: MockupDefinition[] };

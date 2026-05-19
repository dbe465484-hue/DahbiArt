export type PaintingStatus = "available" | "sold";

export type Painting = {
  id: string;
  slug: string;
  title: string;
  year: number;
  dimensions: string;
  medium: string;
  price: number;
  status: PaintingStatus;
  printAvailable?: boolean;
  printPrice?: number;
  image: string;
  description: string;
  subject: string;
  location: string;
  collection: string;
  featured?: boolean;
  bestSeller?: boolean;
};

export type Collection = {
  slug: string;
  title: string;
  description: string;
  image: string;
  count: number;
  availableCount: number;
  previewImages: string[];
  themes: string;
};

export type CartItem = {
  painting: Painting;
  type: "original" | "print";
  quantity: number;
};

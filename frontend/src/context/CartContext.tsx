"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isCustomerRole } from "@/lib/roles";
import { getPaintingIndex } from "@/lib/painting-index";
import { paintingImage } from "@/lib/paintings";
import type { CartItem, Painting } from "@/lib/types";

type StoredCartLine = {
  slug: string;
  type: "original" | "print";
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  isHydrated: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (painting: Painting, type: "original" | "print") => void;
  removeItem: (slug: string, type: "original" | "print") => void;
  clearCart: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function storageKey(userId?: string | null) {
  return userId ? `mayn_cart_${userId}` : "mayn_cart_guest";
}

function readStored(key: string): StoredCartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is StoredCartLine =>
        typeof x === "object" &&
        x !== null &&
        typeof (x as StoredCartLine).slug === "string" &&
        ((x as StoredCartLine).type === "original" ||
          (x as StoredCartLine).type === "print") &&
        typeof (x as StoredCartLine).quantity === "number",
    );
  } catch {
    return [];
  }
}

function writeStored(key: string, lines: StoredCartLine[]) {
  localStorage.setItem(key, JSON.stringify(lines));
}

function toStored(items: CartItem[]): StoredCartLine[] {
  return items.map((i) => ({
    slug: i.painting.slug,
    type: i.type,
    quantity: i.quantity,
  }));
}

function mergeLines(a: StoredCartLine[], b: StoredCartLine[]): StoredCartLine[] {
  const map = new Map<string, StoredCartLine>();
  for (const line of [...a, ...b]) {
    const key = `${line.slug}:${line.type}`;
    const prev = map.get(key);
    if (prev) {
      map.set(key, { ...line, quantity: prev.quantity + line.quantity });
    } else {
      map.set(key, line);
    }
  }
  return [...map.values()];
}

function resolveLines(
  lines: StoredCartLine[],
  paintings: Painting[],
): CartItem[] {
  const bySlug = new Map(paintings.map((p) => [p.slug, p]));
  const out: CartItem[] = [];
  for (const line of lines) {
    const painting = bySlug.get(line.slug);
    if (!painting) continue;
    out.push({
      painting: {
        ...painting,
        image: painting.image || paintingImage(painting.slug),
      },
      type: line.type,
      quantity: Math.max(1, line.quantity),
    });
  }
  return out;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const skipPersist = useRef(false);

  const persist = useCallback(
    (next: CartItem[]) => {
      if (!user?.id || !isCustomerRole(user.role)) return;
      writeStored(storageKey(user.id), toStored(next));
    },
    [user?.id, user?.role],
  );

  const hydrateFromStorage = useCallback(async () => {
    const index = await getPaintingIndex();
    const key = storageKey(user?.id);

    if (user?.id && isCustomerRole(user.role)) {
      const guestLines = readStored(storageKey(null));
      const userLines = readStored(key);
      if (guestLines.length > 0) {
        const merged = mergeLines(userLines, guestLines);
        writeStored(key, merged);
        localStorage.removeItem(storageKey(null));
      }
    }

    const lines = user?.id && isCustomerRole(user.role) ? readStored(key) : [];
    skipPersist.current = true;
    setItems(resolveLines(lines, index.paintings));
    skipPersist.current = false;
    setIsHydrated(true);
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !isCustomerRole(user.role)) {
      skipPersist.current = true;
      setItems([]);
      setIsOpen(false);
      skipPersist.current = false;
      setIsHydrated(true);
      return;
    }

    setIsHydrated(false);
    void hydrateFromStorage();
  }, [authLoading, user?.id, user?.role, hydrateFromStorage]);

  useEffect(() => {
    if (!isHydrated || skipPersist.current) return;
    persist(items);
  }, [items, isHydrated, persist]);

  const addItem = useCallback(
    (painting: Painting, type: "original" | "print") => {
      if (!user?.id || !isCustomerRole(user.role)) {
        const path =
          typeof window !== "undefined"
            ? `${window.location.pathname}${window.location.search}`
            : "/paintings";
        router.push(`/login?redirect=${encodeURIComponent(path)}`);
        return;
      }

      const price =
        type === "original" ? painting.price : (painting.printPrice ?? 0);
      if (price <= 0 && type === "original") return;

      setItems((prev) => {
        const existing = prev.find(
          (i) => i.painting.slug === painting.slug && i.type === type,
        );
        if (existing) {
          return prev.map((i) =>
            i.painting.slug === painting.slug && i.type === type
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          );
        }
        return [
          ...prev,
          {
            painting: {
              ...painting,
              image: painting.image || paintingImage(painting.slug),
            },
            type,
            quantity: 1,
          },
        ];
      });
      setIsOpen(true);
    },
    [user?.id, user?.role, router],
  );

  const removeItem = useCallback((slug: string, type: "original" | "print") => {
    setItems((prev) =>
      prev.filter((i) => !(i.painting.slug === slug && i.type === type)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const unit =
          item.type === "original"
            ? item.painting.price
            : (item.painting.printPrice ?? 0);
        return sum + unit * item.quantity;
      }, 0),
    [items],
  );

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      isOpen,
      isHydrated,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      removeItem,
      clearCart,
      total,
      count,
    }),
    [items, isOpen, isHydrated, addItem, removeItem, clearCart, total, count],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

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
import { api } from "@/lib/api";
import { getPaintingIndex } from "@/lib/painting-index";
import { useAuth } from "@/context/AuthContext";
import { isCustomerRole } from "@/lib/roles";

const LEGACY_STORAGE_KEY = "mayn_wishlist_slugs";

function storageKey(userId: string) {
  return `mayn_wishlist_${userId}`;
}

type WishlistContextValue = {
  slugs: Set<string>;
  isLoading: boolean;
  isFavorite: (slug: string) => boolean;
  toggle: (slug: string) => Promise<void>;
  count: number;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readLocalSlugs(
  userId: string,
  slugById?: Map<string, string>,
  migrateLegacy = false,
): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
    }

    if (!migrateLegacy) return [];

    const legacyGlobal = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyGlobal) {
      const parsed = JSON.parse(legacyGlobal) as unknown;
      const slugs = Array.isArray(parsed)
        ? parsed.filter((x): x is string => typeof x === "string")
        : [];
      if (slugs.length > 0) {
        writeLocalSlugs(userId, slugs);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        return slugs;
      }
    }

    const legacy = localStorage.getItem("mayn_wishlist_ids");
    if (legacy && slugById) {
      const ids = JSON.parse(legacy) as unknown;
      if (Array.isArray(ids)) {
        const slugs = ids
          .filter((x): x is string => typeof x === "string")
          .map((id) => slugById.get(id))
          .filter((s): s is string => Boolean(s));
        if (slugs.length > 0) {
          writeLocalSlugs(userId, slugs);
          localStorage.removeItem("mayn_wishlist_ids");
          return slugs;
        }
      }
    }
    return [];
  } catch {
    return [];
  }
}

function writeLocalSlugs(userId: string, slugs: string[]) {
  localStorage.setItem(storageKey(userId), JSON.stringify(slugs));
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, getToken, isLoading: authLoading, user } = useAuth();
  const [slugs, setSlugs] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const idBySlugRef = useRef<Map<string, string>>(new Map());
  const slugByIdRef = useRef<Map<string, string>>(new Map());
  const syncedUserRef = useRef<string | null>(null);

  const applySlugs = useCallback(
    (list: string[]) => {
      setSlugs(new Set(list));
      if (user?.id) writeLocalSlugs(user.id, list);
    },
    [user?.id],
  );

  const ensureIndex = useCallback(async () => {
    const index = await getPaintingIndex();
    idBySlugRef.current = index.idBySlug;
    slugByIdRef.current = index.slugById;
    return index;
  }, []);

  const slugsToIds = useCallback((slugList: string[]) => {
    return slugList
      .map((s) => idBySlugRef.current.get(s))
      .filter((id): id is string => Boolean(id));
  }, []);

  const idsToSlugs = useCallback((ids: string[]) => {
    return ids
      .map((id) => slugByIdRef.current.get(id))
      .filter((s): s is string => Boolean(s));
  }, []);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    (async () => {
      await ensureIndex();
      if (cancelled) return;

      if (!isAuthenticated || !user) {
        syncedUserRef.current = null;
        setSlugs(new Set());
        return;
      }

      if (!isCustomerRole(user.role)) {
        syncedUserRef.current = null;
        setSlugs(new Set());
        return;
      }

      if (syncedUserRef.current && syncedUserRef.current !== user.id) {
        syncedUserRef.current = null;
      }

      if (syncedUserRef.current === user.id) return;

      const token = getToken();
      if (!token) {
        applySlugs(readLocalSlugs(user.id, slugByIdRef.current, true));
        return;
      }

      setIsLoading(true);
      const localSlugs = readLocalSlugs(user.id, slugByIdRef.current, true);

      try {
        if (localSlugs.length > 0) {
          const paintingIds = slugsToIds(localSlugs);
          const synced = await api.wishlist.sync(token, paintingIds);
          if (!cancelled) applySlugs(idsToSlugs(synced.paintingIds));
        } else {
          const res = await api.wishlist.list(token);
          if (!cancelled) applySlugs(idsToSlugs(res.paintingIds));
        }
        syncedUserRef.current = user.id;
      } catch {
        if (!cancelled) applySlugs(readLocalSlugs(user.id, slugByIdRef.current, true));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    isAuthenticated,
    user,
    getToken,
    applySlugs,
    ensureIndex,
    slugsToIds,
    idsToSlugs,
  ]);

  const toggle = useCallback(
    async (slug: string) => {
      if (!isAuthenticated || !user || !isCustomerRole(user.role)) return;

      await ensureIndex();

      const has = slugs.has(slug);
      const next = new Set(slugs);
      if (has) next.delete(slug);
      else next.add(slug);
      const nextList = [...next];
      const previousList = [...slugs];
      applySlugs(nextList);

      const token = getToken();
      if (!isAuthenticated || !token) return;

      const paintingId = idBySlugRef.current.get(slug);
      if (!paintingId) return;

      setIsLoading(true);
      try {
        const res = has
          ? await api.wishlist.remove(token, paintingId)
          : await api.wishlist.add(token, paintingId);
        applySlugs(idsToSlugs(res.paintingIds));
      } catch {
        applySlugs(previousList);
      } finally {
        setIsLoading(false);
      }
    },
    [slugs, isAuthenticated, user, getToken, applySlugs, ensureIndex, idsToSlugs],
  );

  const value = useMemo(
    () => ({
      slugs,
      isLoading,
      isFavorite: (slug: string) => slugs.has(slug),
      toggle,
      count: slugs.size,
    }),
    [slugs, isLoading, toggle],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

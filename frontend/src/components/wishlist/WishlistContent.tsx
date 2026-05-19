"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PaintingCard } from "@/components/paintings/PaintingCard";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { defaultHomeForRole, isCustomerRole } from "@/lib/roles";
import { getPaintings } from "@/lib/paintings";
import type { Painting } from "@/lib/types";

export function WishlistContent() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated, user } = useAuth();
  const { slugs, count } = useWishlist();
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/login?redirect=/wishlist");
      return;
    }
    if (user && !isCustomerRole(user.role)) {
      router.replace(defaultHomeForRole(user.role));
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !isCustomerRole(user?.role)) return;

    let cancelled = false;
    getPaintings().then((all) => {
      if (cancelled) return;
      const favs = all.filter((p) => slugs.has(p.slug));
      setPaintings(favs);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [slugs, authLoading, isAuthenticated, user?.role]);

  if (authLoading || !user || !isCustomerRole(user.role)) {
    return <p className="py-16 text-center text-stone-500">Chargement…</p>;
  }

  if (loading) {
    return <p className="py-16 text-center text-stone-500">Chargement…</p>;
  }

  if (count === 0) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-stone-600">Votre liste de favoris est vide.</p>
        <Link
          href="/paintings"
          className="mt-6 inline-block bg-stone-900 px-8 py-3 text-sm uppercase tracking-wider text-white hover:bg-amber-950"
        >
          Parcourir la galerie
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {paintings.map((p) => (
        <PaintingCard key={p.id} painting={p} />
      ))}
    </div>
  );
}

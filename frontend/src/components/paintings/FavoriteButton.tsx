"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { isCustomerRole } from "@/lib/roles";

type Props = {
  paintingSlug: string;
  className?: string;
};

export function FavoriteButton({ paintingSlug, className = "" }: Props) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { isFavorite, toggle, isLoading } = useWishlist();
  const active = isFavorite(paintingSlug);

  if (isAuthenticated && user && !isCustomerRole(user.role)) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated || !isCustomerRole(user?.role)) {
          const path =
            typeof window !== "undefined"
              ? `${window.location.pathname}${window.location.search}`
              : "/paintings";
          router.push(`/login?redirect=${encodeURIComponent(path)}`);
          return;
        }
        void toggle(paintingSlug);
      }}
      disabled={isLoading}
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/95 text-stone-700 shadow-md backdrop-blur-sm transition hover:scale-105 hover:border-amber-200 hover:text-amber-900 disabled:opacity-60 ${className}`}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={active}
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 20.5l-1.1-1C5.5 14.9 2 11.6 2 7.5 2 4.9 4 3 6.5 3c1.5 0 3 .9 3.8 2.2C11.1 3.9 12.6 3 14.1 3 16.6 3 18.6 4.9 18.6 7.5c0 4.1-3.5 7.4-8.9 11.9L12 20.5z"
        />
      </svg>
    </button>
  );
}

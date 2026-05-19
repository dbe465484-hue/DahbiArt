"use client";

import { useCart } from "@/context/CartContext";
import type { Painting } from "@/lib/types";

export function AddToCartButtons({ painting }: { painting: Painting }) {
  const { addItem } = useCart();
  const sold = painting.status === "sold";

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {!sold && (
        <button
          type="button"
          onClick={() => addItem(painting, "original")}
          className="bg-stone-900 px-8 py-3.5 text-sm uppercase tracking-widest text-white hover:bg-stone-800"
        >
          Ajouter au panier
        </button>
      )}
      {sold && painting.printAvailable && (
        <button
          type="button"
          onClick={() => addItem(painting, "print")}
          className="bg-stone-900 px-8 py-3.5 text-sm uppercase tracking-widest text-white hover:bg-stone-800"
        >
          Commander un tirage
        </button>
      )}
    </div>
  );
}

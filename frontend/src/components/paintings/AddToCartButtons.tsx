"use client";

import { useCart } from "@/context/CartContext";
import type { Painting } from "@/lib/types";

export function AddToCartButtons({ painting }: { painting: Painting }) {
  const { addItem } = useCart();
  const sold = painting.status === "sold";
  const canPrint = Boolean(painting.printAvailable && (painting.printPrice ?? 0) > 0);

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
      {canPrint && (
        <button
          type="button"
          onClick={() => addItem(painting, "print")}
          className={
            sold
              ? "bg-stone-900 px-8 py-3.5 text-sm uppercase tracking-widest text-white hover:bg-stone-800"
              : "border border-stone-300 bg-white px-8 py-3.5 text-sm uppercase tracking-widest text-stone-800 hover:border-amber-800 hover:text-amber-900"
          }
        >
          {sold ? "Commander un tirage" : "Ajouter un tirage"}
        </button>
      )}
    </div>
  );
}

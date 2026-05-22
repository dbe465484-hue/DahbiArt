"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import type { Painting } from "@/lib/types";

export function AddToCartButtons({ painting }: { painting: Painting }) {
  const { addItem } = useCart();
  const [feedback, setFeedback] = useState<string | null>(null);
  const sold = painting.status === "sold";
  const canPrint = Boolean(painting.printAvailable && (painting.printPrice ?? 0) > 0);
  const originalPriceOk = !sold && painting.price > 0;

  function handleAdd(type: "original" | "print") {
    const ok = addItem(painting, type);
    if (ok) {
      setFeedback(type === "original" ? "Ajouté au panier" : "Tirage ajouté");
      window.setTimeout(() => setFeedback(null), 2500);
    } else {
      setFeedback(
        type === "original" && painting.price <= 0
          ? "Prix non disponible — contactez l'atelier"
          : "Impossible d'ajouter cette ligne",
      );
      window.setTimeout(() => setFeedback(null), 3500);
    }
  }

  return (
    <div>
      <div className="mt-8 flex flex-wrap gap-3">
        {originalPriceOk && (
          <button
            type="button"
            onClick={() => handleAdd("original")}
            className="bg-stone-900 px-8 py-3.5 text-sm uppercase tracking-widest text-white hover:bg-stone-800"
          >
            Ajouter au panier
          </button>
        )}
        {canPrint && (
          <button
            type="button"
            onClick={() => handleAdd("print")}
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
      {feedback && (
        <p
          className="mt-3 text-sm text-amber-900"
          role="status"
          aria-live="polite"
        >
          {feedback}
        </p>
      )}
    </div>
  );
}

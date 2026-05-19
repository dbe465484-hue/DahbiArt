"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/paintings";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, total, count, isHydrated } = useCart();
  const { isAuthenticated } = useAuth();
  const checkoutHref = isAuthenticated ? "/checkout" : "/login?redirect=/checkout";

  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-black/40"
        onClick={closeCart}
        aria-label="Fermer le panier"
      />
      <aside className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h2 className="font-serif text-lg">Votre panier</h2>
          <button type="button" onClick={closeCart} className="text-stone-500 hover:text-stone-800" aria-label="Fermer">
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="text-center text-stone-500">Votre panier est vide.</p>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li key={`${item.painting.id}-${item.type}`} className="flex gap-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-stone-100">
                    <Image src={item.painting.image} alt={item.painting.title} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-stone-900">{item.painting.title}</p>
                    <p className="text-xs text-stone-500">
                      {item.type === "original" ? "Original" : "Tirage sur toile"} · {item.painting.dimensions}
                    </p>
                    <p className="mt-1 text-sm text-amber-800">
                      {formatPrice(
                        item.type === "original" ? item.painting.price : (item.painting.printPrice ?? 0),
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.painting.slug, item.type)}
                      className="mt-1 text-xs text-stone-400 underline hover:text-stone-600"
                    >
                      Retirer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-stone-200 px-6 py-6">
          <div className="mb-4 flex justify-between text-sm">
            <span>Total estimé</span>
            <span className="font-medium">{formatPrice(total)}</span>
          </div>
          <p className="mb-4 text-xs text-stone-500">Taxes et livraison calculées à la commande.</p>
          {isHydrated && count === 0 ? (
            <span className="block w-full rounded-sm bg-stone-200 py-3 text-center text-sm font-medium text-stone-500">
              Panier vide
            </span>
          ) : (
            <Link
              href={checkoutHref}
              onClick={closeCart}
              className="block w-full rounded-sm bg-stone-900 py-3 text-center text-sm font-medium text-white hover:bg-stone-800"
            >
              {isAuthenticated ? "Commander" : "Se connecter pour commander"}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}

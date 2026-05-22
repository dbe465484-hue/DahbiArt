"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { accountCardClass } from "@/components/account/account-form-styles";
import {
  CheckoutShippingForm,
  hasCompleteShipping,
  shippingFromUser,
  type ShippingFormData,
} from "@/components/checkout/CheckoutShippingForm";
import {
  homeBtnPrimary,
  homeEyebrow,
  homeTextureStyle,
  homeTitle,
  homeTitleItalic,
} from "@/components/home/home-theme";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { formatPrice, paintingImage } from "@/lib/paintings";
import {
  resolveShippingZone,
  shippingCostEur,
  shippingDelayHint,
  shippingZoneLabel,
} from "@/lib/shipping";
import type { CartItem } from "@/lib/types";

function linePrice(item: CartItem) {
  const unit =
    item.type === "original"
      ? item.painting.price
      : (item.painting.printPrice ?? 0);
  return unit * item.quantity;
}

function CheckoutLineItem({
  item,
  onRemove,
}: {
  item: CartItem;
  onRemove: () => void;
}) {
  const typeLabel = item.type === "original" ? "Original" : "Tirage sur toile";

  return (
    <li className="flex gap-4 border-b border-stone-100 py-5 last:border-0">
      <Link
        href={`/paintings/${item.painting.slug}`}
        className="relative h-24 w-20 shrink-0 overflow-hidden bg-[#f5f2eb] p-1"
      >
        <Image
          src={item.painting.image || paintingImage(item.painting.slug)}
          alt=""
          fill
          className="object-contain"
          sizes="80px"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              href={`/paintings/${item.painting.slug}`}
              className="font-serif text-lg text-stone-900 transition hover:text-amber-900"
            >
              {item.painting.title}
            </Link>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-amber-900/80">
              {typeLabel}
            </p>
            <p className="mt-0.5 text-xs text-stone-500">
              {item.painting.year} · {item.painting.dimensions}
              {item.quantity > 1 ? ` · ×${item.quantity}` : ""}
            </p>
          </div>
          <p className="shrink-0 font-medium text-stone-900">{formatPrice(linePrice(item))}</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="mt-2 text-xs text-stone-400 transition hover:text-stone-700"
        >
          Retirer
        </button>
      </div>
    </li>
  );
}

export function CheckoutPageContent() {
  const { items, total, removeItem, isHydrated, count } = useCart();
  const { user, isLoading, isAuthenticated, getToken } = useAuth();
  const router = useRouter();
  const [payError, setPayError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [shipping, setShipping] = useState<ShippingFormData | null>(null);

  const country = shipping?.country ?? "MA";
  const shippingZone = resolveShippingZone(country);
  const shippingCost = shipping ? shippingCostEur(country) : 0;
  const grandTotal = total + shippingCost;

  useEffect(() => {
    if (user) setShipping(shippingFromUser(user));
  }, [user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && count > 0) {
      router.replace("/login?redirect=/checkout");
    }
  }, [isLoading, isAuthenticated, count, router]);

  async function handlePay() {
    const token = getToken();
    if (!token || !user || !shipping) return;
    if (!hasCompleteShipping(shipping)) {
      setPayError("Renseignez votre adresse de livraison (adresse et ville).");
      return;
    }
    setPayError(null);
    setPaying(true);
    try {
      const res = await api.checkout.createSession(token, {
        items: items.map((i) => ({
          slug: i.painting.slug,
          type: i.type,
          quantity: i.quantity,
        })),
        shipping: {
          address: shipping.address.trim(),
          postalCode: shipping.postalCode.trim() || undefined,
          city: shipping.city.trim(),
          country: shipping.country,
          saveToProfile: shipping.saveToProfile,
        },
      });
      window.location.href = res.url;
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Impossible de lancer le paiement");
      setPaying(false);
    }
  }

  if (isLoading || !isHydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#faf7f2]">
        <p className="text-sm text-stone-500">Préparation de votre commande…</p>
      </div>
    );
  }

  if (!isAuthenticated && count > 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#faf7f2]">
        <p className="text-sm text-stone-500">Redirection vers la connexion…</p>
      </div>
    );
  }

  return (
    <div className="bg-[#faf7f2]">
      <section className="relative overflow-hidden border-b border-stone-200/80 bg-[#f6f1ea]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={homeTextureStyle}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 text-center lg:px-8 lg:py-20">
          <p className={homeEyebrow}>Commande</p>
          <h1 className={`mt-3 ${homeTitle} sm:text-4xl`}>
            Finaliser
            <span className={`mt-1 block ${homeTitleItalic}`}>votre achat</span>
          </h1>
          {user && count > 0 && (
            <p className="mx-auto mt-4 max-w-lg text-base text-stone-600">
              Bonjour {user.firstName}, vérifiez votre sélection et votre adresse de livraison.
            </p>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {count === 0 ? (
            <div className={`mx-auto max-w-md text-center ${accountCardClass}`}>
              <p className="font-serif text-2xl font-light text-stone-800">Votre panier est vide</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-500">
                Parcourez la galerie et ajoutez une œuvre ou un tirage pour passer commande.
              </p>
              <Link href="/paintings" className={`mt-8 inline-flex ${homeBtnPrimary}`}>
                Parcourir la galerie
              </Link>
            </div>
          ) : user && shipping ? (
            <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-12 xl:grid-cols-[1fr_24rem]">
              <div className="space-y-8">
                <div className={accountCardClass}>
                  <h2 className="font-serif text-xl text-stone-900">
                    Votre sélection
                    <span className="ml-2 text-base font-normal text-stone-500">
                      ({count} article{count > 1 ? "s" : ""})
                    </span>
                  </h2>
                  <ul className="mt-4">
                    {items.map((item) => (
                      <CheckoutLineItem
                        key={`${item.painting.id}-${item.type}`}
                        item={item}
                        onRemove={() => removeItem(item.painting.slug, item.type)}
                      />
                    ))}
                  </ul>
                </div>

                <CheckoutShippingForm
                  user={user}
                  value={shipping}
                  onChange={setShipping}
                />

                <div className={accountCardClass}>
                  <h2 className="font-serif text-xl text-stone-900">Paiement</h2>
                  <p className="mt-2 text-sm text-stone-500">
                    Paiement sécurisé par carte (Stripe). Vous recevrez un email de confirmation
                    après validation du paiement.
                  </p>
                  {payError && (
                    <p className="mt-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                      {payError}
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={paying}
                    onClick={handlePay}
                    className={`mt-6 w-full justify-center ${homeBtnPrimary} disabled:opacity-60`}
                  >
                    {paying ? "Redirection…" : `Payer ${formatPrice(grandTotal)}`}
                  </button>
                </div>
              </div>

              <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
                <div className={accountCardClass}>
                  <p className={homeEyebrow}>Compte</p>
                  <p className="mt-2 font-medium text-stone-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="mt-1 text-sm text-stone-500">{user.email}</p>
                </div>

                <div className={`${accountCardClass} bg-stone-900 text-white`}>
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-amber-200/80">
                    Récapitulatif
                  </p>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-stone-300">
                      <span>Sous-total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-stone-400">
                      <span>
                        Livraison ({shippingZoneLabel(shippingZone)})
                      </span>
                      <span>{shippingCost > 0 ? formatPrice(shippingCost) : "Offerte"}</span>
                    </div>
                    {shippingCost > 0 && (
                      <p className="text-xs text-stone-500">
                        Délai indicatif : {shippingDelayHint(shippingZone)}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex justify-between border-t border-white/15 pt-4">
                    <span className="font-medium">Total</span>
                    <span className="font-serif text-xl">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <Link
                  href="/paintings"
                  className="block text-center text-xs uppercase tracking-[0.16em] text-stone-400 transition hover:text-amber-900"
                >
                  ← Continuer mes achats
                </Link>
              </aside>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { accountCardClass } from "@/components/account/account-form-styles";
import { homeBtnPrimary, homeEyebrow } from "@/components/home/home-theme";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";

function CheckoutSuccessInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const { clearCart } = useCart();
  const orderId = searchParams.get("orderId");
  const sessionId = searchParams.get("session_id");
  const isDev = searchParams.get("dev") === "1";
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cleared, setCleared] = useState(false);
  const [loading, setLoading] = useState(Boolean(sessionId || (isDev && orderId)));

  useEffect(() => {
    if (cleared) return;
    clearCart();
    setCleared(true);
  }, [clearCart, cleared]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      if (isDev && orderId) {
        router.replace(
          `/login?redirect=${encodeURIComponent(`/checkout/success?orderId=${orderId}&dev=1`)}`,
        );
      } else if (sessionId) {
        router.replace(
          `/login?redirect=${encodeURIComponent(`/checkout/success?session_id=${sessionId}${orderId ? `&orderId=${orderId}` : ""}`)}`,
        );
      }
      return;
    }

    if (isDev && orderId) {
      api.checkout
        .confirmDev(token, orderId)
        .then((res) => {
          setReference(res.reference);
          setLoading(false);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Erreur");
          setLoading(false);
        });
      return;
    }

    if (sessionId) {
      let attempts = 0;
      const poll = () => {
        api.checkout
          .sessionStatus(token, sessionId)
          .then((res) => {
            if (res.status === "paid" || res.paidAt) {
              setReference(res.reference);
              setLoading(false);
              return;
            }
            attempts += 1;
            if (attempts < 12) {
              setTimeout(poll, 1500);
            } else {
              setReference(res.reference);
              setLoading(false);
            }
          })
          .catch((err) => {
            setError(err instanceof Error ? err.message : "Erreur");
            setLoading(false);
          });
      };
      poll();
      return;
    }

    setLoading(false);
  }, [isDev, orderId, sessionId, getToken, router]);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className={accountCardClass}>
        <p className={homeEyebrow}>Commande</p>
        {error ? (
          <p className="mt-4 text-sm text-red-800">{error}</p>
        ) : (
          <>
            <h1 className="mt-4 font-serif text-3xl text-stone-900">Merci pour votre commande</h1>
            <p className="mt-4 text-sm text-stone-600">
              {loading
                ? "Confirmation du paiement en cours…"
                : reference
                  ? `Référence : ${reference}`
                  : "Votre paiement a été enregistré. Un email de confirmation vous sera envoyé sous peu."}
            </p>
          </>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={orderId ? `/account/orders/${orderId}` : "/account/orders"}
            className={`inline-flex justify-center ${homeBtnPrimary}`}
          >
            Suivre ma commande
          </Link>
          <Link
            href="/paintings"
            className="text-sm text-stone-500 underline hover:text-stone-800"
          >
            Retour à la galerie
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <p className="py-20 text-center text-sm text-stone-500">Chargement…</p>
      }
    >
      <CheckoutSuccessInner />
    </Suspense>
  );
}

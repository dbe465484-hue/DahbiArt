"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { accountCardClass } from "@/components/account/account-form-styles";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import {
  homeEyebrow,
  homeLink,
  homeTextureStyle,
  homeTitle,
} from "@/components/home/home-theme";
import { useAuth } from "@/context/AuthContext";
import { api, type OrderDetail } from "@/lib/api";
import {
  ORDER_STATUS_CLIENT,
  ORDER_STATUS_SHORT,
  formatOrderDate,
  orderStatusTone,
} from "@/lib/order-display";
import { OrderReportModal } from "@/components/account/OrderReportModal";
import { canReportOrder } from "@/lib/order-alerts";
import { defaultHomeForRole, isCustomerRole } from "@/lib/roles";
import { formatPrice } from "@/lib/paintings";

const TYPE_LABEL = { original: "Original", print: "Tirage sur toile" };

const COUNTRY_LABELS: Record<string, string> = {
  MA: "Maroc",
  FR: "France",
  BE: "Belgique",
  CH: "Suisse",
  ES: "Espagne",
  US: "États-Unis",
};

export function AccountOrderDetailContent({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { getToken, isLoading: authLoading, isAuthenticated, user } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);

  const ready = isAuthenticated && user && isCustomerRole(user.role);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace(`/login?redirect=/account/orders/${orderId}`);
      return;
    }
    if (user && !isCustomerRole(user.role)) {
      router.replace(defaultHomeForRole(user.role));
    }
  }, [authLoading, isAuthenticated, user, router, orderId]);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setOrder(await api.accountOrders.get(token, orderId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Commande introuvable");
    } finally {
      setLoading(false);
    }
  }, [getToken, orderId]);

  useEffect(() => {
    if (!ready) return;
    void load();
  }, [ready, load]);

  if (authLoading || !ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#faf7f2]">
        <p className="text-sm text-stone-500">Chargement…</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf7f2]">
        <section className="border-b border-stone-200/80 bg-[#f6f1ea] px-4 py-12">
          <div className="mx-auto max-w-3xl animate-pulse space-y-3">
            <div className="h-4 w-28 rounded bg-stone-200" />
            <div className="h-8 w-48 rounded bg-stone-200" />
          </div>
        </section>
        <section className="mx-auto max-w-3xl px-4 py-10">
          <div className={`animate-pulse ${accountCardClass}`}>
            <div className="h-4 w-full rounded bg-stone-100" />
            <div className="mt-4 h-4 w-2/3 rounded bg-stone-100" />
          </div>
        </section>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#faf7f2] px-4 py-16">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-red-800">{error ?? "Commande introuvable"}</p>
          <Link href="/account/orders" className={`mt-6 inline-block text-sm ${homeLink}`}>
            ← Retour à mes commandes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <section className="relative overflow-hidden border-b border-stone-200/80 bg-[#f6f1ea]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={homeTextureStyle}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 py-10 lg:px-8 lg:py-14">
          <Link href="/account/orders" className={`text-sm ${homeLink}`}>
            ← Mes commandes
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <h1 className={`${homeTitle} text-3xl sm:text-4xl`}>{order.reference}</h1>
            <AdminStatusBadge
              label={ORDER_STATUS_SHORT[order.status]}
              tone={orderStatusTone(order.status)}
            />
          </div>
          <p className="mt-2 text-sm text-stone-600">{ORDER_STATUS_CLIENT[order.status]}</p>
          <p className="mt-1 text-sm text-stone-500">
            Passée le {formatOrderDate(order.createdAt, true)}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-6 px-4 py-10 lg:px-8">
        {canReportOrder(order.status) && (
          <section className="rounded-xl border border-amber-200 bg-amber-50/60 px-5 py-4">
            <h2 className={homeEyebrow}>Un problème ?</h2>
            <p className="mt-2 text-sm text-stone-600">
              Pas de confirmation reçue, livraison en retard ou autre souci — signalez-le
              à notre équipe.
            </p>
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="mt-4 rounded-lg bg-amber-900 px-4 py-2 text-sm font-medium text-white hover:bg-amber-950"
            >
              Signaler un problème
            </button>
          </section>
        )}

        {order.status === "shipped" && order.shippingCarrier && (
          <div className="rounded-xl border border-sky-200 bg-sky-50/80 px-5 py-4">
            <p className={homeEyebrow}>Suivi colis</p>
            <p className="mt-2 text-sm text-sky-950">
              Transporteur : <strong>{order.shippingCarrier}</strong>
            </p>
            {order.shippingTrackingNumber && (
              <p className="mt-1 font-mono text-sm text-sky-900">
                {order.shippingTrackingNumber}
              </p>
            )}
            {order.shippedAt && (
              <p className="mt-2 text-xs text-sky-700/80">
                Expédiée le {formatOrderDate(order.shippedAt, true)}
              </p>
            )}
          </div>
        )}

        {order.history.length > 0 && (
          <section className={accountCardClass}>
            <h2 className={homeEyebrow}>Historique</h2>
            <ol className="mt-4 space-y-4 border-l-2 border-stone-100 pl-4">
              {order.history.map((ev) => (
                <li key={ev.id} className="text-sm">
                  <p className="text-stone-900">{ev.message}</p>
                  <p className="mt-0.5 text-xs text-stone-400">
                    {formatOrderDate(ev.createdAt, true)}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className={accountCardClass}>
            <h2 className={homeEyebrow}>Livraison</h2>
            <address className="mt-3 not-italic text-sm leading-relaxed text-stone-600">
              {order.shippingAddress && <span className="block">{order.shippingAddress}</span>}
              {(order.shippingPostalCode || order.shippingCity) && (
                <span className="block">
                  {[order.shippingPostalCode, order.shippingCity].filter(Boolean).join(" ")}
                </span>
              )}
              <span className="block">
                {COUNTRY_LABELS[order.shippingCountry] ?? order.shippingCountry}
              </span>
            </address>
          </section>

          <section className={accountCardClass}>
            <h2 className={homeEyebrow}>Récapitulatif</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-stone-600">
                <dt>Sous-total</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-stone-600">
                <dt>Livraison</dt>
                <dd>{formatPrice(order.shippingAmount)}</dd>
              </div>
              <div className="flex justify-between border-t border-stone-100 pt-3 font-medium text-stone-900">
                <dt>Total</dt>
                <dd className="font-serif text-lg">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>
        </div>

        <section className={accountCardClass}>
          <h2 className={homeEyebrow}>Articles</h2>
          <ul className="mt-4 divide-y divide-stone-100">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-4 first:pt-0">
                <div>
                  <p className="font-medium text-stone-900">{item.paintingTitle}</p>
                  <p className="text-sm text-stone-500">
                    {TYPE_LABEL[item.type]}
                    {item.quantity > 1 ? ` · ×${item.quantity}` : ""}
                  </p>
                </div>
                <p className="shrink-0 font-medium text-stone-900">
                  {formatPrice(item.lineTotal)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </section>

      <OrderReportModal
        open={reportOpen}
        orderId={order.id}
        orderReference={order.reference}
        onClose={() => setReportOpen(false)}
        onSuccess={() => void load()}
      />
    </div>
  );
}

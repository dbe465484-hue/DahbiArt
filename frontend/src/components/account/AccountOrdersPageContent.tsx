"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { accountCardClass } from "@/components/account/account-form-styles";
import { OrderReportModal } from "@/components/account/OrderReportModal";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import {
  homeBtnPrimary,
  homeEyebrow,
  homeLink,
  homeTextureStyle,
  homeTitle,
  homeTitleItalic,
} from "@/components/home/home-theme";
import { useAuth } from "@/context/AuthContext";
import { api, type OrderStatus, type OrderSummary } from "@/lib/api";
import {
  ORDER_STATUS_CLIENT,
  ORDER_STATUS_SHORT,
  formatOrderDate,
  orderProgressStep,
  orderStatusTone,
} from "@/lib/order-display";
import { canReportOrder } from "@/lib/order-alerts";
import { defaultHomeForRole, isCustomerRole } from "@/lib/roles";
import { formatPrice } from "@/lib/paintings";

type FilterId = "all" | "active" | "shipped" | "cancelled";

const FILTERS: { id: FilterId; label: string; match: (s: OrderStatus) => boolean }[] = [
  { id: "all", label: "Toutes", match: () => true },
  {
    id: "active",
    label: "En cours",
    match: (s) => s === "pending" || s === "paid",
  },
  { id: "shipped", label: "Expédiées", match: (s) => s === "shipped" },
  { id: "cancelled", label: "Annulées", match: (s) => s === "cancelled" },
];

function OrderProgress({ status }: { status: OrderStatus }) {
  const step = orderProgressStep(status);
  if (status === "cancelled") {
    return (
      <p className="text-xs text-stone-400">Commande annulée</p>
    );
  }

  const labels = ["Commande", "Préparation", "Expédition"];
  return (
    <div className="mt-4">
      <div className="flex gap-1">
        {labels.map((label, i) => {
          const done = step > i;
          const current = step === i + 1;
          return (
            <div key={label} className="flex-1">
              <div
                className={`h-1 rounded-full transition-colors ${
                  done || current ? "bg-amber-800" : "bg-stone-200"
                }`}
              />
              <p
                className={`mt-1.5 truncate text-[10px] uppercase tracking-wide ${
                  current ? "font-medium text-amber-900" : "text-stone-400"
                }`}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <ul className="space-y-4">
      {[1, 2, 3].map((n) => (
        <li
          key={n}
          className={`animate-pulse ${accountCardClass}`}
          aria-hidden
        >
          <div className="h-4 w-32 rounded bg-stone-200" />
          <div className="mt-3 h-3 w-48 rounded bg-stone-100" />
          <div className="mt-6 h-1 w-full rounded bg-stone-100" />
        </li>
      ))}
    </ul>
  );
}

export function AccountOrdersPageContent() {
  const router = useRouter();
  const { getToken, isLoading: authLoading, isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterId>("all");
  const [reportTarget, setReportTarget] = useState<OrderSummary | null>(null);

  const ready = isAuthenticated && user && isCustomerRole(user.role);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/login?redirect=/account/orders");
      return;
    }
    if (user && !isCustomerRole(user.role)) {
      router.replace(defaultHomeForRole(user.role));
    }
  }, [authLoading, isAuthenticated, user, router]);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setOrders(await api.accountOrders.list(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger vos commandes");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (!ready) return;
    void load();
  }, [ready, load]);

  const filtered = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter) ?? FILTERS[0];
    return orders.filter((o) => f.match(o.status));
  }, [orders, filter]);

  const counts = useMemo(() => {
    const c: Record<FilterId, number> = {
      all: orders.length,
      active: 0,
      shipped: 0,
      cancelled: 0,
    };
    for (const o of orders) {
      if (o.status === "pending" || o.status === "paid") c.active += 1;
      if (o.status === "shipped") c.shipped += 1;
      if (o.status === "cancelled") c.cancelled += 1;
    }
    return c;
  }, [orders]);

  if (authLoading || !ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#faf7f2]">
        <p className="text-sm text-stone-500">Chargement…</p>
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
        <div className="relative mx-auto max-w-3xl px-4 py-12 lg:px-8 lg:py-16">
          <Link href="/account" className={`text-sm ${homeLink}`}>
            ← Mon compte
          </Link>
          <p className={`mt-6 ${homeEyebrow}`}>Suivi</p>
          <h1 className={`mt-2 ${homeTitle} sm:text-4xl`}>
            Mes
            <span className={`block ${homeTitleItalic}`}>commandes</span>
          </h1>
          <p className="mt-4 max-w-lg text-base text-stone-600">
            Consultez l&apos;historique de vos achats et le statut de chaque livraison.
          </p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          {orders.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {FILTERS.map((f) => {
                const active = filter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-stone-900 text-white shadow-sm"
                        : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    {f.label}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        active ? "bg-white/20" : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {counts[f.id]}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => void load()}
                className="mt-2 font-medium underline"
              >
                Réessayer
              </button>
            </div>
          )}

          {loading ? (
            <OrdersSkeleton />
          ) : orders.length === 0 ? (
            <div className={`text-center ${accountCardClass}`}>
              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-400"
                aria-hidden
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                </svg>
              </div>
              <p className="mt-4 font-serif text-xl text-stone-800">Aucune commande</p>
              <p className="mt-2 text-sm text-stone-500">
                Vos commandes apparaîtront ici après un achat sur la boutique.
              </p>
              <Link href="/paintings" className={`mt-8 inline-flex ${homeBtnPrimary}`}>
                Découvrir la galerie
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className={`text-center ${accountCardClass}`}>
              <p className="text-stone-600">Aucune commande dans cette catégorie.</p>
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="mt-4 text-sm font-medium text-amber-900 underline"
              >
                Voir toutes les commandes
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {filtered.map((o) => (
                <li
                  key={o.id}
                  className={`border-l-4 border-l-amber-800/80 ${accountCardClass}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <Link
                      href={`/account/orders/${o.id}`}
                      className="group min-w-0 flex-1"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-medium text-stone-900">{o.reference}</p>
                        <AdminStatusBadge
                          label={ORDER_STATUS_SHORT[o.status]}
                          tone={orderStatusTone(o.status)}
                        />
                      </div>
                      <p className="mt-1 text-sm text-stone-500">
                        {formatOrderDate(o.createdAt)}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-400">
                        {ORDER_STATUS_CLIENT[o.status]}
                      </p>
                      <OrderProgress status={o.status} />
                    </Link>
                    <div className="flex shrink-0 flex-col items-end gap-2 text-right">
                      <p className="font-serif text-xl text-stone-900">
                        {formatPrice(o.total)}
                      </p>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-stone-400">
                        Actions
                      </p>
                      {canReportOrder(o.status) ? (
                        <button
                          type="button"
                          onClick={() => setReportTarget(o)}
                          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-950 transition hover:bg-amber-100"
                        >
                          Signaler
                        </button>
                      ) : (
                        <span className="text-xs text-stone-400">—</span>
                      )}
                      <Link
                        href={`/account/orders/${o.id}`}
                        className="text-xs text-amber-900 underline-offset-2 hover:underline"
                      >
                        Détail →
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {reportTarget && (
        <OrderReportModal
          open
          orderId={reportTarget.id}
          orderReference={reportTarget.reference}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}

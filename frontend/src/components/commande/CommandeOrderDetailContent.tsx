"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminRowActionsMenu } from "@/components/admin/AdminRowActionsMenu";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAuth } from "@/context/AuthContext";
import {
  api,
  type OrderDetail,
  type OrderStatus,
  type UpdateOrderStatusPayload,
} from "@/lib/api";
import { formatPrice } from "@/lib/paintings";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "En attente",
  paid: "Payée",
  shipped: "Expédiée",
  cancelled: "Annulée",
};

const STATUS_TONE = (status: OrderStatus) => {
  switch (status) {
    case "paid":
      return "success" as const;
    case "shipped":
      return "sky" as const;
    case "cancelled":
      return "muted" as const;
    default:
      return "warning" as const;
  }
};

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["cancelled"],
  cancelled: [],
};

const TYPE_LABEL = { original: "Original", print: "Tirage sur toile" };

const COUNTRY_LABELS: Record<string, string> = {
  MA: "Maroc",
  FR: "France",
  BE: "Belgique",
  CH: "Suisse",
  ES: "Espagne",
  US: "États-Unis",
};

export function CommandeOrderDetailContent({ orderId }: { orderId: string }) {
  const { getToken, isAdmin } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [showShipForm, setShowShipForm] = useState(false);
  const [carrier, setCarrier] = useState("");
  const [tracking, setTracking] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setError(null);
    try {
      const data = await api.commande.get(token, orderId);
      setOrder(data);
      setNoteDraft(data.internalNote ?? "");
      setCarrier(data.shippingCarrier ?? "");
      setTracking(data.shippingTrackingNumber ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  }, [getToken, orderId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(payload: UpdateOrderStatusPayload) {
    const token = getToken();
    if (!token) return;
    setStatusLoading(true);
    try {
      setOrder(await api.commande.updateStatus(token, orderId, payload));
      setShowShipForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleShipSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!carrier.trim()) {
      alert("Indiquez le transporteur.");
      return;
    }
    await handleStatusChange({
      status: "shipped",
      shippingCarrier: carrier.trim(),
      shippingTrackingNumber: tracking.trim() || undefined,
    });
  }

  async function handleSaveNote() {
    const token = getToken();
    if (!token) return;
    setNoteSaving(true);
    try {
      setOrder(await api.commande.updateInternalNote(token, orderId, noteDraft));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setNoteSaving(false);
    }
  }

  async function handleRefund() {
    if (
      !confirm(
        "Rembourser cette commande via Stripe et la passer en annulée ? Les originaux redeviendront disponibles.",
      )
    ) {
      return;
    }
    const token = getToken();
    if (!token) return;
    setRefundLoading(true);
    try {
      setOrder(await api.commande.refund(token, orderId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setRefundLoading(false);
    }
  }

  async function handleDownload(kind: "invoice" | "preparation") {
    const token = getToken();
    if (!token || !order) return;
    setPdfLoading(kind);
    try {
      if (kind === "invoice") {
        await api.commande.downloadInvoice(token, orderId, order.reference);
      } else {
        await api.commande.downloadPreparation(token, orderId, order.reference);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setPdfLoading(null);
    }
  }

  if (error) {
    return <p className="text-red-800">{error}</p>;
  }

  if (!order) {
    return <p className="text-stone-500">Chargement…</p>;
  }

  const canRefund =
    (order.status === "paid" || order.status === "shipped") && !order.refundedAt;

  const statusOptions = NEXT_STATUSES[order.status]
    .filter((s) => s !== "shipped")
    .map((s) => ({
      label: STATUS_LABELS[s],
      active: false,
      onSelect: () => handleStatusChange({ status: s }),
    }));

  return (
    <div>
      <Link
        href="/commande"
        className="text-sm text-stone-500 transition hover:text-amber-900"
      >
        ← Retour aux commandes
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <AdminPageHeader
          title={order.reference}
          description={`Commande du ${new Date(order.createdAt).toLocaleDateString("fr-FR")}`}
        />
        <div className="flex flex-wrap items-center gap-3">
          <AdminStatusBadge
            label={STATUS_LABELS[order.status]}
            tone={STATUS_TONE(order.status)}
          />
          <button
            type="button"
            disabled={pdfLoading === "invoice"}
            onClick={() => handleDownload("invoice")}
            className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 disabled:opacity-50"
          >
            {pdfLoading === "invoice" ? "…" : "Facture PDF"}
          </button>
          <button
            type="button"
            disabled={pdfLoading === "preparation"}
            onClick={() => handleDownload("preparation")}
            className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 disabled:opacity-50"
          >
            {pdfLoading === "preparation" ? "…" : "Bon de préparation"}
          </button>
          {canRefund && (
            <button
              type="button"
              disabled={refundLoading}
              onClick={handleRefund}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-100 disabled:opacity-50"
            >
              {refundLoading ? "…" : "Rembourser"}
            </button>
          )}
          {order.status === "paid" && (
            <button
              type="button"
              onClick={() => setShowShipForm((v) => !v)}
              className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-amber-950"
            >
              Marquer expédiée
            </button>
          )}
          {statusOptions.length > 0 && (
            <AdminRowActionsMenu
              statusMenuLabel="Changer le statut"
              statusLoading={statusLoading}
              statusOptions={statusOptions}
            />
          )}
        </div>
      </div>

      {showShipForm && order.status === "paid" && (
        <form
          onSubmit={handleShipSubmit}
          className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50/50 p-6"
        >
          <h2 className="text-sm font-semibold text-stone-900">Expédition</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-stone-600">Transporteur *</span>
              <input
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="DHL, Chronopost…"
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="text-stone-600">N° de suivi</span>
              <input
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2"
              />
            </label>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              disabled={statusLoading}
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {statusLoading ? "Enregistrement…" : "Confirmer l'expédition"}
            </button>
            <button
              type="button"
              onClick={() => setShowShipForm(false)}
              className="text-sm text-stone-600 underline"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {order.status === "shipped" && order.shippingCarrier && (
        <p className="mt-4 text-sm text-stone-600">
          Suivi : <strong>{order.shippingCarrier}</strong>
          {order.shippingTrackingNumber && (
            <>
              {" "}
              — {order.shippingTrackingNumber}
            </>
          )}
          {order.shippedAt && (
            <span className="text-stone-400">
              {" "}
              (expédiée le{" "}
              {new Date(order.shippedAt).toLocaleDateString("fr-FR")})
            </span>
          )}
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-stone-200/90 bg-white p-6 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Client
          </h2>
          <p className="mt-3 font-medium text-stone-900">{order.customerName}</p>
          <p className="mt-2 flex flex-wrap gap-3 text-sm">
            <a
              href={`mailto:${encodeURIComponent(order.email)}?subject=${encodeURIComponent(`Commande ${order.reference}`)}`}
              className="font-medium text-amber-900 underline-offset-2 hover:underline"
            >
              {order.email}
            </a>
            {isAdmin && (
              <Link
                href={`/admin/users/${order.userId}/edit`}
                className="text-stone-500 hover:text-amber-900"
              >
                Fiche client →
              </Link>
            )}
          </p>
          {order.phone && <p className="mt-1 text-sm text-stone-600">{order.phone}</p>}
        </section>

        <section className="rounded-xl border border-stone-200/90 bg-white p-6 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Adresse de livraison
          </h2>
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
      </div>

      <section className="mt-6 rounded-xl border border-stone-200/90 bg-white p-6 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          Note interne
        </h2>
        <p className="mt-1 text-xs text-stone-400">Visible uniquement par l&apos;équipe commandes.</p>
        <textarea
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          rows={3}
          className="mt-3 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
          placeholder="Instructions atelier, remarques…"
        />
        <button
          type="button"
          disabled={noteSaving}
          onClick={handleSaveNote}
          className="mt-3 rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
        >
          {noteSaving ? "Enregistrement…" : "Enregistrer la note"}
        </button>
      </section>

      {order.history.length > 0 && (
        <section className="mt-6 rounded-xl border border-stone-200/90 bg-white p-6 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Historique
          </h2>
          <ol className="mt-4 space-y-3 border-l-2 border-stone-100 pl-4">
            {order.history.map((ev) => (
              <li key={ev.id} className="text-sm">
                <p className="text-stone-900">{ev.message}</p>
                <p className="mt-0.5 text-xs text-stone-400">
                  {new Date(ev.createdAt).toLocaleString("fr-FR")}
                  {ev.actorName ? ` — ${ev.actorName}` : ""}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-6 overflow-hidden rounded-xl border border-stone-200/90 bg-white shadow-sm">
        <h2 className="border-b border-stone-100 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">
          Articles commandés
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/80 text-left text-xs uppercase tracking-wide text-stone-500">
                <th className="px-6 py-3">Œuvre</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3 text-right">Qté</th>
                <th className="px-6 py-3 text-right">Prix unit.</th>
                <th className="px-6 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-stone-50 last:border-0">
                  <td className="px-6 py-4 font-medium text-stone-900">{item.paintingTitle}</td>
                  <td className="px-6 py-4 text-stone-600">{TYPE_LABEL[item.type]}</td>
                  <td className="px-6 py-4 text-right text-stone-600">{item.quantity}</td>
                  <td className="px-6 py-4 text-right text-stone-600">
                    {formatPrice(item.unitPrice)}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-stone-900">
                    {formatPrice(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-2 border-t border-stone-100 px-6 py-4 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Sous-total</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Livraison</span>
            <span>{formatPrice(order.shippingAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-stone-100 pt-3 font-medium text-stone-900">
            <span>Total</span>
            <span className="font-serif text-lg">{formatPrice(order.total)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

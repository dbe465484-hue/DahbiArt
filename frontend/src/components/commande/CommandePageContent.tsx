"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminRowActionsMenu } from "@/components/admin/AdminRowActionsMenu";
import { AdminKpiGrid, AdminKpiSkeleton } from "@/components/admin/AdminKpi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAuth } from "@/context/AuthContext";
import {
  api,
  type OrderStats,
  type OrderStatus,
  type OrderSummary,
  type UpdateOrderStatusPayload,
} from "@/lib/api";
import { downloadOrdersCsv } from "@/lib/export-orders-csv";
import { formatPrice } from "@/lib/paintings";

const statusLabel: Record<OrderSummary["status"], string> = {
  pending: "En attente",
  paid: "Payée",
  shipped: "Expédiée",
  cancelled: "Annulée",
};

const statusTone = (status: OrderSummary["status"]) => {
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

function formatOrderDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function OrderCustomerCell({
  order,
  isAdmin,
}: {
  order: OrderSummary;
  isAdmin: boolean;
}) {
  const mailto = `mailto:${encodeURIComponent(order.email)}?subject=${encodeURIComponent(
    `Commande ${order.reference}`,
  )}`;

  return (
    <div>
      <p className="font-medium text-stone-900">{order.customerName}</p>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <a href={mailto} className="text-amber-900 underline-offset-2 hover:underline">
          {order.email}
        </a>
        {order.shippingCity && (
          <span className="text-stone-500">{order.shippingCity}</span>
        )}
        {isAdmin && (
          <Link
            href={`/admin/users/${order.userId}/edit`}
            className="text-stone-500 hover:text-amber-900"
          >
            Fiche client →
          </Link>
        )}
      </div>
    </div>
  );
}

export function CommandePageContent() {
  const { getToken, isAdmin } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderSummary[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    paid: 0,
    shipped: 0,
    cancelled: 0,
    revenueMonth: 0,
    averageOrder: 0,
    delayedOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusId, setStatusId] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [list, s] = await Promise.all([
        api.commande.orders(token),
        api.commande.stats(token),
      ]);
      setOrders(list);
      setStats(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(id: string, status: OrderStatus) {
    const token = getToken();
    if (!token) return;

    let payload: UpdateOrderStatusPayload = { status };
    if (status === "shipped") {
      const carrier = window.prompt("Transporteur (ex. DHL, Chronopost) :");
      if (!carrier?.trim()) return;
      const tracking = window.prompt("N° de suivi (optionnel) :") ?? "";
      payload = {
        status,
        shippingCarrier: carrier.trim(),
        shippingTrackingNumber: tracking.trim() || undefined,
      };
    }

    setStatusId(id);
    try {
      const updated = await api.commande.updateStatus(token, id, payload);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? { ...o, status: updated.status, total: updated.total }
            : o,
        ),
      );
      setStats(await api.commande.stats(token));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setStatusId(null);
    }
  }

  function handleExport() {
    const toExport =
      selectedKeys.size > 0
        ? orders.filter((o) => selectedKeys.has(o.id))
        : filteredOrders;
    if (toExport.length === 0) {
      alert("Aucune commande à exporter.");
      return;
    }
    downloadOrdersCsv(toExport);
  }

  const kpiItems = [
    { label: "Total", value: stats.total, tone: "sky" as const, hint: "Commandes" },
    { label: "En attente", value: stats.pending, tone: "amber" as const, hint: "À traiter" },
    { label: "Payées", value: stats.paid, tone: "green" as const, hint: "Confirmées" },
    { label: "Expédiées", value: stats.shipped, tone: "stone" as const, hint: "Livrées" },
    {
      label: "CA du mois",
      value: formatPrice(stats.revenueMonth),
      tone: "green" as const,
      hint: "Commandes payées",
    },
    {
      label: "Panier moyen",
      value: formatPrice(stats.averageOrder),
      tone: "sky" as const,
      hint: "Ce mois-ci",
    },
    {
      label: "En retard",
      value: stats.delayedOrders,
      tone: stats.delayedOrders > 0 ? ("amber" as const) : ("stone" as const),
      hint: "Payées non expédiées",
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Gestion des commandes"
        description="Suivi des ventes, expéditions et export comptable."
        actions={
          <Link
            href="/commande/alertes"
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-950 shadow-sm hover:bg-amber-100"
          >
            Gestion alertes
          </Link>
        }
      />

      {error && (
        <p className="mt-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <section className="mt-8">
        {loading ? (
          <AdminKpiSkeleton count={7} columns={4} />
        ) : (
          <AdminKpiGrid items={kpiItems} columns={4} />
        )}
      </section>

      <AdminDataTable
        rows={orders}
        isLoading={loading}
        getRowKey={(o) => o.id}
        getSearchText={(o) =>
          `${o.reference} ${o.customerName} ${o.email} ${o.shippingCity ?? ""} ${o.status}`
        }
        searchPlaceholder="Référence, nom, email, ville…"
        emptyMessage="Aucune commande pour le moment."
        defaultSortColumn="date"
        defaultSortDir="desc"
        selectable
        selectedKeys={selectedKeys}
        onSelectedKeysChange={setSelectedKeys}
        onFilteredRowsChange={setFilteredOrders}
        headerActions={
          <button
            type="button"
            onClick={handleExport}
            className="rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition hover:border-stone-300 hover:bg-stone-50"
          >
            Exporter CSV
          </button>
        }
        bulkActions={
          <button
            type="button"
            onClick={() => setSelectedKeys(new Set())}
            className="text-sm text-stone-600 underline hover:text-stone-900"
          >
            Tout désélectionner
          </button>
        }
        tabs={[
          { id: "all", label: "Toutes", match: () => true },
          { id: "pending", label: "En attente", match: (o) => o.status === "pending" },
          { id: "paid", label: "Payées", match: (o) => o.status === "paid" },
          { id: "shipped", label: "Expédiées", match: (o) => o.status === "shipped" },
          { id: "cancelled", label: "Annulées", match: (o) => o.status === "cancelled" },
        ]}
        columns={[
          {
            id: "ref",
            header: "Référence",
            sortValue: (o) => o.reference,
            cell: (o) => (
              <Link
                href={`/commande/${o.id}`}
                className="font-medium text-stone-900 transition hover:text-amber-900"
              >
                {o.reference}
              </Link>
            ),
          },
          {
            id: "date",
            header: "Date",
            sortValue: (o) => new Date(o.createdAt).getTime(),
            cell: (o) => (
              <span className="whitespace-nowrap text-stone-600">
                {formatOrderDate(o.createdAt)}
              </span>
            ),
          },
          {
            id: "client",
            header: "Client",
            sortValue: (o) => o.customerName,
            cell: (o) => <OrderCustomerCell order={o} isAdmin={isAdmin} />,
          },
          {
            id: "total",
            header: "Montant",
            sortValue: (o) => o.total,
            cell: (o) => formatPrice(o.total),
          },
          {
            id: "status",
            header: "Statut",
            sortValue: (o) => o.status,
            cell: (o) => (
              <AdminStatusBadge label={statusLabel[o.status]} tone={statusTone(o.status)} />
            ),
          },
          {
            id: "actions",
            header: "",
            className: "w-12 text-right",
            cell: (o) => (
              <AdminRowActionsMenu
                editHref={`/commande/${o.id}`}
                statusMenuLabel="Changer le statut"
                statusLoading={statusId === o.id}
                statusOptions={NEXT_STATUSES[o.status].map((s) => ({
                  label: statusLabel[s],
                  active: false,
                  onSelect: () => handleStatusChange(o.id, s),
                }))}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

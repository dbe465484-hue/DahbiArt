"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminKpiGrid, AdminKpiSkeleton } from "@/components/admin/AdminKpi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAuth } from "@/context/AuthContext";
import { api, type OrderAlert, type OrderAlertStats, type OrderAlertStatus } from "@/lib/api";
import {
  ORDER_ALERT_STATUS_LABEL,
  orderAlertStatusTone,
} from "@/lib/order-alerts";

function formatAlertDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CommandeAlertsPageContent() {
  const { getToken } = useAuth();
  const [alerts, setAlerts] = useState<OrderAlert[]>([]);
  const [stats, setStats] = useState<OrderAlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [list, st] = await Promise.all([
        api.commande.alerts(token),
        api.commande.alertStats(token),
      ]);
      setAlerts(list);
      setStats(st);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleStatus = async (id: string, status: OrderAlertStatus) => {
    const token = getToken();
    if (!token) return;
    setUpdatingId(id);
    try {
      const updated = await api.commande.updateAlert(token, id, {
        status,
        staffNote: noteDraft[id]?.trim() || undefined,
      });
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
      const st = await api.commande.alertStats(token);
      setStats(st);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mise à jour impossible");
    } finally {
      setUpdatingId(null);
    }
  };

  const kpiItems = [
    {
      label: "Alertes ouvertes",
      value: stats?.open ?? 0,
      tone: (stats?.open ?? 0) > 0 ? ("amber" as const) : ("stone" as const),
    },
    {
      label: "En traitement",
      value: stats?.inProgress ?? 0,
      tone: "sky" as const,
    },
    {
      label: "À traiter (total)",
      value: stats?.total ?? 0,
      tone: (stats?.total ?? 0) > 0 ? ("amber" as const) : ("stone" as const),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Gestion des alertes"
        description="Signalements clients : confirmation manquante, livraison, colis endommagé, etc."
        actions={
          <Link
            href="/commande"
            className="rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50"
          >
            ← Commandes
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
          <AdminKpiSkeleton count={3} columns={4} />
        ) : (
          <AdminKpiGrid items={kpiItems} columns={4} />
        )}
      </section>

      <AdminDataTable
        rows={alerts}
        isLoading={loading}
        getRowKey={(a) => a.id}
        getSearchText={(a) =>
          `${a.orderReference} ${a.customerName} ${a.customerEmail} ${a.typeLabel} ${a.message ?? ""}`
        }
        searchPlaceholder="Référence, client, motif…"
        emptyMessage="Aucune alerte pour le moment."
        defaultSortColumn="date"
        defaultSortDir="desc"
        tabs={[
          { id: "active", label: "À traiter", match: (a) => a.status !== "resolved" },
          { id: "open", label: "Ouvertes", match: (a) => a.status === "open" },
          {
            id: "in_progress",
            label: "En cours",
            match: (a) => a.status === "in_progress",
          },
          { id: "resolved", label: "Résolues", match: (a) => a.status === "resolved" },
          { id: "all", label: "Toutes", match: () => true },
        ]}
        columns={[
          {
            id: "ref",
            header: "Commande",
            sortValue: (a) => a.orderReference,
            cell: (a) => (
              <Link
                href={`/commande/${a.orderId}`}
                className="font-medium text-stone-900 hover:text-amber-900"
              >
                {a.orderReference}
              </Link>
            ),
          },
          {
            id: "client",
            header: "Client",
            sortValue: (a) => a.customerName,
            cell: (a) => (
              <div>
                <p className="font-medium text-stone-800">{a.customerName}</p>
                <p className="text-xs text-stone-500">{a.customerEmail}</p>
              </div>
            ),
          },
          {
            id: "type",
            header: "Motif",
            sortValue: (a) => a.typeLabel,
            cell: (a) => (
              <div>
                <p className="text-sm text-stone-800">{a.typeLabel}</p>
                {a.message && (
                  <p className="mt-1 line-clamp-2 text-xs text-stone-500">{a.message}</p>
                )}
              </div>
            ),
          },
          {
            id: "date",
            header: "Date",
            sortValue: (a) => new Date(a.createdAt).getTime(),
            cell: (a) => (
              <span className="whitespace-nowrap text-sm text-stone-600">
                {formatAlertDate(a.createdAt)}
              </span>
            ),
          },
          {
            id: "status",
            header: "Statut",
            sortValue: (a) => a.status,
            cell: (a) => (
              <AdminStatusBadge
                label={ORDER_ALERT_STATUS_LABEL[a.status]}
                tone={orderAlertStatusTone(a.status)}
              />
            ),
          },
          {
            id: "actions",
            header: "Actions",
            className: "min-w-[200px]",
            cell: (a) => (
              <div className="space-y-2">
                <textarea
                  value={noteDraft[a.id] ?? a.staffNote ?? ""}
                  onChange={(e) =>
                    setNoteDraft((prev) => ({ ...prev, [a.id]: e.target.value }))
                  }
                  rows={2}
                  placeholder="Note interne…"
                  className="w-full resize-none rounded border border-stone-200 px-2 py-1 text-xs"
                />
                <div className="flex flex-wrap gap-1">
                  {a.status !== "in_progress" && a.status !== "resolved" && (
                    <button
                      type="button"
                      disabled={updatingId === a.id}
                      onClick={() => void handleStatus(a.id, "in_progress")}
                      className="rounded bg-sky-100 px-2 py-1 text-xs font-medium text-sky-900 hover:bg-sky-200 disabled:opacity-50"
                    >
                      Prendre en charge
                    </button>
                  )}
                  {a.status !== "resolved" && (
                    <button
                      type="button"
                      disabled={updatingId === a.id}
                      onClick={() => void handleStatus(a.id, "resolved")}
                      className="rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-900 hover:bg-emerald-200 disabled:opacity-50"
                    >
                      Résoudre
                    </button>
                  )}
                  {a.status === "resolved" && (
                    <button
                      type="button"
                      disabled={updatingId === a.id}
                      onClick={() => void handleStatus(a.id, "open")}
                      className="rounded bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700 hover:bg-stone-200 disabled:opacity-50"
                    >
                      Rouvrir
                    </button>
                  )}
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

import type { OrderSummary } from "@/lib/api";

const STATUS_FR: Record<OrderSummary["status"], string> = {
  pending: "En attente",
  paid: "Payée",
  shipped: "Expédiée",
  cancelled: "Annulée",
};

function escapeCsv(value: string | number | undefined) {
  const s = value == null ? "" : String(value);
  if (/[",;\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function downloadOrdersCsv(orders: OrderSummary[], filename?: string) {
  const headers = [
    "Référence",
    "Date",
    "Client",
    "Email",
    "Ville",
    "Statut",
    "Total (EUR)",
  ];
  const rows = orders.map((o) => [
    o.reference,
    new Date(o.createdAt).toLocaleString("fr-FR"),
    o.customerName,
    o.email,
    o.shippingCity ?? "",
    STATUS_FR[o.status],
    o.total.toFixed(2),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(";"))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    filename ??
    `commandes-mayn-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

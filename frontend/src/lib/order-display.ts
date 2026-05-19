import type { OrderStatus } from "@/lib/api";

export const ORDER_STATUS_SHORT: Record<OrderStatus, string> = {
  pending: "En attente",
  paid: "Payée",
  shipped: "Expédiée",
  cancelled: "Annulée",
};

export const ORDER_STATUS_CLIENT: Record<OrderStatus, string> = {
  pending: "En attente de paiement",
  paid: "En préparation",
  shipped: "Expédiée",
  cancelled: "Annulée",
};

export function orderStatusTone(status: OrderStatus) {
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
}

export function orderProgressStep(status: OrderStatus): number {
  switch (status) {
    case "pending":
      return 1;
    case "paid":
      return 2;
    case "shipped":
      return 3;
    default:
      return 0;
  }
}

export function formatOrderDate(iso: string, withTime = false) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

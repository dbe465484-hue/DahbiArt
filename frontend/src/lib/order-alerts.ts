export type OrderAlertType =
  | "no_confirmation"
  | "not_delivered"
  | "damaged"
  | "wrong_item"
  | "other";

export type OrderAlertStatus = "open" | "in_progress" | "resolved";

export const ORDER_ALERT_TYPES: {
  value: OrderAlertType;
  label: string;
}[] = [
  { value: "no_confirmation", label: "Pas de confirmation reçue" },
  { value: "not_delivered", label: "Non livrée / retard de livraison" },
  { value: "damaged", label: "Colis endommagé" },
  { value: "wrong_item", label: "Erreur sur la commande" },
  { value: "other", label: "Autre problème" },
];

export const ORDER_ALERT_STATUS_LABEL: Record<OrderAlertStatus, string> = {
  open: "Ouverte",
  in_progress: "En traitement",
  resolved: "Résolue",
};

export function orderAlertStatusTone(
  status: OrderAlertStatus,
): "warning" | "sky" | "success" | "muted" {
  switch (status) {
    case "open":
      return "warning";
    case "in_progress":
      return "sky";
    case "resolved":
      return "success";
    default:
      return "muted";
  }
}

export function canReportOrder(status: string) {
  return status === "paid" || status === "shipped";
}

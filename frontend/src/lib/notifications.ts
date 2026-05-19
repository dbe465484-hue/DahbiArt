import type { NotificationType } from "@/lib/api";

export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
  order_confirmed: "Commande confirmée",
  order_shipped: "Expédiée",
  order_cancelled: "Annulée",
  order_refunded: "Remboursée",
  alert_in_progress: "Signalement en cours",
  alert_resolved: "Signalement résolu",
  order_new: "Nouvelle commande",
  order_alert: "Alerte client",
  order_delayed: "Retard expédition",
  painting_sold: "Original vendu",
  blog_published: "Article publié",
  user_registered: "Nouveau client",
};

export function notificationTone(
  type: NotificationType,
): "amber" | "sky" | "emerald" | "stone" | "red" {
  switch (type) {
    case "order_confirmed":
    case "order_new":
      return "emerald";
    case "order_shipped":
    case "alert_in_progress":
      return "sky";
    case "order_alert":
    case "order_delayed":
      return "amber";
    case "painting_sold":
    case "blog_published":
      return "emerald";
    case "user_registered":
      return "sky";
    case "order_cancelled":
    case "order_refunded":
      return "red";
    default:
      return "stone";
  }
}

export function formatNotificationDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH} h`;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Types de notifications in-app Mayn */
export enum NotificationType {
  /** Client : paiement confirmé */
  ORDER_CONFIRMED = 'order_confirmed',
  /** Client : commande expédiée */
  ORDER_SHIPPED = 'order_shipped',
  /** Client : commande annulée */
  ORDER_CANCELLED = 'order_cancelled',
  /** Client : remboursement effectué */
  ORDER_REFUNDED = 'order_refunded',
  /** Client : signalement pris en charge */
  ALERT_IN_PROGRESS = 'alert_in_progress',
  /** Client : signalement résolu */
  ALERT_RESOLVED = 'alert_resolved',
  /** Équipe commandes / admin : nouvelle commande payée */
  ORDER_NEW = 'order_new',
  /** Équipe commandes / admin : signalement client */
  ORDER_ALERT = 'order_alert',
  /** Équipe commandes / admin : commande payée non expédiée (retard) */
  ORDER_DELAYED = 'order_delayed',
  /** Artiste / admin : original vendu */
  PAINTING_SOLD = 'painting_sold',
  /** Artiste / admin : article de blog publié */
  BLOG_PUBLISHED = 'blog_published',
  /** Admin : nouveau compte client */
  USER_REGISTERED = 'user_registered',
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationType } from '../common/enums/notification-type.enum';
import { UserRole } from '../common/enums/user-role.enum';
import { Order } from '../orders/entities/order.entity';
import { UsersService } from '../users/users.service';
import { Notification } from './entities/notification.entity';

export type NotificationDto = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, string>;
  read: boolean;
  createdAt: string;
};

const STAFF_ROLES = [UserRole.COMMANDE, UserRole.ADMIN];
const ARTISTE_ROLES = [UserRole.ARTISTE, UserRole.ADMIN];
const ADMIN_ROLES = [UserRole.ADMIN];

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
    private readonly users: UsersService,
  ) {}

  private toDto(n: Notification): NotificationDto {
    return {
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      metadata: n.metadata,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    };
  }

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, string>;
  }) {
    const row = await this.repo.save(
      this.repo.create({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        metadata: data.metadata,
        read: false,
      }),
    );
    return this.toDto(row);
  }

  async createForRoles(
    roles: UserRole[],
    data: {
      type: NotificationType;
      title: string;
      message: string;
      link?: string;
      metadata?: Record<string, string>;
    },
  ) {
    const userIds = await this.users.findIdsByRoles(roles);
    if (userIds.length === 0) return [];

    const rows = userIds.map((userId) =>
      this.repo.create({
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        metadata: data.metadata,
        read: false,
      }),
    );
    const saved = await this.repo.save(rows);
    return saved.map((n) => this.toDto(n));
  }

  async createForStaff(data: {
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, string>;
  }) {
    return this.createForRoles(STAFF_ROLES, data);
  }

  /** Évite les doublons (ex. rappel retard expédition). */
  private async existsWithMetadata(
    type: NotificationType,
    metadataKey: string,
    metadataValue: string,
    withinHours = 24,
  ) {
    const since = new Date();
    since.setHours(since.getHours() - withinHours);
    const count = await this.repo
      .createQueryBuilder('n')
      .where('n.type = :type', { type })
      .andWhere('n.createdAt >= :since', { since })
      .andWhere(
        `JSON_UNQUOTE(JSON_EXTRACT(n.metadata, :jsonPath)) = :value`,
        { jsonPath: `$.${metadataKey}`, value: metadataValue },
      )
      .getCount();
    return count > 0;
  }

  async listForUser(userId: string, limit = 40) {
    const rows = await this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return rows.map((n) => this.toDto(n));
  }

  async unreadCount(userId: string) {
    return this.repo.count({ where: { userId, read: false } });
  }

  async markRead(userId: string, id: string) {
    const row = await this.repo.findOne({ where: { id, userId } });
    if (!row) throw new NotFoundException('Notification introuvable');
    if (!row.read) await this.repo.update(id, { read: true });
    return this.toDto({ ...row, read: true });
  }

  async markAllRead(userId: string) {
    await this.repo.update({ userId, read: false }, { read: true });
    return { ok: true };
  }

  // ——— Événements métier ———

  async notifyOrderConfirmed(order: Order) {
    return this.create({
      userId: order.userId,
      type: NotificationType.ORDER_CONFIRMED,
      title: 'Commande confirmée',
      message: `Votre commande ${order.reference} a bien été enregistrée. Nous préparons votre envoi.`,
      link: `/account/orders/${order.id}`,
      metadata: { orderId: order.id, orderReference: order.reference },
    });
  }

  async notifyOrderShipped(order: Order, carrier?: string, tracking?: string) {
    const trackingPart =
      carrier && tracking
        ? ` Suivi : ${carrier} — ${tracking}.`
        : carrier
          ? ` Transporteur : ${carrier}.`
          : '';
    return this.create({
      userId: order.userId,
      type: NotificationType.ORDER_SHIPPED,
      title: 'Commande expédiée',
      message: `Votre commande ${order.reference} est en route.${trackingPart}`,
      link: `/account/orders/${order.id}`,
      metadata: { orderId: order.id, orderReference: order.reference },
    });
  }

  async notifyOrderCancelled(order: Order) {
    return this.create({
      userId: order.userId,
      type: NotificationType.ORDER_CANCELLED,
      title: 'Commande annulée',
      message: `La commande ${order.reference} a été annulée.`,
      link: `/account/orders/${order.id}`,
      metadata: { orderId: order.id, orderReference: order.reference },
    });
  }

  async notifyOrderRefunded(order: Order) {
    return this.create({
      userId: order.userId,
      type: NotificationType.ORDER_REFUNDED,
      title: 'Remboursement effectué',
      message: `Un remboursement a été traité pour la commande ${order.reference}.`,
      link: `/account/orders/${order.id}`,
      metadata: { orderId: order.id, orderReference: order.reference },
    });
  }

  async notifyAlertInProgress(
    userId: string,
    orderReference: string,
    orderId: string,
  ) {
    return this.create({
      userId,
      type: NotificationType.ALERT_IN_PROGRESS,
      title: 'Signalement pris en charge',
      message: `Notre équipe traite votre signalement concernant la commande ${orderReference}.`,
      link: `/account/orders/${orderId}`,
      metadata: { orderId, orderReference },
    });
  }

  async notifyAlertResolved(
    userId: string,
    orderReference: string,
    orderId: string,
  ) {
    return this.create({
      userId,
      type: NotificationType.ALERT_RESOLVED,
      title: 'Signalement résolu',
      message: `Votre signalement pour la commande ${orderReference} a été traité.`,
      link: `/account/orders/${orderId}`,
      metadata: { orderId, orderReference },
    });
  }

  async notifyStaffNewOrder(order: Order) {
    const name = `${order.customerFirstName} ${order.customerLastName}`.trim();
    return this.createForStaff({
      type: NotificationType.ORDER_NEW,
      title: 'Nouvelle commande',
      message: `${order.reference} — ${name || order.customerEmail} — ${Number(order.total).toFixed(2)} EUR`,
      link: `/commande/${order.id}`,
      metadata: { orderId: order.id, orderReference: order.reference },
    });
  }

  async notifyStaffOrderAlert(
    order: Order,
    typeLabel: string,
    message?: string,
    alertId?: string,
  ) {
    const extra = message?.trim() ? ` : ${message.trim()}` : '';
    return this.createForStaff({
      type: NotificationType.ORDER_ALERT,
      title: 'Nouveau signalement',
      message: `${order.reference} — ${typeLabel}${extra}`,
      link: '/commande/alertes',
      metadata: {
        orderId: order.id,
        orderReference: order.reference,
        ...(alertId ? { alertId } : {}),
      },
    });
  }

  async notifyOrderDelayedIfNeeded(order: Order) {
    const exists = await this.existsWithMetadata(
      NotificationType.ORDER_DELAYED,
      'orderId',
      order.id,
      24,
    );
    if (exists) return null;

    const paidAt = order.paidAt
      ? new Date(order.paidAt).toLocaleDateString('fr-FR')
      : '';
    return this.createForStaff({
      type: NotificationType.ORDER_DELAYED,
      title: 'Expédition en retard',
      message: `La commande ${order.reference} est payée${paidAt ? ` depuis le ${paidAt}` : ''} et n'a pas encore été expédiée.`,
      link: `/commande/${order.id}`,
      metadata: { orderId: order.id, orderReference: order.reference },
    });
  }

  async notifyPaintingSold(
    painting: { slug: string; title: string },
    orderReference: string,
  ) {
    return this.createForRoles(ARTISTE_ROLES, {
      type: NotificationType.PAINTING_SOLD,
      title: 'Original vendu',
      message: `« ${painting.title} » a été vendu (commande ${orderReference}).`,
      link: `/studio`,
      metadata: {
        paintingSlug: painting.slug,
        paintingTitle: painting.title,
        orderReference,
      },
    });
  }

  async notifyBlogPublished(post: {
    id: string;
    slug: string;
    title: string;
  }) {
    return this.createForRoles(ARTISTE_ROLES, {
      type: NotificationType.BLOG_PUBLISHED,
      title: 'Article publié',
      message: `« ${post.title} » est en ligne sur le blog.`,
      link: `/blog/${post.slug}`,
      metadata: { blogPostId: post.id, blogSlug: post.slug },
    });
  }

  async notifyUserRegistered(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  }) {
    const name = `${user.firstName} ${user.lastName}`.trim() || user.email;
    return this.createForRoles(ADMIN_ROLES, {
      type: NotificationType.USER_REGISTERED,
      title: 'Nouveau client',
      message: `${name} (${user.email}) vient de créer un compte.`,
      link: '/admin',
      metadata: { userId: user.id },
    });
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItemType } from '../common/enums/order-item-type.enum';
import { OrderStatus } from '../common/enums/order-status.enum';
import { PaintingStatus } from '../common/enums/painting-status.enum';
import { Painting } from '../paintings/entities/painting.entity';
import { User } from '../users/entities/user.entity';
import { CheckoutItemDto } from './dto/checkout-item.dto';
import { OrderEvent } from './entities/order-event.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { OrdersNotificationService } from './orders-notification.service';

export type OrderHistoryEventDto = {
  id: string;
  type: string;
  message: string;
  actorName?: string;
  createdAt: string;
};

export type OrderActor = { id: string; name: string };

export type OrderSummaryDto = {
  id: string;
  userId: string;
  reference: string;
  customerName: string;
  email: string;
  shippingCity?: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
};

export type OrderDetailDto = OrderSummaryDto & {
  email: string;
  phone?: string;
  shippingAddress?: string;
  shippingPostalCode?: string;
  shippingCity?: string;
  shippingCountry: string;
  subtotal: number;
  shippingAmount: number;
  paidAt?: string;
  shippedAt?: string;
  shippingCarrier?: string;
  shippingTrackingNumber?: string;
  internalNote?: string;
  refundedAt?: string;
  history: OrderHistoryEventDto[];
  items: {
    id: string;
    paintingSlug: string;
    paintingTitle: string;
    type: OrderItemType;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly itemsRepo: Repository<OrderItem>,
    @InjectRepository(Painting)
    private readonly paintingsRepo: Repository<Painting>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(OrderEvent)
    private readonly eventsRepo: Repository<OrderEvent>,
    private readonly config: ConfigService,
    private readonly emailNotifications: OrdersNotificationService,
    private readonly appNotifications: NotificationsService,
  ) {}

  private statusLabel(status: OrderStatus) {
    const labels: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'En attente',
      [OrderStatus.PAID]: 'Payée',
      [OrderStatus.SHIPPED]: 'Expédiée',
      [OrderStatus.CANCELLED]: 'Annulée',
    };
    return labels[status];
  }

  private async recordEvent(
    orderId: string,
    type: string,
    message: string,
    actor?: OrderActor,
  ) {
    await this.eventsRepo.save(
      this.eventsRepo.create({
        orderId,
        type,
        message,
        actorUserId: actor?.id,
        actorName: actor?.name,
      }),
    );
  }

  private async markOriginalsSold(order: Order) {
    for (const item of order.items ?? []) {
      if (item.type === OrderItemType.ORIGINAL) {
        await this.paintingsRepo.update(item.paintingId, {
          status: PaintingStatus.SOLD,
        });
        await this.appNotifications.notifyPaintingSold(
          { slug: item.paintingSlug, title: item.paintingTitle },
          order.reference,
        );
      }
    }
  }

  private async restoreOriginals(order: Order) {
    for (const item of order.items ?? []) {
      if (item.type === OrderItemType.ORIGINAL) {
        await this.paintingsRepo.update(item.paintingId, {
          status: PaintingStatus.AVAILABLE,
        });
      }
    }
  }

  private num(v: number | string) {
    return Number(v);
  }

  private toSummary(order: Order): OrderSummaryDto {
    return {
      id: order.id,
      userId: order.userId,
      reference: order.reference,
      customerName: `${order.customerFirstName} ${order.customerLastName}`.trim(),
      email: order.customerEmail,
      shippingCity: order.shippingCity,
      status: order.status,
      total: this.num(order.total),
      createdAt: order.createdAt.toISOString(),
    };
  }

  private toDetail(order: Order): OrderDetailDto {
    const events = [...(order.events ?? [])].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
    const items = (order.items ?? []).map((item) => ({
      id: item.id,
      paintingSlug: item.paintingSlug,
      paintingTitle: item.paintingTitle,
      type: item.type,
      quantity: item.quantity,
      unitPrice: this.num(item.unitPrice),
      lineTotal: this.num(item.lineTotal),
    }));
    return {
      ...this.toSummary(order),
      email: order.customerEmail,
      phone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      shippingPostalCode: order.shippingPostalCode,
      shippingCity: order.shippingCity,
      shippingCountry: order.shippingCountry,
      subtotal: this.num(order.subtotal),
      shippingAmount: this.num(order.shippingAmount),
      paidAt: order.paidAt?.toISOString(),
      shippedAt: order.shippedAt?.toISOString(),
      shippingCarrier: order.shippingCarrier,
      shippingTrackingNumber: order.shippingTrackingNumber,
      internalNote: order.internalNote,
      refundedAt: order.refundedAt?.toISOString(),
      history: events.map((e) => ({
        id: e.id,
        type: e.type,
        message: e.message,
        actorName: e.actorName,
        createdAt: e.createdAt.toISOString(),
      })),
      items,
    };
  }

  private async nextReference(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `MAYN-${year}-`;
    const last = await this.ordersRepo
      .createQueryBuilder('o')
      .where('o.reference LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('o.createdAt', 'DESC')
      .getOne();
    let seq = 1;
    if (last?.reference.startsWith(prefix)) {
      const n = parseInt(last.reference.slice(prefix.length), 10);
      if (!Number.isNaN(n)) seq = n + 1;
    }
    return `${prefix}${String(seq).padStart(5, '0')}`;
  }

  private getShippingAmount(): number {
    const raw = this.config.get<string>('SHIPPING_FLAT_EUR', '0');
    const n = parseFloat(raw);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  async createPendingOrder(
    userId: string,
    cartItems: CheckoutItemDto[],
    shipping: {
      address: string;
      postalCode?: string;
      city: string;
      country: string;
      saveToProfile?: boolean;
    },
  ) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Utilisateur introuvable');

    const address = shipping.address.trim();
    const city = shipping.city.trim();
    if (!address || !city) {
      throw new BadRequestException('Adresse et ville de livraison requises');
    }

    if (shipping.saveToProfile) {
      await this.usersRepo.update(userId, {
        address,
        postalCode: shipping.postalCode?.trim() || undefined,
        city,
        country: shipping.country.trim().toUpperCase(),
      });
    }

    const lines: {
      painting: Painting;
      type: OrderItemType;
      quantity: number;
      unitPrice: number;
    }[] = [];

    for (const line of cartItems) {
      const painting = await this.paintingsRepo.findOne({
        where: { slug: line.slug },
      });
      if (!painting) {
        throw new BadRequestException(`Œuvre introuvable : ${line.slug}`);
      }

      if (line.type === OrderItemType.ORIGINAL) {
        if (painting.status !== PaintingStatus.AVAILABLE) {
          throw new BadRequestException(
            `« ${painting.title} » n'est plus disponible à la vente`,
          );
        }
        const unitPrice = this.num(painting.price);
        if (unitPrice <= 0) {
          throw new BadRequestException(`Prix invalide pour « ${painting.title} »`);
        }
        lines.push({
          painting,
          type: OrderItemType.ORIGINAL,
          quantity: line.quantity,
          unitPrice,
        });
      } else {
        if (!painting.printAvailable) {
          throw new BadRequestException(
            `Tirage non disponible pour « ${painting.title} »`,
          );
        }
        const unitPrice = this.num(painting.printPrice ?? 0);
        if (unitPrice <= 0) {
          throw new BadRequestException(`Prix tirage invalide pour « ${painting.title} »`);
        }
        lines.push({
          painting,
          type: OrderItemType.PRINT,
          quantity: line.quantity,
          unitPrice,
        });
      }
    }

    const subtotal = lines.reduce(
      (sum, l) => sum + l.unitPrice * l.quantity,
      0,
    );
    const shippingAmount = this.getShippingAmount();
    const total = subtotal + shippingAmount;
    const reference = await this.nextReference();

    const order = this.ordersRepo.create({
      reference,
      userId,
      status: OrderStatus.PENDING,
      subtotal,
      shippingAmount,
      total,
      customerFirstName: user.firstName,
      customerLastName: user.lastName,
      customerEmail: user.email,
      customerPhone: user.phone,
      shippingAddress: address,
      shippingPostalCode: shipping.postalCode?.trim() || undefined,
      shippingCity: city,
      shippingCountry: shipping.country.trim().toUpperCase() || 'MA',
    });

    const saved = await this.ordersRepo.save(order);

    const orderItems = lines.map((l) =>
      this.itemsRepo.create({
        orderId: saved.id,
        paintingId: l.painting.id,
        paintingSlug: l.painting.slug,
        paintingTitle: l.painting.title,
        type: l.type,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        lineTotal: l.unitPrice * l.quantity,
      }),
    );
    await this.itemsRepo.save(orderItems);

    await this.recordEvent(
      saved.id,
      'created',
      'Commande créée — en attente de paiement',
    );

    return this.findById(saved.id);
  }

  async findById(id: string) {
    const order = await this.ordersRepo.findOne({
      where: { id },
      relations: ['items', 'events'],
    });
    if (!order) throw new NotFoundException('Commande introuvable');
    return order;
  }

  async findDetail(id: string) {
    const order = await this.findById(id);
    return this.toDetail(order);
  }

  async listSummaries() {
    const orders = await this.ordersRepo.find({
      order: { createdAt: 'DESC' },
    });
    return orders.map((o) => this.toSummary(o));
  }

  async listSummariesForUser(userId: string) {
    const orders = await this.ordersRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return orders.map((o) => this.toSummary(o));
  }

  async findDetailForUser(userId: string, id: string) {
    const order = await this.findById(id);
    if (order.userId !== userId) {
      throw new NotFoundException('Commande introuvable');
    }
    return this.toDetail(order);
  }

  async getStats() {
    const rows = await this.ordersRepo
      .createQueryBuilder('o')
      .select('o.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('o.status')
      .getRawMany<{ status: OrderStatus; count: string }>();

    const counts = {
      total: 0,
      pending: 0,
      paid: 0,
      shipped: 0,
      cancelled: 0,
    };

    for (const row of rows) {
      const n = parseInt(row.count, 10) || 0;
      counts.total += n;
      if (row.status === OrderStatus.PENDING) counts.pending = n;
      if (row.status === OrderStatus.PAID) counts.paid = n;
      if (row.status === OrderStatus.SHIPPED) counts.shipped = n;
      if (row.status === OrderStatus.CANCELLED) counts.cancelled = n;
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const revenueRow = await this.ordersRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total), 0)', 'sum')
      .addSelect('COUNT(*)', 'cnt')
      .where('o.paidAt IS NOT NULL')
      .andWhere('o.paidAt >= :monthStart', { monthStart })
      .andWhere('o.status IN (:...statuses)', {
        statuses: [OrderStatus.PAID, OrderStatus.SHIPPED],
      })
      .getRawOne<{ sum: string; cnt: string }>();

    const revenueMonth = parseFloat(revenueRow?.sum ?? '0') || 0;
    const paidThisMonth = parseInt(revenueRow?.cnt ?? '0', 10) || 0;
    const averageOrder =
      paidThisMonth > 0 ? Math.round((revenueMonth / paidThisMonth) * 100) / 100 : 0;

    const delayDays = parseInt(
      this.config.get<string>('SHIPPING_DELAY_DAYS', '3'),
      10,
    );
    const delayDate = new Date(now);
    delayDate.setDate(delayDate.getDate() - delayDays);

    const delayedOrders = await this.ordersRepo
      .createQueryBuilder('o')
      .where('o.status = :paid', { paid: OrderStatus.PAID })
      .andWhere('o.paidAt IS NOT NULL')
      .andWhere('o.paidAt < :delayDate', { delayDate })
      .getCount();

    return {
      total: counts.total,
      pending: counts.pending,
      paid: counts.paid,
      shipped: counts.shipped,
      cancelled: counts.cancelled,
      revenueMonth,
      averageOrder,
      delayedOrders,
    };
  }

  async setStripeSession(orderId: string, sessionId: string) {
    await this.ordersRepo.update(orderId, { stripeSessionId: sessionId });
  }

  private async finalizePaid(order: Order, source: 'stripe' | 'dev' | 'manual') {
    await this.markOriginalsSold(order);
    const paidAt = new Date();
    const sourceLabel =
      source === 'stripe'
        ? 'Stripe'
        : source === 'dev'
          ? 'mode développement'
          : 'manuel';
    await this.recordEvent(
      order.id,
      'paid',
      `Payée le ${paidAt.toLocaleString('fr-FR')} (${sourceLabel})`,
    );
    const full = await this.findById(order.id);
    await this.emailNotifications.notifyOrderPaid(full);
    await this.appNotifications.notifyOrderConfirmed(full);
    await this.appNotifications.notifyStaffNewOrder(full);
  }

  async markPaidBySessionId(sessionId: string, paymentIntentId?: string) {
    const order = await this.ordersRepo.findOne({
      where: { stripeSessionId: sessionId },
      relations: ['items'],
    });
    if (!order) return null;
    if (order.status === OrderStatus.PAID) return order;

    const paidAt = new Date();
    await this.ordersRepo.update(order.id, {
      status: OrderStatus.PAID,
      paidAt,
      ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
    });

    await this.finalizePaid(order, 'stripe');
    return this.findById(order.id);
  }

  async markPaidDev(orderId: string, userId: string) {
    const order = await this.findById(orderId);
    if (order.userId !== userId) {
      throw new BadRequestException('Commande introuvable');
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Cette commande n\'est plus en attente de paiement');
    }

    await this.ordersRepo.update(order.id, {
      status: OrderStatus.PAID,
      paidAt: new Date(),
    });

    await this.finalizePaid(order, 'dev');
    return this.findById(order.id);
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    options?: {
      shippingCarrier?: string;
      shippingTrackingNumber?: string;
      actor?: OrderActor;
    },
  ) {
    const order = await this.findById(id);
    const allowed: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.CANCELLED],
      [OrderStatus.CANCELLED]: [],
    };

    if (!allowed[order.status].includes(status)) {
      throw new BadRequestException(
        `Transition impossible : ${order.status} → ${status}`,
      );
    }

    if (status === OrderStatus.SHIPPED) {
      if (!options?.shippingCarrier?.trim()) {
        throw new BadRequestException(
          'Le transporteur est requis pour marquer une commande expédiée',
        );
      }
    }

    const patch: Partial<Order> = { status };
    const wasPending = order.status === OrderStatus.PENDING;

    if (status === OrderStatus.PAID && !order.paidAt) {
      patch.paidAt = new Date();
    }

    if (status === OrderStatus.SHIPPED) {
      patch.shippedAt = new Date();
      patch.shippingCarrier = options?.shippingCarrier?.trim();
      patch.shippingTrackingNumber =
        options?.shippingTrackingNumber?.trim() || undefined;
    }

    await this.ordersRepo.update(id, patch);

    if (status === OrderStatus.PAID && wasPending) {
      await this.finalizePaid(order, 'manual');
    } else if (status === OrderStatus.CANCELLED) {
      if (
        order.status === OrderStatus.PAID ||
        order.status === OrderStatus.PENDING
      ) {
        await this.restoreOriginals(order);
      }
      const actorPart = options?.actor?.name
        ? ` par ${options.actor.name}`
        : '';
      await this.recordEvent(
        id,
        'cancelled',
        `Annulée${actorPart}`,
        options?.actor,
      );
      await this.appNotifications.notifyOrderCancelled(order);
    } else if (status === OrderStatus.SHIPPED) {
      const actorPart = options?.actor?.name
        ? `Expédiée par ${options.actor.name}`
        : 'Expédiée';
      const tracking = options?.shippingTrackingNumber?.trim();
      const carrier = options?.shippingCarrier?.trim();
      const msg = tracking
        ? `${actorPart} — ${carrier} / ${tracking}`
        : `${actorPart} — ${carrier}`;
      await this.recordEvent(id, 'shipped', msg, options?.actor);
      await this.appNotifications.notifyOrderShipped(
        order,
        options?.shippingCarrier?.trim(),
        options?.shippingTrackingNumber?.trim(),
      );
    } else {
      const actorPart = options?.actor?.name
        ? ` par ${options.actor.name}`
        : '';
      await this.recordEvent(
        id,
        'status',
        `Statut : ${this.statusLabel(status)}${actorPart}`,
        options?.actor,
      );
    }

    return this.findDetail(id);
  }

  async updateInternalNote(
    id: string,
    internalNote: string | undefined,
    actor?: OrderActor,
  ) {
    await this.findById(id);
    await this.ordersRepo.update(id, {
      internalNote: internalNote?.trim() || undefined,
    });
    await this.recordEvent(
      id,
      'note',
      internalNote?.trim()
        ? 'Note interne mise à jour'
        : 'Note interne supprimée',
      actor,
    );
    return this.findDetail(id);
  }

  async applyRefund(id: string, actor?: OrderActor) {
    const order = await this.findById(id);
    if (order.refundedAt) {
      throw new BadRequestException('Cette commande a déjà été remboursée');
    }

    await this.ordersRepo.update(id, {
      status: OrderStatus.CANCELLED,
      refundedAt: new Date(),
    });
    await this.restoreOriginals(order);
    const actorPart = actor?.name ? ` par ${actor.name}` : '';
    await this.recordEvent(
      id,
      'refunded',
      `Remboursée et annulée${actorPart}`,
      actor,
    );
    await this.appNotifications.notifyOrderRefunded(order);
    return this.findDetail(id);
  }

  async bulkUpdateStatus(
    ids: string[],
    status: OrderStatus,
    actor?: OrderActor,
  ) {
    const updated: OrderSummaryDto[] = [];
    const errors: { id: string; message: string }[] = [];

    for (const id of ids) {
      try {
        if (status === OrderStatus.SHIPPED) {
          errors.push({
            id,
            message:
              'Utilisez la fiche commande pour renseigner le transporteur et le n° de suivi',
          });
          continue;
        }
        await this.updateStatus(id, status, { actor });
        const order = await this.findById(id);
        updated.push(this.toSummary(order));
      } catch (err) {
        errors.push({
          id,
          message: err instanceof Error ? err.message : 'Erreur',
        });
      }
    }

    return { updated, errors };
  }
}

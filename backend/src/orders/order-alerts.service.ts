import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderAlertStatus } from '../common/enums/order-alert-status.enum';
import { OrderAlertType } from '../common/enums/order-alert-type.enum';
import { OrderStatus } from '../common/enums/order-status.enum';
import { CreateOrderAlertDto } from './dto/create-order-alert.dto';
import { UpdateOrderAlertDto } from './dto/update-order-alert.dto';
import { OrderAlert } from './entities/order-alert.entity';
import { OrderEvent } from './entities/order-event.entity';
import { Order } from './entities/order.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { OrdersNotificationService } from './orders-notification.service';
import type { OrderActor } from './orders.service';

const TYPE_LABELS: Record<OrderAlertType, string> = {
  [OrderAlertType.NO_CONFIRMATION]: 'Pas de confirmation reçue',
  [OrderAlertType.NOT_DELIVERED]: 'Non livrée / retard',
  [OrderAlertType.DAMAGED]: 'Colis endommagé',
  [OrderAlertType.WRONG_ITEM]: 'Erreur sur la commande',
  [OrderAlertType.OTHER]: 'Autre problème',
};

export type OrderAlertDto = {
  id: string;
  orderId: string;
  orderReference: string;
  customerName: string;
  customerEmail: string;
  type: OrderAlertType;
  typeLabel: string;
  message?: string;
  status: OrderAlertStatus;
  staffNote?: string;
  createdAt: string;
  resolvedAt?: string;
};

@Injectable()
export class OrderAlertsService {
  constructor(
    @InjectRepository(OrderAlert)
    private readonly alertsRepo: Repository<OrderAlert>,
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
    @InjectRepository(OrderEvent)
    private readonly eventsRepo: Repository<OrderEvent>,
    private readonly emailNotifications: OrdersNotificationService,
    private readonly appNotifications: NotificationsService,
  ) {}

  private toDto(alert: OrderAlert): OrderAlertDto {
    const order = alert.order;
    const user = alert.user;
    return {
      id: alert.id,
      orderId: alert.orderId,
      orderReference: order?.reference ?? '',
      customerName: user
        ? `${user.firstName} ${user.lastName}`.trim()
        : '',
      customerEmail: user?.email ?? '',
      type: alert.type,
      typeLabel: TYPE_LABELS[alert.type],
      message: alert.message,
      status: alert.status,
      staffNote: alert.staffNote,
      createdAt: alert.createdAt.toISOString(),
      resolvedAt: alert.resolvedAt?.toISOString(),
    };
  }

  async createForCustomer(userId: string, orderId: string, dto: CreateOrderAlertDto) {
    const order = await this.ordersRepo.findOne({
      where: { id: orderId, userId },
    });
    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(
        'Impossible de signaler une commande annulée',
      );
    }

    if (order.status === OrderStatus.PENDING) {
      throw new BadRequestException(
        'Cette commande est encore en attente de paiement',
      );
    }

    const existing = await this.alertsRepo.findOne({
      where: {
        orderId,
        userId,
        type: dto.type,
        status: OrderAlertStatus.OPEN,
      },
    });
    if (existing) {
      throw new BadRequestException(
        'Un signalement similaire est déjà en cours de traitement',
      );
    }

    const alert = await this.alertsRepo.save(
      this.alertsRepo.create({
        orderId,
        userId,
        type: dto.type,
        message: dto.message?.trim() || undefined,
        status: OrderAlertStatus.OPEN,
      }),
    );

    const typeLabel = TYPE_LABELS[dto.type];
    const msg = dto.message?.trim()
      ? `${typeLabel} — ${dto.message.trim()}`
      : typeLabel;

    await this.eventsRepo.save(
      this.eventsRepo.create({
        orderId,
        type: 'alert',
        message: `Signalement client : ${msg}`,
      }),
    );

    await this.emailNotifications.notifyOrderAlert(order, typeLabel, dto.message);
    await this.appNotifications.notifyStaffOrderAlert(
      order,
      typeLabel,
      dto.message,
      alert.id,
    );

    return this.findById(alert.id);
  }

  async findById(id: string) {
    const alert = await this.alertsRepo.findOne({
      where: { id },
      relations: ['order', 'user'],
    });
    if (!alert) throw new NotFoundException('Alerte introuvable');
    return this.toDto(alert);
  }

  async listForCommande(status?: OrderAlertStatus) {
    const qb = this.alertsRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.order', 'order')
      .leftJoinAndSelect('a.user', 'user')
      .orderBy('a.createdAt', 'DESC');

    if (status) {
      qb.andWhere('a.status = :status', { status });
    }

    const rows = await qb.getMany();
    return rows.map((a) => this.toDto(a));
  }

  async getStats() {
    const open = await this.alertsRepo.count({
      where: { status: OrderAlertStatus.OPEN },
    });
    const inProgress = await this.alertsRepo.count({
      where: { status: OrderAlertStatus.IN_PROGRESS },
    });
    return { open, inProgress, total: open + inProgress };
  }

  async updateStatus(id: string, dto: UpdateOrderAlertDto, actor?: OrderActor) {
    const alert = await this.alertsRepo.findOne({
      where: { id },
      relations: ['order', 'user'],
    });
    if (!alert) throw new NotFoundException('Alerte introuvable');

    const prevStatus = alert.status;
    const orderRef = alert.order?.reference ?? '';

    const patch: Partial<OrderAlert> = {
      status: dto.status,
      staffNote: dto.staffNote?.trim() || alert.staffNote,
    };

    if (
      dto.status === OrderAlertStatus.RESOLVED &&
      alert.status !== OrderAlertStatus.RESOLVED
    ) {
      patch.resolvedAt = new Date();
    }

    if (dto.status !== OrderAlertStatus.RESOLVED) {
      patch.resolvedAt = undefined;
    }

    await this.alertsRepo.update(id, patch);

    const statusLabel =
      dto.status === OrderAlertStatus.OPEN
        ? 'Ouverte'
        : dto.status === OrderAlertStatus.IN_PROGRESS
          ? 'En traitement'
          : 'Résolue';
    const actorPart = actor?.name ? ` par ${actor.name}` : '';
    await this.eventsRepo.save(
      this.eventsRepo.create({
        orderId: alert.orderId,
        type: 'alert_update',
        message: `Alerte ${statusLabel}${actorPart}`,
        actorUserId: actor?.id,
        actorName: actor?.name,
      }),
    );

    if (
      dto.status === OrderAlertStatus.IN_PROGRESS &&
      prevStatus === OrderAlertStatus.OPEN &&
      orderRef
    ) {
      await this.appNotifications.notifyAlertInProgress(
        alert.userId,
        orderRef,
        alert.orderId,
      );
    }

    if (
      dto.status === OrderAlertStatus.RESOLVED &&
      prevStatus !== OrderAlertStatus.RESOLVED &&
      orderRef
    ) {
      await this.appNotifications.notifyAlertResolved(
        alert.userId,
        orderRef,
        alert.orderId,
      );
    }

    return this.findById(id);
  }
}

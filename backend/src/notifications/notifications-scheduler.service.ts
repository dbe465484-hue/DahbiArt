import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatus } from '../common/enums/order-status.enum';
import { Order } from '../orders/entities/order.entity';
import { NotificationsService } from './notifications.service';

/** Vérifie les commandes en retard d'expédition (cron interne). */
@Injectable()
export class NotificationsSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsSchedulerService.name);

  constructor(
    private readonly notifications: NotificationsService,
    private readonly config: ConfigService,
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
  ) {}

  onModuleInit() {
    const run = () => void this.checkDelayedOrders();
    setTimeout(run, 60_000);
    setInterval(run, 6 * 60 * 60 * 1000);
    this.logger.log(
      'Planificateur notifications : contrôle retards expédition toutes les 6 h',
    );
  }

  async checkDelayedOrders() {
    const delayDays = parseInt(
      this.config.get<string>('SHIPPING_DELAY_DAYS', '3'),
      10,
    );
    const delayDate = new Date();
    delayDate.setDate(delayDate.getDate() - delayDays);

    const orders = await this.ordersRepo
      .createQueryBuilder('o')
      .where('o.status = :paid', { paid: OrderStatus.PAID })
      .andWhere('o.paidAt IS NOT NULL')
      .andWhere('o.paidAt < :delayDate', { delayDate })
      .getMany();

    for (const order of orders) {
      try {
        await this.notifications.notifyOrderDelayedIfNeeded(order);
      } catch (err) {
        this.logger.warn(
          `Rappel retard ignoré pour ${order.reference}`,
          err,
        );
      }
    }

    if (orders.length > 0) {
      this.logger.log(
        `Retards expédition : ${orders.length} commande(s) vérifiée(s)`,
      );
    }
  }
}

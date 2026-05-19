import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrderStatus } from '../common/enums/order-status.enum';
import { OrdersService } from './orders.service';

@Injectable()
export class OrdersRefundService {
  private stripe: InstanceType<typeof Stripe> | null = null;

  constructor(
    private readonly orders: OrdersService,
    private readonly config: ConfigService,
  ) {
    const secret = this.config.get<string>('STRIPE_SECRET_KEY')?.trim();
    if (secret) {
      this.stripe = new Stripe(secret, { apiVersion: '2026-04-22.dahlia' });
    }
  }

  async refundOrder(
    orderId: string,
    actor?: { id: string; name: string },
  ) {
    const order = await this.orders.findById(orderId);

    if (order.status !== OrderStatus.PAID && order.status !== OrderStatus.SHIPPED) {
      throw new BadRequestException(
        'Seules les commandes payées ou expédiées peuvent être remboursées',
      );
    }

    if (order.refundedAt) {
      throw new BadRequestException('Cette commande a déjà été remboursée');
    }

    if (this.stripe && order.stripePaymentIntentId) {
      await this.stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
      });
    } else if (this.config.get<string>('CHECKOUT_DEV_MODE') !== 'true') {
      throw new BadRequestException(
        'Remboursement Stripe impossible (paiement dev ou intent manquant)',
      );
    }

    return this.orders.applyRefund(orderId, actor);
  }
}

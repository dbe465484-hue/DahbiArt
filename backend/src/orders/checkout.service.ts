import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CheckoutItemDto } from './dto/checkout-item.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { OrdersService } from './orders.service';

@Injectable()
export class CheckoutService {
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

  isStripeEnabled() {
    return !!this.stripe;
  }

  isDevCheckoutAllowed() {
    return (
      this.config.get<string>('CHECKOUT_DEV_MODE') === 'true' ||
      !this.isStripeEnabled()
    );
  }

  async createSession(userId: string, dto: CreateCheckoutDto) {
    const order = await this.orders.createPendingOrder(
      userId,
      dto.items,
      dto.shipping,
    );
    const frontend = this.config
      .get<string>('FRONTEND_URL', 'http://localhost:3000')
      .split(',')[0]
      .trim();

    if (!this.stripe) {
      if (!this.isDevCheckoutAllowed()) {
        throw new BadRequestException(
          'Paiement non configuré (STRIPE_SECRET_KEY manquant)',
        );
      }
      return {
        orderId: order.id,
        reference: order.reference,
        devMode: true as const,
        url: `${frontend}/checkout/success?orderId=${order.id}&dev=1`,
      };
    }

    const lineItems = order.items.map((item) => ({
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(Number(item.unitPrice) * 100),
          product_data: {
            name: item.paintingTitle,
            description:
              item.type === 'original'
                ? 'Original — huile sur toile'
                : 'Tirage sur toile',
          },
        },
        quantity: item.quantity,
      }));

    const shipping = Number(order.shippingAmount);
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(shipping * 100),
          product_data: { name: 'Livraison', description: 'Frais de port' },
        },
        quantity: 1,
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${frontend}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontend}/checkout/cancel?orderId=${order.id}`,
      customer_email: order.customerEmail,
      metadata: {
        orderId: order.id,
        reference: order.reference,
      },
    });

    if (!session.url) {
      throw new BadRequestException('Impossible de créer la session Stripe');
    }

    await this.orders.setStripeSession(order.id, session.id);

    return {
      orderId: order.id,
      reference: order.reference,
      devMode: false as const,
      url: session.url,
      sessionId: session.id,
    };
  }

  async confirmDevPayment(orderId: string, userId: string) {
    if (!this.isDevCheckoutAllowed()) {
      throw new BadRequestException('Mode développement désactivé');
    }
    const order = await this.orders.markPaidDev(orderId, userId);
    return {
      orderId: order.id,
      reference: order.reference,
      status: order.status,
    };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    if (!this.stripe) return { received: true };

    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET')?.trim();
    if (!secret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET manquant');
    }

    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      secret,
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as {
        payment_status?: string;
        id?: string;
        payment_intent?: string | { id?: string };
      };
      if (session.payment_status === 'paid' && session.id) {
        await this.orders.markPaidBySessionId(
          session.id,
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id,
        );
      }
    }

    return { received: true };
  }
}

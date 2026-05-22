import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Order } from './entities/order.entity';
import { shippingLabel, resolveShippingZone } from './shipping-pricing';

@Injectable()
export class OrdersNotificationService {
  private readonly logger = new Logger(OrdersNotificationService.name);

  constructor(private readonly config: ConfigService) {}

  private frontendUrl() {
    return this.config
      .get<string>('FRONTEND_URL', 'http://localhost:3000')
      .split(',')[0]
      .trim();
  }

  private async sendMail(opts: {
    to: string | string[];
    subject: string;
    text: string;
    html?: string;
  }) {
    const recipients = (Array.isArray(opts.to) ? opts.to : [opts.to]).filter(
      Boolean,
    );
    if (recipients.length === 0) return false;

    const host = this.config.get<string>('SMTP_HOST')?.trim();
    if (!host) {
      this.logger.warn(`SMTP non configuré — email non envoyé: ${opts.subject}`);
      this.logger.log(opts.text);
      return false;
    }

    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('SMTP_PORT', 587),
        secure: this.config.get<string>('SMTP_SECURE') === 'true',
        auth: {
          user: this.config.get<string>('SMTP_USER'),
          pass: this.config.get<string>('SMTP_PASS'),
        },
      });

      await transporter.sendMail({
        from: this.config.get<string>(
          'SMTP_FROM',
          'Dahbi Art <noreply@dahbi-art.vercel.app>',
        ),
        to: recipients.join(','),
        subject: opts.subject,
        text: opts.text,
        html: opts.html ?? opts.text.replace(/\n/g, '<br>'),
      });
      return true;
    } catch (err) {
      this.logger.error(`Échec envoi email: ${opts.subject}`, err);
      return false;
    }
  }

  private staffRecipients(): string[] {
    return this.config
      .get<string>('COMMANDE_NOTIFY_EMAILS', '')
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
  }

  async notifyOrderPaid(order: Order) {
    const recipients = this.staffRecipients();
    const subject = `[Dahbi Art] Nouvelle commande payée — ${order.reference}`;
    const body = [
      `Commande : ${order.reference}`,
      `Client : ${order.customerFirstName} ${order.customerLastName}`,
      `Email : ${order.customerEmail}`,
      `Montant : ${Number(order.total).toFixed(2)} EUR`,
      `Livraison : ${order.shippingCity}, ${order.shippingCountry}`,
      ``,
      `Espace commandes : ${this.frontendUrl()}/commande`,
    ].join('\n');

    if (recipients.length === 0) {
      this.logger.log(`Notification staff (non envoyée): ${subject}`);
      return;
    }
    await this.sendMail({ to: recipients, subject, text: body });
  }

  async notifyCustomerOrderConfirmed(order: Order) {
    const email = order.customerEmail?.trim();
    if (!email) return;

    const items =
      order.items
        ?.map(
          (i) =>
            `• ${i.paintingTitle} (${i.type === 'original' ? 'Original' : 'Tirage'}) — ${Number(i.lineTotal).toFixed(2)} €`,
        )
        .join('\n') ?? '';

    const zone = resolveShippingZone(order.shippingCountry);
    const subject = `Confirmation de commande ${order.reference} — Dahbi Art`;
    const text = [
      `Bonjour ${order.customerFirstName},`,
      ``,
      `Merci pour votre commande. Votre paiement a bien été enregistré.`,
      ``,
      `Référence : ${order.reference}`,
      `Montant total : ${Number(order.total).toFixed(2)} €`,
      ``,
      `Œuvres :`,
      items,
      ``,
      `Livraison (${shippingLabel(zone)}) :`,
      `${order.shippingAddress}`,
      `${order.shippingPostalCode ? order.shippingPostalCode + ' ' : ''}${order.shippingCity}`,
      `${order.shippingCountry}`,
      `Délai indicatif : ${zone === 'MA' ? '5–10 jours ouvrés' : zone === 'EU' ? '10–20 jours ouvrés' : '15–30 jours ouvrés'}`,
      `Emballage professionnel et assurance transport inclus.`,
      ``,
      `Suivre votre commande : ${this.frontendUrl()}/account/orders/${order.id}`,
      ``,
      `Dahbi Machrouhi — Dahbi Art`,
    ].join('\n');

    await this.sendMail({
      to: email,
      subject,
      text,
      html: `<div style="font-family:Georgia,serif;max-width:560px;color:#1c1917">
        <p>Bonjour <strong>${order.customerFirstName}</strong>,</p>
        <p>Merci pour votre commande. Votre paiement a bien été enregistré.</p>
        <p><strong>Référence :</strong> ${order.reference}<br>
        <strong>Total :</strong> ${Number(order.total).toFixed(2)} €</p>
        <pre style="background:#faf7f2;padding:12px;font-size:13px">${items}</pre>
        <p><strong>Livraison (${shippingLabel(zone)})</strong><br>
        ${order.shippingAddress}<br>
        ${order.shippingPostalCode ?? ''} ${order.shippingCity}<br>
        ${order.shippingCountry}</p>
        <p><a href="${this.frontendUrl()}/account/orders/${order.id}">Suivre ma commande</a></p>
      </div>`,
    });
  }

  async notifyCustomerOrderShipped(
    order: Order,
    carrier?: string,
    tracking?: string,
  ) {
    const email = order.customerEmail?.trim();
    if (!email) return;

    const subject = `Votre commande ${order.reference} est expédiée — Dahbi Art`;
    const trackingLine =
      carrier && tracking
        ? `Transporteur : ${carrier}\nSuivi : ${tracking}`
        : carrier
          ? `Transporteur : ${carrier}`
          : '';

    const text = [
      `Bonjour ${order.customerFirstName},`,
      ``,
      `Bonne nouvelle : votre commande ${order.reference} a été expédiée.`,
      trackingLine,
      ``,
      `Suivre votre commande : ${this.frontendUrl()}/account/orders/${order.id}`,
      ``,
      `Dahbi Machrouhi — Dahbi Art`,
    ]
      .filter(Boolean)
      .join('\n');

    await this.sendMail({ to: email, subject, text });
  }

  async notifyOrderAlert(order: Order, typeLabel: string, message?: string) {
    const recipients = this.staffRecipients();
    const subject = `[Dahbi Art] Signalement client — ${order.reference}`;
    const body = [
      `Commande : ${order.reference}`,
      `Motif : ${typeLabel}`,
      message?.trim() ? `Message : ${message.trim()}` : '',
      `Client : ${order.customerFirstName} ${order.customerLastName}`,
      `Email : ${order.customerEmail}`,
    ]
      .filter(Boolean)
      .join('\n');

    if (recipients.length === 0) {
      this.logger.log(`Alerte staff (non envoyée): ${subject}`);
      return;
    }
    await this.sendMail({ to: recipients, subject, text: body });
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersNotificationService {
  private readonly logger = new Logger(OrdersNotificationService.name);

  constructor(private readonly config: ConfigService) {}

  async notifyOrderPaid(order: Order) {
    const recipients = this.config
      .get<string>('COMMANDE_NOTIFY_EMAILS', '')
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    const subject = `[Mayn] Nouvelle commande payée — ${order.reference}`;
    const body = [
      `Commande : ${order.reference}`,
      `Client : ${order.customerFirstName} ${order.customerLastName}`,
      `Email : ${order.customerEmail}`,
      `Montant : ${Number(order.total).toFixed(2)} EUR`,
      ``,
      `Voir dans l'espace commandes.`,
    ].join('\n');

    if (recipients.length === 0) {
      this.logger.log(`Notification (non envoyée, COMMANDE_NOTIFY_EMAILS vide): ${subject}`);
      return;
    }

    const host = this.config.get<string>('SMTP_HOST')?.trim();
    if (!host) {
      this.logger.warn(
        `SMTP non configuré — notification loguée uniquement: ${subject}`,
      );
      this.logger.log(body);
      return;
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
        from: this.config.get<string>('SMTP_FROM', 'noreply@mayn.art'),
        to: recipients.join(','),
        subject,
        text: body,
      });
      this.logger.log(`Notification envoyée à ${recipients.join(', ')}`);
    } catch (err) {
      this.logger.error('Échec envoi email notification', err);
    }
  }

  async notifyOrderAlert(order: Order, typeLabel: string, message?: string) {
    const recipients = this.config
      .get<string>('COMMANDE_NOTIFY_EMAILS', '')
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    const subject = `[Mayn] Signalement client — ${order.reference}`;
    const body = [
      `Commande : ${order.reference}`,
      `Motif : ${typeLabel}`,
      message?.trim() ? `Message : ${message.trim()}` : '',
      `Client : ${order.customerFirstName} ${order.customerLastName}`,
      `Email : ${order.customerEmail}`,
      ``,
      `Traiter dans Gestion alertes.`,
    ]
      .filter(Boolean)
      .join('\n');

    if (recipients.length === 0) {
      this.logger.log(`Alerte (non envoyée, COMMANDE_NOTIFY_EMAILS vide): ${subject}`);
      return;
    }

    const host = this.config.get<string>('SMTP_HOST')?.trim();
    if (!host) {
      this.logger.warn(`SMTP non configuré — alerte loguée: ${subject}`);
      this.logger.log(body);
      return;
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
        from: this.config.get<string>('SMTP_FROM', 'noreply@mayn.art'),
        to: recipients.join(','),
        subject,
        text: body,
      });
      this.logger.log(`Alerte envoyée à ${recipients.join(', ')}`);
    } catch (err) {
      this.logger.error('Échec envoi email alerte', err);
    }
  }
}

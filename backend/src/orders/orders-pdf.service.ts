import { Injectable, NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { OrderItemType } from '../common/enums/order-item-type.enum';
import { OrdersService } from './orders.service';

const COUNTRY: Record<string, string> = {
  MA: 'Maroc',
  FR: 'France',
  BE: 'Belgique',
  CH: 'Suisse',
  ES: 'Espagne',
  US: 'États-Unis',
};

@Injectable()
export class OrdersPdfService {
  constructor(private readonly orders: OrdersService) {}

  private typeLabel(type: OrderItemType) {
    return type === OrderItemType.ORIGINAL ? 'Original' : 'Tirage sur toile';
  }

  private async buildPdf(
    title: string,
    orderId: string,
    render: (
      doc: InstanceType<typeof PDFDocument>,
      order: Awaited<ReturnType<OrdersService['findDetail']>>,
    ) => void,
  ): Promise<Buffer> {
    const order = await this.orders.findDetail(orderId);
    if (!order) throw new NotFoundException('Commande introuvable');

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (c) => chunks.push(c as Buffer));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(18).text(title, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#666').text(order.reference, { align: 'center' });
      doc.fillColor('#000');
      doc.moveDown();

      render(doc, order);

      doc.end();
    });
  }

  invoice(orderId: string) {
    return this.buildPdf('FACTURE', orderId, (doc, order) => {
      doc.fontSize(11).text(`Date : ${new Date(order.createdAt).toLocaleDateString('fr-FR')}`);
      doc.text(`Client : ${order.customerName}`);
      doc.text(`Email : ${order.email}`);
      doc.moveDown();

      doc.text('Adresse de livraison :');
      if (order.shippingAddress) doc.text(order.shippingAddress);
      const cityLine = [order.shippingPostalCode, order.shippingCity]
        .filter(Boolean)
        .join(' ');
      if (cityLine) doc.text(cityLine);
      doc.text(COUNTRY[order.shippingCountry] ?? order.shippingCountry);
      doc.moveDown();

      doc.fontSize(12).text('Détail', { underline: true });
      doc.moveDown(0.5);
      for (const item of order.items) {
        doc.fontSize(10).text(
          `${item.paintingTitle} — ${this.typeLabel(item.type)} ×${item.quantity} — ${item.lineTotal.toFixed(2)} EUR`,
        );
      }
      doc.moveDown();
      doc.text(`Sous-total : ${order.subtotal.toFixed(2)} EUR`);
      doc.text(`Livraison : ${order.shippingAmount.toFixed(2)} EUR`);
      doc.fontSize(12).text(`Total TTC : ${order.total.toFixed(2)} EUR`, { continued: false });
    });
  }

  preparationSlip(orderId: string) {
    return this.buildPdf('BON DE PRÉPARATION', orderId, (doc, order) => {
      doc.fontSize(11).text(`Client : ${order.customerName}`);
      doc.text(`Tél. : ${order.phone ?? '—'}`);
      doc.moveDown();
      doc.text('Expédition :');
      if (order.shippingAddress) doc.text(order.shippingAddress);
      const cityLine = [order.shippingPostalCode, order.shippingCity]
        .filter(Boolean)
        .join(' ');
      if (cityLine) doc.text(cityLine);
      doc.text(COUNTRY[order.shippingCountry] ?? order.shippingCountry);
      doc.moveDown();

      if (order.shippingCarrier || order.shippingTrackingNumber) {
        doc.text(
          `Transporteur : ${order.shippingCarrier ?? '—'} — Suivi : ${order.shippingTrackingNumber ?? '—'}`,
        );
        doc.moveDown();
      }

      doc.fontSize(12).text('Articles à préparer', { underline: true });
      doc.moveDown(0.5);
      for (const item of order.items) {
        doc
          .fontSize(11)
          .text(
            `☐ ${item.paintingTitle} (${item.paintingSlug}) — ${this.typeLabel(item.type)} — qté ${item.quantity}`,
          );
      }

      if (order.internalNote) {
        doc.moveDown();
        doc.fontSize(10).fillColor('#444').text(`Note interne : ${order.internalNote}`);
      }
    });
  }
}

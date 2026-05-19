import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/enums/user-role.enum';
import { OrderAlertStatus } from '../common/enums/order-alert-status.enum';
import { BulkUpdateOrderStatusDto } from '../orders/dto/bulk-update-order-status.dto';
import { UpdateOrderAlertDto } from '../orders/dto/update-order-alert.dto';
import { OrderAlertsService } from '../orders/order-alerts.service';
import { UpdateOrderInternalNoteDto } from '../orders/dto/update-order-internal-note.dto';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';
import { OrdersPdfService } from '../orders/orders-pdf.service';
import { OrdersRefundService } from '../orders/orders-refund.service';
import { OrdersService, type OrderActor } from '../orders/orders.service';

type CommandeUser = {
  id: string;
  firstName: string;
  lastName: string;
};

function toActor(user: CommandeUser): OrderActor {
  const name = `${user.firstName} ${user.lastName}`.trim();
  return { id: user.id, name: name || 'Équipe commandes' };
}

@Controller('commande')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COMMANDE, UserRole.ADMIN)
export class CommandeController {
  constructor(
    private readonly orders: OrdersService,
    private readonly refunds: OrdersRefundService,
    private readonly pdf: OrdersPdfService,
    private readonly alerts: OrderAlertsService,
  ) {}

  @Get('alerts/stats')
  alertStats() {
    return this.alerts.getStats();
  }

  @Get('alerts')
  listAlerts(@Query('status') status?: OrderAlertStatus) {
    return this.alerts.listForCommande(status);
  }

  @Patch('alerts/:id')
  updateAlert(
    @Param('id') id: string,
    @Body() dto: UpdateOrderAlertDto,
    @CurrentUser() user: CommandeUser,
  ) {
    return this.alerts.updateStatus(id, dto, toActor(user));
  }

  @Get('orders')
  listOrders() {
    return this.orders.listSummaries();
  }

  @Get('orders/:id')
  getOrder(@Param('id') id: string) {
    return this.orders.findDetail(id);
  }

  @Patch('orders/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: CommandeUser,
  ) {
    return this.orders.updateStatus(id, dto.status, {
      shippingCarrier: dto.shippingCarrier,
      shippingTrackingNumber: dto.shippingTrackingNumber,
      actor: toActor(user),
    });
  }

  @Patch('orders/:id/internal-note')
  updateInternalNote(
    @Param('id') id: string,
    @Body() dto: UpdateOrderInternalNoteDto,
    @CurrentUser() user: CommandeUser,
  ) {
    return this.orders.updateInternalNote(id, dto.internalNote, toActor(user));
  }

  @Post('orders/:id/refund')
  refund(@Param('id') id: string, @CurrentUser() user: CommandeUser) {
    return this.refunds.refundOrder(id, toActor(user));
  }

  @Get('orders/:id/invoice.pdf')
  async invoice(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.pdf.invoice(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="facture-${id}.pdf"`,
    });
    res.send(buffer);
  }

  @Get('orders/:id/preparation.pdf')
  async preparation(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.pdf.preparationSlip(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="bon-preparation-${id}.pdf"`,
    });
    res.send(buffer);
  }

  @Post('orders/bulk-status')
  bulkUpdateStatus(
    @Body() dto: BulkUpdateOrderStatusDto,
    @CurrentUser() user: CommandeUser,
  ) {
    return this.orders.bulkUpdateStatus(dto.ids, dto.status, toActor(user));
  }

  @Get('stats')
  stats() {
    return this.orders.getStats();
  }
}

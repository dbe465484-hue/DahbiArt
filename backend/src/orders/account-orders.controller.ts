import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateOrderAlertDto } from './dto/create-order-alert.dto';
import { OrderAlertsService } from './order-alerts.service';
import { OrdersService } from './orders.service';

@Controller('account/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class AccountOrdersController {
  constructor(
    private readonly orders: OrdersService,
    private readonly alerts: OrderAlertsService,
  ) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.orders.listSummariesForUser(user.id);
  }

  @Get(':id')
  get(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.orders.findDetailForUser(user.id, id);
  }

  @Post(':id/alerts')
  report(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: CreateOrderAlertDto,
  ) {
    return this.alerts.createForCustomer(user.id, id, dto);
  }
}

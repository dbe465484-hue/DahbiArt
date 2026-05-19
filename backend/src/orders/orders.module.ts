import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { Painting } from '../paintings/entities/painting.entity';
import { User } from '../users/entities/user.entity';
import { AccountOrdersController } from './account-orders.controller';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { OrderAlert } from './entities/order-alert.entity';
import { OrderEvent } from './entities/order-event.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrderAlertsService } from './order-alerts.service';
import { OrdersNotificationService } from './orders-notification.service';
import { OrdersPdfService } from './orders-pdf.service';
import { OrdersRefundService } from './orders-refund.service';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    NotificationsModule,
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderEvent,
      OrderAlert,
      Painting,
      User,
    ]),
  ],
  controllers: [CheckoutController, AccountOrdersController],
  providers: [
    OrdersService,
    CheckoutService,
    OrdersNotificationService,
    OrdersPdfService,
    OrdersRefundService,
    OrderAlertsService,
  ],
  exports: [
    OrdersService,
    OrderAlertsService,
    OrdersPdfService,
    OrdersRefundService,
    OrdersNotificationService,
  ],
})
export class OrdersModule {}

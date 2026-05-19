import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { CommandeController } from './commande.controller';

@Module({
  imports: [OrdersModule],
  controllers: [CommandeController],
})
export class CommandeModule {}

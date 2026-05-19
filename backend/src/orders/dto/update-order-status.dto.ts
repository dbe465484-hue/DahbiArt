import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { OrderStatus } from '../../common/enums/order-status.enum';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  shippingCarrier?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  shippingTrackingNumber?: string;
}

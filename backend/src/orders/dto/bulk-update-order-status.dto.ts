import { ArrayMinSize, IsArray, IsEnum, IsUUID } from 'class-validator';
import { OrderStatus } from '../../common/enums/order-status.enum';

export class BulkUpdateOrderStatusDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  ids: string[];

  @IsEnum(OrderStatus)
  status: OrderStatus;
}

import { IsEnum, IsInt, IsString, Min } from 'class-validator';
import { OrderItemType } from '../../common/enums/order-item-type.enum';

export class CheckoutItemDto {
  @IsString()
  slug: string;

  @IsEnum(OrderItemType)
  type: OrderItemType;

  @IsInt()
  @Min(1)
  quantity: number;
}

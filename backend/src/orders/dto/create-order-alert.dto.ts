import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { OrderAlertType } from '../../common/enums/order-alert-type.enum';

export class CreateOrderAlertDto {
  @IsEnum(OrderAlertType)
  type: OrderAlertType;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}

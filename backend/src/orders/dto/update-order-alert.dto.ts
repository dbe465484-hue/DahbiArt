import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { OrderAlertStatus } from '../../common/enums/order-alert-status.enum';

export class UpdateOrderAlertDto {
  @IsEnum(OrderAlertStatus)
  status: OrderAlertStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  staffNote?: string;
}

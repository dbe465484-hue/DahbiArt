import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ShippingAddressDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  address: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @IsString()
  @MinLength(2)
  @MaxLength(2)
  country: string;

  @IsOptional()
  @IsBoolean()
  saveToProfile?: boolean;
}

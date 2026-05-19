import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { PaintingStatus } from '../../common/enums/painting-status.enum';

export class CreatePaintingDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  slug?: string;

  @IsInt()
  @Min(1900)
  year: number;

  @IsString()
  @MaxLength(40)
  dimensions: string;

  @IsString()
  @MaxLength(120)
  medium: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(PaintingStatus)
  status: PaintingStatus;

  @IsOptional()
  @IsBoolean()
  printAvailable?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  printPrice?: number;

  @MaxLength(2048)
  image: string;

  @IsString()
  description: string;

  @IsString()
  @MaxLength(60)
  subject: string;

  @IsString()
  @MaxLength(60)
  location: string;

  @IsString()
  @MaxLength(80)
  collection: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  bestSeller?: boolean;
}

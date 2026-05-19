import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateBlogPostDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  slug?: string;

  @IsString()
  excerpt: string;

  @IsString()
  content: string;

  @IsString()
  @MaxLength(2048)
  image: string;

  @IsDateString()
  publishedAt: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

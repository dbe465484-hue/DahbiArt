import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateOrderInternalNoteDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  internalNote?: string;
}

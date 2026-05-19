import { Controller, Get, Param } from '@nestjs/common';
import { PaintingsService } from './paintings.service';

@Controller('paintings')
export class PaintingsController {
  constructor(private readonly paintings: PaintingsService) {}

  @Get()
  findAll() {
    return this.paintings.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.paintings.findBySlug(slug);
  }
}

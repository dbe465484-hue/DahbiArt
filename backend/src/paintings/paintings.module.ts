import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Painting } from './entities/painting.entity';
import { PaintingsController } from './paintings.controller';
import { PaintingsSeedService } from './paintings-seed.service';
import { PaintingsService } from './paintings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Painting])],
  controllers: [PaintingsController],
  providers: [PaintingsService, PaintingsSeedService],
  exports: [PaintingsService, PaintingsSeedService],
})
export class PaintingsModule {}

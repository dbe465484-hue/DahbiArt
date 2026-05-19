import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarEvent } from './entities/event.entity';
import { EventsController } from './events.controller';
import { EventsSeedService } from './events-seed.service';
import { EventsService } from './events.service';

@Module({
  imports: [TypeOrmModule.forFeature([CalendarEvent])],
  controllers: [EventsController],
  providers: [EventsService, EventsSeedService],
  exports: [EventsService],
})
export class EventsModule {}

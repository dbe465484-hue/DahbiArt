import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsSeedService implements OnModuleInit {
  private readonly logger = new Logger(EventsSeedService.name);

  constructor(private readonly events: EventsService) {}

  private loadItems(): CreateEventDto[] {
    const file = path.join(__dirname, '../data/events-seed.json');
    if (!fs.existsSync(file)) return [];
    const { events } = JSON.parse(fs.readFileSync(file, 'utf8')) as {
      events: CreateEventDto[];
    };
    return events;
  }

  async seedIfEmpty() {
    const count = await this.events.count();
    if (count > 0) return;

    for (const item of this.loadItems()) {
      try {
        await this.events.create(item);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Event seed ignoré (${item.title}): ${msg}`);
      }
    }
  }

  onModuleInit() {
    void this.seedIfEmpty();
  }
}

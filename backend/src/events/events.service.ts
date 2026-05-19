import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CalendarEvent } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(CalendarEvent)
    private readonly repo: Repository<CalendarEvent>,
  ) {}

  private serialize(e: CalendarEvent) {
    return { ...e };
  }

  async findPublished() {
    const rows = await this.repo.find({
      where: { published: true },
      order: { eventDate: 'ASC' },
    });
    return rows.map((e) => this.serialize(e));
  }

  async findAll() {
    const rows = await this.repo.find({ order: { eventDate: 'ASC' } });
    return rows.map((e) => this.serialize(e));
  }

  async findById(id: string) {
    const e = await this.repo.findOne({ where: { id } });
    if (!e) throw new NotFoundException('Événement introuvable');
    return this.serialize(e);
  }

  async create(dto: CreateEventDto) {
    const entity = this.repo.create({
      ...dto,
      published: dto.published ?? true,
    });
    return this.serialize(await this.repo.save(entity));
  }

  async update(id: string, dto: UpdateEventDto) {
    const event = await this.repo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Événement introuvable');
    Object.assign(event, dto);
    return this.serialize(await this.repo.save(event));
  }

  async remove(id: string) {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException('Événement introuvable');
    return { ok: true };
  }

  async count() {
    return this.repo.count();
  }
}

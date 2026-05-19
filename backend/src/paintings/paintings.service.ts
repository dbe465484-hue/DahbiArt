import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { slugify } from '../common/utils/slugify';
import { CreatePaintingDto } from './dto/create-painting.dto';
import { UpdatePaintingDto } from './dto/update-painting.dto';
import { Painting } from './entities/painting.entity';

@Injectable()
export class PaintingsService {
  constructor(
    @InjectRepository(Painting)
    private readonly repo: Repository<Painting>,
  ) {}

  private serialize(p: Painting) {
    return {
      ...p,
      price: Number(p.price),
      printPrice: p.printPrice != null ? Number(p.printPrice) : undefined,
    };
  }

  async findAll() {
    const rows = await this.repo.find({ order: { createdAt: 'DESC' } });
    return rows.map((p) => this.serialize(p));
  }

  async findBySlug(slug: string) {
    const p = await this.repo.findOne({ where: { slug } });
    if (!p) throw new NotFoundException('Tableau introuvable');
    return this.serialize(p);
  }

  async findById(id: string) {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Tableau introuvable');
    return this.serialize(p);
  }

  private async uniqueSlug(base: string, excludeId?: string) {
    let slug = slugify(base);
    let n = 0;
    while (true) {
      const candidate = n === 0 ? slug : `${slug}-${n}`;
      const existing = await this.repo.findOne({ where: { slug: candidate } });
      if (!existing || existing.id === excludeId) return candidate;
      n++;
    }
  }

  async create(dto: CreatePaintingDto) {
    const slug = await this.uniqueSlug(dto.slug?.trim() || dto.title);
    const entity = this.repo.create({
      ...dto,
      slug,
      printAvailable: dto.printAvailable ?? false,
      featured: dto.featured ?? false,
      bestSeller: dto.bestSeller ?? false,
    });
    try {
      const saved = await this.repo.save(entity);
      return this.serialize(saved);
    } catch {
      throw new ConflictException('Slug ou données en conflit');
    }
  }

  async update(id: string, dto: UpdatePaintingDto) {
    const painting = await this.repo.findOne({ where: { id } });
    if (!painting) throw new NotFoundException('Tableau introuvable');

    if (dto.title || dto.slug) {
      painting.slug = await this.uniqueSlug(
        dto.slug?.trim() || dto.title || painting.title,
        id,
      );
    }

    Object.assign(painting, {
      ...dto,
      slug: painting.slug,
    });

    const saved = await this.repo.save(painting);
    return this.serialize(saved);
  }

  async remove(id: string) {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException('Tableau introuvable');
    return { ok: true };
  }

  async count() {
    return this.repo.count();
  }

  async existsBySlug(slug: string) {
    return this.repo.exists({ where: { slug } });
  }

  async findEntityBySlug(slug: string) {
    return this.repo.findOne({ where: { slug } });
  }

  async upsertFromSeed(dto: CreatePaintingDto & { slug: string }) {
    const existing = await this.findEntityBySlug(dto.slug);
    if (!existing) {
      return this.create(dto);
    }

    Object.assign(existing, {
      title: dto.title,
      year: dto.year,
      dimensions: dto.dimensions,
      medium: dto.medium,
      price: dto.price,
      status: dto.status,
      printAvailable: dto.printAvailable ?? false,
      printPrice: dto.printPrice,
      image: dto.image,
      description: dto.description,
      subject: dto.subject,
      location: dto.location,
      collection: dto.collection,
      featured: dto.featured ?? false,
      bestSeller: dto.bestSeller ?? false,
    });

    const saved = await this.repo.save(existing);
    return this.serialize(saved);
  }

  async removeOrphans(validSlugs: string[]) {
    const all = await this.repo.find({ select: ['id', 'slug'] });
    const keep = new Set(validSlugs);
    const orphans = all.filter((p) => !keep.has(p.slug));
    if (orphans.length === 0) return 0;
    await this.repo.remove(orphans);
    return orphans.length;
  }

  async countByStatus(status: string) {
    return this.repo.count({ where: { status: status as Painting['status'] } });
  }
}

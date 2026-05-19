import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaintingsService } from '../paintings/paintings.service';
import { WishlistItem } from './entities/wishlist-item.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly repo: Repository<WishlistItem>,
    private readonly paintings: PaintingsService,
  ) {}

  async listPaintingIds(userId: string): Promise<string[]> {
    const rows = await this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return rows.map((r) => r.paintingId);
  }

  async add(userId: string, paintingId: string) {
    await this.paintings.findById(paintingId);

    const existing = await this.repo.findOne({
      where: { userId, paintingId },
    });
    if (existing) {
      return { paintingIds: await this.listPaintingIds(userId) };
    }

    try {
      await this.repo.save(this.repo.create({ userId, paintingId }));
    } catch {
      throw new ConflictException('Déjà dans les favoris');
    }

    return { paintingIds: await this.listPaintingIds(userId) };
  }

  async remove(userId: string, paintingId: string) {
    const row = await this.repo.findOne({ where: { userId, paintingId } });
    if (!row) {
      throw new NotFoundException('Favori introuvable');
    }
    await this.repo.remove(row);
    return { paintingIds: await this.listPaintingIds(userId) };
  }

  async sync(userId: string, paintingIds: string[]) {
    const unique = [...new Set(paintingIds.filter(Boolean))];
    for (const paintingId of unique) {
      try {
        await this.add(userId, paintingId);
      } catch {
        /* ignore invalid ids */
      }
    }
    return { paintingIds: await this.listPaintingIds(userId) };
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { slugify } from '../common/utils/slugify';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { BlogPost } from './entities/blog-post.entity';

@Injectable()
export class BlogPostsService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly repo: Repository<BlogPost>,
    private readonly appNotifications: NotificationsService,
  ) {}

  private async notifyIfPublished(post: BlogPost, wasPublished: boolean) {
    if (post.published && !wasPublished) {
      await this.appNotifications.notifyBlogPublished({
        id: post.id,
        slug: post.slug,
        title: post.title,
      });
    }
  }

  private serialize(p: BlogPost) {
    return { ...p };
  }

  async findPublished() {
    const rows = await this.repo.find({
      where: { published: true },
      order: { publishedAt: 'DESC' },
    });
    return rows.map((p) => this.serialize(p));
  }

  async findBySlug(slug: string) {
    const p = await this.repo.findOne({ where: { slug, published: true } });
    if (!p) throw new NotFoundException('Article introuvable');
    return this.serialize(p);
  }

  async findAll(options?: { includeDeleted?: boolean }) {
    const rows = await this.repo.find({
      order: { publishedAt: 'DESC' },
      ...(options?.includeDeleted ? { withDeleted: true } : {}),
    });
    return rows.map((p) => this.serialize(p));
  }

  async findById(id: string) {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Article introuvable');
    return this.serialize(p);
  }

  private async uniqueSlug(base: string, excludeId?: string) {
    let slug = slugify(base);
    let n = 0;
    while (true) {
      const candidate = n === 0 ? slug : `${slug}-${n}`;
      const existing = await this.repo.findOne({
        where: { slug: candidate },
        withDeleted: true,
      });
      if (!existing || existing.id === excludeId) return candidate;
      n++;
    }
  }

  async create(dto: CreateBlogPostDto) {
    const slug = await this.uniqueSlug(dto.slug?.trim() || dto.title);
    const entity = this.repo.create({
      ...dto,
      slug,
      published: dto.published ?? true,
    });
    try {
      const saved = await this.repo.save(entity);
      await this.notifyIfPublished(saved, false);
      return this.serialize(saved);
    } catch {
      throw new ConflictException('Slug ou données en conflit');
    }
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    const post = await this.repo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Article introuvable');

    const wasPublished = post.published;

    if (dto.title != null && dto.title !== post.title) {
      post.slug = await this.uniqueSlug(dto.title, id);
    } else if (dto.slug?.trim() && dto.slug.trim() !== post.slug) {
      post.slug = await this.uniqueSlug(dto.slug.trim(), id);
    }

    const { slug: _slug, ...rest } = dto;
    Object.assign(post, { ...rest, slug: post.slug });
    const saved = await this.repo.save(post);
    await this.notifyIfPublished(saved, wasPublished);
    return this.serialize(saved);
  }

  async remove(id: string) {
    const result = await this.repo.softDelete(id);
    if (!result.affected) throw new NotFoundException('Article introuvable');
    return { ok: true };
  }

  async restore(id: string) {
    const result = await this.repo.restore(id);
    if (!result.affected) throw new NotFoundException('Article introuvable');
    const post = await this.repo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Article introuvable');
    return this.serialize(post);
  }

  async count() {
    return this.repo.count();
  }

  async existsBySlug(slug: string) {
    return this.repo.exists({ where: { slug } });
  }
}

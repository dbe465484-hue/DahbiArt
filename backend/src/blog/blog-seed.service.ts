import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { BlogPostsService } from './blog-posts.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';

type SeedItem = CreateBlogPostDto & { slug: string };

@Injectable()
export class BlogSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BlogSeedService.name);

  constructor(private readonly blog: BlogPostsService) {}

  private loadItems(): SeedItem[] {
    const file = path.join(__dirname, '../data/blog-seed.json');
    if (!fs.existsSync(file)) return [];
    const { posts } = JSON.parse(fs.readFileSync(file, 'utf8')) as { posts: SeedItem[] };
    return posts;
  }

  async seedIfEmpty() {
    const count = await this.blog.count();
    if (count > 0) return;

    for (const item of this.loadItems()) {
      try {
        const exists = await this.blog.existsBySlug(item.slug);
        if (!exists) await this.blog.create({ ...item, slug: item.slug });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Blog seed ignoré (${item.slug}): ${msg}`);
      }
    }
  }

  onApplicationBootstrap() {
    void this.seedIfEmpty().catch((err) => {
      this.logger.warn(err instanceof Error ? err.message : String(err));
    });
  }
}

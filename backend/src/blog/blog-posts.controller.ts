import { Controller, Get, Param } from '@nestjs/common';
import { BlogPostsService } from './blog-posts.service';

@Controller('blog-posts')
export class BlogPostsController {
  constructor(private readonly blog: BlogPostsService) {}

  @Get()
  list() {
    return this.blog.findPublished();
  }

  @Get(':slug')
  get(@Param('slug') slug: string) {
    return this.blog.findBySlug(slug);
  }
}

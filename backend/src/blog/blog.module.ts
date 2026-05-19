import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { BlogPostsController } from './blog-posts.controller';
import { BlogPostsService } from './blog-posts.service';
import { BlogSeedService } from './blog-seed.service';
import { BlogPost } from './entities/blog-post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlogPost]), NotificationsModule],
  controllers: [BlogPostsController],
  providers: [BlogPostsService, BlogSeedService],
  exports: [BlogPostsService],
})
export class BlogModule {}

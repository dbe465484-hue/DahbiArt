import { Injectable } from '@nestjs/common';
import { PaintingStatus } from '../common/enums/painting-status.enum';
import { BlogPostsService } from '../blog/blog-posts.service';
import { EventsService } from '../events/events.service';
import { PaintingsService } from '../paintings/paintings.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly paintings: PaintingsService,
    private readonly blog: BlogPostsService,
    private readonly events: EventsService,
    private readonly users: UsersService,
  ) {}

  async getStats() {
    const [totalPaintings, available, sold, customers, blogPosts, events] =
      await Promise.all([
        this.paintings.count(),
        this.paintings.countByStatus(PaintingStatus.AVAILABLE),
        this.paintings.countByStatus(PaintingStatus.SOLD),
        this.users.countCustomers(),
        this.blog.count(),
        this.events.count(),
      ]);

    return {
      totalPaintings,
      available,
      sold,
      customers,
      blogPosts,
      events,
    };
  }
}

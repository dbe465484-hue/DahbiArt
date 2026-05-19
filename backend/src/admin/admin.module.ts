import { Module } from '@nestjs/common';
import { BlogModule } from '../blog/blog.module';
import { UploadsModule } from '../uploads/uploads.module';
import { EventsModule } from '../events/events.module';
import { PaintingsModule } from '../paintings/paintings.module';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminSeedService } from './admin-seed.service';
import { AdminService } from './admin.service';

@Module({
  imports: [PaintingsModule, BlogModule, EventsModule, UsersModule, UploadsModule],
  controllers: [AdminController],
  providers: [AdminService, AdminSeedService],
})
export class AdminModule {}

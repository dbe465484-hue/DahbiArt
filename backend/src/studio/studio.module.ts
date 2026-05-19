import { Module } from '@nestjs/common';
import { BlogModule } from '../blog/blog.module';
import { EventsModule } from '../events/events.module';
import { UploadsModule } from '../uploads/uploads.module';
import { StudioController } from './studio.controller';

@Module({
  imports: [BlogModule, EventsModule, UploadsModule],
  controllers: [StudioController],
})
export class StudioModule {}

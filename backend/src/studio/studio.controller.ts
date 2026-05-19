import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BlogPostsService } from '../blog/blog-posts.service';
import { CreateBlogPostDto } from '../blog/dto/create-blog-post.dto';
import { UpdateBlogPostDto } from '../blog/dto/update-blog-post.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateEventDto } from '../events/dto/create-event.dto';
import { UpdateEventDto } from '../events/dto/update-event.dto';
import { EventsService } from '../events/events.service';
import { UploadsService } from '../uploads/uploads.service';

const imageUpload = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
});

@Controller('studio')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ARTISTE, UserRole.ADMIN)
export class StudioController {
  constructor(
    private readonly blog: BlogPostsService,
    private readonly events: EventsService,
    private readonly uploads: UploadsService,
  ) {}

  @Post('uploads/blog')
  @UseInterceptors(imageUpload)
  uploadBlog(
    @UploadedFile() file: Express.Multer.File,
    @Body('slug') slug?: string,
  ) {
    if (!file) throw new BadRequestException('Fichier requis');
    return this.uploads.saveImage('blog', file, slug);
  }

  @Get('blog-posts')
  listBlogPosts() {
    return this.blog.findAll();
  }

  @Get('blog-posts/:id')
  getBlogPost(@Param('id') id: string) {
    return this.blog.findById(id);
  }

  @Post('blog-posts')
  createBlogPost(@Body() dto: CreateBlogPostDto) {
    return this.blog.create(dto);
  }

  @Patch('blog-posts/:id')
  updateBlogPost(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blog.update(id, dto);
  }

  @Delete('blog-posts/:id')
  deleteBlogPost(@Param('id') id: string) {
    return this.blog.remove(id);
  }

  @Get('events')
  listEvents() {
    return this.events.findAll();
  }

  @Get('events/:id')
  getEvent(@Param('id') id: string) {
    return this.events.findById(id);
  }

  @Post('events')
  createEvent(@Body() dto: CreateEventDto) {
    return this.events.create(dto);
  }

  @Patch('events/:id')
  updateEvent(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.events.update(id, dto);
  }

  @Delete('events/:id')
  deleteEvent(@Param('id') id: string) {
    return this.events.remove(id);
  }
}

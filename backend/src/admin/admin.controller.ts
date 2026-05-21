import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateBlogPostDto } from '../blog/dto/create-blog-post.dto';
import { UpdateBlogPostDto } from '../blog/dto/update-blog-post.dto';
import { BlogPostsService } from '../blog/blog-posts.service';
import { CreateEventDto } from '../events/dto/create-event.dto';
import { UpdateEventDto } from '../events/dto/update-event.dto';
import { EventsService } from '../events/events.service';
import { CreatePaintingDto } from '../paintings/dto/create-painting.dto';
import { UpdatePaintingDto } from '../paintings/dto/update-painting.dto';
import { PaintingsSeedService } from '../paintings/paintings-seed.service';
import { PaintingsService } from '../paintings/paintings.service';
import { UploadsService } from '../uploads/uploads.service';
import { UsersService } from '../users/users.service';
import { AdminService } from './admin.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

const imageUpload = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: 4.5 * 1024 * 1024 },
});

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly paintings: PaintingsService,
    private readonly catalogSeed: PaintingsSeedService,
    private readonly blog: BlogPostsService,
    private readonly events: EventsService,
    private readonly uploads: UploadsService,
    private readonly users: UsersService,
  ) {}

  @Post('uploads/painting')
  @UseInterceptors(imageUpload)
  uploadPainting(
    @UploadedFile() file: Express.Multer.File,
    @Body('slug') slug?: string,
  ) {
    if (!file) throw new BadRequestException('Fichier requis');
    return this.uploads.saveImage('painting', file, slug);
  }

  @Post('uploads/blog')
  @UseInterceptors(imageUpload)
  uploadBlog(
    @UploadedFile() file: Express.Multer.File,
    @Body('slug') slug?: string,
  ) {
    if (!file) throw new BadRequestException('Fichier requis');
    return this.uploads.saveImage('blog', file, slug);
  }

  @Get('stats')
  stats() {
    return this.admin.getStats();
  }

  @Get('users')
  listUsers() {
    return this.users.findAll();
  }

  @Post('users')
  async createUser(@Body() dto: CreateUserDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new BadRequestException('Cet email est déjà utilisé');
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.users.create({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email,
      password: passwordHash,
      phone: dto.phone?.trim(),
      role: dto.role,
      country: 'MA',
    });
    return this.users.findById(user.id);
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    const user = await this.users.findById(id);
    if (!user) throw new BadRequestException('Utilisateur introuvable');
    return user;
  }

  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.users.findById(id);
    if (!user) throw new BadRequestException('Utilisateur introuvable');

    const patch: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      role?: UserRole;
      password?: string;
    } = {};

    if (dto.firstName !== undefined) patch.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) patch.lastName = dto.lastName.trim();
    if (dto.phone !== undefined) patch.phone = dto.phone.trim() || undefined;
    if (dto.role !== undefined) patch.role = dto.role;

    if (dto.email !== undefined) {
      const email = dto.email.toLowerCase().trim();
      if (email !== user.email) {
        const existing = await this.users.findByEmail(email);
        if (existing && existing.id !== id) {
          throw new BadRequestException('Cet email est déjà utilisé');
        }
        patch.email = email;
      }
    }

    if (dto.password) {
      patch.password = await bcrypt.hash(dto.password, 12);
    }

    return this.users.update(id, patch);
  }

  @Patch('users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    await this.users.setRole(id, dto.role);
    const user = await this.users.findById(id);
    if (!user) throw new BadRequestException('Utilisateur introuvable');
    return user;
  }

  @Delete('users/:id')
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() admin: { id: string },
  ) {
    if (admin.id === id) {
      throw new BadRequestException('Vous ne pouvez pas supprimer votre propre compte');
    }
    const removed = await this.users.remove(id);
    if (!removed) throw new BadRequestException('Utilisateur introuvable');
    return { ok: true };
  }

  @Get('paintings')
  listPaintings(@Query('includeDeleted') includeDeleted?: string) {
    return this.paintings.findAll({
      includeDeleted: includeDeleted === 'true',
    });
  }

  @Get('paintings/:id')
  getPainting(@Param('id') id: string) {
    return this.paintings.findById(id);
  }

  @Post('paintings')
  createPainting(@Body() dto: CreatePaintingDto) {
    return this.paintings.create(dto);
  }

  /** Importe les tableaux manquants depuis le catalogue (36 œuvres) */
  @Post('paintings/sync-catalog')
  syncCatalog() {
    return this.catalogSeed.syncCatalog({ updateExisting: true });
  }

  @Patch('paintings/:id')
  updatePainting(@Param('id') id: string, @Body() dto: UpdatePaintingDto) {
    return this.paintings.update(id, dto);
  }

  @Delete('paintings/:id')
  deletePainting(@Param('id') id: string) {
    return this.paintings.remove(id);
  }

  @Post('paintings/:id/restore')
  restorePainting(@Param('id') id: string) {
    return this.paintings.restore(id);
  }

  @Get('blog-posts')
  listBlogPosts(@Query('includeDeleted') includeDeleted?: string) {
    return this.blog.findAll({
      includeDeleted: includeDeleted === 'true',
    });
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

  @Post('blog-posts/:id/restore')
  restoreBlogPost(@Param('id') id: string) {
    return this.blog.restore(id);
  }

  @Get('events')
  listEvents(@Query('includeDeleted') includeDeleted?: string) {
    return this.events.findAll({
      includeDeleted: includeDeleted === 'true',
    });
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

  @Post('events/:id/restore')
  restoreEvent(@Param('id') id: string) {
    return this.events.restore(id);
  }
}

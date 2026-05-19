import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { slugify } from '../common/utils/slugify';

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

export type UploadKind = 'painting' | 'blog';

@Injectable()
export class UploadsService {
  private readonly publicRoot: string;

  constructor(config: ConfigService) {
    const configured = config.get<string>('UPLOAD_PUBLIC_DIR');
    this.publicRoot = configured
      ? path.resolve(configured)
      : path.resolve(process.cwd(), '../frontend/public');
  }

  private targetDir(kind: UploadKind) {
    const sub = kind === 'painting' ? 'paintings' : 'blog';
    const dir = path.join(this.publicRoot, sub);
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  async saveImage(
    kind: UploadKind,
    file: Express.Multer.File,
    slugInput?: string,
  ): Promise<{ url: string; filename: string }> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Fichier manquant');
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('Image trop volumineuse (max 12 Mo)');
    }
    if (!ALLOWED.has(file.mimetype)) {
      throw new BadRequestException('Format non supporté (JPEG, PNG, WebP, GIF, AVIF)');
    }

    const slug = slugify(slugInput?.trim() || file.originalname.replace(/\.[^.]+$/, ''));
    if (!slug) {
      throw new BadRequestException('Indiquez un titre ou un slug pour nommer l’image');
    }

    const dir = this.targetDir(kind);
    const filename = `${slug}.webp`;
    const outPath = path.join(dir, filename);

    try {
      await sharp(file.buffer)
        .rotate()
        .resize(kind === 'painting' ? 1600 : 1920, kind === 'painting' ? 1600 : 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 86 })
        .toFile(outPath);
    } catch {
      throw new InternalServerErrorException('Échec du traitement de l’image');
    }

    const url = `/${kind === 'painting' ? 'paintings' : 'blog'}/${filename}`;
    return { url, filename };
  }
}

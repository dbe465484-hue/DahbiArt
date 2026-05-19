import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { put } from '@vercel/blob';
import { existsSync } from 'fs';
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
  private readonly useBlob: boolean;

  constructor(config: ConfigService) {
    const configured = config.get<string>('UPLOAD_PUBLIC_DIR');
    if (configured) {
      this.publicRoot = path.resolve(configured);
    } else {
      const candidates = [
        path.resolve(process.cwd(), '../frontend/public'),
        path.resolve(process.cwd(), 'frontend/public'),
      ];
      this.publicRoot =
        candidates.find((dir) => existsSync(dir)) ?? candidates[0];
    }
    this.useBlob = Boolean(
      config.get<string>('BLOB_READ_WRITE_TOKEN') ||
        process.env.BLOB_READ_WRITE_TOKEN,
    );
  }

  private subdir(kind: UploadKind) {
    return kind === 'painting' ? 'paintings' : 'blog';
  }

  private targetDir(kind: UploadKind) {
    const dir = path.join(this.publicRoot, this.subdir(kind));
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
      throw new BadRequestException(
        'Format non supporté (JPEG, PNG, WebP, GIF, AVIF)',
      );
    }

    const slug = slugify(
      slugInput?.trim() || file.originalname.replace(/\.[^.]+$/, ''),
    );
    if (!slug) {
      throw new BadRequestException(
        'Indiquez un titre ou un slug pour nommer l’image',
      );
    }

    const sub = this.subdir(kind);
    const filename = `${slug}.webp`;
    const maxEdge = kind === 'painting' ? 1600 : 1920;
    const maxHeight = kind === 'painting' ? 1600 : 1200;

    let webpBuffer: Buffer;
    try {
      webpBuffer = await sharp(file.buffer)
        .rotate()
        .resize(maxEdge, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 86 })
        .toBuffer();
    } catch {
      throw new InternalServerErrorException('Échec du traitement de l’image');
    }

    if (this.useBlob) {
      try {
        const blob = await put(`${sub}/${filename}`, webpBuffer, {
          access: 'public',
          contentType: 'image/webp',
          addRandomSuffix: false,
        });
        return { url: blob.url, filename };
      } catch {
        throw new InternalServerErrorException(
          'Échec de l’envoi sur Vercel Blob. Vérifiez BLOB_READ_WRITE_TOKEN.',
        );
      }
    }

    if (process.env.VERCEL) {
      throw new InternalServerErrorException(
        'Upload impossible : activez Vercel Blob (Storage) sur le projet dahbi-art-api.',
      );
    }

    const outPath = path.join(this.targetDir(kind), filename);
    try {
      await fs.promises.writeFile(outPath, webpBuffer);
    } catch {
      throw new InternalServerErrorException('Échec de l’enregistrement local');
    }

    const url = `/${sub}/${filename}`;
    return { url, filename };
  }
}

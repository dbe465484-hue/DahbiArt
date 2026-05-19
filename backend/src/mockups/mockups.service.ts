import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

type Placement = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};

type MockupEntry = {
  id: string;
  name: string;
  category: string;
  mode?: 'inset' | 'hang';
  background?: string;
  backgroundSource?: string;
  placement: Placement;
  wallTone: string;
  feather: number;
  blend?: { brightness: number; contrast: number; saturation: number };
};

const BG_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

@Injectable()
export class MockupsService {
  private catalog: { mockups: MockupEntry[] } | null = null;

  private frontendPublic() {
    return path.join(process.cwd(), '..', 'frontend', 'public');
  }

  private loadCatalog() {
    if (this.catalog) return this.catalog;
    const p = path.join(this.frontendPublic(), 'mockups', 'catalog.json');
    this.catalog = JSON.parse(fs.readFileSync(p, 'utf8')) as {
      mockups: MockupEntry[];
    };
    return this.catalog;
  }

  private resolveBackgroundPath(mockup: MockupEntry): string | null {
    const publicRoot = this.frontendPublic();
    const backgroundUrl = mockup.background ?? `/mockups/${mockup.id}/background.jpg`;

    if (backgroundUrl.startsWith('/')) {
      const fromCatalog = path.join(publicRoot, backgroundUrl.replace(/^\//, ''));
      if (fs.existsSync(fromCatalog)) return fromCatalog;
    }

    const dir = path.join(publicRoot, 'mockups', mockup.id);
    for (const ext of BG_EXTENSIONS) {
      const candidate = path.join(dir, `background${ext}`);
      if (fs.existsSync(candidate)) return candidate;
    }

    const any = fs
      .readdirSync(dir, { withFileTypes: true })
      .map((d) => d.name)
      .find((f) => /^background\./i.test(f) && /\.(jpe?g|png|webp)$/i.test(f));
    return any ? path.join(dir, any) : null;
  }

  list() {
    return this.loadCatalog().mockups.map((m) => ({
      id: m.id,
      name: m.name,
      category: m.category,
    }));
  }

  get(id: string) {
    const m = this.loadCatalog().mockups.find((x) => x.id === id);
    if (!m) throw new NotFoundException('Mockup inconnu');
    return m;
  }

  async render(paintingUrl: string, mockupId: string, width = 1920): Promise<Buffer> {
    const mockup = this.get(mockupId);
    const outputWidth = Math.min(2560, Math.max(800, width));
    const isHang = mockup.mode === 'hang';

    const localBg = this.resolveBackgroundPath(mockup);
    let bgBuf: Buffer;
    if (localBg) {
      bgBuf = fs.readFileSync(localBg);
    } else {
      const url = mockup.backgroundSource ?? '';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Background unavailable');
      bgBuf = Buffer.from(await res.arrayBuffer());
    }

    const paintRes = await fetch(paintingUrl);
    if (!paintRes.ok) throw new Error('Painting unavailable');
    const paintBuf = Buffer.from(await paintRes.arrayBuffer());

    const bgMeta = await sharp(bgBuf).metadata();
    const outH = Math.round(
      (bgMeta.height ?? 1080) * (outputWidth / (bgMeta.width ?? outputWidth)),
    );
    const background = await sharp(bgBuf)
      .resize(outputWidth, outH, { fit: 'fill' })
      .toBuffer();

    const r = {
      left: Math.round(mockup.placement.x * outputWidth),
      top: Math.round(mockup.placement.y * outH),
      width: Math.round(mockup.placement.width * outputWidth),
      height: Math.round(mockup.placement.height * outH),
    };

    const pMeta = await sharp(paintBuf).metadata();
    const sw = pMeta.width ?? 1;
    const sh = pMeta.height ?? 1;
    const fitScale = isHang
      ? Math.max(r.width / sw, r.height / sh)
      : Math.min(r.width / sw, r.height / sh);
    const pw = Math.round(sw * fitScale);
    const ph = Math.round(sh * fitScale);

    const blend = mockup.blend ?? {
      brightness: 0.98,
      contrast: 1.02,
      saturation: 0.96,
    };

    let paintingPipeline = sharp(paintBuf)
      .resize(pw, ph, { fit: 'fill' })
      .modulate({ brightness: blend.brightness, saturation: blend.saturation });

    const rot = mockup.placement.rotation ?? 0;
    if (rot) {
      paintingPipeline = paintingPipeline.rotate(rot, {
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });
    }

    const painting = await paintingPipeline.png().toBuffer();
    const pl = r.left + Math.round((r.width - pw) / 2);
    const pt = r.top + Math.round((r.height - ph) / 2);

    const composites: sharp.OverlayOptions[] = [];

    if (!isHang) {
      const hex = mockup.wallTone.replace('#', '');
      const tone = {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
      const wallPatch = await sharp({
        create: { width: r.width, height: r.height, channels: 3, background: tone },
      })
        .png()
        .toBuffer();
      composites.push({ input: wallPatch, left: r.left, top: r.top });
    }

    composites.push({ input: painting, left: pl, top: pt });

    return sharp(background)
      .composite(composites)
      .jpeg({ quality: 90 })
      .toBuffer();
  }
}

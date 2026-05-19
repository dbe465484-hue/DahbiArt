import type { MockupDefinition } from "./types";
import { resolveMockupBackground } from "./catalog";
import {
  drawFramedPainting,
  frameColorsFor,
  layoutFramedPainting,
} from "./art-frame";
import { placementCenter } from "./painting-display";

export type RenderOptions = {
  paintingSrc: string;
  mockup: MockupDefinition;
  outputWidth?: number;
  quality?: number;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Load failed: ${src}`));
    img.src = src;
  });
}

async function tryLoad(src: string): Promise<HTMLImageElement | null> {
  try {
    return await loadImage(src);
  } catch {
    return null;
  }
}

async function loadBackground(mockup: MockupDefinition): Promise<HTMLImageElement> {
  const primary = resolveMockupBackground(mockup);
  const hit = await tryLoad(primary);
  if (hit) return hit;

  const altExts = [".png", ".jpg", ".jpeg", ".webp"];
  const base = primary.replace(/\.(jpe?g|png|webp)(\?.*)?$/i, "");
  for (const ext of altExts) {
    const alt = `${base}${ext}`;
    if (alt === primary) continue;
    const img = await tryLoad(alt);
    if (img) return img;
  }

  if (mockup.backgroundSource) {
    const remote = await tryLoad(mockup.backgroundSource);
    if (remote) return remote;
  }

  throw new Error(`Fond mockup introuvable: ${mockup.id}`);
}

function placementRect(p: MockupDefinition["placement"], w: number, h: number) {
  return { x: p.x * w, y: p.y * h, w: p.width * w, h: p.height * h };
}

export async function renderMockupPreview(opts: RenderOptions): Promise<string> {
  const { paintingSrc, mockup, outputWidth = 1200, quality = 0.9 } = opts;
  const bgImg = await loadBackground(mockup);
  const paintImg = await loadImage(paintingSrc);

  const scale = outputWidth / bgImg.naturalWidth;
  const outH = Math.round(bgImg.naturalHeight * scale);
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outH;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(bgImg, 0, 0, outputWidth, outH);

  const rect = placementRect(mockup.placement, outputWidth, outH);
  const { cx, cy } = placementCenter(mockup.placement, outputWidth, outH);
  const blend = mockup.blend ?? { brightness: 0.98, contrast: 1.02, saturation: 0.96 };

  const layout = layoutFramedPainting(
    paintImg.naturalWidth,
    paintImg.naturalHeight,
    outputWidth,
    rect.w,
    rect.h,
  );

  drawFramedPainting(ctx, paintImg, cx, cy, layout, frameColorsFor(mockup), blend);

  return canvas.toDataURL("image/jpeg", quality);
}

const cache = new Map<string, string>();

export async function renderMockupCached(opts: RenderOptions) {
  const key = `v30:${opts.mockup.id}:${opts.outputWidth ?? 1200}:${opts.paintingSrc}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const url = await renderMockupPreview(opts);
  cache.set(key, url);
  if (cache.size > 36) cache.delete(cache.keys().next().value!);
  return url;
}

export function downloadDataUrl(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
}

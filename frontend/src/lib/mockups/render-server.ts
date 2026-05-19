import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  frameColorsFor,
  frameSvg,
  layoutFramedPainting,
  paintingOffsetInFrame,
} from "./art-frame";
import { getMockupById } from "./catalog";
import { placementCenter } from "./painting-display";
import { resolveLocalBackgroundPath } from "./resolve-background";
import type { Placement } from "./types";

function rect(p: Placement, w: number, h: number) {
  return {
    left: Math.round(p.x * w),
    top: Math.round(p.y * h),
    width: Math.round(p.width * w),
    height: Math.round(p.height * h),
  };
}

function publicRoot() {
  return path.join(process.cwd(), "public");
}

async function loadBg(id: string, mockup: NonNullable<ReturnType<typeof getMockupById>>) {
  const local = resolveLocalBackgroundPath(publicRoot(), id, mockup.background);
  if (local) return fs.readFileSync(local);
  throw new Error(`Mockup background manquant pour ${id} (${mockup.background})`);
}

export async function renderMockupServer(opts: {
  paintingUrl: string;
  mockupId: string;
  outputWidth?: number;
}) {
  const mockup = getMockupById(opts.mockupId);
  if (!mockup) throw new Error("Mockup inconnu");

  const outputWidth = Math.min(2560, Math.max(800, opts.outputWidth ?? 1920));
  const [bgBuf, paintBuf] = await Promise.all([
    loadBg(mockup.id, mockup),
    fetch(opts.paintingUrl).then(async (r) => {
      if (!r.ok) throw new Error("Painting unavailable");
      return Buffer.from(await r.arrayBuffer());
    }),
  ]);

  const meta = await sharp(bgBuf).metadata();
  const outH = Math.round((meta.height ?? 1080) * (outputWidth / (meta.width ?? outputWidth)));
  const background = await sharp(bgBuf).resize(outputWidth, outH, { fit: "fill" }).toBuffer();

  const r = rect(mockup.placement, outputWidth, outH);
  const { cx, cy } = placementCenter(mockup.placement, outputWidth, outH);

  const pm = await sharp(paintBuf).metadata();
  const sw = pm.width ?? 1;
  const sh = pm.height ?? 1;

  const layout = layoutFramedPainting(sw, sh, outputWidth, r.width, r.height);
  const colors = frameColorsFor(mockup);
  const { px, py } = paintingOffsetInFrame(layout);

  const frameBuf = await sharp(Buffer.from(frameSvg(layout.outerW, layout.outerH, layout, colors)))
    .png()
    .toBuffer();

  const blend = mockup.blend ?? { brightness: 0.98, contrast: 1.02, saturation: 0.96 };
  const painting = await sharp(paintBuf)
    .resize(Math.round(layout.paintW), Math.round(layout.paintH), {
      fit: "inside",
      withoutEnlargement: false,
    })
    .modulate({ brightness: blend.brightness, saturation: blend.saturation })
    .png()
    .toBuffer();

  const frameLeft = Math.round(cx - layout.outerW / 2);
  const frameTop = Math.round(cy - layout.outerH / 2);

  return sharp(background)
    .composite([
      { input: frameBuf, left: frameLeft, top: frameTop },
      {
        input: painting,
        left: frameLeft + Math.round(px),
        top: frameTop + Math.round(py),
      },
    ])
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();
}

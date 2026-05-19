import type { MockupDefinition } from "./types";
import { paintingDisplaySize } from "./painting-display";

export type FrameColors = {
  woodLight: string;
  woodMid: string;
  woodDark: string;
  mat: string;
  lip: string;
};

export function frameColorsFor(mockup: MockupDefinition): FrameColors {
  if (mockup.id === "mur-sombre") {
    return {
      woodLight: "#4a4542",
      woodMid: "#2f2b28",
      woodDark: "#1c1a18",
      mat: "#e6e2dc",
      lip: "#5c5650",
    };
  }
  if (mockup.id === "loft-industriel") {
    return {
      woodLight: "#3a3632",
      woodMid: "#252220",
      woodDark: "#141210",
      mat: "#efede8",
      lip: "#4a4540",
    };
  }
  if (mockup.category === "style" || mockup.id === "hotel-elegant") {
    return {
      woodLight: "#9a7b3c",
      woodMid: "#6f5428",
      woodDark: "#4a3818",
      mat: "#faf8f4",
      lip: "#b89850",
    };
  }
  return {
    woodLight: "#8f7040",
    woodMid: "#6b4f2a",
    woodDark: "#4a3520",
    mat: mockup.wallTone?.startsWith("#") && mockup.wallTone !== "#ffffff"
      ? mockup.wallTone
      : "#f7f4ef",
    lip: "#a08048",
  };
}

export type FramedLayout = {
  outerW: number;
  outerH: number;
  frameBorder: number;
  matPad: number;
  innerW: number;
  innerH: number;
  paintW: number;
  paintH: number;
};

/** Tableau dimensionné dans la zone mur, puis cadre fin autour (sans remplir la zone). */
export function layoutFramedPainting(
  srcW: number,
  srcH: number,
  outputWidth: number,
  placementW: number,
  placementH: number,
): FramedLayout {
  const frameBorder = Math.max(2, outputWidth * 0.0035);
  const maxW = placementW * 0.98;
  const maxH = placementH * 0.98;
  const paint = paintingDisplaySize(
    srcW,
    srcH,
    outputWidth,
    Math.max(1, maxW - 2 * frameBorder),
    Math.max(1, maxH - 2 * frameBorder),
    0.98,
  );

  const outerW = paint.w + 2 * frameBorder;
  const outerH = paint.h + 2 * frameBorder;

  return {
    outerW,
    outerH,
    frameBorder,
    matPad: 0,
    innerW: paint.w,
    innerH: paint.h,
    paintW: paint.w,
    paintH: paint.h,
  };
}

type Blend = { brightness: number; contrast: number; saturation: number };

function fillThinFrame(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  outerW: number,
  outerH: number,
  b: number,
  colors: FrameColors,
) {
  ctx.fillStyle = colors.woodMid;
  ctx.fillRect(ox, oy, outerW, b);
  ctx.fillRect(ox, oy + outerH - b, outerW, b);
  ctx.fillStyle = colors.woodDark;
  ctx.fillRect(ox, oy + b, b, outerH - 2 * b);
  ctx.fillStyle = colors.woodLight;
  ctx.fillRect(ox + outerW - b, oy + b, b, outerH - 2 * b);
}

/** Cadre fin autour du tableau uniquement (centre inchangé). */
export function drawFramedPainting(
  ctx: CanvasRenderingContext2D,
  paintImg: HTMLImageElement,
  cx: number,
  cy: number,
  layout: FramedLayout,
  colors: FrameColors,
  blend: Blend,
) {
  const { outerW, outerH, frameBorder, paintW, paintH } = layout;
  const ox = cx - outerW / 2;
  const oy = cy - outerH / 2;
  const px = ox + frameBorder;
  const py = oy + frameBorder;
  const sw = paintImg.naturalWidth;
  const sh = paintImg.naturalHeight;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.32)";
  ctx.shadowBlur = Math.max(6, outerW * 0.04);
  ctx.shadowOffsetX = Math.max(1, outerW * 0.008);
  ctx.shadowOffsetY = Math.max(2, outerH * 0.02);

  fillThinFrame(ctx, ox, oy, outerW, outerH, frameBorder, colors);

  ctx.shadowColor = "transparent";

  ctx.filter = `brightness(${blend.brightness}) contrast(${blend.contrast}) saturate(${blend.saturation})`;
  ctx.drawImage(paintImg, 0, 0, sw, sh, px, py, paintW, paintH);
  ctx.filter = "none";

  ctx.strokeStyle = colors.lip;
  ctx.lineWidth = Math.max(0.5, frameBorder * 0.35);
  ctx.strokeRect(ox + 0.5, oy + 0.5, outerW - 1, outerH - 1);

  ctx.restore();
}

/** SVG cadre fin (centre transparent) pour le rendu serveur. */
export function frameSvg(
  outerW: number,
  outerH: number,
  layout: FramedLayout,
  colors: FrameColors,
): string {
  const b = layout.frameBorder;
  const iw = outerW - 2 * b;
  const ih = outerH - 2 * b;

  return `<svg width="${outerW}" height="${outerH}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="${outerW}" height="${b}" fill="${colors.woodMid}"/>
    <rect x="0" y="${outerH - b}" width="${outerW}" height="${b}" fill="${colors.woodMid}"/>
    <rect x="0" y="${b}" width="${b}" height="${ih}" fill="${colors.woodDark}"/>
    <rect x="${outerW - b}" y="${b}" width="${b}" height="${ih}" fill="${colors.woodLight}"/>
    <rect x="${b}" y="${b}" width="${iw}" height="${ih}" fill="none" stroke="${colors.lip}" stroke-width="${Math.max(0.5, b * 0.35)}"/>
  </svg>`;
}

export function paintingOffsetInFrame(layout: FramedLayout) {
  return {
    px: layout.frameBorder,
    py: layout.frameBorder,
  };
}

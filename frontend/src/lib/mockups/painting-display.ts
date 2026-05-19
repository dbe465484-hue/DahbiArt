import type { Placement } from "./types";

/** Plus grand côté du tableau = cette fraction de la largeur de sortie (identique entre mockups). */
export const UNIFORM_PAINTING_LONG_EDGE_FRAC = 0.175;

export function placementCenter(placement: Placement, canvasW: number, canvasH: number) {
  return {
    cx: (placement.x + placement.width / 2) * canvasW,
    cy: (placement.y + placement.height / 2) * canvasH,
  };
}

/** Taille max dans un cadre sans recadrer (fit-contain). */
export function fitContain(sw: number, sh: number, mw: number, mh: number) {
  const s = Math.min(mw / Math.max(sw, 1), mh / Math.max(sh, 1));
  return { w: sw * s, h: sh * s };
}

function uniformPaintingSize(srcW: number, srcH: number, outputWidth: number) {
  const maxLong = outputWidth * UNIFORM_PAINTING_LONG_EDGE_FRAC;
  const scale = maxLong / Math.max(srcW, srcH, 1);
  return { w: srcW * scale, h: srcH * scale };
}

/**
 * Tableau entier visible (jamais recadré).
 * Taille uniforme entre mockups, limitée pour tenir dans la zone du mur.
 */
export function paintingDisplaySize(
  srcW: number,
  srcH: number,
  outputWidth: number,
  frameW: number,
  frameH: number,
  inset = 0.95,
) {
  const inFrame = fitContain(srcW, srcH, frameW * inset, frameH * inset);
  const uniform = uniformPaintingSize(srcW, srcH, outputWidth);

  const uScale = uniform.w / Math.max(srcW, 1);
  const fScale = inFrame.w / Math.max(srcW, 1);
  const scale = Math.min(uScale, fScale);

  return { w: srcW * scale, h: srcH * scale };
}

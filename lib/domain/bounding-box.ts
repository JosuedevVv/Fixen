/**
 * Geometría de recuadros (Spec 03, sección 2).
 * Convierte coordenadas normalizadas [0, 1000] en rectángulos de píxeles.
 */

import type { NormalizedBoundingBox } from "../contracts/diagnosis.contract";

export const NORMALIZED_SCALE = 1000;
export const MIN_NORMALIZED_BOX_SIZE = 20;

export interface PixelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function clampToScale(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(NORMALIZED_SCALE, Math.max(0, value));
}

/** Ordena [min, max] y los expande simétricamente hasta el tamaño mínimo visible. */
function normalizeAxis(a: number, b: number): [number, number] {
  let min = Math.min(clampToScale(a), clampToScale(b));
  let max = Math.max(clampToScale(a), clampToScale(b));

  const missing = MIN_NORMALIZED_BOX_SIZE - (max - min);
  if (missing > 0) {
    min -= missing / 2;
    max += missing / 2;
    if (min < 0) {
      max -= min;
      min = 0;
    }
    if (max > NORMALIZED_SCALE) {
      min -= max - NORMALIZED_SCALE;
      max = NORMALIZED_SCALE;
    }
  }
  return [min, max];
}

/** Aplica clamping, corrige inversiones y garantiza un tamaño mínimo visible. */
export function sanitizeNormalizedBox(
  box: NormalizedBoundingBox,
): NormalizedBoundingBox {
  const [ymin, ymax] = normalizeAxis(box.ymin, box.ymax);
  const [xmin, xmax] = normalizeAxis(box.xmin, box.xmax);
  return { ymin, xmin, ymax, xmax };
}

/** Convierte un recuadro normalizado a píxeles de la imagen nativa. */
export function toPixelRect(
  box: NormalizedBoundingBox,
  naturalWidth: number,
  naturalHeight: number,
): PixelRect {
  const safe = sanitizeNormalizedBox(box);
  return {
    x: (safe.xmin / NORMALIZED_SCALE) * naturalWidth,
    y: (safe.ymin / NORMALIZED_SCALE) * naturalHeight,
    width: ((safe.xmax - safe.xmin) / NORMALIZED_SCALE) * naturalWidth,
    height: ((safe.ymax - safe.ymin) / NORMALIZED_SCALE) * naturalHeight,
  };
}

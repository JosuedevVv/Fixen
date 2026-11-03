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

/**
 * Sanea UN eje (X o Y) de un recuadro: devuelve [min, max] ordenado, dentro de
 * [0, 1000] y con al menos `MIN_NORMALIZED_BOX_SIZE` de longitud.
 *
 * Pasos:
 * 1. Clamping y orden: tolera valores fuera de rango, NaN y ejes invertidos.
 * 2. Si el tramo es más corto que el mínimo, se expande a partes iguales
 *    hacia ambos lados (el centro del recuadro se conserva).
 * 3. Si al expandir se sale del rango, se DESPLAZA el tramo (no se recorta)
 *    para mantener el tamaño mínimo. Ej.: [995, 995] -> [980, 1000].
 */
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

/**
 * Deja un recuadro del modelo en un estado seguro para dibujar:
 * valores dentro de [0, 1000], ejes ordenados y tamaño mínimo visible.
 * No muta la entrada. Es idempotente: sanear dos veces da el mismo resultado.
 */
export function sanitizeNormalizedBox(
  box: NormalizedBoundingBox,
): NormalizedBoundingBox {
  const [ymin, ymax] = normalizeAxis(box.ymin, box.ymax);
  const [xmin, xmax] = normalizeAxis(box.xmin, box.xmax);
  return { ymin, xmin, ymax, xmax };
}

/**
 * Convierte un recuadro normalizado [0, 1000] a píxeles de la imagen nativa.
 * Sanea primero, así que es seguro llamarla con la salida cruda del modelo.
 *
 * x = xmin/1000 * naturalWidth     width  = (xmax-xmin)/1000 * naturalWidth
 * y = ymin/1000 * naturalHeight    height = (ymax-ymin)/1000 * naturalHeight
 *
 * @param naturalWidth  Ancho real de la imagen (no el mostrado en pantalla).
 * @param naturalHeight Alto real de la imagen (no el mostrado en pantalla).
 */
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

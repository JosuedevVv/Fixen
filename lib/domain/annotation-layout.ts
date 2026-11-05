/**
 * Cálculos de layout de las anotaciones (Spec 03, sección 3).
 * Funciones puras: no usan canvas, así que se pueden probar sin navegador.
 */

import type { FaultAnnotation } from "../contracts/diagnosis.contract";
import type { PixelRect } from "./bounding-box";

export const MIN_STROKE_WIDTH_PX = 3;
export const STROKE_WIDTH_RATIO = 0.004;
export const MIN_FONT_SIZE_PX = 14;
export const FONT_SIZE_RATIO = 0.018;
export const MAX_LABEL_CHARS = 45;
const LABEL_VERTICAL_PADDING_RATIO = 0.5;
const LABEL_GAP_PX = 2;

export type LabelPlacement = "above" | "below" | "inside";

export interface LabelPosition {
  x: number;
  y: number;
  placement: LabelPlacement;
}

function largestSide(width: number, height: number): number {
  return Math.max(width, height);
}

/**
 * Grosor de línea proporcional a la resolución de la imagen.
 * Una línea fija de 3 px sería casi invisible en una foto de 4000 px; por eso
 * se escala con el lado mayor, con un mínimo de 3 px para fotos pequeñas.
 */
export function computeStrokeWidth(width: number, height: number): number {
  return Math.max(
    MIN_STROKE_WIDTH_PX,
    Math.round(largestSide(width, height) * STROKE_WIDTH_RATIO),
  );
}

/**
 * Tamaño de fuente de la etiqueta, proporcional a la resolución por la misma
 * razón que el grosor de línea, con un mínimo de 14 px para que sea legible.
 */
export function computeFontSize(width: number, height: number): number {
  return Math.max(
    MIN_FONT_SIZE_PX,
    Math.round(largestSide(width, height) * FONT_SIZE_RATIO),
  );
}

/** Alto de la pastilla: la fuente más un 50 % de relleno arriba y abajo. */
export function computeLabelHeight(fontSize: number): number {
  return Math.round(fontSize * (1 + LABEL_VERTICAL_PADDING_RATIO * 2));
}

/**
 * Texto de la pastilla: "#1 · Label".
 * Si el label supera 45 caracteres se corta (descontando 1 para la elipsis)
 * y se añade "…" para que la pastilla no tape media imagen.
 */
export function buildLabelText(
  annotation: Pick<FaultAnnotation, "index" | "label">,
): string {
  const label =
    annotation.label.length > MAX_LABEL_CHARS
      ? `${annotation.label.slice(0, MAX_LABEL_CHARS - 1).trimEnd()}…`
      : annotation.label;
  return `#${annotation.index} · ${label}`;
}

/**
 * Decide dónde dibujar la pastilla de un recuadro, probando en este orden:
 * 1. "above":  encima del recuadro (lo habitual), si no se sale por arriba.
 * 2. "below":  debajo del recuadro, si no se sale por abajo.
 * 3. "inside": dentro del borde superior, cuando el recuadro ocupa casi toda
 *              la imagen y no hay espacio fuera.
 *
 * En X la pastilla se alinea con el borde izquierdo del recuadro y se
 * desplaza hacia la izquierda si de otro modo se saldría por la derecha.
 * Devuelve también `placement` para poder probar la decisión sin canvas.
 */
export function computeLabelPosition(
  rect: PixelRect,
  labelWidth: number,
  labelHeight: number,
  imageWidth: number,
  imageHeight: number,
): LabelPosition {
  const x = Math.min(
    Math.max(0, rect.x),
    Math.max(0, imageWidth - labelWidth),
  );

  const aboveY = rect.y - labelHeight - LABEL_GAP_PX;
  if (aboveY >= 0) return { x, y: aboveY, placement: "above" };

  const belowY = rect.y + rect.height + LABEL_GAP_PX;
  if (belowY + labelHeight <= imageHeight) {
    return { x, y: belowY, placement: "below" };
  }

  return { x, y: Math.max(0, rect.y), placement: "inside" };
}

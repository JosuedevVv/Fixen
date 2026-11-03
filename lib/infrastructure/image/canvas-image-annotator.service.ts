/**
 * Pintor de recuadros sobre la imagen (Spec 03, secciones 2 y 3).
 * Implementa ImageAnnotatorPort con HTML5 canvas. SOLO CLIENTE: usa `Image` y `document`.
 */

import type { FaultAnnotation } from "../../contracts/diagnosis.contract";
import type { ImageAnnotatorPort } from "../../ports/image-annotator.port";
import {
  buildLabelText,
  computeFontSize,
  computeLabelHeight,
  computeLabelPosition,
  computeStrokeWidth,
} from "../../domain/annotation-layout";
import { toPixelRect, type PixelRect } from "../../domain/bounding-box";
import { compareBySeverity } from "../../domain/risk-policy";
import {
  ANNOTATION_LABEL_TEXT_COLOR,
  ANNOTATION_OUTLINE_COLOR,
  SEVERITY_PALETTE,
  type SeverityColors,
} from "../../domain/severity-palette";

const OUTPUT_MIME_TYPE = "image/png";
const CORNER_BRACKET_RATIO = 0.25;
const LABEL_HORIZONTAL_PADDING_RATIO = 0.6;
const LABEL_FONT_FAMILY = 'ui-monospace, "Geist Mono", Menlo, monospace';

/**
 * Decodifica una imagen a partir de un Data URL o URL.
 * Se espera a `onload` porque `naturalWidth/naturalHeight` solo son válidos
 * una vez decodificada; antes valen 0.
 *
 * @throws Error si el navegador no puede decodificar la fuente.
 */
function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo cargar la imagen."));
    image.src = source;
  });
}

/**
 * Crea un canvas fuera del DOM con el tamaño EXACTO de la imagen original.
 * Trabajar a resolución nativa (1:1) evita pérdida de nitidez: los recuadros
 * se queman en los píxeles reales, no en una versión escalada.
 *
 * @throws Error si el navegador no soporta Canvas 2D.
 */
function createContext(width: number, height: number): CanvasRenderingContext2D {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (context === null) throw new Error("Canvas 2D no está disponible.");
  return context;
}

/** Pinta el relleno translúcido que resalta la zona de la falla sin ocultarla. */
function drawBoxFill(
  context: CanvasRenderingContext2D,
  rect: PixelRect,
  colors: SeverityColors,
): void {
  context.fillStyle = colors.fill;
  context.fillRect(rect.x, rect.y, rect.width, rect.height);
}

/**
 * Dibuja el borde del recuadro en dos pasadas:
 * 1. Contorno oscuro 2 px más grueso (aporta contraste sobre fondos claros).
 * 2. Trazo del color de severidad encima.
 * Así el recuadro se lee igual sobre una pared blanca que sobre una tubería oscura.
 */
function drawBoxStroke(
  context: CanvasRenderingContext2D,
  rect: PixelRect,
  colors: SeverityColors,
  lineWidth: number,
): void {
  context.strokeStyle = ANNOTATION_OUTLINE_COLOR;
  context.lineWidth = lineWidth + 2;
  context.strokeRect(rect.x, rect.y, rect.width, rect.height);

  context.strokeStyle = colors.stroke;
  context.lineWidth = lineWidth;
  context.strokeRect(rect.x, rect.y, rect.width, rect.height);
}

/**
 * Refuerza las cuatro esquinas con "corchetes" de trazo doble.
 *
 * Cada esquina se define como [cx, cy, dx, dy]: su posición y la dirección
 * (+1/-1) en la que apuntan sus dos brazos hacia el interior del recuadro.
 * Cada corchete es una polilínea de tres puntos:
 *   brazo horizontal -> vértice -> brazo vertical.
 * La longitud del brazo es el 25 % del lado menor, para que en recuadros
 * pequeños los corchetes no se solapen.
 */
function drawCornerBrackets(
  context: CanvasRenderingContext2D,
  rect: PixelRect,
  colors: SeverityColors,
  lineWidth: number,
): void {
  const length = Math.min(rect.width, rect.height) * CORNER_BRACKET_RATIO;
  const { x, y, width, height } = rect;
  const corners: Array<[number, number, number, number]> = [
    [x, y, 1, 1],
    [x + width, y, -1, 1],
    [x, y + height, 1, -1],
    [x + width, y + height, -1, -1],
  ];

  context.strokeStyle = colors.stroke;
  context.lineWidth = lineWidth * 2;
  context.lineCap = "square";
  for (const [cx, cy, dx, dy] of corners) {
    context.beginPath();
    context.moveTo(cx + dx * length, cy);
    context.lineTo(cx, cy);
    context.lineTo(cx, cy + dy * length);
    context.stroke();
  }
}

/**
 * Dibuja la pastilla "#N · label" asociada a un recuadro.
 *
 * El orden importa: hay que fijar `context.font` ANTES de `measureText`,
 * porque el ancho de la pastilla depende de la fuente. Después se calcula
 * dónde colocarla (ver `computeLabelPosition`), se pinta el fondo del color
 * de severidad y, encima, el texto centrado verticalmente.
 */
function drawLabelPill(
  context: CanvasRenderingContext2D,
  annotation: FaultAnnotation,
  rect: PixelRect,
  colors: SeverityColors,
  imageWidth: number,
  imageHeight: number,
): void {
  const fontSize = computeFontSize(imageWidth, imageHeight);
  const labelHeight = computeLabelHeight(fontSize);
  context.font = `700 ${fontSize}px ${LABEL_FONT_FAMILY}`;

  const text = buildLabelText(annotation);
  const padding = fontSize * LABEL_HORIZONTAL_PADDING_RATIO;
  const labelWidth = context.measureText(text).width + padding * 2;
  const position = computeLabelPosition(
    rect,
    labelWidth,
    labelHeight,
    imageWidth,
    imageHeight,
  );

  context.fillStyle = colors.stroke;
  context.fillRect(position.x, position.y, labelWidth, labelHeight);

  context.fillStyle = ANNOTATION_LABEL_TEXT_COLOR;
  context.textBaseline = "middle";
  context.fillText(text, position.x + padding, position.y + labelHeight / 2);
}

/**
 * Pinta una anotación completa en capas, de abajo hacia arriba:
 * relleno -> borde -> esquinas -> etiqueta.
 * La etiqueta va al final para que ningún trazo la tape.
 */
function drawAnnotation(
  context: CanvasRenderingContext2D,
  annotation: FaultAnnotation,
  imageWidth: number,
  imageHeight: number,
): void {
  const colors = SEVERITY_PALETTE[annotation.severity];
  const rect = toPixelRect(annotation.box, imageWidth, imageHeight);
  const lineWidth = computeStrokeWidth(imageWidth, imageHeight);

  drawBoxFill(context, rect, colors);
  drawBoxStroke(context, rect, colors, lineWidth);
  drawCornerBrackets(context, rect, colors, lineWidth);
  drawLabelPill(context, annotation, rect, colors, imageWidth, imageHeight);
}

/**
 * Implementación de `ImageAnnotatorPort` basada en HTML5 canvas.
 * Solo funciona en el navegador (usa `Image` y `document`).
 */
export class CanvasImageAnnotatorService implements ImageAnnotatorPort {
  /**
   * Devuelve una copia PNG de la imagen con los recuadros pintados.
   * No modifica la imagen original ni el arreglo `annotations`.
   *
   * @param imageSource Data URL (o URL) de la imagen original.
   * @param annotations Hallazgos con coordenadas normalizadas [0, 1000].
   * @returns Data URL `image/png` a la resolución nativa de la imagen.
   */
  async renderAnnotatedImage(
    imageSource: string,
    annotations: FaultAnnotation[],
  ): Promise<string> {
    const image = await loadImage(imageSource);
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    const context = createContext(width, height);

    context.drawImage(image, 0, 0, width, height);

    // HIGH se pinta al final para que quede por encima de las demás.
    const ordered = [...annotations].sort(compareBySeverity);
    for (const annotation of ordered) {
      drawAnnotation(context, annotation, width, height);
    }

    return context.canvas.toDataURL(OUTPUT_MIME_TYPE);
  }
}

/**
 * Pintor de marcadores de alta precisión sobre la fotografía (Spec 03).
 * Implementa el patrón de inversión visual: pines circulares en negro carbón sólido (#0F172A)
 * con número blanco brillante, anillo exterior de luz y pastilla de etiqueta contrastante.
 */

import type { FaultAnnotation } from "../../contracts/diagnosis.contract";
import type { ImageAnnotatorPort } from "../../ports/image-annotator.port";
import {
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
import { loadImage } from "./load-image";

const OUTPUT_MIME_TYPE = "image/png";
const BOX_CORNER_RADIUS_PX = 14;
const LABEL_FONT_FAMILY = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

function createContext(width: number, height: number): CanvasRenderingContext2D {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (context === null) throw new Error("Canvas 2D no está disponible.");
  return context;
}

function drawSubtleRoundedRegion(
  context: CanvasRenderingContext2D,
  rect: PixelRect,
  colors: SeverityColors,
  lineWidth: number,
): void {
  const radius = Math.min(BOX_CORNER_RADIUS_PX, rect.width / 4, rect.height / 4);

  context.save();
  context.beginPath();
  context.roundRect(rect.x, rect.y, rect.width, rect.height, radius);
  context.fillStyle = colors.fill;
  context.fill();

  context.strokeStyle = ANNOTATION_OUTLINE_COLOR;
  context.lineWidth = lineWidth + 2;
  context.stroke();

  context.strokeStyle = colors.stroke;
  context.lineWidth = lineWidth;
  context.stroke();
  context.restore();
}

function drawNumberedPinAndLabel(
  context: CanvasRenderingContext2D,
  annotation: FaultAnnotation,
  rect: PixelRect,
  colors: SeverityColors,
  imageWidth: number,
  imageHeight: number,
): void {
  const fontSize = computeFontSize(imageWidth, imageHeight);
  const pillHeight = computeLabelHeight(fontSize);
  const pinRadius = Math.round(pillHeight * 0.54);

  context.save();
  context.font = `600 ${fontSize}px ${LABEL_FONT_FAMILY}`;

  const labelText = annotation.label.slice(0, 42);
  const textWidth = context.measureText(labelText).width;
  const totalWidth = pinRadius * 2 + textWidth + fontSize * 1.3;

  const position = computeLabelPosition(
    rect,
    totalWidth,
    pillHeight,
    imageWidth,
    imageHeight,
  );

  // Pastilla en negro carbón sólido (#0F172A) con texto blanco brillante
  const pillX = position.x + pinRadius;
  const pillY = position.y;
  const pillWidth = totalWidth - pinRadius;

  context.beginPath();
  context.roundRect(pillX, pillY, pillWidth, pillHeight, pillHeight / 2);
  context.fillStyle = "#0F172A";
  context.fill();
  context.strokeStyle = "rgba(255, 255, 255, 0.85)";
  context.lineWidth = 2;
  context.stroke();

  context.fillStyle = "#FFFFFF";
  context.textBaseline = "middle";
  context.fillText(
    labelText,
    pillX + pinRadius + fontSize * 0.45,
    pillY + pillHeight / 2,
  );

  // Pin circular con anillo exterior de luz
  const pinCenterX = position.x + pinRadius;
  const pinCenterY = position.y + pillHeight / 2;

  context.beginPath();
  context.arc(pinCenterX, pinCenterY, pinRadius + 3, 0, Math.PI * 2);
  context.fillStyle = "rgba(255, 255, 255, 0.35)";
  context.fill();

  context.beginPath();
  context.arc(pinCenterX, pinCenterY, pinRadius, 0, Math.PI * 2);
  context.fillStyle = colors.stroke;
  context.fill();
  context.strokeStyle = "#FFFFFF";
  context.lineWidth = 2.5;
  context.stroke();

  context.fillStyle = ANNOTATION_LABEL_TEXT_COLOR;
  context.font = `700 ${fontSize}px ${LABEL_FONT_FAMILY}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(String(annotation.index), pinCenterX, pinCenterY);
  context.restore();
}

function drawAnnotation(
  context: CanvasRenderingContext2D,
  annotation: FaultAnnotation,
  imageWidth: number,
  imageHeight: number,
): void {
  const colors = SEVERITY_PALETTE[annotation.severity];
  const rect = toPixelRect(annotation.box, imageWidth, imageHeight);
  const lineWidth = Math.max(2, computeStrokeWidth(imageWidth, imageHeight) - 1);

  drawSubtleRoundedRegion(context, rect, colors, lineWidth);
  drawNumberedPinAndLabel(context, annotation, rect, colors, imageWidth, imageHeight);
}

export class CanvasImageAnnotatorService implements ImageAnnotatorPort {
  async renderAnnotatedImage(
    imageSource: string,
    annotations: FaultAnnotation[],
  ): Promise<string> {
    const image = await loadImage(imageSource);
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    const context = createContext(width, height);

    context.drawImage(image, 0, 0, width, height);

    const ordered = [...annotations].sort(compareBySeverity);
    for (const annotation of ordered) {
      drawAnnotation(context, annotation, width, height);
    }

    return context.canvas.toDataURL(OUTPUT_MIME_TYPE);
  }
}

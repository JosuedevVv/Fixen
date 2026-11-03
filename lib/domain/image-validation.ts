/**
 * Validación de imágenes de entrada (Spec 03, sección 1).
 * Funciones puras sobre metadatos: no leen archivos ni tocan el DOM.
 */

import type { SupportedImageMimeType } from "../contracts/diagnosis.contract";

export const SUPPORTED_IMAGE_MIME_TYPES: readonly SupportedImageMimeType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const MIN_IMAGE_DIMENSION_PX = 120;

export type ImageValidationResult =
  | { valid: true }
  | { valid: false; reason: string };

const VALID: ImageValidationResult = { valid: true };

export function isSupportedImageMimeType(
  mimeType: string,
): mimeType is SupportedImageMimeType {
  return (SUPPORTED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}

/** Valida formato y peso antes de leer el archivo. */
export function validateImageFile(file: {
  type: string;
  size: number;
}): ImageValidationResult {
  if (!isSupportedImageMimeType(file.type)) {
    return { valid: false, reason: "Formato no soportado. Usa JPG, PNG o WEBP." };
  }
  if (file.size <= 0) {
    return { valid: false, reason: "El archivo está vacío." };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, reason: "La imagen supera el máximo de 10 MB." };
  }
  return VALID;
}

/** Valida que la imagen decodificada tenga detalle suficiente para analizarse. */
export function validateImageDimensions(
  width: number,
  height: number,
): ImageValidationResult {
  if (width < MIN_IMAGE_DIMENSION_PX || height < MIN_IMAGE_DIMENSION_PX) {
    return {
      valid: false,
      reason: `La imagen debe medir al menos ${MIN_IMAGE_DIMENSION_PX}×${MIN_IMAGE_DIMENSION_PX} px.`,
    };
  }
  return VALID;
}

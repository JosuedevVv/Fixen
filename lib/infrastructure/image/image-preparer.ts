/**
 * Prepara la foto del usuario antes de enviarla (Spec 03, sección 1).
 * Valida dimensiones, reduce el lado mayor y recodifica a JPEG. SOLO CLIENTE.
 *
 * Reducir la foto abarata el análisis (menos bytes y tokens) y mantiene el historial
 * dentro de la cuota de localStorage. Los recuadros se pintan sobre ESTA imagen, así que
 * la precisión 1:1 se conserva respecto a lo que ve el modelo.
 */

import type { SupportedImageMimeType } from "../../contracts/diagnosis.contract";
import { validateImageDimensions } from "../../domain/image-validation";
import { loadImage } from "./load-image";

export const MAX_UPLOAD_SIDE_PX = 1600;
export const UPLOAD_JPEG_QUALITY = 0.85;
const UPLOAD_MIME_TYPE: SupportedImageMimeType = "image/jpeg";

export interface PreparedImage {
  /** Data URL completo, para previsualizar y para el historial. */
  dataUrl: string;
  /** Base64 sin prefijo `data:`, listo para el endpoint. */
  base64: string;
  mimeType: SupportedImageMimeType;
  width: number;
  height: number;
}

/** Error con mensaje apto para mostrarse tal cual al usuario. */
export class ImagePreparationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImagePreparationError";
  }
}

/**
 * Lee el archivo, valida que tenga detalle suficiente y lo devuelve reducido en JPEG.
 * Las transparencias (PNG/WEBP) se rellenan de blanco porque JPEG no las soporta.
 * La orientación EXIF la aplica el navegador al dibujar.
 *
 * @throws ImagePreparationError si no se puede leer o es demasiado pequeña.
 */
export async function prepareImageForUpload(file: File): Promise<PreparedImage> {
  const objectUrl = URL.createObjectURL(file);
  try {
    let image: HTMLImageElement;
    try {
      image = await loadImage(objectUrl);
    } catch {
      throw new ImagePreparationError("No se pudo leer la imagen. Prueba con otra foto.");
    }

    const dimensions = validateImageDimensions(image.naturalWidth, image.naturalHeight);
    if (!dimensions.valid) throw new ImagePreparationError(dimensions.reason);

    const scale = Math.min(1, MAX_UPLOAD_SIDE_PX / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.round(image.naturalWidth * scale);
    const height = Math.round(image.naturalHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (context === null) throw new ImagePreparationError("Tu navegador no puede procesar imágenes.");

    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    const dataUrl = canvas.toDataURL(UPLOAD_MIME_TYPE, UPLOAD_JPEG_QUALITY);
    return {
      dataUrl,
      base64: dataUrl.slice(dataUrl.indexOf(",") + 1),
      mimeType: UPLOAD_MIME_TYPE,
      width,
      height,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

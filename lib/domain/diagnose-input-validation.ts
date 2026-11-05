/**
 * Validación de la petición de diagnóstico (Spec 01, DiagnoseIssueInputDTO).
 * Función pura: recibe `unknown` (JSON sin confiar) y devuelve un DTO tipado o un motivo de rechazo.
 */

import type {
  ConversationTurn,
  DiagnoseIssueInputDTO,
} from "../contracts/diagnosis.contract";
import {
  MAX_IMAGE_SIZE_BYTES,
  isSupportedImageMimeType,
} from "./image-validation";

export const MAX_USER_MESSAGE_CHARS = 2000;
export const MAX_HISTORY_TURNS = 10;
export const DEFAULT_USER_MESSAGE = "Analiza esta imagen y dime qué problema ves.";

const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

export type DiagnoseInputValidation =
  | { valid: true; input: DiagnoseIssueInputDTO }
  | { valid: false; reason: string };

function reject(reason: string): DiagnoseInputValidation {
  return { valid: false, reason };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Bytes que ocuparía una cadena Base64 ya decodificada (cada 4 caracteres = 3 bytes, menos el relleno). */
function estimateDecodedBytes(base64: string): number {
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

/** Descarta turnos mal formados y conserva solo los más recientes. */
function sanitizeHistory(value: unknown): ConversationTurn[] {
  if (!Array.isArray(value)) return [];
  const turns: ConversationTurn[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const { role, content } = item;
    if ((role === "user" || role === "assistant") && typeof content === "string") {
      turns.push({ role, content: content.slice(0, MAX_USER_MESSAGE_CHARS) });
    }
  }
  return turns.slice(-MAX_HISTORY_TURNS);
}

/**
 * Valida y normaliza el cuerpo de la petición.
 * - El mensaje puede venir vacío (se sustituye por un texto por defecto), pero no exceder el máximo.
 * - La imagen debe ser Base64 puro (sin prefijo `data:`) y no superar el peso máximo ya decodificada.
 */
export function validateDiagnoseInput(body: unknown): DiagnoseInputValidation {
  if (!isRecord(body)) return reject("El cuerpo de la petición no es válido.");

  const { userMessage, imageBase64, mimeType, conversationHistory } = body;

  if (userMessage !== undefined && typeof userMessage !== "string") {
    return reject("El mensaje debe ser texto.");
  }
  const trimmedMessage = (userMessage ?? "").trim();
  if (trimmedMessage.length > MAX_USER_MESSAGE_CHARS) {
    return reject(`El mensaje supera los ${MAX_USER_MESSAGE_CHARS} caracteres.`);
  }

  if (typeof mimeType !== "string" || !isSupportedImageMimeType(mimeType)) {
    return reject("Formato de imagen no soportado. Usa JPG, PNG o WEBP.");
  }

  if (typeof imageBase64 !== "string" || imageBase64.length === 0) {
    return reject("Falta la imagen.");
  }
  if (!BASE64_PATTERN.test(imageBase64)) {
    return reject("La imagen debe enviarse en Base64 sin el prefijo data:.");
  }
  if (estimateDecodedBytes(imageBase64) > MAX_IMAGE_SIZE_BYTES) {
    return reject("La imagen supera el máximo de 10 MB.");
  }

  return {
    valid: true,
    input: {
      userMessage: trimmedMessage || DEFAULT_USER_MESSAGE,
      imageBase64,
      mimeType,
      conversationHistory: sanitizeHistory(conversationHistory),
    },
  };
}

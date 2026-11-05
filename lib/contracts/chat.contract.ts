/**
 * Contrato de los mensajes del chat persistidos en el historial (Spec 01, ChatRepositoryPort).
 */

import type { DiagnosisResultDTO, VisionEngine } from "./diagnosis.contract";

export interface UserChatMessage {
  id: string;
  role: "user";
  createdAt: string;
  text: string;
  /** Data URL de la imagen original adjunta (reducida en cliente). */
  imageDataUrl: string | null;
}

export interface AssistantChatMessage {
  id: string;
  role: "assistant";
  createdAt: string;
  diagnosis: DiagnosisResultDTO;
  /** Data URL de la imagen original analizada para permitir alternar Original / Anotada. */
  originalImageDataUrl: string | null;
  /** Data URL de la imagen con recuadros pintados por CanvasImageAnnotatorService. */
  annotatedImageDataUrl: string | null;
  /** Motor utilizado para el diagnóstico ("gemini" o "mock"). */
  engine?: VisionEngine;
}

export type ChatMessage = UserChatMessage | AssistantChatMessage;

/**
 * Contrato de los mensajes del chat persistidos en el historial (Spec 01, ChatRepositoryPort).
 */

import type { DiagnosisResultDTO } from "./diagnosis.contract";

export interface UserChatMessage {
  id: string;
  role: "user";
  createdAt: string;
  text: string;
  /** Data URL de la imagen original adjunta, si existe. */
  imageDataUrl: string | null;
}

export interface AssistantChatMessage {
  id: string;
  role: "assistant";
  createdAt: string;
  diagnosis: DiagnosisResultDTO;
  /** Data URL de la imagen con recuadros pintados. */
  annotatedImageDataUrl: string | null;
}

export type ChatMessage = UserChatMessage | AssistantChatMessage;

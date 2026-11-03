/**
 * Persistencia del historial en localStorage (Incremento 1).
 * SOLO CLIENTE. Esquema versionado y tolerante a datos corruptos.
 */

import type { ChatMessage } from "../../contracts/chat.contract";
import type { ChatRepositoryPort } from "../../ports/chat-repository.port";

export const CHAT_STORAGE_KEY = "fixen:chat-history:v1";

interface StoredHistory {
  version: 1;
  messages: ChatMessage[];
}

function isStoredHistory(value: unknown): value is StoredHistory {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<StoredHistory>;
  return candidate.version === 1 && Array.isArray(candidate.messages);
}

export class LocalStorageChatRepository implements ChatRepositoryPort {
  loadMessages(): ChatMessage[] {
    try {
      const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
      if (raw === null) return [];
      const parsed: unknown = JSON.parse(raw);
      return isStoredHistory(parsed) ? parsed.messages : [];
    } catch {
      return [];
    }
  }

  saveMessages(messages: ChatMessage[]): void {
    const payload: StoredHistory = { version: 1, messages };
    try {
      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Cuota excedida o almacenamiento bloqueado: el chat sigue funcionando en memoria.
    }
  }

  clearHistory(): void {
    try {
      window.localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {
      // Sin acceso a localStorage: no hay nada que limpiar.
    }
  }
}

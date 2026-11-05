/**
 * Persistencia del historial en localStorage (Incremento 1).
 * SOLO CLIENTE. Cumple `client-localstorage-schema` y `js-cache-storage` de
 * `vercel-react-best-practices`: esquema versionado, caché en memoria y degradación
 * elegante si se supera la cuota de almacenamiento del navegador (~5 MB).
 */

import type { ChatMessage } from "../../contracts/chat.contract";
import type { ChatRepositoryPort } from "../../ports/chat-repository.port";

export const CHAT_STORAGE_KEY = "fixen:chat-history:v1";
const MAX_PERSISTED_MESSAGES = 12;

interface StoredHistory {
  version: 1;
  messages: ChatMessage[];
}

function isStoredHistory(value: unknown): value is StoredHistory {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<StoredHistory>;
  return candidate.version === 1 && Array.isArray(candidate.messages);
}

/**
 * Si la cuota de localStorage se llena por acumular varias imágenes PNG en Base64,
 * conserva los datos estructurados del diagnóstico y solo mantiene las imágenes del
 * turno más reciente.
 */
function compactMessagesForQuota(messages: ChatMessage[]): ChatMessage[] {
  const recent = messages.slice(-MAX_PERSISTED_MESSAGES);
  const lastAssistantIndex = recent.findLastIndex((m) => m.role === "assistant");

  return recent.map((message, idx) => {
    if (message.role === "assistant" && idx !== lastAssistantIndex) {
      return {
        ...message,
        annotatedImageDataUrl: null,
        originalImageDataUrl: null,
      };
    }
    if (message.role === "user" && idx < recent.length - 2) {
      return {
        ...message,
        imageDataUrl: null,
      };
    }
    return message;
  });
}

export class LocalStorageChatRepository implements ChatRepositoryPort {
  private memoryCache: ChatMessage[] | null = null;

  /**
   * Lee los mensajes desde la caché en memoria o desde `localStorage`.
   * Devuelve `[]` si aún no hay historial o si el JSON fue alterado.
   */
  loadMessages(): ChatMessage[] {
    if (this.memoryCache !== null) return this.memoryCache;
    if (typeof window === "undefined") return [];

    try {
      const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
      if (raw === null) {
        this.memoryCache = [];
        return [];
      }
      const parsed: unknown = JSON.parse(raw);
      const loaded = isStoredHistory(parsed) ? parsed.messages : [];
      this.memoryCache = loaded;
      return loaded;
    } catch {
      this.memoryCache = [];
      return [];
    }
  }

  /**
   * Sincroniza la caché en memoria y persiste en `localStorage`.
   * Si el navegador lanza `QuotaExceededError`, reintenta con `compactMessagesForQuota`.
   */
  saveMessages(messages: ChatMessage[]): void {
    const trimmed = messages.slice(-MAX_PERSISTED_MESSAGES);
    this.memoryCache = trimmed;
    if (typeof window === "undefined") return;

    try {
      const payload: StoredHistory = { version: 1, messages: trimmed };
      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      try {
        const compactPayload: StoredHistory = {
          version: 1,
          messages: compactMessagesForQuota(trimmed),
        };
        window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(compactPayload));
      } catch {
        // Almacenamiento bloqueado por el navegador: continúa en memoria.
      }
    }
  }

  clearHistory(): void {
    this.memoryCache = [];
    if (typeof window === "undefined") return;

    try {
      window.localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {
      // Sin acceso a localStorage: la caché en memoria ya quedó limpia.
    }
  }
}

import type { ChatMessage } from "../contracts/chat.contract";

/** Puerto de persistencia del historial (Incremento 1: localStorage). */
export interface ChatRepositoryPort {
  loadMessages(): ChatMessage[];
  saveMessages(messages: ChatMessage[]): void;
  clearHistory(): void;
}

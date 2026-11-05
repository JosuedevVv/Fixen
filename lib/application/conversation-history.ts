/**
 * Convierte el historial del chat en el contexto conversacional que recibe el modelo.
 * Función pura. El modelo exige turnos que empiecen con el usuario y no repitan rol,
 * así que aquí se normaliza el historial para cumplirlo siempre.
 */

import type { ChatMessage } from "../contracts/chat.contract";
import type { ConversationTurn } from "../contracts/diagnosis.contract";

export const MAX_HISTORY_MESSAGES = 6;
const IMAGE_ONLY_PLACEHOLDER = "(El usuario envió solo una foto.)";

function toTurn(message: ChatMessage): ConversationTurn {
  if (message.role === "user") {
    return { role: "user", content: message.text.trim() || IMAGE_ONLY_PLACEHOLDER };
  }
  const { issueTitle, summary, riskLevel } = message.diagnosis;
  return { role: "assistant", content: `${issueTitle}. ${summary} (Riesgo: ${riskLevel})` };
}

/** Une turnos consecutivos del mismo rol (p. ej. un envío que falló y se repitió). */
function mergeConsecutiveRoles(turns: ConversationTurn[]): ConversationTurn[] {
  const merged: ConversationTurn[] = [];
  for (const turn of turns) {
    const last = merged[merged.length - 1];
    if (last !== undefined && last.role === turn.role) {
      merged[merged.length - 1] = { role: last.role, content: `${last.content}\n${turn.content}` };
    } else {
      merged.push(turn);
    }
  }
  return merged;
}

/**
 * Toma los mensajes más recientes y devuelve turnos que:
 * 1. empiezan con el usuario (se descartan asistentes iniciales),
 * 2. alternan roles (se fusionan repetidos),
 * 3. terminan con el asistente (se descartan preguntas sin respuesta, porque
 *    el mensaje actual es el siguiente turno del usuario).
 */
export function buildConversationHistory(messages: ChatMessage[]): ConversationTurn[] {
  const turns = mergeConsecutiveRoles(messages.slice(-MAX_HISTORY_MESSAGES).map(toTurn));
  while (turns.length > 0 && turns[0].role === "assistant") turns.shift();
  while (turns.length > 0 && turns[turns.length - 1].role === "user") turns.pop();
  return turns;
}

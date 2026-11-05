/**
 * Adaptador de Gemini para `VisionAnalyzerPort`.
 * Solo se encarga de hablar con el modelo; la interpretación de la respuesta
 * la hace `parseModelDiagnosis` y la seguridad el guardrail.
 */

import { GoogleGenAI, type Content } from "@google/genai";
import type {
  ConversationTurn,
  DiagnoseIssueInputDTO,
  DiagnosisResultDTO,
} from "../../contracts/diagnosis.contract";
import type { VisionAnalyzerPort } from "../../ports/vision-analyzer.port";
import { VisionAnalysisError } from "../../application/diagnosis-errors";
import { DIAGNOSIS_RESPONSE_SCHEMA } from "./diagnosis-response-schema";
import { parseModelDiagnosis } from "./diagnosis-response-parser";
import { DIAGNOSIS_SYSTEM_PROMPT } from "./system-prompts";

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
/** Temperatura baja: se busca consistencia en la clasificación de riesgo, no creatividad. */
const GENERATION_TEMPERATURE = 0.2;

interface GeminiVisionAnalyzerOptions {
  apiKey: string;
  model?: string;
}

/** Convierte el historial a turnos de Gemini (el rol del asistente se llama "model"). */
function buildHistoryContents(history: ConversationTurn[] = []): Content[] {
  return history.map((turn) => ({
    role: turn.role === "assistant" ? "model" : "user",
    parts: [{ text: turn.content }],
  }));
}

/** Añade al mensaje el contexto del RAG (vacío en el Incremento 1). */
function buildUserText(userMessage: string, ragContext: string[]): string {
  if (ragContext.length === 0) return userMessage;
  const references = ragContext.map((chunk, i) => `[${i + 1}] ${chunk}`).join("\n");
  return `${userMessage}\n\nGuías de referencia (úsalas solo si aplican a la imagen):\n${references}`;
}

export class GeminiVisionAnalyzer implements VisionAnalyzerPort {
  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor({ apiKey, model = DEFAULT_GEMINI_MODEL }: GeminiVisionAnalyzerOptions) {
    this.client = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  /**
   * Envía imagen + mensaje al modelo con salida JSON estructurada y devuelve
   * el diagnóstico SIN sanear (todavía no pasó por el guardrail).
   *
   * @throws VisionAnalysisError si la llamada falla o la respuesta está vacía o corrupta.
   */
  async analyzeHomeIssue(
    input: DiagnoseIssueInputDTO,
    ragContext: string[] = [],
  ): Promise<DiagnosisResultDTO> {
    const currentTurn: Content = {
      role: "user",
      parts: [
        { inlineData: { mimeType: input.mimeType, data: input.imageBase64 } },
        { text: buildUserText(input.userMessage, ragContext) },
      ],
    };

    let responseText: string | undefined;
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: [...buildHistoryContents(input.conversationHistory), currentTurn],
        config: {
          systemInstruction: DIAGNOSIS_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseJsonSchema: DIAGNOSIS_RESPONSE_SCHEMA,
          temperature: GENERATION_TEMPERATURE,
        },
      });
      responseText = response.text;
    } catch (cause) {
      throw new VisionAnalysisError("No se pudo contactar al modelo de visión.", { cause });
    }

    if (!responseText) {
      throw new VisionAnalysisError("El modelo no devolvió contenido (posible bloqueo de seguridad).");
    }

    return parseModelDiagnosis(responseText, {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    });
  }
}

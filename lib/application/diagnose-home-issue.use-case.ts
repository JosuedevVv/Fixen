/**
 * Caso de uso principal: diagnosticar un problema del hogar a partir de imagen + mensaje.
 * Orquesta puertos y dominio; no conoce Gemini, Next.js ni el navegador.
 * El pintado de recuadros ocurre después, en el cliente (ver Spec 03).
 */

import type {
  DiagnosisResultDTO,
} from "../contracts/diagnosis.contract";
import { validateDiagnoseInput } from "../domain/diagnose-input-validation";
import { enforceHighRiskSafetyGuardrail } from "../domain/safety-guardrail";
import type { KnowledgeRetrieverPort } from "../ports/knowledge-retriever.port";
import type { VisionAnalyzerPort } from "../ports/vision-analyzer.port";
import { DiagnosisInputError } from "./diagnosis-errors";

interface DiagnoseHomeIssueDependencies {
  visionAnalyzer: VisionAnalyzerPort;
  knowledgeRetriever: KnowledgeRetrieverPort;
}

export class DiagnoseHomeIssueUseCase {
  private readonly visionAnalyzer: VisionAnalyzerPort;
  private readonly knowledgeRetriever: KnowledgeRetrieverPort;

  constructor({ visionAnalyzer, knowledgeRetriever }: DiagnoseHomeIssueDependencies) {
    this.visionAnalyzer = visionAnalyzer;
    this.knowledgeRetriever = knowledgeRetriever;
  }

  /**
   * Flujo: validar entrada -> buscar contexto (RAG) -> analizar con el modelo -> guardrail.
   * Lo que devuelve ya es seguro de mostrar: nunca incluye plan de reparación en riesgo HIGH.
   *
   * @param body Cuerpo sin validar de la petición.
   * @throws DiagnosisInputError si la entrada no es válida.
   * @throws VisionAnalysisError si el modelo falla.
   */
  async execute(body: unknown): Promise<DiagnosisResultDTO> {
    const validation = validateDiagnoseInput(body);
    if (!validation.valid) throw new DiagnosisInputError(validation.reason);

    const { input } = validation;
    const ragContext = await this.retrieveContextSafely(input.userMessage);
    const rawDiagnosis = await this.visionAnalyzer.analyzeHomeIssue(input, ragContext);

    return enforceHighRiskSafetyGuardrail(rawDiagnosis, input.userMessage);
  }

  /** El contexto RAG es opcional: si falla, se diagnostica sin él en vez de abortar. */
  private async retrieveContextSafely(query: string): Promise<string[]> {
    try {
      return await this.knowledgeRetriever.retrieveRelevantGuides(query);
    } catch {
      return [];
    }
  }
}

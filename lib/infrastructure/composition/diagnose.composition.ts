/**
 * Raíz de composición del diagnóstico: único lugar que decide qué implementaciones concretas
 * se conectan a los puertos. Solo servidor (lee variables de entorno).
 *
 * - Con GEMINI_API_KEY  -> GeminiVisionAnalyzer.
 * - Sin GEMINI_API_KEY  -> MockVisionAnalyzer (modo demo, sin costo).
 */

import { DiagnoseHomeIssueUseCase } from "../../application/diagnose-home-issue.use-case";
import type { VisionEngine } from "../../contracts/diagnosis.contract";
import { GeminiVisionAnalyzer } from "../ai/vision-analyzer.adapter";
import { MockVisionAnalyzer } from "../ai/mock-vision-analyzer.adapter";
import { NoopKnowledgeRetriever } from "../rag/noop-retriever.adapter";
import type { VisionAnalyzerPort } from "../../ports/vision-analyzer.port";

export type { VisionEngine };

export interface DiagnoseComposition {
  useCase: DiagnoseHomeIssueUseCase;
  engine: VisionEngine;
}

function createVisionAnalyzer(): { analyzer: VisionAnalyzerPort; engine: VisionEngine } {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return { analyzer: new MockVisionAnalyzer(), engine: "mock" };

  return {
    analyzer: new GeminiVisionAnalyzer({
      apiKey,
      model: process.env.GEMINI_MODEL?.trim() || undefined,
    }),
    engine: "gemini",
  };
}

export function composeDiagnoseHomeIssue(): DiagnoseComposition {
  const { analyzer, engine } = createVisionAnalyzer();
  return {
    engine,
    useCase: new DiagnoseHomeIssueUseCase({
      visionAnalyzer: analyzer,
      knowledgeRetriever: new NoopKnowledgeRetriever(),
    }),
  };
}

/**
 * Recuperador de conocimiento vacío del Incremento 1.
 * Se reemplazará por la implementación RAG en el Incremento 2.
 */

import type { KnowledgeRetrieverPort } from "../../ports/knowledge-retriever.port";

export class NoopKnowledgeRetriever implements KnowledgeRetrieverPort {
  async retrieveRelevantGuides(): Promise<string[]> {
    return [];
  }
}

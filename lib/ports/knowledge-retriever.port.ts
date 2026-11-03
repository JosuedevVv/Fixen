/** Puerto preparado para el RAG del Incremento 2. */
export interface KnowledgeRetrieverPort {
  retrieveRelevantGuides(
    query: string,
    detectedLabels?: string[],
  ): Promise<string[]>;
}

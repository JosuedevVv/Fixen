/**
 * Errores tipados del flujo de diagnóstico.
 * Permiten que la capa de transporte decida el código HTTP sin inspeccionar mensajes.
 */

/** La petición del usuario no es válida (HTTP 400). */
export class DiagnosisInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DiagnosisInputError";
  }
}

/** El modelo falló o devolvió una respuesta inutilizable (HTTP 502). */
export class VisionAnalysisError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "VisionAnalysisError";
  }
}

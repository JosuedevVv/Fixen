/**
 * Cliente HTTP del endpoint de diagnóstico. SOLO CLIENTE.
 * Los componentes y hooks no llaman a `fetch` directamente: pasan por aquí.
 */

import type {
  DiagnoseIssueInputDTO,
  DiagnosisResultDTO,
  VisionEngine,
} from "../../contracts/diagnosis.contract";

export interface DiagnoseResponse {
  diagnosis: DiagnosisResultDTO;
  engine: VisionEngine;
}

/** Error con mensaje apto para mostrarse tal cual al usuario. */
export class DiagnoseRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DiagnoseRequestError";
  }
}

const NETWORK_ERROR_MESSAGE =
  "No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.";
const GENERIC_ERROR_MESSAGE = "No se pudo completar el análisis. Inténtalo de nuevo.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractErrorMessage(data: unknown): string | null {
  return isRecord(data) && typeof data.error === "string" ? data.error : null;
}

function isDiagnoseResponse(data: unknown): data is DiagnoseResponse {
  return (
    isRecord(data) &&
    isRecord(data.diagnosis) &&
    (data.engine === "gemini" || data.engine === "mock")
  );
}

/**
 * Envía imagen + mensaje al servidor.
 *
 * @throws DiagnoseRequestError con un mensaje legible para el usuario.
 */
export async function requestDiagnosis(
  payload: DiagnoseIssueInputDTO,
): Promise<DiagnoseResponse> {
  let response: Response;
  try {
    response = await fetch("/api/diagnose", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new DiagnoseRequestError(NETWORK_ERROR_MESSAGE);
  }

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new DiagnoseRequestError(extractErrorMessage(data) ?? GENERIC_ERROR_MESSAGE);
  }
  if (!isDiagnoseResponse(data)) throw new DiagnoseRequestError(GENERIC_ERROR_MESSAGE);
  return data;
}

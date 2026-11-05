/**
 * Guardrail determinista de seguridad (Spec 02, sección 2).
 * Garantiza que ninguna respuesta de riesgo alto incluya instrucciones de reparación,
 * sin importar lo que haya generado el modelo de IA.
 */

import type {
  DiagnosisResultDTO,
  SafetyLockDirective,
} from "../contracts/diagnosis.contract";
import { resolveRiskLevel } from "./risk-policy";

const DEFAULT_SPECIALIST = "Especialista Técnico Certificado";
const DEFAULT_SKEPTICAL_REASONING =
  "Por seguridad, este problema se considera grave o potencialmente peligroso. " +
  "No se entregan instrucciones de reparación casera: un profesional debe evaluarlo en sitio.";
const ESCALATION_NOTE =
  " [Escalado a riesgo alto por la política de seguridad escéptica.]";

/**
 * Construye el bloqueo definitivo. Si el modelo no indicó especialista o razón
 * (o los dejó en blanco), usa valores por defecto para que la UI nunca muestre
 * un bloqueo vacío. Conserva los consejos de contención que dio el modelo.
 */
function buildBlockedSafetyLock(current: SafetyLockDirective): SafetyLockDirective {
  return {
    isRepairBlocked: true,
    specialistType: current.specialistType?.trim() || DEFAULT_SPECIALIST,
    skepticalReasoning:
      current.skepticalReasoning?.trim() || DEFAULT_SKEPTICAL_REASONING,
    emergencyContainmentAdvice: current.emergencyContainmentAdvice,
  };
}

/**
 * Reúne todo el texto que puede delatar un peligro: lo que escribió el usuario
 * y lo que el modelo dijo (título, resumen y cada etiqueta/descripción).
 * Se revisa también la salida del modelo porque puede notar un peligro que el
 * usuario no mencionó (ej. un enchufe visible en la foto).
 */
function collectTextsToScan(result: DiagnosisResultDTO, userMessage: string): string[] {
  const annotationTexts = result.annotations.flatMap((a) => [a.label, a.description]);
  return [userMessage, result.issueTitle, result.summary, ...annotationTexts];
}

/**
 * Última barrera antes de mostrar un diagnóstico: aplica las invariantes de
 * seguridad sin importar lo que haya generado el modelo.
 *
 * Flujo:
 * 1. Calcula el riesgo final (`resolveRiskLevel`).
 * 2. Bloquea si el riesgo final es HIGH, o si el modelo ya había marcado
 *    `isRepairBlocked` (un LOW con bloqueo es contradictorio; se resuelve
 *    del lado seguro, subiendo a HIGH).
 * 3. Al bloquear: `repairPlan = null`, bloqueo completo y riesgo HIGH.
 *    Las `annotations` se conservan para seguir marcando la zona de peligro.
 *
 * Devuelve una copia; no muta el objeto recibido.
 */
export function enforceHighRiskSafetyGuardrail(
  rawResult: DiagnosisResultDTO,
  userMessage: string,
): DiagnosisResultDTO {
  const resolvedRisk = resolveRiskLevel({
    declaredRisk: rawResult.riskLevel,
    annotations: rawResult.annotations,
    textsToScan: collectTextsToScan(rawResult, userMessage),
  });

  const mustBlock =
    resolvedRisk === "HIGH" || rawResult.safetyLock.isRepairBlocked;

  if (!mustBlock) {
    return {
      ...rawResult,
      riskLevel: resolvedRisk,
      safetyLock: { ...rawResult.safetyLock, isRepairBlocked: false },
    };
  }

  const wasEscalated = rawResult.riskLevel !== "HIGH";

  return {
    ...rawResult,
    riskLevel: "HIGH",
    riskJustification: wasEscalated
      ? rawResult.riskJustification + ESCALATION_NOTE
      : rawResult.riskJustification,
    safetyLock: buildBlockedSafetyLock(rawResult.safetyLock),
    repairPlan: null,
  };
}

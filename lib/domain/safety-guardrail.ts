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

function buildBlockedSafetyLock(current: SafetyLockDirective): SafetyLockDirective {
  return {
    isRepairBlocked: true,
    specialistType: current.specialistType?.trim() || DEFAULT_SPECIALIST,
    skepticalReasoning:
      current.skepticalReasoning?.trim() || DEFAULT_SKEPTICAL_REASONING,
    emergencyContainmentAdvice: current.emergencyContainmentAdvice,
  };
}

function collectTextsToScan(result: DiagnosisResultDTO, userMessage: string): string[] {
  const annotationTexts = result.annotations.flatMap((a) => [a.label, a.description]);
  return [userMessage, result.issueTitle, result.summary, ...annotationTexts];
}

/**
 * Devuelve una copia del diagnóstico con las invariantes de seguridad aplicadas.
 * No muta el objeto recibido.
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

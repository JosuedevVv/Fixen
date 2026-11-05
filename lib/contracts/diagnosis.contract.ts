/**
 * Contratos de dominio del diagnóstico (Spec 01).
 * Archivo de tipos puros: no importa React, Next.js ni SDKs externos.
 */

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type VisionEngine = "gemini" | "mock";

export type SupportedImageMimeType = "image/jpeg" | "image/png" | "image/webp";

/** Coordenadas normalizadas en escala [0, 1000], independientes de la resolución. */
export interface NormalizedBoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface FaultAnnotation {
  /** Identificador legible, ej. "fault-1". */
  id: string;
  /** Número visible pintado sobre el recuadro (1, 2, 3...). */
  index: number;
  /** Título breve de la falla (máx. 45 caracteres). */
  label: string;
  description: string;
  severity: RiskLevel;
  box: NormalizedBoundingBox;
}

export interface RepairStep {
  stepNumber: number;
  title: string;
  instruction: string;
  /** Recuadro relacionado (ej. "fault-1") para resaltarlo en la UI. */
  relatedAnnotationId?: string;
}

export interface RepairPlan {
  estimatedTimeMinutes: number;
  difficultyLabel: "Fácil" | "Moderada";
  toolsRequired: string[];
  materialsRequired: string[];
  safetyPrecautions: string[];
  steps: RepairStep[];
}

export interface SafetyLockDirective {
  /** Siempre true cuando riskLevel === "HIGH". */
  isRepairBlocked: boolean;
  specialistType: string | null;
  skepticalReasoning: string | null;
  /** Acciones pasivas de contención. Nunca instrucciones de reparación. */
  emergencyContainmentAdvice: string[];
}

export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

export interface DiagnoseIssueInputDTO {
  userMessage: string;
  /** Imagen en Base64 sin prefijo `data:`. */
  imageBase64: string;
  mimeType: SupportedImageMimeType;
  conversationHistory?: ConversationTurn[];
}

export interface DiagnosisResultDTO {
  id: string;
  createdAt: string;
  issueTitle: string;
  summary: string;
  riskLevel: RiskLevel;
  riskJustification: string;
  annotations: FaultAnnotation[];
  safetyLock: SafetyLockDirective;
  /**
   * INVARIANTE: debe ser `null` si `riskLevel === "HIGH"`
   * o `safetyLock.isRepairBlocked === true`.
   */
  repairPlan: RepairPlan | null;
}

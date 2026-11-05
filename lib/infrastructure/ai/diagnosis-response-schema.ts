/**
 * JSON Schema de la respuesta del modelo (salida estructurada de Gemini).
 * Es la forma CRUDA del modelo; el parser la convierte en `DiagnosisResultDTO`.
 * Los campos opcionales (repairPlan, specialistType...) se omiten en lugar de usar null,
 * porque es más fiable con salida estructurada.
 */

import {
  MAX_LABEL_LENGTH,
  MAX_MODEL_ANNOTATIONS,
} from "./system-prompts";

const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;

const annotationSchema = {
  type: "object",
  properties: {
    label: { type: "string", maxLength: MAX_LABEL_LENGTH },
    description: { type: "string" },
    severity: { type: "string", enum: RISK_LEVELS },
    box_2d: {
      type: "array",
      items: { type: "integer", minimum: 0, maximum: 1000 },
      minItems: 4,
      maxItems: 4,
    },
  },
  required: ["label", "description", "severity", "box_2d"],
} as const;

const stepSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    instruction: { type: "string" },
    relatedAnnotationIndex: { type: "integer", minimum: 1 },
  },
  required: ["title", "instruction"],
} as const;

const repairPlanSchema = {
  type: "object",
  properties: {
    estimatedTimeMinutes: { type: "integer", minimum: 1 },
    difficultyLabel: { type: "string", enum: ["Fácil", "Moderada"] },
    toolsRequired: { type: "array", items: { type: "string" } },
    materialsRequired: { type: "array", items: { type: "string" } },
    safetyPrecautions: { type: "array", items: { type: "string" } },
    steps: { type: "array", items: stepSchema },
  },
  required: [
    "estimatedTimeMinutes",
    "difficultyLabel",
    "toolsRequired",
    "materialsRequired",
    "safetyPrecautions",
    "steps",
  ],
} as const;

export const DIAGNOSIS_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    issueTitle: { type: "string" },
    summary: { type: "string" },
    riskLevel: { type: "string", enum: RISK_LEVELS },
    riskJustification: { type: "string" },
    annotations: {
      type: "array",
      items: annotationSchema,
      maxItems: MAX_MODEL_ANNOTATIONS,
    },
    safetyLock: {
      type: "object",
      properties: {
        isRepairBlocked: { type: "boolean" },
        specialistType: { type: "string" },
        skepticalReasoning: { type: "string" },
        emergencyContainmentAdvice: { type: "array", items: { type: "string" } },
      },
      required: ["isRepairBlocked", "emergencyContainmentAdvice"],
    },
    repairPlan: repairPlanSchema,
  },
  required: [
    "issueTitle",
    "summary",
    "riskLevel",
    "riskJustification",
    "annotations",
    "safetyLock",
  ],
} as const;

/**
 * Convierte el texto JSON crudo del modelo en un `DiagnosisResultDTO` confiable.
 * El modelo puede devolver campos faltantes o inválidos: este módulo los normaliza
 * SIEMPRE hacia el lado seguro (ante un valor dudoso, severidad/riesgo alto).
 * El parser no aplica el guardrail; eso lo hace el caso de uso después.
 */

import type {
  DiagnosisResultDTO,
  FaultAnnotation,
  RepairPlan,
  RepairStep,
  RiskLevel,
  SafetyLockDirective,
} from "../../contracts/diagnosis.contract";
import { VisionAnalysisError } from "../../application/diagnosis-errors";
import { MAX_LABEL_LENGTH, MAX_MODEL_ANNOTATIONS } from "./system-prompts";

type UnknownRecord = Record<string, unknown>;

export interface DiagnosisMeta {
  id: string;
  createdAt: string;
}

const RISK_LEVELS: readonly RiskLevel[] = ["LOW", "MEDIUM", "HIGH"];
const FALLBACK_ISSUE_TITLE = "Diagnóstico";
const FALLBACK_JUSTIFICATION = "El modelo no justificó el nivel de riesgo.";

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asText(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : fallback;
}

function asTextList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim() !== "");
}

function asRiskLevel(value: unknown): RiskLevel | null {
  return typeof value === "string" && (RISK_LEVELS as readonly string[]).includes(value)
    ? (value as RiskLevel)
    : null;
}

/** Quita las vallas ```json ... ``` si el modelo las añadió pese a pedir JSON. */
function stripCodeFences(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
}

function parseJsonObject(rawText: string): UnknownRecord {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFences(rawText));
  } catch (cause) {
    throw new VisionAnalysisError("El modelo devolvió una respuesta que no es JSON.", { cause });
  }
  if (!isRecord(parsed)) {
    throw new VisionAnalysisError("El modelo devolvió un JSON con formato inesperado.");
  }
  return parsed;
}

/** Valida `[ymin, xmin, ymax, xmax]`: 4 números finitos. Devuelve null si no cumple. */
function parseBox(value: unknown): FaultAnnotation["box"] | null {
  if (!Array.isArray(value) || value.length !== 4) return null;
  if (!value.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
  const [ymin, xmin, ymax, xmax] = value as number[];
  return { ymin, xmin, ymax, xmax };
}

/**
 * Convierte las anotaciones del modelo. Se descartan las que no tienen un recuadro válido,
 * y las restantes se renumeran (`fault-1`, `fault-2`...) para que los índices sean consecutivos.
 * Una severidad inválida se trata como HIGH (postura escéptica).
 */
function parseAnnotations(value: unknown): FaultAnnotation[] {
  if (!Array.isArray(value)) return [];
  const annotations: FaultAnnotation[] = [];

  for (const item of value) {
    if (!isRecord(item)) continue;
    const box = parseBox(item.box_2d);
    if (box === null) continue;

    const index = annotations.length + 1;
    annotations.push({
      id: `fault-${index}`,
      index,
      label: asText(item.label, `Hallazgo ${index}`).slice(0, MAX_LABEL_LENGTH),
      description: asText(item.description),
      severity: asRiskLevel(item.severity) ?? "HIGH",
      box,
    });
    if (annotations.length === MAX_MODEL_ANNOTATIONS) break;
  }
  return annotations;
}

function parseSteps(value: unknown, annotationCount: number): RepairStep[] {
  if (!Array.isArray(value)) return [];
  const steps: RepairStep[] = [];

  for (const item of value) {
    if (!isRecord(item)) continue;
    const instruction = asText(item.instruction);
    if (instruction === "") continue;

    const stepNumber = steps.length + 1;
    const related = item.relatedAnnotationIndex;
    const hasValidLink =
      typeof related === "number" &&
      Number.isInteger(related) &&
      related >= 1 &&
      related <= annotationCount;

    steps.push({
      stepNumber,
      title: asText(item.title, `Paso ${stepNumber}`),
      instruction,
      ...(hasValidLink ? { relatedAnnotationId: `fault-${related}` } : {}),
    });
  }
  return steps;
}

/** Devuelve el plan, o null si falta o no tiene ningún paso utilizable. */
function parseRepairPlan(value: unknown, annotationCount: number): RepairPlan | null {
  if (!isRecord(value)) return null;
  const steps = parseSteps(value.steps, annotationCount);
  if (steps.length === 0) return null;

  const minutes = value.estimatedTimeMinutes;
  return {
    estimatedTimeMinutes:
      typeof minutes === "number" && Number.isFinite(minutes) && minutes > 0
        ? Math.round(minutes)
        : 30,
    difficultyLabel: value.difficultyLabel === "Moderada" ? "Moderada" : "Fácil",
    toolsRequired: asTextList(value.toolsRequired),
    materialsRequired: asTextList(value.materialsRequired),
    safetyPrecautions: asTextList(value.safetyPrecautions),
    steps,
  };
}

function parseSafetyLock(value: unknown): SafetyLockDirective {
  const lock = isRecord(value) ? value : {};
  return {
    isRepairBlocked: lock.isRepairBlocked === true,
    specialistType: asText(lock.specialistType) || null,
    skepticalReasoning: asText(lock.skepticalReasoning) || null,
    emergencyContainmentAdvice: asTextList(lock.emergencyContainmentAdvice),
  };
}

/**
 * Punto de entrada: texto crudo del modelo -> DTO.
 * Un `riskLevel` ausente o inválido se interpreta como HIGH.
 *
 * @throws VisionAnalysisError si el texto no es un objeto JSON.
 */
export function parseModelDiagnosis(
  rawText: string,
  meta: DiagnosisMeta,
): DiagnosisResultDTO {
  const raw = parseJsonObject(rawText);
  const annotations = parseAnnotations(raw.annotations);

  return {
    id: meta.id,
    createdAt: meta.createdAt,
    issueTitle: asText(raw.issueTitle, FALLBACK_ISSUE_TITLE),
    summary: asText(raw.summary),
    riskLevel: asRiskLevel(raw.riskLevel) ?? "HIGH",
    riskJustification: asText(raw.riskJustification, FALLBACK_JUSTIFICATION),
    annotations,
    safetyLock: parseSafetyLock(raw.safetyLock),
    repairPlan: parseRepairPlan(raw.repairPlan, annotations.length),
  };
}

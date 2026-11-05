/**
 * Paleta de marcadores sobre la imagen con el patrón de inversión monocromático (#0F172A)
 * y matiz sutil para riesgo crítico (Spec 03).
 */

import type { RiskLevel } from "../contracts/diagnosis.contract";

export interface SeverityColors {
  stroke: string;
  fill: string;
}

export const SEVERITY_PALETTE: Readonly<Record<RiskLevel, SeverityColors>> = {
  LOW: { stroke: "#0F172A", fill: "rgba(15, 23, 42, 0.08)" },
  MEDIUM: { stroke: "#0F172A", fill: "rgba(15, 23, 42, 0.10)" },
  HIGH: { stroke: "#DC2626", fill: "rgba(220, 38, 38, 0.12)" },
};

export const ANNOTATION_OUTLINE_COLOR = "rgba(255, 255, 255, 0.95)";
export const ANNOTATION_LABEL_TEXT_COLOR = "#FFFFFF";

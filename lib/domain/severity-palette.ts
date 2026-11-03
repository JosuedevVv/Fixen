/**
 * Paleta semántica de severidad para recuadros (Spec 03, sección 3).
 * Fuente única de colores para el canvas y, más adelante, la UI.
 */

import type { RiskLevel } from "../contracts/diagnosis.contract";

export interface SeverityColors {
  stroke: string;
  fill: string;
}

export const SEVERITY_PALETTE: Readonly<Record<RiskLevel, SeverityColors>> = {
  LOW: { stroke: "#10B981", fill: "rgba(16, 185, 129, 0.14)" },
  MEDIUM: { stroke: "#F59E0B", fill: "rgba(245, 158, 11, 0.16)" },
  HIGH: { stroke: "#EF4444", fill: "rgba(239, 68, 68, 0.22)" },
};

export const ANNOTATION_OUTLINE_COLOR = "rgba(9, 13, 22, 0.65)";
export const ANNOTATION_LABEL_TEXT_COLOR = "#0B0F17";

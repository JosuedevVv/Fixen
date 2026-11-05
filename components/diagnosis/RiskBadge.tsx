/**
 * Insignia minimalista monocromática de nivel de riesgo (inspirada en las píldoras de Ref 1 y Ref 2).
 */

import type { RiskLevel } from "@/lib/contracts/diagnosis.contract";
import {
  IconAlertTriangle,
  IconCheckCircle,
  IconShieldLock,
} from "@/components/ui/TechnicalIcons";

interface RiskBadgeConfig {
  label: string;
  containerClass: string;
}

const RISK_BADGE_MAP: Readonly<Record<RiskLevel, RiskBadgeConfig>> = {
  LOW: {
    label: "Riesgo bajo",
    containerClass: "bg-[#F3F4F6] text-[#111111]",
  },
  MEDIUM: {
    label: "Riesgo medio",
    containerClass: "bg-[#F3F4F6] text-[#111111]",
  },
  HIGH: {
    label: "Riesgo crítico",
    containerClass: "bg-[#111111] text-white",
  },
};

interface RiskBadgeProps {
  riskLevel: RiskLevel;
  compact?: boolean;
}

export function RiskBadge({ riskLevel }: RiskBadgeProps) {
  const config = RISK_BADGE_MAP[riskLevel];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-tight ${config.containerClass}`}
    >
      {riskLevel === "HIGH" ? (
        <IconShieldLock className="h-3.5 w-3.5" />
      ) : riskLevel === "MEDIUM" ? (
        <IconAlertTriangle className="h-3.5 w-3.5" />
      ) : (
        <IconCheckCircle className="h-3.5 w-3.5" />
      )}
      <span>{config.label}</span>
    </span>
  );
}

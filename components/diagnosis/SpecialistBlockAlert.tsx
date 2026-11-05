"use client";

/**
 * Bloqueo preventivo en negro carbón sólido (`#111111`) para Riesgo Alto (Spec 02).
 * Incorpora icono directo limpio + chevron `>` e ilustración SVG de tablero de seguridad (`SafetyBreakerIllustration`).
 */

import { useState } from "react";
import type { SafetyLockDirective } from "@/lib/contracts/diagnosis.contract";
import {
  IconChevronRight,
  IconPhoneCall,
  SafetyBreakerIllustration,
} from "@/components/ui/TechnicalIcons";

interface SpecialistBlockAlertProps {
  safetyLock: SafetyLockDirective;
}

export function SpecialistBlockAlert({ safetyLock }: SpecialistBlockAlertProps) {
  const [isOpen, setIsOpen] = useState(false);

  const specialist =
    safetyLock.specialistType ?? "Especialista Técnico Certificado";
  const reasoning =
    safetyLock.skepticalReasoning ??
    "Por seguridad, las instrucciones de reparación casera están bloqueadas para este hallazgo.";

  return (
    <div
      role="alert"
      className="overflow-hidden rounded-[24px] border border-[#111111] bg-[#111111] text-white shadow-md"
    >
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <IconPhoneCall className="h-5 w-5 shrink-0 text-white" />
          <div className="min-w-0">
            <span className="block text-[11px] font-medium text-slate-400">
              Intervención bloqueada por seguridad
            </span>
            <span className="block truncate text-sm font-bold tracking-tight text-white">
              Contactar a: {specialist}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
            {isOpen ? "Ocultar medidas" : "Ver medidas de seguridad"}
          </span>
          <IconChevronRight
            className={`h-5 w-5 text-white transition-transform duration-200 ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        </div>
      </button>

      {isOpen ? (
        <div className="flex flex-col justify-between gap-5 border-t border-white/10 bg-black/40 p-5 sm:flex-row sm:items-center">
          <div className="space-y-3 text-xs text-slate-300">
            <p className="leading-relaxed text-slate-300">{reasoning}</p>

            {safetyLock.emergencyContainmentAdvice.length > 0 ? (
              <ul className="space-y-2 pt-1">
                {safetyLock.emergencyContainmentAdvice.map((advice, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[#111111]">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed text-slate-200">
                      {advice}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <SafetyBreakerIllustration className="h-20 w-36 shrink-0" />
        </div>
      ) : null}
    </div>
  );
}

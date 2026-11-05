"use client";

/**
 * Tarjeta de Respuesta del Chatbot de Escritorio Amplio:
 * - Incluye ilustraciones SVG vectoriales monocromáticas (`ChatbotArchitectureIllustration` y
 *   `RadialDialGaugeIllustration`) directamente en el encabezado del diagnóstico.
 * - Combina el visor fotográfico estilo Ref 1 y la lista de hallazgos estilo Ref 2.
 */

import { useState } from "react";
import type { AssistantChatMessage } from "@/lib/contracts/chat.contract";
import { AnnotatedImageCard } from "@/components/diagnosis/AnnotatedImageCard";
import { RepairGuideCard } from "@/components/diagnosis/RepairGuideCard";
import { RiskBadge } from "@/components/diagnosis/RiskBadge";
import { SpecialistBlockAlert } from "@/components/diagnosis/SpecialistBlockAlert";
import {
  ChatbotArchitectureIllustration,
  RadialDialGaugeIllustration,
} from "@/components/ui/TechnicalIcons";

interface DiagnosisMessageItemProps {
  message: AssistantChatMessage;
}

export function DiagnosisMessageItem({ message }: DiagnosisMessageItemProps) {
  const { diagnosis, originalImageDataUrl, annotatedImageDataUrl } = message;
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(
    () => diagnosis.annotations[0]?.id ?? null,
  );

  const isBlocked =
    diagnosis.riskLevel === "HIGH" || diagnosis.safetyLock.isRepairBlocked;

  return (
    <article className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_12px_36px_rgba(0,0,0,0.04)] sm:p-7">
      {/* Banner superior del Chatbot con Ilustración SVG de Casa Inspeccionada + Dial Radial SVG */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4 min-w-0">
          {/* Ilustración SVG de casa con nodos de inspección dentro del Chatbot */}
          <div className="hidden shrink-0 rounded-2xl bg-[#EFF2F6] px-3 py-2 sm:block">
            <ChatbotArchitectureIllustration className="h-16 w-28" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-medium text-slate-400">
                Reporte de Diagnóstico
              </span>
              <RiskBadge riskLevel={diagnosis.riskLevel} />
            </div>
            <h3 className="mt-1 text-lg font-bold tracking-tight text-[#111111] sm:text-xl">
              {diagnosis.issueTitle}
            </h3>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
              {diagnosis.summary}
            </p>
          </div>
        </div>

        {/* Dial Radial SVG compacto estilo pantalla central de Ref 2 */}
        <div className="hidden shrink-0 items-center gap-3 rounded-2xl bg-[#EFF2F6]/70 px-4 py-2 xl:flex">
          <RadialDialGaugeIllustration
            centerLabel={diagnosis.riskLevel}
            subLabel={`${diagnosis.annotations.length} PINES`}
            className="h-16 w-22"
          />
        </div>
      </div>

      {/* Visor de imagen amplio (Ref 1) + Lista "Hallazgos" con cápsula negra / iconos directos (Ref 2) */}
      <div className="mt-6">
        <AnnotatedImageCard
          diagnosisId={diagnosis.id}
          issueTitle={diagnosis.issueTitle}
          originalImageDataUrl={originalImageDataUrl}
          annotatedImageDataUrl={annotatedImageDataUrl}
          annotations={diagnosis.annotations}
          selectedAnnotationId={selectedAnnotationId}
          onSelectAnnotation={setSelectedAnnotationId}
        />
      </div>

      {/* Fila colapsable estilo "Settings" de Ref 1 con Ilustraciones SVG internas */}
      <div className="mt-5">
        {isBlocked ? (
          <SpecialistBlockAlert safetyLock={diagnosis.safetyLock} />
        ) : diagnosis.repairPlan !== null ? (
          <RepairGuideCard
            plan={diagnosis.repairPlan}
            annotations={diagnosis.annotations}
            selectedAnnotationId={selectedAnnotationId}
            onFocusAnnotation={setSelectedAnnotationId}
          />
        ) : null}
      </div>
    </article>
  );
}

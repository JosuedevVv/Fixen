"use client";

/**
 * Fila interactiva colapsable de instrucciones paso a paso:
 * - Icono negro limpio directo sobre la superficie (sin caja pesada, igual a las filas "Settings" en Ref 1).
 * - Incluye la ilustración vectorial `RepairToolkitIllustration` en el panel desplegado.
 * - Aplica inversión en negro sólido (`#111111`) al paso vinculado con el pin activo.
 */

import { useState } from "react";
import type { FaultAnnotation, RepairPlan } from "@/lib/contracts/diagnosis.contract";
import {
  IconChevronRight,
  IconClock,
  IconWrench,
  RepairToolkitIllustration,
} from "@/components/ui/TechnicalIcons";

interface RepairGuideCardProps {
  plan: RepairPlan;
  annotations: FaultAnnotation[];
  selectedAnnotationId: string | null;
  onFocusAnnotation: (annotationId: string | null) => void;
}

export function RepairGuideCard({
  plan,
  annotations,
  selectedAnnotationId,
  onFocusAnnotation,
}: RepairGuideCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const annotationById = new Map(annotations.map((item) => [item.id, item]));

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white">
      {/* Fila estilo "Settings" de Ref 1: Icono de trazo directo + Texto + Píldora + Chevron `>` */}
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-all duration-150 ${
          isOpen
            ? "bg-[#111111] text-white"
            : "bg-white text-[#111111] hover:bg-[#EFF2F6]"
        }`}
      >
        <div className="flex items-center gap-3.5">
          <IconWrench
            className={`h-5 w-5 shrink-0 ${
              isOpen ? "text-white" : "text-[#111111]"
            }`}
          />
          <div>
            <span className="block text-sm font-bold tracking-tight">
              Ver instrucciones paso a paso
            </span>
            <span
              className={`block text-xs ${
                isOpen ? "text-slate-300" : "text-slate-400"
              }`}
            >
              {plan.steps.length} {plan.steps.length === 1 ? "paso guiado" : "pasos guiados"} · Dificultad {plan.difficultyLabel.toLowerCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              isOpen
                ? "bg-white/15 text-white"
                : "bg-[#EFF2F6] text-[#111111]"
            }`}
          >
            <IconClock className="h-3.5 w-3.5" />
            <span>{plan.estimatedTimeMinutes} min</span>
          </span>

          <IconChevronRight
            className={`h-5 w-5 transition-transform duration-200 ${
              isOpen ? "rotate-90 text-white" : "text-[#111111]"
            }`}
          />
        </div>
      </button>

      {isOpen ? (
        <div className="space-y-4 border-t border-slate-100 bg-[#F8F9FA] p-5 sm:p-6">
          {/* Banner de equipo necesario con Ilustración SVG de Caja de Herramientas */}
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:flex-row sm:items-center">
            <div className="space-y-2">
              {plan.toolsRequired.length > 0 || plan.materialsRequired.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="mr-1 font-bold text-[#111111]">
                    Equipo y materiales:
                  </span>
                  {[...plan.toolsRequired, ...plan.materialsRequired].map(
                    (item, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-[#EFF2F6] px-3 py-1 font-semibold text-slate-700"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              ) : null}

              {plan.safetyPrecautions.length > 0 ? (
                <p className="text-xs text-slate-500">
                  <strong className="font-bold text-[#111111]">
                    Precaución:{" "}
                  </strong>
                  {plan.safetyPrecautions.join(" ")}
                </p>
              ) : null}
            </div>

            <RepairToolkitIllustration className="h-14 w-28 shrink-0" />
          </div>

          {/* Lista de pasos con inversión a negro sólido (#111111) */}
          <ol className="grid gap-3 md:grid-cols-2">
            {plan.steps.map((step) => {
              const linkedAnnotation =
                step.relatedAnnotationId !== undefined
                  ? annotationById.get(step.relatedAnnotationId) ?? null
                  : null;
              const isHighlighted =
                linkedAnnotation !== null &&
                selectedAnnotationId === linkedAnnotation.id;

              return (
                <li
                  key={step.stepNumber}
                  className={`flex flex-col justify-between gap-3 rounded-2xl border p-4 transition-all duration-200 ${
                    isHighlighted
                      ? "border-[#111111] bg-[#111111] text-white shadow-md"
                      : "border-slate-200/80 bg-white text-[#111111]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isHighlighted
                            ? "bg-white text-[#111111]"
                            : "bg-[#111111] text-white"
                        }`}
                      >
                        {step.stepNumber}
                      </span>
                      <div>
                        <h5 className="text-xs font-bold tracking-tight sm:text-sm">
                          {step.title}
                        </h5>
                        <p
                          className={`mt-1 text-xs leading-relaxed ${
                            isHighlighted ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          {step.instruction}
                        </p>
                      </div>
                    </div>

                    {linkedAnnotation !== null ? (
                      <button
                        type="button"
                        onClick={() =>
                          onFocusAnnotation(
                            isHighlighted ? null : linkedAnnotation.id,
                          )
                        }
                        className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
                          isHighlighted
                            ? "bg-white text-[#111111]"
                            : "bg-[#EFF2F6] text-[#111111] hover:bg-[#111111] hover:text-white"
                        }`}
                      >
                        Pin #{linkedAnnotation.index}
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Header minimalista de escritorio inspirado en la Referencia 2:
 * - Izquierda: Icono desnudo de cuadrícula de 4 puntos (`IconGridDots`) + marca `Fixen` (sin subtítulos de relleno).
 * - Centro: Píldora segmentada con inversión en negro sólido (`#111111`) + pestaña secundaria limpia.
 * - Derecha: Indicador `On ●` (o motor Gemini / Demo) + botón de nueva consulta e icono de 3 puntos.
 */

import type { VisionEngine } from "@/lib/contracts/diagnosis.contract";
import {
  IconDotsVertical,
  IconGridDots,
  IconHomeService,
  IconPlus,
  IconSliders,
} from "@/components/ui/TechnicalIcons";

interface AppHeaderProps {
  activeEngine: VisionEngine | null;
  hasMessages: boolean;
  messageCount?: number;
  isAnalyzing: boolean;
  onClearSession: () => void;
}

export function AppHeader({
  activeEngine,
  hasMessages,
  messageCount = 0,
  isAnalyzing,
  onClearSession,
}: AppHeaderProps) {
  const caseCount = Math.max(1, Math.ceil(messageCount / 2));

  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-6 py-4 sm:px-8">
      {/* Izquierda: Icono de 4 puntos directo (sin caja pesada, igual a Ref 2) + nombre */}
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl text-[#111111] transition-colors hover:bg-[#F3F4F6]">
          <IconGridDots className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold tracking-tight text-[#111111]">
          Fixen
        </span>
      </div>

      {/* Centro: Píldora segmentada idéntica a "[ Temperature ]  [ Statistics ]" de Ref 2 */}
      <div className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] p-1">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-4 py-1.5 text-xs font-semibold text-white shadow-xs">
          <IconHomeService className="h-3.5 w-3.5" />
          <span>Diagnóstico</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-600">
          <IconSliders className="h-3.5 w-3.5 text-[#111111]" />
          <span>
            {hasMessages
              ? `${caseCount} ${caseCount === 1 ? "inspección" : "inspecciones"}`
              : activeEngine === "gemini"
                ? "Gemini Vision"
                : "Modo Demo"}
          </span>
        </span>
      </div>

      {/* Derecha: Estado "On ●" estilo Ref 2 + botón de nueva consulta */}
      <div className="flex items-center gap-3">
        {hasMessages ? (
          <button
            type="button"
            onClick={onClearSession}
            disabled={isAnalyzing}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#111111] px-4 text-xs font-semibold text-white transition-transform duration-150 hover:scale-[1.02] disabled:opacity-50"
          >
            <IconPlus className="h-3.5 w-3.5" />
            <span>Nueva consulta</span>
          </button>
        ) : null}

        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#111111]">
          <span>{isAnalyzing ? "Scan" : "On"}</span>
          <span
            className={`h-4 w-4 rounded-full bg-[#111111] ${
              isAnalyzing ? "animate-pulse" : ""
            }`}
          />
        </div>

        <span className="hidden text-slate-400 sm:inline-flex">
          <IconDotsVertical className="h-4 w-4" />
        </span>
      </div>
    </header>
  );
}

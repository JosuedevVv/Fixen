/**
 * Lista de mensajes de escritorio amplia con estilo minimalista de tarjetas (Ref 1 y Ref 2):
 * - Mensaje del usuario: Tarjeta horizontal o fotográfica limpia con icono negro directo (sin caja pesada)
 *   y fotografía enmarcada con insignia blanca flotante.
 * - Mensaje del asistente: Panel de diagnóstico completo con ilustraciones SVG y visor de hallazgos.
 */

import type { ChatMessage } from "@/lib/contracts/chat.contract";
import { DiagnosisMessageItem } from "@/components/diagnosis/DiagnosisMessageItem";
import { DiagnosisSkeletonCard } from "@/components/diagnosis/DiagnosisSkeletonCard";
import { IconUploadPhoto } from "@/components/ui/TechnicalIcons";

interface MessageListProps {
  messages: ChatMessage[];
  isAnalyzing: boolean;
}

export function MessageList({ messages, isAnalyzing }: MessageListProps) {
  return (
    <div aria-live="polite" className="space-y-6">
      {messages.map((message) =>
        message.role === "user" ? (
          <div key={message.id} className="flex justify-end">
            <div className="flex max-w-lg flex-col gap-3 rounded-[28px] border border-slate-200/80 bg-white p-3.5 shadow-[0_10px_28px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center">
              {message.imageDataUrl !== null ? (
                <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-2xl bg-[#111111] sm:w-36">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={message.imageDataUrl}
                    alt="Fotografía enviada"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-[#111111] shadow-xs">
                    Tu foto
                  </span>
                </div>
              ) : null}

              <div className="flex items-start gap-3 px-2 py-1">
                <IconUploadPhoto className="mt-0.5 h-5 w-5 shrink-0 text-[#111111]" />
                <div>
                  <span className="block text-[11px] font-medium text-slate-400">
                    Consulta enviada
                  </span>
                  <p className="mt-0.5 text-xs font-semibold leading-relaxed text-[#111111] sm:text-sm">
                    {message.text}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <DiagnosisMessageItem key={message.id} message={message} />
        ),
      )}

      {isAnalyzing ? <DiagnosisSkeletonCard /> : null}
    </div>
  );
}

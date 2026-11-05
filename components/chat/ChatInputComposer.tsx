"use client";

/**
 * Barra de Prompt Flotante inspirada directamente en la barra de búsqueda de Airbnb (Ref 1)
 * y los botones en negro carbón sólido (`#111111`) de Ref 2:
 * - Icono limpio directo a la izquierda (`IconSearchLens` / `IconUploadPhoto` sin caja gris).
 * - Estructura tipográfica de doble nivel al centro.
 * - Botón con borde circular fino (`border-slate-200`) para adjuntar foto + botón principal en `#111111`.
 */

import { useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import type { PreparedImage } from "@/lib/infrastructure/image/image-preparer";
import {
  IconSearchLens,
  IconSend,
  IconSliders,
  IconTrash,
  IconUploadPhoto,
} from "@/components/ui/TechnicalIcons";

interface ChatInputComposerProps {
  attachment: PreparedImage | null;
  fileName: string | null;
  isPreparingImage: boolean;
  attachmentError: string | null;
  isAnalyzing: boolean;
  onSelectFile: (file: File | null) => Promise<void>;
  onClearAttachment: () => void;
  onSubmit: (userMessage: string) => Promise<void>;
}

export function ChatInputComposer({
  attachment,
  fileName,
  isPreparingImage,
  attachmentError,
  isAnalyzing,
  onSelectFile,
  onClearAttachment,
  onSubmit,
}: ChatInputComposerProps) {
  const [text, setText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isBusy = isAnalyzing || isPreparingImage;
  const canSubmit = attachment !== null && !isBusy;

  async function handleSubmit() {
    if (!canSubmit) return;
    const currentText = text;
    setText("");
    await onSubmit(currentText);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    void onSelectFile(droppedFile);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!isDragging) setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={handleDrop}
      className={`rounded-[32px] border px-4 py-2.5 transition-all duration-200 ${
        isDragging
          ? "border-[#111111] bg-[#EFF2F6]"
          : "border-slate-200/80 bg-white shadow-[0_12px_36px_-6px_rgba(0,0,0,0.08)]"
      }`}
    >
      {attachmentError !== null ? (
        <div
          role="alert"
          className="mb-2.5 rounded-2xl bg-[#111111] px-4 py-2 text-xs font-medium text-white"
        >
          {attachmentError}
        </div>
      ) : null}

      {/* Vista previa de imagen adjunta dentro de la cápsula */}
      {attachment !== null ? (
        <div className="mb-2.5 flex items-center justify-between gap-3 rounded-2xl bg-[#EFF2F6] p-2.5">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attachment.dataUrl}
              alt="Vista previa"
              className="h-12 w-16 shrink-0 rounded-xl bg-[#111111] object-cover shadow-xs"
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold tracking-tight text-[#111111]">
                {fileName ?? "Fotografía lista para inspección"}
              </p>
              <p className="text-[11px] text-slate-500">
                {attachment.width}×{attachment.height}px · Detección de pines activada
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClearAttachment}
            disabled={isBusy}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3.5 text-xs font-semibold text-[#111111] shadow-2xs transition-colors hover:bg-[#111111] hover:text-white"
          >
            <IconTrash className="h-3.5 w-3.5" />
            <span>Quitar</span>
          </button>
        </div>
      ) : null}

      <div className="flex items-center gap-3.5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            void onSelectFile(file);
            e.target.value = "";
          }}
        />

        {/* Icono negro limpio directo a la izquierda (igual a la lupa de "Where to?" en Ref 1) */}
        <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#111111]">
          <IconSearchLens className="h-5 w-5" />
        </span>

        {/* Doble línea central idéntica a "Where to? / Anywhere · Any week · Add guests" (Ref 1) */}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <label htmlFor="diagnosis-prompt-input" className="sr-only">
            ¿Qué desperfecto quieres diagnosticar?
          </label>
          <input
            id="diagnosis-prompt-input"
            type="text"
            value={text}
            disabled={isBusy}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              attachment !== null
                ? "Añade detalles sobre la falla (o presiona Enter)…"
                : "¿Qué desperfecto quieres revisar en casa?"
            }
            className="w-full bg-transparent text-sm font-bold tracking-tight text-[#111111] placeholder:font-bold placeholder:text-[#111111] focus:outline-none disabled:opacity-50"
          />
          <span className="truncate text-[11px] font-medium text-slate-400">
            {attachment !== null
              ? "Fotografía cargada · Lista para localizar hallazgos"
              : "Cualquier zona · Sube una foto · Plomería, Electricidad o Herrajes"}
          </span>
        </div>

        {/* Botón con borde fino para adjuntar foto (inspirado en el círculo derecho de Ref 1) */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isBusy}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-[#111111] transition-all duration-150 hover:border-[#111111] hover:bg-[#EFF2F6] disabled:opacity-50"
        >
          <IconUploadPhoto className="h-4 w-4 text-[#111111]" />
          <span>{attachment !== null ? "Cambiar foto" : "Subir foto"}</span>
          <IconSliders className="hidden h-3.5 w-3.5 text-slate-400 sm:inline" />
        </button>

        {/* Botón de envío en negro carbón sólido (#111111) */}
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!canSubmit}
          aria-label="Diagnosticar fotografía"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[#111111] px-5 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#EFF2F6] disabled:text-slate-400 disabled:shadow-none"
        >
          <IconSend className="h-4 w-4" />
          <span className="hidden sm:inline">
            {isAnalyzing ? "Analizando…" : "Diagnosticar"}
          </span>
        </button>
      </div>
    </div>
  );
}

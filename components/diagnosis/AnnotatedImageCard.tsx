"use client";

/**
 * Visor de Imagen y Lista de Hallazgos del Chatbot (Diseño de Escritorio Amplio):
 * - Izquierda (Estilo tarjeta fotográfica de Ref 1): Fotografía amplia en `rounded-[28px]`,
 *   insignia blanca flotante superior izquierda, botón circular superior derecho y píldora
 *   negra flotante inferior central estilo "Map" (`Pines`).
 * - Derecha (Réplica exacta de la lista "Devices / Connected" en Ref 2):
 *   - El hallazgo ACTIVO muestra a la izquierda la cápsula vertical negra (`h-16 w-12 rounded-[20px] bg-[#111111]`)
 *     con icono blanco arriba y número abajo, más las píldoras grises (`Pin #1`, severidad) y el switch negro a la derecha.
 *   - Los hallazgos INACTIVOS muestran el icono negro de línea DIRECTO SIN CAJA (`h-6 w-6 text-[#111111]`)
 *     alineado en la columna izquierda y el switch gris suave a la derecha, idéntico a Ref 2.
 */

import { useState } from "react";
import type { FaultAnnotation } from "@/lib/contracts/diagnosis.contract";
import { sanitizeNormalizedBox } from "@/lib/domain/bounding-box";
import {
  IconAirConditioner,
  IconDownload,
  IconPendantLight,
  IconPinMap,
  IconSmartMonitor,
} from "@/components/ui/TechnicalIcons";

interface AnnotatedImageCardProps {
  diagnosisId: string;
  issueTitle: string;
  originalImageDataUrl: string | null;
  annotatedImageDataUrl: string | null;
  annotations: FaultAnnotation[];
  selectedAnnotationId: string | null;
  onSelectAnnotation: (annotationId: string | null) => void;
}

function getFindingDeviceIcon(severity: FaultAnnotation["severity"], className = "h-5 w-5") {
  if (severity === "HIGH") return <IconPendantLight className={className} />;
  if (severity === "MEDIUM") return <IconAirConditioner className={className} />;
  return <IconSmartMonitor className={className} />;
}

function getSeverityLabel(severity: FaultAnnotation["severity"]) {
  if (severity === "HIGH") return "Crítico";
  if (severity === "MEDIUM") return "Moderado";
  return "Leve";
}

export function AnnotatedImageCard({
  diagnosisId,
  issueTitle,
  originalImageDataUrl,
  annotatedImageDataUrl,
  annotations,
  selectedAnnotationId,
  onSelectAnnotation,
}: AnnotatedImageCardProps) {
  const [showPins, setShowPins] = useState(true);

  const basePhotoSrc = originalImageDataUrl ?? annotatedImageDataUrl;
  const downloadableSrc = annotatedImageDataUrl ?? originalImageDataUrl;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
      {/* Izquierda: Fotografía amplia enmarcada estilo Airbnb (Ref 1) */}
      <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-[28px] bg-[#111111] p-3">
        {basePhotoSrc !== null ? (
          <div className="relative inline-block max-h-[420px] overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={basePhotoSrc}
              alt={issueTitle}
              className="block max-h-[420px] w-auto max-w-full rounded-2xl object-contain"
            />

            {showPins ? (
              <div className="pointer-events-none absolute inset-0">
                {annotations.map((annotation) => {
                  const box = sanitizeNormalizedBox(annotation.box);
                  const leftPct = box.xmin / 10;
                  const topPct = box.ymin / 10;
                  const widthPct = (box.xmax - box.xmin) / 10;
                  const heightPct = (box.ymax - box.ymin) / 10;
                  const pinX = leftPct + widthPct / 2;
                  const pinY = topPct + heightPct / 2;
                  const isSelected = selectedAnnotationId === annotation.id;

                  return (
                    <div key={annotation.id}>
                      <div
                        style={{
                          left: `${leftPct}%`,
                          top: `${topPct}%`,
                          width: `${widthPct}%`,
                          height: `${heightPct}%`,
                        }}
                        className={`absolute rounded-2xl transition-all duration-200 ${
                          isSelected
                            ? "border-2 border-white bg-white/15 shadow-[0_0_0_4px_rgba(17,17,17,0.5)]"
                            : "border border-white/50 bg-black/10"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          onSelectAnnotation(isSelected ? null : annotation.id)
                        }
                        aria-label={`Punto ${annotation.index}: ${annotation.label}`}
                        style={{
                          left: `${pinX}%`,
                          top: `${pinY}%`,
                        }}
                        className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                          isSelected
                            ? "scale-115 bg-white text-[#111111] ring-6 ring-white/40 shadow-xl"
                            : "bg-[#111111] text-white border border-white/85 ring-4 ring-black/30 shadow-md hover:scale-110 hover:bg-white hover:text-[#111111]"
                        }`}
                      >
                        {annotation.index}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex h-60 items-center justify-center p-4 text-xs text-slate-400">
            Imagen no disponible en caché
          </div>
        )}

        {/* Insignia blanca superior izquierda estilo "Guest favourite" (Ref 1) */}
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3.5 py-1 text-xs font-bold text-[#111111] shadow-sm backdrop-blur">
          {annotations.length} {annotations.length === 1 ? "hallazgo" : "hallazgos"}
        </span>

        {/* Botón circular superior derecho de descarga */}
        {downloadableSrc !== null ? (
          <a
            href={downloadableSrc}
            download={`fixen-${diagnosisId.slice(0, 6)}.png`}
            title="Guardar fotografía con pines"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-white hover:text-[#111111]"
          >
            <IconDownload className="h-4 w-4" />
          </a>
        ) : null}

        {/* Píldora flotante inferior central idéntica a "Map" de Airbnb (Ref 1) */}
        {basePhotoSrc !== null ? (
          <button
            type="button"
            onClick={() => setShowPins((prev) => !prev)}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-[#111111]/95 px-4 py-2 text-xs font-semibold text-white shadow-lg ring-1 ring-white/15 backdrop-blur transition-transform hover:scale-105"
          >
            <IconPinMap className="h-4 w-4" />
            <span>{showPins ? "Pines activos" : "Mostrar pines"}</span>
          </button>
        ) : null}
      </div>

      {/* Derecha: Panel idéntico a la pantalla "Devices / Connected" de Ref 2 */}
      <div className="flex flex-col justify-between rounded-[28px] border border-slate-200/70 bg-white p-5 sm:p-6">
        <div>
          {/* Encabezado "Hallazgos / Detectados — On ●" */}
          <div className="flex items-center justify-between pb-4">
            <div>
              <h4 className="text-lg font-bold tracking-tight text-[#111111]">
                Hallazgos
              </h4>
              <p className="text-xs font-medium text-slate-400">
                Puntos detectados
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#111111]">
              <span>{showPins ? "On" : "Off"}</span>
              <span
                className={`h-4 w-4 rounded-full ${
                  showPins ? "bg-[#111111]" : "bg-slate-300"
                }`}
              />
            </div>
          </div>

          {annotations.length === 0 ? (
            <p className="py-8 text-xs text-slate-400">
              Sin puntos críticos señalados en esta toma.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {annotations.map((annotation) => {
                const isSelected = selectedAnnotationId === annotation.id;

                return (
                  <button
                    key={annotation.id}
                    type="button"
                    onClick={() =>
                      onSelectAnnotation(isSelected ? null : annotation.id)
                    }
                    className="group w-full py-4 first:pt-1 last:pb-0 text-left transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-4 min-w-0">
                        {/*
                          EXACTO A REF 2 ("Devices"):
                          - Si está ACTIVO: Cápsula vertical negra (`h-16 w-12 rounded-[20px] bg-[#111111]`) con icono blanco arriba y número abajo.
                          - Si está INACTIVO: Icono negro de trazo limpio DIRECTO SIN CAJA (`h-6 w-6 text-[#111111]`).
                        */}
                        {isSelected ? (
                          <div className="flex h-16 w-12 shrink-0 flex-col items-center justify-between rounded-[20px] bg-[#111111] py-2.5 text-white shadow-md">
                            {getFindingDeviceIcon(annotation.severity, "h-5 w-5")}
                            <span className="text-xs font-bold leading-none">
                              {annotation.index}
                            </span>
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center text-[#111111] transition-transform group-hover:scale-110">
                            {getFindingDeviceIcon(annotation.severity, "h-6 w-6")}
                          </div>
                        )}

                        <div className="min-w-0">
                          <span className="block text-[11px] font-medium text-slate-400">
                            {isSelected ? "Inspeccionando" : "En espera"}
                          </span>
                          <span className="mt-0.5 block truncate text-sm font-bold tracking-tight text-[#111111]">
                            {annotation.label}
                          </span>

                          {/* Píldoras inferiores estilo "Bedroom | Livingroom" en la fila activa (Ref 2) */}
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <span className="rounded-full bg-[#EFF2F6] px-3 py-0.5 text-[11px] font-semibold text-slate-700">
                              Pin #{annotation.index}
                            </span>
                            <span className="rounded-full bg-[#EFF2F6] px-3 py-0.5 text-[11px] font-semibold text-slate-700">
                              {getSeverityLabel(annotation.severity)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Switch horizontal idéntico a la columna derecha de Ref 2 */}
                      <span
                        className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ${
                          isSelected
                            ? "bg-[#111111] justify-end"
                            : "bg-[#CBD5E1] justify-start group-hover:bg-slate-400"
                        }`}
                      >
                        <span className="h-5 w-5 rounded-full bg-white shadow-2xs" />
                      </span>
                    </div>

                    {isSelected ? (
                      <p className="mt-3 rounded-2xl bg-[#EFF2F6] px-4 py-3 text-xs leading-relaxed text-slate-700">
                        {annotation.description}
                      </p>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

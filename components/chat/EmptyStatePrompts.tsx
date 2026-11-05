"use client";

/**
 * Vista Inicial de Escritorio Amplia (Bento Desktop Layout):
 * 1. Fila superior de 2 columnas (`lg:grid-cols-[1.45fr_1fr]`):
 *    - Izquierda: Tarjeta principal estilo "Welcome Home" (Ref 2) + pestañas de iconos desnudos con línea inferior (Ref 1)
 *      + Ilustración SVG arquitectónica de la casa (`SmartHomeHeroIllustration`).
 *    - Derecha: Widget de calibración inspirado en la pantalla central de Ref 2 con el SVG del dial radial graduado
 *      (`RadialDialGaugeIllustration`) y las 3 tarjetas inferiores de nivel (`LOW`, `MED`, `HIGH`) con la primera invertida en `#111111`.
 * 2. Fila inferior de 3 columnas ("Smart Scenarios"):
 *    - Iconos de trazo limpio directos sobre la superficie (sin cajas alrededor del icono, idéntico a "Smart Light / Smart AC" en Ref 2).
 *    - Fotografías reales enmarcadas con insignia blanca flotante (Ref 1).
 *    - Interruptor vertical en píldora (`h-11 w-6 rounded-full`) en la esquina inferior derecha de cada tarjeta (idéntico a Ref 2).
 */

import { useRef, useState, type DragEvent } from "react";
import {
  IconAirConditioner,
  IconPendantLight,
  IconSmartMonitor,
  IconUploadPhoto,
  IconVentFan,
  RadialDialGaugeIllustration,
  SmartHomeHeroIllustration,
} from "@/components/ui/TechnicalIcons";
import {
  SAMPLE_SCENARIOS,
  type SampleScenario,
} from "@/lib/infrastructure/image/sample-scenario-generator";

interface EmptyStatePromptsProps {
  disabled: boolean;
  onSelectFile: (file: File | null) => Promise<void>;
  onSelectScenario: (scenario: SampleScenario) => void;
}

const CATEGORY_TABS = [
  { id: "plumbing", label: "Plomería", Icon: IconAirConditioner },
  { id: "carpentry", label: "Herrajes", Icon: IconSmartMonitor },
  { id: "electrical", label: "Eléctrico", Icon: IconPendantLight },
  { id: "climate", label: "Clima y Muros", Icon: IconVentFan },
] as const;

function getScenarioBareIcon(scenarioId: string) {
  if (scenarioId.includes("siphon")) {
    return <IconAirConditioner className="h-7 w-7" />;
  }
  if (scenarioId.includes("electrical")) {
    return <IconPendantLight className="h-7 w-7" />;
  }
  return <IconSmartMonitor className="h-7 w-7" />;
}

export function EmptyStatePrompts({
  disabled,
  onSelectFile,
  onSelectScenario,
}: EmptyStatePromptsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("plumbing");
  const [activeCardId, setActiveCardId] = useState<string>(
    SAMPLE_SCENARIOS[0]?.id ?? "medium-siphon",
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0] ?? null;
    void onSelectFile(file);
  }

  return (
    <div className="space-y-6">
      {/* Fila Superior de Escritorio: Banner "Welcome Home" + Panel del Dial Radial (Ref 2) */}
      <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        {/* Columna Izquierda: Tarjeta de carga con pestañas de iconos limpios + SVG de Casa */}
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
          className={`flex flex-col justify-between rounded-[28px] border p-6 transition-all duration-200 ${
            isDragging
              ? "border-[#111111] bg-[#EFF2F6]"
              : "border-slate-200/70 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
          }`}
        >
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

          {/* Barra de categorías con iconos desnudos y subrayado negro (idéntica a Ref 1) */}
          <div className="flex items-center gap-7 overflow-x-auto border-b border-slate-100 pb-3">
            {CATEGORY_TABS.map(({ id, label, Icon }) => {
              const isTabActive = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`relative flex flex-col items-center gap-1.5 pb-1 text-xs font-semibold transition-colors ${
                    isTabActive
                      ? "text-[#111111]"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                  {isTabActive ? (
                    <span className="absolute -bottom-3 left-0 right-0 h-0.5 rounded-full bg-[#111111]" />
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Cuerpo "Welcome Home" con texto a la izquierda y SVG arquitectónico grande a la derecha */}
          <div className="mt-5 flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex flex-col items-start text-left">
              <span className="text-xs font-medium text-slate-400">
                Inspección del hogar
              </span>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#111111]">
                Diagnóstico Visual
              </h1>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
                Sube o arrastra una fotografía real del desperfecto para ubicar pines numerados y desplegar los pasos.
              </p>

              <button
                type="button"
                disabled={disabled}
                onClick={() => fileInputRef.current?.click()}
                className="mt-5 inline-flex h-11 items-center gap-2.5 rounded-full bg-[#111111] px-6 text-xs font-semibold text-white shadow-sm transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <IconUploadPhoto className="h-4 w-4" />
                <span>Subir fotografía</span>
              </button>
            </div>

            <div className="shrink-0">
              <SmartHomeHeroIllustration className="h-36 w-52 sm:h-40 sm:w-56" />
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta del Dial Radial graduado + 3 bloques inferiores (Pantalla central Ref 2) */}
        <div className="flex flex-col justify-between rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold tracking-tight text-[#111111]">
                Calibración de Seguridad
              </h2>
              <p className="text-[11px] text-slate-400">
                Evaluación automática por nivel de riesgo
              </p>
            </div>
            <span className="rounded-full bg-[#EFF2F6] px-3 py-1 text-[11px] font-bold text-[#111111]">
              3 niveles
            </span>
          </div>

          <div className="my-2 flex items-center justify-center">
            <RadialDialGaugeIllustration
              centerLabel="100%"
              subLabel="GUARDRAIL"
              className="h-36 w-48"
            />
          </div>

          {/* 3 Bloques inferiores idénticos a "Heating 22°c | Cooling 18°c | Airwave 20°c" de Ref 2 */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-2xl bg-[#111111] p-3 text-white shadow-sm">
              <span className="block text-[10px] font-medium text-slate-300">
                Bricolaje •
              </span>
              <span className="mt-2 block text-base font-bold tracking-tight">
                LOW
              </span>
            </div>
            <div className="rounded-2xl bg-[#EFF2F6] p-3 text-[#111111]">
              <span className="block text-[10px] font-medium text-slate-500">
                Cautela •
              </span>
              <span className="mt-2 block text-base font-bold tracking-tight">
                MED
              </span>
            </div>
            <div className="rounded-2xl bg-[#EFF2F6] p-3 text-[#111111]">
              <span className="block text-[10px] font-medium text-slate-500">
                Bloqueo •
              </span>
              <span className="mt-2 block text-base font-bold tracking-tight">
                HIGH
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fila Inferior: Tarjetas "Smart Devices" (Ref 2) con iconos directos + switch vertical + Fotos (Ref 1) */}
      <div>
        <div className="mb-3.5 flex items-center justify-between px-1">
          <h2 className="text-base font-bold tracking-tight text-[#111111]">
            Escenarios de Diagnóstico
          </h2>
          <span className="text-xs font-medium text-slate-400">
            Selecciona una tarjeta para probar el análisis visual
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {SAMPLE_SCENARIOS.map((scenario) => {
            const isInverted = activeCardId === scenario.id;

            return (
              <button
                key={scenario.id}
                type="button"
                disabled={disabled}
                onMouseEnter={() => setActiveCardId(scenario.id)}
                onFocus={() => setActiveCardId(scenario.id)}
                onClick={() => onSelectScenario(scenario)}
                className={`group flex flex-col justify-between rounded-[28px] p-5 text-left transition-all duration-200 disabled:opacity-50 ${
                  isInverted
                    ? "bg-[#111111] text-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)]"
                    : "bg-[#EFF2F6] text-[#111111] hover:bg-[#111111] hover:text-white"
                }`}
              >
                {/* Fila superior: Icono de trazo directo SIN CAJA (idéntico a Smart Light / Smart AC en Ref 2) */}
                <div className="mb-3.5 flex w-full items-center justify-between">
                  <span
                    className={`transition-colors ${
                      isInverted
                        ? "text-white"
                        : "text-[#111111] group-hover:text-white"
                    }`}
                  >
                    {getScenarioBareIcon(scenario.id)}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                      isInverted
                        ? "bg-white/15 text-white"
                        : "bg-white text-[#111111]"
                    }`}
                  >
                    {scenario.category}
                  </span>
                </div>

                {/* Fotografía real enmarcada con esquinas redondeadas (Ref 1) */}
                <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={scenario.photoUrl}
                    alt={scenario.photoAlt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Pie de tarjeta con título en dos líneas a la izquierda y SWITCH VERTICAL a la derecha (idéntico a Ref 2) */}
                <div className="mt-4 flex w-full items-end justify-between gap-3">
                  <div className="min-w-0">
                    <h3
                      className={`text-sm font-bold leading-snug tracking-tight ${
                        isInverted ? "text-white" : "text-[#111111] group-hover:text-white"
                      }`}
                    >
                      {scenario.title}
                    </h3>
                    <p
                      className={`mt-1 line-clamp-1 text-xs ${
                        isInverted
                          ? "text-slate-300"
                          : "text-slate-500 group-hover:text-slate-300"
                      }`}
                    >
                      {scenario.subtitle}
                    </p>
                  </div>

                  {/* Píldora switch vertical exacta de "Smart Light / Smart AC" en Ref 2 */}
                  <span
                    className={`flex h-11 w-6 shrink-0 flex-col items-center rounded-full p-1 transition-colors ${
                      isInverted
                        ? "bg-white justify-end"
                        : "bg-[#CBD5E1] justify-start group-hover:bg-white"
                    }`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full ${
                        isInverted
                          ? "bg-[#111111]"
                          : "bg-white group-hover:bg-[#111111]"
                      }`}
                    />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

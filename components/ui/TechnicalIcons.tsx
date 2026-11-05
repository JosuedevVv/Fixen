/**
 * Sistema de Iconos en Trazo Negro Puro + Ilustraciones SVG Arquitectónicas Monocromáticas.
 * Diseñado replicando fielmente el lenguaje gráfico de las dos referencias:
 * - Iconos de línea limpia (strokeWidth 1.75) que se usan directos sobre la superficie (sin cajas pesadas).
 * - Iconos exactos de dispositivos y categorías (lámpara colgante, aire acondicionado, monitor con señal,
 *   ventilador, plomería, herrajes, filtros, mapa).
 * - 5 Ilustraciones vectoriales SVG monocromáticas (#111111 + #E2E8F0 + #CBD5E1) tanto para el inicio
 *   como para el interior de las respuestas del chatbot.
 */

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Cuadrícula de 4 puntos (esquina superior izquierda de la Ref 2) */
export function IconGridDots(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="7" cy="7" r="2.2" />
      <circle cx="17" cy="7" r="2.2" />
      <circle cx="7" cy="17" r="2.2" />
      <circle cx="17" cy="17" r="2.2" />
    </svg>
  );
}

/** Lámpara colgante con 3 haces de luz (idéntica a "Smart Light" en Ref 2) */
export function IconPendantLight(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <line x1="12" y1="2" x2="12" y2="5" />
      <path d="M5 13a7 7 0 0 1 14 0H5Z" />
      <line x1="9" y1="16.5" x2="8" y2="19.5" />
      <line x1="12" y1="16.5" x2="12" y2="20" />
      <line x1="15" y1="16.5" x2="16" y2="19.5" />
    </svg>
  );
}

/** Unidad de aire acondicionado / tubería con ondas de flujo (idéntica a "Smart AC" en Ref 2) */
export function IconAirConditioner(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="4" width="18" height="8" rx="2.5" />
      <line x1="6.5" y1="9" x2="17.5" y2="9" />
      <path d="M8 15.5c1.3 1.2 2.7 1.2 4 0s2.7-1.2 4 0" />
      <path d="M9.5 19c1 .9 2 .9 3 0s2-.9 3 0" />
    </svg>
  );
}

/** Monitor inteligente con onda de señal interna (idéntico a "Smart TV" en Ref 2) */
export function IconSmartMonitor(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="4" width="18" height="13" rx="3" />
      <line x1="8" y1="20" x2="16" y2="20" />
      <path d="M9.5 10.5a3.5 3.5 0 0 1 5 0" />
      <path d="M10.8 12.5a1.8 1.8 0 0 1 2.4 0" />
      <circle cx="12" cy="14" r="0.6" fill="currentColor" />
    </svg>
  );
}

/** Aspas de ventilación de 4 pétalos (idéntico al cuarto dispositivo en Ref 2) */
export function IconVentFan(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 12c0-3.5 2-6 4.5-6S20 8 18 10.5 12 12 12 12Z" />
      <path d="M12 12c3.5 0 6 2 6 4.5S16 20 13.5 18 12 12 12 12Z" />
      <path d="M12 12c0 3.5-2 6-4.5 6S4 16 6 13.5 12 12 12 12Z" />
      <path d="M12 12c-3.5 0-6-2-6-4.5S8 4 10.5 6 12 12 12 12Z" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

/** Lupa de búsqueda limpia (idéntica a la barra "Where to?" de Ref 1) */
export function IconSearchLens(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="20" y1="20" x2="16.2" y2="16.2" />
    </svg>
  );
}

/** Tres puntos verticales de menú contextual (esquina superior derecha de Ref 2) */
export function IconDotsVertical(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="12" cy="6" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="18" r="1.6" />
    </svg>
  );
}

/** Icono de casa minimalista */
export function IconHomeService(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9.5" />
      <path d="M9 21v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6" />
    </svg>
  );
}

/** Icono de controles / filtro (estilo botón circular derecho de barra Airbnb en Ref 1) */
export function IconSliders(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <line x1="4" y1="8" x2="20" y2="8" />
      <line x1="4" y1="16" x2="20" y2="16" />
      <circle cx="9" cy="8" r="2.3" fill="white" stroke="currentColor" strokeWidth={1.75} />
      <circle cx="15" cy="16" r="2.3" fill="white" stroke="currentColor" strokeWidth={1.75} />
    </svg>
  );
}

/** Icono de gota / plomería */
export function IconDroplet(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

/** Icono eléctrico / energía */
export function IconBolt(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

/** Icono de mapa / pines (estilo píldora flotante "Map" de Airbnb) */
export function IconPinMap(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function IconPaperclip(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

export function IconUploadPhoto(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

export function IconShieldLock(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconAlertTriangle(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function IconCheckCircle(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconWrench(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

export function IconDownload(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

export function IconSend(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
  );
}

export function IconClock(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  );
}

export function IconPhoneCall(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/**
 * 1. Ilustración SVG arquitectónica monocromática inspirada en el banner "Welcome Home" (Ref 2).
 */
export function SmartHomeHeroIllustration(props: IconProps) {
  return (
    <svg
      viewBox="0 0 220 135"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Silueta de terreno ondulado negro sólido idéntica a Ref 2 */}
      <path
        d="M10 120C10 108 24 103 42 103C58 103 65 92 84 92H188C198 92 206 99 206 109V120H10Z"
        fill="#111111"
      />
      {/* Chimenea */}
      <rect x="78" y="28" width="14" height="30" rx="2" fill="#111111" />
      <rect x="75" y="25" width="20" height="5" rx="1.5" fill="#111111" />
      {/* Fachada principal en gris arquitectónico */}
      <path d="M62 60L122 16L180 60V104H62V60Z" fill="#E2E8F0" />
      {/* Sombra volumétrica derecha */}
      <path d="M122 16L180 60V104H122V16Z" fill="#CBD5E1" fillOpacity="0.6" />
      {/* Cubierta de techo en negro firme */}
      <path
        d="M52 65L122 12L190 65"
        stroke="#111111"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Termómetro / Escáner central cápsula blanca (idéntico a Ref 2) */}
      <rect
        x="109"
        y="42"
        width="26"
        height="50"
        rx="13"
        fill="#FFFFFF"
        stroke="#111111"
        strokeWidth="2.5"
      />
      <line
        x1="122"
        y1="52"
        x2="122"
        y2="74"
        stroke="#111111"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="122" cy="80" r="6" fill="#111111" />
      {/* Ventanas laterales minimalistas */}
      <rect
        x="148"
        y="62"
        width="15"
        height="15"
        rx="3"
        fill="#FFFFFF"
        stroke="#111111"
        strokeWidth="2"
      />
      <rect
        x="79"
        y="64"
        width="13"
        height="13"
        rx="2.5"
        fill="#FFFFFF"
        stroke="#111111"
        strokeWidth="2"
      />
      {/* Ondas Wi-Fi / Sensores en el tejado derecho */}
      <path
        d="M164 25C170 25 175 30 175 36"
        stroke="#111111"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M164 18C174 18 182 26 182 36"
        stroke="#111111"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * 2. Ilustración SVG del Dial Radial con marcas graduadas (inspirado en el dial central "22°c" de Ref 2).
 * Se utiliza tanto en el panel de estado como dentro de la respuesta del chatbot.
 */
export function RadialDialGaugeIllustration({
  centerLabel = "AI",
  subLabel = "SCAN",
  ...props
}: IconProps & { centerLabel?: string; subLabel?: string }) {
  return (
    <svg
      viewBox="0 0 180 145"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Arco graduado de ticks estilo termostato inteligente de Ref 2 */}
      <path
        d="M32 108A64 64 0 1 1 148 108"
        stroke="#111111"
        strokeWidth="5"
        strokeDasharray="1.8 8.2"
        strokeLinecap="round"
      />
      {/* Anillo exterior difuminado suave */}
      <circle cx="90" cy="82" r="48" fill="#F1F5F9" />
      {/* Círculo interior blanco elevado */}
      <circle
        cx="90"
        cy="82"
        r="36"
        fill="#FFFFFF"
        stroke="#E2E8F0"
        strokeWidth="1.5"
      />
      {/* Puntero triangular superior idéntico al dial de Ref 2 */}
      <polygon points="90,26 86,33 94,33" fill="#111111" />
      <circle cx="90" cy="37" r="1.8" fill="#111111" />
      {/* Etiquetas laterales del arco */}
      <text
        x="16"
        y="92"
        fill="#94A3B8"
        fontSize="8.5"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
      >
        LOW
      </text>
      <text
        x="148"
        y="92"
        fill="#94A3B8"
        fontSize="8.5"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
      >
        HIGH
      </text>
      {/* Valor central en negrita */}
      <text
        x="90"
        y="84"
        textAnchor="middle"
        fill="#111111"
        fontSize="16"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
      >
        {centerLabel}
      </text>
      <text
        x="90"
        y="97"
        textAnchor="middle"
        fill="#64748B"
        fontSize="7.5"
        fontWeight="700"
        letterSpacing="0.08em"
        fontFamily="system-ui, sans-serif"
      >
        {subLabel}
      </text>
    </svg>
  );
}

/**
 * 3. Ilustración SVG para el encabezado de diagnóstico del Chatbot:
 * Casa isométrica con nodos de inspección numerados y radar técnico.
 */
export function ChatbotArchitectureIllustration(props: IconProps) {
  return (
    <svg
      viewBox="0 0 160 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Base negra */}
      <path
        d="M12 84C12 78 22 74 34 74H136C144 74 150 78 150 84H12Z"
        fill="#111111"
      />
      {/* Volumen arquitectónico */}
      <path d="M36 42L80 12L124 42V74H36V42Z" fill="#E2E8F0" />
      <path d="M80 12L124 42V74H80V12Z" fill="#CBD5E1" fillOpacity="0.65" />
      <path
        d="M28 46L80 10L132 46"
        stroke="#111111"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tubería / circuito interno inspeccionado */}
      <path
        d="M54 58H78V42H102"
        stroke="#111111"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Pin 1 en negro sólido */}
      <circle cx="54" cy="58" r="7" fill="#111111" />
      <circle cx="54" cy="58" r="2.5" fill="#FFFFFF" />
      {/* Pin 2 en blanco con borde negro */}
      <circle
        cx="102"
        cy="42"
        r="7"
        fill="#FFFFFF"
        stroke="#111111"
        strokeWidth="2.2"
      />
      <circle cx="102" cy="42" r="2.2" fill="#111111" />
      {/* Ondas de escaneo */}
      <path
        d="M118 18C124 18 128 22 128 28"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M118 12C127 12 134 19 134 28"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * 4. Ilustración SVG para la tarjeta de Pasos de Reparación (`RepairGuideCard`):
 * Kit técnico minimalista en negro carbón y gris pizarra.
 */
export function RepairToolkitIllustration(props: IconProps) {
  return (
    <svg
      viewBox="0 0 140 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Caja de herramientas minimalista */}
      <rect
        x="24"
        y="30"
        width="92"
        height="40"
        rx="8"
        fill="#E2E8F0"
        stroke="#111111"
        strokeWidth="2.5"
      />
      <path d="M24 44H116" stroke="#111111" strokeWidth="2.2" />
      {/* Asa superior en negro sólido */}
      <path
        d="M54 30V22C54 19.8 55.8 18 58 18H82C84.2 18 86 19.8 86 22V30"
        stroke="#111111"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Broche central negro */}
      <rect x="63" y="38" width="14" height="12" rx="3" fill="#111111" />
      <circle cx="70" cy="44" r="2" fill="#FFFFFF" />
      {/* Insignia de verificación flotante */}
      <circle cx="112" cy="24" r="10" fill="#111111" />
      <path
        d="M108 24L111 27L116.5 21.5"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 5. Ilustración SVG para el Bloqueo de Seguridad (`SpecialistBlockAlert`):
 * Escudo y disyuntor de protección en alto contraste.
 */
export function SafetyBreakerIllustration(props: IconProps) {
  return (
    <svg
      viewBox="0 0 140 84"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Panel eléctrico / escudo */}
      <rect
        x="34"
        y="12"
        width="72"
        height="60"
        rx="12"
        fill="#1E293B"
        stroke="#FFFFFF"
        strokeWidth="2"
      />
      {/* Interruptor OFF */}
      <rect
        x="52"
        y="26"
        width="36"
        height="18"
        rx="9"
        fill="#FFFFFF"
      />
      <circle cx="61" cy="35" r="6" fill="#111111" />
      {/* Rayo / Alerta contenida */}
      <path
        d="M72 49L65 58H71L69 65L77 56H71L72 49Z"
        fill="#FFFFFF"
      />
      {/* Ondas laterales */}
      <path
        d="M22 30C18 36 18 48 22 54"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
      <path
        d="M118 30C122 36 122 48 118 54"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
    </svg>
  );
}

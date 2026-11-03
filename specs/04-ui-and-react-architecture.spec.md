# SDD Spec 04: Arquitectura de Componentes React 19 y Diseño Impecable (`04-ui-and-react-architecture`)

- **Estado:** Aprobado para Incremento 1
- **Ubicación objetivo en código:** `app/`, `components/`, `hooks/`
- **Principios rectores:** Responsabilidad Única (SRP), **Vercel React Composition Patterns** y **Impeccable Design System** (*Anti-AI-Slop*).

---

## 1. Dirección de Diseño "Impeccable" — Modo `Operate` (Herramienta de Diagnóstico)

Siguiendo `.agents/skills/impeccable/reference/operate.md`, la superficie principal de **Fixen** opera en modo **`Operate`** (con secciones de guía en modo **`Read`**): la interfaz debe desaparecer dentro de la tarea, priorizando escaneabilidad inmediata, precisión visual y confianza técnica sobre adornos innecesarios.

### 1.1 Sistema de Color Restringido y Semántico (`app/globals.css`)
- **Paleta Neutral de 2 Capas (Restrained Base):**
  - Superficie de trabajo (`--bg-canvas`): `#0B0F17` (oscuro) / `#F8FAFC` (claro).
  - Capa neutral secundaria para paneles/barras (`--bg-surface`): `#111827` (ligeramente más fría, con borde estructural `1px solid #1E293B`).
  - Superficie interactiva/elevada (`--bg-elevated`): `#172033`.
- **Acento Funcional (Solo para acciones primarias y selección activa, nunca decoración):**
  - Acción primaria y foco (`--accent-primary`): `#F97316` (Naranja técnico de alta visibilidad).
- **Vocabulario Semántico de Estado y Riesgo (Alto Contraste):**
  - `LOW` (Éxito / Bricolaje Seguro): `#10B981` (Esmeralda).
  - `MEDIUM` (Advertencia / Precaución): `#F59E0B` (Ámbar).
  - `HIGH` (Peligro / Bloqueo Crítico): `#EF4444` (Rojo normativo de bloqueo).

### 1.2 Tipografía y Escala Fija (`Operate` Mode Rules)
- **Una sola familia sans-serif (`--font-geist-sans`)** para encabezados, etiquetas, botones y cuerpo, acompañada de **`--font-geist-mono`** con `tabular-nums` exclusivamente para coordenadas, índices de recuadros (`#01`, `#02`), dimensiones y tiempos estimados.
- **Escala fija en `rem` (ratio `1.125–1.2`)**, sin `clamp()` fluido en paneles de producto, y ancho de lectura de `65–75ch` en las explicaciones e instrucciones de reparación.

### 1.3 Estados de Componentes y Movimiento
- Todo control interactivo define explícitamente sus estados: `default`, `hover`, `focus-visible`, `active`, `disabled`, `loading` y `error`.
- **Estados de carga con Skeletons** estructurados que reflejan el visor de imagen y la tarjeta de diagnóstico (no spinners flotantes desconectados).
- **Empty State pedagógico:** Enseña al usuario cómo fotografiar la falla y ofrece casos de prueba reales con un clic.
- **Transiciones funcionales de `150–200ms`** solo para comunicar cambios de estado (ej. resaltar un recuadro en la imagen al pasar por un paso de reparación).

---

## 2. Reglas de React 19 y Patrones de Composición (SRP)

Aplicando `.agents/skills/vercel-react-best-practices/SKILL.md` y `.agents/skills/vercel-composition-patterns/SKILL.md`:

1. **`architecture-avoid-boolean-props` & `patterns-explicit-variants`:**
   - En lugar de un único componente gigante `<DiagnosisCard isHighRisk isBlocked hasRepairSteps />`, separamos en componentes explícitos por variante:
     - `<RepairGuideCard />`: Exclusivo para diagnósticos `LOW` y `MEDIUM` donde existe un `repairPlan`.
     - `<SpecialistBlockAlert />`: Exclusivo para diagnósticos `HIGH` donde rige el bloqueo escéptico de seguridad.
2. **`rerender-derived-state-no-effect` & `rendering-conditional-render`:**
   - Derivar estados booleanos y conteos directamente durante el renderizado (sin `useEffect` redundantes) y usar operadores ternarios explícitos (`condition ? <A /> : null`) en lugar de `&&` para evitar renderizar `0` o `NaN`.
3. **`bundle-barrel-imports` & `client-localstorage-schema`:**
   - Importar cada módulo directamente desde su ruta específica (sin archivos `index.ts` barril) y versionar el esquema de `localStorage` (`fixen:chat-history:v1`) con lectura cacheada en memoria.
4. **Desacoplamiento Estado vs. Presentación:**
   - `useImageAttachment`: Único responsable de leer el archivo, validar MIME/tamaño, generar la previsualización local y limpiar memoria.
   - `useDiagnosisChat`: Único responsable de gestionar la lista de mensajes, sincronizar con `LocalStorageChatRepository`, invocar `/api/diagnose` y pasar las anotaciones por `CanvasImageAnnotatorService`.
5. **Accesibilidad (`web-design-guidelines`):**
   - Áreas interactivas mínimas de `44×44px` en controles móviles.
   - `aria-live="polite"` en el contenedor de respuestas del diagnóstico y `role="alert"` en `<SpecialistBlockAlert />`.
   - Soporte completo de teclado para subir imágenes, enviar con `Enter` (`Shift+Enter` para salto de línea) y alternar entre los recuadros detectados.

---

## 3. Mapa de Componentes de UI y Responsabilidades Únicas

| Archivo | Responsabilidad Única (SRP) |
| :--- | :--- |
| `components/layout/AppHeader.tsx` | Muestra la identidad de Fixen, estado del motor de visión (Gemini / Modo Demo) y botón para limpiar sesión. |
| `components/chat/ChatWorkspace.tsx` | Orquesta el layout principal del chat (historial + estado vacío + barra de composición inferior). |
| `components/chat/EmptyStatePrompts.tsx` | Presenta escenarios de prueba rápida y guía de cómo tomar una buena foto del desperfecto. |
| `components/chat/ChatInputComposer.tsx` | Gestiona el input de texto, botón/dropzone de adjunto de imagen y previsualización antes de enviar. |
| `components/diagnosis/DiagnosisMessageItem.tsx` | Compone la respuesta del asistente: encabezado de riesgo + visor de imagen anotada + tarjeta de acción (`RepairGuideCard` o `SpecialistBlockAlert`). |
| `components/diagnosis/RiskBadge.tsx` | Renderiza la insignia semántica (`LOW`, `MEDIUM`, `HIGH`) con icono y color normativo. |
| `components/diagnosis/AnnotatedImageCard.tsx` | Muestra la imagen modificada con los recuadros pintados, selector interactivo de hallazgos, toggle Original/Anotada y descarga del PNG modificado. |
| `components/diagnosis/RepairGuideCard.tsx` | Renderiza herramientas, precauciones y pasos numerados (solo cuando `repairPlan !== null`). |
| `components/diagnosis/SpecialistBlockAlert.tsx` | Renderiza el bloqueo estricto de seguridad cuando `riskLevel === "HIGH"`, detallando el especialista requerido y medidas pasivas de contención. |

# Doc 04b — Interfaz Monocromática de Alta Gama, Hooks y Arquitectura React 19 (Fase 5)

Implementa: [`specs/04-ui-and-react-architecture.spec.md`](../specs/04-ui-and-react-architecture.spec.md).

---

## 1. Arquitectura Visual "The Card Shell" + Patrón de Inversión (`#0F172A`)

1. **Contenedor Principal (`ChatWorkspace.tsx` y `AppHeader.tsx`)**:
   - Envuelve toda la consulta en una gran tarjeta central flotante (`rounded-3xl border-slate-200/80 bg-white shadow-[0_24px_64px_-16px_rgba(15,23,42,0.08)]`) sobre el fondo blanco humo (`bg-[#F8F9FA]`).
   - El encabezado superior funciona como barra de estado estilo widget con el indicador **"Modo Diagnóstico"** y punto luminoso de actividad.
2. **Sección de Imagen Interactiva y Pines (`AnnotatedImageCard.tsx` y `CanvasImageAnnotatorService`)**:
   - La fotografía del desperfecto se presenta dentro de un marco `rounded-3xl` con fondo oscuro contrastante (`bg-[#0F172A]`).
   - Los pines siguen el patrón de inversión: círculos en negro carbón sólido con número blanco y anillo exterior (`ring-4 ring-white/25`), invirtiéndose a blanco puro con número en negro carbón (`bg-white text-[#0F172A] ring-8 ring-white/35`) cuando el punto está seleccionado.
3. **Panel Lateral de Hallazgos con Inversión Interactiva (`AnnotatedImageCard.tsx`)**:
   - Cada hallazgo es una tarjeta individual (`rounded-2xl`).
   - Al pasar el cursor (`hover:`) o seleccionar un hallazgo (`isSelected`), la tarjeta se invierte a **fondo negro carbón sólido (`bg-[#0F172A] text-white`)** y su insignia numérica pasa a blanco (`bg-white text-[#0F172A]`). Por defecto, el primer hallazgo inicia seleccionado para evidenciar de inmediato el vínculo con la imagen.
4. **Acordeón de Instrucciones y Bloqueo de Seguridad (`RepairGuideCard.tsx` y `SpecialistBlockAlert.tsx`)**:
   - `RepairGuideCard` mantiene los pasos colapsados por defecto y aplica inversión a `#0F172A` tanto en la cabecera desplegada como en el paso vinculado al pin activo.
   - `SpecialistBlockAlert` presenta el bloqueo de seguridad de riesgo alto en una tarjeta sólida `bg-[#0F172A] text-white` con desplegable para las medidas pasivas de resguardo.
5. **Barra Inferior de Entrada (`ChatInputComposer.tsx`)**:
   - Barra flotante `rounded-3xl bg-[#F8F9FA]` con pastilla blanca suave para `"Subir foto"`, campo de texto amplio y botón principal en **negro carbón sólido (`bg-[#0F172A] text-white rounded-2xl`)**.

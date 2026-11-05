# SDD Spec 04: Arquitectura de Componentes React 19 y Diseño Monocromático de Alta Gama (`04-ui-and-react-architecture`)

- **Estado:** Aprobado para Incremento 1
- **Ubicación objetivo en código:** `app/`, `components/`, `hooks/`
- **Principios rectores:** Responsabilidad Única (SRP), **Vercel React Composition Patterns** y **Patrón de Inversión Monocromática de Alta Gama (`#0F172A`)**.

---

## 1. Sistema Visual Monocromático y Patrón de Inversión

1. **Paleta y Contraste Sofisticado (`app/globals.css`)**:
   - Lienzo general de la aplicación: Blanco humo (`#F8F9FA`).
   - Contenedor principal (*The Card Shell*): Tarjeta central flotante blanca (`bg-white rounded-3xl border-slate-200/80`) con sombra difuminada suave (`shadow-[0_24px_64px_-16px_rgba(15,23,42,0.08)]`).
   - **Patrón de Inversión Visual (`#0F172A`)**: Todo elemento activo, hallazgo seleccionado, botón principal de envío o bloqueo crítico se invierte a **fondo negro carbón sólido (`bg-[#0F172A]`) con texto blanco brillante (`text-white`)**.
2. **Tipografía y Jerarquía**:
   - Títulos principales en `font-bold tracking-tight text-slate-900` y textos descriptivos secundarios en `text-slate-400`.
3. **Componentes Estructurales Clave**:
   - **The Card Shell (`ChatWorkspace.tsx` + `AppHeader.tsx`)**: Envuelve toda la experiencia con un encabezado estilo widget e indicador de `"Modo Diagnóstico"`.
   - **Visor de Imagen Oscuro y Pines de Inversión (`AnnotatedImageCard.tsx`)**: Contenedor `rounded-3xl bg-[#0F172A]` con pines circulares en negro carbón/blanco que se invierten a blanco puro con anillo de luz (`ring-8 ring-white/35`) al seleccionarse.
   - **Panel Lateral de Hallazgos (`AnnotatedImageCard.tsx`)**: Tarjetas individuales (`rounded-2xl`) que al hacer clic o pasar el cursor se invierten a `bg-[#0F172A] text-white`.
   - **Barra Inferior Flotante (`ChatInputComposer.tsx`)**: Pastilla gris/blanca suave para `"Subir foto"`, input minimalista amplio y botón de analizar en **negro carbón sólido (`bg-[#0F172A] text-white rounded-2xl`)**.

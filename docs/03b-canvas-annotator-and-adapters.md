# Doc 03b — Pintado de Recuadros y Adaptadores (Fase 3)

Implementa: [`specs/03-image-annotation.spec.md`](../specs/03-image-annotation.spec.md), secciones 3 y 4, y los adaptadores de puertos de la spec 01.

## Reparto de responsabilidades

| Archivo | Responsabilidad única | ¿Necesita navegador? |
| :--- | :--- | :--- |
| `lib/domain/severity-palette.ts` | Colores por severidad | No |
| `lib/domain/annotation-layout.ts` | Cálculos de tamaño y posición | No |
| `lib/infrastructure/image/canvas-image-annotator.service.ts` | Dibujar en el canvas | **Sí** |
| `lib/infrastructure/rag/noop-retriever.adapter.ts` | RAG vacío (Incremento 1) | No |
| `lib/infrastructure/storage/local-storage-chat.repository.ts` | Historial en `localStorage` | **Sí** |

La lógica que se puede probar sin navegador está separada del dibujo.

## `severity-palette.ts`
- `SEVERITY_PALETTE`: `{ stroke, fill }` por nivel (`LOW` esmeralda, `MEDIUM` ámbar, `HIGH` rojo).
- `ANNOTATION_OUTLINE_COLOR`: contorno oscuro exterior.
- `ANNOTATION_LABEL_TEXT_COLOR`: texto oscuro sobre la pastilla.

## `annotation-layout.ts`
- `computeStrokeWidth(w, h)`: `max(3, round(ladoMayor × 0.004))`. Líneas nítidas en fotos de 640 px y de 4000 px.
- `computeFontSize(w, h)`: `max(14, round(ladoMayor × 0.018))`.
- `computeLabelHeight(fontSize)`: alto de la pastilla (fuente más relleno vertical).
- `buildLabelText(annotation)`: `#1 · Label`; si el label pasa de 45 caracteres lo corta y añade `…`.
- `computeLabelPosition(rect, labelWidth, labelHeight, imageW, imageH)`: coloca la pastilla **arriba** del recuadro si cabe; si no, **debajo**; si tampoco, **dentro** del borde superior. En X se limita para no salirse de la imagen.

## `CanvasImageAnnotatorService`
Implementa `ImageAnnotatorPort`. `renderAnnotatedImage(imageSource, annotations)`:
1. Carga la imagen (`loadImage`) y toma su `naturalWidth × naturalHeight`.
2. Crea un canvas de ese tamaño exacto (`createContext`) y dibuja la foto.
3. Ordena las anotaciones por severidad (`compareBySeverity`) para que `HIGH` se pinte al final y quede encima.
4. Por cada una (`drawAnnotation`):
   - `drawBoxFill`: relleno translúcido.
   - `drawBoxStroke`: doble trazo (contorno oscuro + trazo de color).
   - `drawCornerBrackets`: esquinas reforzadas (25 % del lado menor).
   - `drawLabelPill`: pastilla con color de severidad y texto monoespaciado.
5. Devuelve un Data URL `image/png` con los recuadros ya pintados en los píxeles.

Las coordenadas pasan por `toPixelRect`, que ya sanea el recuadro (Doc 03).

## `NoopKnowledgeRetriever`
`retrieveRelevantGuides()` devuelve siempre `[]`. Permite construir el caso de uso con el puerto RAG sin cambiarlo cuando llegue el Incremento 2.

## `LocalStorageChatRepository`
Clave `fixen:chat-history:v1`; guarda `{ version: 1, messages }`.
- `loadMessages()`: devuelve `[]` si no hay datos, si el JSON está corrupto o si la versión no coincide.
- `saveMessages(messages)`: si se excede la cuota o el almacenamiento está bloqueado, no lanza error; el chat sigue en memoria.
- `clearHistory()`: borra la clave, también sin lanzar errores.

## Límites conocidos
- Las imágenes se guardan como Data URL dentro del historial; las fotos grandes pueden llenar la cuota de `localStorage` (~5 MB). En ese caso el guardado falla en silencio. Conviene considerar reducir la imagen o limitar el historial en la Fase 5.
- El dibujo en canvas se verificó con tipos y lint, pero no se renderizó en un navegador; las funciones de layout sí tienen verificación con script.

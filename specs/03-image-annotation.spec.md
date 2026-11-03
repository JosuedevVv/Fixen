# SDD Spec 03: Recepción, Normalización y Modificación de Imágenes (`03-image-annotation`)

- **Estado:** Aprobado para Incremento 1
- **Ubicación objetivo en código:** `lib/domain/bounding-box.ts`, `lib/infrastructure/image/canvas-image-annotator.service.ts`
- **Principio rector:** Precisión Espacial 1:1 y Responsabilidad Única (SRP).

---

## 1. Validación de Entrada de Imágenes

El hook/validador de adjuntos (`lib/domain/image-validation.ts` y `hooks/useImageAttachment.ts`) debe verificar antes de enviar al servidor:
- **Formatos permitidos:** `image/jpeg`, `image/png`, `image/webp`.
- **Tamaño máximo:** `10 MB` (`10 * 1024 * 1024` bytes).
- **Dimensiones mínimas:** `120px × 120px` para garantizar que el análisis visual tenga suficiente detalle.

---

## 2. Geometría y Normalización de Coordenadas (`lib/domain/bounding-box.ts`)

El modelo de visión entrega cada recuadro en escala normalizada `[0, 1000]` (`ymin, xmin, ymax, xmax`).

### Reglas de Sanitización Geométrica (`sanitizeNormalizedBox`)
1. **Clamping:** Todo valor se restringe al rango `[0, 1000]`.
2. **Corrección de Inversión:** Si `xmin > xmax`, se intercambian; si `ymin > ymax`, se intercambian.
3. **Tamaño Mínimo Visible:** Si `(xmax - xmin) < 20`, se expande simétricamente hasta un mínimo de `20` unidades normalizadas (2% del ancho) para evitar recuadros invisibles de 1px. Lo mismo aplica para `(ymax - ymin) < 20`.

### Conversión a Píxeles Nativos (`toPixelRect`)
Dadas las dimensiones reales de la imagen (`naturalWidth`, `naturalHeight`):

$$x = \frac{\text{xmin}}{1000} \times \text{naturalWidth}, \quad y = \frac{\text{ymin}}{1000} \times \text{naturalHeight}$$

$$\text{width} = \frac{\text{xmax} - \text{xmin}}{1000} \times \text{naturalWidth}, \quad \text{height} = \frac{\text{ymax} - \text{ymin}}{1000} \times \text{naturalHeight}$$

---

## 3. Especificación de Pintado sobre la Imagen (`CanvasImageAnnotatorService`)

El servicio `CanvasImageAnnotatorService` (que implementa `ImageAnnotatorPort`) tiene una única responsabilidad: tomar el `dataUrl` original de la imagen y el arreglo de `FaultAnnotation[]`, y devolver un nuevo `dataUrl` (`image/png`) con las anotaciones quemadas directamente en los píxeles de la imagen a resolución nativa.

### Paleta Semántica de Recuadros de Ayuda
| Nivel (`severity`) | Color de Borde y Etiqueta (`stroke`) | Relleno Translúcido (`fill`) | Significado Visual |
| :--- | :--- | :--- | :--- |
| `"LOW"` | `#10B981` (Emerald 500) | `rgba(16, 185, 129, 0.14)` | Falla menor / reparación sencilla |
| `"MEDIUM"` | `#F59E0B` (Amber 500) | `rgba(245, 158, 11, 0.16)` | Falla moderada / requiere precaución |
| `"HIGH"` | `#EF4444` (Red 500) | `rgba(239, 68, 68, 0.22)` | **Zona crítica de peligro — No intervenir** |

### Reglas de Renderizado Visual en el Canvas
1. **Escala Proporcional a la Resolución:**
   - El grosor de línea (`lineWidth`) se calcula dinámicamente en función de la dimensión mayor de la imagen: `Math.max(3, Math.round(Math.max(naturalWidth, naturalHeight) * 0.004))` para que los recuadros se vean nítidos tanto en fotos de `640px` como de `4000px`.
2. **Doble Trazo de Alto Contraste:**
   - Se dibuja primero un contorno exterior oscuro sutil (`rgba(9, 13, 22, 0.65)`) y encima el trazo semántico principal + esquinas técnicas reforzadas (*corner brackets*), garantizando legibilidad sobre fondos claros u oscuros.
3. **Etiqueta Numerada (`Pill Badge`):**
   - Cada recuadro pinta una pastilla superior (o inferior si `y < 36px` para no salirse del borde superior de la foto) con el formato `#1 · {label}`.
   - Fuente monoespaciada/técnica en negrita con texto de alto contraste.

---

## 4. Visor Híbrido en la Interfaz (`AnnotatedImageCard`)

El usuario podrá interactuar con la imagen procesada mediante tres controles claros:
1. **Vista "Imagen Modificada (Con Recuadros)"** *(Activa por defecto)*: Muestra la imagen rasterizada generada por `CanvasImageAnnotatorService` junto con la interacción de selección por hallazgo.
2. **Vista "Original (Comparar)"**: Permite alternar instantáneamente con la foto original sin marcas para inspeccionar el área limpia.
3. **Acción "Descargar Diagnóstico Visual"**: Permite guardar el archivo `.png` modificado con los recuadros pintados (útil para enviárselo a un especialista cuando el riesgo es `HIGH`).

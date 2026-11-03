# Doc 03 — Validación de Imágenes y Geometría de Recuadros

Implementa (parte de dominio): [`specs/03-image-annotation.spec.md`](../specs/03-image-annotation.spec.md)

Son funciones puras: no usan el DOM, `File` ni `canvas`. El pintado real en canvas (`CanvasImageAnnotatorService`) se hará en la Fase 3 y consumirá estas funciones.

## `lib/domain/image-validation.ts`

Constantes: formatos `image/jpeg`, `image/png`, `image/webp`; máximo `10 MB`; mínimo `120 px` por lado.

### `isSupportedImageMimeType(mimeType)`
Type guard: dice si un MIME es uno de los tres permitidos y lo estrecha a `SupportedImageMimeType`.

### `validateImageFile({ type, size })`
Se ejecuta **antes de leer el archivo**. Devuelve `{ valid: true }` o `{ valid: false, reason }`. Rechaza, en este orden:
1. Formato no soportado.
2. Archivo vacío (`size <= 0`).
3. Archivo mayor a 10 MB.

### `validateImageDimensions(width, height)`
Se ejecuta **después de decodificar** la imagen. Rechaza si algún lado mide menos de 120 px, porque el modelo no tendría detalle suficiente.

Los mensajes (`reason`) están pensados para mostrarse tal cual al usuario.

## `lib/domain/bounding-box.ts`

El modelo entrega recuadros en escala 0–1000. Estas funciones los hacen seguros y los convierten a píxeles.

### `sanitizeNormalizedBox(box)`
Corrige un recuadro posiblemente defectuoso:
1. **Clamping**: cada valor se limita a `[0, 1000]` (valores no finitos pasan a `0`).
2. **Inversión**: si `min > max` en un eje, se intercambian.
3. **Tamaño mínimo**: si un eje mide menos de 20 unidades (2 %), se expande simétricamente. Si al expandir se sale del rango, se desplaza para quedar dentro sin perder el tamaño mínimo.

### `toPixelRect(box, naturalWidth, naturalHeight)`
Sanea el recuadro y lo convierte a píxeles de la imagen original:

```
x      = xmin / 1000 * naturalWidth
y      = ymin / 1000 * naturalHeight
width  = (xmax - xmin) / 1000 * naturalWidth
height = (ymax - ymin) / 1000 * naturalHeight
```

Ejemplo: `{ ymin:0, xmin:500, ymax:500, xmax:1000 }` en una imagen 2000×1000 → `{ x:1000, y:0, width:1000, height:500 }`.

### Función interna
- `normalizeAxis(a, b)`: aplica clamping, orden y tamaño mínimo a un solo eje; `sanitizeNormalizedBox` la usa para X e Y.

## Pendiente (Fases 3 y 5)
- `CanvasImageAnnotatorService`: pintado de recuadros, colores y etiquetas.
- `useImageAttachment`: lectura del archivo y llamada a estas validaciones.

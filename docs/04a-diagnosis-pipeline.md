# Doc 04a — Pipeline de Diagnóstico (Fase 4)

Implementa el flujo servidor de la [spec 01](../specs/01-domain-contracts.spec.md) y [spec 02](../specs/02-safety-guardrail.spec.md): `POST /api/diagnose`.

## Flujo completo

```
Cliente → POST /api/diagnose
  → route.ts                 traduce Request/Response (sin lógica)
  → DiagnoseHomeIssueUseCase
      1. validateDiagnoseInput      valida el JSON sin confiar en él
      2. KnowledgeRetrieverPort     contexto RAG (vacío en el Incremento 1)
      3. VisionAnalyzerPort         Gemini o Mock → diagnóstico CRUDO
         └ parseModelDiagnosis      normaliza la respuesta del modelo
      4. enforceHighRiskSafetyGuardrail   última barrera (Doc 02)
  ← { diagnosis, engine }
```

El pintado de recuadros **no** ocurre aquí: el servidor solo devuelve coordenadas y el cliente dibuja (Doc 03b).

## Respuestas del endpoint

| Caso | Código | Cuerpo |
| :--- | :--- | :--- |
| Éxito | 200 | `{ diagnosis, engine: "gemini" \| "mock" }` |
| Cuerpo no JSON o entrada inválida | 400 | `{ error }` |
| Falla del modelo o respuesta inutilizable | 502 | `{ error }` (el detalle va solo al log del servidor) |
| `GET` u otro método | 405 | Automático de Next.js |

## Archivos y funciones

### `app/api/diagnose/route.ts`
`POST(request)`: lee el JSON, crea el caso de uso con `composeDiagnoseHomeIssue()`, lo ejecuta y mapea errores: `DiagnosisInputError` → 400; cualquier otro → 502 con `console.error`. No contiene lógica de negocio.

### `lib/application/diagnosis-errors.ts`
- `DiagnosisInputError`: la petición es inválida.
- `VisionAnalysisError`: falló el modelo o su respuesta. Guarda la causa original (`cause`).

Así la ruta decide el código HTTP por **tipo de error**, no leyendo mensajes.

### `lib/application/diagnose-home-issue.use-case.ts`
`DiagnoseHomeIssueUseCase.execute(body)`: orquesta el flujo de arriba. Recibe sus dependencias por constructor (`visionAnalyzer`, `knowledgeRetriever`), por eso no conoce Gemini. `retrieveContextSafely` hace que un fallo del RAG **no** aborte el diagnóstico: se continúa sin contexto.

### `lib/domain/diagnose-input-validation.ts`
`validateDiagnoseInput(body: unknown)` devuelve `{ valid: true, input }` o `{ valid: false, reason }`:
- Mensaje: texto, máx. 2000 caracteres. Si viene vacío se sustituye por `DEFAULT_USER_MESSAGE`.
- `mimeType`: JPG, PNG o WEBP.
- `imageBase64`: no vacío, Base64 **sin** prefijo `data:`, y ≤ 10 MB ya decodificado.
- Historial: se descartan turnos mal formados y se conservan los últimos 10.

Funciones internas: `estimateDecodedBytes` (calcula el peso real sin decodificar: 4 caracteres = 3 bytes, menos el relleno `=`) y `sanitizeHistory`.

### `lib/infrastructure/ai/system-prompts.ts`
`DIAGNOSIS_SYSTEM_PROMPT`: instrucciones del modelo. Puntos clave: postura escéptica (ante la duda, `HIGH`); lista de disparadores de riesgo alto; en `HIGH` **prohíbe** `repairPlan` y limita `emergencyContainmentAdvice` a acciones pasivas; formato `box_2d = [ymin, xmin, ymax, xmax]` en 0–1000; y trata el mensaje del usuario y el texto dentro de la imagen como **datos, no instrucciones** (defensa ante prompt injection). Es la primera barrera; la definitiva es el guardrail.

### `lib/infrastructure/ai/diagnosis-response-schema.ts`
`DIAGNOSIS_RESPONSE_SCHEMA`: JSON Schema que obliga a Gemini a responder con la estructura esperada. Los campos opcionales (`repairPlan`, `specialistType`) se **omiten** en vez de usar `null`, porque es más fiable con salida estructurada.

### `lib/infrastructure/ai/diagnosis-response-parser.ts`
`parseModelDiagnosis(rawText, meta)`: convierte el texto del modelo en `DiagnosisResultDTO`. Asume que el modelo puede equivocarse y normaliza **hacia el lado seguro**:

| Situación | Resultado |
| :--- | :--- |
| `riskLevel` ausente o inválido | `HIGH` |
| Severidad de anotación inválida | `HIGH` |
| `box_2d` sin 4 números finitos | La anotación se descarta |
| Anotaciones válidas | Se renumeran `fault-1`, `fault-2`… (consecutivas) |
| Texto con vallas ```` ```json ```` | Se quitan (`stripCodeFences`) |
| Paso con `relatedAnnotationIndex` fuera de rango | Se conserva sin vínculo |
| Plan sin ningún paso utilizable | `repairPlan = null` |
| Texto que no es un objeto JSON | Lanza `VisionAnalysisError` |

Funciones internas: `parseAnnotations`, `parseBox`, `parseSteps`, `parseRepairPlan`, `parseSafetyLock` y helpers de tipo (`asText`, `asTextList`, `asRiskLevel`). **No aplica el guardrail**: eso es responsabilidad del caso de uso.

### `lib/infrastructure/ai/vision-analyzer.adapter.ts`
`GeminiVisionAnalyzer.analyzeHomeIssue(input, ragContext)`: arma la petición (historial como turnos previos + imagen + mensaje, con las guías RAG añadidas al texto si hay), la envía con `responseMimeType: "application/json"`, el schema y `temperature: 0.2` (consistencia antes que creatividad), y pasa la respuesta por el parser. Lanza `VisionAnalysisError` si la llamada falla o la respuesta viene vacía (p. ej. bloqueo de seguridad del modelo). Modelo por defecto: `gemini-2.5-flash`.

### `lib/infrastructure/ai/mock-vision-analyzer.adapter.ts`
`MockVisionAnalyzer`: siempre devuelve el mismo diagnóstico `MEDIUM` de ejemplo, **con** plan de reparación. Sirve para desarrollar la UI sin API key ni costo, y para ver el guardrail en acción: si el mensaje describe un peligro (p. ej. "humedad sobre un enchufe"), el guardrail lo escala a `HIGH` y elimina el plan.

### `lib/infrastructure/composition/diagnose.composition.ts`
`composeDiagnoseHomeIssue()`: único lugar donde se eligen implementaciones. Con `GEMINI_API_KEY` usa `GeminiVisionAnalyzer`; sin ella, `MockVisionAnalyzer`. Devuelve también `engine` para que la UI pueda mostrar "Gemini" o "Modo demo".

## Configuración
Copia `.env.example` a `.env.local` y completa `GEMINI_API_KEY` (clave gratuita en Google AI Studio). `GEMINI_MODEL` es opcional. Sin clave, la app funciona en modo demo.

## Qué se verificó
- `tsc` (estricto) y `eslint` sin errores.
- Script temporal sobre parser, validación y caso de uso (con el mock): normalización de respuestas defectuosas, rechazo de entradas inválidas, escalado a `HIGH` con purga del plan, y RAG que falla sin romper el diagnóstico.
- Endpoint real con `next dev` en modo demo: 200 con diagnóstico `MEDIUM`; 200 con `HIGH`, `repairPlan: null` e `isRepairBlocked: true` ante "humedad sobre un enchufe"; 400 por formato de imagen inválido y por cuerpo no JSON; 405 en `GET`.

## Límites conocidos
- **`GeminiVisionAnalyzer` no se probó contra la API real** (no hay clave configurada). La construcción de la petición y el schema están tipados y revisados, pero la primera llamada real puede requerir ajustes. Conviene probarlo con una foto real al añadir la clave.
- La calidad de los recuadros de Gemini y la efectividad del prompt solo se pueden juzgar con imágenes reales.
- No hay límite de peticiones por usuario: con la clave gratuita, un uso intensivo agotará la cuota (responderá 502).
- El `console.error` registra el error completo en el servidor; no se expone al cliente.

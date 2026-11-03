# Doc 01 — Contratos de Dominio y Puertos

Implementa: [`specs/01-domain-contracts.spec.md`](../specs/01-domain-contracts.spec.md)

Esta capa no tiene lógica: solo define **la forma de los datos** y **los puertos** (interfaces) que el resto del sistema usa. No importa React, Next.js ni SDKs.

## Archivos

| Archivo | Qué contiene |
| :--- | :--- |
| `lib/contracts/diagnosis.contract.ts` | Tipos del diagnóstico |
| `lib/contracts/chat.contract.ts` | Tipos de los mensajes del chat |
| `lib/ports/vision-analyzer.port.ts` | Puerto del modelo de visión |
| `lib/ports/image-annotator.port.ts` | Puerto del pintor de recuadros |
| `lib/ports/knowledge-retriever.port.ts` | Puerto del RAG (Incremento 2) |
| `lib/ports/chat-repository.port.ts` | Puerto de persistencia del historial |

## Tipos principales

- **`RiskLevel`**: `"LOW" | "MEDIUM" | "HIGH"`. Es el único vocabulario de riesgo del proyecto.
- **`NormalizedBoundingBox`**: recuadro `{ ymin, xmin, ymax, xmax }` en escala 0–1000. Al ser relativo, funciona con cualquier resolución de imagen.
- **`FaultAnnotation`**: una falla detectada: `id`, `index` (número pintado), `label`, `description`, `severity` y `box`.
- **`RepairPlan`**: herramientas, materiales, precauciones y pasos numerados. Cada paso puede apuntar a una anotación con `relatedAnnotationId`.
- **`SafetyLockDirective`**: el bloqueo de seguridad (`isRepairBlocked`, `specialistType`, `skepticalReasoning`, `emergencyContainmentAdvice`).
- **`DiagnoseIssueInputDTO`**: lo que entra al caso de uso (mensaje, imagen en Base64, MIME e historial opcional).
- **`DiagnosisResultDTO`**: lo que sale. Invariante documentada: `repairPlan` es `null` si el riesgo es `HIGH` o `isRepairBlocked` es `true`. Esa invariante la hace cumplir el guardrail (Doc 02).
- **`ChatMessage`** (`UserChatMessage | AssistantChatMessage`): unión discriminada por `role`. El mensaje del asistente guarda el diagnóstico y el Data URL de la imagen anotada.

## Puertos

Un puerto es una interfaz que el caso de uso conoce; la implementación concreta vive en `infrastructure/` y se inyecta. Así se puede cambiar Gemini por otro modelo, o `localStorage` por una base de datos, sin tocar el dominio.

| Puerto | Método | Qué hace |
| :--- | :--- | :--- |
| `VisionAnalyzerPort` | `analyzeHomeIssue(input, ragContext?)` | Analiza la imagen y devuelve un diagnóstico **sin sanear** (todavía no pasó por el guardrail). |
| `ImageAnnotatorPort` | `renderAnnotatedImage(imageSource, annotations)` | Pinta los recuadros y devuelve un Data URL PNG. |
| `KnowledgeRetrieverPort` | `retrieveRelevantGuides(query, detectedLabels?)` | Devuelve fragmentos de guías. En el Incremento 1 devolverá `[]`; el RAG lo implementa después. |
| `ChatRepositoryPort` | `loadMessages()`, `saveMessages()`, `clearHistory()` | Lee, guarda y borra el historial. |

## Cómo se relacionan

```
Usuario → DiagnoseIssueInputDTO → VisionAnalyzerPort → DiagnosisResultDTO (crudo)
        → guardrail (Doc 02) → ImageAnnotatorPort (Doc 03) → ChatMessage → ChatRepositoryPort
```

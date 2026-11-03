# SDD Spec 01: Contratos de Dominio, DTOs y Puertos (`01-domain-contracts`)

- **Estado:** Aprobado para Incremento 1
- **Ubicación objetivo en código:** `lib/contracts/diagnosis.contract.ts`, `lib/ports/*.port.ts`
- **Principio rector:** Responsabilidad Única (SRP) e Inversión de Dependencias (DIP). Este módulo **no puede importar** código de React, Next.js ni SDKs externos.

---

## 1. Taxonomía de Niveles de Riesgo (`RiskLevel`)

Todo diagnóstico clasifica el problema doméstico en exactamente uno de tres niveles:

| Valor (`RiskLevel`) | Etiqueta UI | Criterio de Dominio | ¿Permite Instrucciones de Reparación? |
| :--- | :--- | :--- | :--- |
| `"LOW"` | Riesgo Bajo | Reparaciones cosméticas o domésticas simples sin riesgo físico ni de daños mayores (ej. bisagra floja, aireador de grifo obstruido, fisura superficial de pintura). | **Sí** (Guía paso a paso completa) |
| `"MEDIUM"` | Riesgo Medio | Reparaciones que requieren herramientas manuales básicas y precauciones estándar como cortar llave de paso local (ej. cambio de sifón bajo lavabo, reemplazo de sapito de inodoro, sellado de junta de silicona). | **Sí** (Guía paso a paso + checklist preventivo obligatorio) |
| `"HIGH"` | Riesgo Alto | Fallas graves, estructurales, de gas, eléctricas o fugas de agua con riesgo de inundación/cortocircuito, o **cualquier caso ambiguo donde exista sospecha razonable de peligro**. | **NO (Bloqueo estricto y obligatorio)** |

---

## 2. Contrato Espacial de Recuadros de Ayuda (`BoundingBoxAnnotation`)

El modelo de visión detecta las zonas de falla devolviendo coordenadas normalizadas en escala `[0, 1000]` (estándar nativo de Gemini 2.5 Vision `box_2d`), independientes de la resolución de la imagen original.

```ts
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface NormalizedBoundingBox {
  /** Coordenada superior normalizada (0 a 1000, donde ymin < ymax) */
  ymin: number;
  /** Coordenada izquierda normalizada (0 a 1000, donde xmin < xmax) */
  xmin: number;
  /** Coordenada inferior normalizada (0 a 1000) */
  ymax: number;
  /** Coordenada derecha normalizada (0 a 1000) */
  xmax: number;
}

export interface FaultAnnotation {
  /** Identificador secuencial legible, ej. "fault-1" */
  id: string;
  /** Número de referencia visual pintado en el recuadro (1, 2, 3...) */
  index: number;
  /** Título breve de la falla detectada (máx. 45 caracteres) */
  label: string;
  /** Explicación concisa de lo que se observa en este recuadro */
  description: string;
  /** Nivel de severidad específico de este hallazgo */
  severity: RiskLevel;
  /** Coordenadas normalizadas [0..1000] */
  box: NormalizedBoundingBox;
}
```

---

## 3. Contrato de Asistencia de Reparación y Bloqueo de Seguridad

```ts
export interface RepairStep {
  stepNumber: number;
  title: string;
  instruction: string;
  /** ID opcional del recuadro relacionado (ej. "fault-1") para resaltarlo en la UI */
  relatedAnnotationId?: string;
}

export interface RepairPlan {
  estimatedTimeMinutes: number;
  difficultyLabel: "Fácil" | "Moderada";
  toolsRequired: string[];
  materialsRequired: string[];
  safetyPrecautions: string[];
  steps: RepairStep[];
}

export interface SafetyLockDirective {
  /** true siempre que riskLevel === "HIGH" */
  isRepairBlocked: boolean;
  /** Especialista certificado requerido cuando isRepairBlocked === true */
  specialistType: string | null;
  /** Razón escéptica por la que se bloquea la intervención casera */
  skepticalReasoning: string | null;
  /** Acciones pasivas de contención (ej. "Cortar llave general sin tocar cables"), NUNCA instrucciones de reparación */
  emergencyContainmentAdvice: string[];
}
```

---

## 4. DTOs de Entrada y Salida del Caso de Uso

### Entrada (`DiagnoseIssueRequestDTO`)
```ts
export type SupportedImageMimeType = "image/jpeg" | "image/png" | "image/webp";

export interface DiagnoseIssueInputDTO {
  /** Descripción o pregunta del usuario */
  userMessage: string;
  /** Imagen codificada en Base64 (sin prefijo data: URL) */
  imageBase64: string;
  /** Tipo MIME validado */
  mimeType: SupportedImageMimeType;
  /** Historial breve de mensajes previos para contexto conversacional */
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}
```

### Salida (`DiagnosisResultDTO`)
```ts
export interface DiagnosisResultDTO {
  id: string;
  createdAt: string;
  /** Título claro del diagnóstico */
  issueTitle: string;
  /** Explicación general del problema detectado */
  summary: string;
  /** Clasificación global de riesgo (determinada con sesgo escéptico) */
  riskLevel: RiskLevel;
  /** Justificación técnica del nivel de riesgo */
  riskJustification: string;
  /** Lista de recuadros de ayuda detectados en la imagen */
  annotations: FaultAnnotation[];
  /** Directiva de bloqueo de seguridad */
  safetyLock: SafetyLockDirective;
  /**
   * Plan de reparación paso a paso.
   * INVARIANTE DE DOMINIO: Debe ser estrictamente `null` si `riskLevel === "HIGH"` o `safetyLock.isRepairBlocked === true`.
   */
  repairPlan: RepairPlan | null;
}
```

---

## 5. Especificación de Puertos (Interfaces para Inversión de Dependencias)

Cada puerto vive en su propio archivo bajo `lib/ports/` cumpliendo SRP:

1. **`VisionAnalyzerPort` (`lib/ports/vision-analyzer.port.ts`)**:
   - `analyzeHomeIssue(input: DiagnoseIssueInputDTO, ragContext?: string[]): Promise<DiagnosisResultDTO>`
2. **`ImageAnnotatorPort` (`lib/ports/image-annotator.port.ts`)**:
   - `renderAnnotatedImage(imageSource: string, annotations: FaultAnnotation[]): Promise<string>`
   - Recibe la imagen original y las anotaciones validadas, y devuelve un `Data URL` (`image/png`) con los recuadros de ayuda, etiquetas numeradas y bordes semánticos pintados sobre los píxeles.
3. **`KnowledgeRetrieverPort` (`lib/ports/knowledge-retriever.port.ts`)**:
   - `retrieveRelevantGuides(query: string, detectedLabels?: string[]): Promise<string[]>`
   - *Nota Incremento 1:* Implementado por `NoopKnowledgeRetriever` devolviendo `[]`, dejando lista la arquitectura para conectar el RAG en el Incremento 2 sin modificar `DiagnoseHomeIssueUseCase`.
4. **`ChatRepositoryPort` (`lib/ports/chat-repository.port.ts`)**:
   - `loadMessages(): ChatMessage[]`
   - `saveMessages(messages: ChatMessage[]): void`
   - `clearHistory(): void`
   - *Nota Incremento 1:* Implementado en cliente mediante `LocalStorageChatRepository`.

# SDD Spec 02: Regla Escéptica de Riesgo Alto y Bloqueo de Reparación (`02-safety-guardrail`)

- **Estado:** Aprobado para Incremento 1
- **Ubicación objetivo en código:** `lib/domain/risk-policy.ts`, `lib/domain/safety-guardrail.ts`
- **Principio rector:** Seguridad Determinista por Diseño. Ningún fallo de alucinación del modelo de IA puede filtrar instrucciones de reparación cuando una falla es grave o sospechosa de serlo.

---

## 1. Política de Escepticismo Preventivo (Skeptical Risk Policy)

El sistema debe comportarse de forma **escéptica y conservadora** ante posibles riesgos domésticos. Ante la duda entre `"MEDIUM"` y `"HIGH"`, tanto el prompt del modelo como la política de dominio deben escalar la clasificación a `"HIGH"`.

### Disparadores Automáticos de Riesgo Alto (`HIGH`)
Se clasificará obligatoriamente como `"HIGH"` cualquier imagen o consulta que involucre:
1. **Riesgo Eléctrico o Electrocución:**
   - Agua, filtraciones o humedad activa a menos de 1 metro de tomacorrientes, interruptores, cables pelados o tableros eléctricos.
   - Marcas de quemaduras, chispazos, cables derretidos o tableros abiertos.
2. **Riesgo Estructural:**
   - Grietas diagonales o escalonadas profundas en muros de carga, columnas, vigas o losas (especialmente si superan 3-5 mm de espesor o presentan desprendimiento de concreto/armadura).
   - Hundimientos o pandeos en techos por acumulación severa de agua.
3. **Riesgo de Gas / Combustión / Presión Térmica:**
   - Tuberías de gas (amarillas/cobre con válvulas de gas), calderas, calentadores/boilers con fugas, corrosión severa u olor a gas reportado.
4. **Inundación o Fuga Presurizada Incontrolable:**
   - Ruptura de tubería matriz o llave de paso general rota donde el usuario no puede cortar el suministro de forma segura.

---

## 2. Invariantes del Bloqueo de Seguridad (`SafetyGuardrail`)

La función pura `enforceHighRiskSafetyGuardrail(rawResult: DiagnosisResultDTO, userMessage: string): DiagnosisResultDTO` en `lib/domain/safety-guardrail.ts` tiene una única responsabilidad: garantizar las siguientes invariantes matemáticas antes de entregar cualquier respuesta al cliente:

1. **Invariante de Propagación de Severidad:**
   - Si al menos una anotación en `rawResult.annotations` tiene `severity === "HIGH"`, el `riskLevel` global del diagnóstico se fuerza automáticamente a `"HIGH"`.
2. **Invariante de Esccepticismo por Palabras Clave Críticas:**
   - Si el texto del usuario o las descripciones detectadas contienen patrones de peligro crítico (ej. olor a gas, chispas, cables con agua, grieta en viga/columna) y el modelo devolvió `"LOW"` o `"MEDIUM"`, la política escala `riskLevel` a `"HIGH"`.
3. **Invariante de Purga Total de Instrucciones (`Hard Block`):**
   - Cuando `riskLevel === "HIGH"` (o `safetyLock.isRepairBlocked === true`):
     - `result.repairPlan` **DEBE** establecerse en `null` (incluso si el LLM generó pasos en el JSON).
     - `result.safetyLock.isRepairBlocked` **DEBE** ser `true`.
     - `result.safetyLock.specialistType` **DEBE** contener un especialista válido (por defecto `"Especialista Técnico Certificado"` si venía vacío).
     - `result.safetyLock.skepticalReasoning` **DEBE** explicar por qué el sistema adopta una postura escéptica y rechaza dar instrucciones de bricolaje.
     - `result.annotations` **SE CONSERVAN**: Los recuadros de ayuda siguen pintándose en color rojo (`#EF4444`) sobre la imagen para que el usuario (y el especialista) identifiquen visualmente la zona de peligro.

---

## 3. Escenarios de Aceptación (Given / When / Then)

### Escenario 1: Fuga menor en sifón de lavabo (`LOW` / `MEDIUM`)
- **Given:** El usuario sube una foto de un goteo leve en la rosca plástica del sifón bajo el lavabo sin cables cerca.
- **When:** `DiagnoseHomeIssueUseCase` procesa el diagnóstico.
- **Then:**
  - `riskLevel` es `"LOW"` o `"MEDIUM"`.
  - `safetyLock.isRepairBlocked` es `false`.
  - `repairPlan` contiene herramientas, precauciones y pasos numerados vinculados al recuadro `#1`.

### Escenario 2: Filtración de agua junto a caja eléctrica (`HIGH` directo)
- **Given:** El usuario sube una foto de una mancha de humedad goteando sobre un enchufe de pared.
- **When:** El modelo analiza la imagen.
- **Then:**
  - `riskLevel` es `"HIGH"`.
  - La imagen se modifica pintando los recuadros de alerta en rojo (`severity: "HIGH"`).
  - `safetyLock.isRepairBlocked` es `true` y recomienda `"Electricista Certificado y Plomero"`.
  - `repairPlan` es estrictamente `null`.

### Escenario 3: Defensa contra alucinación del LLM en Riesgo Alto (`Guardrail Determinista`)
- **Given:** El modelo clasifica `riskLevel: "HIGH"` (o detecta un recuadro `severity: "HIGH"`), pero por error del LLM incluye un objeto `repairPlan` con 4 pasos de reparación.
- **When:** El resultado pasa por `enforceHighRiskSafetyGuardrail`.
- **Then:**
  - El guardrail destruye el objeto `repairPlan` (`repairPlan: null`), activa `isRepairBlocked: true` y preserva únicamente la alerta de especialista y los recuadros visuales de peligro.

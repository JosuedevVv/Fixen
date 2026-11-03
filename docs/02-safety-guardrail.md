# Doc 02 — Política de Riesgo y Guardrail de Seguridad

Implementa: [`specs/02-safety-guardrail.spec.md`](../specs/02-safety-guardrail.spec.md)

**Idea central:** no confiar solo en el prompt del modelo. Aunque la IA devuelva pasos de reparación para un caso grave, este código los elimina de forma determinista.

## `lib/domain/risk-policy.ts`

Decide el nivel de riesgo final con sesgo escéptico (ante la duda, sube).

### `getHighestSeverity(annotations)`
Recorre las anotaciones y devuelve la severidad más alta (`LOW < MEDIUM < HIGH`). Devuelve `null` si no hay anotaciones.

### `containsCriticalHazard(text)`
Revisa el texto contra una lista de disparadores (`CRITICAL_HAZARD_TRIGGERS`). Cada disparador es una lista de patrones que deben aparecer **todos** juntos:

| Peligro | Ejemplo de disparador |
| :--- | :--- |
| Gas | "olor a gas", "fuga de gas" |
| Caldera/boiler | "calentador" **y** "fuga/corrosión" |
| Eléctrico directo | "chispa", "cable pelado", "cortocircuito" |
| Agua + electricidad | "humedad/goteo" **y** "enchufe/tablero/cable" |
| Estructural | "grieta" **y** "viga/columna/muro de carga/losa" |
| Hundimiento | "pandeo/hundimiento" **y** "techo/muro/piso" |
| Fuga presurizada | "tubería matriz/llave general" **y** "rota/reventó" |

Los patrones están en español y no distinguen mayúsculas ni acentos comunes.

### `resolveRiskLevel({ declaredRisk, annotations, textsToScan })`
Orden de decisión:
1. Si alguna anotación es `HIGH` → `HIGH`.
2. Si el texto contiene un peligro crítico → `HIGH`.
3. Si no → el riesgo que declaró el modelo.

Nunca baja el riesgo declarado; solo puede subirlo.

## `lib/domain/safety-guardrail.ts`

### `enforceHighRiskSafetyGuardrail(rawResult, userMessage)`
Recibe el diagnóstico crudo del modelo y devuelve una **copia** (no muta la entrada) con las invariantes aplicadas.

1. Junta los textos a revisar: mensaje del usuario, título, resumen y etiquetas/descripciones de cada anotación.
2. Llama a `resolveRiskLevel`.
3. Decide si **bloquea**: riesgo final `HIGH` **o** el modelo ya marcó `isRepairBlocked = true`.
4. **Si no bloquea:** devuelve el diagnóstico con `isRepairBlocked = false` y el plan intacto.
5. **Si bloquea:**
   - `riskLevel = "HIGH"`.
   - `repairPlan = null` (se elimina aunque el modelo lo haya generado).
   - `safetyLock.isRepairBlocked = true`.
   - Si faltan, rellena `specialistType` ("Especialista Técnico Certificado") y `skepticalReasoning` con textos por defecto.
   - Si el riesgo fue subido por la política (no por el modelo), añade una nota a `riskJustification`.
   - Las `annotations` se conservan para que los recuadros rojos sigan pintándose.

### Funciones internas
- `buildBlockedSafetyLock(current)`: arma el bloqueo con valores por defecto donde falte información.
- `collectTextsToScan(result, userMessage)`: reúne los textos que se analizan en busca de peligros.

## Límites conocidos
- El guardrail **no puede verificar** que `emergencyContainmentAdvice` sea solo contención pasiva; eso depende del prompt del modelo (se definirá en la Fase 4).
- Es conservador: puede escalar a `HIGH` por una mención como "no hay enchufes cerca de la humedad". Se prefiere un falso positivo a un falso negativo.
- Cubre texto en español.

## Casos verificados
Con un script temporal se comprobó: caso LOW conserva el plan; agua + enchufe escala a HIGH; el modelo que alucina un plan con HIGH queda purgado; anotación HIGH propaga; `isRepairBlocked` con LOW sube a HIGH; gas y grieta en viga escalan; la entrada no se muta.

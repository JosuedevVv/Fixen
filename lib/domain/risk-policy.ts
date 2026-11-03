/**
 * Política de riesgo escéptica (Spec 02, sección 1).
 * Funciones puras: deciden el nivel de riesgo final sin conocer la UI ni el modelo de IA.
 */

import type {
  FaultAnnotation,
  RiskLevel,
} from "../contracts/diagnosis.contract";

const RISK_RANK: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 };

/** Un disparador se activa cuando TODOS sus patrones aparecen en el texto. */
type HazardTrigger = readonly RegExp[];

const WATER = /agua|fuga|filtraci[oó]n|humedad|goteo|goteando|mojad|inunda/i;
const ELECTRICAL =
  /enchufe|tomacorriente|interruptor|cable|tablero el[eé]ctrico|caja el[eé]ctrica|apagador/i;

const CRITICAL_HAZARD_TRIGGERS: readonly HazardTrigger[] = [
  // Gas
  [/olor a gas|huele a gas|fuga de gas|tuber[ií]a de gas|v[aá]lvula de gas/i],
  [/caldera|boiler|calentador/i, /fuga|corrosi[oó]n|oxid|gotea/i],
  // Electricidad
  [/chispa|chispazo|cortocircuito|cable[s]? (pelado|quemado|derretido|expuesto)/i],
  [WATER, ELECTRICAL],
  // Estructura
  [/grieta|fisura|rajadura/i, /viga|columna|muro de carga|losa|estructura/i],
  [/hundimiento|pandeo|colapso|se est[aá] cayendo/i, /techo|losa|viga|muro|piso/i],
  // Fuga presurizada incontrolable
  [/tuber[ií]a (matriz|principal)|llave de paso (general|rota)/i, /rot[ao]|revent|no (se )?puede cerrar/i],
];

/** Devuelve la severidad más alta de la lista, o null si no hay anotaciones. */
export function getHighestSeverity(
  annotations: readonly FaultAnnotation[],
): RiskLevel | null {
  let highest: RiskLevel | null = null;
  for (const annotation of annotations) {
    if (highest === null || RISK_RANK[annotation.severity] > RISK_RANK[highest]) {
      highest = annotation.severity;
    }
  }
  return highest;
}

/** Indica si el texto contiene algún patrón de peligro crítico. */
export function containsCriticalHazard(text: string): boolean {
  return CRITICAL_HAZARD_TRIGGERS.some((trigger) =>
    trigger.every((pattern) => pattern.test(text)),
  );
}

interface ResolveRiskInput {
  declaredRisk: RiskLevel;
  annotations: readonly FaultAnnotation[];
  textsToScan: readonly string[];
}

/**
 * Calcula el riesgo final aplicando el sesgo escéptico:
 * el resultado nunca es menor que lo declarado, y sube a HIGH si
 * una anotación es HIGH o el texto contiene un peligro crítico.
 */
export function resolveRiskLevel({
  declaredRisk,
  annotations,
  textsToScan,
}: ResolveRiskInput): RiskLevel {
  if (getHighestSeverity(annotations) === "HIGH") return "HIGH";
  if (containsCriticalHazard(textsToScan.join(" \n "))) return "HIGH";
  return declaredRisk;
}

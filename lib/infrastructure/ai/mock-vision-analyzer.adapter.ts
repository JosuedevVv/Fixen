/**
 * Analizador de demostración sin red ni API key.
 * - Si el usuario escribe palabras clave específicas (riesgo eléctrico/gas, bisagra/alacena, sifón),
 *   responde con el escenario determinista correspondiente.
 * - Si el usuario sube una foto cualquiera sin palabras clave específicas, calcula una huella
 *   determinista de la imagen (`imageBase64`) para alternar entre múltiples diagnósticos domésticos
 *   realistas (plomería, fisura/humedad en muro, carpintería, climatización, toma eléctrica),
 *   mientras `enforceHighRiskSafetyGuardrail` garantiza el bloqueo en cualquier caso `HIGH`.
 */

import type {
  DiagnoseIssueInputDTO,
  DiagnosisResultDTO,
} from "../../contracts/diagnosis.contract";
import type { VisionAnalyzerPort } from "../../ports/vision-analyzer.port";
import { containsCriticalHazard } from "../../domain/risk-policy";

const LOW_RISK_PATTERN = /bisagra|alacena|aireador|grifo|pintura|cosm[eé]tic|bajo|puerta/i;
const SIPHON_PATTERN = /sif[oó]n|lavabo|fregadero|tuerca|gotea/i;

function computeImageFingerprint(base64: string): number {
  let hash = 2166136261;
  const step = Math.max(1, Math.floor(base64.length / 256));
  for (let i = 0; i < base64.length; i += step) {
    hash ^= base64.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export class MockVisionAnalyzer implements VisionAnalyzerPort {
  async analyzeHomeIssue(input: DiagnoseIssueInputDTO): Promise<DiagnosisResultDTO> {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const isCritical = containsCriticalHazard(input.userMessage);
    const isLowRisk = !isCritical && LOW_RISK_PATTERN.test(input.userMessage);
    const isExplicitSiphon = !isCritical && !isLowRisk && SIPHON_PATTERN.test(input.userMessage);

    if (isCritical) {
      return this.buildHighRiskElectrical(id, createdAt);
    }

    if (isLowRisk) {
      return this.buildLowRiskHinge(id, createdAt);
    }

    if (isExplicitSiphon) {
      return this.buildMediumRiskSiphon(id, createdAt, input.userMessage);
    }

    // Si el usuario subió una imagen libre sin palabras clave específicas, variamos según la huella de la imagen
    const fingerprint = computeImageFingerprint(input.imageBase64 + input.userMessage);
    const variant = fingerprint % 5;
    const offset = (fingerprint % 80) - 40;

    switch (variant) {
      case 0:
        return this.buildWallMoistureAndCrack(id, createdAt, offset);
      case 1:
        return this.buildLowRiskHinge(id, createdAt);
      case 2:
        return this.buildAcFilterAndDrip(id, createdAt, offset);
      case 3:
        return this.buildHighRiskElectrical(id, createdAt);
      default:
        return this.buildMediumRiskSiphon(id, createdAt, input.userMessage);
    }
  }

  private buildHighRiskElectrical(id: string, createdAt: string): DiagnosisResultDTO {
    return {
      id,
      createdAt,
      issueTitle: "Filtración activa próxima a toma eléctrica (Modo Demo)",
      summary:
        "Se detecta escurrimiento de humedad sobre el muro en proximidad directa a una caja eléctrica energizada, con alto riesgo de cortocircuito.",
      riskLevel: "HIGH",
      riskJustification:
        "La combinación de humedad activa y contacto con una caja eléctrica representa peligro de descarga eléctrica.",
      annotations: [
        {
          id: "fault-1",
          index: 1,
          label: "Filtración activa en muro",
          description: "Mancha de humedad con escurrimiento descendente hacia la instalación eléctrica.",
          severity: "HIGH",
          box: { ymin: 160, xmin: 220, ymax: 520, xmax: 680 },
        },
        {
          id: "fault-2",
          index: 2,
          label: "Tomacorriente expuesto a humedad",
          description: "Caja eléctrica en la trayectoria directa del goteo.",
          severity: "HIGH",
          box: { ymin: 540, xmin: 340, ymax: 790, xmax: 640 },
        },
      ],
      safetyLock: {
        isRepairBlocked: true,
        specialistType: "Electricista Matriculado y Plomero Especialista",
        skepticalReasoning:
          "Ante cualquier presencia de agua cerca de puntos eléctricos, Fixen bloquea de forma preventiva toda guía de reparación casera por riesgo vital de electrocución.",
        emergencyContainmentAdvice: [
          "No toque la pared húmeda, el enchufe ni ningún aparato conectado a esa toma.",
          "Si el piso alrededor del tablero general está completamente seco, corte el interruptor termomagnético del sector.",
          "Cierre la llave de paso general de agua y espere la revisión presencial del especialista.",
        ],
      },
      repairPlan: {
        estimatedTimeMinutes: 30,
        difficultyLabel: "Moderada",
        toolsRequired: ["Destornillador"],
        materialsRequired: ["Sellador"],
        safetyPrecautions: [],
        steps: [{ stepNumber: 1, title: "Paso bloqueado", instruction: "Nunca debe llegar al cliente." }],
      },
    };
  }

  private buildLowRiskHinge(id: string, createdAt: string): DiagnosisResultDTO {
    return {
      id,
      createdAt,
      issueTitle: "Desajuste en bisagra cazoleta de alacena (Modo Demo)",
      summary:
        "La puerta presenta caída lateral por aflojamiento del tornillo excéntrico de regulación horizontal y del tornillo de fijación al lateral del mueble.",
      riskLevel: "LOW",
      riskJustification:
        "Ajuste mecánico simple en carpintería doméstica sin instalaciones eléctricas, de agua ni de gas involucradas.",
      annotations: [
        {
          id: "fault-1",
          index: 1,
          label: "Tornillo de regulación lateral",
          description: "Tornillo excéntrico desplazado que inclina la hoja de la puerta.",
          severity: "LOW",
          box: { ymin: 280, xmin: 260, ymax: 560, xmax: 560 },
        },
        {
          id: "fault-2",
          index: 2,
          label: "Base de fijación floja",
          description: "Holgura leve en los tornillos verticales de la placa base.",
          severity: "LOW",
          box: { ymin: 260, xmin: 580, ymax: 580, xmax: 780 },
        },
      ],
      safetyLock: {
        isRepairBlocked: false,
        specialistType: null,
        skepticalReasoning: null,
        emergencyContainmentAdvice: [],
      },
      repairPlan: {
        estimatedTimeMinutes: 10,
        difficultyLabel: "Fácil",
        toolsRequired: ["Destornillador Phillips #2"],
        materialsRequired: ["Taquete de madera (solo si el orificio cedió)"],
        safetyPrecautions: [
          "Sostén el borde inferior de la puerta mientras aflojas o aprietas para evitar que caiga de golpe.",
        ],
        steps: [
          {
            stepNumber: 1,
            title: "Fijar la placa base al mueble",
            instruction:
              "Aprieta con firmeza los dos tornillos verticales de la base de fijación sosteniendo la puerta a nivel.",
            relatedAnnotationId: "fault-2",
          },
          {
            stepNumber: 2,
            title: "Nivelar con el tornillo de regulación",
            instruction:
              "Gira un cuarto de vuelta el tornillo central de regulación hasta que la puerta cierre alineada con el marco.",
            relatedAnnotationId: "fault-1",
          },
        ],
      },
    };
  }

  private buildWallMoistureAndCrack(
    id: string,
    createdAt: string,
    offset: number,
  ): DiagnosisResultDTO {
    return {
      id,
      createdAt,
      issueTitle: "Fisura superficial y descascaramiento en muro (Modo Demo)",
      summary:
        "Se identifica desprendimiento de capa pictórica y microfisura lineal en el recubrimiento de yeso/estuco sin compromiso estructural aparente.",
      riskLevel: "LOW",
      riskJustification:
        "Resane superficial en recubrimiento interior sin cableado ni tuberías de presión expuestas.",
      annotations: [
        {
          id: "fault-1",
          index: 1,
          label: "Microfisura en recubrimiento",
          description: "Grieta lineal menor a 1.5 mm en la capa de acabado superficial.",
          severity: "LOW",
          box: {
            ymin: 220 + offset,
            xmin: 260 + offset,
            ymax: 510 + offset,
            xmax: 620 + offset,
          },
        },
        {
          id: "fault-2",
          index: 2,
          label: "Pintura levantada por humedad previa",
          description: "Zona con ampollamiento de pintura que requiere raspado y sellador antes de resanar.",
          severity: "MEDIUM",
          box: {
            ymin: 480 + offset,
            xmin: 380 + offset,
            ymax: 760 + offset,
            xmax: 740 + offset,
          },
        },
      ],
      safetyLock: {
        isRepairBlocked: false,
        specialistType: null,
        skepticalReasoning: null,
        emergencyContainmentAdvice: [],
      },
      repairPlan: {
        estimatedTimeMinutes: 35,
        difficultyLabel: "Fácil",
        toolsRequired: ["Espátula flexible de 3\"", "Lija grano 180", "Brocha"],
        materialsRequired: ["Resanador acrílico ligero", "Sellador vinílico", "Pintura de acabado"],
        safetyPrecautions: [
          "Utiliza mascarilla antipolvo y gafas al raspar y lijar el recubrimiento suelto.",
        ],
        steps: [
          {
            stepNumber: 1,
            title: "Retirar pintura suelta y limpiar la fisura",
            instruction:
              "Pasa la espátula para desprender toda escama suelta en el área ampollada y cepilla el polvo interior.",
            relatedAnnotationId: "fault-2",
          },
          {
            stepNumber: 2,
            title: "Aplicar sellador y pasta resanadora",
            instruction:
              "Aplica una mano de sellador y rellena la microfisura en sentido transversal con la espátula a ras del muro.",
            relatedAnnotationId: "fault-1",
          },
          {
            stepNumber: 3,
            title: "Lijar en seco y repintar",
            instruction:
              "Una vez seco el resanador (20 min), lija suavemente en círculos y aplica el acabado final.",
            relatedAnnotationId: "fault-1",
          },
        ],
      },
    };
  }

  private buildAcFilterAndDrip(
    id: string,
    createdAt: string,
    offset: number,
  ): DiagnosisResultDTO {
    return {
      id,
      createdAt,
      issueTitle: "Obstrucción en charola de condensación y filtro (Modo Demo)",
      summary:
        "Se aprecia saturación de polvo en las rejillas de retorno y goteo por obstrucción parcial en la manguera de desagüe de condensados.",
      riskLevel: "MEDIUM",
      riskJustification:
        "Mantenimiento preventivo de filtros y desagüe plástico realizable con el equipo desconectado.",
      annotations: [
        {
          id: "fault-1",
          index: 1,
          label: "Rejilla y filtro con polvo acumulado",
          description: "Reducción de flujo de aire que provoca congelamiento y goteo interior.",
          severity: "LOW",
          box: {
            ymin: 200 + offset,
            xmin: 240 + offset,
            ymax: 460 + offset,
            xmax: 720 + offset,
          },
        },
        {
          id: "fault-2",
          index: 2,
          label: "Goteo en esquina de charola de drenaje",
          description: "Acumulación de agua condensada por drenaje lento en la salida lateral.",
          severity: "MEDIUM",
          box: {
            ymin: 490 + offset,
            xmin: 520 + offset,
            ymax: 730 + offset,
            xmax: 810 + offset,
          },
        },
      ],
      safetyLock: {
        isRepairBlocked: false,
        specialistType: null,
        skepticalReasoning: null,
        emergencyContainmentAdvice: [],
      },
      repairPlan: {
        estimatedTimeMinutes: 20,
        difficultyLabel: "Fácil",
        toolsRequired: ["Paño de microfibra", "Cepillo de cerdas suaves", "Recipiente"],
        materialsRequired: ["Agua tibia y jabón neutro"],
        safetyPrecautions: [
          "Apaga el equipo y desconéctalo de la corriente eléctrica antes de levantar la tapa frontal.",
        ],
        steps: [
          {
            stepNumber: 1,
            title: "Extraer y lavar las mallas filtrantes",
            instruction:
              "Levanta la cubierta frontal, retira los filtros de malla y enjuágalos con agua tibia a contracorriente.",
            relatedAnnotationId: "fault-1",
          },
          {
            stepNumber: 2,
            title: "Liberar la salida de la charola de desagüe",
            instruction:
              "Limpia el borde inferior de la charola y verifica que la manguera exterior de drenaje no esté doblada ni tapada.",
            relatedAnnotationId: "fault-2",
          },
        ],
      },
    };
  }

  private buildMediumRiskSiphon(
    id: string,
    createdAt: string,
    userMessage: string,
  ): DiagnosisResultDTO {
    return {
      id,
      createdAt,
      issueTitle: "Goteo en conexión del sifón (Modo Demo)",
      summary: `Se observa acumulación de humedad en la tuerca superior del sifón tipo P y desgaste probable del empaque cónico. Consulta: "${userMessage}".`,
      riskLevel: "MEDIUM",
      riskJustification:
        "Fuga lenta en una conexión roscada de desagüe sin presión, sin instalación eléctrica a la vista.",
      annotations: [
        {
          id: "fault-1",
          index: 1,
          label: "Goteo en la rosca del sifón",
          description: "Humedad visible alrededor de la unión roscada superior.",
          severity: "MEDIUM",
          box: { ymin: 260, xmin: 280, ymax: 520, xmax: 660 },
        },
        {
          id: "fault-2",
          index: 2,
          label: "Curva de retención con sarro",
          description: "Acumulación mineral en la base de la trampa de agua.",
          severity: "LOW",
          box: { ymin: 530, xmin: 300, ymax: 780, xmax: 680 },
        },
      ],
      safetyLock: {
        isRepairBlocked: false,
        specialistType: null,
        skepticalReasoning: null,
        emergencyContainmentAdvice: [],
      },
      repairPlan: {
        estimatedTimeMinutes: 25,
        difficultyLabel: "Fácil",
        toolsRequired: ["Llave pico de loro", "Cubeta plástica", "Paño seco"],
        materialsRequired: ["Empaque cónico de PVC de 1¼\" o 1½\"", "Cinta de teflón"],
        safetyPrecautions: [
          "Cierra la llave de paso angular bajo el lavabo y asegúrate de no dejar correr el grifo durante el desarme.",
        ],
        steps: [
          {
            stepNumber: 1,
            title: "Colocar recipiente y aflojar tuerca superior",
            instruction:
              "Ubica la cubeta justo debajo de la curva del sifón y desenrosca en sentido antihorario la tuerca marcada.",
            relatedAnnotationId: "fault-1",
          },
          {
            stepNumber: 2,
            title: "Limpiar la trampa y reemplazar el empaque",
            instruction:
              "Vacía el agua retenida en la curva, limpia el sedimento de las roscas y coloca el empaque cónico nuevo con el bisel hacia abajo.",
            relatedAnnotationId: "fault-2",
          },
          {
            stepNumber: 3,
            title: "Ajustar y verificar estanqueidad",
            instruction:
              "Enrosca la tuerca a mano con firmeza sin sobreapretar el plástico, seca la unión y abre el grifo 30 segundos para comprobar que no gotee.",
            relatedAnnotationId: "fault-1",
          },
        ],
      },
    };
  }
}

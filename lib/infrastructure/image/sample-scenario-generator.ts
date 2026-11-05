/**
 * Escenarios reales de ejemplo para la zona de bienvenida (Empty State).
 * Cumple la directriz de diseño: utiliza fotografías reales de la web de problemas
 * domésticos cotidianos (nunca dibujos abstractos ni robots de IA).
 */

import type { RiskLevel } from "../../contracts/diagnosis.contract";
import type { PreparedImage } from "./image-preparer";
import { loadImage } from "./load-image";

export interface SampleScenario {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  prompt: string;
  photoUrl: string;
  photoAlt: string;
  expectedRisk: RiskLevel;
}

export const SAMPLE_SCENARIOS: readonly SampleScenario[] = [
  {
    id: "medium-siphon",
    category: "Plomería cotidiana",
    title: "Pequeña fuga debajo del lavabo",
    subtitle: "Goteo lento en la unión roscada del sifón al abrir el agua",
    prompt:
      "Hola, noté que gotea agua por la tuerca del sifón debajo del lavabo cuando abro la llave. ¿Cómo puedo ajustarlo?",
    photoUrl:
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=900&q=80",
    photoAlt: "Fotografía real de una llave y conexión de plomería doméstica",
    expectedRisk: "MEDIUM",
  },
  {
    id: "low-hinge",
    category: "Carpintería y herrajes",
    title: "Puerta de alacena desnivelada",
    subtitle: "La bisagra interna se aflojó y la puerta roza al cerrar",
    prompt:
      "La puerta de mi alacena de cocina quedó un poco caída de un lado y la bisagra se siente floja. ¿Qué tornillo debo ajustar?",
    photoUrl:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80",
    photoAlt: "Fotografía real de muebles y alacenas de cocina en casa",
    expectedRisk: "LOW",
  },
  {
    id: "high-electrical-leak",
    category: "Seguridad eléctrica",
    title: "Humedad cerca de un enchufe",
    subtitle: "Ejemplo donde Fixen recomienda llamar a un profesional",
    prompt:
      "Apareció una filtración de humedad en la pared justo al lado de un enchufe y los cables se ven cerca.",
    photoUrl:
      "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=900&q=80",
    photoAlt: "Fotografía real de una instalación y conexiones eléctricas en pared",
    expectedRisk: "HIGH",
  },
];

const FALLBACK_WIDTH = 800;
const FALLBACK_HEIGHT = 520;

/**
 * Carga la fotografía real del escenario desde la web y la convierte en `PreparedImage`
 * (JPEG en Base64) para que pase por el mismo flujo real de diagnóstico y marcado con pines.
 */
export async function loadSampleScenarioImage(
  scenario: SampleScenario,
): Promise<PreparedImage> {
  const canvas = document.createElement("canvas");

  try {
    const img = await loadImage(scenario.photoUrl);
    const scale = Math.min(1, 1000 / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.round(img.naturalWidth * scale);
    const height = Math.round(img.naturalHeight * scale);

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx === null) throw new Error("Canvas no disponible");

    ctx.drawImage(img, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.86);

    return {
      dataUrl,
      base64: dataUrl.slice(dataUrl.indexOf(",") + 1),
      mimeType: "image/jpeg",
      width,
      height,
    };
  } catch {
    // Respaldo limpio únicamente si el navegador no tiene conexión a internet en ese instante
    canvas.width = FALLBACK_WIDTH;
    canvas.height = FALLBACK_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (ctx === null) throw new Error("Canvas no disponible");

    ctx.fillStyle = "#F3F2EE";
    ctx.fillRect(0, 0, FALLBACK_WIDTH, FALLBACK_HEIGHT);
    ctx.fillStyle = "#E5E7EB";
    ctx.fillRect(180, 120, 440, 280);
    ctx.fillStyle = "#4B5563";
    ctx.font = '600 18px Inter, system-ui, sans-serif';
    ctx.fillText(scenario.title, 210, 255);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    return {
      dataUrl,
      base64: dataUrl.slice(dataUrl.indexOf(",") + 1),
      mimeType: "image/jpeg",
      width: FALLBACK_WIDTH,
      height: FALLBACK_HEIGHT,
    };
  }
}

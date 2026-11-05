import {
  DiagnosisInputError,
  VisionAnalysisError,
} from "@/lib/application/diagnosis-errors";
import { composeDiagnoseHomeIssue } from "@/lib/infrastructure/composition/diagnose.composition";

/** POST /api/diagnose: traduce Request -> caso de uso -> Response. Sin lógica de negocio. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "El cuerpo debe ser JSON válido." }, { status: 400 });
  }

  try {
    const { useCase, engine } = composeDiagnoseHomeIssue();
    const diagnosis = await useCase.execute(body);
    return Response.json({ diagnosis, engine });
  } catch (error) {
    if (error instanceof DiagnosisInputError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("[api/diagnose]", error);
    const message =
      error instanceof VisionAnalysisError
        ? error.message
        : "Ocurrió un error inesperado al analizar la imagen.";
    return Response.json({ error: message }, { status: 502 });
  }
}

import type {
  DiagnoseIssueInputDTO,
  DiagnosisResultDTO,
} from "../contracts/diagnosis.contract";

/** Puerto del modelo de visión. Su resultado aún NO pasó por el guardrail. */
export interface VisionAnalyzerPort {
  analyzeHomeIssue(
    input: DiagnoseIssueInputDTO,
    ragContext?: string[],
  ): Promise<DiagnosisResultDTO>;
}

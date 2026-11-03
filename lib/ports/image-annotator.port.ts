import type { FaultAnnotation } from "../contracts/diagnosis.contract";

/** Puerto que pinta los recuadros sobre la imagen y devuelve un Data URL PNG. */
export interface ImageAnnotatorPort {
  renderAnnotatedImage(
    imageSource: string,
    annotations: FaultAnnotation[],
  ): Promise<string>;
}

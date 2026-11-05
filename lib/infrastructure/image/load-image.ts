/**
 * Decodifica una imagen a partir de un Data URL, Object URL o URL web.
 * Si es una URL remota (`http`/`https`), habilita `crossOrigin = "anonymous"`
 * para poder procesarla en un `<canvas>` sin bloquear la exportación.
 *
 * @throws Error si el navegador no puede decodificar la fuente.
 */
export function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    if (source.startsWith("http://") || source.startsWith("https://")) {
      image.crossOrigin = "anonymous";
    }
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo cargar la imagen."));
    image.src = source;
  });
}

"use client";

/**
 * Hook con responsabilidad única: gestionar el archivo de imagen adjunto en el compositor.
 * Valida formato/peso (`validateImageFile`), decodifica y normaliza dimensiones
 * (`prepareImageForUpload`) y expone estados explícitos para la UI.
 */

import { useCallback, useState } from "react";
import { validateImageFile } from "@/lib/domain/image-validation";
import {
  ImagePreparationError,
  prepareImageForUpload,
  type PreparedImage,
} from "@/lib/infrastructure/image/image-preparer";

export interface ImageAttachmentState {
  attachment: PreparedImage | null;
  fileName: string | null;
  isPreparing: boolean;
  error: string | null;
  selectFile: (file: File | null) => Promise<void>;
  applyPreparedImage: (prepared: PreparedImage, label: string) => void;
  clearAttachment: () => void;
}

export function useImageAttachment(): ImageAttachmentState {
  const [attachment, setAttachment] = useState<PreparedImage | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectFile = useCallback(async (file: File | null) => {
    if (file === null) return;

    setError(null);
    const fileValidation = validateImageFile({ type: file.type, size: file.size });
    if (!fileValidation.valid) {
      setAttachment(null);
      setFileName(null);
      setError(fileValidation.reason);
      return;
    }

    setIsPreparing(true);
    try {
      const prepared = await prepareImageForUpload(file);
      setAttachment(prepared);
      setFileName(file.name);
    } catch (cause) {
      setAttachment(null);
      setFileName(null);
      setError(
        cause instanceof ImagePreparationError
          ? cause.message
          : "No se pudo procesar la imagen seleccionada.",
      );
    } finally {
      setIsPreparing(false);
    }
  }, []);

  const applyPreparedImage = useCallback((prepared: PreparedImage, label: string) => {
    setError(null);
    setAttachment(prepared);
    setFileName(label);
  }, []);

  const clearAttachment = useCallback(() => {
    setAttachment(null);
    setFileName(null);
    setError(null);
  }, []);

  return {
    attachment,
    fileName,
    isPreparing,
    error,
    selectFile,
    applyPreparedImage,
    clearAttachment,
  };
}

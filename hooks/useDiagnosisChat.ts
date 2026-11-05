"use client";

/**
 * Hook con responsabilidad única: gestionar la sesión de diagnóstico en el cliente.
 * Coordina `LocalStorageChatRepository`, el cliente HTTP `requestDiagnosis` y el
 * servicio `CanvasImageAnnotatorService` que pinta los recuadros de falla sobre la foto.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { buildConversationHistory } from "@/lib/application/conversation-history";
import type {
  AssistantChatMessage,
  ChatMessage,
  UserChatMessage,
} from "@/lib/contracts/chat.contract";
import type { VisionEngine } from "@/lib/contracts/diagnosis.contract";
import {
  DiagnoseRequestError,
  requestDiagnosis,
} from "@/lib/infrastructure/api/diagnose-client";
import { CanvasImageAnnotatorService } from "@/lib/infrastructure/image/canvas-image-annotator.service";
import type { PreparedImage } from "@/lib/infrastructure/image/image-preparer";
import { LocalStorageChatRepository } from "@/lib/infrastructure/storage/local-storage-chat.repository";

export interface SendDiagnosisParams {
  userMessage: string;
  image: PreparedImage;
}

export interface DiagnosisChatState {
  messages: ChatMessage[];
  isHydrated: boolean;
  isAnalyzing: boolean;
  activeEngine: VisionEngine | null;
  error: string | null;
  sendDiagnosis: (params: SendDiagnosisParams) => Promise<boolean>;
  clearSession: () => void;
  dismissError: () => void;
}

export function useDiagnosisChat(): DiagnosisChatState {
  const repositoryRef = useRef<LocalStorageChatRepository | null>(null);
  const annotatorRef = useRef<CanvasImageAnnotatorService | null>(null);

  if (repositoryRef.current === null) {
    repositoryRef.current = new LocalStorageChatRepository();
  }
  if (annotatorRef.current === null) {
    annotatorRef.current = new CanvasImageAnnotatorService();
  }

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeEngine, setActiveEngine] = useState<VisionEngine | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Carga inicial desde localStorage tras hidratar en el cliente
  useEffect(() => {
    const loaded = repositoryRef.current?.loadMessages() ?? [];
    setMessages(loaded);
    const lastAssistant = loaded.findLast(
      (msg): msg is AssistantChatMessage => msg.role === "assistant",
    );
    if (lastAssistant?.engine) {
      setActiveEngine(lastAssistant.engine);
    }
    setIsHydrated(true);
  }, []);

  const sendDiagnosis = useCallback(
    async ({ userMessage, image }: SendDiagnosisParams): Promise<boolean> => {
      setError(null);
      setIsAnalyzing(true);

      const cleanText = userMessage.trim() || "Analiza esta imagen y dime qué problema ves.";
      const userTurn: UserChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        createdAt: new Date().toISOString(),
        text: cleanText,
        imageDataUrl: image.dataUrl,
      };

      const historySnapshot = repositoryRef.current?.loadMessages() ?? [];
      const conversationHistory = buildConversationHistory(historySnapshot);

      // Añadimos el mensaje del usuario de inmediato para feedback instantáneo
      setMessages((prev) => {
        const next = [...prev, userTurn];
        repositoryRef.current?.saveMessages(next);
        return next;
      });

      try {
        const { diagnosis, engine } = await requestDiagnosis({
          userMessage: cleanText,
          imageBase64: image.base64,
          mimeType: image.mimeType,
          conversationHistory,
        });

        setActiveEngine(engine);

        // Si hay recuadros detectados, pintamos la imagen modificada a resolución nativa
        let annotatedImageDataUrl: string | null = image.dataUrl;
        if (diagnosis.annotations.length > 0 && annotatorRef.current !== null) {
          try {
            annotatedImageDataUrl = await annotatorRef.current.renderAnnotatedImage(
              image.dataUrl,
              diagnosis.annotations,
            );
          } catch {
            annotatedImageDataUrl = image.dataUrl;
          }
        }

        const assistantTurn: AssistantChatMessage = {
          id: diagnosis.id,
          role: "assistant",
          createdAt: diagnosis.createdAt,
          diagnosis,
          originalImageDataUrl: image.dataUrl,
          annotatedImageDataUrl,
          engine,
        };

        setMessages((prev) => {
          const next = [...prev, assistantTurn];
          repositoryRef.current?.saveMessages(next);
          return next;
        });

        return true;
      } catch (cause) {
        const message =
          cause instanceof DiagnoseRequestError
            ? cause.message
            : "Ocurrió un fallo inesperado al analizar la imagen.";
        setError(message);
        return false;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [],
  );

  const clearSession = useCallback(() => {
    repositoryRef.current?.clearHistory();
    setMessages([]);
    setError(null);
  }, []);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isHydrated,
    isAnalyzing,
    activeEngine,
    error,
    sendDiagnosis,
    clearSession,
    dismissError,
  };
}

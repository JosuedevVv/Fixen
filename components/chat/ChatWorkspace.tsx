"use client";

/**
 * Contenedor Principal de Escritorio Amplio (`max-w-6xl`):
 * Extiende la interfaz a formato web de escritorio completo, evitando el aspecto estrecho de celular
 * y manteniendo la estética monocromática de tarjetas flotantes de las referencias.
 */

import { AppHeader } from "@/components/layout/AppHeader";
import { ChatInputComposer } from "@/components/chat/ChatInputComposer";
import { EmptyStatePrompts } from "@/components/chat/EmptyStatePrompts";
import { MessageList } from "@/components/chat/MessageList";
import { useDiagnosisChat } from "@/hooks/useDiagnosisChat";
import { useImageAttachment } from "@/hooks/useImageAttachment";
import {
  loadSampleScenarioImage,
  type SampleScenario,
} from "@/lib/infrastructure/image/sample-scenario-generator";

export function ChatWorkspace() {
  const {
    messages,
    isHydrated,
    isAnalyzing,
    activeEngine,
    error: chatError,
    sendDiagnosis,
    clearSession,
    dismissError,
  } = useDiagnosisChat();

  const {
    attachment,
    fileName,
    isPreparing,
    error: attachmentError,
    selectFile,
    clearAttachment,
  } = useImageAttachment();

  async function handleSendFromComposer(userMessage: string) {
    if (attachment === null) return;
    const currentImage = attachment;
    clearAttachment();
    await sendDiagnosis({ userMessage, image: currentImage });
  }

  async function handleRunSampleScenario(scenario: SampleScenario) {
    clearAttachment();
    const sampleImage = await loadSampleScenarioImage(scenario);
    await sendDiagnosis({
      userMessage: scenario.prompt,
      image: sampleImage,
    });
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-screen bg-[#EEF0F4] px-3 py-4 text-[#111111] sm:px-6 sm:py-6">
      {/* The Wide Desktop Card Shell (max-w-6xl) */}
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col justify-between overflow-hidden rounded-[36px] border border-slate-200/80 bg-[#F8F9FA] shadow-[0_24px_70px_-16px_rgba(0,0,0,0.08)]">
        <AppHeader
          activeEngine={activeEngine}
          hasMessages={hasMessages}
          messageCount={messages.length}
          isAnalyzing={isAnalyzing}
          onClearSession={clearSession}
        />

        <main className="flex flex-1 flex-col justify-between px-5 py-6 sm:px-8 sm:py-7">
          <div className="flex-1">
            {!isHydrated ? null : hasMessages || isAnalyzing ? (
              <MessageList messages={messages} isAnalyzing={isAnalyzing} />
            ) : (
              <EmptyStatePrompts
                disabled={isAnalyzing}
                onSelectFile={selectFile}
                onSelectScenario={(scenario) =>
                  void handleRunSampleScenario(scenario)
                }
              />
            )}
          </div>

          {chatError !== null ? (
            <div
              role="alert"
              className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-[#111111] px-4 py-3 text-xs text-white"
            >
              <span>{chatError}</span>
              <button
                type="button"
                onClick={dismissError}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white hover:bg-white hover:text-[#111111]"
              >
                Cerrar
              </button>
            </div>
          ) : null}

          <div className="mt-6 pt-1">
            <ChatInputComposer
              attachment={attachment}
              fileName={fileName}
              isPreparingImage={isPreparing}
              attachmentError={attachmentError}
              isAnalyzing={isAnalyzing}
              onSelectFile={selectFile}
              onClearAttachment={clearAttachment}
              onSubmit={handleSendFromComposer}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

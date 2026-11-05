/**
 * Skeleton compacto acorde a las nuevas proporciones del visor y lista de hallazgos.
 */

export function DiagnosisSkeletonCard() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Analizando fotografía"
      className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_28px_rgba(0,0,0,0.04)] sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-2xl bg-[#111111]" />
          <div className="space-y-1.5">
            <div className="h-4 w-44 animate-pulse rounded-md bg-slate-200" />
            <div className="h-3 w-64 animate-pulse rounded-md bg-slate-100" />
          </div>
        </div>
        <div className="h-6 w-24 animate-pulse rounded-full bg-[#F3F4F6]" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1.15fr_1fr]">
        <div className="h-56 w-full animate-pulse rounded-3xl bg-[#111111]/90" />
        <div className="space-y-2.5 rounded-3xl border border-slate-100 bg-[#F8F9FA] p-4">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
          <div className="h-14 w-full animate-pulse rounded-2xl bg-[#111111]" />
          <div className="h-14 w-full animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    </div>
  );
}

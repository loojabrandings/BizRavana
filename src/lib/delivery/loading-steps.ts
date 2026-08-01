// ─── Loading step helpers ─────────────────────────────────────────
// Shared between the courier page and the courier finance tab so both
// surfaces show the same step-checklist loading experience.

export type LoadingStageId = string;

export interface LoadingStep {
  id: LoadingStageId;
  label: string;
  state: "done" | "active" | "pending";
}

/**
 * Build the ordered checklist of loading steps for a fetch run.
 * Provide the full ordered list of step ids/labels that will actually run
 * (skip optional API steps when they won't execute), all starting pending.
 */
export function buildLoadingSteps(
  definitions: { id: LoadingStageId; label: string }[],
): LoadingStep[] {
  return definitions.map((d) => ({ id: d.id, label: d.label, state: "pending" as const }));
}

/**
 * Mark the given step as active (with an optional label override) and set
 * all preceding steps to "done", all following steps to "pending".
 */
export function markLoadingStep(
  steps: LoadingStep[],
  id: LoadingStageId,
  label?: string,
): LoadingStep[] {
  const index = steps.findIndex((s) => s.id === id);
  if (index === -1) return steps;
  return steps.map((s, i) => {
    if (i < index) return { ...s, state: "done" as const };
    if (i === index) return { ...s, state: "active" as const, label: label ?? s.label };
    return { ...s, state: "pending" as const };
  });
}

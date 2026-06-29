"use client";

import { useState } from "react";
import { Check, ChevronRight, Clock, Loader2 } from "lucide-react";
import {
  WORKFLOW,
  WORKFLOW_ORDER,
  deriveWorkflowState,
  nextActions,
  workflowMeta,
} from "../lib/workflow";

const TONE = {
  muted: "bg-surface-soft text-muted",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  secondary: "bg-secondary-soft text-secondary",
  success: "bg-success-soft text-success",
};

/** Linear stepper shown on the main editorial path (skips the side states). */
const STEPPER = [
  WORKFLOW.DRAFT,
  WORKFLOW.IN_REVIEW,
  WORKFLOW.SEO_VALIDATION,
  WORKFLOW.PUBLISHED,
];

export default function WorkflowStatusControl({ blog = {}, onTransition, busy = false }) {
  const state = deriveWorkflowState(blog);
  const meta = workflowMeta(state);
  const actions = nextActions(state);
  const [scheduleFor, setScheduleFor] = useState("");
  const [scheduling, setScheduling] = useState(false);

  const currentIdx = STEPPER.indexOf(state);

  const handle = (action) => {
    if (action.to === WORKFLOW.SCHEDULED) {
      setScheduling(true);
      return;
    }
    onTransition?.(action.to, {});
  };

  const confirmSchedule = () => {
    if (!scheduleFor) return;
    onTransition?.(WORKFLOW.SCHEDULED, { publishAt: new Date(scheduleFor) });
    setScheduling(false);
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-muted">Workflow</span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[meta.tone] || TONE.muted}`}>
          {state === WORKFLOW.SCHEDULED && <Clock className="h-3 w-3" />}
          {meta.label}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted">{meta.description}</p>

      {/* Stepper */}
      <ol className="mt-3 flex items-center gap-1" aria-label="Editorial progress">
        {STEPPER.map((step, i) => {
          const done = currentIdx > -1 && i < currentIdx;
          const active = step === state;
          const m = workflowMeta(step);
          return (
            <li key={step} className="flex items-center gap-1">
              <span
                className={`inline-flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-semibold ${
                  active ? "bg-primary text-primary-foreground" : done ? "bg-success-soft text-success" : "bg-surface-soft text-muted"
                }`}
              >
                {done ? <Check className="h-3 w-3" /> : null}
                {m.label}
              </span>
              {i < STEPPER.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-muted" />}
            </li>
          );
        })}
      </ol>

      {/* Schedule picker */}
      {scheduling && (
        <div className="mt-3 rounded-lg border border-border bg-surface-soft p-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted">
            Publish at
            <input
              type="datetime-local"
              value={scheduleFor}
              min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
              onChange={(e) => setScheduleFor(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => setScheduling(false)} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-soft">
              Cancel
            </button>
            <button onClick={confirmSchedule} disabled={!scheduleFor} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground disabled:opacity-50">
              Confirm schedule
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      {!scheduling && (
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.to}
              type="button"
              onClick={() => handle(action)}
              disabled={busy}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                action.primary
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "border border-border bg-surface text-foreground hover:bg-surface-soft"
              }`}
            >
              {busy && action.primary ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

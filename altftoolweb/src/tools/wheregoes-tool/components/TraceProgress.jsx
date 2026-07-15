"use client";

import { Check, Loader2, Radar, X } from "lucide-react";
import { TRACE_STAGES } from "../hooks/useTrace";
import { CARD, FOCUS_RING } from "./ui.jsx";

/**
 * The "things are happening in the background" card. Shown the moment the
 * user hits Trace: staged pipeline, live elapsed timer, asymptotic progress
 * bar, and shimmering placeholders of the report being built.
 */

// Asymptotic progress: fast start, never hits 100% until the response lands.
function progressFor(elapsedMs) {
  return Math.min(92, Math.round(92 * (1 - Math.exp(-elapsedMs / 7000))));
}

function stageState(stage, index, elapsedMs) {
  const next = TRACE_STAGES[index + 1];
  if (elapsedMs >= (next?.after ?? Infinity)) return "done";
  if (elapsedMs >= stage.after) return "current";
  return "pending";
}

function StageRow({ stage, state }) {
  return (
    <li className="flex items-center gap-2.5">
      {state === "done" && (
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: "var(--anslation-ds-success)" }}
          aria-hidden="true"
        >
          <Check size={11} strokeWidth={3.5} />
        </span>
      )}
      {state === "current" && (
        <Loader2
          size={18}
          aria-hidden="true"
          className="shrink-0 motion-safe:animate-spin text-(--primary-hover) dark:text-(--primary)"
        />
      )}
      {state === "pending" && (
        <span
          aria-hidden="true"
          className="mx-[3px] h-3.5 w-3.5 shrink-0 rounded-full border-2 border-(--border)"
        />
      )}
      <span
        className={`text-sm ${
          state === "current"
            ? "font-bold text-(--foreground)"
            : state === "done"
              ? "font-semibold text-(--muted-foreground)"
              : "font-medium text-(--muted-foreground) opacity-60"
        }`}
      >
        {stage.label}
        {state === "done" && <span className="sr-only"> — done</span>}
        {state === "current" && <span className="sr-only"> — in progress</span>}
      </span>
    </li>
  );
}

function SkeletonBlock({ className = "" }) {
  return <span aria-hidden="true" className={`block rounded-[6px] bg-(--muted) motion-safe:animate-pulse ${className}`} />;
}

export default function TraceProgress({ url, elapsedMs, onCancel }) {
  const progress = progressFor(elapsedMs);
  const seconds = (elapsedMs / 1000).toFixed(1);
  const slow = elapsedMs > 12000;

  return (
    <section aria-label="Trace in progress" role="status" aria-live="polite" className={`${CARD} relative overflow-hidden p-4 sm:p-6`}>
      {/* animated brand hairline */}
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] overflow-hidden">
        <span
          className="block h-full w-1/3 motion-safe:animate-[altft-scan_1.6s_ease-in-out_infinite]"
          style={{ background: "var(--anslation-ds-cta-gradient)" }}
        />
      </span>
      <style>{`@keyframes altft-scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }`}</style>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "var(--anslation-ds-primary-soft)" }}>
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full motion-safe:animate-ping"
              style={{ backgroundColor: "color-mix(in srgb, var(--primary) 25%, transparent)" }}
            />
            <Radar size={22} className="relative text-(--primary-hover) dark:text-(--primary)" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight text-(--foreground)">
              Tracing redirects…
            </h2>
            <p className="truncate font-mono text-xs font-semibold text-(--muted-foreground)" title={url}>
              {url}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="rounded-full bg-(--muted) px-3 py-1 text-xs font-bold tabular-nums text-(--foreground)">
            {seconds}s elapsed
          </span>
          <button
            type="button"
            onClick={onCancel}
            className={`inline-flex h-8 items-center justify-center gap-1 rounded-[8px] border border-(--border) bg-(--card) px-2.5 text-xs font-bold text-(--muted-foreground) transition hover:border-[color-mix(in_srgb,var(--anslation-ds-danger)_45%,var(--border))] hover:text-(--foreground) ${FOCUS_RING}`}
          >
            <X size={12} aria-hidden="true" />
            Cancel
          </button>
        </div>
      </div>

      {/* progress bar */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
          <span className="text-(--muted-foreground)">Working in the background</span>
          <span className="tabular-nums text-(--primary-hover) dark:text-(--primary)">{progress}%</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Trace progress"
          className="h-2 overflow-hidden rounded-full bg-(--muted)"
        >
          <div
            className="h-full rounded-full motion-safe:transition-[width] motion-safe:duration-300"
            style={{ width: `${progress}%`, background: "var(--anslation-ds-cta-gradient)" }}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-[240px_1fr]">
        {/* stage pipeline */}
        <ol className="space-y-3">
          {TRACE_STAGES.map((stage, index) => (
            <StageRow key={stage.id} stage={stage} state={stageState(stage, index, elapsedMs)} />
          ))}
        </ol>

        {/* skeleton of the report being built */}
        <div aria-hidden="true" className="space-y-3 rounded-[10px] border border-(--border) bg-(--background) p-4">
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((item) => (
              <SkeletonBlock key={item} className="h-20 flex-1" />
            ))}
          </div>
          <SkeletonBlock className="h-3.5 w-2/3" />
          <SkeletonBlock className="h-3.5 w-1/2" />
          <SkeletonBlock className="h-3.5 w-3/5" />
        </div>
      </div>

      {slow && (
        <p className="mt-4 rounded-[8px] border border-(--border) bg-(--background) px-3 py-2.5 text-xs font-medium leading-5 text-(--muted-foreground)">
          Still working — the tracer was asleep and is waking up. The first request can take up to
          ~30 seconds; every trace after this one will be much faster.
        </p>
      )}
    </section>
  );
}

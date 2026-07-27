"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PenTool, Plus, RotateCcw, Trash2 } from "lucide-react";

import { ATTEMPT_STATUSES, computeDiagramStats } from "../lib";

const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_DIAGRAMS = [
  { name: "Human heart (labelled)", targetMinutes: "6", status: "memory", lastMinutes: "5" },
  { name: "Nephron structure", targetMinutes: "6", status: "memory", lastMinutes: "9" },
  { name: "Krebs cycle", targetMinutes: "8", status: "with-reference", lastMinutes: "" },
  { name: "Reflex arc", targetMinutes: "4", status: "none", lastMinutes: "" },
];

const LEVEL_TONE = {
  mastered: "text-[var(--success)]",
  close: "text-[var(--primary)]",
  learning: "text-[var(--muted-foreground)]",
  unpractised: "text-[var(--danger)]",
};

const cloneDefaults = () => DEFAULT_DIAGRAMS.map((diagram) => ({ ...diagram }));

export default function ToolHome() {
  const [diagrams, setDiagrams] = useState(cloneDefaults);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeDiagramStats({
        diagrams: diagrams.map((diagram) => ({
          name: diagram.name,
          targetMinutes: diagram.targetMinutes.trim() === "" ? Number.NaN : Number(diagram.targetMinutes),
          status: diagram.status,
          lastMinutes: diagram.lastMinutes.trim() === "" ? "" : Number(diagram.lastMinutes),
        })),
      }),
    [diagrams],
  );

  const hasError = Boolean(result.error);

  const update = (index, field, value) => {
    setDiagrams((prev) =>
      prev.map((diagram, i) => (i === index ? { ...diagram, [field]: value } : diagram)),
    );
  };

  const addDiagram = () => {
    setDiagrams((prev) => [
      ...prev,
      { name: `Diagram ${prev.length + 1}`, targetMinutes: "5", status: "none", lastMinutes: "" },
    ]);
  };

  const removeDiagram = (index) => {
    setDiagrams((prev) => prev.filter((_, i) => i !== index));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Diagram practice — ${PCT.format(result.readinessPercent)}% exam-ready overall`,
      `Mastered ${result.counts.mastered}/${result.total}, close ${result.counts.close}, learning ${result.counts.learning}, not practised ${result.counts.unpractised}`,
      ...result.rows.map(
        (row) =>
          `${row.name}: ${row.levelLabel}${row.overByMinutes > 0 ? ` (${row.overByMinutes} min over target)` : ""}`,
      ),
    ].join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setDiagrams(cloneDefaults());
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PenTool className="h-4 w-4" aria-hidden="true" />
          Retrieval practice
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Diagram Practice Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List the diagrams your exam can ask for, set a per-diagram time budget, and log how
          the last attempt went. A diagram only counts as exam-ready when you drew it from
          memory within its time limit.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="space-y-4">
          {diagrams.map((diagram, index) => (
            <div
              key={index}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`dpt-name-${index}`}>
                    Diagram name
                  </label>
                  <input
                    id={`dpt-name-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={diagram.name}
                    onChange={(event) => update(index, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`dpt-target-${index}`}>
                    Target time (min)
                  </label>
                  <input
                    id={`dpt-target-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={diagram.targetMinutes}
                    onChange={(event) => update(index, "targetMinutes", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`dpt-status-${index}`}>
                    Last attempt
                  </label>
                  <select
                    id={`dpt-status-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={diagram.status}
                    onChange={(event) => update(index, "status", event.target.value)}
                  >
                    {ATTEMPT_STATUSES.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {diagram.status !== "none" ? (
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`dpt-last-${index}`}>
                      Time taken (min)
                    </label>
                    <input
                      id={`dpt-last-${index}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="numeric"
                      min="1"
                      step="1"
                      value={diagram.lastMinutes}
                      onChange={(event) => update(index, "lastMinutes", event.target.value)}
                    />
                  </div>
                ) : null}
                <div className="flex items-end justify-between gap-3">
                  {!hasError && result.rows[index] ? (
                    <p className={`text-sm font-semibold ${LEVEL_TONE[result.rows[index].level]}`}>
                      {result.rows[index].levelLabel}
                      {result.rows[index].overByMinutes > 0
                        ? ` — ${result.rows[index].overByMinutes} min over`
                        : ""}
                    </p>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() => removeDiagram(index)}
                    aria-label={`Remove diagram ${diagram.name || index + 1}`}
                    disabled={diagrams.length <= 1}
                    className={`${GHOST_BTN} disabled:opacity-40`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    <span className="sm:hidden">Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addDiagram} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add diagram
        </button>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Overall exam readiness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${PCT.format(result.readinessPercent)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your stats."
                : `${result.counts.mastered} of ${result.total} diagrams fully exam-ready (from memory, within time).`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the diagram practice summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all diagrams to the example list"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Exam-ready (memory, within time)", hasError ? DASH : String(result.counts.mastered)],
            ["Close — from memory but too slow", hasError ? DASH : String(result.counts.close)],
            ["Learning — still needs reference", hasError ? DASH : String(result.counts.learning)],
            ["Not practised yet", hasError ? DASH : String(result.counts.unpractised)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.practiceQueue.length > 0 ? (
          <div className="mt-4 rounded-lg bg-[var(--muted)] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Practise next (weakest first)
            </p>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-sm">
              {result.practiceQueue.map((item) => (
                <li key={item.name}>
                  {item.name}
                  <span className="ml-1 text-xs text-[var(--muted-foreground)]">
                    ({item.levelLabel})
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Progress is computed from what you enter in this session — copy the summary into your
        notes to keep a record between study sessions.
      </p>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, RotateCcw } from "lucide-react";

import { ALL_ITEM_IDS, scoreChecklist } from "../lib";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const SEVERITY_CLASS = {
  critical: "bg-[var(--danger-soft)] text-[var(--danger)]",
  important: "bg-[var(--muted)] text-[var(--foreground)]",
  optional: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [checkedIds, setCheckedIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => scoreChecklist(checkedIds), [checkedIds]);
  const hasError = Boolean(result.error);

  const toggle = (id) => {
    setCheckedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setCheckedIds([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Course production
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Lecture Recording Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Run this before you hit record. Items are weighted by severity, and the critical ones —
          the faults that cannot be fixed in post — hold the shoot until they are ticked.
        </p>
      </header>

      {hasError ? (
        <p
          role="alert"
          className="mb-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recording readiness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.score}%`}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                hasError
                  ? "text-[var(--muted-foreground)]"
                  : result.blocked
                    ? "text-[var(--danger)]"
                    : "text-[var(--success)]"
              }`}
            >
              {hasError ? "Checklist unavailable" : result.status}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the checklist status summary"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCheckedIds(ALL_ITEM_IDS);
                setCopied(false);
              }}
              aria-label="Tick every checklist item"
              className={GHOST_BTN}
            >
              Tick all
            </button>
            <button type="button" onClick={reset} aria-label="Clear the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Items ticked", hasError ? DASH : `${result.doneCount} of ${result.itemCount}`],
            [
              "Critical items cleared",
              hasError ? DASH : `${result.criticalDone} of ${result.criticalCount}`,
            ],
            ["Weighted score", hasError ? DASH : `${result.earnedWeight} of ${result.totalWeight} points`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasError ? null : (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Checklist is ${result.score} percent complete by weight`}
            >
              <span
                className={`block h-full ${result.blocked ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
                style={{ width: `${result.score}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {hasError || !result.blocked ? null : (
        <section
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-3 text-sm text-[var(--danger)]"
        >
          <p className="font-semibold">
            {result.blockers.length} critical item{result.blockers.length === 1 ? "" : "s"} still open:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {result.blockers.map((item) => (
              <li key={item.id}>{item.text}</li>
            ))}
          </ul>
        </section>
      )}

      {hasError
        ? null
        : result.sections.map((section) => (
            <section
              key={section.id}
              className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold">{section.title}</h2>
                <p className="text-xs font-semibold text-[var(--primary)]">
                  {section.doneCount}/{section.itemCount} · {section.percent}%
                </p>
              </div>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{section.note}</p>

              <ul className="mt-3 space-y-2">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <label
                      htmlFor={`lrc-${item.id}`}
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] p-3 transition hover:border-[var(--primary)]"
                    >
                      <input
                        id={`lrc-${item.id}`}
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggle(item.id)}
                        className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      />
                      <span className="min-w-0">
                        <span
                          className={`block text-sm leading-6 ${
                            item.checked ? "text-[var(--muted-foreground)] line-through" : ""
                          }`}
                        >
                          {item.text}
                        </span>
                        <span
                          className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${SEVERITY_CLASS[item.severity]}`}
                        >
                          {item.severityLabel} · {item.weight} pt{item.weight === 1 ? "" : "s"}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Ticks are held in this browser tab only and are cleared when you reload — treat the copied
        summary as your record of the session.
      </p>
    </main>
  );
}

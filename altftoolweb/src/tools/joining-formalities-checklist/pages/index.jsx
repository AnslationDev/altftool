"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardCheck, Copy, RotateCcw } from "lucide-react";

import { CHECKLIST_ITEMS, PHASES, summarizeJoining } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const buildDefaultItems = () =>
  CHECKLIST_ITEMS.map((item) => ({
    ...item,
    applicable: !item.conditional,
    done: false,
  }));

export default function ToolHome() {
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState(buildDefaultItems);
  const [joiningDate, setJoiningDate] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => summarizeJoining({ items, joiningDate, today }),
    [items, joiningDate, today],
  );
  const hasError = Boolean(result.error);

  const toggleDone = (id) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  const toggleApplicable = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, applicable: !item.applicable, done: false } : item,
      ),
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Joining formalities status",
      `Done: ${result.done} of ${result.applicable} (${result.completionPercent}%)`,
      result.joiningDateSet
        ? `Joining date: ${joiningDate} (${result.daysLeft} days away)`
        : "Joining date: not fixed yet",
      result.startNow.length > 0
        ? `Start today: ${result.startNow.map((i) => i.label).join("; ")}`
        : "No lead-time emergencies.",
      `Verdict: ${result.verdict}`,
    ].join("\n");
  }, [hasError, result, joiningDate]);

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
    setItems(buildDefaultItems());
    setJoiningDate("");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          Exam calendars
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Joining Formalities Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Medical, police verification, attestation forms, employer exit and the day-one kit —
          tracked phase by phase, with items that typically take longer than the time you have left
          flagged to start today.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="jfc-date">
              Joining / reporting date (optional)
            </label>
            <input
              id="jfc-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={joiningDate}
              onChange={(event) => setJoiningDate(event.target.value)}
            />
          </div>
        </div>

        {PHASES.map((phase) => {
          const phaseItems = items.filter((item) => item.phase === phase.id);
          if (phaseItems.length === 0) return null;
          return (
            <div key={phase.id} className="mt-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {phase.label}
              </h2>
              <ul className="mt-2 space-y-2">
                {phaseItems.map((item) => (
                  <li
                    key={item.id}
                    className={`rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 ${
                      item.applicable ? "" : "opacity-60"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <label
                        className="flex min-h-11 cursor-pointer items-start gap-3 text-sm"
                        htmlFor={`jfc-done-${item.id}`}
                      >
                        <input
                          id={`jfc-done-${item.id}`}
                          type="checkbox"
                          className="mt-0.5 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                          checked={item.done}
                          disabled={!item.applicable}
                          onChange={() => toggleDone(item.id)}
                        />
                        <span>
                          <span
                            className={`font-semibold ${item.done ? "line-through opacity-70" : ""}`}
                          >
                            {item.label}
                          </span>
                          {item.critical ? (
                            <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--danger)]">
                              Critical
                            </span>
                          ) : null}
                          <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                            {item.note} Typical lead: {item.leadDays} day
                            {item.leadDays === 1 ? "" : "s"}.
                          </span>
                        </span>
                      </label>
                      {item.conditional ? (
                        <label
                          className="flex min-h-11 cursor-pointer items-center gap-2 text-xs text-[var(--muted-foreground)]"
                          htmlFor={`jfc-app-${item.id}`}
                        >
                          <input
                            id={`jfc-app-${item.id}`}
                            type="checkbox"
                            className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                            checked={item.applicable}
                            onChange={() => toggleApplicable(item.id)}
                          />
                          Applies to me
                        </label>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
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
              Completion
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.completionPercent}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the checklist above to see progress." : result.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the joining formalities status"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy status"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the checklist"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Formalities done</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : `${result.done} of ${result.applicable}`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Days to joining</dt>
            <dd className="text-right font-semibold">
              {hasError || !result.joiningDateSet
                ? DASH
                : result.joiningPassed
                  ? "Date has passed"
                  : `${result.daysLeft} days`}
            </dd>
          </div>
          {(hasError ? [] : result.phases).map((phase) => (
            <div key={phase.id} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{phase.label}</dt>
              <dd className="text-right font-semibold">
                {phase.done} / {phase.total}
              </dd>
            </div>
          ))}
        </dl>

        {!hasError && result.startNow.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {result.startNow.map((item) => (
              <li
                key={item.id}
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                Start today: {item.label} — typically {item.leadDays} days, you have{" "}
                {item.daysLeft}.
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Lead times are planning estimates from how these processes commonly run; your appointment
        letter and its annexures are the binding instructions. State medical boards and police
        districts vary widely.
      </p>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, RotateCcw } from "lucide-react";

import { PROFILE_FLAGS, buildAnnualChecklist } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS =
  "mt-0.5 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DASH = "—";

const DEFAULT_PROFILE = { salaried: true, ppf: true, insurance: true, dependants: true };

const todayIso = () => new Date().toISOString().slice(0, 10);

const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatDue(iso) {
  if (!iso) return "Any time this year";
  const [y, m, d] = iso.split("-").map(Number);
  return DATE_FMT.format(new Date(Date.UTC(y, m - 1, d)));
}

export default function ToolHome() {
  const [asOfDate, setAsOfDate] = useState(todayIso);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [completedIds, setCompletedIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const toggleFlag = (id) => {
    setProfile((current) => ({ ...current, [id]: !current[id] }));
  };

  const toggleDone = (id) => {
    setCompletedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const result = useMemo(
    () => buildAnnualChecklist({ asOfDate, profile, completedIds }),
    [asOfDate, profile, completedIds],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Annual financial checklist — FY ${result.financialYear} (as of ${result.asOfDate})`,
      `${result.completedCount} of ${result.total} done, ${result.dueSoonCount} due within 30 days`,
      "",
    ];
    for (const group of result.byCategory) {
      lines.push(`${group.category}:`);
      for (const task of group.tasks) {
        lines.push(
          `${task.done ? "[x]" : "[ ]"} ${task.title} — ${task.dueDate ? `due ${formatDue(task.dueDate)}` : "any time this year"}`,
        );
      }
      lines.push("");
    }
    return lines.join("\n").trim();
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
    setAsOfDate(todayIso());
    setProfile(DEFAULT_PROFILE);
    setCompletedIds([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Financial year planner
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Annual Financial Checklist Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick what describes you and get the year&apos;s money tasks in deadline order — advance
          tax instalments, the 31 July return, the 31 March investment cut-off, minimum PPF and
          Sukanya deposits, nominee updates and the rest.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="afc-date">
              Build the checklist as of
            </label>
            <input
              id="afc-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={asOfDate}
              onChange={(event) => setAsOfDate(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5 border-t border-[var(--border)] pt-5">
          <legend className={LABEL_CLASS}>What describes you?</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {PROFILE_FLAGS.map((flag) => (
              <label
                key={flag.id}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm transition hover:border-[var(--primary)] focus-within:ring-[3px] focus-within:ring-[var(--primary)]/25"
                htmlFor={`afc-${flag.id}`}
              >
                <input
                  id={`afc-${flag.id}`}
                  type="checkbox"
                  className={CHECKBOX_CLASS}
                  checked={profile[flag.id] === true}
                  onChange={() => toggleFlag(flag.id)}
                />
                <span className="flex-1">{flag.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {hasError ? "Progress" : `FY ${result.financialYear} progress`}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.completedCount} / ${result.total}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your checklist."
                : result.nextTask
                  ? `Next deadline: ${result.nextTask.title} — ${formatDue(result.nextTask.dueDate)}`
                  : "Every dated task is ticked off."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the checklist"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy checklist"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <>
            <div
              className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="progressbar"
              aria-valuenow={result.completedCount}
              aria-valuemin={0}
              aria-valuemax={result.total}
              aria-label="Checklist progress"
            >
              <div
                className="h-full rounded-full bg-[var(--primary)] transition-all motion-reduce:transition-none"
                style={{ width: `${result.progressPct}%` }}
              />
            </div>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {[
                ["Tasks that apply to you", String(result.total)],
                ["Due within 30 days", String(result.dueSoonCount)],
                ["Remaining", String(result.remaining)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </section>

      {!hasError &&
        result.byCategory.map((group) => (
          <section
            key={group.category}
            className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
          >
            <h2 className="text-base font-semibold">{group.category}</h2>
            <ul className="mt-3 grid gap-2">
              {group.tasks.map((task) => (
                <li key={task.id}>
                  <label
                    className="flex cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm transition hover:border-[var(--primary)] focus-within:ring-[3px] focus-within:ring-[var(--primary)]/25"
                    htmlFor={`afc-task-${task.id}`}
                  >
                    <input
                      id={`afc-task-${task.id}`}
                      type="checkbox"
                      className={CHECKBOX_CLASS}
                      checked={task.done}
                      onChange={() => toggleDone(task.id)}
                    />
                    <span className="flex-1">
                      <span
                        className={`block font-semibold ${task.done ? "text-[var(--muted-foreground)] line-through" : ""}`}
                      >
                        {task.title}
                      </span>
                      <span className="mt-0.5 block text-[var(--muted-foreground)]">
                        {task.detail}
                      </span>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                          task.status === "due-soon" && !task.done
                            ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                            : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                        }`}
                      >
                        {task.dueDate
                          ? `Due ${formatDue(task.dueDate)}${
                              task.daysAway !== null && !task.done
                                ? ` — in ${task.daysAway} day${task.daysAway === 1 ? "" : "s"}`
                                : ""
                            }`
                          : "Any time this year"}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax or investment advice. Statutory dates are extended by
        notification in many years — confirm the current due dates on the income tax portal, and
        speak to a chartered accountant for anything specific to your situation.
      </p>
    </main>
  );
}

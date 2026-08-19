"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

import {
  DEFAULT_LEAD_DAYS,
  OPTION_KEYS,
  OPTION_LABELS,
  generateChecklist,
  shiftIsoDate,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const todayIso = () => new Date().toISOString().slice(0, 10);

const buildDefaults = () => {
  const today = todayIso();
  return {
    today,
    moveDate: shiftIsoDate(today, DEFAULT_LEAD_DAYS),
    options: {
      renting: true,
      hiringMovers: true,
      hasPets: false,
      hasKids: false,
      international: false,
    },
  };
};

const STATUS_LABEL = {
  overdue: "Should already be done",
  active: "Do this now",
  upcoming: "Coming up",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const prettyDate = (iso) => {
  const parsed = Date.parse(`${iso}T00:00:00Z`);
  return Number.isNaN(parsed) ? iso : DATE_FMT.format(parsed);
};

export default function ToolHome() {
  const [initial] = useState(buildDefaults);
  const [moveDate, setMoveDate] = useState(initial.moveDate);
  const [today, setToday] = useState(initial.today);
  const [options, setOptions] = useState(initial.options);
  const [done, setDone] = useState([]);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => generateChecklist({ moveDate, today, options, done }),
    [moveDate, today, options, done],
  );

  const hasError = Boolean(result.error);

  const toggleOption = (key) => (event) => {
    const next = event.target.checked;
    setOptions((current) => ({ ...current, [key]: next }));
  };

  const toggleTask = (key) => () => {
    setDone((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  const copyResult = async () => {
    if (hasError) return;
    const lines = [
      `Moving checklist — moving day ${prettyDate(result.moveDate)}`,
      `${NUM.format(result.daysUntilMove)} days to go · ${result.doneCount}/${result.totalTasks} done`,
      "",
    ];
    for (const phase of result.phases) {
      lines.push(`${phase.label} — ${prettyDate(phase.dueDate)}`);
      for (const task of phase.tasks) {
        lines.push(`  [${task.done ? "x" : " "}] ${task.text}`);
      }
      lines.push("");
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n").trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset the checklist? This clears your dates, options and all ticked tasks and cannot be undone.",
      )
    ) {
      return;
    }
    const fresh = buildDefaults();
    setMoveDate(fresh.moveDate);
    setToday(fresh.today);
    setOptions(fresh.options);
    setDone([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Moving &amp; relocation
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Moving Checklist Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your moving date and get a dated countdown — eight weeks out, six, four, three, two,
          the final week, moving day, and the follow-ups afterwards. Tasks are filtered to your
          situation.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mc-move">
              Moving day
            </label>
            <input
              id="mc-move"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={moveDate}
              onChange={(event) => setMoveDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mc-today">
              Planning from (today)
            </label>
            <input
              id="mc-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Your situation</legend>
          <div className="mt-2 grid gap-2">
            {OPTION_KEYS.map((key) => (
              <label
                key={key}
                htmlFor={`mc-opt-${key}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
              >
                <input
                  id={`mc-opt-${key}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={Boolean(options[key])}
                  onChange={toggleOption(key)}
                />
                <span>{OPTION_LABELS[key]}</span>
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

      <section aria-live="polite" className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Days until moving day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.daysUntilMove)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the dates above to build the checklist."
                : `Moving day ${prettyDate(result.moveDate)} · ${result.totalTasks} tasks`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the moving checklist"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy checklist"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset dates, options and ticked tasks"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Tasks done", hasError ? DASH : `${NUM.format(result.doneCount)} / ${NUM.format(result.totalTasks)}`],
            ["Progress", hasError ? DASH : `${NUM.format(result.percentDone)}%`],
            ["Open tasks already past their date", hasError ? DASH : NUM.format(result.overdueOpen)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${result.percentDone}% of the checklist is done`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, result.percentDone))}%` }}
              />
            </div>
          </div>
        ) : null}
      </section>

      {hasError
        ? null
        : result.phases.map((phase) => (
            <section
              key={phase.id}
              className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold">
                  {phase.label}
                  <span className="ml-2 font-normal text-[var(--muted-foreground)]">
                    {prettyDate(phase.dueDate)}
                  </span>
                </h2>
                <p className="text-sm font-semibold text-[var(--muted-foreground)]">
                  {phase.doneCount}/{phase.tasks.length}
                </p>
              </div>
              <p
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                  phase.status === "overdue"
                    ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                    : phase.status === "active"
                      ? "bg-[var(--muted)] text-[var(--primary)]"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                }`}
              >
                {STATUS_LABEL[phase.status]}
              </p>
              <div className="mt-3 grid gap-2">
                {phase.tasks.map((task) => (
                  <label
                    key={task.key}
                    htmlFor={`mc-${task.key}`}
                    className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
                  >
                    <input
                      id={`mc-${task.key}`}
                      type="checkbox"
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                      checked={task.done}
                      onChange={toggleTask(task.key)}
                    />
                    <span className={task.done ? "flex-1 text-[var(--muted-foreground)] line-through" : "flex-1"}>
                      {task.text}
                    </span>
                  </label>
                ))}
              </div>
            </section>
          ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        General guidance only. Notice periods, utility disconnection lead times and deposit-return
        deadlines are set by your contract and local law — read your agreement, and take legal advice
        if a landlord or mover disputes it. Nothing you tick leaves your browser.
      </p>
    </main>
  );
}

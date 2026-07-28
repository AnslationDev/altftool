"use client";

import { useMemo, useState } from "react";
import { Activity, Check, Copy, RotateCcw } from "lucide-react";

import { DEFAULT_SELECTION, DRILLS, buildRoutine, formatClock } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = { rounds: "2", rest: "10", screenHours: "8" };

const toNumber = (raw) => {
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [selected, setSelected] = useState(DEFAULT_SELECTION);
  const [rounds, setRounds] = useState(DEFAULTS.rounds);
  const [rest, setRest] = useState(DEFAULTS.rest);
  const [screenHours, setScreenHours] = useState(DEFAULTS.screenHours);
  const [copied, setCopied] = useState(false);

  const routine = useMemo(
    () =>
      buildRoutine({
        selectedIds: selected,
        rounds: toNumber(rounds),
        restSeconds: toNumber(rest),
        screenHours: toNumber(screenHours),
      }),
    [selected, rounds, rest, screenHours],
  );

  const hasError = Boolean(routine.error);

  const toggle = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Eye Exercise Routine Builder",
      `One round: ${routine.roundClock} (${routine.drillCount} drills, ${routine.restTotal}s of rest)`,
      `Rounds per day: ${routine.rounds}`,
      `Total per day: ${routine.dailyClock} (${routine.dailyMinutes} min)`,
      `Total per week: ${routine.weeklyMinutes} min`,
      "",
      "Running order:",
      ...routine.steps.map(
        (step) => `${step.index}. ${step.startsAtClock} — ${step.name} (${step.durationClock})`,
      ),
      "",
      `Plus about ${routine.breaksNeeded} separate 20-20-20 breaks across ${routine.screenHours} screen hours.`,
    ].join("\n");
  }, [routine, hasError]);

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
    setSelected(DEFAULT_SELECTION);
    setRounds(DEFAULTS.rounds);
    setRest(DEFAULTS.rest);
    setScreenHours(DEFAULTS.screenHours);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["One round", DASH],
        ["Exercises selected", DASH],
        ["Rest between drills", DASH],
        ["Rounds per day", DASH],
        ["Total per day", DASH],
        ["Total per week", DASH],
        ["Areas covered", DASH],
        ["Separate 20-20-20 breaks", DASH],
      ]
    : [
        ["One round", routine.roundClock],
        ["Exercises selected", String(routine.drillCount)],
        ["Rest between drills", `${routine.restTotal}s total`],
        ["Rounds per day", String(routine.rounds)],
        ["Total per day", `${routine.dailyClock} (${NUM.format(routine.dailyMinutes)} min)`],
        ["Total per week", `${NUM.format(routine.weeklyMinutes)} min`],
        ["Areas covered", routine.categories.join(", ")],
        [
          "Separate 20-20-20 breaks",
          `${routine.breaksNeeded} across ${NUM.format(routine.screenHours)} screen hours`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Activity className="h-4 w-4" aria-hidden="true" />
          Eye care
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Eye Exercise Routine Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the drills you want, and get a running order with real timings — lubrication first,
          focusing work in the middle, relaxation last — plus the total time it costs each day.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">Choose your drills</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {DRILLS.map((drill) => {
              const checked = selected.includes(drill.id);
              return (
                <label
                  key={drill.id}
                  htmlFor={`drill-${drill.id}`}
                  className={`flex min-h-11 cursor-pointer gap-3 rounded-md border p-3 transition ${
                    checked
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`drill-${drill.id}`}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(drill.id)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  />
                  <span className="text-sm">
                    <span className="block font-semibold">
                      {drill.name} · {formatClock(drill.seconds)}
                    </span>
                    <span className="mt-1 block text-[var(--muted-foreground)]">{drill.why}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="eer-rounds">
              Rounds per day
            </label>
            <input
              id="eer-rounds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="10"
              step="1"
              value={rounds}
              onChange={(event) => setRounds(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eer-rest">
              Rest between drills (seconds)
            </label>
            <input
              id="eer-rest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="5"
              value={rest}
              onChange={(event) => setRest(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="eer-screen">
              Screen hours per day
            </label>
            <input
              id="eer-screen"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="24"
              step="0.5"
              value={screenHours}
              onChange={(event) => setScreenHours(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {routine.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total routine time per day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : routine.dailyClock}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Select at least one drill to build a routine."
                : `${routine.rounds} round${routine.rounds === 1 ? "" : "s"} of ${routine.roundClock}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the eye exercise routine"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the routine" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && routine.notes.length > 0 && (
          <ul className="mt-5 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {routine.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Running order</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Starts
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Drill
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Length
                  </th>
                </tr>
              </thead>
              <tbody>
                {routine.steps.map((step) => (
                  <tr key={step.id} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2 pr-3 font-semibold tabular-nums">{step.startsAtClock}</td>
                    <td className="py-2 pr-3">
                      <span className="block font-semibold">{step.name}</span>
                      <span className="mt-1 block text-[var(--muted-foreground)]">{step.how}</span>
                    </td>
                    <td className="py-2 text-right tabular-nums">{step.durationClock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. These drills can ease the tired, strained feeling that follows long near
        work and support dry-eye self-care, but they do not correct short-sightedness, long-sightedness
        or astigmatism and are not a substitute for glasses, contact lenses or prescribed vision
        therapy. See an optometrist or ophthalmologist for double vision, sudden blur, eye pain or
        headaches that keep coming back.
      </p>
    </main>
  );
}

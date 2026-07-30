"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Smartphone, TriangleAlert } from "lucide-react";

import {
  CRITICAL_CAP_PERCENT,
  DEFAULT_AGE,
  DEFAULT_DONE,
  GROUPS,
  ageBandFor,
  dailyTimeBudget,
  formatMinutes,
  scoreSetup,
} from "../lib";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";

const DASH = "—";

const DEFAULTS = { age: DEFAULT_AGE, school: 420, homework: 45, activity: 60 };

const asNumber = (raw) => (String(raw).trim() === "" ? Number.NaN : Number(raw));

export default function ToolHome() {
  const [age, setAge] = useState(String(DEFAULTS.age));
  const [school, setSchool] = useState(String(DEFAULTS.school));
  const [homework, setHomework] = useState(String(DEFAULTS.homework));
  const [activity, setActivity] = useState(String(DEFAULTS.activity));
  const [done, setDone] = useState(() => DEFAULT_DONE.slice());
  const [copied, setCopied] = useState(false);

  const numericAge = asNumber(age);
  const result = useMemo(
    () => scoreSetup({ age: numericAge, doneIds: done }),
    [numericAge, done]
  );
  const band = useMemo(() => ageBandFor(numericAge), [numericAge]);
  const budget = useMemo(
    () =>
      dailyTimeBudget({
        age: numericAge,
        schoolMinutes: asNumber(school),
        homeworkMinutes: asNumber(homework),
        activityMinutes: asNumber(activity),
      }),
    [numericAge, school, homework, activity]
  );

  const toggleStep = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setCopied(false);
  };

  const reset = () => {
    setAge(String(DEFAULTS.age));
    setSchool(String(DEFAULTS.school));
    setHomework(String(DEFAULTS.homework));
    setActivity(String(DEFAULTS.activity));
    setDone(DEFAULT_DONE.slice());
    setCopied(false);
  };

  const hasResult = !result.error;
  const hasBudget = !budget.error;

  const summary = useMemo(() => {
    if (!hasResult) return "";
    const lines = [
      "Android Kids Device Setup Guide",
      `Child's age: ${result.age}`,
      `Setup score: ${result.percent}% — ${result.bandLabel}`,
      `Steps done: ${result.completed} of ${result.total}`,
      `Time still needed: ${formatMinutes(result.remainingMinutes)}`,
    ];
    if (hasBudget) {
      lines.push(
        `Recommended sleep: ${budget.sleepLowHours}-${budget.sleepHighHours} hours`,
        `Discretionary time left in the day: ${formatMinutes(budget.discretionaryMinutes)}`
      );
    }
    lines.push("");
    if (result.remaining.length === 0) {
      lines.push("Nothing left — every step for this age is done.");
    } else {
      lines.push("Still to do:");
      for (const item of result.remaining) {
        lines.push(`- ${item.title}${item.critical ? " (critical)" : ""}`);
      }
    }
    return lines.join("\n");
  }, [hasResult, hasBudget, result, budget]);

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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Smartphone className="h-4 w-4" aria-hidden="true" />
          Kids device safety
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Android Kids Device Setup Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set the age and the list rearranges itself &mdash; a supervised account for a seven-year-old
          is a different job from a supervision invitation a fifteen-year-old accepts. Work down the
          groups in order; each step shows how long it actually takes.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="child-age">
              Child&rsquo;s age (years)
            </label>
            <input
              id="child-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="2"
              max="17"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div className="self-end text-sm text-[var(--muted-foreground)]">
            <p>{band.error ? band.error : `Age band: ${band.label}`}</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="school-minutes">
              School and travel (minutes a day)
            </label>
            <input
              id="school-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="1440"
              step="15"
              value={school}
              onChange={(event) => setSchool(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="homework-minutes">
              Homework and reading (minutes a day)
            </label>
            <input
              id="homework-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="1440"
              step="15"
              value={homework}
              onChange={(event) => setHomework(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="activity-minutes">
              Sport, play and clubs (minutes a day)
            </label>
            <input
              id="activity-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="1440"
              step="15"
              value={activity}
              onChange={(event) => setActivity(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-labelledby="setup-score"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              id="setup-score"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Setup score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasResult ? `${result.percent}%` : DASH}
            </p>
            <p className="mt-1 text-sm font-semibold">{hasResult ? result.bandLabel : DASH}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasResult ? result.bandHint : "Enter a valid age to build the plan."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the Android setup plan"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the guide" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={hasResult ? `Setup score ${result.percent} out of 100` : "Score unavailable"}
        >
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${hasResult ? result.percent : 0}%` }}
          />
        </div>

        {result.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Steps that apply at this age", hasResult ? String(result.total) : DASH],
            ["Steps completed", hasResult ? `${result.completed} of ${result.total}` : DASH],
            [
              "Critical steps still open",
              hasResult ? `${result.missingCritical.length} of ${result.criticalTotal}` : DASH,
            ],
            ["Setup time still needed", hasResult ? formatMinutes(result.remainingMinutes) : DASH],
            [
              "Recommended sleep",
              hasBudget ? `${budget.sleepLowHours}-${budget.sleepHighHours} hours a night` : DASH,
            ],
            [
              "Discretionary time left in the day",
              hasBudget ? formatMinutes(budget.discretionaryMinutes) : DASH,
            ],
            [
              "Published screen-time cap",
              hasBudget
                ? budget.capMinutes === null
                  ? "None published for this age"
                  : formatMinutes(budget.capMinutes)
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {budget.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {budget.error}
          </p>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">{budget.capBasis}</p>
        )}

        {hasResult && result.capped ? (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Held at {CRITICAL_CAP_PERCENT}% while a critical step is open. Limits mean very little on
              an account that is not actually supervised.
            </span>
          </p>
        ) : null}

        {hasResult && result.nextActions.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Do these next
            </p>
            <ol className="mt-2 space-y-1 text-sm">
              {result.nextActions.map((item) => (
                <li key={item.id} className="flex gap-2">
                  <span className="font-semibold text-[var(--primary)]">+{item.weight}</span>
                  <span>{item.title}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </section>

      {hasResult ? (
        <section className="mt-6 space-y-4">
          {GROUPS.map((group) => {
            const items = result.steps.filter((item) => item.group === group);
            if (items.length === 0) return null;
            const groupStat = result.groups.find((entry) => entry.name === group);
            return (
              <div key={group} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-semibold">{group}</h2>
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                    {groupStat ? `${groupStat.done}/${groupStat.total} done` : DASH}
                  </span>
                </div>
                <ul className="mt-3 space-y-2">
                  {items.map((item) => (
                    <li key={item.id}>
                      <label
                        htmlFor={`step-${item.id}`}
                        className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                      >
                        <input
                          id={`step-${item.id}`}
                          type="checkbox"
                          checked={done.includes(item.id)}
                          onChange={() => toggleStep(item.id)}
                          className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                        />
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold">{item.title}</span>
                            {item.critical ? (
                              <span className="rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--danger)]">
                                Critical
                              </span>
                            ) : null}
                            <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted-foreground)]">
                              {formatMinutes(item.minutes)}
                            </span>
                          </span>
                          <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                            {item.detail}
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Mistakes worth avoiding</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            Leaving the parent&rsquo;s Google account signed in &ldquo;just for setup&rdquo;. Every
            restriction and every activity report depends on one account per device.
          </li>
          <li>
            Setting Play authentication to every 30 minutes instead of every purchase, which leaves a
            half-hour window after any approved buy.
          </li>
          <li>
            Relying on the main YouTube app for an under-13. There is no middle setting that behaves
            the way parents expect.
          </li>
          <li>
            Turning on location without telling the child. Undisclosed monitoring is what pushes
            teenagers to a second device you know nothing about.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Menu names move as Android and Family Link are updated, so follow the
        description rather than hunting for exact wording, and check Google&rsquo;s own help pages if a
        setting has moved. Nothing you tick leaves this browser tab, and the page never asks for an
        account, a password or a child&rsquo;s name.
      </p>
    </main>
  );
}

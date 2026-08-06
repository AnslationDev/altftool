"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Tablet, TriangleAlert } from "lucide-react";

import {
  CRITICAL_CAP_PERCENT,
  DEFAULT_AGE,
  DEFAULT_DONE,
  DEFAULT_MODE,
  DEFAULT_SCHEDULE,
  GROUPS,
  MODES,
  formatMinutes,
  scoreSetup,
  studySchedule,
} from "../lib";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";

const DASH = "—";

const asNumber = (raw) => (String(raw).trim() === "" ? Number.NaN : Number(raw));

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULT_MODE);
  const [age, setAge] = useState(String(DEFAULT_AGE));
  const [done, setDone] = useState(() => DEFAULT_DONE.slice());
  const [startTime, setStartTime] = useState(DEFAULT_SCHEDULE.startTime);
  const [sessionMinutes, setSessionMinutes] = useState(String(DEFAULT_SCHEDULE.sessionMinutes));
  const [breakMinutes, setBreakMinutes] = useState(String(DEFAULT_SCHEDULE.breakMinutes));
  const [sessionCount, setSessionCount] = useState(String(DEFAULT_SCHEDULE.sessionCount));
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => scoreSetup({ mode, age: asNumber(age), doneIds: done }),
    [mode, age, done]
  );
  const schedule = useMemo(
    () =>
      studySchedule({
        startTime,
        sessionMinutes: asNumber(sessionMinutes),
        breakMinutes: asNumber(breakMinutes),
        sessionCount: asNumber(sessionCount),
      }),
    [startTime, sessionMinutes, breakMinutes, sessionCount]
  );

  const toggleStep = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setCopied(false);
  };

  const reset = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Reset the setup guide? This clears every checked-off step and your homework block schedule.",
      )
    ) {
      return;
    }
    setMode(DEFAULT_MODE);
    setAge(String(DEFAULT_AGE));
    setDone(DEFAULT_DONE.slice());
    setStartTime(DEFAULT_SCHEDULE.startTime);
    setSessionMinutes(String(DEFAULT_SCHEDULE.sessionMinutes));
    setBreakMinutes(String(DEFAULT_SCHEDULE.breakMinutes));
    setSessionCount(String(DEFAULT_SCHEDULE.sessionCount));
    setCopied(false);
  };

  const hasResult = !result.error;
  const hasSchedule = !schedule.error;

  const summary = useMemo(() => {
    if (!hasResult) return "";
    const lines = [
      "iPad Study Device Setup Guide",
      `Arrangement: ${MODES.find((entry) => entry.id === mode)?.label ?? mode}`,
      `Setup score: ${result.percent}% — ${result.bandLabel}`,
      `Steps done: ${result.completed} of ${result.total}`,
      `Time still needed: ${formatMinutes(result.remainingMinutes)}`,
    ];
    if (hasSchedule) {
      lines.push(
        "",
        `Homework plan: ${schedule.sessionCount} x ${schedule.sessionMinutes} min, ${schedule.breakMinutes} min breaks`,
        `${schedule.startTime} to ${schedule.endTime} (${formatMinutes(schedule.elapsedMinutes)})`,
        `Eye breaks to expect: ${schedule.eyeBreaksTotal}`
      );
    }
    lines.push("");
    if (result.remaining.length === 0) {
      lines.push("Nothing left — every step for this setup is done.");
    } else {
      lines.push("Still to do:");
      for (const item of result.remaining) {
        lines.push(`- ${item.title}${item.critical ? " (critical)" : ""}`);
      }
    }
    return lines.join("\n");
  }, [hasResult, hasSchedule, result, schedule, mode]);

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
          <Tablet className="h-4 w-4" aria-hidden="true" />
          Kids device safety
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          iPad Study Device Setup Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          An iPad has no ordinary multi-user profiles at home, so shared and personal are genuinely
          different setups. Pick the arrangement, work through the steps, then plan the homework
          blocks so the finish time is known before anyone sits down.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Whose iPad is this?
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {MODES.map((entry) => (
              <label
                key={entry.id}
                htmlFor={`mode-${entry.id}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
              >
                <input
                  id={`mode-${entry.id}`}
                  type="radio"
                  name="ipad-mode"
                  value={entry.id}
                  checked={mode === entry.id}
                  onChange={() => {
                    setMode(entry.id);
                    setCopied(false);
                  }}
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{entry.label}</span>
                  <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                    {entry.hint}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="child-age">
              Child&rsquo;s age (years)
            </label>
            <input
              id="child-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="4"
              max="17"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
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
              {hasResult ? result.bandHint : "Choose an arrangement and a valid age to build the plan."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the iPad study setup plan"
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
            ["Steps that apply here", hasResult ? String(result.total) : DASH],
            ["Steps completed", hasResult ? `${result.completed} of ${result.total}` : DASH],
            [
              "Critical steps still open",
              hasResult ? `${result.missingCritical.length} of ${result.criticalTotal}` : DASH,
            ],
            ["Setup time still needed", hasResult ? formatMinutes(result.remainingMinutes) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasResult && result.capped ? (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Held at {CRITICAL_CAP_PERCENT}% while a critical step is open. Filters do not help on an
              iPad that can be swiped straight out of the study app.
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Plan the homework blocks</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="start-time">
              Start time
            </label>
            <input
              id="start-time"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="session-count">
              Number of study blocks
            </label>
            <input
              id="session-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={sessionCount}
              onChange={(event) => setSessionCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="session-minutes">
              Study block length (minutes)
            </label>
            <input
              id="session-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="180"
              step="5"
              value={sessionMinutes}
              onChange={(event) => setSessionMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="break-minutes">
              Break length (minutes)
            </label>
            <input
              id="break-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="5"
              value={breakMinutes}
              onChange={(event) => setBreakMinutes(event.target.value)}
            />
          </div>
        </div>

        {schedule.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {schedule.error}
          </p>
        ) : (
          <>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {[
                ["Finishes at", schedule.crossesMidnight ? `${schedule.endTime} (next day)` : schedule.endTime],
                ["Time at the desk", formatMinutes(schedule.elapsedMinutes)],
                ["Study time", formatMinutes(schedule.totalStudyMinutes)],
                ["Break time", formatMinutes(schedule.totalBreakMinutes)],
                ["20-20-20 eye breaks", String(schedule.eyeBreaksTotal)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Block</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Start</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">End</th>
                    <th scope="col" className="py-2 text-right font-semibold">Length</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.blocks.map((block) => (
                    <tr key={block.key} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">
                        {block.type === "study" ? `Study ${block.index}` : "Break"}
                      </td>
                      <td className="py-2 pr-3">{block.start}</td>
                      <td className="py-2 pr-3">{block.end}</td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]">
                        {formatMinutes(block.minutes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
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
            Handing over a shared iPad still signed into a work mailbox and a password manager.
          </li>
          <li>
            Leaving AirDrop on Everyone, which is how unsolicited images arrive on a train or in a
            classroom.
          </li>
          <li>
            Setting up Guided Access but never putting it on the Accessibility Shortcut, so nobody uses
            it on a school night.
          </li>
          <li>
            Blocking the browser and forgetting to allow the school portal, then disabling the whole
            filter mid-homework.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not medical advice about eyes, sleep or attention &mdash; ask an
        optometrist or your child&rsquo;s doctor about symptoms. Setting names move between iPadOS
        versions, so follow the description rather than the exact wording. Nothing you enter leaves
        this browser tab.
      </p>
    </main>
  );
}

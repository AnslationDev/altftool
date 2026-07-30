"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Laptop, RotateCcw, TriangleAlert } from "lucide-react";

import {
  CRITICAL_CAP_PERCENT,
  DEFAULT_AGE,
  DEFAULT_DONE,
  DEFAULT_LIMITS,
  GROUPS,
  ageBandFor,
  formatMinutes,
  scoreSetup,
  weeklyScreenTimePlan,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

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
  const [age, setAge] = useState(String(DEFAULT_AGE));
  const [weekday, setWeekday] = useState(String(DEFAULT_LIMITS.weekdayMinutes));
  const [weekend, setWeekend] = useState(String(DEFAULT_LIMITS.weekendMinutes));
  const [done, setDone] = useState(() => DEFAULT_DONE.slice());
  const [copied, setCopied] = useState(false);

  const numericAge = asNumber(age);
  const result = useMemo(() => scoreSetup({ age: numericAge, doneIds: done }), [numericAge, done]);
  const band = useMemo(() => ageBandFor(numericAge), [numericAge]);
  const plan = useMemo(
    () =>
      weeklyScreenTimePlan({
        weekdayMinutes: asNumber(weekday),
        weekendMinutes: asNumber(weekend),
      }),
    [weekday, weekend]
  );

  const toggleStep = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setCopied(false);
  };

  const reset = () => {
    setAge(String(DEFAULT_AGE));
    setWeekday(String(DEFAULT_LIMITS.weekdayMinutes));
    setWeekend(String(DEFAULT_LIMITS.weekendMinutes));
    setDone(DEFAULT_DONE.slice());
    setCopied(false);
  };

  const hasResult = !result.error;
  const hasPlan = !plan.error;

  const summary = useMemo(() => {
    if (!hasResult) return "";
    const lines = [
      "Windows Family Account Setup Guide",
      `Child's age: ${result.age}`,
      `Setup score: ${result.percent}% — ${result.bandLabel}`,
      `Steps done: ${result.completed} of ${result.total}`,
      `Time still needed: ${formatMinutes(result.remainingMinutes)}`,
    ];
    if (hasPlan) {
      lines.push(
        "",
        `Screen time: ${formatMinutes(plan.weekdayMinutes)} on school nights, ${formatMinutes(plan.weekendMinutes)} at weekends`,
        `That is ${formatMinutes(plan.weeklyMinutes)} a week and about ${plan.yearlyHours} hours a year`
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
  }, [hasResult, hasPlan, result, plan]);

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
          <Laptop className="h-4 w-4" aria-hidden="true" />
          Kids device safety
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Windows Family Account Setup Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two things decide whether Family Safety actually holds: whether the child&rsquo;s Windows
          account is a standard user, and whether you knew that web filtering blocks every browser
          except Edge. Both are handled below, in order.
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
              min="3"
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
            <label className={LABEL_CLASS} htmlFor="weekday-minutes">
              School-night limit (minutes a day)
            </label>
            <input
              id="weekday-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="1440"
              step="15"
              value={weekday}
              onChange={(event) => setWeekday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="weekend-minutes">
              Weekend limit (minutes a day)
            </label>
            <input
              id="weekend-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="1440"
              step="15"
              value={weekend}
              onChange={(event) => setWeekend(event.target.value)}
            />
          </div>
        </div>

        {plan.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {plan.error}
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Day</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Type</th>
                  <th scope="col" className="py-2 text-right font-semibold">Limit</th>
                </tr>
              </thead>
              <tbody>
                {plan.days.map((day) => (
                  <tr key={day.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{day.name}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {day.weekend ? "Weekend" : "School night"}
                    </td>
                    <td className="py-2 text-right">{formatMinutes(day.minutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
              aria-label="Copy the Windows family setup plan"
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
            ["Screen time a week", hasPlan ? formatMinutes(plan.weeklyMinutes) : DASH],
            ["Daily average", hasPlan ? formatMinutes(plan.dailyAverageMinutes) : DASH],
            ["Share taken by the weekend", hasPlan ? `${plan.weekendSharePercent}%` : DASH],
            ["Hours a year at this rate", hasPlan ? NUM.format(plan.yearlyHours) : DASH],
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
              Held at {CRITICAL_CAP_PERCENT}% while a critical step is open. An administrator account
              can remove every other control on this list.
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
            Leaving the child&rsquo;s account as an administrator, which lets them remove every control
            here in about a minute.
          </li>
          <li>
            Letting the whole family share one Windows login, so the activity report shows nothing and
            the limits apply to nobody.
          </li>
          <li>
            Turning on web filtering without warning, then disabling it in frustration when a school
            tool only works in Chrome.
          </li>
          <li>
            Capping daily minutes but leaving the overnight hours allowed, which protects nothing that
            matters.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Microsoft moves Family Safety settings between the app, the web dashboard
        and Windows Settings, so follow the description rather than exact menu wording, and check
        Microsoft&rsquo;s own support pages if something has moved. Nothing you enter leaves this
        browser tab.
      </p>
    </main>
  );
}

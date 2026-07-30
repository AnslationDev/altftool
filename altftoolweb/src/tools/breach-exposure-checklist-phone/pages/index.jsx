"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Copy, RotateCcw, ShieldCheck, Smartphone, TriangleAlert } from "lucide-react";

import {
  CHECKLIST,
  CRITICAL_CAP_PERCENT,
  DEFAULT_DONE,
  GROUPS,
  daysBetween,
  overdueSteps,
  scoreChecklist,
  windowLabel,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const CRITICAL_COUNT = CHECKLIST.filter((item) => item.critical).length;

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function ToolHome() {
  const [today] = useState(todayISO);
  const [discovered, setDiscovered] = useState(today);
  const [done, setDone] = useState(() => DEFAULT_DONE.slice());
  const [copied, setCopied] = useState(false);

  const score = useMemo(() => scoreChecklist(done), [done]);
  const elapsed = useMemo(() => daysBetween(discovered, today), [discovered, today]);
  const triage = useMemo(
    () => (elapsed.error ? elapsed : overdueSteps(done, elapsed.days)),
    [done, elapsed]
  );

  const toggle = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setCopied(false);
  };

  const reset = () => {
    setDone(DEFAULT_DONE.slice());
    setDiscovered(today);
    setCopied(false);
  };

  const hasScore = !score.error;
  const hasTriage = !triage.error;

  const summary = useMemo(() => {
    if (!hasScore) return "";
    const lines = [
      "Phone Number Exposure Checklist",
      `Response score: ${score.percent}% — ${score.bandLabel}`,
      `Steps done: ${score.completed} of ${score.total}`,
      `Critical steps still open: ${score.missingCritical.length} of ${CRITICAL_COUNT}`,
    ];
    if (hasTriage) lines.push(`Days since discovery: ${triage.daysElapsed}`);
    lines.push("");
    if (score.remaining.length === 0) {
      lines.push("Nothing left — every step is ticked.");
    } else {
      lines.push("Still to do:");
      for (const item of score.remaining) {
        lines.push(`- [${windowLabel(item.window)}] ${item.title}${item.critical ? " (critical)" : ""}`);
      }
    }
    return lines.join("\n");
  }, [hasScore, hasTriage, score, triage]);

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
          Breach response
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Phone Number Exposure Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A leaked phone number is a SIM-swap target, a magnet for smishing and spoofed spam calls,
          and a fallback identity check at your bank and carrier. Tick each step as you finish it
          &mdash; the score weights the ones that actually close those paths.
        </p>
      </header>

      <section
        className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-labelledby="score-heading"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              id="score-heading"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Response score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasScore ? `${score.percent}%` : DASH}
            </p>
            <p className="mt-1 text-sm font-semibold">{hasScore ? score.bandLabel : DASH}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasScore ? score.bandHint : "Fix the problem shown below to see a score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the phone number exposure response plan"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={hasScore ? `Response score ${score.percent} out of 100` : "Score unavailable"}
        >
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${hasScore ? score.percent : 0}%` }}
          />
        </div>

        {score.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {score.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Steps completed", hasScore ? `${score.completed} of ${score.total}` : DASH],
            [
              "Weighted points",
              hasScore ? `${NUM.format(score.points)} / ${NUM.format(score.maxPoints)}` : DASH,
            ],
            [
              "Critical steps still open",
              hasScore ? `${score.missingCritical.length} of ${CRITICAL_COUNT}` : DASH,
            ],
            ["Days since discovery", hasTriage ? NUM.format(triage.daysElapsed) : DASH],
            ["Steps past their window", hasTriage ? NUM.format(triage.overdue.length) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasScore && score.capped ? (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Held at {CRITICAL_CAP_PERCENT}% while a critical step is open. Filtering and clean-up
              cannot make up for a number that can still be ported out or still works as a
              verification answer.
            </span>
          </p>
        ) : null}

        {hasScore && score.nextActions.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Do these next
            </p>
            <ol className="mt-2 space-y-1 text-sm">
              {score.nextActions.map((item) => (
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="discovered-on">
              Date you learned about the exposure
            </label>
            <input
              id="discovered-on"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              max={today}
              value={discovered}
              onChange={(event) => setDiscovered(event.target.value)}
            />
          </div>
          <div className="self-end text-sm text-[var(--muted-foreground)]">
            <p>
              Each step has a window &mdash; 24 hours, a week, a month, or ongoing. Anything still
              open past its window is listed below.
            </p>
          </div>
        </div>

        {triage.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {triage.error}
          </p>
        ) : triage.overdue.length === 0 ? (
          <p className="mt-4 flex items-center gap-2 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            Nothing is past its window at day {NUM.format(triage.daysElapsed)}.
          </p>
        ) : (
          <div className="mt-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 shrink-0 text-[var(--warning)]" aria-hidden="true" />
              {triage.overdue.length} step{triage.overdue.length === 1 ? "" : "s"} past the window at
              day {NUM.format(triage.daysElapsed)}
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {triage.overdue.map((item) => (
                <li key={item.id} className="flex flex-wrap gap-2">
                  <span className="font-semibold text-[var(--warning)]">
                    {windowLabel(item.window)}
                  </span>
                  <span className="text-[var(--muted-foreground)]">{item.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-6 space-y-4">
        {GROUPS.map((group) => {
          const items = CHECKLIST.filter((item) => item.group === group);
          const groupStat = hasScore ? score.groups.find((entry) => entry.name === group) : null;
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
                        onChange={() => toggle(item.id)}
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
                            {windowLabel(item.window)}
                          </span>
                          <span className="text-[11px] font-semibold text-[var(--muted-foreground)]">
                            +{item.weight}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Mistakes worth avoiding</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            Waiting for a SIM swap to actually happen before calling your carrier. The port-out lock
            only helps if it is in place before an attacker tries, not after.
          </li>
          <li>
            Assuming caller ID proves who is calling. Once a number is confirmed active, spoofing the
            caller ID of your bank or carrier costs an attacker nothing.
          </li>
          <li>
            Reading a one-time code back to a caller because they already knew your name and number.
            Knowing those two facts is exactly what the leak gave them.
          </li>
          <li>
            Turning on spam-call filtering and stopping there. It reduces volume; it does not close
            the SIM-swap or verification-token paths the rest of the checklist covers.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not legal advice. Nothing you tick leaves this browser tab and the
        page never asks for your phone number. If the exposure came with threats or harassment,
        contact the police and a lawyer rather than handling it alone.
      </p>
    </main>
  );
}

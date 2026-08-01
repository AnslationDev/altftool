"use client";

import { useMemo, useState } from "react";
import { Building2, Check, Copy, RotateCcw, TriangleAlert } from "lucide-react";

import {
  CRITICAL_CAP_PERCENT,
  DATA_CLASSES,
  DEFAULT_CLASSES,
  DEFAULT_DONE,
  GROUPS,
  assessResponse,
  breachSeverity,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [classes, setClasses] = useState(() => DEFAULT_CLASSES.slice());
  const [done, setDone] = useState(() => DEFAULT_DONE.slice());
  const [copied, setCopied] = useState(false);

  const severity = useMemo(() => breachSeverity(classes), [classes]);
  const result = useMemo(
    () => assessResponse({ classIds: classes, doneIds: done }),
    [classes, done]
  );

  const toggleClass = (id) => {
    setClasses((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setCopied(false);
  };

  const toggleStep = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setCopied(false);
  };

  const reset = () => {
    setClasses(DEFAULT_CLASSES.slice());
    setDone(DEFAULT_DONE.slice());
    setCopied(false);
  };

  const hasResult = !result.error;
  const hasSeverity = !severity.error;

  const summary = useMemo(() => {
    if (!hasResult) return "";
    const lines = [
      "Employer Data Breach Employee Checklist",
      `Breach severity: ${hasSeverity ? severity.tierLabel : DASH}`,
      `Response score: ${result.percent}% — ${result.bandLabel}`,
      `Applicable steps done: ${result.completed} of ${result.total}`,
      `Critical steps still open: ${result.missingCritical.length} of ${result.criticalTotal}`,
      "",
    ];
    if (result.remaining.length === 0) {
      lines.push("Nothing left — every applicable step is ticked.");
    } else {
      lines.push("Still to do:");
      for (const item of result.remaining) {
        lines.push(`- ${item.title}${item.critical ? " (critical)" : ""}`);
      }
    }
    return lines.join("\n");
  }, [hasResult, hasSeverity, result, severity]);

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
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Breach response
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Employer Data Breach Employee Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Start from what the notice actually says was exposed. The plan below adds and removes steps
          as you tick categories, and the score only counts the steps that apply to your breach.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What does the notice say was involved?</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Tick the categories only. If the letter is vague, ask HR in writing before assuming the
          narrower answer.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {DATA_CLASSES.map((entry) => (
            <label
              key={entry.id}
              htmlFor={`class-${entry.id}`}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
            >
              <input
                id={`class-${entry.id}`}
                type="checkbox"
                checked={classes.includes(entry.id)}
                onChange={() => toggleClass(entry.id)}
                className="h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              />
              <span className="min-w-0 text-sm font-medium">{entry.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-labelledby="score-heading"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p
              id="score-heading"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Response score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasResult ? `${result.percent}%` : DASH}
            </p>
            <p className="mt-1 text-sm font-semibold">{hasResult ? result.bandLabel : DASH}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasResult ? result.bandHint : "Tick a data category above to build the plan."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the employer breach response plan"
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
          aria-label={hasResult ? `Response score ${result.percent} out of 100` : "Score unavailable"}
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
            ["Breach severity", hasSeverity ? severity.tierLabel : DASH],
            [
              "Severity points",
              hasSeverity ? `${NUM.format(severity.points)} / ${NUM.format(severity.maxPoints)}` : DASH,
            ],
            ["Steps that apply to you", hasResult ? NUM.format(result.total) : DASH],
            ["Steps completed", hasResult ? `${result.completed} of ${result.total}` : DASH],
            [
              "Critical steps still open",
              hasResult ? `${result.missingCritical.length} of ${result.criticalTotal}` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasSeverity ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">{severity.tierHint}</p>
        ) : null}

        {hasResult && result.capped ? (
          <p
            role="status"
            aria-live="polite"
            className="mt-4 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]"
          >
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Held at {CRITICAL_CAP_PERCENT}% while a critical step is open. An unverified payroll
              account or a reused password is a direct loss path, not a loose end.
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
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Mistakes worth avoiding</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            Clicking the enrolment link in the breach email. Breach notices are public, so a fake one
            is trivial to send &mdash; go to the vendor site directly.
          </li>
          <li>
            Treating &ldquo;hashed passwords only&rdquo; as safe. Offline cracking is routine, and the
            notice usually arrives weeks after the theft.
          </li>
          <li>
            Assuming the monitoring offer covers your family. Dependants in the dataset need their own
            checks.
          </li>
          <li>
            Signing a compensation or settlement form without reading what claims it releases.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not legal advice. Nothing you tick leaves this browser tab, and the
        page never asks for employer names, account numbers or identifiers. Employment and data
        protection rights vary by country &mdash; consult a lawyer or your data protection regulator
        about claims and deadlines.
      </p>
    </main>
  );
}

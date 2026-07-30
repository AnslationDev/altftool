"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Smartphone, TriangleAlert } from "lucide-react";

import {
  CRITICAL_CAP_PERCENT,
  DEFAULT_AGE,
  DEFAULT_DONE,
  GROUPS,
  ageBandFor,
  formatMinutes,
  ratingPlanFor,
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

export default function ToolHome() {
  const [age, setAge] = useState(String(DEFAULT_AGE));
  const [done, setDone] = useState(() => DEFAULT_DONE.slice());
  const [copied, setCopied] = useState(false);

  const numericAge = age.trim() === "" ? Number.NaN : Number(age);
  const result = useMemo(() => scoreSetup({ age: numericAge, doneIds: done }), [numericAge, done]);
  const plan = useMemo(() => ratingPlanFor(numericAge), [numericAge]);
  const band = useMemo(() => ageBandFor(numericAge), [numericAge]);

  const toggleStep = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setCopied(false);
  };

  const reset = () => {
    setAge(String(DEFAULT_AGE));
    setDone(DEFAULT_DONE.slice());
    setCopied(false);
  };

  const hasResult = !result.error;
  const hasPlan = !plan.error;

  const summary = useMemo(() => {
    if (!hasResult) return "";
    const lines = [
      "iPhone Kids Device Setup Guide",
      `Child's age: ${result.age}`,
      `Setup score: ${result.percent}% — ${result.bandLabel}`,
      `Steps done: ${result.completed} of ${result.total}`,
      `Time still needed: ${formatMinutes(result.remainingMinutes)}`,
    ];
    if (hasPlan) {
      lines.push(
        "",
        "Recommended Screen Time values:",
        `- App Store rating cap: ${plan.appRating}`,
        `- Web Content: ${plan.webFilter}`,
        `- Music, Podcasts, News: ${plan.explicitMedia}`,
        `- Ask to Buy: ${plan.askToBuy ? "On" : "Optional"}`,
        `- Communication Limits: ${plan.communicationLimits}`
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
          <Smartphone className="h-4 w-4" aria-hidden="true" />
          Kids device safety
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          iPhone Kids Device Setup Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the age and you get the actual Screen Time values to pick &mdash; the App Store rating
          tier, which web filter mode, how tight Communication Limits should be &mdash; plus the setup
          steps that apply at that age, in the order they should be done.
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
        </div>

        {plan.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {plan.error}
          </p>
        ) : (
          <div className="mt-4 rounded-md border border-[var(--border)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Screen Time values for this age
            </p>
            <dl className="mt-2 divide-y divide-[var(--border)] text-sm">
              {[
                ["App Store rating cap", plan.appRating],
                ["Web Content", plan.webFilter],
                ["Music, Podcasts, News, Fitness", plan.explicitMedia],
                ["Ask to Buy", plan.askToBuy ? "On" : "Optional"],
                ["Communication Limits", plan.communicationLimits],
                ["Communication Safety", plan.communicationSafety ? "On" : "Off"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">{plan.webFilterNote}</p>
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
              aria-label="Copy the iPhone setup plan"
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
            ["Total setup time at this age", hasResult ? formatMinutes(result.totalMinutes) : DASH],
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
              Held at {CRITICAL_CAP_PERCENT}% while a critical step is open. Restrictions without a
              separate Screen Time passcode are decoration.
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
            Using the same code for the device and for Screen Time, which hands over every restriction
            the first time the child watches you unlock the phone.
          </li>
          <li>
            Leaving Block at End of Limit off, so a limit offers Ignore For Today instead of asking for
            the passcode.
          </li>
          <li>
            Creating the account with a false birth year to skip the setup. That account can never be
            supervised and the mistake is not reversible.
          </li>
          <li>
            Forgetting to re-check Content &amp; Privacy Restrictions after a restore or a device swap,
            where it frequently comes back off.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Setting names and locations change between iOS versions, so follow the
        description rather than hunting for exact wording, and check Apple&rsquo;s own support pages if
        something has moved. Nothing you tick leaves this browser tab and the page never asks for an
        Apple Account, a passcode or a child&rsquo;s name.
      </p>
    </main>
  );
}

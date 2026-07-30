"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, RotateCcw } from "lucide-react";

import {
  MAX_BUDGET_MINUTES,
  MIN_BUDGET_MINUTES,
  SURFACES,
  formatOptOutPlan,
  planOptOuts,
} from "../lib";

const DASH = "—";

const DEFAULT_SURFACES = ["browser", "ios", "google", "email"];
const DEFAULT_BUDGET = "30";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const DURABILITY_TONE = {
  permanent: "success",
  "cookie-bound": "warning",
  recurring: "warning",
};

function Badge({ tone, children }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
      style={{ backgroundColor: `var(--${tone}-soft)`, color: `var(--${tone})` }}
    >
      {children}
    </span>
  );
}

export default function ToolHome() {
  const [surfaces, setSurfaces] = useState(DEFAULT_SURFACES);
  const [budget, setBudget] = useState(DEFAULT_BUDGET);
  const [done, setDone] = useState([]);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () => planOptOuts({ surfaces, budgetMinutes: Number(budget), done }),
    [surfaces, budget, done],
  );

  const hasError = Boolean(plan.error);
  const summary = useMemo(() => (hasError ? "" : formatOptOutPlan(plan)), [plan, hasError]);

  const toggleSurface = (id) => (event) => {
    const on = event.target.checked;
    setSurfaces((current) =>
      on ? [...new Set([...current, id])] : current.filter((item) => item !== id),
    );
  };

  const toggleDone = (id) => () => {
    setDone((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

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
    setSurfaces(DEFAULT_SURFACES);
    setBudget(DEFAULT_BUDGET);
    setDone([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Tracking literacy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Tracking Opt-Out Priority Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every opt-out scored by tracking removed per minute spent, filtered to the devices and
          accounts you actually have, and packed into the time you can give it today.
        </p>
      </header>

      <section className={CARD}>
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            What do you use?
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {SURFACES.map((item) => (
              <label
                key={item.id}
                htmlFor={`too-${item.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <input
                  id={`too-${item.id}`}
                  type="checkbox"
                  checked={surfaces.includes(item.id)}
                  onChange={toggleSurface(item.id)}
                  className="h-4 w-4 shrink-0 accent-[var(--primary)]"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 sm:max-w-xs">
          <label className={LABEL_CLASS} htmlFor="too-budget">
            Minutes you have right now
          </label>
          <input
            id="too-budget"
            className={`mt-2 ${INPUT_CLASS}`}
            type="number"
            inputMode="numeric"
            min={MIN_BUDGET_MINUTES}
            max={MAX_BUDGET_MINUTES}
            step="5"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[10, 20, 30, 60, 120].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setBudget(String(value))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {value} min
            </button>
          ))}
        </div>
      </section>

      {hasError ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {plan.error}
          </p>
          <section className={`mt-6 ${CARD}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Tracking coverage after this sitting
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Actions today", "Minutes used", "Minutes to finish everything"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="font-semibold">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className={`mt-6 ${CARD}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Tracking coverage after this sitting
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {plan.coverageAfter}%
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Up from {plan.coverageNow}% — {plan.today.length} action
                  {plan.today.length === 1 ? "" : "s"} in {plan.minutesPlanned} minutes
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy the opt-out plan"
                  className={GHOST_BTN}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied!" : "Copy plan"}
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

            <div className="mt-5">
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`Coverage rises from ${plan.coverageNow} percent to ${plan.coverageAfter} percent`}
              >
                <span
                  className="block h-full bg-[var(--primary)]"
                  style={{ width: `${plan.coverageAfter}%` }}
                />
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Opt-outs that apply to you", `${plan.applicableCount}`],
                ["Minutes used of your budget", `${plan.minutesPlanned} of ${plan.budget}`],
                ["Minutes left spare", `${plan.minutesSpare}`],
                ["Minutes to finish everything", `${plan.minutesForEverything}`],
                ["Coverage gain today", `+${plan.coverageGain} percentage points`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">Do these now, in this order</h2>
            {plan.today.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Nothing fits in that budget. Add a few more minutes, or untick something you have
                already done.
              </p>
            ) : (
              <ol className="mt-3 grid gap-3">
                {plan.today.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)]">
                        {item.order}
                      </span>
                      <h3 className="text-sm font-semibold">{item.label}</h3>
                      <Badge tone={DURABILITY_TONE[item.durability]}>{item.durabilityLabel}</Badge>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {item.minutes} min
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6">{item.how}</p>
                    <p className="mt-1.5 text-sm leading-6 text-[var(--muted-foreground)]">
                      {item.why}
                    </p>
                    <label
                      htmlFor={`too-done-${item.id}`}
                      className="mt-3 inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold"
                    >
                      <input
                        id={`too-done-${item.id}`}
                        type="checkbox"
                        checked={item.done}
                        onChange={toggleDone(item.id)}
                        className="h-4 w-4 accent-[var(--primary)]"
                      />
                      Mark as done
                    </label>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {plan.later.length > 0 && (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">Next sitting</h2>
              <ul className="mt-3 divide-y divide-[var(--border)] text-sm">
                {plan.later.map((item) => (
                  <li key={item.id} className="py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">{item.label}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {item.minutes} min · {item.reason}
                      </span>
                    </div>
                    <label
                      htmlFor={`too-later-${item.id}`}
                      className="mt-2 inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-[var(--muted-foreground)]"
                    >
                      <input
                        id={`too-later-${item.id}`}
                        type="checkbox"
                        checked={item.done}
                        onChange={toggleDone(item.id)}
                        className="h-4 w-4 accent-[var(--primary)]"
                      />
                      Mark as done
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {plan.notWorthIt.length > 0 && (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">Not worth your time</h2>
              <ul className="mt-3 grid gap-3 text-sm">
                {plan.notWorthIt.map((item) => (
                  <li key={item.id}>
                    <span className="font-semibold">{item.label}</span>
                    <p className="mt-1 leading-6 text-[var(--muted-foreground)]">{item.why}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {plan.recurring.length > 0 && (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">Put these in your calendar</h2>
              <ul className="mt-3 divide-y divide-[var(--border)] text-sm">
                {plan.recurring.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-4 py-2.5">
                    <span>{item.label}</span>
                    <span className="text-right font-semibold text-[var(--muted-foreground)]">
                      every {item.repeatDays} days
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Menu paths change between releases, and the legal weight of an opt-out
        signal depends on where you live — check your own data protection regulator's guidance if
        you need to rely on it.
      </p>
    </main>
  );
}

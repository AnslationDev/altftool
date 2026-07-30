"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Phone, RotateCcw, ShieldAlert } from "lucide-react";
import {
  AREAS,
  CHECKLIST,
  CYBER_HELPLINE,
  UPI_DAILY_CAP_INR,
  ZERO_LIABILITY_WORKING_DAYS,
  assessKit,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const DASH = "—";
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-lg text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-base font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-base font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-base font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_DONE = ["otp-never", "phone-lock"];
const DEFAULT_LIMIT = "25000";

export default function ToolHome() {
  const [done, setDone] = useState(DEFAULT_DONE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => assessKit({ doneIds: done, dailyLimit: limit.trim() === "" ? NaN : Number(limit) }),
    [done, limit],
  );
  const ok = !result.error;

  const toggle = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Senior Citizen Privacy Starter Kit",
      `Protection score: ${Math.round(result.percent)}% (${result.band.label})`,
      `Steps done: ${result.completed} of ${result.total}`,
      `Important steps still open: ${result.openCritical.length}`,
      `Daily transfer limit: ${money(result.dailyLimit)}`,
      `Money still at risk in one day: ${money(result.residualDailyExposure)}`,
      "",
      "Still to do:",
      ...result.remaining.map((item) => `- ${item.title}`),
      "",
      `If money is lost, call ${CYBER_HELPLINE} the same day.`,
    ].join("\n");
  }, [ok, result]);

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
    setDone(DEFAULT_DONE);
    setLimit(DEFAULT_LIMIT);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-base text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Phone className="h-4 w-4" aria-hidden="true" />
          Scam-call safety
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Senior Citizen Privacy Starter Kit
        </h1>
        <p className="mt-2 text-lg leading-8 text-[var(--muted-foreground)]">
          Sixteen plain steps that stop the most common phone and banking scams. Tick what is
          already done, enter the daily transfer limit set on the bank or UPI app, and see how much
          money a single bad call could still move.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="senior-limit">
              Daily transfer limit (rupees)
            </label>
            <input
              id="senior-limit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={UPI_DAILY_CAP_INR}
              step="1000"
              value={limit}
              onChange={(event) => {
                setLimit(event.target.value);
                setCopied(false);
              }}
            />
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              The general UPI ceiling is {money(UPI_DAILY_CAP_INR)} a day. A lower limit in your
              banking app is safer and can be raised for a day when you need it.
            </p>
          </div>
          <div className="flex flex-wrap content-start gap-2 sm:pt-8">
            {[5000, 10000, 25000, 50000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setLimit(String(preset));
                  setCopied(false);
                }}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-base font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {money(preset)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {!ok && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-base font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Protection score
            </p>
            <p className="mt-1 text-5xl font-semibold text-[var(--primary)]">
              {ok ? `${Math.round(result.percent)}%` : DASH}
            </p>
            <p className="mt-1 text-base text-[var(--muted-foreground)]">
              {ok
                ? `${result.band.label} — ${result.band.note}`
                : "Correct the amount above to see the score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the protection score and remaining steps"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-5 w-5" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy list"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok && (
          <div className="mt-4">
            <div
              className="h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Protection score ${Math.round(result.percent)} percent`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, result.percent))}%` }}
              />
            </div>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-base">
          {[
            ["Steps completed", ok ? `${result.completed} of ${result.total}` : DASH],
            ["Important steps still open", ok ? `${result.openCritical.length}` : DASH],
            ["Daily transfer limit", ok ? money(result.dailyLimit) : DASH],
            ["Money still at risk in one day", ok ? money(result.residualDailyExposure) : DASH],
            ["Next step to do", ok ? (result.nextStep ? result.nextStep.title : "All done") : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-3">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.shouldLowerLimit && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-base font-medium text-[var(--danger)]">
            While {result.openCritical.length} important step
            {result.openCritical.length === 1 ? " is" : "s are"} still open, keep the daily limit at
            about {money(result.suggestedLimit)} or lower.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-xl font-semibold">The sixteen steps</h2>
        {AREAS.map((area) => {
          const areaStat = ok ? result.areaBreakdown.find((entry) => entry.area === area) : null;
          return (
            <div key={area} className="mt-5 first:mt-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {area}
                </h3>
                <span className="text-sm text-[var(--muted-foreground)]">
                  {areaStat ? `${areaStat.done}/${areaStat.total} done` : DASH}
                </span>
              </div>
              <ul className="mt-2 space-y-2">
                {CHECKLIST.filter((item) => item.area === area).map((item) => {
                  const checked = done.includes(item.id);
                  return (
                    <li key={item.id} className="rounded-lg border border-[var(--border)] p-3">
                      <div className="flex items-start gap-3">
                        <input
                          id={`snr-${item.id}`}
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(item.id)}
                          className="mt-1 h-6 w-6 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                        />
                        <div className="min-w-0">
                          <label
                            htmlFor={`snr-${item.id}`}
                            className="block cursor-pointer text-lg font-semibold leading-7"
                          >
                            {item.title}
                          </label>
                          <p className="mt-1 text-base leading-7 text-[var(--muted-foreground)]">
                            {item.action}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                            Why: {item.why}
                          </p>
                          {item.critical && (
                            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-sm font-semibold text-[var(--danger)]">
                              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                              Most important
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      <p className="mt-6 text-sm leading-6 text-[var(--muted-foreground)]">
        Informational guidance only, not legal or financial advice. If money has already left the
        account, call {CYBER_HELPLINE} and your bank the same day — reporting an unauthorised
        electronic transaction within {ZERO_LIABILITY_WORKING_DAYS} working days is what preserves
        zero customer liability under the Reserve Bank of India's rules. Confirm current limits and
        procedures with your own bank.
      </p>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, UtensilsCrossed } from "lucide-react";

import {
  ACTIVITIES,
  CENTRAL_TRIGGERS,
  PETTY_TURNOVER_LIMIT,
  STATE_TURNOVER_LIMIT,
  selectFssaiLicence,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DEFAULTS = {
  activity: "caterer",
  annualTurnover: "5000000",
  capacity: "0",
  triggers: [],
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [activity, setActivity] = useState(DEFAULTS.activity);
  const [annualTurnover, setAnnualTurnover] = useState(DEFAULTS.annualTurnover);
  const [capacity, setCapacity] = useState(DEFAULTS.capacity);
  const [triggers, setTriggers] = useState(DEFAULTS.triggers);
  const [copied, setCopied] = useState(false);

  const activityMeta = ACTIVITIES.find((item) => item.id === activity);

  const toggleTrigger = (id) => {
    setTriggers((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const result = useMemo(() => {
    const turnover = toNumber(annualTurnover);
    const cap = toNumber(capacity);
    if (Number.isNaN(turnover)) {
      return { error: "Enter the annual turnover as a number." };
    }
    return selectFssaiLicence({
      activity,
      annualTurnover: turnover,
      capacity: Number.isNaN(cap) ? 0 : cap,
      triggers,
    });
  }, [activity, annualTurnover, capacity, triggers]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "FSSAI licence category",
      `Activity: ${result.activityLabel}`,
      `You need: ${result.headline} (${result.form})`,
      `Apply to: ${result.authority}`,
      `Government fee: ${
        result.annualFee.min === result.annualFee.max
          ? `${money(result.annualFee.min)} a year`
          : `${money(result.annualFee.min)} to ${money(result.annualFee.max)} a year`
      }`,
      `Validity: ${result.validityYears.min} to ${result.validityYears.max} years`,
      "",
      "Why:",
      ...result.reasons.map((reason) => `- ${reason}`),
    ].join("\n");
  }, [hasError, result]);

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
    setActivity(DEFAULTS.activity);
    setAnnualTurnover(DEFAULTS.annualTurnover);
    setCapacity(DEFAULTS.capacity);
    setTriggers(DEFAULTS.triggers);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
          Schedule 1, FSS Licensing Regulations 2011
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          FSSAI Licence Category Selector
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turnover up to Rs 12 lakh registers, up to Rs 20 crore takes a state licence, above that a
          central one — but capacity and a handful of Schedule 1 categories override the turnover
          test entirely.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fss-activity">
              What kind of food business is it
            </label>
            <select
              id="fss-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={activity}
              onChange={(event) => setActivity(event.target.value)}
            >
              {ACTIVITIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {activityMeta ? (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                {activityMeta.capacityNote}
              </p>
            ) : null}
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="fss-turnover">
              Annual turnover (INR)
            </label>
            <input
              id="fss-turnover"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100000"
              value={annualTurnover}
              onChange={(event) => setAnnualTurnover(event.target.value)}
            />
          </div>

          {activityMeta && activityMeta.capacityUnit ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="fss-capacity">
                Capacity — {activityMeta.capacityUnit}
              </label>
              <input
                id="fss-capacity"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
              />
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Leave at 0 if capacity is not relevant to your unit.
              </p>
            </div>
          ) : null}
        </div>

        <fieldset className="mt-5 border-t border-[var(--border)] pt-5">
          <legend className={LABEL_CLASS}>Does any of this apply?</legend>
          <div className="mt-3 grid gap-2">
            {CENTRAL_TRIGGERS.map((trigger) => (
              <label
                key={trigger.id}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm transition hover:border-[var(--primary)] focus-within:ring-[3px] focus-within:ring-[var(--primary)]/25"
                htmlFor={`fss-${trigger.id}`}
              >
                <input
                  id={`fss-${trigger.id}`}
                  type="checkbox"
                  className={`mt-0.5 ${CHECKBOX_CLASS}`}
                  checked={triggers.includes(trigger.id)}
                  onChange={() => toggleTrigger(trigger.id)}
                />
                <span className="flex-1">{trigger.label}</span>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              You need
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? "—" : result.headline}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "—" : `Applied for in ${result.form} on the FoSCoS portal`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the FSSAI licence result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Apply to", hasError ? "—" : result.authority],
            [
              "Government fee",
              hasError
                ? "—"
                : result.annualFee.min === result.annualFee.max
                  ? `${money(result.annualFee.min)} a year`
                  : `${money(result.annualFee.min)} to ${money(result.annualFee.max)} a year`,
            ],
            [
              "Validity you can choose",
              hasError
                ? "—"
                : `${result.validityYears.min} to ${result.validityYears.max} years`,
            ],
            [
              "Late renewal fee",
              hasError ? "—" : `${money(result.lateRenewalFeePerDay)} per day after expiry`,
            ],
            ["Petty operator limit", money(PETTY_TURNOVER_LIMIT)],
            [
              "Central threshold for this activity",
              hasError ? "—" : money(result.thresholds.centralTurnover),
            ],
            ["Default state licence ceiling", money(STATE_TURNOVER_LIMIT)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Why this category</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
              {result.reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]"
                    aria-hidden="true"
                  />
                  {reason}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Documents to keep ready</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {result.documents.map((document) => (
                <li key={document} className="flex items-start gap-2">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]"
                    aria-hidden="true"
                  />
                  {document}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Schedule 1 is amended from time to time and states
        publish their own document checklists, so confirm the category on the FoSCoS portal before
        applying. A separate licence is needed for each premises, and the 14-digit number must be
        displayed at the premises and printed on every package label.
      </p>
    </main>
  );
}

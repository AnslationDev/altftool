"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Syringe } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { PRESETS, computeBoosterEligibility, presetById, toISODate } from "../lib";

const DEFAULTS = {
  lastDoseDate: "2026-01-01",
  infectionDate: "",
  preset: "cdc",
  doseDays: "56",
  infectionDays: "90",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const LONG_DATE = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const SHORT_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const MONTHS = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

export default function ToolHome() {
  const [lastDoseDate, setLastDoseDate] = useState(DEFAULTS.lastDoseDate);
  const [infectionDate, setInfectionDate] = useState(DEFAULTS.infectionDate);
  const [preset, setPreset] = useState(DEFAULTS.preset);
  const [doseDays, setDoseDays] = useState(DEFAULTS.doseDays);
  const [infectionDays, setInfectionDays] = useState(DEFAULTS.infectionDays);
  const [asOfDate, setAsOfDate] = useState("");
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  useEffect(() => {
    setAsOfDate(toISODate(Date.now()));
  }, []);

  const applyPreset = (id) => {
    setPreset(id);
    const chosen = presetById(id);
    if (chosen) {
      setDoseDays(String(chosen.doseDays));
      setInfectionDays(String(chosen.infectionDays));
    }
  };

  const result = useMemo(
    () =>
      computeBoosterEligibility({
        lastDoseDate,
        infectionDate,
        doseIntervalDays: doseDays,
        infectionDeferralDays: infectionDays,
        asOfDate,
      }),
    [lastDoseDate, infectionDate, doseDays, infectionDays, asOfDate],
  );

  const hasError = Boolean(result.error);
  const activePreset = presetById(preset);

  const summary = (() => {
    if (hasError) return "";
    const lines = [
      "COVID Booster Interval Planner",
      `Last dose: ${SHORT_DATE.format(result.lastDose)}`,
      result.infection ? `Infection: ${SHORT_DATE.format(result.infection)}` : "No recent infection recorded",
      `Rule: ${result.doseIntervalDays} days since the last dose, ${result.infectionDeferralDays} days after infection`,
      `Earliest eligible date: ${LONG_DATE.format(result.earliestDate)} (set by your ${result.drivenBy})`,
    ];
    if (result.status) {
      lines.push(
        result.status.eligibleNow
          ? `Eligible now — ${result.status.daysSinceEligible} days past the earliest date.`
          : `${result.status.daysUntil} days to wait.`,
      );
    }
    return lines.join("\n");
  })();

  const copyResult = () => {
    if (!summary) return;
    copy("result", summary, { label: "booster eligibility result" });
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset every field? This will replace your dates and intervals with the default example values and cannot be undone.",
      )
    ) {
      return;
    }
    setLastDoseDate(DEFAULTS.lastDoseDate);
    setInfectionDate(DEFAULTS.infectionDate);
    setPreset(DEFAULTS.preset);
    setDoseDays(DEFAULTS.doseDays);
    setInfectionDays(DEFAULTS.infectionDays);
    setAsOfDate(toISODate(Date.now()));
    resetCopyState();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Syringe className="h-4 w-4" aria-hidden="true" />
          Immunisation
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          COVID Booster Interval Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Eligibility is whichever comes later: the minimum gap since your last dose, or the deferral
          period after a recent infection. Pick the rule your country uses — or set your own
          intervals — and this gives the earliest date and the countdown.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cb-lastdose">
              Date of your last COVID vaccine dose
            </label>
            <input
              id="cb-lastdose"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={lastDoseDate}
              max={asOfDate || undefined}
              onChange={(event) => setLastDoseDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cb-infection">
              Date of a recent infection (optional)
            </label>
            <input
              id="cb-infection"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={infectionDate}
              max={asOfDate || undefined}
              onChange={(event) => setInfectionDate(event.target.value)}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Use symptom onset, or the positive test date if you had no symptoms.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cb-preset">
              Interval rule
            </label>
            <select
              id="cb-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={preset}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {PRESETS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            {activePreset && (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">{activePreset.note}</p>
            )}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cb-dosedays">
              Minimum days since the last dose
            </label>
            <input
              id="cb-dosedays"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="730"
              step="1"
              value={doseDays}
              onChange={(event) => setDoseDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cb-infectiondays">
              Days to defer after infection
            </label>
            <input
              id="cb-infectiondays"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="730"
              step="1"
              value={infectionDays}
              onChange={(event) => setInfectionDays(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cb-asof">
              Count down from
            </label>
            <input
              id="cb-asof"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={asOfDate}
              onChange={(event) => setAsOfDate(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Earliest eligible date
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : LONG_DATE.format(result.earliestDate)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see your date."
                : `Set by your ${result.drivenBy}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={
                isCopied("result")
                  ? "Copied the booster eligibility result to clipboard"
                  : "Copy the booster eligibility result"
              }
              className={GHOST_BTN}
              disabled={hasError}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </div>

        {!hasError && result.status && (
          <p
            className={`mt-4 text-sm font-semibold ${result.status.eligibleNow ? "text-[var(--success)]" : "text-[var(--foreground)]"}`}
          >
            {result.status.eligibleNow
              ? `Eligible now — that date passed ${result.status.daysSinceEligible} days ago.`
              : `${result.status.daysUntil} days to wait from the date you selected.`}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite" aria-atomic="true">
          {[
            [
              "Eligible by the dose interval",
              hasError ? DASH : SHORT_DATE.format(result.doseEligibleDate),
            ],
            [
              "Eligible by the infection deferral",
              hasError || !result.infectionEligibleDate
                ? DASH
                : SHORT_DATE.format(result.infectionEligibleDate),
            ],
            [
              "Dose interval applied",
              hasError
                ? DASH
                : `${result.doseIntervalDays} days (about ${MONTHS.format(result.doseIntervalMonths)} months)`,
            ],
            [
              "Infection deferral applied",
              hasError
                ? DASH
                : `${result.infectionDeferralDays} days (about ${MONTHS.format(result.infectionDeferralMonths)} months)`,
            ],
            [
              "Days since your last dose",
              hasError || !result.status ? DASH : String(result.status.daysSinceDose),
            ],
            [
              "Days since the infection",
              hasError || !result.status || result.status.daysSinceInfection === null
                ? DASH
                : String(result.status.daysSinceInfection),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not a substitute for medical advice. Booster eligibility rules differ
        by country, age group, pregnancy status and immune status, and they are revised regularly —
        check your national health service or your doctor before booking, especially if you are
        immunocompromised or have had a reaction to a previous dose.
      </p>
    </main>
  );
}

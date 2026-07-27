"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

import {
  DEFAULT_REMINDER_LEAD_DAYS,
  VALIDITY_REFERENCES,
  buildRefillSchedule,
  expiryFromRule,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DATE = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DASH = "—";
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const showDate = (isoDate) => (isoDate ? DATE.format(new Date(`${isoDate}T00:00:00Z`)) : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  quantityDispensed: "30",
  unitsPerDay: "1",
  firstFillDate: "2026-08-01",
  repeats: "3",
  reminderLeadDays: String(DEFAULT_REMINDER_LEAD_DAYS),
  expiryDate: "",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [quantityDispensed, setQuantityDispensed] = useState(DEFAULTS.quantityDispensed);
  const [unitsPerDay, setUnitsPerDay] = useState(DEFAULTS.unitsPerDay);
  const [firstFillDate, setFirstFillDate] = useState(DEFAULTS.firstFillDate);
  const [repeats, setRepeats] = useState(DEFAULTS.repeats);
  const [reminderLeadDays, setReminderLeadDays] = useState(DEFAULTS.reminderLeadDays);
  const [expiryDate, setExpiryDate] = useState(DEFAULTS.expiryDate);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildRefillSchedule({
        quantityDispensed: toNumber(quantityDispensed),
        unitsPerDay: toNumber(unitsPerDay),
        firstFillDate,
        repeats: toNumber(repeats),
        reminderLeadDays: toNumber(reminderLeadDays),
        expiryDate,
      }),
    [quantityDispensed, unitsPerDay, firstFillDate, repeats, reminderLeadDays, expiryDate],
  );

  const ok = !result.error;

  const applyRule = (ruleId) => {
    if (!ruleId) return;
    const suggestion = expiryFromRule(firstFillDate, ruleId);
    if (!suggestion.error) setExpiryDate(suggestion.expiryIso);
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Prescription refill schedule",
      `${num(result.totalUnits)} units in total: ${result.totalFills} fill${result.totalFills === 1 ? "" : "s"} of ${num(toNumber(quantityDispensed))}`,
      `Each fill lasts ${result.daysSupply} days at ${num(toNumber(unitsPerDay))} a day`,
      `Cover runs to ${showDate(result.coveredUntilIso)}`,
      "",
      ...result.fills.map(
        (fill) =>
          `Fill ${fill.number}: collect ${showDate(fill.fillIso)}, covers to ${showDate(fill.coversUntilIso)}${fill.reminderIso ? `, remind ${showDate(fill.reminderIso)}` : ""}${fill.afterExpiry ? " (after expiry)" : ""}`,
      ),
    ].join("\n");
  }, [ok, result, quantityDispensed, unitsPerDay]);

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
    setQuantityDispensed(DEFAULTS.quantityDispensed);
    setUnitsPerDay(DEFAULTS.unitsPerDay);
    setFirstFillDate(DEFAULTS.firstFillDate);
    setRepeats(DEFAULTS.repeats);
    setReminderLeadDays(DEFAULTS.reminderLeadDays);
    setExpiryDate(DEFAULTS.expiryDate);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Medication timing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Prescription Refill Reminder Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Read the quantity and dose off the dispensing label, add how many repeats were authorised,
          and get every collection date with a reminder date in front of it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-qty">
              Quantity dispensed each fill
            </label>
            <input
              id="rr-qty"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={quantityDispensed}
              onChange={(event) => setQuantityDispensed(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Tablets, capsules or ml — whatever the label counts in
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-perday">
              Amount taken per day
            </label>
            <input
              id="rr-perday"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.25"
              step="0.25"
              value={unitsPerDay}
              onChange={(event) => setUnitsPerDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-first">
              First fill date
            </label>
            <input
              id="rr-first"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={firstFillDate}
              onChange={(event) => setFirstFillDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-repeats">
              Repeats authorised after the first fill
            </label>
            <input
              id="rr-repeats"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={repeats}
              onChange={(event) => setRepeats(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-lead">
              Remind me this many days early
            </label>
            <input
              id="rr-lead"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={reminderLeadDays}
              onChange={(event) => setReminderLeadDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-expiry">
              Prescription expires on (optional)
            </label>
            <input
              id="rr-expiry"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={expiryDate}
              onChange={(event) => setExpiryDate(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rr-rule">
              Or fill the expiry from a common validity rule
            </label>
            <select
              id="rr-rule"
              className={`mt-2 ${INPUT_CLASS}`}
              value=""
              onChange={(event) => applyRule(event.target.value)}
            >
              <option value="">Choose a rule to set the date</option>
              {VALIDITY_REFERENCES.map((rule) => (
                <option key={rule.id} value={rule.id}>
                  {rule.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Counted from the first fill date above; check the rule that applies where you live
            </p>
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Each fill lasts
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${result.daysSupply} days` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.totalFills} fill${result.totalFills === 1 ? "" : "s"} cover ${result.totalDaysCovered} days, to ${showDate(result.coveredUntilIso)}`
                : "Correct the label details above to build the schedule."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the refill schedule"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy schedule"}
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
          </div>
        </div>

        {ok && result.blockedFills > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            {result.blockedFills} fill{result.blockedFills === 1 ? "" : "s"} fall after the expiry
            date of {showDate(result.expiryIso)}, starting {showDate(result.firstBlockedIso)}. Book a
            review before then so a fresh prescription is ready.
          </p>
        ) : null}

        {ok && result.hasRemainder ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            {num(result.remainderUnits)} unit{result.remainderUnits === 1 ? "" : "s"} are left over
            after {result.daysSupply} full days — not a whole day of cover, so the schedule does not
            count them.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Days of supply per fill", ok ? String(result.daysSupply) : DASH],
            ["Fills in total", ok ? `${result.totalFills} (${result.repeats} repeats)` : DASH],
            ["Total quantity across all fills", ok ? num(result.totalUnits) : DASH],
            ["Total days covered", ok ? String(result.totalDaysCovered) : DASH],
            ["First fill", ok ? showDate(result.firstFillIso) : DASH],
            ["Last fill", ok ? showDate(result.lastFillIso) : DASH],
            ["Cover runs out after", ok ? showDate(result.coveredUntilIso) : DASH],
            ["Reminder lead time", ok ? `${result.reminderLeadDays} days` : DASH],
            ["Prescription expiry", ok && result.expiryIso ? showDate(result.expiryIso) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">Refill dates</h2>
        {ok ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Fill
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Remind on
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Collect on
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Covers until
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {result.fills.map((fill) => (
                  <tr key={fill.number}>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {fill.number}
                      {fill.isFirst ? " (original)" : ""}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {fill.reminderIso ? showDate(fill.reminderIso) : DASH}
                    </td>
                    <td
                      className={`py-2 pr-3 font-medium whitespace-nowrap ${
                        fill.afterExpiry ? "text-[var(--warning)]" : ""
                      }`}
                    >
                      {showDate(fill.fillIso)}
                      {fill.afterExpiry ? " — after expiry" : ""}
                    </td>
                    <td className="py-2 whitespace-nowrap">{showDate(fill.coversUntilIso)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A planning aid, not medical or legal advice. Prescription validity, how early a repeat can be
        collected and whether a review is required all vary by country, by insurer and by medicine —
        controlled drugs in particular have far tighter rules. Confirm the dates with your pharmacy
        and speak to the prescriber before the last fill runs out.
      </p>
    </main>
  );
}

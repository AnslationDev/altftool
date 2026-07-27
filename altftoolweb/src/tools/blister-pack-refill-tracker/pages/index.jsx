"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Package, RotateCcw } from "lucide-react";

import {
  CRITICAL_DAYS,
  DEFAULT_BUFFER_DAYS,
  DEFAULT_LEAD_DAYS,
  trackRefill,
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
  fullStrips: "2",
  tabletsPerStrip: "10",
  looseTablets: "0",
  tabletsPerDose: "1",
  dosesPerDay: "2",
  countDate: "2026-07-26",
  leadDays: String(DEFAULT_LEAD_DAYS),
  bufferDays: String(DEFAULT_BUFFER_DAYS),
  coverDays: "30",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

const STATUS_TEXT = {
  ok: "Supply is comfortable",
  low: "Supply is getting low",
  "order-now": "Order today",
  out: "Out of tablets",
};
const STATUS_TONE = {
  ok: "bg-[var(--success-soft)] text-[var(--success)]",
  low: "bg-[var(--warning-soft)] text-[var(--warning)]",
  "order-now": "bg-[var(--danger-soft)] text-[var(--danger)]",
  out: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

export default function ToolHome() {
  const [fullStrips, setFullStrips] = useState(DEFAULTS.fullStrips);
  const [tabletsPerStrip, setTabletsPerStrip] = useState(DEFAULTS.tabletsPerStrip);
  const [looseTablets, setLooseTablets] = useState(DEFAULTS.looseTablets);
  const [tabletsPerDose, setTabletsPerDose] = useState(DEFAULTS.tabletsPerDose);
  const [dosesPerDay, setDosesPerDay] = useState(DEFAULTS.dosesPerDay);
  const [countDate, setCountDate] = useState(DEFAULTS.countDate);
  const [leadDays, setLeadDays] = useState(DEFAULTS.leadDays);
  const [bufferDays, setBufferDays] = useState(DEFAULTS.bufferDays);
  const [coverDays, setCoverDays] = useState(DEFAULTS.coverDays);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      trackRefill({
        fullStrips: toNumber(fullStrips),
        tabletsPerStrip: toNumber(tabletsPerStrip),
        looseTablets: toNumber(looseTablets),
        tabletsPerDose: toNumber(tabletsPerDose),
        dosesPerDay: toNumber(dosesPerDay),
        countDate,
        leadDays: toNumber(leadDays),
        bufferDays: toNumber(bufferDays),
        coverDays: toNumber(coverDays),
      }),
    [
      fullStrips,
      tabletsPerStrip,
      looseTablets,
      tabletsPerDose,
      dosesPerDay,
      countDate,
      leadDays,
      bufferDays,
      coverDays,
    ],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Blister pack refill tracker",
      `Counted on ${showDate(result.countDateIso)}: ${num(result.tabletsOnHand)} tablets`,
      `Using ${num(result.tabletsPerDay)} tablets a day`,
      `Covers ${result.fullDays} full days, last covered day ${showDate(result.lastCoveredIso)}`,
      `Runs out on ${showDate(result.runOutIso)}`,
      `Reorder by ${showDate(result.reorderIso)} (${result.leadDays} days lead + ${result.bufferDays} days buffer)`,
      `Next order: ${result.packsToOrder} pack(s) for ${result.coverDays} days of cover`,
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
    setFullStrips(DEFAULTS.fullStrips);
    setTabletsPerStrip(DEFAULTS.tabletsPerStrip);
    setLooseTablets(DEFAULTS.looseTablets);
    setTabletsPerDose(DEFAULTS.tabletsPerDose);
    setDosesPerDay(DEFAULTS.dosesPerDay);
    setCountDate(DEFAULTS.countDate);
    setLeadDays(DEFAULTS.leadDays);
    setBufferDays(DEFAULTS.bufferDays);
    setCoverDays(DEFAULTS.coverDays);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Package className="h-4 w-4" aria-hidden="true" />
          Medication timing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Blister Pack Refill Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Count what is left in your strips today. This works out the last day your supply covers,
          the day it runs out, the date to place the order so it arrives in time, and how many packs
          to ask for.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-strips">
              Unopened strips left
            </label>
            <input
              id="rf-strips"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={fullStrips}
              onChange={(event) => setFullStrips(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-perstrip">
              Tablets on a full strip
            </label>
            <input
              id="rf-perstrip"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={tabletsPerStrip}
              onChange={(event) => setTabletsPerStrip(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-loose">
              Tablets left on part-used strips
            </label>
            <input
              id="rf-loose"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={looseTablets}
              onChange={(event) => setLooseTablets(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-date">
              Date you counted them
            </label>
            <input
              id="rf-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={countDate}
              onChange={(event) => setCountDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-perdose">
              Tablets per dose
            </label>
            <input
              id="rf-perdose"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.25"
              step="0.25"
              value={tabletsPerDose}
              onChange={(event) => setTabletsPerDose(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-perday">
              Doses per day
            </label>
            <input
              id="rf-perday"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={dosesPerDay}
              onChange={(event) => setDosesPerDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-lead">
              Days from ordering to receiving
            </label>
            <input
              id="rf-lead"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={leadDays}
              onChange={(event) => setLeadDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-buffer">
              Safety buffer in days
            </label>
            <input
              id="rf-buffer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={bufferDays}
              onChange={(event) => setBufferDays(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rf-cover">
              Days of cover the next order should give
            </label>
            <input
              id="rf-cover"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={coverDays}
              onChange={(event) => setCoverDays(event.target.value)}
            />
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
              Supply runs out on
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {ok ? showDate(result.runOutIso) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${num(result.tabletsOnHand)} tablets covers ${result.fullDays} full day${result.fullDays === 1 ? "" : "s"} at ${num(result.tabletsPerDay)} a day`
                : "Fix the counts above to see the run-out date."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the refill plan"
              className={GHOST_BTN}
              disabled={!ok}
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
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok ? (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${STATUS_TONE[result.status]}`}
          >
            {STATUS_TEXT[result.status]}.{" "}
            {result.status === "ok"
              ? `Place the order on or before ${showDate(result.reorderIso)} — that is ${result.daysUntilReorder} day${result.daysUntilReorder === 1 ? "" : "s"} away.`
              : result.status === "low"
                ? `Less than ${CRITICAL_DAYS + 1} days of cover left; order by ${showDate(result.reorderIso)}.`
                : result.status === "order-now"
                  ? `The reorder date of ${showDate(result.reorderIso)} has already passed for a ${result.leadDays}-day lead time.`
                  : "There are not enough tablets left for a single full day."}
          </p>
        ) : null}

        {ok && result.partialDay ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            {num(result.leftoverTablets)} tablet
            {result.leftoverTablets === 1 ? "" : "s"} will be left over after the last full day — not
            enough for a complete day, so it is not counted as cover.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Tablets counted", ok ? num(result.tabletsOnHand) : DASH],
            ["Tablets used a day", ok ? num(result.tabletsPerDay) : DASH],
            ["Full days of cover", ok ? String(result.fullDays) : DASH],
            ["Last day fully covered", ok ? showDate(result.lastCoveredIso) : DASH],
            ["Run-out date", ok ? showDate(result.runOutIso) : DASH],
            ["Reorder by", ok ? showDate(result.reorderIso) : DASH],
            [
              "Lead time and buffer used",
              ok ? `${result.leadDays} + ${result.bufferDays} days` : DASH,
            ],
            [
              `Packs for ${ok ? result.coverDays : ""} days of cover`,
              ok ? `${result.packsToOrder} (${num(result.tabletsInNextOrder)} tablets)` : DASH,
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
        A stock-planning aid, not medical advice. It assumes the dose stays the same for the whole
        period and that the count date is day one of the remaining supply. If a repeat prescription
        is needed, allow time for the surgery or clinic to authorise it on top of the delivery lead
        time, and never stretch a supply by skipping or halving doses to make it last.
      </p>
    </main>
  );
}

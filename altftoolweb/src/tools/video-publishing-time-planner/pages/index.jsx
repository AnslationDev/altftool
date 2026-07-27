"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  DEFAULT_LEAD_MINUTES,
  DEFAULT_PRIME_WINDOW,
  DEFAULT_SECONDARY_WINDOW,
  TIMEZONE_PRESETS,
  planPublishTime,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const DEFAULT_SEGMENTS = [
  { id: 1, name: "India", offsetHours: "5.5", share: "45" },
  { id: 2, name: "United States (East)", offsetHours: "-5", share: "25" },
  { id: 3, name: "United Kingdom", offsetHours: "0", share: "15" },
  { id: 4, name: "Australia (East)", offsetHours: "10", share: "15" },
];

const DEFAULTS = {
  baseOffset: "5.5",
  publishLocal: "19:00",
  lead: String(DEFAULT_LEAD_MINUTES),
  primeStart: String(DEFAULT_PRIME_WINDOW.startHour),
  primeEnd: String(DEFAULT_PRIME_WINDOW.endHour),
  secondaryStart: String(DEFAULT_SECONDARY_WINDOW.startHour),
  secondaryEnd: String(DEFAULT_SECONDARY_WINDOW.endHour),
};

export default function ToolHome() {
  const [baseOffset, setBaseOffset] = useState(DEFAULTS.baseOffset);
  const [publishLocal, setPublishLocal] = useState(DEFAULTS.publishLocal);
  const [lead, setLead] = useState(DEFAULTS.lead);
  const [primeStart, setPrimeStart] = useState(DEFAULTS.primeStart);
  const [primeEnd, setPrimeEnd] = useState(DEFAULTS.primeEnd);
  const [secondaryStart, setSecondaryStart] = useState(DEFAULTS.secondaryStart);
  const [secondaryEnd, setSecondaryEnd] = useState(DEFAULTS.secondaryEnd);
  const [segments, setSegments] = useState(DEFAULT_SEGMENTS);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planPublishTime({
        baseOffsetHours: Number(baseOffset),
        publishLocal,
        leadMinutes: Number(lead),
        primeStartHour: Number(primeStart),
        primeEndHour: Number(primeEnd),
        secondaryStartHour: Number(secondaryStart),
        secondaryEndHour: Number(secondaryEnd),
        segments: segments.map((row) => ({
          name: row.name,
          offsetHours: Number(row.offsetHours),
          share: Number(row.share),
        })),
      }),
    [baseOffset, publishLocal, lead, primeStart, primeEnd, secondaryStart, secondaryEnd, segments],
  );

  const summary = useMemo(() => {
    if (plan.error) return "";
    const lines = [
      "Video Publishing Time Planner",
      `Your timezone: ${plan.baseOffsetLabel}`,
      `Chosen publish time: ${plan.chosen.localClock} local (${plan.chosen.utcClock} UTC)`,
      `Audience reach score: ${pct(plan.chosen.score)} — rank ${plan.chosen.rank} of ${plan.totalSlots} slots`,
      `Best slot: ${plan.best.localClock} local (${plan.best.utcClock} UTC) at ${pct(plan.best.score)}`,
      "",
      "Local time at publish, per audience:",
      ...plan.segments.map(
        (row) =>
          `- ${row.name} (${row.offsetLabel}, ${pct(row.sharePct)}): ${row.localClock} — window fit ${pct(row.qualityPct)}`,
      ),
    ];
    return lines.join("\n");
  }, [plan]);

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
    setBaseOffset(DEFAULTS.baseOffset);
    setPublishLocal(DEFAULTS.publishLocal);
    setLead(DEFAULTS.lead);
    setPrimeStart(DEFAULTS.primeStart);
    setPrimeEnd(DEFAULTS.primeEnd);
    setSecondaryStart(DEFAULTS.secondaryStart);
    setSecondaryEnd(DEFAULTS.secondaryEnd);
    setSegments(DEFAULT_SEGMENTS);
    setCopied(false);
  };

  const updateSegment = (id, key, value) => {
    setSegments((rows) => rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const addSegment = () => {
    setSegments((rows) => {
      if (rows.length >= 12) return rows;
      const nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      return [...rows, { id: nextId, name: `Audience ${nextId}`, offsetHours: "0", share: "10" }];
    });
  };

  const removeSegment = (id) => {
    setSegments((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Clock className="h-4 w-4" aria-hidden="true" />
          Upload scheduling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Video Publishing Time Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert one publish moment into every audience timezone, score it against the local prime
          window you define, and see which of the 96 quarter-hour slots reaches the most of your
          viewers.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your upload</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vptp-base">
              Your channel timezone
            </label>
            <select
              id="vptp-base"
              className={`mt-2 ${INPUT_CLASS}`}
              value={baseOffset}
              onChange={(event) => setBaseOffset(event.target.value)}
            >
              {TIMEZONE_PRESETS.map((zone) => (
                <option key={`${zone.label}`} value={String(zone.offsetHours)}>
                  {zone.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vptp-time">
              Publish time (your local, HH:MM)
            </label>
            <input
              id="vptp-time"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={publishLocal}
              onChange={(event) => setPublishLocal(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vptp-lead">
              Lead time before viewing (minutes)
            </label>
            <input
              id="vptp-lead"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="720"
              step="15"
              value={lead}
              onChange={(event) => setLead(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Publish this far ahead of the window so processing and indexing finish first.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS} htmlFor="vptp-prime-start">
                Prime from (h)
              </label>
              <input
                id="vptp-prime-start"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="24"
                step="1"
                value={primeStart}
                onChange={(event) => setPrimeStart(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="vptp-prime-end">
                Prime to (h)
              </label>
              <input
                id="vptp-prime-end"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="24"
                step="1"
                value={primeEnd}
                onChange={(event) => setPrimeEnd(event.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS} htmlFor="vptp-second-start">
                Secondary from (h)
              </label>
              <input
                id="vptp-second-start"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="24"
                step="1"
                value={secondaryStart}
                onChange={(event) => setSecondaryStart(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="vptp-second-end">
                Secondary to (h)
              </label>
              <input
                id="vptp-second-end"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="24"
                step="1"
                value={secondaryEnd}
                onChange={(event) => setSecondaryEnd(event.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Audience by timezone</h2>
          <button type="button" onClick={addSegment} className={GHOST_BTN} aria-label="Add an audience timezone">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add row
          </button>
        </div>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Shares are normalised, so they need not add up to exactly 100.
        </p>

        <div className="mt-4 grid gap-4">
          {segments.map((row) => (
            <div
              key={row.id}
              className="grid gap-3 rounded-md border border-[var(--border)] p-3 sm:grid-cols-2"
            >
              <div>
                <label className={LABEL_CLASS} htmlFor={`vptp-name-${row.id}`}>
                  Audience label
                </label>
                <input
                  id={`vptp-name-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={row.name}
                  onChange={(event) => updateSegment(row.id, "name", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`vptp-zone-${row.id}`}>
                  Timezone
                </label>
                <select
                  id={`vptp-zone-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={row.offsetHours}
                  onChange={(event) => updateSegment(row.id, "offsetHours", event.target.value)}
                >
                  {TIMEZONE_PRESETS.map((zone) => (
                    <option key={zone.label} value={String(zone.offsetHours)}>
                      {zone.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`vptp-share-${row.id}`}>
                  Share of viewers (%)
                </label>
                <input
                  id={`vptp-share-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={row.share}
                  onChange={(event) => updateSegment(row.id, "share", event.target.value)}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeSegment(row.id)}
                  disabled={segments.length <= 1}
                  className={`${GHOST_BTN} w-full disabled:opacity-50`}
                  aria-label={`Remove ${row.name || "this audience"}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {plan.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Audience reach score at your chosen time
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {plan.error ? DASH : pct(plan.chosen.score)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan.error
                ? DASH
                : `${plan.chosen.localClock} local · ${plan.chosen.utcClock} UTC · rank ${plan.chosen.rank} of ${plan.totalSlots} slots`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy publishing time plan"
              className={GHOST_BTN}
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
            ["Best slot found", plan.error ? DASH : `${plan.best.localClock} local (${plan.best.utcClock} UTC)`],
            ["Score at best slot", plan.error ? DASH : pct(plan.best.score)],
            ["Your slot in UTC", plan.error ? DASH : plan.chosen.utcClock],
            ["Your channel timezone", plan.error ? DASH : plan.baseOffsetLabel],
            ["Lead time applied", plan.error ? DASH : `${plan.leadMinutes} min`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {plan.error ? null : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Local time at your chosen slot</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Audience</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Share</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Local time</th>
                    <th scope="col" className="py-2 text-right font-semibold">Window fit</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.segments.map((row) => (
                    <tr key={row.name} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">
                        <span className="font-semibold">{row.name}</span>
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          {row.offsetLabel}
                          {row.dayShift === 0 ? "" : row.dayShift > 0 ? " · next day" : " · previous day"}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-right">{pct(row.sharePct)}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{row.localClock}</td>
                      <td
                        className={`py-2 text-right font-semibold ${
                          row.qualityPct >= 60 ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {pct(row.qualityPct)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Top slots in your timezone</h2>
            <ol className="mt-3 grid gap-2">
              {plan.ranked.map((slot) => (
                <li
                  key={slot.utcClock}
                  className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] px-3 py-2 text-sm"
                >
                  <span className="font-semibold">
                    #{slot.rank} · {slot.localClock}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">{slot.utcClock} UTC</span>
                  <span className="font-semibold text-[var(--primary)]">{pct(slot.score)}</span>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => setPublishLocal(plan.best.localClock)}
              className={`${PRIMARY_BTN} mt-4 w-full sm:w-auto`}
            >
              Use the best slot
            </button>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Timezone presets use standard-time offsets and ignore daylight saving. The score reflects the
        windows you enter, not platform data — pair it with your own retention and traffic reports.
      </p>
    </main>
  );
}

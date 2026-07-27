"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Globe2, RotateCcw } from "lucide-react";
import { ZONE_PRESETS, convertStreamTime, formatOffset } from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULT_DATE = "2026-08-15";
const DEFAULT_TIME = "20:00";
const DEFAULT_SOURCE = "Asia/Kolkata";
const DEFAULT_TARGETS = [
  "Asia/Kolkata",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Australia/Sydney",
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const shiftLabel = (shift) => {
  if (shift === 0) return "same day";
  if (shift === 1) return "next day";
  if (shift === -1) return "previous day";
  return `${shift > 0 ? "+" : ""}${shift} days`;
};

export default function ToolHome() {
  const [date, setDate] = useState(DEFAULT_DATE);
  const [time, setTime] = useState(DEFAULT_TIME);
  const [sourceZone, setSourceZone] = useState(DEFAULT_SOURCE);
  const [targets, setTargets] = useState(DEFAULT_TARGETS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => convertStreamTime({ date, time, sourceZone, targetZones: targets }),
    [date, time, sourceZone, targets],
  );

  const hasError = Boolean(result.error);

  const toggleZone = (zoneId) => {
    setTargets((current) =>
      current.includes(zoneId)
        ? current.filter((id) => id !== zoneId)
        : [...current, zoneId],
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Stream start: ${result.source.dateLabel} ${result.source.time24} ${result.source.shortName} (${sourceZone})`,
      `UTC: ${result.utcIso}`,
      "",
    ];
    for (const row of result.rows) {
      lines.push(
        `${row.label}: ${row.time12} on ${row.dateLabel} (${shiftLabel(row.dayShift)}, ${row.dayPart})`,
      );
    }
    return lines.join("\n");
  }, [hasError, result, sourceZone]);

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
    setDate(DEFAULT_DATE);
    setTime(DEFAULT_TIME);
    setSourceZone(DEFAULT_SOURCE);
    setTargets(DEFAULT_TARGETS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Globe2 className="h-4 w-4" aria-hidden="true" />
          Live streaming
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Stream Time Zone Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter one start time and see it in every audience time zone, with the correct daylight
          saving offset for that date, day shifts and a note on who gets a sociable hour.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tz-date">
              Stream date
            </label>
            <input
              id="tz-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tz-time">
              Start time (24-hour)
            </label>
            <input
              id="tz-time"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tz-source">
              That time is in
            </label>
            <select
              id="tz-source"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sourceZone}
              onChange={(event) => setSourceZone(event.target.value)}
            >
              {ZONE_PRESETS.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.label} — {zone.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Audience time zones
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {ZONE_PRESETS.map((zone) => (
              <label
                key={zone.id}
                htmlFor={`tz-target-${zone.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] transition hover:border-[var(--primary)]"
              >
                <input
                  id={`tz-target-${zone.id}`}
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={targets.includes(zone.id)}
                  onChange={() => toggleZone(zone.id)}
                />
                <span className="font-medium">{zone.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Start time at source
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.source.time24}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the conversion."
                : `${result.source.dateLabel} · ${result.source.shortName} (UTC${formatOffset(result.source.offsetMinutes)})`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy converted stream times"
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
            ["UTC instant", hasError ? DASH : result.utcIso.replace(".000Z", "Z")],
            ["Zones converted", hasError ? DASH : String(result.rows.length)],
            [
              "Zones in a sociable slot",
              hasError
                ? DASH
                : `${result.friendlyCount} of ${result.rows.length} (${NUM1.format(result.friendlyPct)}%)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-all">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.dstGap && (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.requestedTime} does not exist on this date in {sourceZone} — the clocks jump
            forward through it. The nearest real local time, {result.source.time24}, is used instead.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Local start time by zone</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Sorted from the furthest ahead of UTC to the furthest behind.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Zone</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Local time</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Date</th>
                  <th scope="col" className="py-2 font-semibold">Slot</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.timeZone} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{row.label}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {row.shortName} · UTC{formatOffset(row.offsetMinutes)}
                      </span>
                    </td>
                    <td className="py-2 pr-3 font-semibold">{row.time12}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {row.dateLabel}
                      <span className="block text-xs">{shiftLabel(row.dayShift)}</span>
                    </td>
                    <td className="py-2">
                      <span
                        className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${
                          row.friendly
                            ? "bg-[var(--success-soft)] text-[var(--success)]"
                            : "bg-[var(--danger-soft)] text-[var(--danger)]"
                        }`}
                      >
                        {row.dayPart}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Offsets are read from your device&apos;s IANA time zone database for the exact date entered,
        so daylight saving is applied correctly even for dates months away.
      </p>
    </main>
  );
}

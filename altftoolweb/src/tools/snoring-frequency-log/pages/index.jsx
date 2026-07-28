"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Moon, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  SEVERITY_LEVELS,
  SLEEP_POSITIONS,
  SNORING_TRIGGERS,
  shiftIsoDate,
  summariseSnoringLog,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_NIGHTS = [
  { date: "2026-07-20", severity: 2, position: "Back", hours: "7", triggers: ["Alcohol in the evening"], pauses: false },
  { date: "2026-07-21", severity: 3, position: "Back", hours: "6.5", triggers: ["Alcohol in the evening", "Late heavy meal"], pauses: true },
  { date: "2026-07-22", severity: 1, position: "Side", hours: "7.5", triggers: [], pauses: false },
  { date: "2026-07-23", severity: 0, position: "Side", hours: "8", triggers: [], pauses: false },
  { date: "2026-07-24", severity: 2, position: "Back", hours: "6", triggers: ["Alcohol in the evening"], pauses: false },
  { date: "2026-07-25", severity: 3, position: "Back", hours: "6", triggers: ["Alcohol in the evening", "Nasal congestion"], pauses: false },
  { date: "2026-07-26", severity: 1, position: "Side", hours: "7.5", triggers: [], pauses: false },
];

const cloneDefaults = () => DEFAULT_NIGHTS.map((night) => ({ ...night, triggers: [...night.triggers] }));

export default function ToolHome() {
  const [nights, setNights] = useState(cloneDefaults);
  const [copied, setCopied] = useState(false);

  const summary = useMemo(() => summariseSnoringLog(nights), [nights]);
  const failed = Boolean(summary.error);

  const updateNight = (index, patch) => {
    setNights((current) => current.map((night, i) => (i === index ? { ...night, ...patch } : night)));
    setCopied(false);
  };

  const toggleTrigger = (index, trigger) => {
    setNights((current) =>
      current.map((night, i) => {
        if (i !== index) return night;
        const has = night.triggers.includes(trigger);
        return {
          ...night,
          triggers: has ? night.triggers.filter((t) => t !== trigger) : [...night.triggers, trigger],
        };
      }),
    );
    setCopied(false);
  };

  const addNight = () => {
    setNights((current) => {
      const last = current[current.length - 1];
      const nextDate = (last && shiftIsoDate(last.date, 1)) || "2026-07-27";
      return [...current, { date: nextDate, severity: 1, position: "Side", hours: "", triggers: [], pauses: false }];
    });
    setCopied(false);
  };

  const removeNight = (index) => {
    setNights((current) => (current.length <= 1 ? current : current.filter((_, i) => i !== index)));
    setCopied(false);
  };

  const reset = () => {
    setNights(cloneDefaults());
    setCopied(false);
  };

  const clipboardText = useMemo(() => {
    if (failed) return "";
    const o = summary.overall;
    const lines = [
      "Snoring Frequency Log",
      `Period: ${summary.firstDate} to ${summary.lastDate} (${o.nights} nights)`,
      `Snoring nights: ${o.snoringNights} of ${o.nights} (${o.snoringRate}%)`,
      `Loud nights (level 2+): ${o.significantNights} (${o.significantRate}%)`,
      `Average severity: ${o.avgSeverity} of 3 · peak ${o.peakSeverity}`,
      o.avgHours === null ? "Average hours in bed: not logged" : `Average hours in bed: ${o.avgHours}`,
      `Witnessed breathing pauses: ${o.pauseNights} night(s)`,
      "",
      "Weekly summary",
      ...summary.weeks.map(
        (w) => `${w.key} (from ${w.weekStart}): ${w.snoringNights}/${w.nights} nights, avg ${w.avgSeverity}, peak ${w.peakSeverity}`,
      ),
      "",
      "By position",
      ...summary.positions.map((p) => `${p.position}: ${p.nights} nights, avg severity ${p.avgSeverity}`),
    ];
    if (summary.triggers.length > 0) {
      lines.push("", "Trigger comparison (avg severity with vs without)");
      lines.push(
        ...summary.triggers.map(
          (t) =>
            `${t.trigger}: ${t.avgWith ?? DASH} vs ${t.avgWithout ?? DASH}${t.delta === null ? "" : ` (${t.delta >= 0 ? "+" : ""}${t.delta})`}${t.comparable ? "" : " [too few nights]"}`,
        ),
      );
    }
    return lines.join("\n");
  }, [failed, summary]);

  const copyResult = async () => {
    if (!clipboardText) return;
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const overall = failed ? null : summary.overall;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Moon className="h-4 w-4" aria-hidden="true" />
          Sleep diary
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Snoring Frequency Log</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Record each night&apos;s snoring loudness on a 0-3 scale along with sleep position and
          possible triggers. The log returns your weekly snoring rate, average severity and which
          triggers line up with the louder nights.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Nights logged ({nights.length})</h2>
          <button type="button" onClick={addNight} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add night
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          {nights.map((night, index) => (
            <div
              key={`night-${index}-${night.date}`}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`snore-date-${index}`}>
                    Date
                  </label>
                  <input
                    id={`snore-date-${index}`}
                    type="date"
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={night.date}
                    onChange={(event) => updateNight(index, { date: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`snore-severity-${index}`}>
                    Snoring loudness
                  </label>
                  <select
                    id={`snore-severity-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={String(night.severity)}
                    onChange={(event) => updateNight(index, { severity: Number(event.target.value) })}
                  >
                    {SEVERITY_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.value} — {level.short}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`snore-position-${index}`}>
                    Main sleep position
                  </label>
                  <select
                    id={`snore-position-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={night.position}
                    onChange={(event) => updateNight(index, { position: event.target.value })}
                  >
                    {SLEEP_POSITIONS.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`snore-hours-${index}`}>
                    Hours in bed (optional)
                  </label>
                  <input
                    id={`snore-hours-${index}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="24"
                    step="0.25"
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={night.hours}
                    onChange={(event) => updateNight(index, { hours: event.target.value })}
                  />
                </div>
              </div>

              <fieldset className="mt-4">
                <legend className="text-sm font-semibold text-[var(--foreground)]">
                  Triggers that night
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SNORING_TRIGGERS.map((trigger) => {
                    const active = night.triggers.includes(trigger);
                    return (
                      <button
                        key={trigger}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleTrigger(index, trigger)}
                        className={`min-h-11 rounded-md border px-3 text-xs font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                          active
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {trigger}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex min-h-11 items-center gap-2 text-sm font-medium" htmlFor={`snore-pause-${index}`}>
                  <input
                    id={`snore-pause-${index}`}
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                    checked={night.pauses}
                    onChange={(event) => updateNight(index, { pauses: event.target.checked })}
                  />
                  Witnessed breathing pause or gasping
                </label>
                <button
                  type="button"
                  onClick={() => removeNight(index)}
                  aria-label={`Remove night ${index + 1}`}
                  disabled={nights.length <= 1}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {summary.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Snoring rate
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {overall ? pct(overall.snoringRate) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {overall
                ? `${overall.snoringNights} of ${overall.nights} nights logged between ${summary.firstDate} and ${summary.lastDate}`
                : "Fix the log entry above to see the summary."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy snoring log summary"
              disabled={failed}
              className={`${GHOST_BTN} disabled:opacity-40`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the log to the sample week" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Nights logged", overall ? num(overall.nights) : DASH],
            ["Loud nights (level 2+)", overall ? `${num(overall.significantNights)} (${pct(overall.significantRate)})` : DASH],
            ["Quiet nights", overall ? num(overall.quietNights) : DASH],
            ["Average severity (0-3)", overall ? num(overall.avgSeverity) : DASH],
            ["Loudest night logged", overall ? num(overall.peakSeverity) : DASH],
            ["Average hours in bed", overall && overall.avgHours !== null ? num(overall.avgHours) : DASH],
            ["Nights with witnessed pauses", overall ? num(overall.pauseNights) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {overall && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Week by week</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Week from</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Snoring</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Rate</th>
                    <th scope="col" className="py-2 text-right font-semibold">Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.weeks.map((week) => (
                    <tr key={week.key} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{week.weekStart}</td>
                      <td className="py-2 pr-3 text-right">{week.snoringNights}/{week.nights}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{pct(week.snoringRate)}</td>
                      <td className="py-2 text-right">{num(week.avgSeverity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Position and trigger patterns</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <caption className="sr-only">Average snoring severity by sleep position</caption>
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Position</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Nights</th>
                    <th scope="col" className="py-2 text-right font-semibold">Avg severity</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.positions.map((row) => (
                    <tr key={row.position} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.position}</td>
                      <td className="py-2 pr-3 text-right">{row.nights} ({pct(row.share)})</td>
                      <td className="py-2 text-right">{num(row.avgSeverity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {summary.triggers.length > 0 && (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[360px] text-left text-sm">
                  <caption className="sr-only">Average severity on nights with and without each trigger</caption>
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">Trigger</th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">With</th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">Without</th>
                      <th scope="col" className="py-2 text-right font-semibold">Diff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.triggers.map((row) => (
                      <tr key={row.trigger} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3">
                          <span className="font-semibold">{row.trigger}</span>
                          {!row.comparable && (
                            <span className="block text-xs text-[var(--muted-foreground)]">too few nights to compare</span>
                          )}
                        </td>
                        <td className="py-2 pr-3 text-right">{row.avgWith === null ? DASH : num(row.avgWith)}</td>
                        <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                          {row.avgWithout === null ? DASH : num(row.avgWithout)}
                        </td>
                        <td className={`py-2 text-right font-semibold ${row.delta !== null && row.delta > 0 ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>
                          {row.delta === null ? DASH : `${row.delta > 0 ? "+" : ""}${num(row.delta)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {summary.notes.length > 0 && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">What the log is showing</h2>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {summary.notes.map((note) => (
                  <li key={note} className="flex gap-2">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This log is informational and is not a diagnostic test. Snoring with witnessed breathing
        pauses, choking or gasping, morning headaches or heavy daytime sleepiness should be
        discussed with a doctor, who may arrange a sleep study.
      </p>
    </main>
  );
}

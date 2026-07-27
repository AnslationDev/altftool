"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Check, Copy, RotateCcw } from "lucide-react";
import { SCORE_WEIGHTS, SILENCE_MULTIPLE, analyseUploads } from "../lib";

const DEC = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DEC2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const DEFAULT_DATES = [
  "2026-01-05",
  "2026-01-12",
  "2026-01-19",
  "2026-01-26",
  "2026-02-09",
  "2026-02-16",
  "2026-02-23",
  "2026-03-09",
].join("\n");

const DEFAULTS = { dates: DEFAULT_DATES, target: "7", tolerance: "2" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[11rem] w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [dates, setDates] = useState(DEFAULTS.dates);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [tolerance, setTolerance] = useState(DEFAULTS.tolerance);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => analyseUploads({ input: dates, targetGapDays: toNumber(target), toleranceDays: toNumber(tolerance) }),
    [dates, target, tolerance],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Upload Consistency Score",
      `Score: ${result.score}/100 (${result.band.label})`,
      `Uploads analysed: ${result.dates.length} over ${DEC.format(result.spanDays)} days`,
      `Target cadence: every ${result.targetGapDays} days ± ${result.toleranceDays}`,
      `Average gap: ${DEC.format(result.stats.mean)} days (shortest ${result.stats.shortest}, longest ${result.stats.longest})`,
      `Standard deviation: ${DEC2.format(result.stats.stdDev)} days · coefficient of variation ${DEC2.format(result.stats.cv)}`,
      `On schedule: ${result.onSchedule} of ${result.gaps.length} gaps`,
      `Components — adherence ${Math.round(result.adherence * 100)}%, regularity ${Math.round(result.regularity * 100)}%, pace ${Math.round(result.pace * 100)}%`,
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
    setDates(DEFAULTS.dates);
    setTarget(DEFAULTS.target);
    setTolerance(DEFAULTS.tolerance);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarCheck className="h-4 w-4" aria-hidden="true" />
          Creator analytics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Upload Consistency Score</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste your publish dates and get a 0-100 consistency index built from three measurable parts:
          how many gaps hit your target cadence, how evenly spaced they are, and how the average gap
          compares with the schedule you set.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="uc-dates">
              Upload dates (YYYY-MM-DD, one per line)
            </label>
            <textarea
              id="uc-dates"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={dates}
              spellCheck={false}
              onChange={(event) => setDates(event.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="uc-target">
                Target gap between uploads (days)
              </label>
              <input
                id="uc-target"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="uc-tolerance">
                Tolerance either side (days)
              </label>
              <input
                id="uc-tolerance"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={tolerance}
                onChange={(event) => setTolerance(event.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {hasError ? (
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
              Consistency score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `${result.score}/100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? dash : `${result.band.label} · ${result.band.note}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the consistency result" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset dates and cadence" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Uploads analysed", hasError ? dash : `${result.dates.length} over ${DEC.format(result.spanDays)} days`],
            ["Effective uploads per week", hasError ? dash : DEC2.format(result.uploadsPerWeek)],
            ["Average gap", hasError ? dash : `${DEC.format(result.stats.mean)} days`],
            ["Shortest / longest gap", hasError ? dash : `${result.stats.shortest} / ${result.stats.longest} days`],
            ["Standard deviation", hasError ? dash : `${DEC2.format(result.stats.stdDev)} days`],
            ["Coefficient of variation", hasError ? dash : DEC2.format(result.stats.cv)],
            [
              "Gaps on schedule",
              hasError ? dash : `${result.onSchedule} of ${result.gaps.length}`,
            ],
            [
              `Adherence (weight ${SCORE_WEIGHTS.adherence})`,
              hasError ? dash : `${Math.round(result.adherence * 100)}%`,
            ],
            [
              `Regularity (weight ${SCORE_WEIGHTS.regularity})`,
              hasError ? dash : `${Math.round(result.regularity * 100)}%`,
            ],
            [`Pace (weight ${SCORE_WEIGHTS.pace})`, hasError ? dash : `${Math.round(result.pace * 100)}%`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.notes.length > 0 ? (
          <ul className="mt-4 space-y-1.5 text-sm text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        ) : null}
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Gap by gap</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">From</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">To</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Days</th>
                  <th scope="col" className="py-2 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.gaps.map((gap, index) => {
                  const onSchedule = Math.abs(gap - result.targetGapDays) <= result.toleranceDays;
                  const silence = gap > result.targetGapDays * SILENCE_MULTIPLE;
                  return (
                    <tr
                      key={`${result.dates[index].text}-${result.dates[index + 1].text}`}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="py-2 pr-3">{result.dates[index].text}</td>
                      <td className="py-2 pr-3">{result.dates[index + 1].text}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{gap}</td>
                      <td
                        className={`py-2 text-right font-semibold ${
                          silence
                            ? "text-[var(--danger)]"
                            : onSchedule
                              ? "text-[var(--success)]"
                              : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {silence ? "silence" : onSchedule ? "on schedule" : "off schedule"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The score is a transparent weighted index of your own data, not a platform metric — the three
        components and their weights are shown above so you can reproduce it. Consistency helps an audience
        form a habit, but a strong irregular video still beats a weak punctual one.
      </p>
    </main>
  );
}

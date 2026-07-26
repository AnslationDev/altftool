"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Repeat, RotateCcw } from "lucide-react";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const FREQUENCIES = [
  { id: "monthly", label: "Monthly", perYear: 12, stepMonths: 1 },
  { id: "quarterly", label: "Quarterly", perYear: 4, stepMonths: 3 },
  { id: "yearly", label: "Yearly", perYear: 1, stepMonths: 12 },
];

const SAMPLE_SERIES = `100.00, 102.24, 102.84, 105.58, 110.76, 114.52, 118.60, 119.77, 125.79, 131.02, 137.42, 143.49,
146.63, 153.42, 155.30, 160.30, 162.14, 163.45, 169.60, 176.33, 182.60, 181.22, 182.91, 186.73,
186.35, 184.58, 183.28, 187.11, 190.15, 188.19, 186.10, 187.85, 182.81, 177.73, 174.39, 171.78,
170.59, 174.04, 173.02, 175.07, 172.47, 172.33, 176.80, 181.36, 181.44, 184.32, 190.91, 196.71,
196.80, 202.52, 203.27, 211.07, 216.07, 224.97, 228.86, 234.47, 240.40, 246.57, 259.79, 266.02,
265.97, 268.73, 269.15, 276.80, 273.86, 274.41, 274.10, 275.07, 272.26, 277.52, 277.23, 277.22,
281.37, 281.47, 282.52, 272.76, 271.17, 267.96, 265.77, 265.99, 261.04, 259.36, 264.79, 259.91,
260.25, 266.79, 269.85, 264.87, 269.85, 275.82, 278.91, 288.99, 298.27, 301.92, 314.68, 332.03`;

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

function parseSeries(raw) {
  return String(raw)
    .split(/[\s,;]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => Number(token));
}

function parseDate(raw) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(raw).trim());
  if (!match) return NaN;
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function addMonths(ts, months) {
  const date = new Date(ts);
  const targetMonth = date.getUTCMonth() + months;
  const targetYear = date.getUTCFullYear() + Math.floor(targetMonth / 12);
  const normalised = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, normalised + 1, 0)).getUTCDate();
  return Date.UTC(targetYear, normalised, Math.min(date.getUTCDate(), lastDay));
}

const median = (sorted) => {
  if (!sorted.length) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const BUCKETS = [
  { label: "Below 0%", min: -Infinity, max: 0 },
  { label: "0% to 8%", min: 0, max: 8 },
  { label: "8% to 12%", min: 8, max: 12 },
  { label: "12% to 15%", min: 12, max: 15 },
  { label: "15% to 20%", min: 15, max: 20 },
  { label: "20% and above", min: 20, max: Infinity },
];

/**
 * Rolling returns: slide a fixed-length window one observation at a time across the
 * whole series and annualise each window with the CAGR formula.
 */
function computeRolling(series, windowPeriods, perYear) {
  const years = windowPeriods / perYear;
  const windows = [];
  for (let i = 0; i + windowPeriods < series.length; i += 1) {
    const start = series[i];
    const end = series[i + windowPeriods];
    const cagr = (Math.pow(end / start, 1 / years) - 1) * 100;
    windows.push({ startIndex: i, endIndex: i + windowPeriods, start, end, cagr });
  }
  return windows;
}

export default function ToolHome() {
  const [seriesText, setSeriesText] = useState(SAMPLE_SERIES);
  const [frequency, setFrequency] = useState("monthly");
  const [windowYears, setWindowYears] = useState("3");
  const [threshold, setThreshold] = useState("12");
  const [startDate, setStartDate] = useState("2018-01-01");
  const [copied, setCopied] = useState(false);

  const freq = FREQUENCIES.find((item) => item.id === frequency) || FREQUENCIES[0];

  const calc = useMemo(() => {
    const values = parseSeries(seriesText);
    const years = toNumber(windowYears);
    const hurdle = toNumber(threshold);
    const startTs = parseDate(startDate);

    if (!values.length) return { error: "Paste at least a few NAV or index values to analyse." };
    if (values.some((value) => !Number.isFinite(value))) {
      return { error: "The series contains something that is not a number — use plain values only." };
    }
    if (values.some((value) => value <= 0)) {
      return { error: "NAV and index values must all be greater than zero." };
    }
    if (Number.isNaN(years) || years < 0.5 || years > 25) {
      return { error: "Rolling window must be between 0.5 and 25 years." };
    }
    if (Number.isNaN(hurdle) || hurdle < -50 || hurdle > 100) {
      return { error: "The comparison hurdle should be between -50% and 100%." };
    }

    const windowPeriods = Math.round(years * freq.perYear);
    if (windowPeriods < 1) {
      return { error: `A ${years}-year window is shorter than one ${freq.label.toLowerCase()} observation.` };
    }
    if (values.length <= windowPeriods) {
      return {
        error: `Need at least ${windowPeriods + 1} observations for a ${years}-year window at ${freq.label.toLowerCase()} frequency — you pasted ${values.length}.`,
      };
    }

    const windows = computeRolling(values, windowPeriods, freq.perYear);
    const returns = windows.map((w) => w.cagr);
    const sorted = [...returns].sort((a, b) => a - b);
    const total = returns.length;
    const average = returns.reduce((sum, value) => sum + value, 0) / total;
    const variance = returns.reduce((sum, value) => sum + (value - average) ** 2, 0) / total;
    const best = windows.reduce((acc, w) => (w.cagr > acc.cagr ? w : acc), windows[0]);
    const worst = windows.reduce((acc, w) => (w.cagr < acc.cagr ? w : acc), windows[0]);
    const negative = returns.filter((value) => value < 0).length;
    const aboveHurdle = returns.filter((value) => value >= hurdle).length;

    const buckets = BUCKETS.map((bucket) => {
      const count = returns.filter((value) => value >= bucket.min && value < bucket.max).length;
      return { ...bucket, count, share: (count / total) * 100 };
    });

    const dated = Number.isFinite(startTs);
    const labelFor = (index) =>
      dated ? DATE_FMT.format(new Date(addMonths(startTs, index * freq.stepMonths))) : `obs ${index + 1}`;

    return {
      windowPeriods,
      years,
      total,
      average,
      medianReturn: median(sorted),
      stdDev: Math.sqrt(variance),
      best,
      worst,
      negative,
      negativeShare: (negative / total) * 100,
      aboveHurdle,
      aboveShare: (aboveHurdle / total) * 100,
      hurdle,
      buckets,
      observations: values.length,
      labelFor,
    };
  }, [seriesText, windowYears, threshold, startDate, freq]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Rolling Returns Calculator",
      `Series: ${calc.observations} ${freq.label.toLowerCase()} observations`,
      `Rolling window: ${NUM.format(calc.years)} years (${calc.windowPeriods} periods), ${calc.total} overlapping windows`,
      `Average rolling return: ${pct(calc.average)} p.a.`,
      `Median rolling return: ${pct(calc.medianReturn)} p.a.`,
      `Best window: ${pct(calc.best.cagr)} (starting ${calc.labelFor(calc.best.startIndex)})`,
      `Worst window: ${pct(calc.worst.cagr)} (starting ${calc.labelFor(calc.worst.startIndex)})`,
      `Standard deviation of rolling returns: ${pct(calc.stdDev)}`,
      `Windows with a loss: ${calc.negative} of ${calc.total} (${pct(calc.negativeShare)})`,
      `Windows at or above ${pct(calc.hurdle)}: ${calc.aboveHurdle} of ${calc.total} (${pct(calc.aboveShare)})`,
    ].join("\n");
  }, [calc, freq.label]);

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
    setSeriesText(SAMPLE_SERIES);
    setFrequency("monthly");
    setWindowYears("3");
    setThreshold("12");
    setStartDate("2018-01-01");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Repeat className="h-4 w-4" aria-hidden="true" />
          Mutual funds
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Rolling Returns Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Point-to-point returns depend entirely on the two dates you pick. Rolling returns slide the
          same window across the whole history, so you see the average, the best case and — most
          usefully — the worst case an investor could have lived through.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="rr-series">
          NAV / index values, oldest first (comma, space or newline separated)
        </label>
        <textarea
          id="rr-series"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          rows={7}
          value={seriesText}
          onChange={(event) => setSeriesText(event.target.value)}
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-frequency">
              Observation frequency
            </label>
            <select
              id="rr-frequency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={frequency}
              onChange={(event) => setFrequency(event.target.value)}
            >
              {FREQUENCIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-window">
              Rolling window (years)
            </label>
            <input
              id="rr-window"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="25"
              step="0.5"
              value={windowYears}
              onChange={(event) => setWindowYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-threshold">
              Compare against (% per year)
            </label>
            <input
              id="rr-threshold"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-50"
              max="100"
              step="0.5"
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-start">
              Date of first observation (optional)
            </label>
            <input
              id="rr-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[1, 3, 5, 7].map((years) => (
            <button
              key={years}
              type="button"
              onClick={() => setWindowYears(String(years))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {years}-year
            </button>
          ))}
        </div>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Average {NUM.format(calc.years)}-year rolling return
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{pct(calc.average)}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  across {calc.total} overlapping windows drawn from {calc.observations} observations
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy rolling returns result"
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

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-[var(--success-soft)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--success)]">
                  Best window
                </p>
                <p className="mt-1 text-2xl font-semibold text-[var(--success)]">{pct(calc.best.cagr)}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  starting {calc.labelFor(calc.best.startIndex)}
                </p>
              </div>
              <div className="rounded-lg bg-[var(--danger-soft)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--danger)]">
                  Worst window
                </p>
                <p className="mt-1 text-2xl font-semibold text-[var(--danger)]">{pct(calc.worst.cagr)}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  starting {calc.labelFor(calc.worst.startIndex)}
                </p>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Median rolling return", pct(calc.medianReturn)],
                ["Spread (best minus worst)", pct(calc.best.cagr - calc.worst.cagr)],
                ["Standard deviation of windows", pct(calc.stdDev)],
                [
                  "Windows that lost money",
                  `${calc.negative} of ${calc.total} (${pct(calc.negativeShare)})`,
                ],
                [
                  `Windows at or above ${pct(calc.hurdle)}`,
                  `${calc.aboveHurdle} of ${calc.total} (${pct(calc.aboveShare)})`,
                ],
                ["Window length", `${calc.windowPeriods} ${freq.label.toLowerCase()} periods`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">How the windows are distributed</h2>
            <ul className="mt-4 space-y-3">
              {calc.buckets.map((bucket) => (
                <li key={bucket.label}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-[var(--muted-foreground)]">{bucket.label}</span>
                    <span className="font-semibold">
                      {bucket.count} ({pct(bucket.share)})
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                    <span
                      className="block h-full bg-[var(--primary)]"
                      style={{ width: `${Math.max(0, Math.min(100, bucket.share))}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Rolling returns describe what a series has already done — they are not a
        forecast. Overlapping windows share data, so the individual windows are not independent
        samples.
      </p>
    </main>
  );
}

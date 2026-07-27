"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw, TriangleAlert } from "lucide-react";

import { FRESH_STOCK_YEARS, INSPECT_FROM_YEARS, REPLACE_BY_YEARS, decodeDotCode } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DASH = "—";

const prettyDate = (iso) => {
  if (!iso) return DASH;
  const parts = iso.split("-").map(Number);
  return DATE_FMT.format(new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])));
};

const DEFAULT_CODE = "DOT U2LL LMLR 3624";
const EXAMPLES = ["3624", "DOT U2LL LMLR 5107", "0821", "4519"];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STATUS_STYLE = {
  fresh: "bg-[var(--success-soft)] text-[var(--success)]",
  "in-service": "bg-[var(--success-soft)] text-[var(--success)]",
  inspect: "bg-[var(--warning-soft)] text-[var(--warning)]",
  replace: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

export default function ToolHome() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [asOf, setAsOf] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const now = new Date();
    const iso = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
      .toISOString()
      .slice(0, 10);
    setAsOf(iso);
  }, []);

  const pending = asOf === "";
  const result = useMemo(() => (pending ? null : decodeDotCode(code, asOf)), [code, asOf, pending]);

  const ok = Boolean(result) && !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `DOT code: ${result.input}`,
      `Date code ${result.dateCode} = week ${result.week} of ${result.year}`,
      `Manufactured about ${result.manufactureDateIso}`,
      `Age on ${result.asOfIso}: ${result.ageWholeYears} years ${result.ageMonths} months (${result.ageDays} days)`,
      `Status: ${result.statusLabel}`,
      `Annual inspection from ${result.inspectDueIso}; replace by ${result.replaceByIso}`,
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
    setCode(DEFAULT_CODE);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Tyre age
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Tyre DOT Date Decoder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The last four digits of the DOT number are the week and year the tyre was built. Enter
          the code to get the manufacture date, the exact age today, and the {INSPECT_FROM_YEARS}
          {" "}and {REPLACE_BY_YEARS} year milestones.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dot-code">
              DOT code (full number or just the last digits)
            </label>
            <input
              id="dot-code"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoCapitalize="characters"
              spellCheck="false"
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dot-asof">
              Work out the age as of
            </label>
            <input
              id="dot-asof"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={asOf}
              onChange={(event) => setAsOf(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button key={example} type="button" onClick={() => setCode(example)} className={CHIP_BTN}>
              {example}
            </button>
          ))}
        </div>
      </section>

      {result && result.error ? (
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
              Age of this tyre
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${result.ageWholeYears}y ${result.ageMonths}m` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Built in week ${result.week} of ${result.year} — about ${prettyDate(result.manufactureDateIso)}`
                : pending
                  ? "Reading today's date…"
                  : "Enter a valid DOT date code"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy decoded tyre manufacture date"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the decoder" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok ? (
          <p className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${STATUS_STYLE[result.status]}`}>
            <strong className="font-semibold">{result.statusLabel}.</strong> {result.statusDetail}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Date code read", ok ? result.dateCode : DASH],
            ["Production week", ok ? `Week ${result.week} of ${result.year}` : DASH],
            ["Approximate manufacture date", ok ? prettyDate(result.manufactureDateIso) : DASH],
            ["Age in days", ok ? INT.format(result.ageDays) : DASH],
            ["Age in years", ok ? NUM.format(result.ageYears) : DASH],
            ["Plant code (first two characters)", ok ? (result.plantCode || "Not supplied") : DASH],
            ["Tyre size code", ok ? (result.sizeCode || "Not supplied") : DASH],
            [
              `Annual inspection due from (${INSPECT_FROM_YEARS} yrs)`,
              ok ? prettyDate(result.inspectDueIso) : DASH,
            ],
            [
              `Replace by (${REPLACE_BY_YEARS} yrs)`,
              ok ? prettyDate(result.replaceByIso) : DASH,
            ],
            [
              "Time left before the 10-year limit",
              ok ? (result.yearsToReplace > 0 ? `${NUM.format(result.yearsToReplace)} years` : "Already past it") : DASH,
            ],
            [
              `Counts as fresh stock (under ${FRESH_STOCK_YEARS} yrs)`,
              ok ? (result.ageYears < FRESH_STOCK_YEARS ? "Yes" : "No") : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {result.warnings.map((message) => (
              <li
                key={message}
                className="flex gap-2 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" aria-hidden="true" />
                <span>{message}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The date code gives the production week, so the manufacture date is
        accurate to within a few days. Age is one factor among several — tread depth, cracking,
        bulges and repair history matter too, so have any tyre you are unsure about checked by a
        qualified tyre technician.
      </p>
    </main>
  );
}

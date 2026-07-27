"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check, Copy, RotateCcw } from "lucide-react";

import { financialYearFor, spanForFinancialYear } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DEC = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const count = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);
const pct = (value) => (Number.isFinite(value) ? `${DEC.format(value)}%` : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const DEFAULT_DATE = "2025-12-15";
const DEFAULT_FY_START = "2024";

export default function ToolHome() {
  const [date, setDate] = useState(DEFAULT_DATE);
  const [fyStartYear, setFyStartYear] = useState(DEFAULT_FY_START);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => financialYearFor(date), [date]);
  const hasError = Boolean(result.error);

  const span = useMemo(() => {
    const parsed = Number(String(fyStartYear).trim());
    return spanForFinancialYear(Number.isInteger(parsed) ? parsed : NaN);
  }, [fyStartYear]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `${result.input.readable}`,
      `Financial year: FY ${result.fyLabel} (${result.fyStart.readable} to ${result.fyEnd.readable})`,
      `Assessment year: AY ${result.ayLabel} (${result.ayStart.readable} to ${result.ayEnd.readable})`,
      `Quarter: ${result.quarter}, ${result.quarterSpan}`,
      `Day ${result.dayOfFy} of ${result.daysInFy} in the financial year`,
      `Return due (no audit): ${result.filing[0].readable}`,
      `Belated or revised return: ${result.filing[3].readable}`,
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
    setDate(DEFAULT_DATE);
    setFyStartYear(DEFAULT_FY_START);
    setCopied(false);
  };

  const relative = (days) => {
    if (!Number.isFinite(days)) return "";
    if (days === 0) return "on this date";
    return days > 0 ? `${count(days)} days after` : `${count(Math.abs(days))} days before`;
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Indian tax calendar
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Financial Year and Assessment Year Finder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The Indian financial year runs 1 April to 31 March, and the assessment year is the twelve
          months that follow it. Enter any date to see which year an income or invoice belongs to,
          along with the quarter and the statutory dates that flow from it.
        </p>
      </header>

      <section className={CARD} aria-labelledby="fy-input">
        <h2 id="fy-input" className="text-base font-semibold">
          Pick a date
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fy-date">
              Date of the income, invoice or transaction
            </label>
            <input
              id="fy-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fy-text">
              Or type it as YYYY-MM-DD
            </label>
            <input
              id="fy-text"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              placeholder="2024-06-10"
              value={date}
              onChange={(event) => setDate(event.target.value)}
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

      <section className={`mt-6 ${CARD}`} aria-labelledby="fy-result">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="fy-result"
              className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]"
            >
              Financial year
            </h2>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `FY ${result.fyLabel}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Enter a valid date to see the mapping."
                : `${result.input.readable} falls in ${result.quarter} (${result.quarterSpan}), assessed in AY ${result.ayLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the financial year result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
            ["Financial year", hasError ? DASH : `FY ${result.fyLabel}`],
            [
              "Financial year runs",
              hasError ? DASH : `${result.fyStart.readable} to ${result.fyEnd.readable}`,
            ],
            ["Assessment year", hasError ? DASH : `AY ${result.ayLabel}`],
            [
              "Assessment year runs",
              hasError ? DASH : `${result.ayStart.readable} to ${result.ayEnd.readable}`,
            ],
            ["Quarter", hasError ? DASH : `${result.quarter} — ${result.quarterSpan}`],
            [
              "Position in the financial year",
              hasError ? DASH : `Day ${count(result.dayOfFy)} of ${count(result.daysInFy)}`,
            ],
            ["Days still to run", hasError ? DASH : count(result.daysRemainingInFy)],
            ["Financial year elapsed", hasError ? DASH : pct(result.fyElapsedPct)],
            [
              "Leap year inside this FY",
              hasError ? DASH : result.isLeapFy ? "Yes — 366 days" : "No — 365 days",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <>
            <div
              className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${pct(result.fyElapsedPct)} of FY ${result.fyLabel} has elapsed by this date`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, result.fyElapsedPct))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              1 April {result.fyStartYear} · {pct(result.fyElapsedPct)} elapsed · 31 March{" "}
              {result.fyStartYear + 1}
            </p>
          </>
        )}
      </section>

      {!hasError && (
        <section className={`mt-6 ${CARD}`} aria-labelledby="fy-advance">
          <h2 id="fy-advance" className="text-base font-semibold">
            Advance tax instalments for FY {result.fyLabel}
          </h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Section 211 of the Income-tax Act. Percentages are cumulative shares of the estimated
            liability for the year.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Instalment
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Due on or before
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    From your date
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.advanceTax.map((entry) => (
                  <tr key={entry.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{entry.label}</td>
                    <td className="py-2 pr-3 font-semibold">{entry.readable}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {relative(entry.daysFromInput)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasError && (
        <section className={`mt-6 ${CARD}`} aria-labelledby="fy-filing">
          <h2 id="fy-filing" className="text-base font-semibold">
            Filing dates for AY {result.ayLabel}
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Return
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Due on or before
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    From your date
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.filing.map((entry) => (
                  <tr key={entry.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{entry.label}</td>
                    <td className="py-2 pr-3 font-semibold">{entry.readable}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {relative(entry.daysFromInput)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            These are the statutory dates. The CBDT extends them by circular in some years, so check
            the notification for the year you are filing.
          </p>
        </section>
      )}

      <section className={`mt-6 ${CARD}`} aria-labelledby="fy-reverse">
        <h2 id="fy-reverse" className="text-base font-semibold">
          Look up a financial year directly
        </h2>
        <div className="mt-4 max-w-xs">
          <label className={LABEL_CLASS} htmlFor="fy-start-year">
            Financial year starting in
          </label>
          <input
            id="fy-start-year"
            className={`mt-2 ${INPUT_CLASS}`}
            type="number"
            inputMode="numeric"
            min="1900"
            max="2198"
            step="1"
            value={fyStartYear}
            onChange={(event) => setFyStartYear(event.target.value)}
          />
        </div>
        {span.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {span.error}
          </p>
        ) : (
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Financial year", `FY ${span.fyLabel}`],
              ["Runs from", `${span.fyStartIso} to ${span.fyEndIso}`],
              ["Assessment year", `AY ${span.ayLabel}`],
              ["Runs from", `${span.ayStartIso} to ${span.ayEndIso}`],
            ].map(([label, value]) => (
              <div key={`${label}-${value}`} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational, not tax advice. The financial year is the &ldquo;previous year&rdquo; of
        section 3 and the assessment year is defined in section 2(9) of the Income-tax Act, 1961.
        Confirm dates against the current year&apos;s CBDT notifications, and consult a chartered
        accountant for your own filing position.
      </p>
    </main>
  );
}

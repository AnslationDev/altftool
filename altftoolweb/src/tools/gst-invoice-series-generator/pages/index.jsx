"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Hash, RotateCcw } from "lucide-react";

import {
  FY_POSITIONS,
  FY_STYLES,
  MAX_FY_START,
  MAX_INVOICE_NUMBER_LENGTH,
  MAX_PREVIEW,
  MIN_FY_START,
  SEPARATORS,
  generateInvoiceSeries,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  prefix: "INV",
  startYear: "2025",
  fyStyleId: "long-short",
  separatorId: "slash",
  fyPosition: "after-prefix",
  start: "1",
  count: "12",
  padding: "4",
};

export default function ToolHome() {
  const [prefix, setPrefix] = useState(DEFAULTS.prefix);
  const [startYear, setStartYear] = useState(DEFAULTS.startYear);
  const [fyStyleId, setFyStyleId] = useState(DEFAULTS.fyStyleId);
  const [separatorId, setSeparatorId] = useState(DEFAULTS.separatorId);
  const [fyPosition, setFyPosition] = useState(DEFAULTS.fyPosition);
  const [start, setStart] = useState(DEFAULTS.start);
  const [count, setCount] = useState(DEFAULTS.count);
  const [padding, setPadding] = useState(DEFAULTS.padding);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      generateInvoiceSeries({
        prefix,
        startYear: startYear.trim() === "" ? Number.NaN : Number(startYear),
        fyStyleId,
        separatorId,
        fyPosition,
        start: start.trim() === "" ? Number.NaN : Number(start),
        count: count.trim() === "" ? Number.NaN : Number(count),
        padding: padding.trim() === "" ? Number.NaN : Number(padding),
      }),
    [prefix, startYear, fyStyleId, separatorId, fyPosition, start, count, padding],
  );

  const hasError = Boolean(result.error);
  const overLength = !hasError && result.invalidCount > 0;

  const summary = useMemo(() => {
    if (hasError) return "";
    return result.samples.map((sample) => sample.number).join("\n");
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
    setPrefix(DEFAULTS.prefix);
    setStartYear(DEFAULTS.startYear);
    setFyStyleId(DEFAULTS.fyStyleId);
    setSeparatorId(DEFAULTS.separatorId);
    setFyPosition(DEFAULTS.fyPosition);
    setStart(DEFAULTS.start);
    setCount(DEFAULTS.count);
    setPadding(DEFAULTS.padding);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Hash className="h-4 w-4" aria-hidden="true" />
          Rule 46(b)
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          GST Invoice Series Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Design a consecutive invoice numbering series for the financial year and see instantly
          whether it stays inside the sixteen-character limit and the allowed character set.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="inv-prefix">
              Prefix
            </label>
            <input
              id="inv-prefix"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              maxLength={12}
              value={prefix}
              onChange={(event) => setPrefix(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Letters, digits, hyphen and slash only. Leave empty for a bare running number.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inv-fy">
              Financial year starting in
            </label>
            <input
              id="inv-fy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_FY_START}
              max={MAX_FY_START}
              step="1"
              value={startYear}
              onChange={(event) => setStartYear(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inv-fy-style">
              How the year is written
            </label>
            <select
              id="inv-fy-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fyStyleId}
              onChange={(event) => setFyStyleId(event.target.value)}
              disabled={fyPosition === "omit"}
            >
              {FY_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inv-position">
              Order of the parts
            </label>
            <select
              id="inv-position"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fyPosition}
              onChange={(event) => setFyPosition(event.target.value)}
            >
              {FY_POSITIONS.map((position) => (
                <option key={position.id} value={position.id}>
                  {position.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inv-separator">
              Separator
            </label>
            <select
              id="inv-separator"
              className={`mt-2 ${INPUT_CLASS}`}
              value={separatorId}
              onChange={(event) => setSeparatorId(event.target.value)}
            >
              {SEPARATORS.map((separator) => (
                <option key={separator.id} value={separator.id}>
                  {separator.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inv-padding">
              Digits in the running number
            </label>
            <input
              id="inv-padding"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="10"
              step="1"
              value={padding}
              onChange={(event) => setPadding(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inv-start">
              Start numbering at
            </label>
            <input
              id="inv-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={start}
              onChange={(event) => setStart(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inv-count">
              How many to preview
            </label>
            <input
              id="inv-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_PREVIEW}
              step="1"
              value={count}
              onChange={(event) => setCount(event.target.value)}
            />
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

      {overLength ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.firstError}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              First invoice number
            </p>
            <p className="mt-1 break-all font-mono text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError || overLength ? DASH : result.samples[0].number}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Pattern ${result.pattern} for FY ${result.financialYear}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated invoice numbers"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy series"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the series settings"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Longest number in the preview",
              hasError ? DASH : `${result.longestLength} of ${MAX_INVOICE_NUMBER_LENGTH} characters`,
            ],
            [
              "Characters to spare",
              hasError || overLength ? DASH : NUM.format(result.headroom),
            ],
            [
              "Invoices before the digits widen",
              hasError ? DASH : NUM.format(result.capacityAtPadding),
            ],
            [
              "Accepted by the e-invoice schema",
              hasError ? DASH : result.eInvoiceSafe ? "Yes" : "No",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.eInvoiceNote ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {result.eInvoiceNote}
          </p>
        ) : null}
      </section>

      {hasError ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Preview of the series</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Invoice number
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Length
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Rule 46(b)
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.samples.map((sample) => (
                  <tr key={sample.number} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-mono">{sample.number}</td>
                    <td className="py-2 pr-3 text-right">{sample.length}</td>
                    <td
                      className={`py-2 text-right font-semibold ${
                        sample.valid ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {sample.valid ? "OK" : "Too long"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What Rule 46(b) actually requires</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>A consecutive serial number, unique for the financial year.</li>
          <li>Not more than sixteen characters in total.</li>
          <li>Letters, digits, hyphen and slash only — no hash, space, underscore or full stop.</li>
          <li>
            One or multiple series are allowed, so separate books for exports, branches or B2C sales
            are fine as long as each is consecutive.
          </li>
          <li>Restart the series at the beginning of each financial year, on 1 April.</li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Bills of supply, delivery challans, credit notes and
        debit notes have their own numbering rules under Rules 49, 53 and 55. Confirm your series
        design with your GST practitioner or accounting software before the year begins.
      </p>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sofa } from "lucide-react";

import { TYPICAL_HEIGHTS, computeCarpentryQuote } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const N2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_RFT = { base: "10", wall: "8", tall: "0", wardrobe: "0", loft: "0", tvunit: "0" };

const initialRows = () =>
  TYPICAL_HEIGHTS.map((item) => ({
    id: item.id,
    label: item.label,
    note: item.note,
    runningFeet: DEFAULT_RFT[item.id] ?? "0",
    heightFt: String(item.heightFt),
  }));

const num = (raw) => (String(raw).trim() === "" ? 0 : Number(String(raw).trim()));

export default function ToolHome() {
  const [rows, setRows] = useState(initialRows);
  const [ratePerRft, setRatePerRft] = useState("1800");
  const [ratePerSqft, setRatePerSqft] = useState("650");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeCarpentryQuote({
        runs: rows.map((row) => ({
          id: row.id,
          label: row.label,
          runningFeet: num(row.runningFeet),
          heightFt: num(row.heightFt),
        })),
        ratePerRft: num(ratePerRft),
        ratePerSqft: num(ratePerSqft),
      }),
    [rows, ratePerRft, ratePerSqft],
  );
  const hasError = Boolean(result.error);

  const updateRow = (id, field, next) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: next } : row)));
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = ["Running feet to square feet"];
    result.rows
      .filter((row) => row.runningFeet > 0)
      .forEach((row) => {
        lines.push(
          `${row.label}: ${N2.format(row.runningFeet)} rft x ${N2.format(row.heightFt)} ft = ${N2.format(row.sqft)} sq ft`,
        );
      });
    lines.push(`Total: ${N2.format(result.totalRunningFeet)} running feet, ${N2.format(result.totalSqft)} sq ft`);
    if (result.totalAtRftRate !== null) {
      lines.push(
        `At the per-rft rate: ${INR.format(result.totalAtRftRate)} (${INR2.format(result.blendedPerSqftFromRft)} per sq ft)`,
      );
    }
    if (result.totalAtSqftRate !== null) {
      lines.push(
        `At the per-sq-ft rate: ${INR.format(result.totalAtSqftRate)} (${INR2.format(result.blendedPerRftFromSqft)} per rft)`,
      );
    }
    return lines.join("\n");
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
    setRows(initialRows());
    setRatePerRft("1800");
    setRatePerSqft("650");
    setCopied(false);
  };

  const cheaperLabel = () => {
    if (hasError || !result.comparison) return DASH;
    if (result.comparison.cheaper === "equal") return "Both quotes come to the same total.";
    const winner = result.comparison.cheaper === "rft" ? "The per-running-foot quote" : "The per-square-foot quote";
    return `${winner} is cheaper by ${INR.format(result.comparison.difference)}.`;
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sofa className="h-4 w-4" aria-hidden="true" />
          Carpentry quotes
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Running Feet to Sqft</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Running feet only becomes an area once you know how tall the unit is: square feet equals
          running feet times height. Enter each run of your kitchen or wardrobe, then compare a
          per-running-foot quote against a per-square-foot one on the same job.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your runs</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Leave a row at 0 running feet if the job does not include it. Heights are typical trade
          sizes — change them to match your drawing.
        </p>
        <div className="mt-4 space-y-5">
          {rows.map((row) => (
            <div key={row.id} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor={`rft-${row.id}`}>
                  {row.label} — running feet
                </label>
                <input
                  id={`rft-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={row.runningFeet}
                  onChange={(event) => updateRow(row.id, "runningFeet", event.target.value)}
                />
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{row.note}</p>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`ht-${row.id}`}>
                  {row.label} — height (ft)
                </label>
                <input
                  id={`ht-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.25"
                  value={row.heightFt}
                  onChange={(event) => updateRow(row.id, "heightFt", event.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The two quotes</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rate-rft">
              Rate per running foot (₹)
            </label>
            <input
              id="rate-rft"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={ratePerRft}
              onChange={(event) => setRatePerRft(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rate-sqft">
              Rate per square foot (₹)
            </label>
            <input
              id="rate-sqft"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="25"
              value={ratePerSqft}
              onChange={(event) => setRatePerSqft(event.target.value)}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total area
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${N2.format(result.totalSqft)} sq ft`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the totals."
                : `${N2.format(result.totalRunningFeet)} running feet at an average height of ${N2.format(result.averageHeightFt)} ft`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy carpentry quote breakdown"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
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
            ["Total running feet", hasError ? DASH : `${N2.format(result.totalRunningFeet)} rft`],
            ["Total square feet", hasError ? DASH : `${N2.format(result.totalSqft)} sq ft`],
            ["In running metres", hasError ? DASH : `${N2.format(result.runningMetres)} m`],
            ["In square metres", hasError ? DASH : `${N2.format(result.sqm)} sq m`],
            [
              "Total at the per-rft rate",
              hasError || result.totalAtRftRate === null ? DASH : INR.format(result.totalAtRftRate),
            ],
            [
              "That works out to",
              hasError || result.blendedPerSqftFromRft === null
                ? DASH
                : `${INR2.format(result.blendedPerSqftFromRft)} per sq ft`,
            ],
            [
              "Total at the per-sq-ft rate",
              hasError || result.totalAtSqftRate === null ? DASH : INR.format(result.totalAtSqftRate),
            ],
            [
              "That works out to",
              hasError || result.blendedPerRftFromSqft === null
                ? DASH
                : `${INR2.format(result.blendedPerRftFromSqft)} per rft`,
            ],
            [
              "Per-rft rate as a running metre rate",
              hasError || result.ratePerRunningMetre === null
                ? DASH
                : `${INR2.format(result.ratePerRunningMetre)} per m`,
            ],
          ].map(([label, text], index) => (
            <div key={`${label}-${index}`} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{text}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.comparison && (
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-semibold text-[var(--success)]">
            {cheaperLabel()}
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Run by run</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            A flat per-running-foot rate charges very different amounts per square foot depending on
            how tall the unit is — that is the column to look at.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Run</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">rft</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Height</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Sq ft</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Cost at rft rate</th>
                  <th scope="col" className="py-2 text-right font-semibold">Effective ₹/sq ft</th>
                </tr>
              </thead>
              <tbody>
                {result.rows
                  .filter((row) => row.runningFeet > 0)
                  .map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.label}</td>
                      <td className="py-2 pr-3 text-right">{N2.format(row.runningFeet)}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {N2.format(row.heightFt)} ft
                      </td>
                      <td className="py-2 pr-3 text-right">{N2.format(row.sqft)}</td>
                      <td className="py-2 pr-3 text-right">
                        {row.costAtRftRate === null ? DASH : INR.format(row.costAtRftRate)}
                      </td>
                      <td className="py-2 text-right font-semibold">
                        {row.effectiveRatePerSqft === null ? DASH : INR2.format(row.effectiveRatePerSqft)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Quoting practice varies: some carpenters price shutters, hardware, loft and countertop
        separately from the carcass rate, and some measure wardrobe height to the loft rather than
        to the shutter. Confirm what a rate includes before comparing two quotes on area alone.
      </p>
    </main>
  );
}

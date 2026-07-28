"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TestTube } from "lucide-react";

import { UMOL_PER_MGDL, UNITS, convertBilirubin } from "../lib";

const TWO_DP = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const ONE_DP = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { unit: "mgdl", total: "1.0", direct: "0.2" };
const DASH = "—";

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const result = useMemo(() => convertBilirubin(values), [values]);
  const hasError = Boolean(result.error);

  const primary =
    hasError || !result.total
      ? DASH
      : values.unit === "mgdl"
        ? `${ONE_DP.format(result.total.umoll)} µmol/L`
        : `${TWO_DP.format(result.total.mgdl)} mg/dL`;

  const analytes = hasError
    ? []
    : [
        { key: "total", label: "Total bilirubin", data: result.total },
        { key: "direct", label: "Direct (conjugated)", data: result.direct },
        { key: "indirect", label: "Indirect (unconjugated)", data: result.indirect },
      ];

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = ["Bilirubin Unit Converter"];
    for (const item of analytes) {
      lines.push(
        item.data
          ? `${item.label}: ${TWO_DP.format(item.data.mgdl)} mg/dL = ${ONE_DP.format(item.data.umoll)} µmol/L`
          : `${item.label}: not entered`,
      );
    }
    if (result.fraction !== null) {
      lines.push(`Direct fraction: ${PCT.format(result.fraction * 100)}% — ${result.fractionBand.label}`);
    }
    lines.push(`Total bilirubin band: ${result.totalBand.label}`);
    lines.push(result.totalBand.note);
    return lines.join("\n");
  }, [hasError, analytes, result]);

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
    setValues(DEFAULTS);
    setCopied(false);
  };

  const rows = [
    [
      "Total bilirubin",
      hasError ? DASH : `${TWO_DP.format(result.total.mgdl)} mg/dL · ${ONE_DP.format(result.total.umoll)} µmol/L`,
    ],
    [
      "Direct (conjugated)",
      hasError || !result.direct
        ? DASH
        : `${TWO_DP.format(result.direct.mgdl)} mg/dL · ${ONE_DP.format(result.direct.umoll)} µmol/L`,
    ],
    [
      "Indirect (unconjugated)",
      hasError || !result.indirect
        ? DASH
        : `${TWO_DP.format(result.indirect.mgdl)} mg/dL · ${ONE_DP.format(result.indirect.umoll)} µmol/L`,
    ],
    [
      "Direct fraction of total",
      hasError || result.fraction === null ? DASH : `${PCT.format(result.fraction * 100)}%`,
    ],
    [
      "Usual adult total range",
      hasError
        ? DASH
        : `up to ${TWO_DP.format(result.reference.totalMax)} mg/dL (${ONE_DP.format(result.reference.totalMaxUmol)} µmol/L)`,
    ],
    ["Conversion factor", `1 mg/dL = ${UMOL_PER_MGDL} µmol/L`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TestTube className="h-4 w-4" aria-hidden="true" />
          Medical units
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Bilirubin Unit Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert total and direct bilirubin between mg/dL and micromoles per litre, and get the
          indirect value and the direct fraction that separates the two jaundice patterns.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bili-unit">
              Unit on the report (applies to both values)
            </label>
            <select
              id="bili-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.unit}
              onChange={(event) => update("unit", event.target.value)}
            >
              {UNITS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bili-total">
              Total bilirubin
            </label>
            <input
              id="bili-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={values.total}
              onChange={(event) => update("total", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bili-direct">
              Direct bilirubin (blank to skip)
            </label>
            <input
              id="bili-direct"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              placeholder="Optional"
              value={values.direct}
              onChange={(event) => update("direct", event.target.value)}
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
              Total bilirubin converted
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{primary}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Enter a valid total bilirubin above." : result.totalBand.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the converted bilirubin result"
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
          {rows.map(([label, text]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{text}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5 space-y-3">
            <p
              className={`rounded-md px-3 py-2 text-sm leading-6 ${
                result.totalBand.id === "jaundice"
                  ? "bg-[var(--danger-soft)] font-medium text-[var(--danger)]"
                  : "border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]"
              }`}
            >
              {result.totalBand.note}
            </p>
            {result.fractionBand && (
              <p className="rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
                <span className="font-semibold text-[var(--foreground)]">
                  {result.fractionBand.label}.
                </span>{" "}
                {result.fractionBand.note}
              </p>
            )}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Usual adult reference intervals</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Measure
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  mg/dL
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  µmol/L
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border)]">
                <td className="py-2 pr-3 font-semibold">Total bilirubin</td>
                <td className="py-2 pr-3 text-right whitespace-nowrap">0.1 – 1.2</td>
                <td className="py-2 text-right whitespace-nowrap">1.7 – 20.5</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-2 pr-3 font-semibold">Direct (conjugated)</td>
                <td className="py-2 pr-3 text-right whitespace-nowrap">0.0 – 0.3</td>
                <td className="py-2 text-right whitespace-nowrap">0 – 5.1</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-semibold">Visible jaundice from</td>
                <td className="py-2 pr-3 text-right whitespace-nowrap">about 2.5</td>
                <td className="py-2 text-right whitespace-nowrap">about 43</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational unit conversion only, not a diagnosis. Reference intervals vary between
        laboratories. Newborn jaundice is assessed against hour-specific nomograms and phototherapy
        thresholds that are not covered here — a jaundiced baby needs same-day clinical assessment.
        Discuss any abnormal result with your own clinician.
      </p>
    </main>
  );
}

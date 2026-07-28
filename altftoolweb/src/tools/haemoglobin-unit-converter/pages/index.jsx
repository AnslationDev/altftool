"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, RotateCcw } from "lucide-react";

import {
  ALTITUDE_ADJUST_FROM_M,
  MMOLL_PER_GDL,
  POPULATIONS,
  UNITS,
  convertHaemoglobin,
  gdlToGl,
  gdlToMmoll,
} from "../lib";

const ONE_DP = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const TWO_DP = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { value: "13.5", unit: "gdl", populationId: "adult-male", altitudeM: "" };
const DASH = "—";

const bandClass = (id) => {
  if (id === "severe" || id === "moderate") return "bg-[var(--danger-soft)] text-[var(--danger)] font-medium";
  if (id === "mild" || id === "high") return "border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)]";
  return "border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]";
};

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const result = useMemo(() => convertHaemoglobin(values), [values]);
  const hasError = Boolean(result.error);

  const gdlText = hasError ? DASH : `${ONE_DP.format(result.gdl)} g/dL`;
  const glText = hasError ? DASH : `${INT.format(result.gl)} g/L`;
  const mmolText = hasError ? DASH : `${TWO_DP.format(result.mmoll)} mmol/L`;

  const primary =
    hasError
      ? DASH
      : values.unit === "gdl"
        ? glText
        : values.unit === "gl"
          ? gdlText
          : gdlText;

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Haemoglobin Unit Converter",
      `${gdlText} = ${glText} = ${mmolText}`,
      `Group: ${result.population.label}`,
      `WHO anaemia threshold: below ${ONE_DP.format(result.population.anaemiaBelow)} g/dL (${INT.format(gdlToGl(result.population.anaemiaBelow))} g/L)`,
    ];
    if (result.adjustment > 0) {
      lines.push(
        `Altitude adjustment at ${INT.format(result.altitudeM)} m: -${TWO_DP.format(result.adjustment)} g/dL, giving ${ONE_DP.format(result.adjustedGdl)} g/dL for comparison`,
      );
    }
    lines.push(`Band: ${result.band.label}`);
    lines.push(result.band.note);
    return lines.join("\n");
  }, [hasError, gdlText, glText, mmolText, result]);

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
    ["Haemoglobin in g/dL", gdlText],
    ["Haemoglobin in g/L", glText],
    ["Haemoglobin in mmol/L", mmolText],
    [
      "WHO anaemia threshold",
      hasError
        ? DASH
        : `below ${ONE_DP.format(result.population.anaemiaBelow)} g/dL (${INT.format(gdlToGl(result.population.anaemiaBelow))} g/L)`,
    ],
    [
      "Altitude adjustment",
      hasError
        ? DASH
        : result.adjustment > 0
          ? `-${TWO_DP.format(result.adjustment)} g/dL → ${ONE_DP.format(result.adjustedGdl)} g/dL`
          : "none (below 1,000 m)",
    ],
    ["Result band", hasError ? DASH : result.band.label],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Medical units
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Haemoglobin Unit Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a haemoglobin result between g/dL, g/L and mmol/L, and see it against the WHO
          anaemia thresholds for your age and sex — with the WHO altitude adjustment if you need it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hb-value">
              Haemoglobin result
            </label>
            <input
              id="hb-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={values.value}
              onChange={(event) => update("value", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hb-unit">
              Unit on the report
            </label>
            <select
              id="hb-unit"
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
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hb-group">
              Who is the result for?
            </label>
            <select
              id="hb-group"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.populationId}
              onChange={(event) => update("populationId", event.target.value)}
            >
              {POPULATIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hb-altitude">
              Altitude of residence in metres (blank for sea level)
            </label>
            <input
              id="hb-altitude"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="6000"
              step="50"
              placeholder="0"
              value={values.altitudeM}
              onChange={(event) => update("altitudeM", event.target.value)}
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
              Converted result
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{primary}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Enter a valid haemoglobin result above." : `${gdlText} · ${glText} · ${mmolText}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the converted haemoglobin result"
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
          <p className={`mt-5 rounded-md px-3 py-2 text-sm leading-6 ${bandClass(result.band.id)}`}>
            {result.band.note}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">WHO anaemia thresholds</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[380px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Group
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  g/dL
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  g/L
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  mmol/L
                </th>
              </tr>
            </thead>
            <tbody>
              {POPULATIONS.map((group) => (
                <tr key={group.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{group.label}</td>
                  <td className="py-2 pr-3 text-right whitespace-nowrap">
                    {ONE_DP.format(group.anaemiaBelow)}
                  </td>
                  <td className="py-2 pr-3 text-right whitespace-nowrap">
                    {INT.format(gdlToGl(group.anaemiaBelow))}
                  </td>
                  <td className="py-2 text-right whitespace-nowrap">
                    {TWO_DP.format(gdlToMmoll(group.anaemiaBelow))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Anaemia is diagnosed below these values. 1 g/dL = 10 g/L = {MMOLL_PER_GDL} mmol/L. The WHO
          altitude adjustment applies from {INT.format(ALTITUDE_ADJUST_FROM_M)} metres upward.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational unit conversion only, not a diagnosis. Laboratory reference intervals differ
        from the WHO public-health thresholds shown here, and anaemia has many causes that need
        investigation rather than assumption. Discuss any abnormal result with your own clinician.
      </p>
    </main>
  );
}

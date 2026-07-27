"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Ruler, RotateCcw } from "lucide-react";

import { CHECKED_LINEAR_PUBLISHED_CM, COMMON_ALLOWANCES, allowanceInBothUnits, checkBagFit } from "../lib";

const DEFAULTS = {
  length: "22",
  width: "14",
  height: "9",
  unit: "in",
  allowanceKey: "eu-cabin",
  customLength: "55",
  customWidth: "40",
  customHeight: "20",
  customUnit: "cm",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const n1 = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });
const n0 = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });

export default function ToolHome() {
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [allowanceKey, setAllowanceKey] = useState(DEFAULTS.allowanceKey);
  const [customLength, setCustomLength] = useState(DEFAULTS.customLength);
  const [customWidth, setCustomWidth] = useState(DEFAULTS.customWidth);
  const [customHeight, setCustomHeight] = useState(DEFAULTS.customHeight);
  const [customUnit, setCustomUnit] = useState(DEFAULTS.customUnit);
  const [copied, setCopied] = useState(false);

  const isCustom = allowanceKey === "custom";

  const allowance = useMemo(() => {
    if (isCustom) {
      return {
        name: "Your own allowance",
        unit: customUnit,
        dims: [Number(customLength), Number(customWidth), Number(customHeight)],
      };
    }
    return COMMON_ALLOWANCES.find((entry) => entry.key === allowanceKey) ?? COMMON_ALLOWANCES[0];
  }, [isCustom, allowanceKey, customLength, customWidth, customHeight, customUnit]);

  const result = useMemo(
    () =>
      checkBagFit({
        bag: { length: Number(length), width: Number(width), height: Number(height), unit },
        allowance,
      }),
    [length, width, height, unit, allowance],
  );

  const ok = !result.error;

  const headline = ok
    ? unit === "in"
      ? `${n1.format(result.cm[0])} × ${n1.format(result.cm[1])} × ${n1.format(result.cm[2])} cm`
      : `${n1.format(result.inches[0])} × ${n1.format(result.inches[1])} × ${n1.format(result.inches[2])} in`
    : DASH;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Bag dimension conversion",
      `In centimetres: ${n1.format(result.cm[0])} × ${n1.format(result.cm[1])} × ${n1.format(result.cm[2])} cm`,
      `In inches: ${n1.format(result.inches[0])} × ${n1.format(result.inches[1])} × ${n1.format(result.inches[2])} in`,
      `Linear total: ${n1.format(result.linearCm)} cm (${n1.format(result.linearInches)} in)`,
      `Against ${allowance.name}: ${result.fits ? "fits" : `over by ${n1.format(result.worstOverhangCm)} cm on the worst side`}`,
      "1 inch = 2.54 cm exactly",
    ].join("\n");
  }, [ok, result, allowance]);

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
    setLength(DEFAULTS.length);
    setWidth(DEFAULTS.width);
    setHeight(DEFAULTS.height);
    setUnit(DEFAULTS.unit);
    setAllowanceKey(DEFAULTS.allowanceKey);
    setCustomLength(DEFAULTS.customLength);
    setCustomWidth(DEFAULTS.customWidth);
    setCustomHeight(DEFAULTS.customHeight);
    setCustomUnit(DEFAULTS.customUnit);
    setCopied(false);
  };

  const rows = [
    ["Length", ok ? `${n1.format(result.cm[0])} cm / ${n1.format(result.inches[0])} in` : DASH],
    ["Width", ok ? `${n1.format(result.cm[1])} cm / ${n1.format(result.inches[1])} in` : DASH],
    ["Height", ok ? `${n1.format(result.cm[2])} cm / ${n1.format(result.inches[2])} in` : DASH],
    ["Linear total (L + W + H)", ok ? `${n1.format(result.linearCm)} cm / ${n1.format(result.linearInches)} in` : DASH],
    ["Allowance linear total", ok ? `${n1.format(result.allowanceLinearCm)} cm` : DASH],
    ["Packing volume", ok ? `${n0.format(result.volumeLitres)} litres` : DASH],
    [
      `Within the ${CHECKED_LINEAR_PUBLISHED_CM} cm checked-bag linear limit`,
      ok ? (result.withinCheckedLinear ? `Yes, ${n1.format(result.checkedLinearHeadroomCm)} cm to spare` : `No, over by ${n1.format(-result.checkedLinearHeadroomCm)} cm`) : DASH,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Baggage sizing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Inches to Centimetres Bag Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert your bag's dimensions between inches and centimetres, then test them against a
          cabin or checked allowance in any orientation. One inch is exactly 2.54 cm.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your bag</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bag-length">
              Length
            </label>
            <input
              id="bag-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={length}
              onChange={(event) => setLength(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bag-width">
              Width
            </label>
            <input
              id="bag-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={width}
              onChange={(event) => setWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bag-height">
              Depth / height
            </label>
            <input
              id="bag-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bag-unit">
              Measured in
            </label>
            <select
              id="bag-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              <option value="in">Inches</option>
              <option value="cm">Centimetres</option>
            </select>
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Compare against</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bag-allowance">
              Allowance
            </label>
            <select
              id="bag-allowance"
              className={`mt-2 ${INPUT_CLASS}`}
              value={allowanceKey}
              onChange={(event) => setAllowanceKey(event.target.value)}
            >
              {COMMON_ALLOWANCES.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.name} — {entry.dims.join(" × ")} {entry.unit}
                </option>
              ))}
              <option value="custom">Enter my airline's own figures</option>
            </select>
          </div>

          {isCustom && (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="allow-length">
                  Allowed length
                </label>
                <input
                  id="allow-length"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={customLength}
                  onChange={(event) => setCustomLength(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="allow-width">
                  Allowed width
                </label>
                <input
                  id="allow-width"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={customWidth}
                  onChange={(event) => setCustomWidth(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="allow-height">
                  Allowed depth
                </label>
                <input
                  id="allow-height"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={customHeight}
                  onChange={(event) => setCustomHeight(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="allow-unit">
                  Allowance unit
                </label>
                <select
                  id="allow-unit"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={customUnit}
                  onChange={(event) => setCustomUnit(event.target.value)}
                >
                  <option value="cm">Centimetres</option>
                  <option value="in">Inches</option>
                </select>
              </div>
            </>
          )}
        </div>
      </section>

      {result.error && (
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
              {unit === "in" ? "Your bag in centimetres" : "Your bag in inches"}
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">{headline}</p>
            <p
              className={`mt-2 text-sm font-semibold ${
                ok ? (result.fits ? "text-[var(--success)]" : "text-[var(--danger)]") : "text-[var(--muted-foreground)]"
              }`}
            >
              {ok
                ? result.fits
                  ? `Fits the ${allowance.name.toLowerCase()} in some orientation`
                  : `Over the ${allowance.name.toLowerCase()} by ${n1.format(result.worstOverhangCm)} cm on its worst side`
                : "Fix the inputs above to see the result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the converted bag dimensions" className={GHOST_BTN}>
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Common allowances, both ways</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Allowance</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Centimetres</th>
                <th scope="col" className="py-2 text-right font-semibold">Inches</th>
              </tr>
            </thead>
            <tbody>
              {COMMON_ALLOWANCES.map((entry) => {
                const both = allowanceInBothUnits(entry);
                return (
                  <tr key={entry.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{entry.name}</td>
                    <td className="py-2 pr-3 text-right">{both.cm.map((value) => n1.format(value)).join(" × ")}</td>
                    <td className="py-2 text-right">{both.inches.map((value) => n1.format(value)).join(" × ")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The listed allowances are typical published figures and vary by airline, fare type and
        aircraft. Airlines measure the bag as it is — wheels, handles, side pockets and any bulge
        from overpacking all count — so leave a little headroom rather than matching the gauge exactly.
      </p>
    </main>
  );
}

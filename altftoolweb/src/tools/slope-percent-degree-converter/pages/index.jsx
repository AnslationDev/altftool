"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TriangleRight } from "lucide-react";

import { convertSlope, riseOverRun } from "../lib";

const MODES = [
  { value: "percent", label: "Percent grade (%)", step: "0.1" },
  { value: "degrees", label: "Degrees (°)", step: "0.1" },
  { value: "ratio", label: "Ratio 1 in X", step: "0.5" },
  { value: "inPerFt", label: "Inches per foot", step: "0.125" },
  { value: "mmPerM", label: "Millimetres per metre", step: "1" },
  { value: "permille", label: "Per mille (‰)", step: "1" },
  { value: "riseRun", label: "Rise and run", step: "0.1" },
];

const DEFAULT_VALUE = { percent: "8.33", degrees: "4.76", ratio: "12", inPerFt: "1", mmPerM: "83.3", permille: "83.3", riseRun: "" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const N3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const N2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const N1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const num = (raw) => (String(raw).trim() === "" ? NaN : Number(String(raw).trim()));

export default function ToolHome() {
  const [mode, setMode] = useState("percent");
  const [value, setValue] = useState(DEFAULT_VALUE.percent);
  const [rise, setRise] = useState("1");
  const [run, setRun] = useState("12");
  const [runLength, setRunLength] = useState("3000");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => convertSlope({ value: num(value), mode, rise: num(rise), run: num(run) }),
    [value, mode, rise, run],
  );
  const hasError = Boolean(result.error);

  const riseOverLength = useMemo(() => {
    if (hasError) return { error: result.error };
    return riseOverRun({ percent: result.percent, run: num(runLength) });
  }, [hasError, result, runLength]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Slope conversion",
      `Percent grade: ${N3.format(result.percent)}%`,
      `Angle: ${N3.format(result.degrees)} degrees`,
      `Ratio: ${result.ratioRun === null ? "level (no fall)" : `1 in ${N2.format(result.ratioRun)}`}`,
      `Inches per foot: ${N3.format(result.inchesPerFoot)} in/ft`,
      `Millimetres per metre: ${N2.format(result.mmPerMetre)} mm/m`,
      `Roof pitch: ${N2.format(result.roofPitchRise)} in 12`,
      `Per mille: ${N2.format(result.permille)}`,
      result.description,
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
    setMode("percent");
    setValue(DEFAULT_VALUE.percent);
    setRise("1");
    setRun("12");
    setRunLength("3000");
    setCopied(false);
  };

  const switchMode = (next) => {
    setMode(next);
    if (next !== "riseRun") setValue(DEFAULT_VALUE[next]);
    setCopied(false);
  };

  const activeMode = MODES.find((item) => item.value === mode) ?? MODES[0];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TriangleRight className="h-4 w-4" aria-hidden="true" />
          Slope
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Slope Percent Degree Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One slope, every notation: percent grade, degrees, the 1-in-X ratio codes are written in,
          inches per foot, millimetres per metre and roof pitch — plus the fall it gives over a run
          you choose.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="slope-mode">
              What do you have?
            </label>
            <select
              id="slope-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => switchMode(event.target.value)}
            >
              {MODES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {mode === "riseRun" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="slope-rise">
                  Rise (vertical)
                </label>
                <input
                  id="slope-rise"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={rise}
                  onChange={(event) => setRise(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="slope-run">
                  Run (horizontal, same unit as the rise)
                </label>
                <input
                  id="slope-run"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={run}
                  onChange={(event) => setRun(event.target.value)}
                />
              </div>
            </>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="slope-value">
                {activeMode.label}
              </label>
              <input
                id="slope-value"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                step={activeMode.step}
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
              {mode === "ratio" && (
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Enter only the X: 12 means a 1 in 12 ramp.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["ADA ramp 1:12", "ratio", "12"],
            ["Gentle ramp 1:20", "ratio", "20"],
            ["Drain 1/4 in per ft", "inPerFt", "0.25"],
            ["Roof 4 in 12", "inPerFt", "4"],
            ["45°", "degrees", "45"],
          ].map(([label, presetMode, presetValue]) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setMode(presetMode);
                setValue(presetValue);
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {label}
            </button>
          ))}
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
              Percent grade
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${N3.format(result.percent)}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the conversion." : result.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy slope conversion"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the converter" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Angle from horizontal", hasError ? DASH : `${N3.format(result.degrees)}°`],
            [
              "Ratio",
              hasError ? DASH : result.ratioRun === null ? "level (no fall)" : `1 in ${N2.format(result.ratioRun)}`,
            ],
            ["Inches per foot", hasError ? DASH : `${N3.format(result.inchesPerFoot)} in/ft`],
            ["Millimetres per metre", hasError ? DASH : `${N2.format(result.mmPerMetre)} mm/m`],
            ["Roof pitch", hasError ? DASH : `${N2.format(result.roofPitchRise)} in 12`],
            ["Per mille", hasError ? DASH : `${N2.format(result.permille)}‰`],
            [
              "Within the ADA 1:12 ramp limit",
              hasError ? DASH : result.withinAdaRamp ? "Yes" : "No — steeper than 8.33%",
            ],
          ].map(([label, text]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Fall over a run</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="slope-runlength">
              Run length (any unit)
            </label>
            <input
              id="slope-runlength"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={runLength}
              onChange={(event) => setRunLength(event.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Rise over that run
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {riseOverLength.error ? DASH : N2.format(riseOverLength.rise)}
            </p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Same unit as the run — 3000 mm of ramp at 1 in 12 rises 250 mm.
            </p>
          </div>
        </div>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Slopes worth knowing</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Rule</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Ratio</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Percent</th>
                  <th scope="col" className="py-2 text-right font-semibold">Degrees</th>
                </tr>
              </thead>
              <tbody>
                {result.references.map((row) => (
                  <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.label}</td>
                    <td className="py-2 pr-3 text-right font-semibold">1 in {N1.format(row.ratio)}</td>
                    <td className="py-2 pr-3 text-right">{N2.format(row.percent)}%</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">{N2.format(row.degrees)}°</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Reference slopes are informational. Accessibility and plumbing requirements differ by
        country and by local amendment — check the code that applies to your project before building.
      </p>
    </main>
  );
}

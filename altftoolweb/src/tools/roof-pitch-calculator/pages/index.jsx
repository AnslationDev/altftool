"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Triangle } from "lucide-react";

import { convertPitch } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);
const num2 = (value) => (Number.isFinite(value) ? NUM2.format(value) : DASH);

const MODES = [
  { id: "riseIn12", label: "Rise in 12", hint: "e.g. 6 for a 6-in-12 roof" },
  { id: "degrees", label: "Degrees", hint: "0 to just under 90" },
  { id: "percent", label: "Percent", hint: "rise as a % of run" },
  { id: "ratio", label: "Ratio 1 : n", hint: "enter n, e.g. 3 for 1 in 3" },
  { id: "riseRun", label: "Measured rise & run", hint: "any two matching units" },
];

const QUICK = [2, 3, 4, 5, 6, 8, 9, 12];

const DEFAULTS = {
  mode: "riseIn12",
  value: "6",
  rise: "4",
  run: "16",
  span: "30",
  overhang: "1.5",
};

const FIELD =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_ON =
  "min-h-11 rounded-md border border-[var(--primary)] bg-[var(--primary)]/10 px-3 text-sm font-semibold text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [value, setValue] = useState(DEFAULTS.value);
  const [rise, setRise] = useState(DEFAULTS.rise);
  const [run, setRun] = useState(DEFAULTS.run);
  const [span, setSpan] = useState(DEFAULTS.span);
  const [overhang, setOverhang] = useState(DEFAULTS.overhang);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      convertPitch({
        mode,
        value: toNumber(value),
        rise: toNumber(rise),
        run: toNumber(run),
        spanFt: toNumber(span),
        overhangFt: toNumber(overhang),
      }),
    [mode, value, rise, run, span, overhang],
  );

  const failed = Boolean(result.error);
  const activeMode = MODES.find((item) => item.id === mode) ?? MODES[0];

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Roof pitch",
      `${num(result.riseIn12)} in 12 · ${num2(result.angleDeg)} degrees · ${num2(result.percent)}% · 1 : ${num2(result.ratioRunPerRise)}`,
      `Band: ${result.pitchName}`,
      `Slope factor: ${num(result.slopeFactor)} (plan area x this = roof area)`,
      `Hip and valley factor: ${num(result.hipFactor)}`,
      `Span ${num2(result.spanFt)} ft: rise ${num2(result.riseFt)} ft, common rafter ${num2(result.rafterFt)} ft`,
      `With overhang: ${num2(result.totalRafterFt)} ft of rafter to cut`,
      `Hip rafter: ${num2(result.hipRafterFt)} ft`,
    ].join("\n");
  }, [failed, result]);

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
    setMode(DEFAULTS.mode);
    setValue(DEFAULTS.value);
    setRise(DEFAULTS.rise);
    setRun(DEFAULTS.run);
    setSpan(DEFAULTS.span);
    setOverhang(DEFAULTS.overhang);
    setCopied(false);
  };

  const rows = [
    ["Rise per 12 of run", failed ? DASH : `${num(result.riseIn12)} in 12`],
    ["Angle from horizontal", failed ? DASH : `${num2(result.angleDeg)}°`],
    ["Grade as a percentage", failed ? DASH : `${num2(result.percent)}%`],
    ["Ratio 1 : n", failed ? DASH : `1 : ${num2(result.ratioRunPerRise)}`],
    ["Tangent (rise / run)", failed ? DASH : num(result.tangent)],
    ["Pitch band", failed ? DASH : result.pitchName],
    ["Slope factor", failed ? DASH : num(result.slopeFactor)],
    ["Hip and valley factor", failed ? DASH : num(result.hipFactor)],
    ["Common rafter run", failed ? DASH : `${num2(result.commonRunFt)} ft`],
    ["Rise over that run", failed ? DASH : `${num2(result.riseFt)} ft`],
    ["Common rafter length", failed ? DASH : `${num2(result.rafterFt)} ft`],
    ["Extra rafter for the overhang", failed ? DASH : `${num2(result.overhangRafterFt)} ft`],
    ["Rafter to cut in total", failed ? DASH : `${num2(result.totalRafterFt)} ft`],
    ["Hip rafter length", failed ? DASH : `${num2(result.hipRafterFt)} ft`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Triangle className="h-4 w-4" aria-hidden="true" />
          Roofing
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Roof Pitch Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter a pitch in whichever notation you have — rise in 12, degrees, percent, 1 in n, or a
          measured rise and run — and read it back in all the others, with rafter lengths and the coverings
          it suits.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">How is your pitch written?</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={mode === item.id}
              className={mode === item.id ? CHIP_ON : CHIP}
              onClick={() => setMode(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {mode === "riseRun" ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="rp-rise">
                Measured rise
              </label>
              <input
                id="rp-rise"
                className={FIELD}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={rise}
                onChange={(event) => setRise(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="rp-run">
                Measured run (same units)
              </label>
              <input
                id="rp-run"
                className={FIELD}
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.1"
                value={run}
                onChange={(event) => setRun(event.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <label className={LABEL} htmlFor="rp-value">
              {activeMode.label} — {activeMode.hint}
            </label>
            <input
              id="rp-value"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
        )}

        {mode === "riseIn12" && (
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK.map((item) => (
              <button
                key={item}
                type="button"
                className={CHIP}
                onClick={() => setValue(String(item))}
              >
                {item} in 12
              </button>
            ))}
          </div>
        )}

        <h2 className="mt-6 text-base font-semibold">Apply it to a roof (optional)</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="rp-span">
              Full span wall to wall (ft)
            </label>
            <input
              id="rp-span"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={span}
              onChange={(event) => setSpan(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="rp-overhang">
              Horizontal overhang at the eaves (ft)
            </label>
            <input
              id="rp-overhang"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={overhang}
              onChange={(event) => setOverhang(event.target.value)}
            />
          </div>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Pitch angle
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${num2(result.angleDeg)}°`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see the conversion."
                : `${num(result.riseIn12)} in 12 · ${num2(result.percent)}% · ${result.pitchName}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the pitch conversion"
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
          {rows.map(([label, cell]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{cell}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Coverings this pitch can take</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[26rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Covering
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Minimum pitch
                </th>
                <th scope="col" className="py-2 font-semibold">
                  At this pitch
                </th>
              </tr>
            </thead>
            <tbody>
              {(failed ? [] : result.materials).map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2.5 pr-3">{item.label}</td>
                  <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">
                    {num(item.minRiseIn12)} in 12
                  </td>
                  <td
                    className={`py-2.5 font-semibold ${
                      item.suitable ? "text-[var(--success)]" : "text-[var(--danger)]"
                    }`}
                  >
                    {item.suitable ? "Suitable" : "Too shallow"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {failed && (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Enter a usable pitch to see which coverings it suits.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Minimum pitches are the mainstream manufacturer figures and assume the specified laps and
        underlay. Check the datasheet for the exact product before ordering, especially near the limit.
      </p>
    </main>
  );
}

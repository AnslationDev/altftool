"use client";

import { useMemo, useState } from "react";
import { Calculator, Check, Copy, RotateCcw } from "lucide-react";

import {
  MAX_SIG_FIGS,
  MIN_SIG_FIGS,
  OPERATIONS,
  calculate,
  countSignificantFigures,
  parseNumberInput,
  toEngineering,
  toScientific,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const MODES = [
  { id: "convert", label: "Convert one number" },
  { id: "calculate", label: "Calculate with two numbers" },
];

const DEFAULTS = {
  single: "299792458",
  sigFigs: "4",
  a: "6.02e23",
  b: "1.5e-3",
  operation: "multiply",
};

export default function ToolHome() {
  const [mode, setMode] = useState("convert");
  const [single, setSingle] = useState(DEFAULTS.single);
  const [sigFigs, setSigFigs] = useState(DEFAULTS.sigFigs);
  const [a, setA] = useState(DEFAULTS.a);
  const [b, setB] = useState(DEFAULTS.b);
  const [operation, setOperation] = useState(DEFAULTS.operation);
  const [copied, setCopied] = useState(false);

  const parsedSingle = useMemo(() => parseNumberInput(single), [single]);
  const digits = Number(sigFigs);

  const conversion = useMemo(() => {
    if (parsedSingle.error) return { error: parsedSingle.error };
    const sci = toScientific(parsedSingle.value, digits);
    if (sci.error) return { error: sci.error };
    const eng = toEngineering(parsedSingle.value, digits);
    if (eng.error) return { error: eng.error };
    return { sci, eng, written: countSignificantFigures(single) };
  }, [parsedSingle, digits, single]);

  const computation = useMemo(
    () => calculate({ a, b, operation, displaySigFigs: digits }),
    [a, b, operation, digits],
  );

  const isConvert = mode === "convert";
  const active = isConvert ? conversion : computation;
  const hasError = Boolean(active.error);

  const headline = hasError
    ? DASH
    : isConvert
      ? conversion.sci.text
      : computation.scientific.text;

  const rows = useMemo(() => {
    if (hasError) {
      return isConvert
        ? [
            ["Scientific notation", DASH],
            ["Engineering notation", DASH],
            ["SI prefix", DASH],
            ["Significant figures as written", DASH],
            ["Expanded decimal", DASH],
          ]
        : [
            ["Unrounded result", DASH],
            ["Significant-figure rule", DASH],
            ["Result significant figures", DASH],
            ["Engineering notation", DASH],
            ["Expanded decimal", DASH],
          ];
    }
    if (isConvert) {
      const prefix = conversion.eng.prefix;
      return [
        ["Scientific notation", conversion.sci.text],
        ["Engineering notation", conversion.eng.text],
        [
          "SI prefix",
          prefix && prefix.exponent !== 0
            ? `${prefix.name} (${prefix.symbol}) = 10^${prefix.exponent}`
            : "None — the value is already in base units",
        ],
        [
          "Significant figures as written",
          conversion.written === null ? DASH : String(conversion.written),
        ],
        ["Expanded decimal", conversion.sci.plain],
      ];
    }
    return [
      ["Unrounded result", computation.scientificExact.text],
      ["Significant-figure rule", computation.rule],
      ["Result significant figures", String(computation.significantFigures)],
      ["Engineering notation", computation.engineering.text],
      ["Expanded decimal", computation.decimal],
    ];
  }, [hasError, isConvert, conversion, computation]);

  const clipboardText = useMemo(() => {
    if (hasError) return "";
    if (isConvert) {
      return [
        `Value: ${single}`,
        `Scientific: ${conversion.sci.text}`,
        `Engineering: ${conversion.eng.text}`,
        `Expanded: ${conversion.sci.plain}`,
      ].join("\n");
    }
    return [
      `${a} ${computation.operation.symbol} ${b}`,
      `Result: ${computation.scientific.text}`,
      `Expanded: ${computation.decimal}`,
      computation.rule,
    ].join("\n");
  }, [hasError, isConvert, single, conversion, a, b, computation]);

  const copyResult = async () => {
    if (!clipboardText) return;
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setMode("convert");
    setSingle(DEFAULTS.single);
    setSigFigs(DEFAULTS.sigFigs);
    setA(DEFAULTS.a);
    setB(DEFAULTS.b);
    setOperation(DEFAULTS.operation);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Calculator className="h-4 w-4" aria-hidden="true" />
          Numbers &amp; notation
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Scientific Notation Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write any number as a × 10<sup>n</sup> with 1 ≤ |a| &lt; 10, or in engineering notation
          where the exponent is a multiple of 3 and maps onto an SI prefix. Arithmetic follows the
          standard significant-figure rules.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sn-mode">
              Mode
            </label>
            <select
              id="sn-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => {
                setMode(event.target.value);
                setCopied(false);
              }}
            >
              {MODES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>

          {isConvert ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="sn-value">
                Number (plain, 1.23e-4, or 1.23 × 10^-4)
              </label>
              <input
                id="sn-value"
                type="text"
                inputMode="decimal"
                className={`mt-2 ${INPUT_CLASS}`}
                value={single}
                onChange={(event) => {
                  setSingle(event.target.value);
                  setCopied(false);
                }}
              />
            </div>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="sn-a">
                  First number (a)
                </label>
                <input
                  id="sn-a"
                  type="text"
                  inputMode="decimal"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={a}
                  onChange={(event) => {
                    setA(event.target.value);
                    setCopied(false);
                  }}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="sn-b">
                  Second number (b)
                </label>
                <input
                  id="sn-b"
                  type="text"
                  inputMode="decimal"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={b}
                  onChange={(event) => {
                    setB(event.target.value);
                    setCopied(false);
                  }}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor="sn-op">
                  Operation
                </label>
                <select
                  id="sn-op"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={operation}
                  onChange={(event) => {
                    setOperation(event.target.value);
                    setCopied(false);
                  }}
                >
                  {OPERATIONS.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="sn-sigfigs">
              Significant figures to display ({MIN_SIG_FIGS}–{MAX_SIG_FIGS})
            </label>
            <input
              id="sn-sigfigs"
              type="number"
              inputMode="numeric"
              min={MIN_SIG_FIGS}
              max={MAX_SIG_FIGS}
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sigFigs}
              onChange={(event) => {
                setSigFigs(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {active.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" aria-atomic="true">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {isConvert ? "Scientific notation" : "Result"}
            </p>
            <p className="mt-1 break-words text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {headline}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : isConvert
                  ? `Engineering form: ${conversion.eng.text}`
                  : `Rounded to ${computation.significantFigures} significant figure${computation.significantFigures === 1 ? "" : "s"}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the notation result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the calculator to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            >
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="break-words font-semibold sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Calculations run in IEEE-754 double precision, which holds about 17 significant decimal
        digits and magnitudes from roughly 10<sup>-323</sup> to 10<sup>308</sup>. Anything outside
        that range is reported as an error rather than a rounded-off number.
      </p>
    </main>
  );
}

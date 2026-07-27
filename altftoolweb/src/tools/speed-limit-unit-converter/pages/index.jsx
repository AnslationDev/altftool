"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, Gauge, RotateCcw } from "lucide-react";

import {
  BRAKE_REACTION_SECONDS,
  SIGN_INCREMENT,
  SPEED_UNITS,
  UNIT_KEYS,
  buildLimitTable,
  convertSpeed,
} from "../lib";

const DECIMAL = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 });
const WHOLE = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
const EM_DASH = "—";

const num = (value) => (Number.isFinite(value) ? DECIMAL.format(value) : EM_DASH);
const whole = (value) => (Number.isFinite(value) ? WHOLE.format(value) : EM_DASH);

const DEFAULTS = { value: "100", from: "kmh", to: "mph" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const parseSpeed = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  return Number(trimmed.replace(/,/g, ""));
};

export default function ToolHome() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [from, setFrom] = useState(DEFAULTS.from);
  const [to, setTo] = useState(DEFAULTS.to);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => convertSpeed({ value: parseSpeed(value), from, to }),
    [value, from, to],
  );

  const table = useMemo(() => buildLimitTable(from, to), [from, to]);

  const fromUnit = SPEED_UNITS[from];
  const toUnit = SPEED_UNITS[to];
  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Speed Limit Unit Converter",
      `${num(result.value)} ${fromUnit.short} = ${num(result.converted)} ${toUnit.short}`,
      `Nearest sign value: ${whole(result.signable)} ${toUnit.short}`,
      `In metres per second: ${num(result.metresPerSecond)} m/s`,
      `Time to cover 1 km: ${num(result.secondsPerKilometre)} s`,
      `Time to cover 1 mile: ${num(result.secondsPerMile)} s`,
    ].join("\n");
  }, [result, fromUnit, toUnit]);

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
    setValue(DEFAULTS.value);
    setFrom(DEFAULTS.from);
    setTo(DEFAULTS.to);
    setCopied(false);
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Travel conversions
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Speed Limit Unit Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a posted limit between kilometres and miles per hour — plus knots, m/s and ft/s —
          using the exact 1 mile = 1609.344 m definition, and see the nearest value a sign would
          actually show.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="speed-value">
              Posted speed limit
            </label>
            <input
              id="speed-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="speed-from">
              Sign is posted in
            </label>
            <select
              id="speed-from"
              className={`mt-2 ${INPUT_CLASS}`}
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            >
              {UNIT_KEYS.map((key) => (
                <option key={key} value={key}>
                  {SPEED_UNITS[key].label} ({SPEED_UNITS[key].short})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="speed-to">
              Convert to
            </label>
            <select
              id="speed-to"
              className={`mt-2 ${INPUT_CLASS}`}
              value={to}
              onChange={(event) => setTo(event.target.value)}
            >
              {UNIT_KEYS.map((key) => (
                <option key={key} value={key}>
                  {SPEED_UNITS[key].label} ({SPEED_UNITS[key].short})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button type="button" onClick={swap} className={`${GHOST_BTN} w-full`} aria-label="Swap the two units">
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
              Swap units
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["30", "50", "60", "80", "100", "120"].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setValue(preset)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset} {fromUnit.short}
            </button>
          ))}
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
              {failed ? "Converted speed" : `${num(result.value)} ${fromUnit.short} equals`}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? EM_DASH : `${num(result.converted)} ${toUnit.short}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to see a result."
                : `Nearest sign value (multiples of ${SIGN_INCREMENT}): ${whole(result.signable)} ${toUnit.short}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the speed conversion result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the converter" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {UNIT_KEYS.map((key) => (
            <div key={key} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{SPEED_UNITS[key].label}</dt>
              <dd className="text-right font-semibold">
                {failed ? EM_DASH : `${num(result.all[key])} ${SPEED_UNITS[key].short}`}
              </dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Time to cover 1 km</dt>
            <dd className="text-right font-semibold">
              {failed ? EM_DASH : `${num(result.secondsPerKilometre)} s`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Time to cover 1 mile</dt>
            <dd className="text-right font-semibold">
              {failed ? EM_DASH : `${num(result.secondsPerMile)} s`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">
              Distance travelled in the {BRAKE_REACTION_SECONDS} s design reaction time
            </dt>
            <dd className="text-right font-semibold">
              {failed ? EM_DASH : `${num(result.reactionDistanceMetres)} m`}
            </dd>
          </div>
        </dl>

        {!failed && result.misread && (
          <p className="mt-5 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Read that sign in the wrong unit and you would be doing{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {num(result.misread.actual)} {fromUnit.short}
            </span>{" "}
            — {num(result.misread.gap)} {fromUnit.short} ({num(result.misread.gapPercent)}%){" "}
            {result.misread.over ? "over" : "under"} the posted limit.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Everyday posted limits</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Limits commonly signed in {fromUnit.short}, converted to {toUnit.short}.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Sign ({fromUnit.short})
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Exact ({toUnit.short})
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Nearest sign value
                </th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => (
                <tr key={row.source} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">
                    {whole(row.source)} {fromUnit.short}
                  </td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {num(row.exact)}
                  </td>
                  <td className="py-2 text-right font-semibold">
                    {whole(row.signable)} {toUnit.short}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Conversions are exact; the &ldquo;nearest sign value&rdquo; is a reading aid only. The number on the
        sign is the legal limit in the unit it is posted in — never round a converted figure upward
        and drive to it.
      </p>
    </main>
  );
}

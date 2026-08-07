"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Volume2 } from "lucide-react";

import {
  DB_LIMIT,
  DB_PER_DISTANCE_DOUBLING,
  DB_PER_POWER_DOUBLING,
  RATIO_KINDS,
  REFERENCE_POINTS,
  analyseDecibelChange,
  decibelsFromRatio,
  formatRatio,
} from "../lib";

const DB_FORMAT = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});
const PERCENT_FORMAT = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});
const MAGNITUDE_FORMAT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] px-3.5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { mode: "fromDb", deltaDb: "6", ratio: "2", kindId: "amplitude" };
const DASH = "—";

/** Percentages past this are meaningless to read out, so the ratio speaks instead. */
const PERCENT_DISPLAY_CEILING = 100000;

function percentSuffix(percent) {
  if (!Number.isFinite(percent) || Math.abs(percent) >= PERCENT_DISPLAY_CEILING) return "";
  return ` (${PERCENT_FORMAT.format(percent)}%)`;
}

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [deltaDb, setDeltaDb] = useState(DEFAULTS.deltaDb);
  const [ratio, setRatio] = useState(DEFAULTS.ratio);
  const [kindId, setKindId] = useState(DEFAULTS.kindId);
  const [copied, setCopied] = useState(false);

  const fromRatio = useMemo(
    () => (mode === "fromRatio" ? decibelsFromRatio({ ratio, kindId }) : null),
    [mode, ratio, kindId],
  );

  const result = useMemo(() => {
    if (mode === "fromRatio") {
      if (!fromRatio || fromRatio.error) return fromRatio || { error: "Enter a ratio." };
      return analyseDecibelChange({ deltaDb: fromRatio.deltaDb });
    }
    return analyseDecibelChange({ deltaDb });
  }, [mode, deltaDb, fromRatio]);

  const hasError = Boolean(result.error);

  const referenceRows = useMemo(
    () =>
      REFERENCE_POINTS.map((point) => ({
        ...point,
        analysis: analyseDecibelChange({ deltaDb: point.db }),
      })),
    [],
  );

  const summaryText = useMemo(() => {
    if (hasError) return "";
    return [
      `Level change: ${DB_FORMAT.format(result.deltaDb)} dB`,
      `Power / intensity ratio: ×${formatRatio(result.powerRatio)}`,
      `Amplitude / sound pressure ratio: ×${formatRatio(result.amplitudeRatio)}`,
      `Perceived loudness: ×${formatRatio(result.loudnessRatio)}`,
      `Equivalent distance from a point source: ×${formatRatio(result.distanceRatio)}`,
      `Equivalent identical uncorrelated sources: ×${formatRatio(result.sourceCount)}`,
      result.perception,
    ].join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setMode(DEFAULTS.mode);
    setDeltaDb(DEFAULTS.deltaDb);
    setRatio(DEFAULTS.ratio);
    setKindId(DEFAULTS.kindId);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Power / intensity ratio", DASH],
        ["Amplitude / sound pressure ratio", DASH],
        ["Perceived loudness", DASH],
        ["Equivalent distance (point source)", DASH],
        ["Equivalent identical sources", DASH],
      ]
    : [
        [
          "Power / intensity ratio",
          `×${formatRatio(result.powerRatio)}${percentSuffix(result.powerPercentChange)}`,
        ],
        [
          "Amplitude / sound pressure ratio",
          `×${formatRatio(result.amplitudeRatio)}${percentSuffix(result.amplitudePercentChange)}`,
        ],
        [
          "Perceived loudness",
          `×${formatRatio(result.loudnessRatio)}${percentSuffix(result.loudnessPercentChange)}`,
        ],
        ["Equivalent distance (point source)", `×${formatRatio(result.distanceRatio)}`],
        ["Equivalent identical sources", `×${formatRatio(result.sourceCount)}`],
      ];

  // distanceDoublings is sign-inverted relative to deltaDb (louder = closer = fewer doublings,
  // hence negative) - rendering it directly reads as ungrammatical/confusing (e.g. "-1 doublings
  // of distance") for any louder (positive) change. Show the magnitude and say the direction in
  // words instead, reusing the already-correct distanceRatio for the "×N the distance" figure.
  const distanceMagnitude = hasError ? 0 : Math.abs(result.distanceDoublings);
  const distanceDirection = !hasError && result.deltaDb < 0 ? "further from" : "closer to";
  // Compare the ROUNDED (displayed) value for singular/plural, not the raw one - otherwise a
  // value that rounds to "1" at 2dp (e.g. 0.9966) would still read as "1 doublings".
  const distanceMagnitudeIsOne = Math.round(distanceMagnitude * 100) / 100 === 1;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Volume2 className="h-4 w-4" aria-hidden="true" />
          Acoustics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Decibel Change Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A decibel is a ratio, and which ratio depends on the quantity: power uses
          10·log₁₀, amplitude uses 20·log₁₀, and the ear roughly doubles loudness every
          10 dB. Enter a level change to see all of them at once.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dbc-mode">
              What you know
            </label>
            <select
              id="dbc-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="fromDb">A change in decibels</option>
              <option value="fromRatio">A ratio, and I want the decibels</option>
            </select>
          </div>

          {mode === "fromDb" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="dbc-delta">
                Level change (dB)
              </label>
              <input
                id="dbc-delta"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                step="0.1"
                min={-DB_LIMIT}
                max={DB_LIMIT}
                value={deltaDb}
                onChange={(event) => setDeltaDb(event.target.value)}
              />
              <p className={HINT_CLASS}>
                Positive is louder, negative is quieter. Range ±{DB_LIMIT} dB.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="dbc-ratio">
                  Ratio (new ÷ old)
                </label>
                <input
                  id="dbc-ratio"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  value={ratio}
                  onChange={(event) => setRatio(event.target.value)}
                />
                <p className={HINT_CLASS}>Must be greater than zero. 2 means double.</p>
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor="dbc-kind">
                  What the ratio describes
                </label>
                <select
                  id="dbc-kind"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={kindId}
                  onChange={(event) => setKindId(event.target.value)}
                >
                  {RATIO_KINDS.map((kind) => (
                    <option key={kind.id} value={kind.id}>
                      {kind.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {mode === "fromDb" ? (
          <div className="mt-4">
            <p className="text-sm font-semibold text-[var(--foreground)]">Common changes</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {REFERENCE_POINTS.map((point) => (
                <button
                  key={point.db}
                  type="button"
                  className={CHIP_BTN}
                  onClick={() => setDeltaDb(String(point.db))}
                  aria-label={`Set the level change to plus ${point.db} decibels`}
                >
                  +{point.db} dB
                </button>
              ))}
              {REFERENCE_POINTS.map((point) => (
                <button
                  key={`minus-${point.db}`}
                  type="button"
                  className={CHIP_BTN}
                  onClick={() => setDeltaDb(String(-point.db))}
                  aria-label={`Set the level change to minus ${point.db} decibels`}
                >
                  −{point.db} dB
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Level change
            </p>
            <p
              className="mt-1 text-4xl font-semibold tabular-nums text-[var(--primary)]"
              aria-live="polite"
              aria-atomic="true"
            >
              {hasError ? DASH : `${DB_FORMAT.format(result.deltaDb)} dB`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : result.perception}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the decibel conversion result"
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite" aria-atomic="true">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            That is {DB_FORMAT.format(result.powerDoublings)} doublings of power, and the
            same change would come from moving {distanceDirection} a point source in free
            field — {MAGNITUDE_FORMAT.format(distanceMagnitude)} doubling
            {distanceMagnitudeIsOne ? "" : "s"} of distance, i.e. ×{formatRatio(result.distanceRatio)}{" "}
            the distance.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Reference points
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[30rem] text-left text-sm">
            <thead className="text-[var(--muted-foreground)]">
              <tr>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Change
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Amplitude
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Power
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Loudness
                </th>
                <th scope="col" className="py-2 font-medium">
                  Why
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {referenceRows.map((row) => (
                <tr key={row.db}>
                  <td className="py-2 pr-3 font-semibold tabular-nums">+{row.db} dB</td>
                  <td className="py-2 pr-3 tabular-nums">
                    ×{formatRatio(row.analysis.amplitudeRatio)}
                  </td>
                  <td className="py-2 pr-3 tabular-nums">
                    ×{formatRatio(row.analysis.powerRatio)}
                  </td>
                  <td className="py-2 pr-3 tabular-nums">
                    ×{formatRatio(row.analysis.loudnessRatio)}
                  </td>
                  <td className="py-2 text-[var(--muted-foreground)]">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Exact figures: doubling the power is {DB_PER_POWER_DOUBLING.toFixed(2)} dB and
        doubling the amplitude — or halving the distance to a point source — is{" "}
        {DB_PER_DISTANCE_DOUBLING.toFixed(2)} dB. The distance figure assumes a point
        source in free field; indoors, reflections make the real drop smaller. The
        loudness column uses the +10 dB ≈ twice as loud rule, which holds for steady
        broadband sound well above the hearing threshold.
      </p>
    </main>
  );
}

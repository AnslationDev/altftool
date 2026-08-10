"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, HardHat, RotateCcw, TriangleAlert } from "lucide-react";

import {
  DUTY_RATINGS,
  FT_PER_M,
  RAIL_EXTENSION_ABOVE_LANDING_FT,
  REACH_ABOVE_STANDING_FT,
  TOP_RUNGS_UNUSABLE,
  computeLadderSetup,
} from "../lib";

const DEFAULTS = {
  supportHeight: "20",
  ladderLength: "24",
  unit: "ft",
  roofAccess: true,
  dutyRatingLb: "250",
  climberKg: "75",
  gearKg: "10",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return String(raw).trim() === "" ? NaN : value;
};

export default function ToolHome() {
  const [supportHeight, setSupportHeight] = useState(DEFAULTS.supportHeight);
  const [ladderLength, setLadderLength] = useState(DEFAULTS.ladderLength);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [roofAccess, setRoofAccess] = useState(DEFAULTS.roofAccess);
  const [dutyRatingLb, setDutyRatingLb] = useState(DEFAULTS.dutyRatingLb);
  const [climberKg, setClimberKg] = useState(DEFAULTS.climberKg);
  const [gearKg, setGearKg] = useState(DEFAULTS.gearKg);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const result = useMemo(
    () =>
      computeLadderSetup({
        supportHeight: toNumber(supportHeight),
        ladderLength: toNumber(ladderLength),
        unit,
        roofAccess,
        dutyRatingLb: toNumber(dutyRatingLb),
        climberKg: toNumber(climberKg),
        gearKg: toNumber(gearKg),
      }),
    [supportHeight, ladderLength, unit, roofAccess, dutyRatingLb, climberKg, gearKg],
  );

  const hasError = Boolean(result.error);
  const len = (value) => (hasError ? DASH : `${NUM2.format(value)} ${unit}`);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Ladder Safety Calculator",
      `Top support height: ${NUM2.format(result.supportHeight)} ${unit}`,
      `Ladder length: ${NUM2.format(result.ladderLength)} ${unit}`,
      `Base distance from wall: ${NUM2.format(result.baseDistance)} ${unit}`,
      `Set-up angle: ${NUM1.format(result.angleDeg)} degrees`,
      `Working length used: ${NUM2.format(result.workingLength)} ${unit}`,
      `Minimum ladder length needed: ${NUM2.format(result.requiredLadderLength)} ${unit}`,
      `Rail above the support point: ${NUM2.format(result.railAboveSupport)} ${unit}`,
      `Highest safe standing level: ${NUM2.format(result.standingHeight)} ${unit}`,
      `Practical reach height: ${NUM2.format(result.reachHeight)} ${unit}`,
      `Load on ladder: ${NUM0.format(result.totalLoadKg)} kg of a ${NUM0.format(result.ratingKg)} kg rating`,
      ...result.warnings.map((w) => `Note: ${w}`),
    ].join("\n");
  }, [hasError, result, unit]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSupportHeight(DEFAULTS.supportHeight);
    setLadderLength(DEFAULTS.ladderLength);
    setUnit(DEFAULTS.unit);
    setRoofAccess(DEFAULTS.roofAccess);
    setDutyRatingLb(DEFAULTS.dutyRatingLb);
    setClimberKg(DEFAULTS.climberKg);
    setGearKg(DEFAULTS.gearKg);
    setCopied(false);
  };

  const convertLength = (raw, fromUnit, toUnit) => {
    const value = toNumber(raw);
    if (!Number.isFinite(value)) return null;
    if (fromUnit === toUnit) return value;
    const converted = fromUnit === "m" ? value * FT_PER_M : value / FT_PER_M;
    return Number(converted.toFixed(2));
  };

  const switchUnit = (next) => {
    if (next === unit) return;
    const convertedSupport = convertLength(supportHeight, unit, next);
    const convertedLadder = convertLength(ladderLength, unit, next);
    setUnit(next);
    setSupportHeight(convertedSupport === null ? (next === "m" ? "6" : "20") : String(convertedSupport));
    setLadderLength(convertedLadder === null ? (next === "m" ? "7.3" : "24") : String(convertedLadder));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <HardHat className="h-4 w-4" aria-hidden="true" />
          Ladder set-up
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Ladder Safety Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out exactly how far the feet go from the wall, whether the ladder is long enough, how
          high you can safely stand and what you can reach — using the OSHA 4-to-1 set-up rule and
          ANSI duty ratings.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">Units</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["ft", "Feet"],
              ["m", "Metres"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => switchUnit(value)}
                aria-pressed={unit === value}
                className={
                  unit === value
                    ? `${PRIMARY_BTN} flex-1 sm:flex-none`
                    : `${GHOST_BTN} flex-1 sm:flex-none`
                }
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ladder-support">
              Height of the top support point ({unit})
            </label>
            <input
              id="ladder-support"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={supportHeight}
              onChange={(event) => setSupportHeight(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Where the rails touch: the eave, sill or landing edge.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ladder-length">
              Ladder length (fully extended) ({unit})
            </label>
            <input
              id="ladder-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={ladderLength}
              onChange={(event) => setLadderLength(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              An extension ladder loses its section overlap — use the extended length, not the sum
              of the sections.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ladder-duty">
              Ladder duty rating
            </label>
            <select
              id="ladder-duty"
              className={`mt-2 ${INPUT_CLASS}`}
              value={dutyRatingLb}
              onChange={(event) => setDutyRatingLb(event.target.value)}
            >
              {DUTY_RATINGS.map((rating) => (
                <option key={rating.code} value={String(rating.lb)}>
                  {rating.label} — {rating.lb} lb
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ladder-climber">
              Climber weight (kg)
            </label>
            <input
              id="ladder-climber"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={climberKg}
              onChange={(event) => setClimberKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ladder-gear">
              Tools and materials carried up (kg)
            </label>
            <input
              id="ladder-gear"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={gearKg}
              onChange={(event) => setGearKg(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="ladder-roof"
            >
              <input
                id="ladder-roof"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={roofAccess}
                onChange={(event) => setRoofAccess(event.target.checked)}
              />
              I step off onto a roof or landing
            </label>
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

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Set the feet this far from the wall
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM2.format(result.baseDistance)} ${unit}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the set-up."
                : `Puts the ladder at ${NUM1.format(result.angleDeg)}° from the ground — the OSHA 4-to-1 angle.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy ladder set-up result"
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
            ["Set-up angle", hasError ? DASH : `${NUM1.format(result.angleDeg)}°`],
            ["Working length along the rails", len(result.workingLength)],
            [
              roofAccess ? "Minimum ladder length (incl. rail above the landing)" : "Minimum ladder length",
              len(result.requiredLadderLength),
            ],
            ["Rail above the support point", len(result.railAboveSupport)],
            ["Highest rung you may stand on", len(result.standingHeight)],
            ["Practical reach height", len(result.reachHeight)],
            [
              "Quick shortcut check (height ÷ 4)",
              hasError ? DASH : `${NUM2.format(result.shortcutBaseDistance)} ${unit}`,
            ],
            [
              "Load on the ladder",
              hasError
                ? DASH
                : `${NUM0.format(result.totalLoadKg)} kg of ${NUM0.format(result.ratingKg)} kg (${NUM0.format(result.loadUsedPct)}%)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-semibold ${
              result.longEnough && result.loadOk
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {result.longEnough && result.loadOk
              ? "Ladder is long enough for this height and inside its duty rating."
              : !result.longEnough
                ? "Ladder is too short for this height at a safe angle."
                : "Ladder is long enough, but the load is over its duty rating."}
          </p>
        )}
      </section>

      {!hasError && result.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <TriangleAlert className="h-4 w-4 text-[var(--warning)]" aria-hidden="true" />
            Before you climb
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning} className="flex gap-2">
                <span aria-hidden="true">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The rules this uses</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Rule</th>
                <th scope="col" className="py-2 font-semibold">What it means</th>
              </tr>
            </thead>
            <tbody className="text-[var(--muted-foreground)]">
              {[
                ["4 to 1", "Base sits one quarter of the working length out from the wall (OSHA 1926.1053)."],
                [
                  `${RAIL_EXTENSION_ABOVE_LANDING_FT} ft above the landing`,
                  "Rails must clear the roof edge by 3 ft when you step off.",
                ],
                [
                  `Top ${TOP_RUNGS_UNUSABLE} rungs`,
                  "Never a standing level on a leaning ladder — 12 in rung spacing means 3 ft of rail.",
                ],
                [
                  `+${REACH_ABOVE_STANDING_FT} ft reach`,
                  "The working height an average adult adds above their own feet.",
                ],
                ["Duty rating", "Covers you, your clothing and everything you carry up — not just body weight."],
              ].map(([rule, meaning]) => (
                <tr key={rule} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold text-[var(--foreground)]">{rule}</td>
                  <td className="py-2">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Ladder standards vary by country and by ladder type, and your employer's
        own rules may be stricter — read the label on the ladder and follow site policy.
      </p>
    </main>
  );
}

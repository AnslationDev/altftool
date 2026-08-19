"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Flame, RotateCcw } from "lucide-react";

import {
  CYLINDER_SIZES,
  GASES,
  NEVER_DO,
  RESPONSE_STEPS,
  WARNING_SIGNS,
  modelGasLeak,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const DASH = "—";

const num1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const num2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);
const num3 = (v) => (Number.isFinite(v) ? NUM3.format(v) : DASH);

const DEFAULTS = {
  gasId: "lpg",
  length: "3",
  width: "3",
  height: "3",
  leak: "500",
  ach: "0.5",
  cylinder: "14.2",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

const formatDuration = (hours) => {
  if (!Number.isFinite(hours)) return DASH;
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 48) return `${NUM1.format(hours)} h`;
  return `${NUM1.format(hours / 24)} days`;
};

export default function ToolHome() {
  const [gasId, setGasId] = useState(DEFAULTS.gasId);
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [leak, setLeak] = useState(DEFAULTS.leak);
  const [ach, setAch] = useState(DEFAULTS.ach);
  const [cylinder, setCylinder] = useState(DEFAULTS.cylinder);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      modelGasLeak({
        gasId,
        lengthM: toNumber(length),
        widthM: toNumber(width),
        heightM: toNumber(height),
        leakGramsPerHour: toNumber(leak),
        airChangesPerHour: toNumber(ach),
        cylinderKg: toNumber(cylinder),
      }),
    [gasId, length, width, height, leak, ach, cylinder],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Gas Leak Safety Check",
      `Gas: ${result.gas.label} (LEL ${num1(result.gas.lel)}%, UEL ${num1(result.gas.uel)}%)`,
      `Room: ${num1(result.roomVolumeM3)} m3, ${num1(result.airChangesPerHour)} air changes/hour`,
      `Leak: ${leak} g/h = ${num1(result.litresPerHour)} litres of vapour an hour`,
      result.reachesLel
        ? `Reaches the lower explosive limit in ${formatDuration(result.hoursToLel)}`
        : `Settles at ${num3(result.steadyStatePct)}% — below the ${num1(result.gas.lel)}% lower explosive limit`,
      `Gas needed to reach the LEL in this room: ${num1(result.massToLelGrams)} g`,
      `A full ${cylinder} kg cylinder would give ${num1(result.cylinderPct)}% in this room`,
      `Detector: ${result.detectorAdvice}`,
      "Emergency: shut the valve, no switches, ventilate, get out, call from outside.",
    ].join("\n");
  }, [failed, result, leak, cylinder]);

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
    setGasId(DEFAULTS.gasId);
    setLength(DEFAULTS.length);
    setWidth(DEFAULTS.width);
    setHeight(DEFAULTS.height);
    setLeak(DEFAULTS.leak);
    setAch(DEFAULTS.ach);
    setCylinder(DEFAULTS.cylinder);
    setCopied(false);
  };

  const headline = failed
    ? DASH
    : result.reachesLel
      ? formatDuration(result.hoursToLel)
      : "Stays safe";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flame className="h-4 w-4" aria-hidden="true" />
          LPG and PNG safety
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Gas Leak Safety Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A gas only burns between its lower and upper explosive limits. This works out how long a
          leak takes to push your room into that range, then gives the detection and shut-down steps
          in the order they have to happen.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gl-gas">
              Which gas
            </label>
            <select
              id="gl-gas"
              className={`mt-2 ${INPUT_CLASS}`}
              value={gasId}
              onChange={(event) => setGasId(event.target.value)}
            >
              {Object.values(GASES).map((gas) => (
                <option key={gas.id} value={gas.id}>
                  {gas.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>{GASES[gasId].note}</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="gl-length">
              Room length (m)
            </label>
            <input
              id="gl-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={length}
              onChange={(event) => setLength(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gl-width">
              Room width (m)
            </label>
            <input
              id="gl-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={width}
              onChange={(event) => setWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gl-height">
              Ceiling height (m)
            </label>
            <input
              id="gl-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gl-ach">
              Air changes per hour
            </label>
            <input
              id="gl-ach"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="30"
              step="0.1"
              value={ach}
              onChange={(event) => setAch(event.target.value)}
            />
            <p className={HINT_CLASS}>
              0 for a shut room, about 0.5 for a normal closed kitchen, 3 or more with a window and
              exhaust fan running.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gl-leak">
              Leak rate (grams per hour)
            </label>
            <input
              id="gl-leak"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={leak}
              onChange={(event) => setLeak(event.target.value)}
            />
            <p className={HINT_CLASS}>
              A domestic burner on full consumes roughly 200 to 300 g/h, so use that as a scale for
              an open knob.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gl-cylinder">
              Cylinder contents (kg)
            </label>
            <input
              id="gl-cylinder"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              list="gl-cyl-sizes"
              value={cylinder}
              onChange={(event) => setCylinder(event.target.value)}
            />
            <datalist id="gl-cyl-sizes">
              {CYLINDER_SIZES.map((size) => (
                <option key={size.label} value={size.kg}>
                  {size.label}
                </option>
              ))}
            </datalist>
            <p className={HINT_CLASS}>Used for the worst case: the whole cylinder into this room.</p>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" aria-atomic="true">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Time to the lower explosive limit
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to model the leak."
                : `${result.gas.short}: flammable between ${num1(result.gas.lel)}% and ${num1(result.gas.uel)}% by volume in air`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy gas leak assessment"
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

        {!failed && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              result.reachesLel
                ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                : "bg-[var(--success-soft)] text-[var(--success)]"
            }`}
          >
            {result.verdict}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Room volume", failed ? DASH : `${num1(result.roomVolumeM3)} m³`],
            ["Vapour released", failed ? DASH : `${num1(result.litresPerHour)} litres per hour`],
            [
              "Steady-state concentration",
              failed || result.steadyStatePct === null
                ? "no ventilation — it keeps rising"
                : `${num3(result.steadyStatePct)} %`,
            ],
            [
              "Gas needed to reach the LEL here",
              failed ? DASH : `${num1(result.massToLelGrams)} g`,
            ],
            [
              "Time to the upper explosive limit",
              failed || result.hoursToUel === null ? DASH : formatDuration(result.hoursToUel),
            ],
            [
              "Vapour from a full cylinder",
              failed ? DASH : `${num2(result.cylinderVapourM3)} m³`,
            ],
            [
              "That cylinder in this room",
              failed ? DASH : `${num1(result.cylinderPct)} % by volume`,
            ],
            [
              "Vapour density vs air",
              failed ? DASH : `${num2(result.gas.relativeDensity)}× (air = 1)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <>
            <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
              {result.cylinderVerdict}
            </p>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--foreground)]">Detector placement: </span>
              {result.detectorAdvice}
            </p>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">If you smell gas, in this order</h2>
        <ol className="mt-3 space-y-3">
          {RESPONSE_STEPS.map((entry, index) => (
            <li
              key={entry.step}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <p className="flex gap-3 text-sm font-semibold">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs text-[var(--primary-foreground)]">
                  {index + 1}
                </span>
                <span>{entry.step}</span>
              </p>
              <p className="mt-1 pl-9 text-xs leading-5 text-[var(--muted-foreground)]">{entry.why}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Never do these</h2>
        <ul className="mt-3 space-y-3">
          {NEVER_DO.map((entry) => (
            <li key={entry.action} className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
              <p className="text-sm font-semibold text-[var(--danger)]">{entry.action}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{entry.why}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Warning signs and what they mean</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Sign
                </th>
                <th scope="col" className="py-2 font-semibold">
                  What it tells you
                </th>
              </tr>
            </thead>
            <tbody>
              {WARNING_SIGNS.map((row) => (
                <tr key={row.sign} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 align-top font-semibold">{row.sign}</td>
                  <td className="py-2 align-top text-[var(--muted-foreground)]">{row.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The build-up model assumes the gas mixes evenly through the room. For LPG that is
        optimistic — a heavier-than-air gas forms a much richer layer at floor level and reaches its
        lower explosive limit there well before the room average does, so treat every time above as
        the longest you could have rather than the time you do have. Informational only: for any
        suspected leak, shut the valve, get out, and call your gas supplier's emergency line from
        outside the building.
      </p>
    </main>
  );
}

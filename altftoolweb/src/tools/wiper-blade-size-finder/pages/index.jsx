"use client";

import { useMemo, useState } from "react";
import { Check, CloudRain, Copy, RotateCcw } from "lucide-react";

import {
  BLADE_STYLES,
  FITTING_TYPES,
  checkWiperPair,
  findBladeSize,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  measuredValue: "600",
  unit: "mm",
  driverMm: "600",
  passengerMm: "450",
  fitting: "hook",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [measuredValue, setMeasuredValue] = useState(DEFAULTS.measuredValue);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [driverMm, setDriverMm] = useState(DEFAULTS.driverMm);
  const [passengerMm, setPassengerMm] = useState(DEFAULTS.passengerMm);
  const [fitting, setFitting] = useState(DEFAULTS.fitting);
  const [copied, setCopied] = useState(false);

  const size = useMemo(
    () => findBladeSize({ measuredValue: toNumber(measuredValue), unit }),
    [measuredValue, unit],
  );

  const pair = useMemo(
    () => checkWiperPair({ driverMm: toNumber(driverMm), passengerMm: toNumber(passengerMm) }),
    [driverMm, passengerMm],
  );

  const selectedFitting = useMemo(
    () => FITTING_TYPES.find((type) => type.id === fitting) || FITTING_TYPES[0],
    [fitting],
  );

  const summary = useMemo(() => {
    if (size.error) return "";
    return [
      "Wiper Blade Size Finder",
      `Measured: ${NUM.format(size.measuredMm)} mm (${NUM.format(size.measuredInch)} in)`,
      `Buy metric size: ${size.nearestMm} mm`,
      `Buy imperial size: ${size.nearestInch} in (${NUM.format(size.nearestInchMm)} mm)`,
      `Arm fitting: ${selectedFitting.label}`,
      !pair.error ? `Pair: driver ${pair.driverMm} mm, passenger ${pair.passengerMm} mm` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [size, pair, selectedFitting]);

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
    setMeasuredValue(DEFAULTS.measuredValue);
    setUnit(DEFAULTS.unit);
    setDriverMm(DEFAULTS.driverMm);
    setPassengerMm(DEFAULTS.passengerMm);
    setFitting(DEFAULTS.fitting);
    setCopied(false);
  };

  const ok = !size.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CloudRain className="h-4 w-4" aria-hidden="true" />
          Car maintenance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Wiper Blade Size Finder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Measure the rubber on the blade you already have, tip to tip, and this converts it to the
          nearest size actually sold — in both millimetres and inches, which do not line up exactly.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wiper-length">
              Measured blade length
            </label>
            <input
              id="wiper-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={measuredValue}
              onChange={(event) => {
                setMeasuredValue(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="wiper-unit">
              Measured in
            </label>
            <select
              id="wiper-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => {
                setUnit(event.target.value);
                setCopied(false);
              }}
            >
              <option value="mm">Millimetres</option>
              <option value="in">Inches</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wiper-fitting">
              Arm fitting type
            </label>
            <select
              id="wiper-fitting"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fitting}
              onChange={(event) => {
                setFitting(event.target.value);
                setCopied(false);
              }}
            >
              {FITTING_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {selectedFitting.identify} {selectedFitting.commonOn}
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="wiper-driver">
              Driver side blade (mm)
            </label>
            <input
              id="wiper-driver"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="200"
              max="1000"
              step="5"
              value={driverMm}
              onChange={(event) => {
                setDriverMm(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="wiper-passenger">
              Passenger side blade (mm)
            </label>
            <input
              id="wiper-passenger"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="200"
              max="1000"
              step="5"
              value={passengerMm}
              onChange={(event) => {
                setPassengerMm(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>
      </section>

      {size.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {size.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Buy this size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${size.nearestMm} mm` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `sold as ${size.nearestInch} in on imperial packaging`
                : "Fix the measurement above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy wiper blade size result"
              className={GHOST_BTN}
              disabled={!ok}
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
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "You measured",
              ok ? `${NUM.format(size.measuredMm)} mm / ${NUM.format(size.measuredInch)} in` : DASH,
            ],
            [
              "Nearest metric size",
              ok
                ? `${size.nearestMm} mm (${size.nearestMmDiff >= 0 ? "+" : ""}${NUM.format(size.nearestMmDiff)} mm)`
                : DASH,
            ],
            [
              "Nearest imperial size",
              ok
                ? `${size.nearestInch} in = ${NUM.format(size.nearestInchMm)} mm (${size.nearestInchDiff >= 0 ? "+" : ""}${NUM.format(size.nearestInchDiff)} mm)`
                : DASH,
            ],
            ["Exact standard size", ok ? (size.isExactMmSize ? "Yes" : "Between sizes") : DASH],
            ["Arm fitting", selectedFitting.label],
            [
              "Driver / passenger difference",
              !pair.error ? `${pair.difference} mm` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Before you buy</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
            {size.advice.map((line) => (
              <li key={line}>{line}</li>
            ))}
            {!pair.error ? pair.notes.map((line) => <li key={line}>{line}</li>) : null}
          </ul>
          {pair.error ? (
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">{pair.error}</p>
          ) : null}
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Blade construction</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Type
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Good for
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Trade-off
                </th>
              </tr>
            </thead>
            <tbody>
              {BLADE_STYLES.map((style) => (
                <tr key={style.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{style.label}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{style.pros}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{style.cons}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational guide. Measure the rubber itself, not the arm, and confirm against your
        owner&apos;s manual or the parts catalogue before ordering.
      </p>
    </main>
  );
}

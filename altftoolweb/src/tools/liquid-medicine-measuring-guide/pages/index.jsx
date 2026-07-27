"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Info, RotateCcw, Syringe } from "lucide-react";

import {
  CONCENTRATION_UNITS,
  HOUSEHOLD_TEASPOON_RANGE,
  ORAL_SYRINGES,
  TABLESPOON_ML,
  TEASPOON_ML,
  planLiquidDose,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const DASH = "—";

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";

const DEFAULTS = {
  mode: "mg",
  doseMg: "250",
  volumeMl: "5",
  concentrationValue: "250",
  concentrationUnit: "per5ml",
  dosesPerDay: "3",
  bottleMl: "60",
  weightKg: "12",
};

const toNum = (raw) => {
  const text = String(raw ?? "").trim();
  if (text === "") return NaN;
  const value = Number(text.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [doseMg, setDoseMg] = useState(DEFAULTS.doseMg);
  const [volumeMl, setVolumeMl] = useState(DEFAULTS.volumeMl);
  const [concentrationValue, setConcentrationValue] = useState(DEFAULTS.concentrationValue);
  const [concentrationUnit, setConcentrationUnit] = useState(DEFAULTS.concentrationUnit);
  const [dosesPerDay, setDosesPerDay] = useState(DEFAULTS.dosesPerDay);
  const [bottleMl, setBottleMl] = useState(DEFAULTS.bottleMl);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planLiquidDose({
        doseMg: mode === "mg" ? toNum(doseMg) : undefined,
        volumeMlDirect: mode === "ml" ? toNum(volumeMl) : undefined,
        concentrationValue: toNum(concentrationValue),
        concentrationUnit,
        dosesPerDay: toNum(dosesPerDay),
        bottleMl: toNum(bottleMl),
        weightKg: toNum(weightKg),
      }),
    [mode, doseMg, volumeMl, concentrationValue, concentrationUnit, dosesPerDay, bottleMl, weightKg],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Liquid medicine dose",
      `Strength: ${result.mgPerMl} mg per mL`,
      `Prescribed: ${result.prescribedMg} mg`,
      `Measure: ${result.measuredMl} mL using a ${result.syringe.label}`,
      `That delivers ${result.deliveredMg} mg (${result.accuracyPct >= 0 ? "+" : ""}${result.accuracyPct}% vs prescribed)`,
      `Equivalent to ${result.teaspoons} medicine teaspoons of ${TEASPOON_ML} mL — measure with a syringe, not a spoon`,
    ];
    if (result.perDay) {
      lines.push(`Per day: ${result.perDay.doses} doses = ${result.perDay.volumeMl} mL = ${result.perDay.mg} mg`);
    }
    if (result.supply?.daysOfSupply !== null && result.supply) {
      lines.push(`Bottle: ${result.supply.bottleMl} mL = ${result.supply.dosesInBottle} doses (${result.supply.daysOfSupply} days)`);
    }
    return lines.join("\n");
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
    setMode(DEFAULTS.mode);
    setDoseMg(DEFAULTS.doseMg);
    setVolumeMl(DEFAULTS.volumeMl);
    setConcentrationValue(DEFAULTS.concentrationValue);
    setConcentrationUnit(DEFAULTS.concentrationUnit);
    setDosesPerDay(DEFAULTS.dosesPerDay);
    setBottleMl(DEFAULTS.bottleMl);
    setWeightKg(DEFAULTS.weightKg);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Syringe className="h-4 w-4" aria-hidden="true" />
          Medication timing
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Liquid Medicine Measuring Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the dose the prescription asks for and the strength printed on the bottle. You get
          the volume in millilitres, the right oral syringe, the exact marking to fill to and how
          much the rounding changes the dose.
        </p>
      </header>

      <section className={CARD}>
        <fieldset>
          <legend className={LABEL}>The prescription says the dose in</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {[
              ["mg", "Milligrams (mg)"],
              ["ml", "Millilitres (mL)"],
            ].map(([key, label]) => {
              const active = key === mode;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setMode(key);
                    setCopied(false);
                  }}
                  className={`min-h-11 rounded-md border px-3 py-2 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {mode === "mg" ? (
            <div>
              <label className={LABEL} htmlFor="liq-dose">
                Prescribed dose (mg)
              </label>
              <input
                id="liq-dose"
                className={INPUT}
                type="number"
                inputMode="decimal"
                min="0"
                step="5"
                value={doseMg}
                onChange={(event) => {
                  setDoseMg(event.target.value);
                  setCopied(false);
                }}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL} htmlFor="liq-volume">
                Prescribed dose (mL)
              </label>
              <input
                id="liq-volume"
                className={INPUT}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={volumeMl}
                onChange={(event) => {
                  setVolumeMl(event.target.value);
                  setCopied(false);
                }}
              />
            </div>
          )}

          <div>
            <label className={LABEL} htmlFor="liq-strength">
              Strength on the bottle
            </label>
            <input
              id="liq-strength"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={concentrationValue}
              onChange={(event) => {
                setConcentrationValue(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="liq-unit">
              Strength is written as
            </label>
            <select
              id="liq-unit"
              className={INPUT}
              value={concentrationUnit}
              onChange={(event) => {
                setConcentrationUnit(event.target.value);
                setCopied(false);
              }}
            >
              {Object.values(CONCENTRATION_UNITS).map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL} htmlFor="liq-freq">
              Doses per day
            </label>
            <input
              id="liq-freq"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="1"
              max="6"
              step="1"
              value={dosesPerDay}
              onChange={(event) => {
                setDosesPerDay(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="liq-bottle">
              Bottle size (mL, optional)
            </label>
            <input
              id="liq-bottle"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={bottleMl}
              onChange={(event) => {
                setBottleMl(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="liq-weight">
              Body weight (kg, optional)
            </label>
            <input
              id="liq-weight"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={weightKg}
              onChange={(event) => {
                setWeightKg(event.target.value);
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
          {result.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Fill the syringe to
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM2.format(result.measuredMl)} mL`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the volume."
                : `${result.syringe.label} · markings every ${result.syringe.stepMl} mL${
                    result.singleDraw ? "" : ` · ${result.drawCount} draws`
                  }`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the measuring instructions"
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
            ["Concentration", hasError ? DASH : `${NUM3.format(result.mgPerMl)} mg per mL`],
            ["Exact dose volume", hasError ? DASH : `${NUM3.format(result.volumeMl)} mL`],
            ["Prescribed amount", hasError ? DASH : `${NUM2.format(result.prescribedMg)} mg`],
            [
              "Actually delivered at that marking",
              hasError
                ? DASH
                : `${NUM2.format(result.deliveredMg)} mg (${result.accuracyPct >= 0 ? "+" : ""}${NUM2.format(result.accuracyPct)}%)`,
            ],
            [
              "Syringe fill",
              hasError || !result.singleDraw ? DASH : `${result.fillPercent}% of the barrel`,
            ],
            [
              `Medicine teaspoons (${TEASPOON_ML} mL each)`,
              hasError ? DASH : NUM2.format(result.teaspoons),
            ],
            [
              `Tablespoons (${TABLESPOON_ML} mL each)`,
              hasError ? DASH : NUM2.format(result.tablespoons),
            ],
            [
              "Per day",
              hasError || !result.perDay
                ? DASH
                : `${result.perDay.doses} doses = ${NUM2.format(result.perDay.volumeMl)} mL = ${NUM2.format(result.perDay.mg)} mg`,
            ],
            [
              "Doses in the bottle",
              hasError || !result.supply
                ? DASH
                : `${result.supply.dosesInBottle}${
                    result.supply.daysOfSupply === null ? "" : ` (${result.supply.daysOfSupply} days)`
                  }`,
            ],
            [
              "Dose per kilogram",
              hasError || !result.perKg
                ? DASH
                : `${NUM2.format(result.perKg.perDoseMgPerKg)} mg/kg per dose${
                    result.perKg.perDayMgPerKg === null
                      ? ""
                      : `, ${NUM2.format(result.perKg.perDayMgPerKg)} mg/kg per day`
                  }`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.notes.length > 0 ? (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Before you measure</h2>
          <ul className="mt-3 space-y-2">
            {result.notes.map((note) => (
              <li key={note} className="flex gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                <Info className="mt-1 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Syringe sizes this guide uses</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Syringe
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Smallest marking
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Best for doses of
                </th>
              </tr>
            </thead>
            <tbody>
              {ORAL_SYRINGES.map((syringe) => (
                <tr key={syringe.capacityMl} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{syringe.label}</td>
                  <td className="py-2 pr-3 text-right">{syringe.stepMl} mL</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    up to {syringe.capacityMl} mL
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Graduations vary between brands — read the barrel of the syringe that came with your
          medicine before drawing up.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice, and no substitute for the label on your bottle. Dose
        oral liquids in millilitres with the syringe or cup supplied — household teaspoons have been
        measured from {HOUSEHOLD_TEASPOON_RANGE.min} mL to {HOUSEHOLD_TEASPOON_RANGE.max} mL against
        the {TEASPOON_ML} mL a medicine spoon means. Shake suspensions before drawing up, and check
        the dose with your pharmacist if the prescription and the bottle strength do not match.
      </p>
    </main>
  );
}

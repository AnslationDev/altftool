"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Flame, RotateCcw } from "lucide-react";
import {
  BODY_MASS_LOSS_CAUTION_PCT,
  SAUNA_TYPES,
  computeSaunaFluidLoss,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  mode: "estimate",
  weight: "80",
  height: "178",
  saunaType: "finnish",
  temp: "85",
  rh: "15",
  minutes: "15",
  rounds: "3",
  postWeight: "78.9",
  drank: "300",
  urine: "100",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [saunaType, setSaunaType] = useState(DEFAULTS.saunaType);
  const [temp, setTemp] = useState(DEFAULTS.temp);
  const [rh, setRh] = useState(DEFAULTS.rh);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [rounds, setRounds] = useState(DEFAULTS.rounds);
  const [postWeight, setPostWeight] = useState(DEFAULTS.postWeight);
  const [drank, setDrank] = useState(DEFAULTS.drank);
  const [urine, setUrine] = useState(DEFAULTS.urine);
  const [copied, setCopied] = useState(false);

  const num = (value) => (value === "" ? NaN : Number(value));

  const applyPreset = (id) => {
    setSaunaType(id);
    const preset = SAUNA_TYPES.find((item) => item.id === id);
    if (preset) {
      setTemp(String(preset.tempC));
      setRh(String(preset.rh));
    }
  };

  const result = useMemo(
    () =>
      computeSaunaFluidLoss({
        mode,
        weightKg: num(weight),
        heightCm: num(height),
        tempC: num(temp),
        rhPct: num(rh),
        minutesPerRound: num(minutes),
        rounds: num(rounds),
        postWeightKg: num(postWeight),
        drankMl: num(drank),
        urineMl: num(urine),
      }),
    [mode, weight, height, temp, rh, minutes, rounds, postWeight, drank, urine],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Sauna Fluid Loss Estimator",
      `Mode: ${result.mode === "measured" ? "measured from weight change" : "estimated from conditions"}`,
      `Session: ${rounds} × ${minutes} min (${result.totalMinutes} min total)`,
      `Sweat lost: ${NUM.format(result.sweatMl)} ml (${result.sweatL} L)`,
      `Sweat rate: ${result.sweatRatePerHourL} L per hour`,
      `Body mass lost: ${result.bodyMassLossPct}%`,
      `Drink back: ${NUM.format(result.replacementMinMl)}–${NUM.format(result.replacementMaxMl)} ml`,
      `Sodium lost: ${NUM.format(result.sodiumLossMg)} mg`,
    ].join("\n");
  }, [hasError, result, rounds, minutes]);

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
    setWeight(DEFAULTS.weight);
    setHeight(DEFAULTS.height);
    setSaunaType(DEFAULTS.saunaType);
    setTemp(DEFAULTS.temp);
    setRh(DEFAULTS.rh);
    setMinutes(DEFAULTS.minutes);
    setRounds(DEFAULTS.rounds);
    setPostWeight(DEFAULTS.postWeight);
    setDrank(DEFAULTS.drank);
    setUrine(DEFAULTS.urine);
    setCopied(false);
  };

  const rows = [
    ["Total time in the heat", hasError ? DASH : `${result.totalMinutes} minutes`],
    ["Sweat rate", hasError ? DASH : `${result.sweatRatePerHourL} L per hour`],
    ["Body mass lost", hasError ? DASH : `${result.bodyMassLossPct}%`],
    [
      "Drink back afterwards (125-150%)",
      hasError
        ? DASH
        : `${NUM.format(result.replacementMinMl)}–${NUM.format(result.replacementMaxMl)} ml`,
    ],
    ["Sodium lost in sweat", hasError ? DASH : `${NUM.format(result.sodiumLossMg)} mg`],
    ...(hasError || result.mode !== "measured"
      ? [["Body surface area", hasError ? DASH : `${result.bsa} m²`]]
      : [
          ["Body mass change on the scale", `${NUM.format(result.massLossMl)} ml equivalent`],
          ["Fluid drunk during the session", `${NUM.format(result.drankMl)} ml`],
          ["Urine passed during the session", `${NUM.format(result.urineMl)} ml`],
        ]),
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flame className="h-4 w-4" aria-hidden="true" />
          Sauna hydration
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Sauna Fluid Loss Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Weighing yourself before and after is the accurate way to know what a session cost you —
          one kilogram of body mass is one litre of water. If you did not weigh in, the estimate mode
          models sweat rate from how far the room sits above skin temperature.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            How do you want to work it out?
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              ["estimate", "Estimate from the room conditions"],
              ["measured", "Measured from my weight change"],
            ].map(([value, label]) => (
              <label
                key={value}
                htmlFor={`sfl-mode-${value}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              >
                <input
                  id={`sfl-mode-${value}`}
                  type="radio"
                  name="sfl-mode"
                  className="h-4 w-4 accent-[var(--primary)]"
                  value={value}
                  checked={mode === value}
                  onChange={(event) => setMode(event.target.value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sfl-weight">
              {mode === "measured" ? "Weight before (kg)" : "Body weight (kg)"}
            </label>
            <input
              id="sfl-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.1"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>

          {mode === "measured" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="sfl-post">
                  Weight after (kg)
                </label>
                <input
                  id="sfl-post"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="0.1"
                  value={postWeight}
                  onChange={(event) => setPostWeight(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="sfl-drank">
                  Fluid drunk during (ml)
                </label>
                <input
                  id="sfl-drank"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="50"
                  value={drank}
                  onChange={(event) => setDrank(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="sfl-urine">
                  Urine passed during (ml)
                </label>
                <input
                  id="sfl-urine"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="50"
                  value={urine}
                  onChange={(event) => setUrine(event.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="sfl-height">
                  Height (cm)
                </label>
                <input
                  id="sfl-height"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="50"
                  max="250"
                  step="1"
                  value={height}
                  onChange={(event) => setHeight(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="sfl-type">
                  Sauna type
                </label>
                <select
                  id="sfl-type"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={saunaType}
                  onChange={(event) => applyPreset(event.target.value)}
                >
                  {SAUNA_TYPES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="sfl-temp">
                  Room temperature (°C)
                </label>
                <input
                  id="sfl-temp"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="20"
                  max="120"
                  step="1"
                  value={temp}
                  onChange={(event) => setTemp(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="sfl-rh">
                  Room humidity (%)
                </label>
                <input
                  id="sfl-rh"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="5"
                  value={rh}
                  onChange={(event) => setRh(event.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="sfl-minutes">
              Minutes per round
            </label>
            <input
              id="sfl-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="60"
              step="1"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sfl-rounds">
              Number of rounds
            </label>
            <input
              id="sfl-rounds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="10"
              step="1"
              value={rounds}
              onChange={(event) => setRounds(event.target.value)}
            />
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Sweat lost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.sweatL} L`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a figure."
                : `${NUM.format(result.sweatMl)} ml — drink back ${NUM.format(result.replacementMinMl)}–${NUM.format(result.replacementMaxMl)} ml over the next few hours`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy sauna fluid loss result"
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

        {!hasError && result.cautionLoss && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            You lost {result.bodyMassLossPct}% of body mass — past the{" "}
            {BODY_MASS_LOSS_CAUTION_PCT}% mark where thermoregulation and concentration measurably
            decline. {result.highLoss ? "Above 4% is a genuine dehydration risk. " : ""}Rehydrate
            before another round, and shorten the sessions.
          </p>
        )}

        {!hasError && result.needsElectrolytes && !result.cautionLoss && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            Over a litre of sweat means roughly a gram of sodium gone with it. Include a salty snack
            or an electrolyte drink rather than replacing it all with plain water.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate, not medical advice. Sweat rates vary widely between individuals, and
        the estimate mode is a model rather than a measurement — weigh in and out if you want a real
        number. Sauna use is not recommended with unstable heart disease, low blood pressure, during
        pregnancy without medical clearance, or after drinking alcohol.
      </p>
    </main>
  );
}

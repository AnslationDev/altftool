"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, RotateCcw } from "lucide-react";
import {
  DEHYDRATION_SIGNS,
  MEDICATION_FLAGS,
  MIN_DAILY_ML,
  ML_PER_KG,
  computeSeniorHydration,
} from "../lib";

const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DEC = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const DEFAULTS = {
  weight: "65",
  sex: "female",
  temp: "37",
  hot: false,
  minutes: "0",
  restriction: "",
  intake: "800",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [temp, setTemp] = useState(DEFAULTS.temp);
  const [hot, setHot] = useState(DEFAULTS.hot);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [restriction, setRestriction] = useState(DEFAULTS.restriction);
  const [intake, setIntake] = useState(DEFAULTS.intake);
  const [medications, setMedications] = useState([]);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeSeniorHydration({
        weightKg: weight === "" ? NaN : Number(weight),
        sex,
        temperatureC: temp === "" ? 37 : Number(temp),
        hotWeather: hot,
        activityMinutes: minutes === "" ? 0 : Number(minutes),
        restrictionMl: restriction === "" ? null : Number(restriction),
        medications,
        intakeSoFarMl: intake === "" ? 0 : Number(intake),
      }),
    [weight, sex, temp, hot, minutes, restriction, medications, intake],
  );

  const hasError = Boolean(result.error);
  const barWidth = hasError ? 0 : Math.min(100, result.percentDone);

  const toggleMedication = (key) => {
    setMedications((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Senior Hydration Target Calculator",
      `Weight: ${DEC.format(result.weightKg)} kg`,
      `Baseline (${ML_PER_KG} mL/kg, minimum ${INT.format(MIN_DAILY_ML)} mL): ${INT.format(result.baselineMl)} mL`,
      result.feverMl > 0 ? `Fever uplift (+${DEC.format(result.degreesOverNormal)} °C): ${INT.format(result.feverMl)} mL` : "",
      result.heatMl > 0 ? `Hot weather: ${INT.format(result.heatMl)} mL` : "",
      result.activityMl > 0 ? `Activity: ${INT.format(result.activityMl)} mL` : "",
      result.restrictionMl !== null ? `Prescribed restriction: ${INT.format(result.restrictionMl)} mL (used instead)` : "",
      "",
      `Daily target: ${INT.format(result.targetMl)} mL`,
      `Taken so far: ${INT.format(result.intakeMl)} mL (${result.percentDone}%)`,
      `Still to drink: ${INT.format(result.remainingMl)} mL`,
      `EFSA adequate intake from drinks for ${result.sex === "male" ? "men" : "women"}: ${INT.format(result.efsaDrinksMl)} mL`,
      "",
      "In servings:",
      ...result.servings.map((row) => `- ${row.label}: ${row.perDay} a day, ${row.remaining} still to go`),
      ...(result.notes.length > 0 ? ["", "Notes:", ...result.notes.map((note) => `- ${note}`)] : []),
      ...(result.medicationNotes.length > 0
        ? ["", "Medication cautions:", ...result.medicationNotes.map((row) => `- ${row.label}: ${row.note}`)]
        : []),
    ]
      .filter(Boolean)
      .join("\n");
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
    setWeight(DEFAULTS.weight);
    setSex(DEFAULTS.sex);
    setTemp(DEFAULTS.temp);
    setHot(DEFAULTS.hot);
    setMinutes(DEFAULTS.minutes);
    setRestriction(DEFAULTS.restriction);
    setIntake(DEFAULTS.intake);
    setMedications([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Senior health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Senior Hydration Target Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Thirst blunts with age, so older adults often drink too little without noticing. This
          calculator sets a daily fluid target from body weight, adds for fever, heat and activity,
          and flags the medicines that change fluid balance.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="shy-weight">
              Body weight (kg)
            </label>
            <input
              id="shy-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="25"
              max="250"
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shy-sex">
              Sex (for the EFSA comparison)
            </label>
            <select id="shy-sex" className={`mt-2 ${INPUT_CLASS}`} value={sex} onChange={(event) => setSex(event.target.value)}>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shy-temp">
              Body temperature (°C)
            </label>
            <input
              id="shy-temp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="30"
              max="45"
              step="0.1"
              value={temp}
              onChange={(event) => setTemp(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shy-minutes">
              Sustained activity today (minutes)
            </label>
            <input
              id="shy-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="600"
              step="5"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shy-intake">
              Fluid taken so far today (mL)
            </label>
            <input
              id="shy-intake"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="50"
              value={intake}
              onChange={(event) => setIntake(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shy-restriction">
              Doctor-set fluid restriction (mL, optional)
            </label>
            <input
              id="shy-restriction"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="5000"
              step="50"
              placeholder="Leave blank if none"
              value={restriction}
              onChange={(event) => setRestriction(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              htmlFor="shy-hot"
            >
              <input
                id="shy-hot"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={hot}
                onChange={(event) => setHot(event.target.checked)}
              />
              Hot day or heatwave
            </label>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Medicines and conditions that affect fluid balance</legend>
          <div className="mt-2 grid gap-2">
            {MEDICATION_FLAGS.map((row) => (
              <label
                key={row.key}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                htmlFor={`shy-med-${row.key}`}
              >
                <input
                  id={`shy-med-${row.key}`}
                  type="checkbox"
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={medications.includes(row.key)}
                  onChange={() => toggleMedication(row.key)}
                />
                <span>{row.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
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
              Daily fluid target
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${INT.format(result.targetMl)} mL`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${INT.format(result.remainingMl)} mL still to drink today · ${result.percentDone}% done`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the hydration target"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy target"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={hasError ? "Progress unavailable" : `${result.percentDone} percent of today's fluid target taken`}
          >
            <span className="block h-full bg-[var(--primary)]" style={{ width: `${barWidth}%` }} />
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              `Baseline (${ML_PER_KG} mL per kg)`,
              hasError ? DASH : `${INT.format(result.baselineMl)} mL`,
            ],
            ["Fever adjustment", hasError ? DASH : `${INT.format(result.feverMl)} mL`],
            ["Hot weather adjustment", hasError ? DASH : `${INT.format(result.heatMl)} mL`],
            ["Activity adjustment", hasError ? DASH : `${INT.format(result.activityMl)} mL`],
            [
              "Calculated target before any restriction",
              hasError ? DASH : `${INT.format(result.adjustedTargetMl)} mL`,
            ],
            [
              "Prescribed restriction",
              hasError ? DASH : result.restrictionMl === null ? "None entered" : `${INT.format(result.restrictionMl)} mL`,
            ],
            [
              `EFSA adequate intake from drinks (${hasError ? "" : result.sex === "male" ? "men" : "women"})`,
              hasError ? DASH : `${INT.format(result.efsaDrinksMl)} mL`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.notes.length > 0 && (
        <section className="mt-6 space-y-2" aria-label="Target notes">
          {result.notes.map((note) => (
            <p key={note} role="status" className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
              {note}
            </p>
          ))}
        </section>
      )}

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">In everyday servings</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Serving</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Per day</th>
                    <th scope="col" className="py-2 text-right font-semibold">Still to go</th>
                  </tr>
                </thead>
                <tbody>
                  {result.servings.map((row) => (
                    <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-medium">{row.label}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{row.perDay}</td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]">{row.remaining}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {result.medicationNotes.length > 0 && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Medication cautions to raise with the prescriber</h2>
              <ul className="mt-3 space-y-3">
                {result.medicationNotes.map((row) => (
                  <li key={row.key} className="rounded-lg border border-[var(--border)] p-3">
                    <p className="text-sm font-semibold">{row.label}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{row.note}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Signs intake is falling short</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {DEHYDRATION_SIGNS.map((sign) => (
                <li key={sign} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate, not medical advice. Anyone with heart failure, kidney disease, liver
        disease or low blood sodium must follow the fluid target their clinician sets, which may be
        far below this figure. New confusion, drowsiness or reduced urine output in an older adult
        needs medical assessment the same day.
      </p>
    </main>
  );
}

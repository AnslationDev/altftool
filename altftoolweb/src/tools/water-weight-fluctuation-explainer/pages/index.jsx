"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, RotateCcw } from "lucide-react";

import { CYCLE_PHASES, explainFluctuation, saltGramsToSodiumMg } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);
const int = (value) => (Number.isFinite(value) ? INT.format(value) : DASH);
const signed = (value) => (Number.isFinite(value) ? `${value > 0 ? "+" : ""}${NUM.format(value)}` : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium";

const DEFAULTS = {
  bodyWeight: "75",
  sodium: "4000",
  usualSodium: "2300",
  carbs: "400",
  usualCarbs: "200",
  drinks: "3",
  drinkStandard: "us",
  hardTraining: true,
  longTravel: false,
  creatine: "none",
  largeFoodVolume: false,
  underHydrated: false,
  cycleKey: "none",
  scaleChange: "1.8",
};

export default function ToolHome() {
  const [bodyWeight, setBodyWeight] = useState(DEFAULTS.bodyWeight);
  const [sodium, setSodium] = useState(DEFAULTS.sodium);
  const [usualSodium, setUsualSodium] = useState(DEFAULTS.usualSodium);
  const [carbs, setCarbs] = useState(DEFAULTS.carbs);
  const [usualCarbs, setUsualCarbs] = useState(DEFAULTS.usualCarbs);
  const [drinks, setDrinks] = useState(DEFAULTS.drinks);
  const [drinkStandard, setDrinkStandard] = useState(DEFAULTS.drinkStandard);
  const [hardTraining, setHardTraining] = useState(DEFAULTS.hardTraining);
  const [longTravel, setLongTravel] = useState(DEFAULTS.longTravel);
  const [creatine, setCreatine] = useState(DEFAULTS.creatine);
  const [largeFoodVolume, setLargeFoodVolume] = useState(DEFAULTS.largeFoodVolume);
  const [underHydrated, setUnderHydrated] = useState(DEFAULTS.underHydrated);
  const [cycleKey, setCycleKey] = useState(DEFAULTS.cycleKey);
  const [scaleChange, setScaleChange] = useState(DEFAULTS.scaleChange);
  const [copied, setCopied] = useState(false);

  const bind = (setter) => (event) => {
    setter(event.target.value);
    setCopied(false);
  };
  const bindCheck = (setter) => (event) => {
    setter(event.target.checked);
    setCopied(false);
  };

  const result = useMemo(
    () =>
      explainFluctuation({
        bodyWeightKg: Number(bodyWeight),
        sodiumMg: Number(sodium),
        usualSodiumMg: Number(usualSodium),
        carbG: Number(carbs),
        usualCarbG: Number(usualCarbs),
        drinks: Number(drinks),
        drinkStandard,
        hardTraining,
        longTravel,
        creatine,
        largeFoodVolume,
        underHydrated,
        cycleKey,
        scaleChangeKg: scaleChange === "" ? null : Number(scaleChange),
      }),
    [
      bodyWeight,
      sodium,
      usualSodium,
      carbs,
      usualCarbs,
      drinks,
      drinkStandard,
      hardTraining,
      longTravel,
      creatine,
      largeFoodVolume,
      underHydrated,
      cycleKey,
      scaleChange,
    ],
  );

  const failed = Boolean(result.error);

  const reset = () => {
    setBodyWeight(DEFAULTS.bodyWeight);
    setSodium(DEFAULTS.sodium);
    setUsualSodium(DEFAULTS.usualSodium);
    setCarbs(DEFAULTS.carbs);
    setUsualCarbs(DEFAULTS.usualCarbs);
    setDrinks(DEFAULTS.drinks);
    setDrinkStandard(DEFAULTS.drinkStandard);
    setHardTraining(DEFAULTS.hardTraining);
    setLongTravel(DEFAULTS.longTravel);
    setCreatine(DEFAULTS.creatine);
    setLargeFoodVolume(DEFAULTS.largeFoodVolume);
    setUnderHydrated(DEFAULTS.underHydrated);
    setCycleKey(DEFAULTS.cycleKey);
    setScaleChange(DEFAULTS.scaleChange);
    setCopied(false);
  };

  const clipboardText = useMemo(() => {
    if (failed) return "";
    const lines = [
      "Water Weight Fluctuation Explainer",
      `Estimated fluid swing: ${signed(result.netKg)} kg (${signed(result.netPercentOfBodyWeight)}% of body weight)`,
      `Fat-equivalent energy imbalance for the same number: ${int(result.fatEquivalentKcal)} kcal`,
      "",
      "Drivers:",
      ...result.drivers.map((d) => `- ${d.label}: ${signed(d.kg)} kg — ${d.detail} (clears in ${d.clearsIn})`),
    ];
    if (result.reconciliation) {
      lines.push(
        "",
        `Scale actually moved: ${signed(result.reconciliation.observedKg)} kg`,
        `Explained by the drivers above: ${signed(result.reconciliation.explainedKg)} kg`,
        `Unexplained remainder: ${signed(result.reconciliation.unexplainedKg)} kg`,
      );
    }
    return lines.join("\n");
  }, [failed, result]);

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

  const saltEquivalent = saltGramsToSodiumMg(5);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Body composition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Water Weight Fluctuation Explainer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Log what you actually did yesterday and this breaks the scale swing into its physical
          causes: isotonic fluid carried with extra sodium, water bound to new glycogen, alcohol
          diuresis, training inflammation, cycle phase and travel. It then shows the calorie
          imbalance the same number would need if it really were fat.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ww-weight">
              Body weight (kg)
            </label>
            <input id="ww-weight" type="number" inputMode="decimal" min="30" max="400" step="0.1" className={`mt-2 ${INPUT_CLASS}`} value={bodyWeight} onChange={bind(setBodyWeight)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ww-scale">
              Scale change this morning (kg, optional)
            </label>
            <input id="ww-scale" type="number" inputMode="decimal" step="0.1" className={`mt-2 ${INPUT_CLASS}`} value={scaleChange} onChange={bind(setScaleChange)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ww-sodium">
              Sodium yesterday (mg)
            </label>
            <input id="ww-sodium" type="number" inputMode="numeric" min="0" max="20000" step="100" className={`mt-2 ${INPUT_CLASS}`} value={sodium} onChange={bind(setSodium)} />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">5 g of table salt is about {int(saltEquivalent)} mg of sodium.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ww-usual-sodium">
              Your usual sodium (mg)
            </label>
            <input id="ww-usual-sodium" type="number" inputMode="numeric" min="0" max="20000" step="100" className={`mt-2 ${INPUT_CLASS}`} value={usualSodium} onChange={bind(setUsualSodium)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ww-carbs">
              Carbohydrate yesterday (g)
            </label>
            <input id="ww-carbs" type="number" inputMode="numeric" min="0" max="1500" step="10" className={`mt-2 ${INPUT_CLASS}`} value={carbs} onChange={bind(setCarbs)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ww-usual-carbs">
              Your usual carbohydrate (g)
            </label>
            <input id="ww-usual-carbs" type="number" inputMode="numeric" min="0" max="1500" step="10" className={`mt-2 ${INPUT_CLASS}`} value={usualCarbs} onChange={bind(setUsualCarbs)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ww-drinks">
              Alcoholic drinks
            </label>
            <input id="ww-drinks" type="number" inputMode="decimal" min="0" max="30" step="0.5" className={`mt-2 ${INPUT_CLASS}`} value={drinks} onChange={bind(setDrinks)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ww-standard">
              Drink standard
            </label>
            <select id="ww-standard" className={`mt-2 ${INPUT_CLASS}`} value={drinkStandard} onChange={bind(setDrinkStandard)}>
              <option value="us">US standard drink (14 g ethanol)</option>
              <option value="uk">UK unit (8 g ethanol)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ww-creatine">
              Creatine
            </label>
            <select id="ww-creatine" className={`mt-2 ${INPUT_CLASS}`} value={creatine} onChange={bind(setCreatine)}>
              <option value="none">Not taking creatine</option>
              <option value="loading">Loading phase (about 20 g/day)</option>
              <option value="maintenance">Maintenance (3-5 g/day)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ww-cycle">
              Menstrual cycle phase
            </label>
            <select id="ww-cycle" className={`mt-2 ${INPUT_CLASS}`} value={cycleKey} onChange={bind(setCycleKey)}>
              {CYCLE_PHASES.map((phase) => (
                <option key={phase.key} value={phase.key}>
                  {phase.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Anything else yesterday?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className={CHECK_ROW} htmlFor="ww-training">
              <input id="ww-training" type="checkbox" className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]" checked={hardTraining} onChange={bindCheck(setHardTraining)} />
              Hard or unfamiliar training session
            </label>
            <label className={CHECK_ROW} htmlFor="ww-travel">
              <input id="ww-travel" type="checkbox" className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]" checked={longTravel} onChange={bindCheck(setLongTravel)} />
              Long flight or a full day seated
            </label>
            <label className={CHECK_ROW} htmlFor="ww-food">
              <input id="ww-food" type="checkbox" className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]" checked={largeFoodVolume} onChange={bindCheck(setLargeFoodVolume)} />
              Very large food volume / no bowel movement
            </label>
            <label className={CHECK_ROW} htmlFor="ww-hydration">
              <input id="ww-hydration" type="checkbox" className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]" checked={underHydrated} onChange={bindCheck(setUnderHydrated)} />
              Sauna, heat or a low-fluid day
            </label>
          </div>
        </fieldset>
      </section>

      {failed && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated fluid swing
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${signed(result.netKg)} kg`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to see the breakdown."
                : `${signed(result.netPercentOfBodyWeight)}% of body weight — the same number as fat would need ${int(result.fatEquivalentKcal)} kcal of energy imbalance`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the water weight breakdown" disabled={failed} className={`${GHOST_BTN} disabled:opacity-40`}>
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
            ["Fluid added", failed ? DASH : `${signed(result.gainKg)} kg`],
            ["Fluid lost", failed ? DASH : `${signed(result.lossKg)} kg`],
            ["Net swing", failed ? DASH : `${signed(result.netKg)} kg`],
            [
              "Scale actually moved",
              failed || !result.reconciliation ? DASH : `${signed(result.reconciliation.observedKg)} kg`,
            ],
            [
              "Unexplained remainder",
              failed || !result.reconciliation ? DASH : `${signed(result.reconciliation.unexplainedKg)} kg`,
            ],
            ["Glycogen storage capacity", failed ? DASH : `about ${int(result.glycogenCapacityG)} g`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && result.drivers.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where the swing came from</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Driver</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Effect</th>
                  <th scope="col" className="py-2 text-left font-semibold">Clears in</th>
                </tr>
              </thead>
              <tbody>
                {result.drivers.map((driver) => (
                  <tr key={driver.key} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{driver.label}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">{driver.detail}</span>
                    </td>
                    <td className={`py-2 pr-3 text-right font-semibold ${driver.kg > 0 ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>
                      {signed(driver.kg)} kg
                    </td>
                    <td className="py-2 text-left text-xs text-[var(--muted-foreground)]">{driver.clearsIn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What to take from this</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate, not a medical assessment. Sudden or persistent swelling, weight gain
        of several kilograms in a few days, breathlessness or one-sided leg swelling can signal a
        heart, kidney, liver or clotting problem and should be seen by a doctor promptly.
      </p>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Pill, RotateCcw } from "lucide-react";

import {
  ABSORPTION_NOTES,
  BLEED_LEVELS,
  DIETS,
  HEAVY_BLEEDING_ML,
  IRON_FOODS,
  LIFE_STAGES,
  MEDIAN_LOSS_ML,
  VEGETARIAN_MULTIPLIER,
  calculateIronTarget,
} from "../lib";

const MG = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const WHOLE = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STAGE_OPTIONS = [
  [LIFE_STAGES.CYCLING, "I have periods"],
  [LIFE_STAGES.NO_PERIODS, "No periods (menopause or absent)"],
  [LIFE_STAGES.PREGNANT, "Pregnant"],
  [LIFE_STAGES.BREASTFEEDING, "Breastfeeding"],
];

const DIET_OPTIONS = [
  [DIETS.MIXED, "Includes meat or fish"],
  [DIETS.VEGETARIAN, "Vegetarian or vegan"],
];

export default function ToolHome() {
  const [age, setAge] = useState("30");
  const [lifeStage, setLifeStage] = useState(LIFE_STAGES.CYCLING);
  const [diet, setDiet] = useState(DIETS.MIXED);
  const [bleedId, setBleedId] = useState("average");
  const [lossMl, setLossMl] = useState(String(MEDIAN_LOSS_ML));
  const [cycleDays, setCycleDays] = useState("28");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const numericAge = Number(String(age).trim());
    const numericLoss = Number(String(lossMl).trim());
    const numericCycle = Number(String(cycleDays).trim());
    if (String(age).trim() === "" || Number.isNaN(numericAge)) {
      return { error: "Enter your age in years." };
    }
    if (lifeStage === LIFE_STAGES.CYCLING) {
      if (String(lossMl).trim() === "" || Number.isNaN(numericLoss)) {
        return { error: "Enter an estimated blood loss per cycle in millilitres." };
      }
      if (String(cycleDays).trim() === "" || Number.isNaN(numericCycle)) {
        return { error: "Enter your cycle length in days." };
      }
    }
    return calculateIronTarget({
      age: numericAge,
      lifeStage,
      diet,
      lossMl: numericLoss,
      cycleDays: numericCycle,
    });
  }, [age, lifeStage, diet, lossMl, cycleDays]);

  const hasError = Boolean(result.error);

  const pickLevel = (level) => {
    setBleedId(level.id);
    setLossMl(String(level.ml));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Daily iron target",
      `Life stage band: ${result.bandLabel}`,
      `Base RDA: ${result.baseRda} mg/day`,
      result.vegetarian
        ? `Vegetarian adjustment (x${VEGETARIAN_MULTIPLIER}): ${result.dietAdjustedRda} mg/day`
        : "Mixed diet, no vegetarian adjustment",
    ];
    if (result.cycling && result.excessMl > 0) {
      lines.push(
        `Extra for ${result.excessMl} mL above the ${MEDIAN_LOSS_ML} mL median loss: +${result.extraDietaryMg} mg/day`,
      );
    }
    lines.push(`Daily target: ${result.totalMg} mg/day`);
    lines.push(`Tolerable upper limit: ${result.upperLimit} mg/day from all sources`);
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
    setAge("30");
    setLifeStage(LIFE_STAGES.CYCLING);
    setDiet(DIETS.MIXED);
    setBleedId("average");
    setLossMl(String(MEDIAN_LOSS_ML));
    setCycleDays("28");
    setCopied(false);
  };

  const cycling = lifeStage === LIFE_STAGES.CYCLING;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Pill className="h-4 w-4" aria-hidden="true" />
          Iron intake
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Iron Intake Calculator For Women
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Starts from the Institute of Medicine dietary reference intakes for iron, applies the 1.8x
          vegetarian adjustment where it belongs, and adds the extra your diet has to supply if you
          bleed more than the {MEDIAN_LOSS_ML} mL median the standard figure assumes.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="iron-age">
              Age (years)
            </label>
            <input
              id="iron-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="9"
              max="80"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iron-stage">
              Life stage
            </label>
            <select
              id="iron-stage"
              className={`mt-2 ${INPUT_CLASS}`}
              value={lifeStage}
              onChange={(event) => setLifeStage(event.target.value)}
            >
              {STAGE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iron-diet">
              Diet
            </label>
            <select
              id="iron-diet"
              className={`mt-2 ${INPUT_CLASS}`}
              value={diet}
              onChange={(event) => setDiet(event.target.value)}
            >
              {DIET_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {cycling && (
            <div>
              <label className={LABEL_CLASS} htmlFor="iron-cycle">
                Cycle length (days)
              </label>
              <input
                id="iron-cycle"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="15"
                max="60"
                step="1"
                value={cycleDays}
                onChange={(event) => setCycleDays(event.target.value)}
              />
            </div>
          )}
        </div>

        {cycling && (
          <div className="mt-5">
            <p className="text-sm font-semibold">How heavy are your periods?</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {BLEED_LEVELS.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => pickLevel(level)}
                  aria-pressed={bleedId === level.id}
                  className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    bleedId === level.id
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                  }`}
                >
                  <span className="block font-semibold text-[var(--foreground)]">
                    {level.name} · about {level.ml} mL
                  </span>
                  <span className="block text-xs text-[var(--muted-foreground)]">{level.note}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 sm:max-w-xs">
              <label className={LABEL_CLASS} htmlFor="iron-loss">
                Or type an estimate (mL per cycle)
              </label>
              <input
                id="iron-loss"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="500"
                step="5"
                value={lossMl}
                onChange={(event) => {
                  setLossMl(event.target.value);
                  setBleedId("custom");
                }}
              />
            </div>
          </div>
        )}
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
              Daily iron target
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${MG.format(result.totalMg)} mg`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above."
                : `${result.bandLabel} · from food and supplements combined`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the iron target result"
              className={GHOST_BTN}
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
            ["Base RDA for this band", hasError ? DASH : `${WHOLE.format(result.baseRda)} mg/day`],
            [
              "Diet adjustment",
              hasError
                ? DASH
                : result.vegetarian
                  ? `x${VEGETARIAN_MULTIPLIER} (about ${WHOLE.format(result.absorptionPercent)}% absorbed)`
                  : `None (about ${WHOLE.format(result.absorptionPercent)}% absorbed)`,
            ],
            ["After diet adjustment", hasError ? DASH : `${MG.format(result.dietAdjustedRda)} mg/day`],
            [
              "Loss above the median",
              hasError
                ? DASH
                : result.cycling
                  ? `${WHOLE.format(result.excessMl)} mL per cycle`
                  : "Not applicable",
            ],
            [
              "Extra iron your diet must supply",
              hasError ? DASH : `+${MG.format(result.extraDietaryMg)} mg/day`,
            ],
            ["Tolerable upper intake level", hasError ? DASH : `${WHOLE.format(result.upperLimit)} mg/day`],
            [
              "Target as a share of that limit",
              hasError ? DASH : `${WHOLE.format(result.percentOfUpperLimit)}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.exceedsUpperLimit && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            This target is above the {result.upperLimit} mg/day tolerable upper intake level. That is
            a signal to have the bleeding and your iron status investigated, not to take that much —
            high-dose iron should only be taken on medical advice.
          </p>
        )}

        {!hasError && result.heavyBleeding && !result.exceedsUpperLimit && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            A loss of {HEAVY_BLEEDING_ML} mL or more per cycle is the clinical definition of heavy
            menstrual bleeding. Worth raising with a doctor along with a ferritin test rather than
            managing with diet alone.
          </p>
        )}
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What raises absorption</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {ABSORPTION_NOTES.helps.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--success)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What blocks it</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {ABSORPTION_NOTES.hinders.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--danger)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Roughly how much iron is in a serving</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Food</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Serving</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Type</th>
                <th scope="col" className="py-2 text-right font-semibold">Iron</th>
              </tr>
            </thead>
            <tbody>
              {IRON_FOODS.map((item) => (
                <tr key={item.food} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{item.food}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{item.serving}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{item.type}</td>
                  <td className="py-2 text-right tabular-nums">{MG.format(item.mg)} mg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Approximate values from food composition tables; real content varies with variety, soil and
          cooking. Heme iron from animal foods is absorbed several times more efficiently than
          non-heme iron from plants.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not a diagnosis or a prescription. Menstrual blood loss cannot be
        measured accurately at home, so the extra figure is an estimate. Only a blood test —
        haemoglobin plus ferritin — can show whether you are actually iron deficient, and iron
        supplements should be taken on medical advice because too much iron is harmful.
      </p>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Bone, Check, Copy, RotateCcw } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  CALCIUM_FOODS,
  LIFE_STAGES,
  SINGLE_DOSE_LIMIT_MG,
  VITAMIN_D_NOTES,
  calculateCalciumPlan,
  suggestTopUps,
} from "../lib";

const WHOLE = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const ONE_DP = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STAGE_OPTIONS = [
  [LIFE_STAGES.GENERAL, "General"],
  [LIFE_STAGES.PREGNANT, "Pregnant"],
  [LIFE_STAGES.BREASTFEEDING, "Breastfeeding"],
  [LIFE_STAGES.POSTMENOPAUSAL, "After menopause"],
];

const DEFAULT_SERVINGS = { milk: 1, curd: 1 };

export default function ToolHome() {
  const [age, setAge] = useState("35");
  const [lifeStage, setLifeStage] = useState(LIFE_STAGES.GENERAL);
  const [servings, setServings] = useState(DEFAULT_SERVINGS);
  const { copy, isCopied, announcement } = useCopyToClipboard();

  const result = useMemo(() => {
    const numericAge = Number(String(age).trim());
    if (String(age).trim() === "" || Number.isNaN(numericAge)) {
      return { error: "Enter your age in years." };
    }
    return calculateCalciumPlan({ age: numericAge, lifeStage, servings });
  }, [age, lifeStage, servings]);

  const hasError = Boolean(result.error);
  const topUps = useMemo(() => (hasError ? [] : suggestTopUps(result.gapMg)), [hasError, result]);

  const setServing = (id, value) => {
    setServings((previous) => ({ ...previous, [id]: value }));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Calcium and vitamin D targets",
      `Age band: ${result.calciumBandLabel}`,
      `Calcium target: ${result.calciumTargetMg} mg/day (upper limit ${result.calciumUpperLimitMg} mg)`,
      `Vitamin D target: ${result.vitaminDTargetIu} IU (${result.vitaminDTargetMcg} mcg) per day, upper limit ${result.vitaminDUpperLimitIu} IU`,
      `Calcium from the foods listed: ${result.intakeMg} mg (${result.percentOfTarget}% of target)`,
      result.meetsTarget ? "Target met from food." : `Short by ${result.gapMg} mg.`,
    ];
    result.breakdown.forEach((item) => {
      const note = item.poorlyAbsorbed ? ` (${item.listedMg} mg listed, oxalates cut most of it)` : "";
      lines.push(`  ${item.name} x${item.count} (${item.serving}) = ${item.mg} mg${note}`);
    });
    return lines.join("\n");
  }, [hasError, result]);

  const copyResult = () => {
    if (!summary) return;
    copy("result", summary, { label: "the calcium and vitamin D result" });
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset all inputs? This will replace your age, life stage and servings with the demo example values and cannot be undone.",
      )
    ) {
      return;
    }
    setAge("35");
    setLifeStage(LIFE_STAGES.GENERAL);
    setServings(DEFAULT_SERVINGS);
  };

  const barPercent = hasError ? 0 : Math.max(0, Math.min(100, result.percentOfTarget));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bone className="h-4 w-4" aria-hidden="true" />
          Bone nutrition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Calcium Intake Calculator For Women
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Your calcium and vitamin D targets come straight from the Institute of Medicine dietary
          reference intakes — 1300 mg through the teenage years, 1000 mg from 19 to 50, and 1200 mg
          from 51 onward. Tick off what you actually ate to see how close the day gets.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cal-age">
              Age (years)
            </label>
            <input
              id="cal-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="9"
              max="100"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cal-stage">
              Life stage
            </label>
            <select
              id="cal-stage"
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
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What did you eat today?</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Enter servings. Leave anything you did not have at zero.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {CALCIUM_FOODS.map((food) => (
            <div key={food.id}>
              <label className={LABEL_CLASS} htmlFor={`cal-food-${food.id}`}>
                {food.name}
              </label>
              <p className="text-xs text-[var(--muted-foreground)]">
                {food.serving} · about {food.mg} mg
                {food.labelDependent ? " (check the label)" : ""}
                {food.poorlyAbsorbed ? " (oxalate blocks much of it)" : ""}
              </p>
              <input
                id={`cal-food-${food.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="20"
                step="1"
                value={servings[food.id] ?? 0}
                onChange={(event) => setServing(food.id, event.target.value)}
              />
            </div>
          ))}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Daily calcium target
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${WHOLE.format(result.calciumTargetMg)} mg`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above."
                : `${result.calciumBandLabel} · food listed supplies ${WHOLE.format(result.intakeMg)} mg`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={isCopied("result") ? "Copied the calcium and vitamin D result to the clipboard" : "Copy the calcium and vitamin D result"}
              className={GHOST_BTN}
            >
              {isCopied("result") ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {isCopied("result") ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <span className="sr-only" role="status">
              {announcement}
            </span>
          </div>
        </div>

        <div
          className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={barPercent}
          aria-label="Share of the calcium target met by food"
        >
          <span
            className={`block h-full ${
              hasError || !result.meetsTarget ? "bg-[var(--primary)]" : "bg-[var(--success)]"
            }`}
            style={{ width: `${barPercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          {hasError ? DASH : `${WHOLE.format(result.percentOfTarget)}% of the daily target`}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite" aria-atomic="true">
          {[
            ["Calcium from food listed", hasError ? DASH : `${WHOLE.format(result.intakeMg)} mg`],
            [
              "Still to find",
              hasError
                ? DASH
                : result.gapMg > 0
                  ? `${WHOLE.format(result.gapMg)} mg`
                  : result.overMg > 0
                    ? `Target met — ${WHOLE.format(result.overMg)} mg over`
                    : "Nothing — target met exactly",
            ],
            ["Calcium upper limit", hasError ? DASH : `${WHOLE.format(result.calciumUpperLimitMg)} mg/day`],
            [
              "Vitamin D target",
              hasError
                ? DASH
                : `${WHOLE.format(result.vitaminDTargetIu)} IU (${ONE_DP.format(result.vitaminDTargetMcg)} mcg)`,
            ],
            [
              "Vitamin D upper limit",
              hasError
                ? DASH
                : `${WHOLE.format(result.vitaminDUpperLimitIu)} IU (${WHOLE.format(result.vitaminDUpperLimitMcg)} mcg)`,
            ],
            [
              "Spread the day over",
              hasError
                ? DASH
                : `${result.suggestedSittings} sittings (absorption drops above ${SINGLE_DOSE_LIMIT_MG} mg at once)`,
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
            That intake is above the {WHOLE.format(result.calciumUpperLimitMg)} mg/day tolerable
            upper limit for your age band. Habitually going over is linked to kidney stones — worth
            reviewing with a doctor, especially if supplements are involved.
          </p>
        )}

        {!hasError && result.lifeStageNote && (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">{result.lifeStageNote}</p>
        )}
      </section>

      {!hasError && result.breakdown.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where your calcium came from</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Food</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Serving</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Servings</th>
                  <th scope="col" className="py-2 text-right font-semibold">Calcium</th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {item.name}
                      {item.poorlyAbsorbed ? (
                        <span className="mt-0.5 block text-xs font-normal text-[var(--muted-foreground)]">
                          {WHOLE.format(item.listedMg)} mg listed, oxalates cut most of it
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{item.serving}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{ONE_DP.format(item.count)}</td>
                    <td className="py-2 text-right tabular-nums">
                      {WHOLE.format(item.mg)} mg{item.poorlyAbsorbed ? " counted" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasError && topUps.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">
            Closing the {WHOLE.format(result.gapMg)} mg gap
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {topUps.map((item) => (
              <li key={item.id} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                <span>
                  <span className="font-semibold text-[var(--foreground)]">
                    {item.servingsNeeded} x {item.name}
                  </span>{" "}
                  ({item.serving}, about {WHOLE.format(item.mg)} mg each)
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">About the vitamin D half</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {VITAMIN_D_NOTES.map((note) => (
            <li key={note} className="flex gap-2">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
              {note}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Serving values are averages from food composition tables and real
        products vary, especially fortified drinks and tofu. Calcium and vitamin D needs can differ
        with kidney disease, malabsorption, steroid use or osteoporosis treatment — talk to a doctor
        or dietitian before starting supplements.
      </p>
    </main>
  );
}

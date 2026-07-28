"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Egg, RotateCcw } from "lucide-react";

import { ACTIVITY_LEVELS, calculateChildProtein } from "../lib";

const DEFAULTS = {
  ageYears: "10",
  weightKg: "32",
  sex: "female",
  activity: "typical",
  dailyKcal: "1800",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const grams = (value) => `${NUM.format(value)} g`;

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(
    () =>
      calculateChildProtein({
        ageYears: toNumber(form.ageYears),
        weightKg: toNumber(form.weightKg),
        sex: form.sex,
        activity: form.activity,
        dailyKcal: toNumber(form.dailyKcal),
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const rows = hasError
    ? [
        ["Per kilogram of body weight", DASH],
        ["DRI RDA at this weight", DASH],
        ["Reference RDA for the age band", DASH],
        ["Extra above the RDA", DASH],
        ["Roughly per meal (4 eating occasions)", DASH],
        ["Share of daily energy", DASH],
      ]
    : [
        ["Per kilogram of body weight", `${result.targetGPerKg} g/kg`],
        ["DRI RDA at this weight", grams(result.rdaGrams)],
        [`Reference RDA for ${result.ageBandLabel}`, `${result.referenceRdaGrams} g/day`],
        ["Extra above the RDA", grams(result.extraOverRdaGrams)],
        ["Roughly per meal (4 eating occasions)", grams(result.perMealGrams)],
        [
          "Share of daily energy",
          result.energyCheck
            ? `${result.energyCheck.percentOfEnergy}% (AMDR ${result.energyCheck.minPercent}-${result.energyCheck.maxPercent}%)`
            : "Not checked — enter daily calories",
        ],
      ];

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Child Protein Intake Calculator",
      `Age ${result.age} · ${result.weightKg} kg · ${result.activityLabel}`,
      `Daily protein target: ${grams(result.targetGrams)} (${result.targetGPerKg} g/kg)`,
      `DRI RDA at this weight: ${grams(result.rdaGrams)} (${result.rdaGPerKg} g/kg, ${result.ageBandLabel})`,
      `About ${grams(result.perMealGrams)} across each of four eating occasions`,
      result.energyCheck
        ? `Protein supplies ${result.energyCheck.percentOfEnergy}% of a ${result.energyCheck.dailyKcal} kcal day (AMDR ${result.energyCheck.minPercent}-${result.energyCheck.maxPercent}%)`
        : "Energy share not checked",
    ].join("\n");
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Egg className="h-4 w-4" aria-hidden="true" />
          Child nutrition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Child Protein Intake Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out a child&apos;s daily protein target from the DRI protein RDAs, adjust it for sport,
          and see how many everyday portions it takes to get there.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cpi-age">
              Age (years)
            </label>
            <input
              id="cpi-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="18"
              step="1"
              value={form.ageYears}
              onChange={setField("ageYears")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cpi-weight">
              Body weight (kg)
            </label>
            <input
              id="cpi-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="150"
              step="0.5"
              value={form.weightKg}
              onChange={setField("weightKg")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cpi-sex">
              Reference RDA (differs only from age 14)
            </label>
            <select
              id="cpi-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.sex}
              onChange={setField("sex")}
            >
              <option value="female">Girl</option>
              <option value="male">Boy</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cpi-kcal">
              Daily calories (0 to skip the check)
            </label>
            <input
              id="cpi-kcal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="6000"
              step="50"
              value={form.dailyKcal}
              onChange={setField("dailyKcal")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cpi-activity">
              Activity level
            </label>
            <select
              id="cpi-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.activity}
              onChange={setField("activity")}
            >
              {ACTIVITY_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
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
              Daily protein target
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : grams(result.targetGrams)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the target."
                : `${result.targetGPerKg} g per kg at ${result.weightKg} kg · ${result.ageBandLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the protein target"
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
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What that looks like on a plate</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Portions needed if the whole day&apos;s protein came from one food — a real day mixes
            several of these.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[440px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Food
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Portion
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Protein
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Portions for the day
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.foods.map((food) => (
                  <tr key={food.id} className="border-b border-[var(--border)] last:border-0">
                    <th scope="row" className="py-2 pr-3 text-left font-semibold">
                      {food.label}
                    </th>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{food.portion}</td>
                    <td className="py-2 pr-3 text-right">{grams(food.grams)}</td>
                    <td className="py-2 text-right font-semibold">
                      {NUM.format(food.portionsForTarget)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]"
                />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. These are population reference values for healthy children; kidney, liver,
        metabolic or growth conditions change protein needs substantially. Talk to a paediatrician or a
        registered dietitian before adding protein supplements for a child.
      </p>
    </main>
  );
}

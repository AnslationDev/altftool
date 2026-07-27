"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FlaskConical, RotateCcw } from "lucide-react";
import {
  SACHET_SIZES,
  WHO_ORS_FORMULATION,
  computeMixing,
  computeReplacement,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  water: "1000",
  sachet: "l1",
  years: "1",
  months: "6",
  weight: "10",
  stools: "6",
  dehydration: "none",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [water, setWater] = useState(DEFAULTS.water);
  const [sachet, setSachet] = useState(DEFAULTS.sachet);
  const [years, setYears] = useState(DEFAULTS.years);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [stools, setStools] = useState(DEFAULTS.stools);
  const [dehydration, setDehydration] = useState(DEFAULTS.dehydration);
  const [copied, setCopied] = useState(false);

  const sachetLitres = useMemo(
    () => (SACHET_SIZES.find((size) => size.id === sachet) || SACHET_SIZES[0]).litres,
    [sachet],
  );

  const mixing = useMemo(
    () =>
      computeMixing({
        waterMl: water === "" ? NaN : Number(water),
        sachetLitres,
      }),
    [water, sachetLitres],
  );

  const replacement = useMemo(() => {
    const y = years === "" ? NaN : Number(years);
    const m = months === "" ? 0 : Number(months);
    const ageMonths = Number.isFinite(y) && Number.isFinite(m) ? y * 12 + m : NaN;
    return computeReplacement({
      ageMonths,
      weightKg: weight === "" ? NaN : Number(weight),
      looseStools: stools === "" ? NaN : Number(stools),
      dehydration,
    });
  }, [years, months, weight, stools, dehydration]);

  const mixError = Boolean(mixing.error);
  const repError = Boolean(replacement.error);

  const headline = repError
    ? DASH
    : replacement.plan === "B"
      ? `${NUM.format(replacement.planBMl)} ml`
      : replacement.headlineMaxMl
        ? `${NUM.format(replacement.headlineMl)}–${NUM.format(replacement.headlineMaxMl)} ml`
        : `${NUM.format(replacement.headlineMl)} ml`;

  const summary = useMemo(() => {
    if (mixError && repError) return "";
    const lines = ["ORS Mixing Guide"];
    if (!mixError) {
      lines.push(
        `Mix: ${NUM.format(mixing.waterMl)} ml of clean water + ${mixing.sachets} sachet(s) sized for ${mixing.sachetLitres} L`,
        `Homemade alternative: ${mixing.sugarTspLabel} tsp sugar (${mixing.sugarGrams} g) + ${mixing.saltTspLabel} tsp salt (${mixing.saltGrams} g)`,
        `Discard any solution left after ${mixing.discardAfterHours} hours.`,
      );
    }
    if (!repError) {
      lines.push(
        "",
        replacement.planLabel,
        replacement.perStoolNote,
        replacement.plan === "B"
          ? `Give ${NUM.format(replacement.planBMl)} ml over ${replacement.planBHours} hours (about ${NUM.format(replacement.planBPerHourMl)} ml per hour).`
          : `For ${replacement.looseStools} loose stools: ${NUM.format(replacement.planAMinMl)}${replacement.planAMaxMl ? `-${NUM.format(replacement.planAMaxMl)}` : "+"} ml of ORS.`,
        `Zinc: ${replacement.zincMg} mg daily for ${replacement.zincDaysMin}-${replacement.zincDaysMax} days.`,
      );
    }
    return lines.join("\n");
  }, [mixError, repError, mixing, replacement]);

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
    setWater(DEFAULTS.water);
    setSachet(DEFAULTS.sachet);
    setYears(DEFAULTS.years);
    setMonths(DEFAULTS.months);
    setWeight(DEFAULTS.weight);
    setStools(DEFAULTS.stools);
    setDehydration(DEFAULTS.dehydration);
    setCopied(false);
  };

  const mixRows = [
    ["Clean water", mixError ? DASH : `${NUM.format(mixing.waterMl)} ml`],
    [
      "Sachets to add",
      mixError ? DASH : `${mixing.sachets} × sachet sized for ${mixing.sachetLitres} L`,
    ],
    [
      "Homemade sugar (if no sachet)",
      mixError ? DASH : `${mixing.sugarTspLabel} level tsp (~${mixing.sugarGrams} g)`,
    ],
    [
      "Homemade salt (if no sachet)",
      mixError ? DASH : `${mixing.saltTspLabel} level tsp (~${mixing.saltGrams} g)`,
    ],
    ["Discard leftovers after", mixError ? DASH : `${mixing.discardAfterHours} hours`],
  ];

  const repRows = [
    ["Treatment plan", repError ? DASH : replacement.planLabel],
    ["Age band", repError ? DASH : replacement.ageBandLabel],
    [
      "After each loose stool",
      repError
        ? DASH
        : replacement.perStoolMax
          ? `${replacement.perStoolMin}–${replacement.perStoolMax} ml`
          : `${replacement.perStoolMin} ml or more`,
    ],
    [
      "For the stools entered",
      repError
        ? DASH
        : `${NUM.format(replacement.planAMinMl)}${replacement.planAMaxMl ? `–${NUM.format(replacement.planAMaxMl)}` : "+"} ml`,
    ],
    [
      "Plan B loading dose (75 ml/kg)",
      repError
        ? DASH
        : replacement.plan === "B"
          ? `${NUM.format(replacement.planBMl)} ml over ${replacement.planBHours} h (~${NUM.format(replacement.planBPerHourMl)} ml/h)`
          : "Not applicable — no visible dehydration",
    ],
    [
      "Zinc alongside ORS",
      repError
        ? DASH
        : `${replacement.zincMg} mg daily for ${replacement.zincDaysMin}–${replacement.zincDaysMax} days`,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FlaskConical className="h-4 w-4" aria-hidden="true" />
          Oral rehydration
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          ORS Mixing Guide Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The ratio is the whole point. Too little water makes the solution pull fluid into the gut
          and worsen diarrhoea; too much dilutes the glucose that carries sodium across the gut wall.
          This gives the exact sachet count, the WHO homemade fallback, and how much to give.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">1. Mixing</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ors-water">
              Clean water you are mixing (ml)
            </label>
            <input
              id="ors-water"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="5000"
              step="50"
              value={water}
              onChange={(event) => setWater(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ors-sachet">
              Sachet size on the packet
            </label>
            <select
              id="ors-sachet"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sachet}
              onChange={(event) => setSachet(event.target.value)}
            >
              {SACHET_SIZES.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {mixError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {mixing.error}
          </p>
        ) : (
          mixing.needsPartialSachet && (
            <p
              role="alert"
              className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              Never split a sachet — the salts are not evenly distributed inside it, so half a sachet
              is not half the dose. Mix a full sachet into{" "}
              {NUM.format(mixing.recommendedWaterForWholeSachetsMl)} ml instead and discard what is
              left after 24 hours.
            </p>
          )
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {mixRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">2. How much to give</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ors-years">
              Age (years)
            </label>
            <input
              id="ors-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="1"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ors-months">
              Extra months
            </label>
            <input
              id="ors-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="11"
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ors-weight">
              Weight (kg)
            </label>
            <input
              id="ors-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="200"
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ors-stools">
              Loose stools so far today
            </label>
            <input
              id="ors-stools"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="40"
              step="1"
              value={stools}
              onChange={(event) => setStools(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ors-dehydration">
              Level of dehydration
            </label>
            <select
              id="ors-dehydration"
              className={`mt-2 ${INPUT_CLASS}`}
              value={dehydration}
              onChange={(event) => setDehydration(event.target.value)}
            >
              <option value="none">No visible dehydration — alert, drinking normally</option>
              <option value="some">Some dehydration — restless, thirsty, sunken eyes</option>
              <option value="severe">Severe — drowsy, unable to drink, skin pinch stays up</option>
            </select>
          </div>
        </div>

        {repError && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {replacement.error}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {repError || replacement.plan === "A" ? "ORS for today's losses" : "ORS over 4 hours"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {repError ? "See the alert above." : replacement.perStoolNote}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy ORS mixing and dosing guide"
              className={GHOST_BTN}
              disabled={mixError && repError}
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
          {repRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What is in WHO low-osmolarity ORS</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Total osmolarity {WHO_ORS_FORMULATION.totalOsmolarity} mOsm/L — the reduced-osmolarity
          formula adopted by WHO and UNICEF, which shortens diarrhoea and reduces vomiting compared
          with the original 311 mOsm/L recipe.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Ingredient
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  g per litre
                </th>
              </tr>
            </thead>
            <tbody>
              {WHO_ORS_FORMULATION.gramsPerLitre.map(([name, grams]) => (
                <tr key={name} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{name}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{grams}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Component
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  mmol per litre
                </th>
              </tr>
            </thead>
            <tbody>
              {WHO_ORS_FORMULATION.mmolPerLitre.map(([name, mmol]) => (
                <tr key={name} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{name}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{mmol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
          A packaged sachet is always better than the homemade sugar-salt solution, which contains no
          potassium or citrate. Use the homemade version only when no sachet is available, measure
          with level spoons, and never add extra salt.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational guidance based on WHO and UNICEF diarrhoea management materials — it is not
        medical advice and does not replace assessment by a clinician. Seek care urgently for blood
        in the stool, persistent vomiting, a high fever, diarrhoea lasting more than 14 days, an
        infant under six months, or any sign of severe dehydration.
      </p>
    </main>
  );
}

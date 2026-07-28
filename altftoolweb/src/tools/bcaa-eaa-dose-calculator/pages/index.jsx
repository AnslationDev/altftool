"use client";

import { useMemo, useState } from "react";
import { Beaker, Check, Copy, RotateCcw } from "lucide-react";

import {
  EAA_PER_DOSE_MAX_G,
  EAA_PER_DOSE_MIN_G,
  LEUCINE_TARGET_DEFAULT_G,
  LEUCINE_TRIGGER_MAX_G,
  LEUCINE_TRIGGER_MIN_G,
  PRODUCTS,
  WHO_TOTAL_IAA_MG_PER_KG,
  computeAminoDose,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const DASH = "—";

const DEFAULTS = {
  weight: "75",
  productId: "bcaa-2-1-1",
  leucine: String(LEUCINE_TARGET_DEFAULT_G),
  doses: "1",
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
  const [productId, setProductId] = useState(DEFAULTS.productId);
  const [leucine, setLeucine] = useState(DEFAULTS.leucine);
  const [doses, setDoses] = useState(DEFAULTS.doses);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeAminoDose({
        bodyWeightKg: Number(weight),
        productId,
        leucineTargetG: Number(leucine),
        dosesPerDay: Number(doses),
      }),
    [weight, productId, leucine, doses],
  );

  const hasError = Boolean(result.error);
  const show = (value) => (hasError ? DASH : value);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "BCAA / EAA dose",
      `${result.productLabel} · ${result.weight} kg bodyweight`,
      `Serving size: ${result.doseG} g for ${result.leucineTargetG} g leucine`,
      `Indispensable amino acids per serving: ${result.eaaDeliveredG} g`,
      `Servings per day: ${result.dosesPerDay} (${result.dailyProductG} g of product)`,
      `WHO/FAO daily requirement for ${result.weight} kg: ${result.totalDailyIaaG} g of indispensable amino acids, including ${result.dailyLeucineRequirementG} g leucine`,
      result.verdict,
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
    setWeight(DEFAULTS.weight);
    setProductId(DEFAULTS.productId);
    setLeucine(DEFAULTS.leucine);
    setDoses(DEFAULTS.doses);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Beaker className="h-4 w-4" aria-hidden="true" />
          Sports nutrition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          BCAA and EAA Dose Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set a leucine target and see how many grams of your BCAA, EAA or protein powder it takes to
          hit it — plus how that compares with WHO daily amino acid requirements and with real food.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="aa-weight">
              Bodyweight (kg)
            </label>
            <input
              id="aa-weight"
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
            <label className={LABEL_CLASS} htmlFor="aa-product">
              Supplement
            </label>
            <select
              id="aa-product"
              className={`mt-2 ${INPUT_CLASS}`}
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
            >
              {PRODUCTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="aa-leucine">
              Leucine target per serving (g)
            </label>
            <input
              id="aa-leucine"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="6"
              step="0.1"
              value={leucine}
              onChange={(event) => setLeucine(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {LEUCINE_TRIGGER_MIN_G}-{LEUCINE_TRIGGER_MAX_G} g is the range usually cited for a
              maximal muscle protein synthesis response.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="aa-doses">
              Servings per day
            </label>
            <input
              id="aa-doses"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="6"
              step="1"
              value={doses}
              onChange={(event) => setDoses(event.target.value)}
            />
          </div>
        </div>
        {!hasError && (
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">{result.productNote}</p>
        )}
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
              Serving size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(`${result.doseG} g`)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {show(`${result.productLabel} — delivers ${result.leucineTargetG} g leucine`)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy amino acid dosing result"
              className={GHOST_BTN}
              disabled={hasError}
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
            ["Leucine per gram of product", show(`${result.leucinePerGram} g`)],
            [
              "Indispensable amino acids per serving",
              show(`${result.eaaDeliveredG} g (target ${EAA_PER_DOSE_MIN_G}-${EAA_PER_DOSE_MAX_G} g)`),
            ],
            ["Covers all 9 indispensable amino acids", show(result.completeSpectrum ? "Yes" : "No — 3 of 9")],
            ["Product used per day", show(`${result.dailyProductG} g across ${result.dosesPerDay} servings`)],
            ["Leucine per day from these servings", show(`${result.dailyLeucineFromDosesG} g`)],
            [
              "WHO/FAO daily leucine requirement",
              show(`${result.dailyLeucineRequirementG} g (${result.leucineRequirementCoverPct}% covered)`),
            ],
            [
              "WHO/FAO daily total for all 9",
              show(`${NUM.format(result.totalDailyIaaG)} g (${WHO_TOTAL_IAA_MG_PER_KG} mg/kg)`),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
            {result.verdict}
          </p>
        )}
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Whole-food equivalents</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              How much of each food supplies the same {result.leucineTargetG} g of leucine — and the
              protein that comes with it.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[380px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Food</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Amount</th>
                    <th scope="col" className="py-2 text-right font-semibold">Protein it brings</th>
                  </tr>
                </thead>
                <tbody>
                  {result.foodEquivalents.map((food) => (
                    <tr key={food.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{food.label}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{food.grams} g</td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]">{food.proteinG} g</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">
              WHO/FAO daily requirements at {result.weight} kg
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Amino acid</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">mg/kg/day</th>
                    <th scope="col" className="py-2 text-right font-semibold">Per day</th>
                  </tr>
                </thead>
                <tbody>
                  {result.requirements.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{row.label}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{row.mgPerKg}</td>
                      <td className="py-2 text-right font-semibold">{NUM.format(row.dailyG)} g</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and based on healthy-adult reference values. Amino acid supplements are
        not appropriate for everyone — people with maple syrup urine disease, liver or kidney disease,
        or on protein-restricted diets should speak to a doctor or dietitian first.
      </p>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Milk, RotateCcw } from "lucide-react";

import { REFERENCE_PROTEIN_SERVING_G, computeWheyValue } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DASH = "—";

const CURRENCIES = [
  { code: "INR", locale: "en-IN", label: "INR ₹" },
  { code: "USD", locale: "en-US", label: "USD $" },
  { code: "EUR", locale: "en-IE", label: "EUR €" },
  { code: "GBP", locale: "en-GB", label: "GBP £" },
];

const DEFAULTS = {
  tubGrams: "1000",
  tubPrice: "3000",
  scoopGrams: "30",
  proteinPerScoop: "24",
  carbPerScoop: "3",
  fatPerScoop: "1.5",
  target: String(REFERENCE_PROTEIN_SERVING_G),
  scoopsPerDay: "2",
  currency: "INR",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [tubGrams, setTubGrams] = useState(DEFAULTS.tubGrams);
  const [tubPrice, setTubPrice] = useState(DEFAULTS.tubPrice);
  const [scoopGrams, setScoopGrams] = useState(DEFAULTS.scoopGrams);
  const [proteinPerScoop, setProteinPerScoop] = useState(DEFAULTS.proteinPerScoop);
  const [carbPerScoop, setCarbPerScoop] = useState(DEFAULTS.carbPerScoop);
  const [fatPerScoop, setFatPerScoop] = useState(DEFAULTS.fatPerScoop);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [scoopsPerDay, setScoopsPerDay] = useState(DEFAULTS.scoopsPerDay);
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  const money = useMemo(() => {
    const entry = CURRENCIES.find((item) => item.code === currency) || CURRENCIES[0];
    const formatter = new Intl.NumberFormat(entry.locale, {
      style: "currency",
      currency: entry.code,
      maximumFractionDigits: 2,
    });
    return (value) => (Number.isFinite(value) ? formatter.format(value) : DASH);
  }, [currency]);

  const result = useMemo(
    () =>
      computeWheyValue({
        tubGrams: Number(tubGrams),
        tubPrice: tubPrice.trim() === "" ? 0 : Number(tubPrice),
        scoopGrams: Number(scoopGrams),
        proteinPerScoopG: Number(proteinPerScoop),
        carbPerScoopG: carbPerScoop.trim() === "" ? 0 : Number(carbPerScoop),
        fatPerScoopG: fatPerScoop.trim() === "" ? 0 : Number(fatPerScoop),
        targetProteinG: Number(target),
        scoopsPerDay: Number(scoopsPerDay),
      }),
    [tubGrams, tubPrice, scoopGrams, proteinPerScoop, carbPerScoop, fatPerScoop, target, scoopsPerDay],
  );

  const hasError = Boolean(result.error);
  const show = (value) => (hasError ? DASH : value);
  const showMoney = (value) =>
    hasError ? DASH : value === null ? "Enter a tub price" : money(value);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Whey scoop breakdown",
      `Tub: ${result.tubGrams} g · scoop ${result.scoopGrams} g · ${result.proteinPerScoopG} g protein per scoop`,
      `Protein purity: ${result.purityPct}% (${result.purityLabel})`,
      `Protein in the tub: ${result.proteinPerTubG} g across ${result.scoopsPerTub} scoops`,
      `For ${result.targetProteinG} g protein: ${result.scoopsForTarget} scoops (${result.powderForTargetG} g powder, ${result.kcalForTarget} kcal)`,
      result.hasPrice
        ? `Cost per ${result.referenceServingG} g protein: ${money(result.costPerReferenceServing)}`
        : "",
      result.hasPrice ? `Cost per gram of protein: ${money(result.costPerGramProtein)}` : "",
      `One tub lasts ${result.daysPerTub} days at ${result.scoopsPerDay} scoops a day`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result, money]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const reset = () => {
    setTubGrams(DEFAULTS.tubGrams);
    setTubPrice(DEFAULTS.tubPrice);
    setScoopGrams(DEFAULTS.scoopGrams);
    setProteinPerScoop(DEFAULTS.proteinPerScoop);
    setCarbPerScoop(DEFAULTS.carbPerScoop);
    setFatPerScoop(DEFAULTS.fatPerScoop);
    setTarget(DEFAULTS.target);
    setScoopsPerDay(DEFAULTS.scoopsPerDay);
    setCurrency(DEFAULTS.currency);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Milk className="h-4 w-4" aria-hidden="true" />
          Sports nutrition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Whey Scoop Protein Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Copy the numbers off the tub. You get protein purity, grams of protein per scoop and per
          tub, how many scoops make your target shake, and the only figure that compares tubs fairly:
          cost per {REFERENCE_PROTEIN_SERVING_G} g of protein.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wp-tub">
              Tub net weight (g)
            </label>
            <input
              id="wp-tub"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="20000"
              step="50"
              value={tubGrams}
              onChange={(event) => setTubGrams(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wp-price">
              Tub price
            </label>
            <input
              id="wp-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={tubPrice}
              onChange={(event) => setTubPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wp-scoop">
              Scoop weight (g)
            </label>
            <input
              id="wp-scoop"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={scoopGrams}
              onChange={(event) => setScoopGrams(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wp-protein">
              Protein per scoop (g)
            </label>
            <input
              id="wp-protein"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={proteinPerScoop}
              onChange={(event) => setProteinPerScoop(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wp-carb">
              Carbohydrate per scoop (g)
            </label>
            <input
              id="wp-carb"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={carbPerScoop}
              onChange={(event) => setCarbPerScoop(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wp-fat">
              Fat per scoop (g)
            </label>
            <input
              id="wp-fat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={fatPerScoop}
              onChange={(event) => setFatPerScoop(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wp-target">
              Protein you want per shake (g)
            </label>
            <input
              id="wp-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="200"
              step="1"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wp-perday">
              Scoops per day
            </label>
            <input
              id="wp-perday"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="20"
              step="0.5"
              value={scoopsPerDay}
              onChange={(event) => setScoopsPerDay(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wp-currency">
              Currency
            </label>
            <select
              id="wp-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" aria-atomic="true">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cost per {REFERENCE_PROTEIN_SERVING_G} g of protein
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {showMoney(result.costPerReferenceServing)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {show(`${result.purityPct}% protein by weight · ${result.purityLabel}`)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy whey protein breakdown"
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
            ["Protein per scoop", show(`${result.proteinPerScoopG} g`)],
            ["Everything else per scoop", show(`${result.otherGramsPerScoop} g`)],
            ["Scoops in the tub", show(NUM.format(result.scoopsPerTub))],
            ["Protein in the whole tub", show(`${NUM.format(result.proteinPerTubG)} g`)],
            ["Energy per scoop", show(`${result.kcalPerScoop} kcal (${result.proteinKcalPct}% from protein)`)],
            [
              `Scoops for a ${result.targetProteinG || DASH} g shake`,
              show(`${result.scoopsForTarget} scoops = ${result.powderForTargetG} g powder, ${result.kcalForTarget} kcal`),
            ],
            ["Cost per scoop", showMoney(result.costPerScoop)],
            ["Cost per gram of protein", showMoney(result.costPerGramProtein)],
            ["Cost per shake at your target", showMoney(result.costPerTargetShake)],
            ["Days one tub lasts", show(`${result.daysPerTub} days at ${result.scoopsPerDay} scoops/day`)],
            ["Cost per day", showMoney(result.costPerDay)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <>
            <div className="mt-5">
              <div
                className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`Protein is ${result.purityPct}% of the powder by weight`}
              >
                <span
                  className="block h-full bg-[var(--primary)]"
                  style={{ width: `${Math.max(0, Math.min(100, result.purityPct))}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Protein {result.purityPct}% · other ingredients {Math.round(100 - result.purityPct)}%
              </p>
            </div>
            <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
              {result.purityNote}
            </p>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Figures come straight from the label you enter, so they are only as accurate as the panel.
        Scoops are volumetric and settle in transit — weighing a scoop on a kitchen scale is the only
        way to know what you are really taking.
      </p>
    </main>
  );
}

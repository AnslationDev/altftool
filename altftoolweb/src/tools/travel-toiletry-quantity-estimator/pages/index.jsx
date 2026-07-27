"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplet, RotateCcw } from "lucide-react";

import {
  estimateToiletries,
  HAIR_DOSE_ML,
  LIQUID_BAG_MAX_ML,
  LIQUID_CONTAINER_MAX_ML,
} from "../lib";

const DEFAULTS = {
  days: "7",
  hairLength: "medium",
  washesPerWeek: "4",
  showersPerDay: "1",
  brushingsPerDay: "2",
  sunscreenAppsPerDay: "2",
  shavesPerWeek: "3",
  sanitiserUsesPerDay: "4",
  usesConditioner: true,
  usesFaceMoisturiser: true,
  usesCleanser: true,
  usesDeodorant: true,
  usesBodyLotion: false,
  wearsContactLenses: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const NUMBER_FIELDS = [
  ["days", "Trip length (days)", { min: 1, max: 90, step: 1 }],
  ["washesPerWeek", "Hair washes per week", { min: 0, max: 21, step: 1 }],
  ["showersPerDay", "Showers per day", { min: 0, max: 4, step: 1 }],
  ["brushingsPerDay", "Teeth brushings per day", { min: 0, max: 6, step: 1 }],
  ["sunscreenAppsPerDay", "Sunscreen applications per day", { min: 0, max: 8, step: 1 }],
  ["shavesPerWeek", "Shaves per week", { min: 0, max: 21, step: 1 }],
  ["sanitiserUsesPerDay", "Hand sanitiser uses per day", { min: 0, max: 30, step: 1 }],
];

const TOGGLES = [
  ["usesConditioner", "Conditioner"],
  ["usesFaceMoisturiser", "Face moisturiser"],
  ["usesCleanser", "Cleanser or micellar water"],
  ["usesDeodorant", "Roll-on deodorant"],
  ["usesBodyLotion", "Body lotion"],
  ["wearsContactLenses", "Contact lens solution"],
];

const toNumber = (raw) => {
  const cleaned = String(raw).trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(
    () =>
      estimateToiletries({
        days: toNumber(form.days),
        hairLength: form.hairLength,
        washesPerWeek: toNumber(form.washesPerWeek),
        showersPerDay: toNumber(form.showersPerDay),
        brushingsPerDay: toNumber(form.brushingsPerDay),
        sunscreenAppsPerDay: toNumber(form.sunscreenAppsPerDay),
        shavesPerWeek: toNumber(form.shavesPerWeek),
        sanitiserUsesPerDay: toNumber(form.sanitiserUsesPerDay),
        usesConditioner: form.usesConditioner,
        usesFaceMoisturiser: form.usesFaceMoisturiser,
        usesCleanser: form.usesCleanser,
        usesDeodorant: form.usesDeodorant,
        usesBodyLotion: form.usesBodyLotion,
        wearsContactLenses: form.wearsContactLenses,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Toiletries for ${result.days} days (${result.hairLabel.toLowerCase()} hair)`,
      `${NUM.format(result.totalNeededMl)} ml needed, ${result.totalContainerMl} ml of bottles`,
      result.fitsCabinBag
        ? `Fits the ${LIQUID_BAG_MAX_ML} ml cabin bag with ${result.remainingMl} ml free`
        : `Over the ${LIQUID_BAG_MAX_ML} ml cabin bag by ${result.overflowMl} ml`,
      "",
    ];
    for (const item of result.items) {
      lines.push(
        `  [ ] ${item.name}: ${NUM.format(item.neededMl)} ml — ${item.containerCount} x ${item.containerMl} ml`,
      );
    }
    return lines.join("\n").trim();
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
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Droplet className="h-4 w-4" aria-hidden="true" />
          Packing list
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Toiletry Quantity Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Real per-use doses turned into millilitres, rounded up into travel bottles, and totalled
          against the 1 litre cabin liquids bag.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hair-length">
              Hair length
            </label>
            <select
              id="hair-length"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.hairLength}
              onChange={(event) => setField("hairLength", event.target.value)}
            >
              {Object.entries(HAIR_DOSE_ML).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label} — {meta.shampoo} ml a wash
                </option>
              ))}
            </select>
          </div>
          {NUMBER_FIELDS.map(([key, label, opts]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`field-${key}`}>
                {label}
              </label>
              <input
                id={`field-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min={opts.min}
                max={opts.max}
                step={opts.step}
                value={form[key]}
                onChange={(event) => setField(key, event.target.value)}
              />
            </div>
          ))}
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            What else you use
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {TOGGLES.map(([key, label]) => (
              <label
                key={key}
                htmlFor={`toggle-${key}`}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 text-sm transition ${
                  form[key]
                    ? "border-[var(--primary)] bg-[var(--muted)]"
                    : "border-[var(--border)] bg-[var(--background)]"
                }`}
              >
                <input
                  id={`toggle-${key}`}
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={form[key]}
                  onChange={(event) => setField(key, event.target.checked)}
                />
                {label}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Bottles in the liquids bag
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.totalContainerMl} ml`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see an estimate."
                : result.fitsCabinBag
                  ? `fits the ${LIQUID_BAG_MAX_ML} ml bag, ${result.remainingMl} ml free`
                  : `over the ${LIQUID_BAG_MAX_ML} ml bag by ${result.overflowMl} ml`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the toiletry quantities to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy list"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the estimator"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Product actually used", hasError ? DASH : `${NUM.format(result.totalNeededMl)} ml`],
            ["Average per day", hasError ? DASH : `${NUM.format(result.mlPerDay)} ml`],
            ["Hair washes on the trip", hasError ? DASH : String(result.washes)],
            ["Showers", hasError ? DASH : String(result.showers)],
            ["Brushings", hasError ? DASH : String(result.brushings)],
            [
              "Bag space freed by solid swaps",
              hasError ? DASH : `${result.solidSwapSavingMl} ml`,
            ],
            [
              "Fits after switching to solids",
              hasError ? DASH : result.fitsAfterSolidSwaps ? "Yes" : "Still over",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !result.fitsCabinBag && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {result.overflowMl} ml over the cabin bag. Solid formats do not count towards the limit at
            all, and the biggest single win is usually sunscreen — buy it at the destination instead of
            carrying every bottle through security.
          </p>
        )}
      </section>

      {!hasError && result.items.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-lg font-semibold">Item by item</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Product
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Per use
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Uses
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Needed
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Bottles
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border)] align-top">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{item.name}</span>
                      {item.note && (
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          {item.note}
                        </span>
                      )}
                      {item.solidSwap && (
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          Solid option: {item.solidSwap}
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {NUM.format(item.perUseMl)} ml
                    </td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {item.uses} {item.unitLabel}
                      {item.uses === 1 ? "" : "s"}
                    </td>
                    <td className="py-2 pr-3 font-semibold">{NUM.format(item.neededMl)} ml</td>
                    <td className="py-2">
                      {item.containerCount} x {item.containerMl} ml
                      {item.overSingleContainer && (
                        <span className="block text-xs text-[var(--danger)]">
                          over {LIQUID_CONTAINER_MAX_ML} ml — must be split or bought there
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Doses are typical published figures; your own use may differ, and the per-use column is there
        so you can sanity-check it. This is packing guidance, not medical or dermatological advice.
      </p>
    </main>
  );
}

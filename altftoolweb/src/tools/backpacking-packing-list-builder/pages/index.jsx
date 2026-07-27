"use client";

import { useMemo, useState } from "react";
import { Backpack, Check, Copy, RotateCcw } from "lucide-react";

import { buildBackpackingList, PACK_WEIGHT_RATIO } from "../lib";

const DEFAULTS = {
  nights: "3",
  bodyWeightKg: "70",
  nightLowC: "8",
  resupplyEveryDays: "0",
  waterCapacityL: "2",
  kcalPerDay: "3000",
  tentSharedBy: "2",
  rainExpected: true,
  cooking: true,
  trekkingPoles: true,
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
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const NUMBER_FIELDS = [
  ["nights", "Nights out", { min: 1, max: 40, step: 1 }],
  ["bodyWeightKg", "Your body weight (kg)", { min: 30, max: 200, step: 1 }],
  ["nightLowC", "Expected night low (°C)", { min: -40, max: 40, step: 1 }],
  ["resupplyEveryDays", "Resupply every N days (0 = none)", { min: 0, max: 40, step: 1 }],
  ["waterCapacityL", "Water carried between sources (L)", { min: 0, max: 12, step: 0.5 }],
  ["kcalPerDay", "Daily energy target (kcal)", { min: 1000, max: 8000, step: 100 }],
  ["tentSharedBy", "Tent shared between", { min: 1, max: 4, step: 1 }],
];

const TOGGLES = [
  ["rainExpected", "Rain expected"],
  ["cooking", "Cooking on a stove"],
  ["trekkingPoles", "Trekking poles"],
];

const BAND_LABEL = {
  warm: "Warm nights — no insulation layer needed",
  cool: "Cool nights — fleece or mid-layer",
  cold: "Cold nights — mid-layer plus a puffy, hat and gloves",
  freezing: "Sub-zero nights — full winter sleep and layer system",
};

const toNumber = (raw) => {
  const cleaned = String(raw).trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [ticked, setTicked] = useState({});
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(
    () =>
      buildBackpackingList({
        nights: toNumber(form.nights),
        bodyWeightKg: toNumber(form.bodyWeightKg),
        nightLowC: toNumber(form.nightLowC),
        resupplyEveryDays: toNumber(form.resupplyEveryDays),
        waterCapacityL: toNumber(form.waterCapacityL),
        kcalPerDay: toNumber(form.kcalPerDay),
        tentSharedBy: toNumber(form.tentSharedBy),
        rainExpected: form.rainExpected,
        cooking: form.cooking,
        trekkingPoles: form.trekkingPoles,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const lineCount = hasError
    ? 0
    : result.groups.reduce((total, group) => total + group.items.length, 0);

  const tickedCount = useMemo(() => {
    if (hasError) return 0;
    let count = 0;
    for (const group of result.groups) {
      for (const item of group.items) if (ticked[item.id]) count += 1;
    }
    return count;
  }, [hasError, result, ticked]);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Backpacking list — ${result.nights} nights, ${result.bodyWeightKg} kg hiker`,
      `Loaded pack: ${NUM.format(result.totalKg)} kg (${NUM.format(result.percentOfBodyWeight)}% of body weight)`,
      `Base weight ${NUM.format(result.baseKg)} kg + consumables ${NUM.format(result.consumablesKg)} kg`,
      `Food: ${result.foodDays} days, ${result.foodGrams} g at ${result.foodGramsPerDay} g a day`,
      "",
    ];
    for (const group of result.groups) {
      lines.push(group.name.toUpperCase());
      for (const item of group.items) {
        lines.push(
          `  [ ] ${item.qty} x ${item.name}${item.unit ? ` (${item.unit})` : ""} — ${item.grams} g`,
        );
      }
      lines.push("");
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
    setTicked({});
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Backpack className="h-4 w-4" aria-hidden="true" />
          Packing list
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Backpacking Packing List Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Base weight, food by calorie density and water at a kilogram a litre — measured against the
          20%-of-body-weight carrying rule.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          {NUMBER_FIELDS.map(([key, label, opts]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`field-${key}`}>
                {label}
              </label>
              <input
                id={`field-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
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
          <legend className="text-sm font-semibold text-[var(--foreground)]">Conditions</legend>
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
              Loaded pack weight
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.totalKg)} kg`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a list."
                : `${NUM.format(result.percentOfBodyWeight)}% of body weight — the guideline ceiling is ${Math.round(PACK_WEIGHT_RATIO * 100)}%`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the backpacking list to clipboard"
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
              aria-label="Reset the form and clear ticks"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Base weight (no food, water or fuel)", hasError ? DASH : `${NUM.format(result.baseKg)} kg`],
            ["Consumables", hasError ? DASH : `${NUM.format(result.consumablesKg)} kg`],
            ["20% target for your body weight", hasError ? DASH : `${NUM.format(result.targetKg)} kg`],
            ["15% target if you are new to carrying", hasError ? DASH : `${NUM.format(result.conservativeKg)} kg`],
            [
              "Against the target",
              hasError
                ? DASH
                : result.withinTarget
                  ? `${NUM.format(Math.abs(result.overBy))} kg under`
                  : `${NUM.format(result.overBy)} kg over`,
            ],
            [
              "Food carried",
              hasError
                ? DASH
                : `${result.foodDays} days, ${INT.format(result.foodGrams)} g (${INT.format(result.foodKcal)} kcal)`,
            ],
            ["Water carried", hasError ? DASH : `${NUM.format(result.waterKg)} kg`],
            ["Night conditions", hasError ? DASH : BAND_LABEL[result.band]],
            ["Sleeping bag comfort rating", hasError ? DASH : `${NUM.format(result.bagComfortC)} °C or lower`],
            ["Items on the list", hasError ? DASH : `${result.totalItems} (${tickedCount}/${lineCount} ticked)`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !result.withinTarget && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            This load is over {Math.round(PACK_WEIGHT_RATIO * 100)}% of your body weight. The three
            biggest levers, in order: carry less water between sources, add a resupply so you carry
            fewer food days, then look at the shelter and sleeping bag.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 space-y-4">
          {result.groups.map((group) => (
            <div
              key={group.name}
              className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
            >
              <h2 className="text-lg font-semibold">{group.name}</h2>
              <ul className="mt-3 divide-y divide-[var(--border)]">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <label
                      htmlFor={`item-${item.id}`}
                      className="flex min-h-11 cursor-pointer items-start gap-3 py-2.5"
                    >
                      <input
                        id={`item-${item.id}`}
                        type="checkbox"
                        className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                        checked={Boolean(ticked[item.id])}
                        onChange={(event) =>
                          setTicked((current) => ({ ...current, [item.id]: event.target.checked }))
                        }
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`flex flex-wrap items-baseline justify-between gap-x-3 text-sm font-semibold ${
                            ticked[item.id]
                              ? "text-[var(--muted-foreground)] line-through"
                              : "text-[var(--foreground)]"
                          }`}
                        >
                          <span>
                            {item.qty} x {item.name}
                            {item.unit ? ` (${item.unit})` : ""}
                          </span>
                          <span className="text-[var(--muted-foreground)]">
                            {INT.format(item.grams)} g{item.consumable ? " · consumable" : ""}
                          </span>
                        </span>
                        {item.note && (
                          <span className="block text-xs text-[var(--muted-foreground)]">
                            {item.note}
                          </span>
                        )}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Gear weights are typical three-season figures for planning; weigh your own kit for a real base
        weight. The 20% guideline is a general fitness heuristic, not a medical limit — adjust it down
        for steep ground, altitude, or if you are carrying for the first time.
      </p>
    </main>
  );
}

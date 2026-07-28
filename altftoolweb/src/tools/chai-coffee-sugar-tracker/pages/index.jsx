"use client";

import { useMemo, useState } from "react";
import { Check, Coffee, Copy, RotateCcw } from "lucide-react";
import { DRINKS, trackSugar } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const n0 = (v) => (Number.isFinite(v) ? NUM0.format(v) : DASH);
const n1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const n2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);

const DEFAULT_DAILY = "2000";
const buildDefaults = () => {
  const state = {};
  DRINKS.forEach((drink) => {
    state[drink.id] = {
      cups: drink.id === "masala-chai" ? "3" : "0",
      teaspoons: String(drink.defaultTsp),
    };
  });
  return state;
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL_CLASS = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [drinks, setDrinks] = useState(buildDefaults);
  const [dailyKcal, setDailyKcal] = useState(DEFAULT_DAILY);
  const [copied, setCopied] = useState(false);

  const entries = useMemo(
    () =>
      DRINKS.map((drink) => ({
        id: drink.id,
        cups: drinks[drink.id]?.cups ?? "0",
        teaspoons: drinks[drink.id]?.teaspoons ?? "0",
      })),
    [drinks],
  );

  const result = useMemo(() => trackSugar({ entries, dailyKcal }), [entries, dailyKcal]);

  const ok = !result.error;
  const hasItems = ok && !result.empty;

  const updateDrink = (id, field, value) => {
    setDrinks((current) => ({
      ...current,
      [id]: { ...current[id], [field]: value },
    }));
  };

  const summary = useMemo(() => {
    if (!hasItems) return "";
    const lines = ["Chai and Coffee Sugar Tracker", ""];
    result.lines.forEach((line) => {
      lines.push(
        `${line.name}: ${n0(line.cups)} cups x ${n1(line.teaspoonsPerCup)} tsp — ${n1(line.sugarG)} g sugar, ${n0(line.totalKcal)} kcal`,
      );
    });
    lines.push(
      "",
      `Added sugar: ${n1(result.sugarG)} g a day (${n1(result.teaspoons)} teaspoons), ${n0(result.sugarKcal)} kcal`,
      `Drinks in total: ${n0(result.totalKcal)} kcal, ${n1(result.drinkShareOfDayPct)}% of the day`,
      `That is ${n0(result.pctOfStrongLimit)}% of the WHO 10% free-sugar ceiling (${n0(result.limitStrongGrams)} g)`,
      `Over a year: ${n2(result.yearlySugarKg)} kg of sugar and ${n0(result.yearlySugarKcal)} kcal`,
      `Dropping one teaspoon per cup would save ${n1(result.oneSpoonLessSugarG)} g a day, ${n2(result.oneSpoonLessYearlyKg)} kg a year`,
    );
    return lines.join("\n");
  }, [hasItems, result]);

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
    setDrinks(buildDefaults());
    setDailyKcal(DEFAULT_DAILY);
    setCopied(false);
  };

  const rows = [
    ["Cups a day", hasItems ? n0(result.cups) : DASH],
    ["Teaspoons of sugar a day", hasItems ? n1(result.teaspoons) : DASH],
    ["Calories from that sugar", hasItems ? `${n0(result.sugarKcal)} kcal` : DASH],
    ["Calories from milk and coffee", hasItems ? `${n0(result.baseKcal)} kcal` : DASH],
    [
      "All drinks together",
      hasItems ? `${n0(result.totalKcal)} kcal (${n1(result.drinkShareOfDayPct)}% of the day)` : DASH,
    ],
    [
      "WHO 10% sugar ceiling",
      hasItems ? `${n0(result.limitStrongGrams)} g — you are at ${n0(result.pctOfStrongLimit)}%` : DASH,
    ],
    [
      "WHO 5% further-benefit level",
      hasItems ? `${n0(result.limitConditionalGrams)} g — you are at ${n0(result.pctOfConditionalLimit)}%` : DASH,
    ],
    ["Sugar in a week", hasItems ? `${n0(result.weeklySugarG)} g` : DASH],
    ["Sugar in a month", hasItems ? `${n0(result.monthlySugarG)} g` : DASH],
    ["Sugar in a year", hasItems ? `${n2(result.yearlySugarKg)} kg` : DASH],
    ["Energy from a year of that sugar", hasItems ? `${n0(result.yearlySugarKcal)} kcal` : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Coffee className="h-4 w-4" aria-hidden="true" />
          Indian nutrition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Chai and Coffee Sugar Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set how many cups you drink and how many spoons go into each. The tracker separates the
          sugar from the milk, checks it against WHO free-sugar guidance and scales it to a year.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ccs-daily">
              Your daily calorie intake (kcal)
            </label>
            <input
              id="ccs-daily"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="800"
              max="6000"
              step="50"
              value={dailyKcal}
              onChange={(event) => setDailyKcal(event.target.value)}
            />
          </div>
        </div>

        <ul className="mt-5 divide-y divide-[var(--border)]">
          {DRINKS.map((drink) => (
            <li key={drink.id} className="py-4">
              <p className="text-sm font-semibold">{drink.name}</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {drink.serving} · {n0(drink.baseKcal)} kcal before sugar
              </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={SMALL_LABEL_CLASS} htmlFor={`ccs-cups-${drink.id}`}>
                    Cups a day
                  </label>
                  <input
                    id={`ccs-cups-${drink.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="30"
                    step="1"
                    value={drinks[drink.id]?.cups ?? "0"}
                    onChange={(event) => updateDrink(drink.id, "cups", event.target.value)}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL_CLASS} htmlFor={`ccs-tsp-${drink.id}`}>
                    Teaspoons of sugar per cup
                  </label>
                  <input
                    id={`ccs-tsp-${drink.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="20"
                    step="0.5"
                    value={drinks[drink.id]?.teaspoons ?? "0"}
                    onChange={(event) => updateDrink(drink.id, "teaspoons", event.target.value)}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {result.error ? (
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
              Added sugar a day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasItems ? `${n1(result.sugarG)} g` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasItems
                ? `${n1(result.teaspoons)} teaspoons across ${n0(result.cups)} cups — ${n0(result.sugarKcal)} kcal`
                : "Set the cups above to see your total."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy chai and coffee sugar summary"
              className={GHOST_BTN}
              disabled={!hasItems}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {hasItems ? (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              result.overStrongLimit
                ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)]"
            }`}
          >
            {result.overStrongLimit
              ? `Your drinks alone are past the WHO 10% free-sugar ceiling of ${n0(result.limitStrongGrams)} g a day.`
              : `Your drinks use ${n0(result.pctOfStrongLimit)}% of the ${n0(result.limitStrongGrams)} g WHO free-sugar ceiling, before food.`}
          </p>
        ) : null}

        {hasItems && result.oneSpoonLessSugarG > 0 ? (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Taking one teaspoon less in every cup would drop {n1(result.oneSpoonLessSugarG)} g of
            sugar a day — {n2(result.oneSpoonLessYearlyKg)} kg and{" "}
            {n0(result.oneSpoonLessYearlyKcal)} kcal over a year.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {hasItems ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Drink by drink</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Drink</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Cups</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Sugar</th>
                  <th scope="col" className="py-2 text-right font-semibold">kcal</th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line) => (
                  <tr key={line.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{line.name}</td>
                    <td className="py-2 pr-3 text-right">{n1(line.cups)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {n1(line.sugarG)} g
                    </td>
                    <td className="py-2 text-right">{n0(line.totalKcal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A level teaspoon of sugar is taken as 4 g; heaped spoons run closer to 6 g, so the real
        figure is often higher than the one shown. Base calories depend on how much milk goes in.
        General nutrition information, not dietary or medical advice.
      </p>
    </main>
  );
}

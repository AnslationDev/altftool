"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Refrigerator, RotateCcw } from "lucide-react";

import { BUYING_HABITS, FREEZER_STYLES, selectFreezer } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = {
  basis: "people",
  people: "4",
  habit: "moderate",
  foodKg: "100",
  style: "chest",
  backupHours: "4",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [basis, setBasis] = useState(DEFAULTS.basis);
  const [people, setPeople] = useState(DEFAULTS.people);
  const [habit, setHabit] = useState(DEFAULTS.habit);
  const [foodKg, setFoodKg] = useState(DEFAULTS.foodKg);
  const [style, setStyle] = useState(DEFAULTS.style);
  const [backupHours, setBackupHours] = useState(DEFAULTS.backupHours);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => selectFreezer({ basis, people, habit, foodKg, style, backupHours }),
    [basis, people, habit, foodKg, style, backupHours],
  );

  const failed = Boolean(result.error);

  const headline = failed
    ? DASH
    : result.units > 1
      ? `${result.units} × ${INT.format(result.unitLitres)} L`
      : `${INT.format(result.unitLitres)} L`;

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Deep Freezer Size Selector",
      `Style: ${result.styleLabel}`,
      `Sizing basis: ${result.basisNote}`,
      `Net storage needed: ${INT.format(result.requiredNetLitres)} L`,
      `Gross capacity needed: ${INT.format(result.requiredGrossLitres)} L (${NUM.format(result.requiredCubicFeet)} ft³)`,
      `Buy: ${headline} (${INT.format(result.totalLitres)} L total, ${NUM.format(result.totalCubicFeet)} ft³)`,
      `Holds about ${INT.format(result.foodCapacityKg)} kg of packed food`,
      `Fill level at your requirement: ${INT.format(result.fillPercent)}%`,
      `Safe holdover in a power cut: about ${NUM.format(result.holdoverHours)} hours`,
      `Running load: ${INT.format(result.runningWatts)} W, averaging ${INT.format(result.averageWatts)} W`,
      `Energy: ${NUM.format(result.dailyKwh)} kWh/day, about ${INT.format(result.annualKwh)} kWh/year`,
      `For ${result.backupHours} h of backup: ${INT.format(result.batteryAh)} Ah at 12 V, inverter ${INT.format(result.inverterVa)} VA or more`,
    ].join("\n");
  }, [failed, result, headline]);

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
    setBasis(DEFAULTS.basis);
    setPeople(DEFAULTS.people);
    setHabit(DEFAULTS.habit);
    setFoodKg(DEFAULTS.foodKg);
    setStyle(DEFAULTS.style);
    setBackupHours(DEFAULTS.backupHours);
    setCopied(false);
  };

  const rows = failed
    ? [
        ["Net storage needed", DASH],
        ["Gross capacity needed", DASH],
        ["Total capacity you would buy", DASH],
        ["Packed food it holds", DASH],
        ["Fill level at your requirement", DASH],
        ["Safe holdover in a power cut", DASH],
        ["Compressor running load", DASH],
        ["Energy use", DASH],
        ["Battery bank for backup", DASH],
        ["Minimum inverter rating", DASH],
      ]
    : [
        ["Net storage needed", `${INT.format(result.requiredNetLitres)} L`],
        [
          "Gross capacity needed",
          `${INT.format(result.requiredGrossLitres)} L (${NUM.format(result.requiredCubicFeet)} ft³)`,
        ],
        [
          "Total capacity you would buy",
          `${INT.format(result.totalLitres)} L (${NUM.format(result.totalCubicFeet)} ft³)`,
        ],
        ["Packed food it holds", `${INT.format(result.foodCapacityKg)} kg`],
        ["Fill level at your requirement", `${INT.format(result.fillPercent)}%`],
        ["Safe holdover in a power cut", `about ${NUM.format(result.holdoverHours)} h`],
        [
          "Compressor running load",
          `${INT.format(result.runningWatts)} W (avg ${INT.format(result.averageWatts)} W)`,
        ],
        [
          "Energy use",
          `${NUM.format(result.dailyKwh)} kWh/day · ${INT.format(result.annualKwh)} kWh/yr`,
        ],
        [
          "Battery bank for backup",
          `${INT.format(result.batteryAh)} Ah at 12 V for ${result.backupHours} h`,
        ],
        ["Minimum inverter rating", `${INT.format(result.inverterVa)} VA`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Refrigerator className="h-4 w-4" aria-hidden="true" />
          Appliance sizing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Deep Freezer Size Selector
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turns household size or stock weight into freezer litres, allowing for packing efficiency,
          then reports how long the load stays frozen without power and what battery bank would keep
          it running.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fz-basis">
              Size it by
            </label>
            <select
              id="fz-basis"
              className={`mt-2 ${INPUT_CLASS}`}
              value={basis}
              onChange={(event) => setBasis(event.target.value)}
            >
              <option value="people">Household size</option>
              <option value="weight">Weight of food to store</option>
            </select>
          </div>

          {basis === "people" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="fz-people">
                  People in the household
                </label>
                <input
                  id="fz-people"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="50"
                  step="1"
                  value={people}
                  onChange={(event) => setPeople(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="fz-habit">
                  Buying habit
                </label>
                <select
                  id="fz-habit"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={habit}
                  onChange={(event) => setHabit(event.target.value)}
                >
                  {Object.values(BUYING_HABITS).map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="fz-kg">
                Food to store (kg)
              </label>
              <input
                id="fz-kg"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="1"
                max="5000"
                step="5"
                value={foodKg}
                onChange={(event) => setFoodKg(event.target.value)}
              />
            </div>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="fz-style">
              Freezer style
            </label>
            <select
              id="fz-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={style}
              onChange={(event) => setStyle(event.target.value)}
            >
              {Object.values(FREEZER_STYLES).map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fz-backup">
              Power backup wanted (hours)
            </label>
            <input
              id="fz-backup"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="72"
              step="1"
              value={backupHours}
              onChange={(event) => setBackupHours(event.target.value)}
            />
          </div>
        </div>
      </section>

      {failed && (
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
              Freezer to buy
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? "Fix the input above to see a size." : result.basisNote}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy freezer sizing result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Before you buy</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
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
        Informational sizing only. Holdover figures assume the lid stays shut and follow USDA
        guidance of about 48 hours for a full freezer and 24 for a half-full one; if food has warmed
        above 4 °C for more than two hours, follow food-safety advice rather than refreezing it.
      </p>
    </main>
  );
}

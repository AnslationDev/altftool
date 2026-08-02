"use client";

import { useMemo, useState } from "react";
import { CakeSlice, Check, Copy, RotateCcw } from "lucide-react";
import { DEFAULT_DAILY_KCAL, FESTIVAL_SWEETS, summariseSweets, sweetGroups } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const n0 = (v) => (Number.isFinite(v) ? NUM0.format(v) : DASH);
const n1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);

const DEFAULT_BOX = { "gulab-jamun": 2, "kaju-katli": 1 };
const DEFAULT_DAILY = String(DEFAULT_DAILY_KCAL);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const STEP_BTN =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-lg font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const GROUPS = sweetGroups();

export default function ToolHome() {
  const [box, setBox] = useState(DEFAULT_BOX);
  const [dailyKcal, setDailyKcal] = useState(DEFAULT_DAILY);
  const [activeGroup, setActiveGroup] = useState(GROUPS[0]);
  const [copied, setCopied] = useState(false);

  const selections = useMemo(
    () => Object.entries(box).map(([id, pieces]) => ({ id, pieces })),
    [box],
  );

  const result = useMemo(() => summariseSweets({ selections, dailyKcal }), [selections, dailyKcal]);

  const ok = !result.error;
  const hasItems = ok && !result.empty;

  const changePieces = (id, delta) => {
    setBox((current) => {
      const next = { ...current };
      const value = (next[id] ?? 0) + delta;
      if (value <= 0) delete next[id];
      else next[id] = Math.min(30, value);
      return next;
    });
  };

  const summary = useMemo(() => {
    if (!hasItems) return "";
    const lines = ["Festival Sweet Calorie Calculator", ""];
    result.lines.forEach((line) => {
      lines.push(
        `${line.name} x${line.pieces} (${line.piece}) — ${n0(line.kcal)} kcal, ${n1(line.sugar)} g sugar`,
      );
    });
    lines.push(
      "",
      `Total: ${n0(result.kcal)} kcal (range ${n0(result.kcalLow)}-${n0(result.kcalHigh)})`,
      `Added sugar: ${n1(result.sugar)} g, about ${n1(result.sugarTeaspoons)} teaspoons`,
      `That is ${n0(result.pctOfStrongLimit)}% of the WHO 10% free-sugar ceiling (${n0(result.limitStrongGrams)} g on ${n0(result.dailyKcal)} kcal)`,
      `Fat: ${n1(result.fat)} g · ${n1(result.shareOfDayPct)}% of the day's energy`,
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
    if (hasItems && !window.confirm("Reset the box? Your current sweet selections will be cleared.")) {
      return;
    }
    setBox(DEFAULT_BOX);
    setDailyKcal(DEFAULT_DAILY);
    setActiveGroup(GROUPS[0]);
    setCopied(false);
  };

  const rows = [
    ["Pieces counted", hasItems ? n0(result.pieces) : DASH],
    ["Estimate range", hasItems ? `${n0(result.kcalLow)} – ${n0(result.kcalHigh)} kcal` : DASH],
    ["Added sugar", hasItems ? `${n1(result.sugar)} g` : DASH],
    ["Sugar in teaspoons", hasItems ? `${n1(result.sugarTeaspoons)} tsp` : DASH],
    ["Sugar as share of the sweets", hasItems ? `${n0(result.sugarShareOfSweetPct)}% of their calories` : DASH],
    ["Fat", hasItems ? `${n1(result.fat)} g` : DASH],
    ["Share of the day's energy", hasItems ? `${n1(result.shareOfDayPct)}%` : DASH],
    [
      "WHO 10% sugar ceiling",
      hasItems ? `${n0(result.limitStrongGrams)} g — you are at ${n0(result.pctOfStrongLimit)}%` : DASH,
    ],
    [
      "WHO 5% further-benefit level",
      hasItems ? `${n0(result.limitConditionalGrams)} g — you are at ${n0(result.pctOfConditionalLimit)}%` : DASH,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CakeSlice className="h-4 w-4" aria-hidden="true" />
          Indian nutrition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Festival Sweet Calorie Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Count the mithai from the box — laddoo, barfi, gulab jamun, halwa — and see the calories,
          the added sugar in grams and teaspoons, and how it sits against the WHO free-sugar ceiling.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fsc-daily">
              Your daily calorie intake (kcal)
            </label>
            <input
              id="fsc-daily"
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

        <div className="mt-5">
          <p className="text-sm font-semibold text-[var(--foreground)]">Pick a section</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {GROUPS.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => setActiveGroup(group)}
                aria-pressed={activeGroup === group}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  activeGroup === group
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-4 divide-y divide-[var(--border)]">
          {FESTIVAL_SWEETS.filter((sweet) => sweet.group === activeGroup).map((sweet) => (
            <li key={sweet.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{sweet.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {sweet.piece} ({sweet.grams} g) · about {n0(sweet.kcal)} kcal · {n1(sweet.sugar)} g sugar
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={STEP_BTN}
                  onClick={() => changePieces(sweet.id, -1)}
                  aria-label={`Remove one ${sweet.name}`}
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
                  {box[sweet.id] ?? 0}
                </span>
                <button
                  type="button"
                  className={STEP_BTN}
                  onClick={() => changePieces(sweet.id, 1)}
                  aria-label={`Add one ${sweet.name}`}
                >
                  +
                </button>
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
              Total for the box
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasItems ? `${n0(result.kcal)} kcal` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasItems
                ? `${n1(result.sugar)} g added sugar — about ${n1(result.sugarTeaspoons)} teaspoons`
                : "Add a sweet above to see the totals."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy sweet calorie summary"
              className={GHOST_BTN}
              disabled={!hasItems}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the box" className={PRIMARY_BTN}>
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
              ? `This is already past the WHO 10% free-sugar ceiling of ${n0(result.limitStrongGrams)} g for a ${n0(result.dailyKcal)} kcal day, before anything else you eat.`
              : `That uses ${n0(result.pctOfStrongLimit)}% of the ${n0(result.limitStrongGrams)} g free-sugar ceiling WHO puts at 10% of a ${n0(result.dailyKcal)} kcal day.`}
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
          <h2 className="text-base font-semibold">What is in the box</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Sweet</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Pieces</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">kcal</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Sugar</th>
                  <th scope="col" className="py-2 text-right font-semibold">Fat</th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line) => (
                  <tr key={line.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{line.name}</td>
                    <td className="py-2 pr-3 text-right">{n0(line.pieces)}</td>
                    <td className="py-2 pr-3 text-right">{n0(line.kcal)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {n1(line.sugar)} g
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">{n1(line.fat)} g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Mithai has no standard recipe, so these are typical shop pieces with roughly a 20% band
        either side — more ghee, longer syrup soak or a bigger piece pushes the figure up. General
        nutrition information only, not dietary or medical advice; if you have diabetes or another
        condition, plan festival eating with your doctor or a registered dietitian.
      </p>
    </main>
  );
}

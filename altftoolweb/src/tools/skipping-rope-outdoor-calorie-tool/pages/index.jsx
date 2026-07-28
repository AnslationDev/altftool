"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Timer } from "lucide-react";

import { REST_MODES, computeIntervalSkipping, minutesForTarget } from "../lib";

const DEFAULTS = {
  weightKg: "70",
  rounds: "10",
  workSeconds: "60",
  restSeconds: "30",
  skipsPerMinute: "120",
  restMode: "standing",
  targetKcal: "300",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const toNumber = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return NaN;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : NaN;
};

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeIntervalSkipping({
        weightKg: toNumber(values.weightKg),
        rounds: toNumber(values.rounds),
        workSeconds: toNumber(values.workSeconds),
        restSeconds: toNumber(values.restSeconds),
        skipsPerMinute: toNumber(values.skipsPerMinute),
        restMode: values.restMode,
      }),
    [values],
  );

  const hasError = Boolean(result.error);

  const targetMinutes = useMemo(() => {
    if (hasError) return null;
    return minutesForTarget({
      weightKg: toNumber(values.weightKg),
      met: result.met,
      targetKcal: toNumber(values.targetKcal),
    });
  }, [hasError, result, values.targetKcal, values.weightKg]);

  const update = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const reset = () => {
    setValues(DEFAULTS);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Skipping Rope Outdoor Calorie Tool",
      `Session: ${NUM0.format(result.rounds ?? Number(values.rounds))} rounds`,
      `Work time: ${NUM1.format(result.workMinutes)} min`,
      `Recovery time: ${NUM1.format(result.restMinutes)} min (${result.restLabel})`,
      `Skip pace: ${values.skipsPerMinute} skips/min (${result.bandLabel})`,
      `Gross calories: ${NUM0.format(result.grossKcal)} kcal`,
      `Net calories: ${NUM0.format(result.netKcal)} kcal`,
      `Total skips: ${NUM0.format(result.totalSkips)}`,
    ].join("\n");
  }, [hasError, result, values.rounds, values.skipsPerMinute]);

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

  const rows = hasError
    ? [
        ["Session time", DASH],
        ["Work calories", DASH],
        ["Recovery calories", DASH],
        ["Total skips", DASH],
        ["Calories / minute", DASH],
        ["Calories / 100 skips", DASH],
      ]
    : [
        ["Session time", `${NUM1.format(result.sessionMinutes)} min`],
        ["Work calories", `${NUM0.format(result.workKcal)} kcal`],
        ["Recovery calories", `${NUM0.format(result.restKcal)} kcal`],
        ["Total skips", NUM0.format(result.totalSkips)],
        ["Calories / minute", `${NUM1.format(result.kcalPerMinute)} kcal`],
        ["Calories / 100 skips", `${NUM2.format(result.kcalPer100Skips)} kcal`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Outdoor fitness
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Skipping Rope Outdoor Calorie Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Estimate jump-rope calories from rounds, pace and recovery gaps using published
          Compendium MET values.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="skip-weight">
              Body weight (kg)
            </label>
            <input id="skip-weight" className={`mt-2 ${INPUT_CLASS}`} type="number" min="20" max="300" step="0.5" value={values.weightKg} onChange={(event) => update("weightKg", event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="skip-rounds">
              Rounds
            </label>
            <input id="skip-rounds" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" max="100" step="1" value={values.rounds} onChange={(event) => update("rounds", event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="skip-work">
              Work per round (seconds)
            </label>
            <input id="skip-work" className={`mt-2 ${INPUT_CLASS}`} type="number" min="5" step="5" value={values.workSeconds} onChange={(event) => update("workSeconds", event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="skip-rest">
              Rest between rounds (seconds)
            </label>
            <input id="skip-rest" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" step="5" value={values.restSeconds} onChange={(event) => update("restSeconds", event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="skip-pace">
              Skip rate (skips/min)
            </label>
            <input id="skip-pace" className={`mt-2 ${INPUT_CLASS}`} type="number" min="20" max="250" step="1" value={values.skipsPerMinute} onChange={(event) => update("skipsPerMinute", event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="skip-rest-mode">
              Recovery style
            </label>
            <select id="skip-rest-mode" className={`mt-2 ${INPUT_CLASS}`} value={values.restMode} onChange={(event) => update("restMode", event.target.value)}>
              {REST_MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="skip-target">
              Target calories for pace estimate
            </label>
            <input id="skip-target" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" step="10" value={values.targetKcal} onChange={(event) => update("targetKcal", event.target.value)} />
          </div>
        </div>
      </section>

      {hasError && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Gross session calories
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM0.format(result.grossKcal)} kcal`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see the session."
                : `${NUM0.format(result.netKcal)} kcal above resting, at ${NUM1.format(result.met)} METs.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} disabled={hasError} className={`${GHOST_BTN} disabled:opacity-50`}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
              <dt className="text-xs font-medium text-[var(--muted-foreground)]">{label}</dt>
              <dd className="mt-1 text-sm font-semibold text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && targetMinutes && (
          <p className="mt-5 rounded-lg bg-[var(--surface-soft)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
            At this pace, {NUM0.format(Number(values.targetKcal))} kcal needs about{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {NUM1.format(targetMinutes)} minutes
            </span>{" "}
            of actual rope work before recovery gaps.
          </p>
        )}
      </section>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, RotateCcw } from "lucide-react";

import {
  BASELINE_METHODS,
  BEDTIME_CUTOFF_HOURS,
  CLIMATES,
  MAX_SERVING_ML,
  MIN_SERVING_ML,
  SEXES,
  computeSeniorHydrationPlan,
  parseClock,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const ML = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const LITRES = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  baseline: "espen",
  sex: "female",
  bodyMassKg: "62",
  climate: "temperate",
  prescribedLimitMl: "",
  wake: "07:00",
  bed: "22:00",
  servingMl: "200",
  breakfast: "08:00",
  lunch: "13:00",
  dinner: "19:00",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const plan = useMemo(() => {
    const meals = [
      { label: "Breakfast", minute: parseClock(form.breakfast) },
      { label: "Lunch", minute: parseClock(form.lunch) },
      { label: "Dinner", minute: parseClock(form.dinner) },
    ].filter((meal) => Number.isFinite(meal.minute));

    return computeSeniorHydrationPlan({
      baseline: form.baseline,
      sex: form.sex,
      bodyMassKg: toNumber(form.bodyMassKg),
      climate: form.climate,
      prescribedLimitMl: toNumber(form.prescribedLimitMl),
      wakeMinute: parseClock(form.wake),
      bedMinute: parseClock(form.bed),
      servingMl: toNumber(form.servingMl),
      meals,
    });
  }, [form]);

  const error = plan.error || null;

  const handleCopy = async () => {
    if (error) return;
    const lines = [
      `Hydration plan — ${ML.format(plan.targetMl)} ml of drinks a day (${LITRES.format(plan.targetL)} L)`,
      `${plan.servingCount} servings of about ${ML.format(plan.servingMl)} ml, last drink by ${plan.cutoffTime}`,
      "",
      ...plan.servings.map(
        (serving, index) =>
          `${index + 1}. ${serving.time} — ${ML.format(serving.ml)} ml${serving.anchor ? ` (with ${serving.anchor.toLowerCase()})` : ""}`,
      ),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-6">
      <section className="grid gap-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--foreground)]">
          <Droplets aria-hidden="true" className="h-5 w-5 text-[var(--primary)]" />
          The person and the day
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="sh-baseline">
              How to set the target
            </label>
            <select
              className={INPUT_CLASS}
              id="sh-baseline"
              onChange={set("baseline")}
              value={form.baseline}
            >
              {Object.entries(BASELINE_METHODS).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>

          {form.baseline === "espen" ? (
            <div className="grid gap-1.5">
              <label className={LABEL_CLASS} htmlFor="sh-sex">
                Target set for
              </label>
              <select className={INPUT_CLASS} id="sh-sex" onChange={set("sex")} value={form.sex}>
                {Object.entries(SEXES).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid gap-1.5">
              <label className={LABEL_CLASS} htmlFor="sh-mass">
                Body weight (kg)
              </label>
              <input
                className={INPUT_CLASS}
                id="sh-mass"
                inputMode="decimal"
                onChange={set("bodyMassKg")}
                type="text"
                value={form.bodyMassKg}
              />
            </div>
          )}

          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="sh-climate">
              Conditions today
            </label>
            <select
              className={INPUT_CLASS}
              id="sh-climate"
              onChange={set("climate")}
              value={form.climate}
            >
              {Object.entries(CLIMATES).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="sh-limit">
              Prescribed daily fluid limit (ml, optional)
            </label>
            <input
              className={INPUT_CLASS}
              id="sh-limit"
              inputMode="numeric"
              onChange={set("prescribedLimitMl")}
              placeholder="Leave blank if none"
              type="text"
              value={form.prescribedLimitMl}
            />
          </div>

          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="sh-wake">
              Wake-up time
            </label>
            <input
              className={INPUT_CLASS}
              id="sh-wake"
              onChange={set("wake")}
              type="time"
              value={form.wake}
            />
          </div>

          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="sh-bed">
              Bedtime
            </label>
            <input
              className={INPUT_CLASS}
              id="sh-bed"
              onChange={set("bed")}
              type="time"
              value={form.bed}
            />
          </div>

          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="sh-serving">
              Comfortable serving size (ml)
            </label>
            <input
              className={INPUT_CLASS}
              id="sh-serving"
              inputMode="numeric"
              max={MAX_SERVING_ML}
              min={MIN_SERVING_ML}
              onChange={set("servingMl")}
              type="number"
              value={form.servingMl}
            />
          </div>
        </div>

        <fieldset className="grid gap-4 sm:grid-cols-3">
          <legend className="mb-2 text-sm font-semibold text-[var(--foreground)]">
            Meal times to anchor drinks to
          </legend>
          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="sh-breakfast">
              Breakfast
            </label>
            <input
              className={INPUT_CLASS}
              id="sh-breakfast"
              onChange={set("breakfast")}
              type="time"
              value={form.breakfast}
            />
          </div>
          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="sh-lunch">
              Lunch
            </label>
            <input
              className={INPUT_CLASS}
              id="sh-lunch"
              onChange={set("lunch")}
              type="time"
              value={form.lunch}
            />
          </div>
          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="sh-dinner">
              Dinner
            </label>
            <input
              className={INPUT_CLASS}
              id="sh-dinner"
              onChange={set("dinner")}
              type="time"
              value={form.dinner}
            />
          </div>
        </fieldset>
      </section>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        {error ? (
          <p
            className="mb-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-semibold text-[var(--danger)]"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <p className="text-sm font-semibold text-[var(--muted-foreground)]">Drinks to aim for today</p>
        <p className="text-4xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl">
          {error ? "—" : `${ML.format(plan.targetMl)} ml`}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {error
            ? "—"
            : `${LITRES.format(plan.targetL)} litres · ${plan.servingCount} servings of about ${ML.format(plan.servingMl)} ml`}
        </p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="grid gap-0.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Baseline from the chosen method
            </dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error ? "—" : `${ML.format(plan.baseDrinksMl)} ml`}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Added for the weather
            </dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error ? "—" : `${ML.format(plan.climateMl)} ml`}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Guideline total before any restriction
            </dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error ? "—" : `${ML.format(plan.guidanceMl)} ml`}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Prescribed limit applied
            </dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error || !plan.restricted ? "—" : `${ML.format(plan.prescribedLimitMl)} ml`}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Gap between drinks
            </dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error ? "—" : `about ${NUM.format(Math.round(plan.intervalMin))} minutes`}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Last drink of the day by
            </dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error ? "—" : plan.cutoffTime}
            </dd>
          </div>
        </dl>

        {!error && plan.restrictionBinding ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-semibold text-[var(--danger)]">
            The prescribed limit is lower than the guideline figure, so the plan follows the limit. Keep
            following the clinician&apos;s instruction.
          </p>
        ) : null}
        {!error && plan.aboveCeiling ? (
          <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-semibold text-[var(--danger)]">
            This works out above {ML.format(plan.ceilingMl)} ml a day. That is more than most older adults
            should drink without being asked about it first — check with a clinician before following it.
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            aria-label="Copy the drinking schedule to the clipboard"
            className={PRIMARY_BTN}
            onClick={handleCopy}
            type="button"
          >
            {copied ? (
              <Check aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Copy aria-hidden="true" className="h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy schedule"}
          </button>
          <button aria-label="Reset all inputs" className={GHOST_BTN} onClick={reset} type="button">
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Reset
          </button>
        </div>
      </section>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-bold text-[var(--foreground)]">Prompt times</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[24rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="py-2 pr-3 font-semibold text-[var(--muted-foreground)]" scope="col">
                  #
                </th>
                <th className="py-2 pr-3 font-semibold text-[var(--muted-foreground)]" scope="col">
                  Time
                </th>
                <th className="py-2 pr-3 font-semibold text-[var(--muted-foreground)]" scope="col">
                  Amount
                </th>
                <th className="py-2 font-semibold text-[var(--muted-foreground)]" scope="col">
                  Anchor
                </th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={4}>
                    —
                  </td>
                </tr>
              ) : (
                plan.servings.map((serving, index) => (
                  <tr className="border-b border-[var(--border)]" key={`${serving.time}-${index}`}>
                    <td className="py-3 pr-3 text-[var(--muted-foreground)]">{index + 1}</td>
                    <td className="py-3 pr-3 font-semibold whitespace-nowrap text-[var(--foreground)]">
                      {serving.time}
                    </td>
                    <td className="py-3 pr-3 text-[var(--foreground)]">{ML.format(serving.ml)} ml</td>
                    <td className="py-3 text-[var(--muted-foreground)]">
                      {serving.anchor || "Routine prompt"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-[var(--muted-foreground)]">
        The schedule stops {BEDTIME_CUTOFF_HOURS} hours before bedtime to reduce night waking and the fall
        risk that comes with it. This is general information, not medical advice. Anyone with heart
        failure, kidney disease, or a clinician-set fluid restriction should follow the restriction they
        were given rather than the guideline figure.
      </p>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mountain, RotateCcw } from "lucide-react";

import { CLIMBING_DISCIPLINES, computeClimbingBurn } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const show = (value, formatter = NUM0) =>
  Number.isFinite(value) ? formatter.format(value) : DASH;

const DEFAULTS = {
  weight: "68",
  weightUnit: "kg",
  sessionMinutes: "120",
  disciplineId: "lead",
  climbs: "8",
  minutesPerClimb: "6",
  heightPerClimb: "15",
  heightUnit: "m",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const result = useMemo(
    () =>
      computeClimbingBurn({
        weight: toNumber(values.weight),
        weightUnit: values.weightUnit,
        sessionMinutes: toNumber(values.sessionMinutes),
        disciplineId: values.disciplineId,
        climbs: toNumber(values.climbs),
        minutesPerClimb: toNumber(values.minutesPerClimb),
        heightPerClimb: toNumber(values.heightPerClimb),
        heightUnit: values.heightUnit,
      }),
    [values],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Rock Climbing Calorie Estimate",
      `Body weight: ${NUM1.format(result.weightKg)} kg`,
      `Discipline: ${result.disciplineLabel} — ${result.met} MET`,
      `Session: ${values.sessionMinutes} min (${result.wallMinutes} min on the wall, ${result.restMinutes} min resting)`,
      `Total calories: ${NUM0.format(result.grossKcal)} kcal`,
      `Net of resting metabolism: ${NUM0.format(result.netKcal)} kcal`,
      `Per route or problem: ${NUM1.format(result.kcalPerClimb)} kcal`,
    ];
    if (result.liftingKcal !== null) {
      lines.push(
        `Vertical gain: ${NUM1.format(result.totalMetres)} m — ${NUM1.format(result.mechanicalKj)} kJ of lifting work, about ${NUM0.format(result.liftingKcal)} kcal`,
      );
    }
    return lines.join("\n");
  }, [hasError, result, values.sessionMinutes]);

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
    setValues(DEFAULTS);
    setCopied(false);
  };

  const rows = [
    ["From time on the wall", hasError ? DASH : `${show(result.wallKcal)} kcal`],
    ["From belaying and rest", hasError ? DASH : `${show(result.restKcal)} kcal`],
    ["Net of resting metabolism", hasError ? DASH : `${show(result.netKcal)} kcal`],
    ["Per route or problem", hasError ? DASH : `${show(result.kcalPerClimb, NUM1)} kcal`],
    ["Rate while climbing", hasError ? DASH : `${show(result.kcalPerMinute, NUM2)} kcal/min`],
    ["Non-stop hour of climbing", hasError ? DASH : `${show(result.kcalPerHour)} kcal`],
    ["Minutes on the wall", hasError ? DASH : `${show(result.wallMinutes, NUM1)} min`],
    ["Share of session climbing", hasError ? DASH : `${show(result.wallSharePercent)}%`],
    ["Average MET across the session", hasError ? DASH : show(result.averageMet, NUM2)],
    ["Body-fat equivalent", hasError ? DASH : `${show(result.fatGramsEquivalent, NUM1)} g`],
  ];

  const verticalRows = [
    ["Vertical metres gained", hasError ? DASH : `${show(result.totalMetres, NUM1)} m`],
    ["Mechanical work done", hasError ? DASH : `${show(result.mechanicalKj, NUM1)} kJ`],
    [
      "Energy that lifting alone accounts for",
      hasError || result.liftingKcal === null ? DASH : `${show(result.liftingKcal)} kcal`,
    ],
    [
      "Share of the session total",
      hasError || result.liftingSharePercent === null
        ? DASH
        : `${show(result.liftingSharePercent)}%`,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Mountain className="h-4 w-4" aria-hidden="true" />
          Outdoor calories
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Rock Climbing Calorie Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two hours at the wall is rarely two hours of climbing. Enter how many routes or problems
          you did and how long each took, and the rest of the session is priced as belaying rather
          than as climbing.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="climb-weight">
              Body weight
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="climb-weight"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="25"
                step="0.5"
                value={values.weight}
                onChange={(event) => update("weight", event.target.value)}
              />
              <select
                aria-label="Weight unit"
                className={`${INPUT_CLASS} w-24`}
                value={values.weightUnit}
                onChange={(event) => update("weightUnit", event.target.value)}
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="climb-session">
              Total session length (minutes)
            </label>
            <input
              id="climb-session"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="600"
              step="10"
              value={values.sessionMinutes}
              onChange={(event) => update("sessionMinutes", event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="climb-discipline">
              What you were climbing
            </label>
            <select
              id="climb-discipline"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.disciplineId}
              onChange={(event) => update("disciplineId", event.target.value)}
            >
              {CLIMBING_DISCIPLINES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.met} MET)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="climb-count">
              Routes or problems attempted
            </label>
            <input
              id="climb-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="200"
              step="1"
              value={values.climbs}
              onChange={(event) => update("climbs", event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="climb-minutes">
              Minutes on the wall per attempt
            </label>
            <input
              id="climb-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.25"
              max="60"
              step="0.5"
              value={values.minutesPerClimb}
              onChange={(event) => update("minutesPerClimb", event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="climb-height">
              Height gained per attempt (optional)
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="climb-height"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="0"
                max="300"
                step="0.5"
                value={values.heightPerClimb}
                onChange={(event) => update("heightPerClimb", event.target.value)}
              />
              <select
                aria-label="Height unit"
                className={`${INPUT_CLASS} w-24`}
                value={values.heightUnit}
                onChange={(event) => update("heightUnit", event.target.value)}
              >
                <option value="m">m</option>
                <option value="ft">ft</option>
              </select>
            </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Calories for the session
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${show(result.grossKcal)} kcal`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see an estimate."
                : `${show(result.wallMinutes, NUM1)} min climbing, ${show(result.restMinutes, NUM1)} min resting`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy rock climbing calorie result"
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
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.basis} Rest and belay time is priced at 2.0 MET.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The physics cross-check</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Raising your body through a height costs a fixed amount of mechanical work — mass times
          gravity times height. At a gross muscular efficiency of about 25%, that is what the pure
          lifting accounts for. Everything above it is grip, core tension, footwork and the effort of
          simply staying on.
        </p>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {verticalRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">This session at each discipline</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Discipline
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  MET
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Session total
                </th>
              </tr>
            </thead>
            <tbody>
              {CLIMBING_DISCIPLINES.map((item) => {
                const row = computeClimbingBurn({
                  weight: toNumber(values.weight),
                  weightUnit: values.weightUnit,
                  sessionMinutes: toNumber(values.sessionMinutes),
                  disciplineId: item.id,
                  climbs: toNumber(values.climbs),
                  minutesPerClimb: toNumber(values.minutesPerClimb),
                  heightPerClimb: toNumber(values.heightPerClimb),
                  heightUnit: values.heightUnit,
                });
                return (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{item.label}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{item.met}</td>
                    <td className="py-2 text-right">
                      {row.error ? DASH : `${show(row.grossKcal)} kcal`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The 2011 revision of the published MET tables cut climbing from 11.0 to 7.5 MET after direct
        measurement, so older calculators overstate climbing badly. General information only — not
        medical or dietary advice.
      </p>
    </main>
  );
}

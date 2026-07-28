"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Music2, RotateCcw } from "lucide-react";

import { SALSA_STYLES, computeSalsaBurn } from "../lib";

const DEFAULTS = {
  weight: "70",
  weightUnit: "kg",
  styleId: "social",
  songs: "12",
  songMinutes: "4",
  totalMinutes: "120",
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
      computeSalsaBurn({
        weight: toNumber(values.weight),
        weightUnit: values.weightUnit,
        styleId: values.styleId,
        songs: toNumber(values.songs),
        songMinutes: toNumber(values.songMinutes),
        totalMinutes: toNumber(values.totalMinutes),
      }),
    [values],
  );

  const hasError = Boolean(result.error);

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
      "Salsa Dance Calorie Calculator",
      `Style: ${result.styleLabel}`,
      `Dance time: ${NUM1.format(result.danceMinutes)} min`,
      `Off-floor time: ${NUM1.format(result.offFloorMinutes)} min`,
      `Gross calories: ${NUM0.format(result.grossKcal)} kcal`,
      `Net calories: ${NUM0.format(result.netKcal)} kcal`,
      `Per song: ${NUM0.format(result.kcalPerSong)} kcal`,
      `Average intensity: ${NUM2.format(result.averageMet)} METs`,
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

  const rows = hasError
    ? [
        ["Dance time", DASH],
        ["Off-floor time", DASH],
        ["Floor share", DASH],
        ["Calories per song", DASH],
        ["Calories per hour", DASH],
        ["Average MET", DASH],
      ]
    : [
        ["Dance time", `${NUM1.format(result.danceMinutes)} min`],
        ["Off-floor time", `${NUM1.format(result.offFloorMinutes)} min`],
        ["Floor share", `${NUM0.format(result.floorSharePercent)}%`],
        ["Calories per song", `${NUM0.format(result.kcalPerSong)} kcal`],
        ["Calories per hour", `${NUM0.format(result.kcalPerHour)} kcal`],
        ["Average MET", NUM2.format(result.averageMet)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Music2 className="h-4 w-4" aria-hidden="true" />
          Dance calories
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Salsa Dance Calorie Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Count social dancing song-by-song so breaks, chatting and waiting for the next partner
          are not priced as full dance intensity.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="salsa-weight">
              Body weight
            </label>
            <input id="salsa-weight" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" step="0.5" value={values.weight} onChange={(event) => update("weight", event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="salsa-unit">
              Weight unit
            </label>
            <select id="salsa-unit" className={`mt-2 ${INPUT_CLASS}`} value={values.weightUnit} onChange={(event) => update("weightUnit", event.target.value)}>
              <option value="kg">Kilograms (kg)</option>
              <option value="lb">Pounds (lb)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="salsa-style">
              Salsa style / intensity
            </label>
            <select id="salsa-style" className={`mt-2 ${INPUT_CLASS}`} value={values.styleId} onChange={(event) => update("styleId", event.target.value)}>
              {SALSA_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="salsa-songs">
              Songs actually danced
            </label>
            <input id="salsa-songs" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" step="1" value={values.songs} onChange={(event) => update("songs", event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="salsa-song-min">
              Average song length (minutes)
            </label>
            <input id="salsa-song-min" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" step="0.5" value={values.songMinutes} onChange={(event) => update("songMinutes", event.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="salsa-total">
              Total time at class/social (minutes)
            </label>
            <input id="salsa-total" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" step="5" value={values.totalMinutes} onChange={(event) => update("totalMinutes", event.target.value)} />
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
              Gross calories
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM0.format(result.grossKcal)} kcal`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the inputs above to see a result." : `${NUM0.format(result.netKcal)} kcal above resting.`}
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

        {!hasError && (
          <p className="mt-5 rounded-lg bg-[var(--surface-soft)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.basis}
          </p>
        )}
      </section>
    </main>
  );
}

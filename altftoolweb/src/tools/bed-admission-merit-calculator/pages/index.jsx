"use client";

import { useMemo, useState } from "react";
import { BookOpenCheck, Check, Copy, RotateCcw } from "lucide-react";

import { MERIT_SCALE, WEIGHT_PRESETS, computeBedMerit } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  gradObtained: "580",
  gradMax: "1000",
  entranceObtained: "240",
  entranceMax: "400",
  weight: "0",
  isEngineering: false,
};

const DASH = "—";

export default function ToolHome() {
  const [gradObtained, setGradObtained] = useState(DEFAULTS.gradObtained);
  const [gradMax, setGradMax] = useState(DEFAULTS.gradMax);
  const [entranceObtained, setEntranceObtained] = useState(DEFAULTS.entranceObtained);
  const [entranceMax, setEntranceMax] = useState(DEFAULTS.entranceMax);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [isEngineering, setIsEngineering] = useState(DEFAULTS.isEngineering);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const toNum = (v) => (String(v).trim() === "" ? Number.NaN : Number(v));
    return computeBedMerit({
      gradObtained: toNum(gradObtained),
      gradMax: toNum(gradMax),
      entranceObtained: toNum(entranceObtained),
      entranceMax: toNum(entranceMax),
      graduationWeight: toNum(weight),
      isEngineering,
    });
  }, [gradObtained, gradMax, entranceObtained, entranceMax, weight, isEngineering]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "B.Ed admission merit",
      `Graduation: ${NUM.format(result.gradPercent)}% x ${result.graduationWeight}% weight = ${NUM.format(result.gradShare)}`,
      `Entrance: ${NUM.format(result.entrancePercent)}% x ${result.entranceWeight}% weight = ${NUM.format(result.entranceShare)}`,
      `Merit index: ${NUM.format(result.merit)} / ${MERIT_SCALE}`,
      `NCTE ${result.ncteFloor}% graduation floor: ${result.meetsNcteFloor ? "met" : "NOT met"}`,
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

  const reset = () => {
    setGradObtained(DEFAULTS.gradObtained);
    setGradMax(DEFAULTS.gradMax);
    setEntranceObtained(DEFAULTS.entranceObtained);
    setEntranceMax(DEFAULTS.entranceMax);
    setWeight(DEFAULTS.weight);
    setIsEngineering(DEFAULTS.isEngineering);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Graduation percentage", DASH],
        ["Entrance percentage", DASH],
        ["Graduation contribution", DASH],
        ["Entrance contribution", DASH],
        ["NCTE eligibility floor", DASH],
      ]
    : [
        ["Graduation percentage", `${NUM.format(result.gradPercent)}%`],
        ["Entrance percentage", `${NUM.format(result.entrancePercent)}%`],
        [
          `Graduation contribution (${result.graduationWeight}% weight)`,
          NUM.format(result.gradShare),
        ],
        [
          `Entrance contribution (${result.entranceWeight}% weight)`,
          NUM.format(result.entranceShare),
        ],
        [
          `NCTE eligibility floor (${result.ncteFloor}% in graduation)`,
          result.meetsNcteFloor ? "Met" : "Not met",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
          Teacher education
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          BEd Admission Merit Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Merit index = graduation percentage x its weight + entrance percentage x the remaining
          weight. It also checks the NCTE minimum of 50% graduation marks (55% for B.E./B.Tech).
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bed-grad-obtained">
              Graduation marks obtained
            </label>
            <input
              id="bed-grad-obtained"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              value={gradObtained}
              onChange={(event) => setGradObtained(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bed-grad-max">
              Graduation maximum marks
            </label>
            <input
              id="bed-grad-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              value={gradMax}
              onChange={(event) => setGradMax(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Have only a percentage? Enter it as marks with maximum 100.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bed-ent-obtained">
              Entrance exam score
            </label>
            <input
              id="bed-ent-obtained"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              value={entranceObtained}
              onChange={(event) => setEntranceObtained(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bed-ent-max">
              Entrance exam maximum
            </label>
            <input
              id="bed-ent-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              value={entranceMax}
              onChange={(event) => setEntranceMax(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bed-weight">
              Weight given to graduation marks (%)
            </label>
            <input
              id="bed-weight"
              className={`mt-2 ${INPUT_CLASS} sm:max-w-xs`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {WEIGHT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setWeight(String(preset.graduationWeight))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="bed-engineering"
        >
          <input
            id="bed-engineering"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={isEngineering}
            onChange={(event) => setIsEngineering(event.target.checked)}
          />
          My degree is B.E./B.Tech (NCTE floor becomes 55% with science/maths specialisation)
        </label>
      </section>

      {hasError ? (
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
              Merit index
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.merit)} / ${MERIT_SCALE}`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.meetsNcteFloor
                  ? "Graduation marks clear the NCTE eligibility floor."
                  : `Below the NCTE ${result.ncteFloor}% graduation floor — check category relaxations in your state rules.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the B.Ed merit result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
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
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. UP B.Ed JEE, Bihar CET-B.Ed and MAH B.Ed CET rank purely on the
        entrance score; universities without an entrance rank on graduation marks. The NCTE floors
        (50% general, 55% for engineering graduates) come from the NCTE Regulations, 2014 —
        reserved-category relaxations vary by state, so follow your official brochure.
      </p>
    </main>
  );
}

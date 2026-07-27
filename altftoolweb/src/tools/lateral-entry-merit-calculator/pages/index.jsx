"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MoveUpRight, RotateCcw } from "lucide-react";

import { MERIT_SCALE, WEIGHT_PRESETS, computeLateralEntryMerit } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  diplomaObtained: "1800",
  diplomaMax: "2500",
  entranceObtained: "78",
  entranceMax: "120",
  weight: "0",
  isReserved: false,
};

const DASH = "—";

export default function ToolHome() {
  const [diplomaObtained, setDiplomaObtained] = useState(DEFAULTS.diplomaObtained);
  const [diplomaMax, setDiplomaMax] = useState(DEFAULTS.diplomaMax);
  const [entranceObtained, setEntranceObtained] = useState(DEFAULTS.entranceObtained);
  const [entranceMax, setEntranceMax] = useState(DEFAULTS.entranceMax);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [isReserved, setIsReserved] = useState(DEFAULTS.isReserved);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const toNum = (v) => (String(v).trim() === "" ? Number.NaN : Number(v));
    return computeLateralEntryMerit({
      diplomaObtained: toNum(diplomaObtained),
      diplomaMax: toNum(diplomaMax),
      entranceObtained: toNum(entranceObtained),
      entranceMax: toNum(entranceMax),
      diplomaWeight: toNum(weight),
      isReserved,
    });
  }, [diplomaObtained, diplomaMax, entranceObtained, entranceMax, weight, isReserved]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Lateral entry merit",
      `Diploma: ${NUM.format(result.diplomaPercent)}% x ${result.diplomaWeight}% weight = ${NUM.format(result.diplomaShare)}`,
      `Entrance: ${NUM.format(result.entrancePercent)}% x ${result.entranceWeight}% weight = ${NUM.format(result.entranceShare)}`,
      `Merit index: ${NUM.format(result.merit)} / ${MERIT_SCALE}`,
      `AICTE ${result.aicteFloor}% diploma floor: ${result.meetsAicteFloor ? "met" : "NOT met"}`,
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
    setDiplomaObtained(DEFAULTS.diplomaObtained);
    setDiplomaMax(DEFAULTS.diplomaMax);
    setEntranceObtained(DEFAULTS.entranceObtained);
    setEntranceMax(DEFAULTS.entranceMax);
    setWeight(DEFAULTS.weight);
    setIsReserved(DEFAULTS.isReserved);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Diploma percentage", DASH],
        ["Entrance percentage", DASH],
        ["Diploma contribution", DASH],
        ["Entrance contribution", DASH],
        ["AICTE eligibility floor", DASH],
      ]
    : [
        ["Diploma percentage", `${NUM.format(result.diplomaPercent)}%`],
        ["Entrance percentage", `${NUM.format(result.entrancePercent)}%`],
        [
          `Diploma contribution (${result.diplomaWeight}% weight)`,
          NUM.format(result.diplomaShare),
        ],
        [
          `Entrance contribution (${result.entranceWeight}% weight)`,
          NUM.format(result.entranceShare),
        ],
        [
          `AICTE eligibility floor (${result.aicteFloor}% in diploma)`,
          result.meetsAicteFloor ? "Met" : "Not met",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MoveUpRight className="h-4 w-4" aria-hidden="true" />
          Diploma to B.Tech
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Lateral Entry Merit Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Merit index = diploma percentage x its weight + entrance percentage x the remaining
          weight, on a 100-point scale. Also checks the AICTE 45% diploma floor (40% reserved).
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="le-dip-obtained">
              Diploma aggregate marks obtained
            </label>
            <input
              id="le-dip-obtained"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              value={diplomaObtained}
              onChange={(event) => setDiplomaObtained(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="le-dip-max">
              Diploma aggregate maximum
            </label>
            <input
              id="le-dip-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              value={diplomaMax}
              onChange={(event) => setDiplomaMax(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Have only a percentage? Enter it as marks with maximum 100.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="le-ent-obtained">
              Entrance score (LEET / ECET / JELET)
            </label>
            <input
              id="le-ent-obtained"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              value={entranceObtained}
              onChange={(event) => setEntranceObtained(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="le-ent-max">
              Entrance maximum marks
            </label>
            <input
              id="le-ent-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              value={entranceMax}
              onChange={(event) => setEntranceMax(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="le-weight">
              Weight given to diploma marks (%)
            </label>
            <input
              id="le-weight"
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
              onClick={() => setWeight(String(preset.diplomaWeight))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="le-reserved"
        >
          <input
            id="le-reserved"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={isReserved}
            onChange={(event) => setIsReserved(event.target.checked)}
          />
          Reserved category (apply the 40% diploma floor where the state provides it)
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
                : result.meetsAicteFloor
                  ? "Diploma marks clear the AICTE eligibility floor."
                  : `Below the AICTE ${result.aicteFloor}% diploma floor for lateral entry.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the lateral entry merit result"
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
        Informational only. LEET (Haryana/Punjab), ECET (Andhra Pradesh/Telangana) and JELET (West
        Bengal) rank purely on the entrance score; the diploma percentage is the eligibility floor
        under the AICTE Approval Process Handbook. Follow the exact formula in your state
        counselling brochure.
      </p>
    </main>
  );
}

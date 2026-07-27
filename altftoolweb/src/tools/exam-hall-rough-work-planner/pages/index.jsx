"use client";

import { useMemo, useState } from "react";
import { Check, Copy, LayoutGrid, RotateCcw } from "lucide-react";

import {
  DEFAULT_SIDES_PER_SHEET,
  DEFAULT_ZONES_PER_SIDE,
  planRoughWork,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  sheets: "2",
  sides: String(DEFAULT_SIDES_PER_SHEET),
  zones: String(DEFAULT_ZONES_PER_SIDE),
  questions: "20",
  reserve: "1",
};

export default function ToolHome() {
  const [sheets, setSheets] = useState(DEFAULTS.sheets);
  const [sides, setSides] = useState(DEFAULTS.sides);
  const [zones, setZones] = useState(DEFAULTS.zones);
  const [questions, setQuestions] = useState(DEFAULTS.questions);
  const [reserve, setReserve] = useState(DEFAULTS.reserve);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planRoughWork({
        sheets: sheets.trim() === "" ? Number.NaN : Number(sheets),
        sidesPerSheet: sides.trim() === "" ? Number.NaN : Number(sides),
        zonesPerSide: zones.trim() === "" ? Number.NaN : Number(zones),
        calcQuestions: questions.trim() === "" ? Number.NaN : Number(questions),
        reserveSides: reserve.trim() === "" ? 0 : Number(reserve),
      }),
    [sheets, sides, zones, questions, reserve],
  );

  const hasError = Boolean(result.error);

  const verdict = hasError
    ? DASH
    : result.enough
      ? `${NUM.format(result.totalZones)} zones — enough`
      : `${NUM.format(result.shortfall)} zones short`;

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Rough sheet zone plan",
      `Sheets: ${sheets} × ${sides} sides = ${result.totalSides} sides (${result.reservedSides} reserved for the formula bank)`,
      `Zones: ${result.workingSides} working sides × ${zones} = ${result.totalZones} labelled zones`,
      `Questions needing rough work: ${result.calcQuestions}`,
      result.enough
        ? `Capacity OK — each question gets ${result.zonesPerQuestion} zone(s); ${result.questionsWithExtraZone} question(s) can take one extra.`
        : `Short by ${result.shortfall} zones — rule ${result.requiredZonesPerSide} zones per side instead.`,
      result.labelExample,
    ].join("\n");
  }, [hasError, result, sheets, sides, zones]);

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
    setSheets(DEFAULTS.sheets);
    setSides(DEFAULTS.sides);
    setZones(DEFAULTS.zones);
    setQuestions(DEFAULTS.questions);
    setReserve(DEFAULTS.reserve);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Total sides", DASH],
        ["Labelled zones", DASH],
        ["Zones per question", DASH],
        ["Formula bank", DASH],
      ]
    : [
        ["Total sides available", NUM.format(result.totalSides)],
        ["Sides reserved as formula bank", NUM.format(result.reservedSides)],
        [`Labelled zones (${result.workingSides} sides × ${zones})`, NUM.format(result.totalZones)],
        ["Questions needing rough work", NUM.format(result.calcQuestions)],
        [
          "Zones per question",
          result.zonesPerQuestion < 1
            ? "under 1 — capacity short"
            : `${NUM.format(result.zonesPerQuestion)}${result.questionsWithExtraZone > 0 ? ` (+1 extra for ${NUM.format(result.questionsWithExtraZone)} questions)` : ""}`,
        ],
        ...(result.enough
          ? []
          : [["Zones per side needed to fit everything", NUM.format(result.requiredZonesPerSide)]]),
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          Time strategy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Exam Hall Rough Work Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Rule each rough side into numbered zones, label every zone with its question number, and
          keep one side as a formula bank. This planner checks whether your sheets have enough zones
          for the paper.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rw-sheets">
              Rough sheets you will get
            </label>
            <input
              id="rw-sheets"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              value={sheets}
              onChange={(event) => setSheets(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rw-sides">
              Usable sides per sheet
            </label>
            <select
              id="rw-sides"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sides}
              onChange={(event) => setSides(event.target.value)}
            >
              <option value="1">1 — single side only</option>
              <option value="2">2 — both sides</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rw-zones">
              Zones you will rule per side
            </label>
            <input
              id="rw-zones"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              value={zones}
              onChange={(event) => setZones(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Folding a sheet in half twice gives 4 zones — the usual choice.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rw-questions">
              Questions that will need written working
            </label>
            <input
              id="rw-questions"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              value={questions}
              onChange={(event) => setQuestions(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rw-reserve">
              Sides reserved as a formula / reuse bank
            </label>
            <input
              id="rw-reserve"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              value={reserve}
              onChange={(event) => setReserve(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Write reusable values here once — conversions, computed constants, formulas — so you
              never derive the same thing twice.
            </p>
          </div>
        </div>
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
              Zone capacity
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError || result.enough ? "text-[var(--primary)]" : "text-[var(--danger)]"
              }`}
            >
              {verdict}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the layout."
                : result.enough
                  ? "Every calculation gets a labelled home, so intermediate results stay findable."
                  : "Rule more zones per side or request extra sheets before you start."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the rough work plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
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

        {!hasError ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.labelExample}
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Three habits make the system work: label the zone before you write, cross out a zone only
        with a single diagonal line (so it stays readable), and park every reusable value in the
        formula bank the first time you compute it.
      </p>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { ArrowRightLeft, Check, Copy, RotateCcw } from "lucide-react";

import {
  BACHELOR_QUARTER_CREDITS,
  BACHELOR_SEMESTER_CREDITS,
  QUARTER_PER_SEMESTER,
  convertCredits,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { credits: "60", direction: "sem-to-qtr" };
const DASH = "—";

const EXAMPLES = [
  { sem: 3, label: "One typical course" },
  { sem: 15, label: "One full-time semester" },
  { sem: 60, label: "Associate degree / transfer half" },
  { sem: 120, label: "Full bachelor's degree" },
];

export default function ToolHome() {
  const [credits, setCredits] = useState(DEFAULTS.credits);
  const [direction, setDirection] = useState(DEFAULTS.direction);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      convertCredits({
        credits: credits.trim() === "" ? Number.NaN : Number(credits),
        direction,
      }),
    [credits, direction],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Semester ↔ quarter credit conversion",
      `${NUM.format(result.input)} ${result.fromLabel} = ${NUM.format(result.converted)} ${result.toLabel}`,
      `Ratio used: 1 semester credit = ${QUARTER_PER_SEMESTER} quarter credits`,
      `Share of a typical US bachelor's: ${NUM.format(result.degreeShare)}%`,
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
    setCredits(DEFAULTS.credits);
    setDirection(DEFAULTS.direction);
    setCopied(false);
  };

  const swap = () => {
    if (hasError) {
      setDirection((d) => (d === "sem-to-qtr" ? "qtr-to-sem" : "sem-to-qtr"));
      return;
    }
    setCredits(String(result.converted));
    setDirection((d) => (d === "sem-to-qtr" ? "qtr-to-sem" : "sem-to-qtr"));
  };

  const rows = hasError
    ? [
        ["Converted credits", DASH],
        ["Ratio used", DASH],
        ["Share of a bachelor's degree", DASH],
      ]
    : [
        [
          "Converted credits",
          `${NUM.format(result.converted)} ${result.toLabel}`,
        ],
        ["Ratio used", `1 semester credit = ${QUARTER_PER_SEMESTER} quarter credits`],
        ["Share of a typical US bachelor's", `${NUM.format(result.degreeShare)}%`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
          Credit Transfer
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Semester to Quarter Credit Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Converts college credits between the semester and quarter systems using the standard
          registrar ratio: 1 semester credit = {QUARTER_PER_SEMESTER} quarter credits (a 15-week
          term versus a 10-week term).
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sq-credits">
              Credits to convert
            </label>
            <input
              id="sq-credits"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={credits}
              onChange={(event) => setCredits(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sq-direction">
              Direction
            </label>
            <select
              id="sq-direction"
              className={`mt-2 ${INPUT_CLASS}`}
              value={direction}
              onChange={(event) => setDirection(event.target.value)}
            >
              <option value="sem-to-qtr">Semester → quarter</option>
              <option value="qtr-to-sem">Quarter → semester</option>
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={swap}
          aria-label="Swap conversion direction"
          className={`mt-4 ${GHOST_BTN}`}
        >
          <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
          Swap direction
        </button>
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
              {hasError ? "Converted credits" : `Equivalent ${result.toLabel}`}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.converted)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${NUM.format(result.input)} ${result.fromLabel} transfer as ${NUM.format(result.converted)} ${result.toLabel}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the credit conversion result"
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Common equivalents</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Milestone
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Semester credits
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Quarter credits
                </th>
              </tr>
            </thead>
            <tbody>
              {EXAMPLES.map((row) => (
                <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{row.label}</td>
                  <td className="py-2 pr-3">{NUM.format(row.sem)}</td>
                  <td className="py-2 text-right font-semibold">
                    {NUM.format(row.sem * QUARTER_PER_SEMESTER)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          A full US bachelor&apos;s typically requires {BACHELOR_SEMESTER_CREDITS} semester or{" "}
          {BACHELOR_QUARTER_CREDITS} quarter credits.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The 1:1.5 ratio is the standard used by US registrars, but the receiving institution&apos;s
        transfer-credit evaluation is final — some cap transferable credits or round per course.
      </p>
    </main>
  );
}

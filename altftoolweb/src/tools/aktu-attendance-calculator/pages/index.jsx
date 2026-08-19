"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Check, Copy, RotateCcw } from "lucide-react";

import { REQUIRED_PERCENT, computeAktuAttendance } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = { held: "120", attended: "82", remaining: "60" };

export default function ToolHome() {
  const [held, setHeld] = useState(DEFAULTS.held);
  const [attended, setAttended] = useState(DEFAULTS.attended);
  const [remaining, setRemaining] = useState(DEFAULTS.remaining);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => computeAktuAttendance({ held, attended, remaining }),
    [held, attended, remaining],
  );
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `AKTU attendance: ${result.attended}/${result.held} = ${NUM.format(result.percent)}% (requirement ${result.required}%)`,
      result.isShort
        ? `Short by ${NUM.format(result.shortagePercent)}% (${result.shortageClasses} classes); ${result.needed === null ? "recovery impossible" : `attend the next ${result.needed} classes in a row to reach ${result.required}%`}`
        : `Above the line — can still miss ${result.canMiss} class${result.canMiss === 1 ? "" : "es"} today`,
    ];
    if (result.bestFinalPercent !== null) {
      lines.push(
        `With ${result.remaining} classes left: best finish ${NUM.format(result.bestFinalPercent)}%, ` +
          (result.recoverable
            ? `and up to ${result.futureCanMiss} future misses still end at ${result.required}%`
            : `so ${result.required}% is out of reach even with full attendance`),
      );
    }
    return lines.join("\n");
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
    setHeld(DEFAULTS.held);
    setAttended(DEFAULTS.attended);
    setRemaining(DEFAULTS.remaining);
    setCopied(false);
  };

  const statusLine = hasError
    ? "Fix the input above to see a result."
    : result.isShort
      ? result.needed === null
        ? "Below the line, and the target is unreachable from here."
        : `Short of ${result.required}% — attend the next ${result.needed} classes without a miss to recover.`
      : `At or above ${result.required}% — eligible on current numbers.`;

  const rows = hasError
    ? [
        ["Classes attended / held", DASH],
        ["Classes missed", DASH],
        ["Shortage below the line", DASH],
        ["Consecutive classes to recover", DASH],
        ["Safe misses right now", DASH],
      ]
    : [
        ["Classes attended / held", `${result.attended} / ${result.held}`],
        ["Classes missed", NUM.format(result.missed)],
        [
          "Shortage below the line",
          result.isShort
            ? `${NUM.format(result.shortagePercent)}% (${result.shortageClasses} classes)`
            : "None",
        ],
        [
          "Consecutive classes to recover",
          result.isShort ? (result.needed === null ? "Not reachable" : result.needed) : "0",
        ],
        ["Safe misses right now", result.isShort ? "0" : NUM.format(result.canMiss)],
        ...(result.bestFinalPercent !== null
          ? [
              [
                "Best finish if you attend everything",
                `${NUM.format(result.bestFinalPercent)}% ${result.recoverable ? "(recoverable)" : "(below the line)"}`,
              ],
              [
                "Future classes you can afford to miss",
                result.recoverable ? NUM.format(result.futureCanMiss) : "0",
              ],
            ]
          : []),
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarCheck className="h-4 w-4" aria-hidden="true" />
          AKTU eligibility
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AKTU Attendance Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          AKTU requires {REQUIRED_PERCENT}% attendance for end-semester exam eligibility. Enter
          your counts to see the shortage, the consecutive classes needed to recover, and — with
          the remaining classes filled in — whether recovery is still possible this semester.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="aktu-held">
              Classes held so far
            </label>
            <input
              id="aktu-held"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={held}
              onChange={(event) => setHeld(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="aktu-attended">
              Classes attended
            </label>
            <input
              id="aktu-attended"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={attended}
              onChange={(event) => setAttended(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="aktu-remaining">
              Classes still to be held this semester (optional)
            </label>
            <input
              id="aktu-remaining"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={remaining}
              onChange={(event) => setRemaining(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Fill this in to see whether the {REQUIRED_PERCENT}% line is still reachable and how
              many future classes you can afford to miss.
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
              Current attendance
            </p>
            <p
              aria-live="polite"
              aria-atomic="true"
              className={`mt-1 text-4xl font-semibold ${
                hasError
                  ? "text-[var(--primary)]"
                  : result.isShort
                    ? "text-[var(--danger)]"
                    : "text-[var(--primary)]"
              }`}
            >
              {hasError ? DASH : `${NUM.format(result.percent)}%`}
            </p>
            <p aria-live="polite" className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">{statusLine}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the AKTU attendance result"
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
        Informational only. The {REQUIRED_PERCENT}% requirement comes from AKTU&apos;s ordinances;
        institutes take the eligibility decision on their own registers, and any relaxation for
        medical or genuine grounds is discretionary and needs documentation. Confirm your standing
        with your college.
      </p>
    </main>
  );
}

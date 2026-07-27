"use client";

import { useMemo, useState } from "react";
import { Check, Coffee, Copy, RotateCcw } from "lucide-react";

import { PROTOCOLS, buildBreakPlan } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  focusSpan: "45",
  totalMinutes: "180",
};

const fmtTime = (minute) => {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
};

export default function ToolHome() {
  const [focusSpan, setFocusSpan] = useState(DEFAULTS.focusSpan);
  const [totalMinutes, setTotalMinutes] = useState(DEFAULTS.totalMinutes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildBreakPlan({
        focusSpanMinutes: focusSpan.trim() === "" ? Number.NaN : focusSpan,
        totalMinutes: totalMinutes.trim() === "" ? Number.NaN : totalMinutes,
      }),
    [focusSpan, totalMinutes],
  );
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Study/break plan",
      `Protocol: ${result.protocolLabel} (work ${result.workMinutes} min / break ${result.breakMinutes} min)`,
      `Study time: ${result.studyMinutes} min · breaks: ${result.totalBreakMinutes} min · study share ${NUM.format(result.studySharePercent)}%`,
      "Schedule:",
      ...result.segments.map(
        (s) =>
          `  ${fmtTime(s.startMinute)} — ${s.type === "work" ? "study" : "break"} ${s.minutes} min`,
      ),
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
    setFocusSpan(DEFAULTS.focusSpan);
    setTotalMinutes(DEFAULTS.totalMinutes);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Coffee className="h-4 w-4" aria-hidden="true" />
          Study habits
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Break Ratio Optimiser
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tell the tool how long you can genuinely hold focus and how much time you have. It
          matches you to the best-fitting known protocol — 25/5, 50/10, 52/17 or 90/20 — and
          lays out the full session, never ending on a break.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bro-span">
              Honest focus span (minutes)
            </label>
            <input
              id="bro-span"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="180"
              step="5"
              value={focusSpan}
              onChange={(event) => setFocusSpan(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              How long before your attention actually breaks — not how long you wish it did.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bro-total">
              Time available today (minutes)
            </label>
            <input
              id="bro-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="15"
              max="720"
              step="15"
              value={totalMinutes}
              onChange={(event) => setTotalMinutes(event.target.value)}
            />
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
              Recommended ratio
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.protocolLabel}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to get a plan." : result.protocolBasis}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the study break plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
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

        {!hasError ? (
          <>
            <div
              className="mt-5 flex h-6 w-full overflow-hidden rounded-full"
              role="img"
              aria-label={`Session timeline: ${result.studyMinutes} minutes study, ${result.totalBreakMinutes} minutes break`}
            >
              {result.segments.map((segment, i) => (
                <div
                  key={i}
                  title={`${segment.type === "work" ? "Study" : "Break"} ${segment.minutes} min`}
                  className={
                    segment.type === "work" ? "bg-[var(--primary)]" : "bg-[var(--muted)]"
                  }
                  style={{ width: `${(segment.minutes / result.plannedMinutes) * 100}%` }}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Solid = study · light = break
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Starts at
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Block
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Length
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.segments.map((segment, i) => (
                    <tr key={i} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 tabular-nums">{fmtTime(segment.startMinute)}</td>
                      <td
                        className={`py-2 pr-3 font-semibold ${
                          segment.type === "work" ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {segment.type === "work" ? "Study" : "Break"}
                      </td>
                      <td className="py-2 text-right">{segment.minutes} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total study time", hasError ? DASH : `${result.studyMinutes} min`],
            ["Total break time", hasError ? DASH : `${result.totalBreakMinutes} min`],
            [
              "Study share of session",
              hasError ? DASH : `${NUM.format(result.studySharePercent)}%`,
            ],
            ["Full-length work blocks", hasError ? DASH : String(result.fullWorkBlocks)],
            [
              "Unused time at the end",
              hasError ? DASH : `${result.unusedMinutes} min`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The protocols compared</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Protocol
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Work / break
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Basis
                </th>
              </tr>
            </thead>
            <tbody>
              {PROTOCOLS.map((protocol) => (
                <tr key={protocol.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{protocol.label}</td>
                  <td className="py-2 pr-3 tabular-nums">
                    {protocol.workMinutes}/{protocol.breakMinutes} min
                  </td>
                  <td className="py-2 text-[var(--muted-foreground)]">{protocol.basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The tool picks the longest standard work block your focus span can sustain; below 25
        minutes it builds a custom block at the Pomodoro-style 5:1 ratio. Grow your span
        gradually and re-run the plan rather than forcing 90-minute blocks on day one.
      </p>
    </main>
  );
}

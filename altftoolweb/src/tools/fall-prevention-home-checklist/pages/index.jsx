"use client";

import { useMemo, useState } from "react";
import { Check, Copy, House, RotateCcw } from "lucide-react";
import { CHECKLIST, EFFORT_LEVELS, FALL_RATE_65_PLUS, RISK_QUESTIONS, scoreFallRisk } from "../lib";

const DASH = "—";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const BAND_TONE = {
  low: "text-[var(--success)]",
  moderate: "text-[var(--primary)]",
  raised: "text-[var(--foreground)]",
  high: "text-[var(--danger)]",
};

const EFFORT_LABEL = EFFORT_LEVELS.reduce((map, row) => ({ ...map, [row.key]: row.label }), {});
const IMPACT_LABEL = { 3: "High impact", 2: "Medium impact", 1: "Lower impact" };

const DEFAULT_DONE = ["stairs-clear", "gen-bulbs", "living-cords"];

export default function ToolHome() {
  const [done, setDone] = useState(DEFAULT_DONE);
  const [risks, setRisks] = useState(["worry"]);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => scoreFallRisk({ doneKeys: done, riskAnswers: risks }), [done, risks]);
  const hasError = Boolean(result.error);

  const toggleDone = (key) => {
    setDone((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  };
  const toggleRisk = (key) => {
    setRisks((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Fall Prevention Home Checklist",
      `Home safety score: ${result.percent}% — ${result.band.label}`,
      `Items done: ${result.doneCount} of ${result.totalCount}`,
      "",
      "By room:",
      ...result.byRoom.map((room) => `- ${room.label}: ${room.doneCount}/${room.totalCount} done (${room.percent}%)`),
      "",
      result.ranked.length > 0 ? "Next actions, highest impact first:" : "Every item on the checklist is done.",
      ...result.ranked.slice(0, 10).map((item, index) => `${index + 1}. [${IMPACT_LABEL[item.impact]}, ${EFFORT_LABEL[item.effort]}] ${item.task} — ${item.fix}`),
      ...(result.riskAnswers.length > 0
        ? ["", "Personal risk answers:", ...result.riskAnswers.map((row) => `- ${row.question} ${row.note}`)]
        : []),
      "",
      result.steadiPositive
        ? "A yes to any of the first three questions is the STEADI signal for increased fall risk — worth raising with a GP."
        : "",
      "Informational checklist, not a clinical falls assessment.",
    ]
      .filter(Boolean)
      .join("\n");
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
    if (
      !window.confirm(
        "Reset the checklist? This clears every ticked item and your risk question answers, and cannot be undone.",
      )
    ) {
      return;
    }
    setDone(DEFAULT_DONE);
    setRisks(["worry"]);
    setCopied(false);
  };

  const markAll = () => {
    if (
      !window.confirm(
        "Mark every item as done? Only do this once you've actually checked each hazard — this sets the score to 100% regardless of what's really been fixed.",
      )
    ) {
      return;
    }
    setDone(CHECKLIST.map((item) => item.key));
  };
  const clearAll = () => {
    if (!window.confirm("Clear every ticked item? This cannot be undone.")) {
      return;
    }
    setDone([]);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <House className="h-4 w-4" aria-hidden="true" />
          Senior health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Fall Prevention Home Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Walk through the house room by room, tick what is already sorted, and the checklist ranks
          what is left by how much it matters and how hard it is. Items follow the CDC home fall
          prevention checklist and NICE falls guidance — {FALL_RATE_65_PLUS}.
        </p>
      </header>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Home safety score
            </p>
            <p className={`mt-1 text-4xl font-semibold ${hasError ? "text-[var(--muted-foreground)]" : BAND_TONE[result.band.code]}`}>
              {hasError ? DASH : `${result.percent}%`}
            </p>
            <p className="mt-1 max-w-prose text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${result.band.label} — ${result.band.note}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the fall prevention action list"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy actions"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={hasError ? "Score unavailable" : `${result.percent} percent of weighted hazards dealt with`}
          >
            <span className="block h-full bg-[var(--primary)]" style={{ width: `${hasError ? 0 : result.percent}%` }} />
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Items completed", hasError ? DASH : `${result.doneCount} of ${result.totalCount}`],
            ["Weighted hazard points cleared", hasError ? DASH : `${result.doneWeight} of ${result.totalWeight}`],
            ["Free fixes still outstanding", hasError ? DASH : String(result.quickWins.length)],
            [
              "STEADI screening",
              hasError
                ? DASH
                : result.steadiPositive
                  ? `${result.steadiCount} of 3 key questions answered yes — increased risk`
                  : "No key question answered yes",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={markAll} className={GHOST_BTN} aria-label="Mark every checklist item as done">
            Mark all done
          </button>
          <button type="button" onClick={clearAll} className={GHOST_BTN} aria-label="Clear every checklist item">
            Clear all
          </button>
        </div>
      </section>

      {!hasError && result.ranked.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Next actions, ranked</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Highest impact first, and within the same impact the free fixes come before the ones
            needing money or a tradesperson.
          </p>
          <ol className="mt-3 space-y-3">
            {result.ranked.slice(0, 8).map((item, index) => (
              <li key={item.key} className="rounded-lg border border-[var(--border)] p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold">
                    {index + 1}. {item.task}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {IMPACT_LABEL[item.impact]} · {EFFORT_LABEL[item.effort]}
                  </p>
                </div>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{item.fix}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {!hasError &&
        result.byRoom.map((room) => (
          <section key={room.key} className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-semibold">{room.label}</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                {room.doneCount}/{room.totalCount} done · {room.percent}%
              </p>
            </div>
            <ul className="mt-3 space-y-2">
              {room.items.map((item) => (
                <li key={item.key}>
                  <label
                    htmlFor={`fp-${item.key}`}
                    className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  >
                    <input
                      id={`fp-${item.key}`}
                      type="checkbox"
                      className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                      checked={done.includes(item.key)}
                      onChange={() => toggleDone(item.key)}
                    />
                    <span>
                      <span className="font-medium">{item.task}</span>
                      <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                        {IMPACT_LABEL[item.impact]} · {EFFORT_LABEL[item.effort]} · {item.fix}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Personal risk questions</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          The first three are the STEADI key questions. A yes to any of them means fall risk is
          raised regardless of how tidy the house is.
        </p>
        <ul className="mt-3 space-y-2">
          {RISK_QUESTIONS.map((row) => (
            <li key={row.key}>
              <label
                htmlFor={`fp-risk-${row.key}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <input
                  id={`fp-risk-${row.key}`}
                  type="checkbox"
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={risks.includes(row.key)}
                  onChange={() => toggleRisk(row.key)}
                />
                <span>
                  <span className="font-medium">{row.question}</span>
                  {risks.includes(row.key) && (
                    <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">{row.note}</span>
                  )}
                </span>
              </label>
            </li>
          ))}
        </ul>
        {!hasError && result.steadiPositive && (
          <p
            role="status"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            A yes to any of the first three questions is the recognised signal for increased fall
            risk. Ask a GP for a falls assessment, a medication review and a referral to a strength
            and balance programme — those have the strongest evidence behind them.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational checklist, not a clinical falls assessment. Home changes work best alongside
        strength and balance exercise, a medication review, an eye test and treatment of any
        dizziness on standing. Grab rails must be screwed into structural fixings — suction rails do
        not hold body weight. Nothing here is stored or sent anywhere.
      </p>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Users } from "lucide-react";

import { MAX_MEMBERS, buildVivaPlan } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  names: "Aisha\nBen\nChitra\nDev",
  rounds: "3",
  questionsPerRound: "2",
  minutesPerQuestion: "3",
  feedbackMinutes: "1",
};

const DASH = "—";

function toNumber(value) {
  return value.trim() === "" ? Number.NaN : Number(value);
}

export default function ToolHome() {
  const [names, setNames] = useState(DEFAULTS.names);
  const [rounds, setRounds] = useState(DEFAULTS.rounds);
  const [questionsPerRound, setQuestionsPerRound] = useState(DEFAULTS.questionsPerRound);
  const [minutesPerQuestion, setMinutesPerQuestion] = useState(DEFAULTS.minutesPerQuestion);
  const [feedbackMinutes, setFeedbackMinutes] = useState(DEFAULTS.feedbackMinutes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildVivaPlan({
        memberNames: names.split("\n"),
        rounds: toNumber(rounds),
        questionsPerRound: toNumber(questionsPerRound),
        minutesPerQuestion: toNumber(minutesPerQuestion),
        feedbackMinutesPerQuestion: toNumber(feedbackMinutes),
      }),
    [names, rounds, questionsPerRound, minutesPerQuestion, feedbackMinutes],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Group viva preparation plan",
      `Members: ${result.members.join(", ")}`,
      `Total session time: ${NUM.format(result.totalMinutes)} minutes`,
      `Questions in total: ${NUM.format(result.totalQuestions)}`,
      "",
    ];
    for (const round of result.schedule) {
      lines.push(`Round ${round.round}:`);
      for (const pair of round.pairs) {
        lines.push(`  ${pair.asker} asks ${pair.answerer}`);
      }
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
    setNames(DEFAULTS.names);
    setRounds(DEFAULTS.rounds);
    setQuestionsPerRound(DEFAULTS.questionsPerRound);
    setMinutesPerQuestion(DEFAULTS.minutesPerQuestion);
    setFeedbackMinutes(DEFAULTS.feedbackMinutes);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Questions each member asks", DASH],
        ["Questions each member answers", DASH],
        ["Questions in total", DASH],
        ["Minutes per round", DASH],
        ["Rounds for full pairing coverage", DASH],
      ]
    : [
        ["Questions each member asks", NUM.format(result.questionsAskedPerMember)],
        ["Questions each member answers", NUM.format(result.questionsAnsweredPerMember)],
        ["Questions in total", NUM.format(result.totalQuestions)],
        ["Minutes per round", NUM.format(result.minutesPerRound)],
        [
          "Rounds for full pairing coverage",
          `${NUM.format(result.roundsForFullCoverage)}${result.fullCoverage ? " (covered)" : ""}`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Users className="h-4 w-4" aria-hidden="true" />
          Peer viva practice
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Group Viva Preparation Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List your study group and get a round-robin questioning rota where every member asks and
          answers the same number of questions, with per-round timings.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="viva-names">
              Group members (one per line, in seating order, max {MAX_MEMBERS})
            </label>
            <textarea
              id="viva-names"
              rows={4}
              className={`mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none`}
              value={names}
              onChange={(event) => setNames(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="viva-rounds">
              Rotation rounds
            </label>
            <input
              id="viva-rounds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="20"
              step="1"
              value={rounds}
              onChange={(event) => setRounds(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="viva-qpr">
              Questions each asker puts per round
            </label>
            <input
              id="viva-qpr"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="20"
              step="1"
              value={questionsPerRound}
              onChange={(event) => setQuestionsPerRound(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="viva-mpq">
              Minutes to answer one question
            </label>
            <input
              id="viva-mpq"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="60"
              step="0.5"
              value={minutesPerQuestion}
              onChange={(event) => setMinutesPerQuestion(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="viva-fb">
              Feedback minutes per question (0 for none)
            </label>
            <input
              id="viva-fb"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="30"
              step="0.5"
              value={feedbackMinutes}
              onChange={(event) => setFeedbackMinutes(event.target.value)}
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
              Total session time
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.totalMinutes)} min`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a plan."
                : "Rotation offset shifts each round, so nobody questions themselves and workload stays equal."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the viva rotation plan"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Round-by-round rotation</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Round
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Who asks whom
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((round) => (
                  <tr key={round.round} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 align-top font-semibold">{round.round}</td>
                    <td className="py-2">
                      {round.pairs.map((pair) => (
                        <span
                          key={`${pair.asker}-${pair.answerer}`}
                          className="mb-1 mr-2 inline-block rounded-md bg-[var(--muted)] px-2 py-1 text-xs font-medium"
                        >
                          {pair.asker} → {pair.answerer}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Planning aid for peer practice sessions. Real viva panels set their own format — use this to
        rehearse answering aloud under time, not as a syllabus.
      </p>
    </main>
  );
}

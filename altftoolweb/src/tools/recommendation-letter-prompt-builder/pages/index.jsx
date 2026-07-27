"use client";

import { useMemo, useState } from "react";
import { Award, Check, Copy, RotateCcw } from "lucide-react";

import {
  LETTER_TYPES,
  MIN_COHORT_FOR_PERCENTILE,
  RELATIONSHIPS,
  buildRecommendationPrompt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const PCT = new Intl.NumberFormat("en-IN", { style: "percent", maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  candidateName: "Asha Rao",
  letterType: "grad",
  targetProgramme: "MS in Computer Science, Fall 2027 intake",
  relationship: "Thesis or research supervisor",
  monthsKnown: "30",
  capacity: "Supervised her final-year project and taught her two core modules",
  examplesRaw:
    "Ranked 2 of 140 in the distributed systems module and turned the project into a workshop paper\nRebuilt the lab data pipeline alone over 6 weeks after the previous student left\nPresented her results at the departmental seminar and answered hostile questions calmly",
  strengthsRaw: "Works independently without supervision\nWrites clearly for a technical audience",
  rank: "3",
  cohortSize: "120",
  wordTarget: "650",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [includeReservation, setIncludeReservation] = useState(false);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () => buildRecommendationPrompt({ ...form, includeReservation }),
    [form, includeReservation],
  );
  const hasError = Boolean(result.error);

  const copyPrompt = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setIncludeReservation(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Award className="h-4 w-4" aria-hidden="true" />
          Reference letter
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Recommendation Letter Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter what you actually observed. The builder scores each example for specificity, works
          out the strongest percentile claim your cohort size honestly supports, and budgets words
          across the six sections of a reference letter.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-name">
              Person you are recommending
            </label>
            <input
              id="rl-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.candidateName}
              onChange={set("candidateName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-type">
              Letter type
            </label>
            <select
              id="rl-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.letterType}
              onChange={set("letterType")}
            >
              {LETTER_TYPES.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rl-programme">
              What they are applying to
            </label>
            <input
              id="rl-programme"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.targetProgramme}
              onChange={set("targetProgramme")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-rel">
              Your relationship
            </label>
            <select
              id="rl-rel"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.relationship}
              onChange={set("relationship")}
            >
              {RELATIONSHIPS.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-months">
              Months you have known them
            </label>
            <input
              id="rl-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="720"
              step="1"
              value={form.monthsKnown}
              onChange={set("monthsKnown")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rl-capacity">
              In what capacity you observed them
            </label>
            <input
              id="rl-capacity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.capacity}
              onChange={set("capacity")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rl-examples">
              Specific things you saw them do (one per line)
            </label>
            <textarea
              id="rl-examples"
              className={`mt-2 ${AREA_CLASS}`}
              rows={5}
              value={form.examplesRaw}
              onChange={set("examplesRaw")}
            />
            <p className={HINT_CLASS}>
              A full-marks example names the course or project, says what came of it, and compares
              them with peers.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rl-strengths">
              Qualities to evidence (one per line, optional)
            </label>
            <textarea
              id="rl-strengths"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              value={form.strengthsRaw}
              onChange={set("strengthsRaw")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-rank">
              Their rank in the cohort (optional)
            </label>
            <input
              id="rl-rank"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.rank}
              onChange={set("rank")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-cohort">
              Size of that cohort
            </label>
            <input
              id="rl-cohort"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="2"
              step="1"
              value={form.cohortSize}
              onChange={set("cohortSize")}
            />
            <p className={HINT_CLASS}>
              Below {MIN_COHORT_FOR_PERCENTILE} people a percentage is false precision, so the
              builder writes out the real numbers instead.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-words">
              Target length (words)
            </label>
            <input
              id="rl-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="250"
              max="1000"
              step="25"
              value={form.wordTarget}
              onChange={set("wordTarget")}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 items-center gap-3 text-sm font-semibold"
              htmlFor="rl-reservation"
            >
              <input
                id="rl-reservation"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                checked={includeReservation}
                onChange={(event) => setIncludeReservation(event.target.checked)}
              />
              Include one honest reservation with what they are doing about it
            </label>
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
              Strongest honest claim
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError || !result.ranking ? DASH : result.ranking.phrase}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : result.ranking
                  ? result.ranking.note
                  : "No rank supplied — the prompt tells the model not to invent one."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={hasError}
              aria-label="Copy the generated recommendation letter prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Letter type", hasError ? DASH : result.type.label],
            [
              "Target length",
              hasError ? DASH : `${NUM.format(result.target)} words (~${result.pages} page)`,
            ],
            ["How long you have known them", hasError ? DASH : result.durationPhrase],
            ["Examples supplied", hasError ? DASH : NUM.format(result.examples.length)],
            ["Mean example specificity", hasError ? DASH : `${NUM.format(result.exampleScore)} / 100`],
            [
              "Exact percentile from rank",
              hasError || !result.ranking ? DASH : `${result.ranking.exactPercent.toFixed(1)}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.shortAcquaintance ? (
        <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          You have known this person under six months. The prompt now asks the letter to say so in
          the opening — a reader trusts a short honest letter more than an overclaiming one.
        </p>
      ) : null}

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Example specificity</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Example</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Score</th>
                  <th scope="col" className="py-2 font-semibold">Missing</th>
                </tr>
              </thead>
              <tbody>
                {result.examples.map((item, index) => (
                  <tr
                    key={`${index}-${item.text}`}
                    className="border-b border-[var(--border)] align-top last:border-0"
                  >
                    <td className="py-2 pr-3">{item.text}</td>
                    <td
                      className={`py-2 pr-3 text-right font-semibold ${
                        item.score >= 60 ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {NUM.format(item.score)}
                    </td>
                    <td className="py-2 text-[var(--muted-foreground)]">
                      {item.missing.length === 0 ? "Nothing" : item.missing.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Section word budget</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {result.budget.map((row) => (
              <li key={row.key}>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--muted-foreground)]">{row.label}</span>
                  <span className="font-semibold">{NUM.format(row.words)} words</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  <span
                    className="block h-full bg-[var(--primary)]"
                    style={{ width: PCT.format(row.share) }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your prompt</h2>
          <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-xs leading-5 text-[var(--foreground)]">
            {result.prompt}
          </pre>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and everything runs in your browser. A reference is a personal statement
        you sign your name to — read every line of the draft and delete anything you could not defend
        if the reader called you. Some institutions require confidential letters to be submitted
        directly; check the recipient's rules before sending.
      </p>
    </main>
  );
}

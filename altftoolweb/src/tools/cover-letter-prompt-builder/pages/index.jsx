"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mail, RotateCcw } from "lucide-react";

import {
  FORMAT_OPTIONS,
  LETTER_TYPES,
  MAX_WORDS,
  MIN_WORDS,
  RECOMMENDED_MAX_WORDS,
  RECOMMENDED_MIN_WORDS,
  RESEARCH_ANGLES,
  TONE_OPTIONS,
  buildCoverLetterPrompt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  typeId: "posted",
  role: "Product Designer",
  company: "Zerodha",
  source: "the careers page",
  hiringManager: "",
  referrer: "",
  toneId: "warm",
  formatId: "letter",
  wordTarget: "350",
  research:
    "Shipped a charting revamp in Kite in 2025; publish design decisions openly on their blog.",
  achievements:
    "Cut onboarding drop-off 31% in two quarters; ran the design system used by 40 engineers.",
};

const DASH = "—";

export default function ToolHome() {
  const [typeId, setTypeId] = useState(DEFAULTS.typeId);
  const [role, setRole] = useState(DEFAULTS.role);
  const [company, setCompany] = useState(DEFAULTS.company);
  const [source, setSource] = useState(DEFAULTS.source);
  const [hiringManager, setHiringManager] = useState(DEFAULTS.hiringManager);
  const [referrer, setReferrer] = useState(DEFAULTS.referrer);
  const [toneId, setToneId] = useState(DEFAULTS.toneId);
  const [formatId, setFormatId] = useState(DEFAULTS.formatId);
  const [wordTarget, setWordTarget] = useState(DEFAULTS.wordTarget);
  const [research, setResearch] = useState(DEFAULTS.research);
  const [achievements, setAchievements] = useState(DEFAULTS.achievements);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildCoverLetterPrompt({
        typeId,
        role,
        company,
        source,
        hiringManager,
        referrer,
        research,
        achievements,
        toneId,
        formatId,
        wordTarget: wordTarget === "" ? NaN : Number(wordTarget),
      }),
    [
      typeId,
      role,
      company,
      source,
      hiringManager,
      referrer,
      research,
      achievements,
      toneId,
      formatId,
      wordTarget,
    ],
  );

  const hasError = Boolean(result.error);
  const selectedType = LETTER_TYPES.find((item) => item.id === typeId) || LETTER_TYPES[0];

  const copyResult = async () => {
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
    setTypeId(DEFAULTS.typeId);
    setRole(DEFAULTS.role);
    setCompany(DEFAULTS.company);
    setSource(DEFAULTS.source);
    setHiringManager(DEFAULTS.hiringManager);
    setReferrer(DEFAULTS.referrer);
    setToneId(DEFAULTS.toneId);
    setFormatId(DEFAULTS.formatId);
    setWordTarget(DEFAULTS.wordTarget);
    setResearch(DEFAULTS.research);
    setAchievements(DEFAULTS.achievements);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Letter type", DASH],
        ["Tone", DASH],
        ["Format", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Letter type", result.typeLabel],
        ["Tone", result.toneLabel],
        ["Format", result.formatLabel],
        ["Prompt length", `${NUM.format(result.wordCount)} words`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Mail className="h-4 w-4" aria-hidden="true" />
          Job search
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cover Letter Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Builds a cover-letter prompt around the four-move structure — opening hook,
          proof of fit, why this employer, close — with a word budget for each
          paragraph and a hard rule against inventing facts.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="clp-type">
              Letter type
            </label>
            <select
              id="clp-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={typeId}
              onChange={(event) => setTypeId(event.target.value)}
            >
              {LETTER_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="clp-words">
              Letter length (words)
            </label>
            <input
              id="clp-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_WORDS}
              max={MAX_WORDS}
              step={10}
              value={wordTarget}
              onChange={(event) => setWordTarget(event.target.value)}
            />
            <p className={HINT_CLASS}>
              One page is about {RECOMMENDED_MIN_WORDS}–{RECOMMENDED_MAX_WORDS} words.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="clp-role">
              Role you are applying for
            </label>
            <input
              id="clp-role"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="clp-company">
              Employer
            </label>
            <input
              id="clp-company"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="clp-source">
              Where you saw the role (optional)
            </label>
            <input
              id="clp-source"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={source}
              onChange={(event) => setSource(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="clp-manager">
              Hiring manager&apos;s name (optional)
            </label>
            <input
              id="clp-manager"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={hiringManager}
              onChange={(event) => setHiringManager(event.target.value)}
              placeholder="Leave blank for 'Dear Hiring Team'"
            />
          </div>
          {selectedType.needsReferrer ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="clp-referrer">
                Who referred you
              </label>
              <input
                id="clp-referrer"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={referrer}
                onChange={(event) => setReferrer(event.target.value)}
              />
              <p className={HINT_CLASS}>
                The referral goes in the first sentence — it is the strongest opening available.
              </p>
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="clp-tone">
              Tone
            </label>
            <select
              id="clp-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={toneId}
              onChange={(event) => setToneId(event.target.value)}
            >
              {TONE_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="clp-format">
              Format
            </label>
            <select
              id="clp-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={formatId}
              onChange={(event) => setFormatId(event.target.value)}
            >
              {FORMAT_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="clp-achievements">
              Your achievements, with numbers
            </label>
            <textarea
              id="clp-achievements"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              value={achievements}
              onChange={(event) => setAchievements(event.target.value)}
              placeholder="Cut checkout errors 22%; led a team of six; shipped X in 90 days"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="clp-research">
              Verified facts about this employer
            </label>
            <textarea
              id="clp-research"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              value={research}
              onChange={(event) => setResearch(event.target.value)}
              placeholder="Only what you have actually checked — the prompt forbids anything else"
            />
            <p className={HINT_CLASS}>Angles worth ten minutes of research:</p>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {RESEARCH_ANGLES.map((angle) => (
                <li
                  key={angle}
                  className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs text-[var(--muted-foreground)]"
                >
                  {angle}
                </li>
              ))}
            </ul>
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
              Letter word budget
            </p>
            <p className="mt-1 text-4xl font-semibold tabular-nums text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.totalWords)} words`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Split across four paragraphs for the ${result.targetRole} role at ${result.employer}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated cover letter prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
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
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Paragraph budget
          </h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[22rem] text-left text-sm">
              <thead className="text-[var(--muted-foreground)]">
                <tr>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Paragraph
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    Words
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {hasError ? (
                  <tr>
                    <td className="py-2 pr-3">{DASH}</td>
                    <td className="py-2">{DASH}</td>
                  </tr>
                ) : (
                  result.budget.map((part) => (
                    <tr key={part.id}>
                      <td className="py-2 pr-3">{part.label}</td>
                      <td className="py-2 tabular-nums font-semibold">
                        {NUM.format(part.words)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!hasError && result.notes.length > 0 ? (
          <ul className="mt-5 space-y-2">
            {result.notes.map((note) => (
              <li
                key={note}
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning-text)]"
              >
                {note}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Generated prompt
          </h2>
          <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--foreground)]">
              {hasError ? DASH : result.prompt}
            </pre>
          </div>
        </div>

        {!hasError ? (
          <div className="mt-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Before you send it
            </h2>
            <ul className="mt-2 space-y-1.5 text-sm text-[var(--foreground)]">
              {result.checklist.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The prompt only carries what you type here. Anything you leave blank comes back
        as a marked placeholder rather than an invented fact — check every claim in the
        letter before you send it.
      </p>
    </main>
  );
}

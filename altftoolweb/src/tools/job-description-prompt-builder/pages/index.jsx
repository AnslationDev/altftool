"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Briefcase, Check, Copy, RotateCcw } from "lucide-react";

import {
  EMPLOYMENT_TYPES,
  MUST_HAVE_CAP,
  SENIORITY_LEVELS,
  TONE_PRESETS,
  WORD_TARGET_DEFAULT,
  WORD_TARGET_MAX,
  WORD_TARGET_MIN,
  WORK_MODES,
  buildJobDescriptionPrompt,
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
  roleTitle: "Backend Engineer",
  seniority: "Mid-level",
  employmentType: "Full-time",
  workMode: "Hybrid",
  location: "Bengaluru, 3 days in office",
  teamContext: "Six-person payments team owning the settlement service",
  responsibilitiesRaw: "Own and evolve the settlement API\nInvestigate reconciliation mismatches\nShare the weekday on-call rota",
  mustHavesRaw: "Builds and ships production services in Go or Java\nComfortable with relational databases and SQL tuning\nHas debugged a live incident end to end",
  niceToHavesRaw: "Worked on payments or ledgers\nExperience with Kubernetes",
  salaryRange: "",
  tone: "Warm and plain-spoken",
  wordTarget: String(WORD_TARGET_DEFAULT),
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [includeEqualOpportunity, setIncludeEqualOpportunity] = useState(true);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      buildJobDescriptionPrompt({
        ...form,
        wordTarget: form.wordTarget,
        includeEqualOpportunity,
      }),
    [form, includeEqualOpportunity],
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
    setIncludeEqualOpportunity(true);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Briefcase className="h-4 w-4" aria-hidden="true" />
          Hiring
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Job Description Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn role facts into a prompt that keeps hard filters separate from optional extras,
          budgets words per section and blocks gender-coded, age-coded and ableist wording.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="jd-title">
              Job title
            </label>
            <input
              id="jd-title"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.roleTitle}
              onChange={set("roleTitle")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jd-seniority">
              Level
            </label>
            <select
              id="jd-seniority"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.seniority}
              onChange={set("seniority")}
            >
              {SENIORITY_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jd-type">
              Employment type
            </label>
            <select
              id="jd-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.employmentType}
              onChange={set("employmentType")}
            >
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jd-mode">
              Working pattern
            </label>
            <select
              id="jd-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.workMode}
              onChange={set("workMode")}
            >
              {WORK_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jd-location">
              Location detail
            </label>
            <input
              id="jd-location"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.location}
              onChange={set("location")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jd-salary">
              Pay range (optional)
            </label>
            <input
              id="jd-salary"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="e.g. 18-24 LPA"
              value={form.salaryRange}
              onChange={set("salaryRange")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="jd-team">
              Team and context
            </label>
            <input
              id="jd-team"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.teamContext}
              onChange={set("teamContext")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="jd-must">
              Must-have requirements (one per line)
            </label>
            <textarea
              id="jd-must"
              className={`mt-2 ${AREA_CLASS}`}
              rows={5}
              value={form.mustHavesRaw}
              onChange={set("mustHavesRaw")}
            />
            <p className={HINT_CLASS}>
              Hard filters only. The prompt caps the finished advert at {MUST_HAVE_CAP}.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="jd-nice">
              Nice to have (one per line)
            </label>
            <textarea
              id="jd-nice"
              className={`mt-2 ${AREA_CLASS}`}
              rows={4}
              value={form.niceToHavesRaw}
              onChange={set("niceToHavesRaw")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="jd-resp">
              Day-to-day responsibilities (one per line, optional)
            </label>
            <textarea
              id="jd-resp"
              className={`mt-2 ${AREA_CLASS}`}
              rows={4}
              value={form.responsibilitiesRaw}
              onChange={set("responsibilitiesRaw")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jd-tone">
              Tone
            </label>
            <select
              id="jd-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.tone}
              onChange={set("tone")}
            >
              {TONE_PRESETS.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jd-words">
              Target advert length (words)
            </label>
            <input
              id="jd-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={WORD_TARGET_MIN}
              max={WORD_TARGET_MAX}
              step="25"
              value={form.wordTarget}
              onChange={set("wordTarget")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="jd-eeo">
              <input
                id="jd-eeo"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                checked={includeEqualOpportunity}
                onChange={(event) => setIncludeEqualOpportunity(event.target.checked)}
              />
              Ask for an equal-opportunity and interview-adjustments closing
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
              Prompt length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.wordCount)} words`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${NUM.format(result.charCount)} characters of instructions`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={hasError}
              aria-label="Copy the generated job description prompt"
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
            ["Must-have requirements", hasError ? DASH : NUM.format(result.mustHaves.length)],
            ["Nice to have", hasError ? DASH : NUM.format(result.niceToHaves.length)],
            ["Responsibilities supplied", hasError ? DASH : NUM.format(result.responsibilities.length)],
            [
              "Words allotted to requirements",
              hasError ? DASH : `${NUM.format(result.budgetByKey.mustHaves)} (${PCT.format(result.mustHaveShare)})`,
            ],
            [
              "Over the must-have cap",
              hasError ? DASH : result.overflow > 0 ? `${NUM.format(result.overflow)} to merge or move` : "No",
            ],
            [
              "Flagged wordings",
              hasError ? DASH : result.flags.length > 0 ? NUM.format(result.flags.length) : "None",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.overlap.length > 0 ? (
        <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          Listed in both columns: {result.overlap.join(", ")}. Decide whether each is a hard filter or
          an optional extra — it cannot be both.
        </p>
      ) : null}

      {!hasError && result.flags.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <AlertTriangle className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
            Wording to reconsider
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Term</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Why</th>
                  <th scope="col" className="py-2 font-semibold">Try instead</th>
                </tr>
              </thead>
              <tbody>
                {result.flags.map((flag) => (
                  <tr key={flag.term} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{flag.term}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{flag.why}</td>
                    <td className="py-2">{flag.swap}</td>
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
        Informational only. Job adverts are covered by employment and equality law that varies by
        country and by state — have your final wording checked by an HR or legal adviser before you
        publish, especially any pay, visa or physical-requirement language.
      </p>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import { LIMIT_TYPES, MIN_ANCHORS, SOP_PRESETS, buildSopPrompt } from "../lib";

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
const WARN_CLASS =
  "mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";

const DEFAULTS = {
  preset: "gradms",
  limitType: "words",
  limit: "800",
  programme: "MS in Computational Linguistics",
  university: "University of Edinburgh",
  fieldOfStudy: "Speech and language processing",
  background: "BTech in Information Technology, final-year CGPA 8.6",
  experienceRaw:
    "Built a 40-hour annotated Marathi speech corpus for my final-year project\nSix-month internship on ASR data pipelines at a speech startup\nCo-authored a workshop paper on code-switched transcription",
  facultyRaw: "Dr Sharon Goldwater — unsupervised language learning",
  coursesRaw: "Accelerated Natural Language Processing",
  resourcesRaw: "Centre for Speech Technology Research",
  goals: "Work on speech recognition for low-resource Indian languages in industry research",
  draftOpening: "",
  gapExplanation: "",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const applyPreset = (event) => {
    const key = event.target.value;
    const preset = SOP_PRESETS.find((entry) => entry.key === key);
    setForm((prev) =>
      preset
        ? { ...prev, preset: key, limitType: preset.limitType, limit: String(preset.limit) }
        : { ...prev, preset: key },
    );
  };

  const result = useMemo(() => buildSopPrompt(form), [form]);
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
    setCopied(false);
  };

  const activePreset = SOP_PRESETS.find((entry) => entry.key === form.preset);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Admissions
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">SOP Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert the form&apos;s word or character cap into a section-by-section word budget, count
          the programme-specific details that stop a statement reading as mail-merged, and flag the
          stock openings admissions readers see every cycle.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sop-preset">
              Application type
            </label>
            <select
              id="sop-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.preset}
              onChange={applyPreset}
            >
              {SOP_PRESETS.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
            {activePreset ? <p className={HINT_CLASS}>{activePreset.note}</p> : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sop-limit-type">
              Limit is counted in
            </label>
            <select
              id="sop-limit-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.limitType}
              onChange={set("limitType")}
            >
              {LIMIT_TYPES.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sop-limit">
              The limit on the form
            </label>
            <input
              id="sop-limit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="10"
              value={form.limit}
              onChange={set("limit")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sop-programme">
              Programme
            </label>
            <input
              id="sop-programme"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.programme}
              onChange={set("programme")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sop-uni">
              Institution
            </label>
            <input
              id="sop-uni"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.university}
              onChange={set("university")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sop-field">
              Field
            </label>
            <input
              id="sop-field"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.fieldOfStudy}
              onChange={set("fieldOfStudy")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sop-background">
              Your background so far
            </label>
            <input
              id="sop-background"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.background}
              onChange={set("background")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sop-evidence">
              Your evidence — projects, jobs, papers, coursework (one per line)
            </label>
            <textarea
              id="sop-evidence"
              className={`mt-2 ${AREA_CLASS}`}
              rows={5}
              value={form.experienceRaw}
              onChange={set("experienceRaw")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sop-faculty">
              Faculty you want to work with (one per line)
            </label>
            <textarea
              id="sop-faculty"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              value={form.facultyRaw}
              onChange={set("facultyRaw")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sop-courses">
              Named courses or modules (one per line)
            </label>
            <textarea
              id="sop-courses"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              value={form.coursesRaw}
              onChange={set("coursesRaw")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sop-resources">
              Labs, centres, datasets or equipment you need (one per line)
            </label>
            <textarea
              id="sop-resources"
              className={`mt-2 ${AREA_CLASS}`}
              rows={2}
              value={form.resourcesRaw}
              onChange={set("resourcesRaw")}
            />
            <p className={HINT_CLASS}>
              At least {MIN_ANCHORS} named specifics across these three boxes keeps the statement from
              reading as generic.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sop-goals">
              What you intend to do after the degree
            </label>
            <input
              id="sop-goals"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.goals}
              onChange={set("goals")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sop-opening">
              Your draft opening, if you have one (optional)
            </label>
            <textarea
              id="sop-opening"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              value={form.draftOpening}
              onChange={set("draftOpening")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sop-gap">
              A gap or weak grade to address factually (optional)
            </label>
            <input
              id="sop-gap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.gapExplanation}
              onChange={set("gapExplanation")}
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
              Words to write
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.resolved.words)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : result.resolved.exact}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={hasError}
              aria-label="Copy the generated statement of purpose prompt"
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
            ["Character equivalent", hasError ? DASH : NUM.format(result.resolved.chars)],
            ["Evidence items supplied", hasError ? DASH : NUM.format(result.experience.length)],
            [
              "Programme-specific anchors",
              hasError
                ? DASH
                : `${NUM.format(result.anchors.total)} (${result.anchors.sufficient ? "enough" : `need ${MIN_ANCHORS}`})`,
            ],
            [
              "Stock phrases found",
              hasError ? DASH : result.cliches.length > 0 ? NUM.format(result.cliches.length) : "None",
            ],
            [
              "Your draft opening",
              hasError
                ? DASH
                : result.openingWords > 0
                  ? `${NUM.format(result.openingWords)} words`
                  : "Not supplied",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && !result.anchors.sufficient ? (
        <p className={WARN_CLASS}>
          Only {NUM.format(result.anchors.total)} programme-specific anchor
          {result.anchors.total === 1 ? "" : "s"}. A statement with fewer than {MIN_ANCHORS} named
          people, modules or labs reads as one sent to every department on the list.
        </p>
      ) : null}

      {!hasError && result.openingOverBudget ? (
        <p className={WARN_CLASS}>
          Your draft opening is {NUM.format(result.openingWords)} words but the opening section only
          has {NUM.format(result.budget[0].words)} words in the budget.
        </p>
      ) : null}

      {!hasError && result.cliches.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Stock phrases to cut</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Phrase</th>
                  <th scope="col" className="py-2 font-semibold">Do this instead</th>
                </tr>
              </thead>
              <tbody>
                {result.cliches.map((entry) => (
                  <tr key={entry.phrase} className="border-b border-[var(--border)] align-top last:border-0">
                    <td className="py-2 pr-3 font-semibold">{entry.phrase}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{entry.fix}</td>
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
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[var(--muted-foreground)]">{row.label}</span>
                  <span className="shrink-0 font-semibold">{NUM.format(row.words)} words</span>
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
        Informational only, and everything runs in your browser. Word and character limits change
        between admission cycles — always confirm the current figure on the application form itself.
        Many institutions treat a submitted statement that is not substantially your own work as
        academic misconduct, so use the output as a planning scaffold, not as text to paste.
      </p>
    </main>
  );
}

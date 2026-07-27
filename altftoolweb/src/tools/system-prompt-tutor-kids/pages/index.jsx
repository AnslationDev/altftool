"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import {
  AGE_BANDS,
  buildKidsTutorPrompt,
  DEFAULT_TOKEN_BUDGET,
  SAFETY_RULES,
  SUBJECT_OPTIONS,
  TEACHING_STYLES,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DASH = "—";

const SUBJECT_LABELS = {
  maths: "Maths",
  reading: "Reading and writing",
  science: "Science",
  socialStudies: "Geography and history",
  coding: "Beginner coding",
  languages: "Second language",
};

const SAFETY_LABELS = {
  safeTopics: "Stay on tutoring topics only",
  noPersonalData: "Never ask for personal data",
  adultReferral: "Refer sensitive issues to a trusted adult",
  noExternalContact: "No links, apps or outside contact",
  kindTone: "Always kind — never mock mistakes",
  growthPraise: "Praise effort, not intelligence",
  honestLimits: "Admit limits, never invent or scare",
};

const DEFAULTS = {
  tutorName: "Sparky",
  ageBand: "ages8to10",
  subjects: ["maths", "science"],
  teachingStyle: "socratic",
  learnerNotes: "Finds fractions hard. Loves dinosaurs and football — use them in examples.",
  extraBoundaries: "",
  safetyRules: [
    "safeTopics",
    "noPersonalData",
    "adultReferral",
    "noExternalContact",
    "kindTone",
    "growthPraise",
    "honestLimits",
  ],
  tokenBudget: String(DEFAULT_TOKEN_BUDGET),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggle = (key, option) => () => {
    setForm((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(option) ? list.filter((item) => item !== option) : [...list, option],
      };
    });
  };

  const result = useMemo(
    () => buildKidsTutorPrompt({ ...form, tokenBudget: Number(form.tokenBudget) }),
    [form],
  );
  const failed = Boolean(result.error);

  const copyPrompt = async () => {
    if (failed) return;
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          System prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Kids Tutor System Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a child-safe AI tutor: pick the age band, allowed subjects and teaching style, and
          ship it with safe-topic boundaries, a no-personal-data rule and trusted-adult referral
          built in.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Learner and subjects</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kt-name">
              Tutor name (optional)
            </label>
            <input id="kt-name" className={`mt-2 ${INPUT_CLASS}`} value={form.tutorName} onChange={set("tutorName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kt-age">
              Age band (required)
            </label>
            <select id="kt-age" className={`mt-2 ${INPUT_CLASS}`} value={form.ageBand} onChange={set("ageBand")}>
              {Object.entries(AGE_BANDS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kt-style">
              Teaching style
            </label>
            <select id="kt-style" className={`mt-2 ${INPUT_CLASS}`} value={form.teachingStyle} onChange={set("teachingStyle")}>
              {Object.entries(TEACHING_STYLES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kt-budget">
              Token budget for the system prompt
            </label>
            <input
              id="kt-budget"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="50"
              value={form.tokenBudget}
              onChange={set("tokenBudget")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kt-notes">
              About this learner (optional)
            </label>
            <textarea
              id="kt-notes"
              rows={2}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.learnerNotes}
              onChange={set("learnerNotes")}
              placeholder="Strengths, struggles, interests to use in examples"
            />
          </div>
        </div>

        <p className={`mt-4 ${LABEL_CLASS}`} id="kt-subjects-label">
          Subjects the tutor may teach
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-labelledby="kt-subjects-label">
          {Object.keys(SUBJECT_OPTIONS).map((key) => (
            <label key={key} htmlFor={`kt-subject-${key}`} className={CHECK_CLASS}>
              <input
                id={`kt-subject-${key}`}
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={form.subjects.includes(key)}
                onChange={toggle("subjects", key)}
              />
              {SUBJECT_LABELS[key]}
            </label>
          ))}
        </div>

        <p className={`mt-4 ${LABEL_CLASS}`} id="kt-safety-label">
          Safety rules
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-labelledby="kt-safety-label">
          {Object.keys(SAFETY_RULES).map((key) => (
            <label key={key} htmlFor={`kt-safety-${key}`} className={CHECK_CLASS}>
              <input
                id={`kt-safety-${key}`}
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={form.safetyRules.includes(key)}
                onChange={toggle("safetyRules", key)}
              />
              {SAFETY_LABELS[key]}
            </label>
          ))}
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="kt-extra">
            Extra family boundaries (optional)
          </label>
          <textarea
            id="kt-extra"
            rows={2}
            className={`mt-2 ${TEXTAREA_CLASS}`}
            value={form.extraBoundaries}
            onChange={set("extraBoundaries")}
            placeholder="e.g. No Halloween or ghost themes. Sessions end with one recap question."
          />
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated prompt size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `~${NUM.format(result.tokens.tokens)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to see a result."
                : `tokens · ${NUM.format(result.tokens.chars)} characters · ${result.completeness}% of optional fields filled`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              aria-label="Copy the generated kids tutor system prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
              disabled={failed}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Sections in the prompt", failed ? DASH : NUM.format(result.sections.length)],
            ["Subjects allowed", failed ? DASH : NUM.format(form.subjects.length)],
            ["Safety rules included", failed ? DASH : NUM.format(form.safetyRules.length)],
            ["Age band", failed ? DASH : AGE_BANDS[result.bandKey].label],
            ["Warnings", failed ? DASH : NUM.format(result.warnings.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && result.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Safety gaps to close</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      )}

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your system prompt</h2>
          <pre className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-md bg-[var(--muted)] p-3 text-sm leading-6 text-[var(--foreground)]">
            {result.prompt}
          </pre>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A prompt reduces risk but is not a guarantee — no AI chat is a substitute for adult
        supervision, and children&apos;s privacy laws such as COPPA impose duties on the service
        operator, not just the prompt. The prompt is assembled in your browser and sent nowhere.
      </p>
    </main>
  );
}

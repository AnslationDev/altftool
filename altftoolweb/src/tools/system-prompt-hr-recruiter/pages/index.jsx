"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Users } from "lucide-react";

import {
  buildRecruiterPrompt,
  DEFAULT_TOKEN_BUDGET,
  FAIRNESS_RULES,
  PRIVACY_RULES,
  TASK_OPTIONS,
  TONE_OPTIONS,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DASH = "—";

const TASK_LABELS = {
  jobDescriptions: "Job descriptions",
  outreach: "Candidate outreach",
  screeningQuestions: "Screening questions",
  interviewKits: "Interview kits and rubrics",
  candidateSummaries: "Candidate summaries",
  offerComms: "Offer and rejection messages",
};

const FAIRNESS_LABELS = {
  noProtectedInference: "Never infer protected characteristics",
  noProxyCriteria: "No proxy criteria (name, postcode, gaps)",
  structuredCriteria: "Same written criteria for everyone",
  inclusiveLanguage: "Inclusive, non-coded language",
  evidenceOnly: "Every judgement quotes its evidence",
  humanDecision: "Humans make every hiring decision",
};

const PRIVACY_LABELS = {
  dataMinimisation: "Data minimisation",
  noPIIEcho: "Never echo contact details or IDs",
  noBackgroundDigging: "No digging beyond submitted materials",
  confidentiality: "Applications stay confidential",
  candidateRights: "Refuse rule-breaking requests",
};

const DEFAULTS = {
  company: "Acme Analytics",
  industry: "B2B data software",
  rolesFocus: "backend engineers, data analysts and account executives",
  location: "London, UK",
  valuesNotes: "Small teams with high ownership. We hire for evidence of shipping, not brand names on a CV.",
  styleNotes: "",
  tone: "warm",
  tasks: ["jobDescriptions", "outreach", "screeningQuestions", "candidateSummaries"],
  fairnessRules: ["noProtectedInference", "noProxyCriteria", "structuredCriteria", "humanDecision"],
  privacyRules: ["dataMinimisation", "noPIIEcho", "confidentiality"],
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
    () => buildRecruiterPrompt({ ...form, tokenBudget: Number(form.tokenBudget) }),
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
          <Users className="h-4 w-4" aria-hidden="true" />
          System prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          HR Recruiter System Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Configure a recruiting assistant that drafts job posts, outreach and interview kits — with
          explicit fairness rules, candidate-privacy constraints and a human-decision safeguard
          built into the prompt.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Company and roles</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rec-company">
              Company
            </label>
            <input id="rec-company" className={`mt-2 ${INPUT_CLASS}`} value={form.company} onChange={set("company")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rec-industry">
              Industry
            </label>
            <input id="rec-industry" className={`mt-2 ${INPUT_CLASS}`} value={form.industry} onChange={set("industry")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rec-roles">
              Roles hired for (required)
            </label>
            <input id="rec-roles" className={`mt-2 ${INPUT_CLASS}`} value={form.rolesFocus} onChange={set("rolesFocus")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rec-location">
              Hiring location
            </label>
            <input id="rec-location" className={`mt-2 ${INPUT_CLASS}`} value={form.location} onChange={set("location")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rec-values">
              Company context and values
            </label>
            <textarea
              id="rec-values"
              rows={2}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.valuesNotes}
              onChange={set("valuesNotes")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Behaviour</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rec-tone">
              Tone
            </label>
            <select id="rec-tone" className={`mt-2 ${INPUT_CLASS}`} value={form.tone} onChange={set("tone")}>
              {Object.entries(TONE_OPTIONS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rec-budget">
              Token budget for the system prompt
            </label>
            <input
              id="rec-budget"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="50"
              value={form.tokenBudget}
              onChange={set("tokenBudget")}
            />
          </div>
        </div>

        <p className={`mt-4 ${LABEL_CLASS}`} id="rec-tasks-label">
          Tasks the assistant handles
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-labelledby="rec-tasks-label">
          {Object.keys(TASK_OPTIONS).map((key) => (
            <label key={key} htmlFor={`rec-task-${key}`} className={CHECK_CLASS}>
              <input
                id={`rec-task-${key}`}
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={form.tasks.includes(key)}
                onChange={toggle("tasks", key)}
              />
              {TASK_LABELS[key]}
            </label>
          ))}
        </div>

        <p className={`mt-4 ${LABEL_CLASS}`} id="rec-fair-label">
          Fairness rules
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-labelledby="rec-fair-label">
          {Object.keys(FAIRNESS_RULES).map((key) => (
            <label key={key} htmlFor={`rec-fair-${key}`} className={CHECK_CLASS}>
              <input
                id={`rec-fair-${key}`}
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={form.fairnessRules.includes(key)}
                onChange={toggle("fairnessRules", key)}
              />
              {FAIRNESS_LABELS[key]}
            </label>
          ))}
        </div>

        <p className={`mt-4 ${LABEL_CLASS}`} id="rec-priv-label">
          Privacy rules
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-labelledby="rec-priv-label">
          {Object.keys(PRIVACY_RULES).map((key) => (
            <label key={key} htmlFor={`rec-priv-${key}`} className={CHECK_CLASS}>
              <input
                id={`rec-priv-${key}`}
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={form.privacyRules.includes(key)}
                onChange={toggle("privacyRules", key)}
              />
              {PRIVACY_LABELS[key]}
            </label>
          ))}
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="rec-style">
            Extra writing rules (optional)
          </label>
          <textarea
            id="rec-style"
            rows={2}
            className={`mt-2 ${TEXTAREA_CLASS}`}
            value={form.styleNotes}
            onChange={set("styleNotes")}
            placeholder="e.g. Always British English. Salary range in every job post."
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
                : `tokens · ${NUM.format(result.tokens.chars)} characters · ${result.completeness}% of recommended fields filled`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              aria-label="Copy the generated recruiting system prompt"
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
            ["Tasks included", failed ? DASH : NUM.format(form.tasks.length)],
            ["Fairness rules included", failed ? DASH : NUM.format(form.fairnessRules.length)],
            ["Privacy rules included", failed ? DASH : NUM.format(form.privacyRules.length)],
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
          <h2 className="text-base font-semibold">Gaps worth closing</h2>
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
        Informational tool, not legal advice. Employment and data-protection law varies by
        jurisdiction — have counsel review any AI-assisted hiring workflow, and note that rules
        like NYC Local Law 144 impose audit duties on automated employment decision tools. The
        prompt is assembled in your browser and sent nowhere.
      </p>
    </main>
  );
}

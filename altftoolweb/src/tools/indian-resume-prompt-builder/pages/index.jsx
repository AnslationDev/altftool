"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileUser, RotateCcw } from "lucide-react";

import {
  INDIA_FIELDS,
  TASKS,
  TONE_OPTIONS,
  buildIndianResumePrompt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

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

const DASH = "—";

const DEFAULTS = {
  taskId: "tailor",
  targetRole: "Backend Engineer",
  industry: "fintech",
  years: "6",
  roleCount: "3",
  targetPages: "2",
  toneId: "impact",
  summaryWords: "45",
  skillsCount: "12",
  educationCount: "2",
  jobKeywords: "Java, Spring Boot, Kafka, Kubernetes, REST APIs, PostgreSQL",
  resumeText:
    "Built Java and Spring Boot microservices handling payment settlement, with Kafka event streams and PostgreSQL as the store of record. Exposed REST APIs consumed by three internal teams.",
  fieldIds: ["notice", "location"],
};

const numeric = (value) => (value.trim() === "" ? Number.NaN : Number(value));

export default function ToolHome() {
  const [taskId, setTaskId] = useState(DEFAULTS.taskId);
  const [targetRole, setTargetRole] = useState(DEFAULTS.targetRole);
  const [industry, setIndustry] = useState(DEFAULTS.industry);
  const [years, setYears] = useState(DEFAULTS.years);
  const [roleCount, setRoleCount] = useState(DEFAULTS.roleCount);
  const [targetPages, setTargetPages] = useState(DEFAULTS.targetPages);
  const [toneId, setToneId] = useState(DEFAULTS.toneId);
  const [summaryWords, setSummaryWords] = useState(DEFAULTS.summaryWords);
  const [skillsCount, setSkillsCount] = useState(DEFAULTS.skillsCount);
  const [educationCount, setEducationCount] = useState(DEFAULTS.educationCount);
  const [jobKeywords, setJobKeywords] = useState(DEFAULTS.jobKeywords);
  const [resumeText, setResumeText] = useState(DEFAULTS.resumeText);
  const [fieldIds, setFieldIds] = useState(DEFAULTS.fieldIds);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildIndianResumePrompt({
        taskId,
        targetRole,
        industry: industry.trim(),
        yearsExperience: numeric(years),
        roleCount: numeric(roleCount),
        targetPages: numeric(targetPages),
        toneId,
        summaryWords: numeric(summaryWords),
        skillsCount: numeric(skillsCount),
        educationCount: numeric(educationCount),
        jobKeywords,
        resumeText,
        indiaFieldIds: fieldIds,
      }),
    [
      taskId,
      targetRole,
      industry,
      years,
      roleCount,
      targetPages,
      toneId,
      summaryWords,
      skillsCount,
      educationCount,
      jobKeywords,
      resumeText,
      fieldIds,
    ],
  );

  const hasError = Boolean(result.error);

  const toggleField = (id) => {
    setFieldIds((previous) =>
      previous.includes(id) ? previous.filter((entry) => entry !== id) : [...previous, id],
    );
    setCopied(false);
  };

  const reset = () => {
    setTaskId(DEFAULTS.taskId);
    setTargetRole(DEFAULTS.targetRole);
    setIndustry(DEFAULTS.industry);
    setYears(DEFAULTS.years);
    setRoleCount(DEFAULTS.roleCount);
    setTargetPages(DEFAULTS.targetPages);
    setToneId(DEFAULTS.toneId);
    setSummaryWords(DEFAULTS.summaryWords);
    setSkillsCount(DEFAULTS.skillsCount);
    setEducationCount(DEFAULTS.educationCount);
    setJobKeywords(DEFAULTS.jobKeywords);
    setResumeText(DEFAULTS.resumeText);
    setFieldIds(DEFAULTS.fieldIds);
    setCopied(false);
  };

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

  const coverageLabel =
    hasError || result.keywords.coveragePercent === null
      ? DASH
      : `${result.keywords.coveragePercent}%`;

  const rows = hasError
    ? [
        ["Keyword coverage", DASH],
        ["Page budget", DASH],
        ["Bullets that fit", DASH],
        ["Estimated length", DASH],
      ]
    : [
        [
          "Keyword coverage",
          result.keywords.total === 0
            ? "No job description terms given"
            : `${result.keywords.matchedCount} of ${result.keywords.total} terms (${result.keywords.coveragePercent}%)`,
        ],
        ["Missing keywords", result.keywords.missing.length === 0 ? "None" : result.keywords.missing.join(", ")],
        ["Page budget", `${result.plan.targetPages} page(s) — about ${result.plan.availableLines} lines`],
        ["Lines taken by fixed blocks", `${result.plan.fixedLines} lines`],
        ["Lines left for bullets", `${result.plan.lineBudgetForBullets} lines`],
        [
          "Bullet allocation (recent first)",
          result.plan.allocation.join(" / "),
        ],
        ["Bullets in total", `${result.plan.totalBullets} at ${result.plan.bulletMaxWords} words maximum`],
        ["Estimated length", `${NUM.format(result.plan.estimatedPages)} page(s), ${result.plan.estimatedLines} lines`],
        [
          "Conventional length for your experience",
          result.guidance ? `${result.guidance.pages} page(s)` : DASH,
        ],
        ["Prompt size", `${result.words} words`],
      ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileUser className="h-4 w-4" aria-hidden="true" />
          India resume prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Indian Resume Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set your target role and page budget. The tool works out how many bullets actually fit on
          the page, measures how much of the job description&apos;s wording your resume already
          uses, and writes a prompt that carries both into the model along with the ATS rules.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What you want written</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="irp-task">
              Task
            </label>
            <select
              id="irp-task"
              className={`mt-2 ${INPUT_CLASS}`}
              value={taskId}
              onChange={(event) => setTaskId(event.target.value)}
            >
              {TASKS.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="irp-tone">
              Tone
            </label>
            <select
              id="irp-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={toneId}
              onChange={(event) => setToneId(event.target.value)}
            >
              {TONE_OPTIONS.map((tone) => (
                <option key={tone.id} value={tone.id}>
                  {tone.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="irp-role">
              Target job title
            </label>
            <input
              id="irp-role"
              type="text"
              className={`mt-2 ${INPUT_CLASS}`}
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
              placeholder="Backend Engineer"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="irp-industry">
              Target sector (optional)
            </label>
            <input
              id="irp-industry"
              type="text"
              className={`mt-2 ${INPUT_CLASS}`}
              value={industry}
              onChange={(event) => setIndustry(event.target.value)}
              placeholder="fintech"
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Length budget</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="irp-years">
              Total years of experience
            </label>
            <input
              id="irp-years"
              type="number"
              inputMode="decimal"
              min="0"
              max="60"
              step="0.5"
              className={`mt-2 ${INPUT_CLASS}`}
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="irp-pages">
              Pages allowed
            </label>
            <select
              id="irp-pages"
              className={`mt-2 ${INPUT_CLASS}`}
              value={targetPages}
              onChange={(event) => setTargetPages(event.target.value)}
            >
              <option value="1">1 page</option>
              <option value="2">2 pages</option>
              <option value="3">3 pages</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="irp-roles">
              Roles you will list
            </label>
            <input
              id="irp-roles"
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={roleCount}
              onChange={(event) => setRoleCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="irp-summary">
              Summary length in words
            </label>
            <input
              id="irp-summary"
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              className={`mt-2 ${INPUT_CLASS}`}
              value={summaryWords}
              onChange={(event) => setSummaryWords(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="irp-skills">
              Skills listed
            </label>
            <input
              id="irp-skills"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={skillsCount}
              onChange={(event) => setSkillsCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="irp-education">
              Education entries
            </label>
            <input
              id="irp-education"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={educationCount}
              onChange={(event) => setEducationCount(event.target.value)}
            />
          </div>
        </div>
        <p className={HINT_CLASS}>
          One A4 page at 11 pt with 0.75 inch margins holds roughly 46 lines. Each bullet is planned
          at two lines, so the bullet allocation is what is genuinely left after the header, summary,
          skills and education have taken their share.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Keyword match</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="irp-keywords">
              Key terms from the job description
            </label>
            <textarea
              id="irp-keywords"
              rows={3}
              className={`mt-2 ${AREA_CLASS}`}
              value={jobKeywords}
              onChange={(event) => setJobKeywords(event.target.value)}
              placeholder="Java, Spring Boot, Kafka"
            />
            <p className={HINT_CLASS}>Separate with commas, semicolons or new lines.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="irp-resume">
              Your current resume text
            </label>
            <textarea
              id="irp-resume"
              rows={5}
              className={`mt-2 ${AREA_CLASS}`}
              value={resumeText}
              onChange={(event) => setResumeText(event.target.value)}
              placeholder="Paste your experience section here"
            />
            <p className={HINT_CLASS}>
              Used only in your browser to check which terms already appear. Nothing is uploaded.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">India-specific header lines</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Each one you tick costs a line of the page budget and is written into the prompt.
        </p>
        <ul className="mt-4 grid gap-2">
          {INDIA_FIELDS.map((field) => (
            <li key={field.id}>
              <label
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`irp-field-${field.id}`}
              >
                <input
                  id={`irp-field-${field.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={fieldIds.includes(field.id)}
                  onChange={() => toggleField(field.id)}
                />
                {field.label}
              </label>
            </li>
          ))}
        </ul>
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
              Keyword coverage
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{coverageLabel}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to build the prompt." : result.keywords.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the finished resume prompt to the clipboard"
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
              aria-label="Reset every field to its default"
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

        {hasError ? null : (
          <>
            <p
              role="status"
              className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
                result.plan.fits
                  ? "bg-[var(--muted)] text-[var(--muted-foreground)]"
                  : "bg-[var(--warning-soft)] text-[var(--warning)]"
              }`}
            >
              {result.plan.advice}
            </p>

            <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--foreground)]">
                {result.prompt}
              </pre>
            </div>
          </>
        )}
      </section>

      {hasError ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Before you send it out</h2>
          <ul className="mt-3 grid gap-2 text-sm text-[var(--muted-foreground)]">
            {result.checklist.map((item) => (
              <li key={item} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Page and bullet figures are geometry estimates for A4 at 11 pt with 0.75 inch margins — your
        template will vary. Keyword coverage is a writing aid, not a score any applicant tracking
        system publishes. Everything runs in your browser; nothing you paste is sent anywhere.
      </p>
    </main>
  );
}

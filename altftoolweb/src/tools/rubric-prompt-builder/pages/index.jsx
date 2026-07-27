"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, TableProperties, Trash2 } from "lucide-react";

import {
  LEVEL_PRESETS,
  MAX_CRITERIA,
  MAX_TOTAL_POINTS,
  MIN_CRITERIA,
  MIN_TOTAL_POINTS,
  buildRubricPrompt,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US");
const DASH = "—";

const DEFAULT_CRITERIA = [
  { name: "Thesis and argument", weight: "30" },
  { name: "Evidence and analysis", weight: "30" },
  { name: "Organisation and structure", weight: "25" },
  { name: "Grammar and mechanics", weight: "15" },
];

const DEFAULTS = {
  assignment: "A 1,500-word persuasive essay on renewable energy policy",
  audience: "First-year undergraduate writing course",
  totalPoints: "100",
  levelPresetId: "4",
  includeFeedbackLine: true,
};

export default function ToolHome() {
  const [assignment, setAssignment] = useState(DEFAULTS.assignment);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [totalPoints, setTotalPoints] = useState(DEFAULTS.totalPoints);
  const [levelPresetId, setLevelPresetId] = useState(DEFAULTS.levelPresetId);
  const [criteria, setCriteria] = useState(DEFAULT_CRITERIA);
  const [includeFeedbackLine, setIncludeFeedbackLine] = useState(DEFAULTS.includeFeedbackLine);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildRubricPrompt({
        assignment,
        audience,
        totalPoints: totalPoints.trim() === "" ? Number.NaN : Number(totalPoints),
        levelPresetId,
        criteria: criteria.map((row) => ({
          name: row.name,
          weight: row.weight.trim() === "" ? Number.NaN : Number(row.weight),
        })),
        includeFeedbackLine,
      }),
    [assignment, audience, totalPoints, levelPresetId, criteria, includeFeedbackLine],
  );

  const hasError = Boolean(result.error);

  const updateCriterion = (index, field, value) => {
    setCriteria((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)),
    );
  };

  const addCriterion = () => {
    setCriteria((current) =>
      current.length >= MAX_CRITERIA ? current : [...current, { name: "", weight: "" }],
    );
  };

  const removeCriterion = (index) => {
    setCriteria((current) =>
      current.length <= MIN_CRITERIA ? current : current.filter((_, rowIndex) => rowIndex !== index),
    );
  };

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
    setAssignment(DEFAULTS.assignment);
    setAudience(DEFAULTS.audience);
    setTotalPoints(DEFAULTS.totalPoints);
    setLevelPresetId(DEFAULTS.levelPresetId);
    setCriteria(DEFAULT_CRITERIA);
    setIncludeFeedbackLine(DEFAULTS.includeFeedbackLine);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Criteria", DASH],
        ["Performance levels", DASH],
        ["Points check", DASH],
      ]
    : [
        ["Criteria", NUM.format(result.criteriaCount)],
        ["Performance levels", result.levelLabels.join(" · ")],
        ...result.criteriaPoints.map((row) => [
          `${row.name} (${row.weight}%)`,
          `${NUM.format(row.maxPoints)} pts`,
        ]),
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TableProperties className="h-4 w-4" aria-hidden="true" />
          AI for learning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Rubric Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Define your criteria, weights and performance levels. The tool converts weights into whole
          point maxima that sum exactly to your total, then writes a prompt that makes an AI produce
          a clean analytic rubric table.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rubric-assignment">
              Assignment being graded
            </label>
            <input
              id="rubric-assignment"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={assignment}
              onChange={(event) => setAssignment(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rubric-audience">
              Course / level (optional)
            </label>
            <input
              id="rubric-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="rubric-points">
                Total points
              </label>
              <input
                id="rubric-points"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min={MIN_TOTAL_POINTS}
                max={MAX_TOTAL_POINTS}
                step="1"
                value={totalPoints}
                onChange={(event) => setTotalPoints(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="rubric-levels">
                Levels
              </label>
              <select
                id="rubric-levels"
                className={`mt-2 ${INPUT_CLASS}`}
                value={levelPresetId}
                onChange={(event) => setLevelPresetId(event.target.value)}
              >
                {LEVEL_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.count} levels
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className={LABEL_CLASS}>Criteria and weights (weights must total 100%)</legend>
          <div className="mt-2 space-y-3">
            {criteria.map((row, index) => (
              <div key={index} className="grid grid-cols-[1fr_auto_auto] items-end gap-2 sm:gap-3">
                <div>
                  <label
                    className="block text-xs font-semibold text-[var(--muted-foreground)]"
                    htmlFor={`rubric-crit-name-${index}`}
                  >
                    Criterion {index + 1}
                  </label>
                  <input
                    id={`rubric-crit-name-${index}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="text"
                    value={row.name}
                    onChange={(event) => updateCriterion(index, "name", event.target.value)}
                  />
                </div>
                <div className="w-20 sm:w-24">
                  <label
                    className="block text-xs font-semibold text-[var(--muted-foreground)]"
                    htmlFor={`rubric-crit-weight-${index}`}
                  >
                    Weight %
                  </label>
                  <input
                    id={`rubric-crit-weight-${index}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="100"
                    step="5"
                    value={row.weight}
                    onChange={(event) => updateCriterion(index, "weight", event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeCriterion(index)}
                  disabled={criteria.length <= MIN_CRITERIA}
                  aria-label={`Remove criterion ${index + 1}`}
                  className={`${GHOST_BTN} px-3 disabled:opacity-40`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addCriterion}
            disabled={criteria.length >= MAX_CRITERIA}
            className={`${GHOST_BTN} mt-3 disabled:opacity-40`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add criterion
          </button>
        </fieldset>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm"
          htmlFor="rubric-feedback"
        >
          <input
            id="rubric-feedback"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={includeFeedbackLine}
            onChange={(event) => setIncludeFeedbackLine(event.target.checked)}
          />
          Ask for a feedback sentence stem per criterion
        </label>
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
              Rubric total
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.totalPoints)} pts`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={hasError}
              aria-label="Copy the generated rubric prompt"
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
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <h2 className="text-base font-semibold">Generated prompt</h2>
          <pre className="mt-2 max-h-96 overflow-x-auto overflow-y-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
            {hasError ? "Fix the input above to generate the prompt." : result.prompt}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The prompt is assembled locally in your browser. Review the AI-generated rubric before
        sharing it with students — point bands and descriptors should match your institution&apos;s
        grading policy.
      </p>
    </main>
  );
}

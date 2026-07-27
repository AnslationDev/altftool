"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Trophy } from "lucide-react";

import {
  MAX_CRITERIA,
  MAX_OPTIONS,
  RATING_MAX,
  RATING_MIN,
  WEIGHT_MAX,
  WEIGHT_MIN,
  evaluateMatrix,
  formatReport,
} from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const ICON_BTN =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_CRITERIA = [
  { id: "c1", name: "Monthly cost", weight: 5, lowerIsBetter: true },
  { id: "c2", name: "Time to launch", weight: 3, lowerIsBetter: true },
  { id: "c3", name: "Feature fit", weight: 4, lowerIsBetter: false },
  { id: "c4", name: "Support quality", weight: 2, lowerIsBetter: false },
];

const DEFAULT_OPTIONS = [
  { id: "o1", name: "Build in-house", scores: { c1: 8, c2: 9, c3: 9, c4: 7 } },
  { id: "o2", name: "Vendor platform", scores: { c1: 4, c2: 3, c3: 7, c4: 8 } },
  { id: "o3", name: "Open source + support", scores: { c1: 3, c2: 5, c3: 6, c4: 5 } },
];

const clone = (value) => JSON.parse(JSON.stringify(value));

const number1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export default function ToolHome() {
  const [title, setTitle] = useState("Build vs buy");
  const [criteria, setCriteria] = useState(clone(DEFAULT_CRITERIA));
  const [options, setOptions] = useState(clone(DEFAULT_OPTIONS));
  const [nextId, setNextId] = useState(10);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => evaluateMatrix(criteria, options), [criteria, options]);

  const updateCriterion = (id, patch) => {
    setCriteria((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const updateOption = (id, patch) => {
    setOptions((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const updateScore = (optionId, criterionId, value) => {
    setOptions((current) =>
      current.map((item) =>
        item.id === optionId
          ? { ...item, scores: { ...item.scores, [criterionId]: Number(value) } }
          : item,
      ),
    );
  };

  const addCriterion = () => {
    if (criteria.length >= MAX_CRITERIA) return;
    const id = `c${nextId}`;
    setNextId((value) => value + 1);
    setCriteria((current) => [...current, { id, name: "New criterion", weight: 3, lowerIsBetter: false }]);
    setOptions((current) =>
      current.map((option) => ({ ...option, scores: { ...option.scores, [id]: 5 } })),
    );
  };

  const removeCriterion = (id) => {
    setCriteria((current) => current.filter((item) => item.id !== id));
    setOptions((current) =>
      current.map((option) => {
        const scores = { ...option.scores };
        delete scores[id];
        return { ...option, scores };
      }),
    );
  };

  const addOption = () => {
    if (options.length >= MAX_OPTIONS) return;
    const id = `o${nextId}`;
    setNextId((value) => value + 1);
    const scores = {};
    for (const criterion of criteria) scores[criterion.id] = 5;
    setOptions((current) => [...current, { id, name: "New option", scores }]);
  };

  const removeOption = (id) => {
    setOptions((current) => current.filter((item) => item.id !== id));
  };

  const copyResult = async () => {
    if (result.error) return;
    try {
      await navigator.clipboard.writeText(formatReport(result, title || "Decision matrix"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTitle("Build vs buy");
    setCriteria(clone(DEFAULT_CRITERIA));
    setOptions(clone(DEFAULT_OPTIONS));
    setNextId(10);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)] sm:text-2xl">
          <Trophy className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          Decision Matrix Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Weight what matters, rate each option from {RATING_MIN} to {RATING_MAX}, and get a ranked
          answer with the sensitivity analysis that tells you how fragile it is.
        </p>
      </header>

      <div className="mb-6">
        <label className={LABEL_CLASS} htmlFor="dm-title">
          Decision
        </label>
        <input
          id="dm-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={`${INPUT_CLASS} mt-1.5`}
        />
      </div>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Criteria and weights</h2>
          <button
            type="button"
            onClick={addCriterion}
            disabled={criteria.length >= MAX_CRITERIA}
            className={`${GHOST_BTN} disabled:opacity-50`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add criterion
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          {criteria.map((criterion, index) => (
            <div key={criterion.id} className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <div>
                <label className="sr-only" htmlFor={`crit-name-${criterion.id}`}>
                  Criterion {index + 1} name
                </label>
                <input
                  id={`crit-name-${criterion.id}`}
                  type="text"
                  value={criterion.name}
                  onChange={(event) => updateCriterion(criterion.id, { name: event.target.value })}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-[var(--muted-foreground)]" htmlFor={`crit-weight-${criterion.id}`}>
                  Weight
                </label>
                <input
                  id={`crit-weight-${criterion.id}`}
                  type="number"
                  min={WEIGHT_MIN}
                  max={WEIGHT_MAX}
                  step={1}
                  value={criterion.weight}
                  onChange={(event) =>
                    updateCriterion(criterion.id, { weight: Number(event.target.value) })
                  }
                  className={`${INPUT_CLASS} w-24`}
                />
              </div>
              <div className="flex items-center gap-2">
                <label
                  className="flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs text-[var(--foreground)]"
                  htmlFor={`crit-lower-${criterion.id}`}
                >
                  <input
                    id={`crit-lower-${criterion.id}`}
                    type="checkbox"
                    checked={Boolean(criterion.lowerIsBetter)}
                    onChange={(event) =>
                      updateCriterion(criterion.id, { lowerIsBetter: event.target.checked })
                    }
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                  Lower is better
                </label>
                <button
                  type="button"
                  onClick={() => removeCriterion(criterion.id)}
                  aria-label={`Remove criterion ${criterion.name}`}
                  className={ICON_BTN}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Ratings</h2>
          <button
            type="button"
            onClick={addOption}
            disabled={options.length >= MAX_OPTIONS}
            className={`${GHOST_BTN} disabled:opacity-50`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add option
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Option</th>
                {criteria.map((criterion) => (
                  <th key={criterion.id} scope="col" className="py-2 pr-3 font-semibold whitespace-nowrap">
                    {criterion.name}
                  </th>
                ))}
                <th scope="col" className="py-2 font-semibold">Remove</th>
              </tr>
            </thead>
            <tbody>
              {options.map((option) => (
                <tr key={option.id} className="border-b border-[var(--border)]">
                  <td className="py-2 pr-3">
                    <label className="sr-only" htmlFor={`opt-name-${option.id}`}>
                      Option name
                    </label>
                    <input
                      id={`opt-name-${option.id}`}
                      type="text"
                      value={option.name}
                      onChange={(event) => updateOption(option.id, { name: event.target.value })}
                      className={`${INPUT_CLASS} min-w-[10rem]`}
                    />
                  </td>
                  {criteria.map((criterion) => (
                    <td key={criterion.id} className="py-2 pr-3">
                      <label className="sr-only" htmlFor={`score-${option.id}-${criterion.id}`}>
                        {option.name} rating for {criterion.name}
                      </label>
                      <input
                        id={`score-${option.id}-${criterion.id}`}
                        type="number"
                        min={RATING_MIN}
                        max={RATING_MAX}
                        step={1}
                        value={option.scores[criterion.id] ?? ""}
                        onChange={(event) => updateScore(option.id, criterion.id, event.target.value)}
                        className={`${INPUT_CLASS} w-20`}
                      />
                    </td>
                  ))}
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => removeOption(option.id)}
                      aria-label={`Remove option ${option.name}`}
                      className={ICON_BTN}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Highest weighted score</p>
            <p className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
              {result.error ? DASH : `${number1.format(result.winner.scoreRounded)} / ${RATING_MAX}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error ? DASH : `${result.winner.name} · ${result.confidenceLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the decision report"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the matrix" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Runner-up", result.error ? DASH : result.runnerUp.name],
            ["Margin", result.error ? DASH : number1.format(result.margin)],
            ["Decided mainly by", result.error ? DASH : result.decisiveCriterion || DASH],
            ["Criteria weighted", result.error ? DASH : String(result.criteriaCount)],
            ["Options compared", result.error ? DASH : String(result.optionCount)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>

        {!result.error && (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{result.confidenceNote}</p>
        )}
      </section>

      {!result.error && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Ranking</h2>
          <ol className="mt-3 grid gap-2">
            {result.ranked.map((option) => (
              <li
                key={option.id}
                className="flex items-center justify-between gap-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
              >
                <span className="font-semibold text-[var(--foreground)]">
                  {option.rank}. {option.name}
                </span>
                <span
                  className={
                    option.rank === 1
                      ? "font-bold text-[var(--success)]"
                      : "font-semibold text-[var(--muted-foreground)]"
                  }
                >
                  {number1.format(option.scoreRounded)} ({option.percentOfMax}%)
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {!result.error && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            What would change the answer
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-4 font-semibold">Criterion</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Weight now</th>
                  <th scope="col" className="py-2 font-semibold">
                    Weight that would let {result.runnerUp.name} win
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.flips.map((flip) => (
                  <tr key={flip.id} className="border-b border-[var(--border)]">
                    <th scope="row" className="py-2.5 pr-4 font-semibold text-[var(--foreground)]">
                      {flip.name}
                    </th>
                    <td className="py-2.5 pr-4 text-[var(--muted-foreground)]">
                      {flip.currentWeight ?? DASH}
                    </td>
                    <td className="py-2.5 text-[var(--foreground)]">
                      {flip.reachable ? number1.format(flip.needed) : "Out of reach"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            &quot;Out of reach&quot; means no weight between {WEIGHT_MIN} and {WEIGHT_MAX} on that
            criterion alone can flip the result.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A weighted matrix makes reasoning visible; it does not make it objective. If the winner
        changes every time you nudge a weight, that is the model telling you the options are close
        and the decision belongs on grounds it does not measure.
      </p>
    </main>
  );
}

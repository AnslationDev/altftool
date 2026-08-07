"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sheet, TriangleAlert } from "lucide-react";

import {
  OUTPUT_TARGETS,
  SHEETS_LAST_COLUMN,
  SHEETS_MAX_CELLS,
  TASK_TYPES,
  buildSheetsPrompt,
} from "../lib";

const COUNT = new Intl.NumberFormat("en-US");
const DASH = "—";

const DEFAULTS = {
  sheetName: "Q1 Sales",
  range: "A1:E500",
  headerRow: "1",
  headers: "Date, Channel, Spend, Clicks, Signups",
  taskId: "query",
  goal: "Show total signups and cost per signup for each channel, one row per week.",
  outputTarget: "new-tab",
  frozenHeader: true,
  extraContext: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [sheetName, setSheetName] = useState(DEFAULTS.sheetName);
  const [range, setRange] = useState(DEFAULTS.range);
  const [headerRow, setHeaderRow] = useState(DEFAULTS.headerRow);
  const [headers, setHeaders] = useState(DEFAULTS.headers);
  const [taskId, setTaskId] = useState(DEFAULTS.taskId);
  const [goal, setGoal] = useState(DEFAULTS.goal);
  const [outputTarget, setOutputTarget] = useState(DEFAULTS.outputTarget);
  const [frozenHeader, setFrozenHeader] = useState(DEFAULTS.frozenHeader);
  const [extraContext, setExtraContext] = useState(DEFAULTS.extraContext);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildSheetsPrompt({
        sheetName,
        range,
        headerRow,
        headers,
        taskId,
        goal,
        outputTarget,
        frozenHeader,
        extraContext,
      }),
    [sheetName, range, headerRow, headers, taskId, goal, outputTarget, frozenHeader, extraContext],
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
    setSheetName(DEFAULTS.sheetName);
    setRange(DEFAULTS.range);
    setHeaderRow(DEFAULTS.headerRow);
    setHeaders(DEFAULTS.headers);
    setTaskId(DEFAULTS.taskId);
    setGoal(DEFAULTS.goal);
    setOutputTarget(DEFAULTS.outputTarget);
    setFrozenHeader(DEFAULTS.frozenHeader);
    setExtraContext(DEFAULTS.extraContext);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["A1 reference", DASH],
        ["Size", DASH],
        ["Data rows", DASH],
        ["Cells covered", DASH],
        ["Headers named", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["A1 reference", result.reference],
        [
          "Size",
          result.range.rowCount === null
            ? `${COUNT.format(result.range.columnCount)} columns, open-ended`
            : `${COUNT.format(result.range.rowCount)} rows x ${COUNT.format(result.range.columnCount)} columns`,
        ],
        ["Data rows", result.dataRowCount === null ? "Unknown (open-ended)" : COUNT.format(result.dataRowCount)],
        ["Cells covered", result.range.cellCount === null ? "Unknown (open-ended)" : COUNT.format(result.range.cellCount)],
        ["Headers named", COUNT.format(result.headerCount)],
        ["Prompt length", `${COUNT.format(result.characterCount)} characters`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sheet className="h-4 w-4" aria-hidden="true" />
          Google Sheets
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Google Sheets AI Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe the tab, the range and the columns once, and get a prompt an AI assistant can act
          on — with the tab name quoted the way A1 notation requires and the range measured against
          the Google Sheets cell budget.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gs-sheet">
              Tab name
            </label>
            <input
              id="gs-sheet"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={sheetName}
              onChange={(event) => setSheetName(event.target.value)}
            />
            <p className={HINT_CLASS}>Spaces or punctuation mean the name has to be quoted.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gs-range">
              Range (A1 notation)
            </label>
            <input
              id="gs-range"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={range}
              onChange={(event) => setRange(event.target.value)}
            />
            <p className={HINT_CLASS}>
              A1:E500, A2:E or A:E · up to column {SHEETS_LAST_COLUMN}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gs-header-row">
              Header row number
            </label>
            <input
              id="gs-header-row"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={headerRow}
              onChange={(event) => setHeaderRow(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gs-task">
              What should the assistant do?
            </label>
            <select
              id="gs-task"
              className={`mt-2 ${INPUT_CLASS}`}
              value={taskId}
              onChange={(event) => setTaskId(event.target.value)}
            >
              {TASK_TYPES.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="gs-headers">
            Column headers, left to right
          </label>
          <textarea
            id="gs-headers"
            className={`mt-2 ${TEXTAREA_CLASS}`}
            rows={2}
            value={headers}
            onChange={(event) => setHeaders(event.target.value)}
          />
          <p className={HINT_CLASS}>
            Commas or new lines. Each header is mapped to its column letter and its QUERY Col index.
          </p>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="gs-goal">
            What do you actually want? (one sentence)
          </label>
          <textarea
            id="gs-goal"
            className={`mt-2 ${TEXTAREA_CLASS}`}
            rows={3}
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
          />
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="gs-target">
            Where should the answer go?
          </label>
          <select
            id="gs-target"
            className={`mt-2 ${INPUT_CLASS}`}
            value={outputTarget}
            onChange={(event) => setOutputTarget(event.target.value)}
          >
            {OUTPUT_TARGETS.map((target) => (
              <option key={target.id} value={target.id}>
                {target.label}
              </option>
            ))}
          </select>
        </div>

        <label
          className="mt-4 flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
          htmlFor="gs-frozen"
        >
          <input
            id="gs-frozen"
            type="checkbox"
            className="h-5 w-5 accent-[var(--primary)]"
            checked={frozenHeader}
            onChange={(event) => setFrozenHeader(event.target.checked)}
          />
          <span className="text-sm font-medium">The header row is frozen (View &rsaquo; Freeze)</span>
        </label>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="gs-context">
            Extra context (optional)
          </label>
          <textarea
            id="gs-context"
            className={`mt-2 ${TEXTAREA_CLASS}`}
            rows={2}
            value={extraContext}
            onChange={(event) => setExtraContext(event.target.value)}
            placeholder="Spend is in INR. Weeks start on Monday."
          />
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Full reference
            </p>
            <p className="mt-1 break-all text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : result.reference}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input below to build the prompt"
                : `Budget: ${COUNT.format(SHEETS_MAX_CELLS)} cells per spreadsheet`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={hasError}
              aria-label="Copy the generated Google Sheets prompt"
              className={`${GHOST_BTN} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {hasError ? (
          <p
            role="alert"
            className="mt-5 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="break-all text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-5 space-y-2" aria-live="polite">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="flex gap-2 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your prompt</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-full whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-4 text-sm leading-6 text-[var(--foreground)]">
              {result.prompt}
            </pre>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Runs entirely in your browser — no cell values are entered or uploaded. Which AI features are
        available in Sheets depends on your Google Workspace plan and region.
      </p>
    </main>
  );
}

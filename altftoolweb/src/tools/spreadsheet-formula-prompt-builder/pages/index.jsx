"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Table } from "lucide-react";

import { GOALS, PLATFORMS, SEPARATORS, buildFormulaPrompt } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  headerText: "Order ID\tCustomer\tAmount\tStatus\tCreated At",
  headerRow: "1",
  lastRow: "5000",
  sheetName: "Orders",
  platformId: "excel365",
  separatorId: "comma",
  goalId: "aggregate",
  outputColumn: "F",
  task: "Sum Amount for rows where Status is \"paid\" and Created At falls in the same month as the date in H1",
  notes: "",
};

export default function ToolHome() {
  const [headerText, setHeaderText] = useState(DEFAULTS.headerText);
  const [headerRow, setHeaderRow] = useState(DEFAULTS.headerRow);
  const [lastRow, setLastRow] = useState(DEFAULTS.lastRow);
  const [sheetName, setSheetName] = useState(DEFAULTS.sheetName);
  const [platformId, setPlatformId] = useState(DEFAULTS.platformId);
  const [separatorId, setSeparatorId] = useState(DEFAULTS.separatorId);
  const [goalId, setGoalId] = useState(DEFAULTS.goalId);
  const [outputColumn, setOutputColumn] = useState(DEFAULTS.outputColumn);
  const [task, setTask] = useState(DEFAULTS.task);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildFormulaPrompt({
        headerText,
        headerRow: Number(headerRow),
        lastRow: Number(lastRow),
        sheetName,
        platformId,
        separatorId,
        goalId,
        outputColumn,
        task,
        notes,
      }),
    [
      headerText,
      headerRow,
      lastRow,
      sheetName,
      platformId,
      separatorId,
      goalId,
      outputColumn,
      task,
      notes,
    ],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setHeaderText(DEFAULTS.headerText);
    setHeaderRow(DEFAULTS.headerRow);
    setLastRow(DEFAULTS.lastRow);
    setSheetName(DEFAULTS.sheetName);
    setPlatformId(DEFAULTS.platformId);
    setSeparatorId(DEFAULTS.separatorId);
    setGoalId(DEFAULTS.goalId);
    setOutputColumn(DEFAULTS.outputColumn);
    setTask(DEFAULTS.task);
    setNotes(DEFAULTS.notes);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Data range", DASH],
        ["Formula goes in", DASH],
        ["Argument separator", DASH],
        ["Blocked functions", DASH],
        ["Prompt length", DASH],
      ]
    : [
        [
          "Data range",
          `rows ${NUM.format(result.firstDataRow)}–${NUM.format(result.lastRow)} · ${NUM.format(result.rowCount)} data rows`,
        ],
        [
          "Formula goes in",
          result.targetLetter ? `${result.targetLetter}${result.firstDataRow}` : "not specified",
        ],
        ["Argument separator", `"${result.separator.character}"`],
        ["Blocked functions", result.platform.unavailable.join(", ")],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Table className="h-4 w-4" aria-hidden="true" />
          Spreadsheets
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Spreadsheet Formula Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste your header row. Each column is mapped to its real letter and
          range, and the prompt is written in your application&apos;s dialect —
          with the functions it does not have explicitly ruled out.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sf-headers">
              Header row — paste it, tab or comma separated
            </label>
            <textarea
              id="sf-headers"
              className={`mt-2 ${AREA_CLASS}`}
              rows={2}
              value={headerText}
              onChange={(event) => setHeaderText(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sf-sheet">
              Sheet name (optional)
            </label>
            <input
              id="sf-sheet"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={sheetName}
              onChange={(event) => setSheetName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sf-output">
              Output column letter (optional)
            </label>
            <input
              id="sf-output"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={outputColumn}
              onChange={(event) => setOutputColumn(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sf-headerrow">
              Header is on row
            </label>
            <input
              id="sf-headerrow"
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
            <label className={LABEL_CLASS} htmlFor="sf-lastrow">
              Last row with data
            </label>
            <input
              id="sf-lastrow"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="2"
              step="1"
              value={lastRow}
              onChange={(event) => setLastRow(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sf-platform">
              Application
            </label>
            <select
              id="sf-platform"
              className={`mt-2 ${INPUT_CLASS}`}
              value={platformId}
              onChange={(event) => setPlatformId(event.target.value)}
            >
              {PLATFORMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sf-separator">
              Argument separator
            </label>
            <select
              id="sf-separator"
              className={`mt-2 ${INPUT_CLASS}`}
              value={separatorId}
              onChange={(event) => setSeparatorId(event.target.value)}
            >
              {SEPARATORS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sf-goal">
              What kind of formula
            </label>
            <select
              id="sf-goal"
              className={`mt-2 ${INPUT_CLASS}`}
              value={goalId}
              onChange={(event) => setGoalId(event.target.value)}
            >
              {GOALS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sf-task">
              Describe what the formula must do
            </label>
            <textarea
              id="sf-task"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              value={task}
              onChange={(event) => setTask(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sf-notes">
              Extra instruction (optional)
            </label>
            <input
              id="sf-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. no helper columns; must survive the sheet being filtered"
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
              Columns mapped
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.columnCount)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : "Each header now has a real column letter and a bounded range."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated spreadsheet formula prompt"
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
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="break-words text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Column
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Header
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Range
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.columns.map((column) => (
                  <tr key={column.letter} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{column.letter}</td>
                    <td className="py-2 pr-3">{column.name}</td>
                    <td className="py-2 text-right font-mono text-[var(--muted-foreground)]">
                      {column.range}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="mt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Generated prompt
          </h2>
          <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--foreground)]">
              {hasError ? DASH : result.text}
            </pre>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Column letters follow the A1 scheme, so the 27th column is AA and
        Excel&apos;s last is XFD. The argument separator depends on your file
        locale rather than the application — choose semicolon if your
        spreadsheet uses a comma as the decimal mark.
      </p>
    </main>
  );
}

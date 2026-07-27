"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Figma, RotateCcw, TriangleAlert } from "lucide-react";

import {
  BASE_GRID_UNIT,
  FIDELITY_LEVELS,
  FRAME_PRESETS,
  MAX_COLUMNS,
  MIN_COLUMNS,
  TASK_TYPES,
  buildFigmaPrompt,
} from "../lib";

const PX = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const DASH = "—";

const DEFAULTS = {
  screenName: "Checkout — payment step",
  purpose: "Let a returning customer pay with a saved card in under 20 seconds.",
  frameWidth: "1440",
  frameHeight: "1024",
  margin: "80",
  gutter: "24",
  columns: "12",
  taskId: "wireframe",
  fidelityId: "mid",
  componentPath: "Checkout/Payment Card",
  autoLayout: true,
  useGridUnit: true,
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
const CHECK_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((previous) => ({ ...previous, [key]: value }));
  };
  const setToggle = (key) => (event) => {
    const { checked } = event.target;
    setForm((previous) => ({ ...previous, [key]: checked }));
  };

  const applyPreset = (preset) => {
    setForm((previous) => ({
      ...previous,
      frameWidth: String(preset.width),
      frameHeight: String(preset.height),
      margin: String(preset.margin),
      gutter: String(preset.gutter),
      columns: String(preset.columns),
    }));
  };

  const result = useMemo(() => buildFigmaPrompt(form), [form]);
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

  const rows = hasError
    ? [
        ["Content width", DASH],
        ["Column width", DASH],
        ["Total gutter", DASH],
        [`On the ${BASE_GRID_UNIT}px grid`, DASH],
        ["Nearest grid value", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Content width", `${PX.format(result.grid.contentWidth)} px`],
        ["Column width", `${PX.format(result.grid.columnWidthRounded)} px`],
        ["Total gutter", `${PX.format(result.grid.totalGutter)} px`],
        [`On the ${BASE_GRID_UNIT}px grid`, result.grid.columnOnGrid ? "Yes" : "No"],
        ["Nearest grid value", `${PX.format(result.grid.columnWidthSnapped)} px`],
        ["Prompt length", `${PX.format(result.characterCount)} characters`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Figma className="h-4 w-4" aria-hidden="true" />
          Figma prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Figma AI Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A design prompt is only useful if it carries real numbers. Set your frame and column grid,
          pick the job — wireframe, naming scheme, variant plan, system audit — and get a prompt with
          the actual column width worked out for you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Frame presets
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {FRAME_PRESETS.map((preset) => (
            <button key={preset.id} type="button" className={CHIP_BTN} onClick={() => applyPreset(preset)}>
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fg-width">
              Frame width (px)
            </label>
            <input
              id="fg-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="200"
              step="1"
              value={form.frameWidth}
              onChange={setField("frameWidth")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fg-height">
              Frame height (px)
            </label>
            <input
              id="fg-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.frameHeight}
              onChange={setField("frameHeight")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fg-columns">
              Columns
            </label>
            <input
              id="fg-columns"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_COLUMNS}
              max={MAX_COLUMNS}
              step="1"
              value={form.columns}
              onChange={setField("columns")}
            />
            <p className={HINT_CLASS}>
              {MIN_COLUMNS}&ndash;{MAX_COLUMNS}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fg-gutter">
              Gutter (px)
            </label>
            <input
              id="fg-gutter"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.gutter}
              onChange={setField("gutter")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fg-margin">
              Side margin (px)
            </label>
            <input
              id="fg-margin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.margin}
              onChange={setField("margin")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fg-task">
              What should the assistant do?
            </label>
            <select id="fg-task" className={`mt-2 ${INPUT_CLASS}`} value={form.taskId} onChange={setField("taskId")}>
              {TASK_TYPES.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="fg-screen">
            Screen or component name
          </label>
          <input
            id="fg-screen"
            className={`mt-2 ${INPUT_CLASS}`}
            type="text"
            value={form.screenName}
            onChange={setField("screenName")}
          />
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="fg-purpose">
            What is it for? (one sentence)
          </label>
          <textarea
            id="fg-purpose"
            className={`mt-2 ${TEXTAREA_CLASS}`}
            rows={2}
            value={form.purpose}
            onChange={setField("purpose")}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fg-path">
              Component naming path (optional)
            </label>
            <input
              id="fg-path"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.componentPath}
              onChange={setField("componentPath")}
            />
            <p className={HINT_CLASS}>Slashes nest it in the Assets panel.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fg-fidelity">
              Fidelity
            </label>
            <select
              id="fg-fidelity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.fidelityId}
              onChange={setField("fidelityId")}
            >
              {FIDELITY_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className={CHECK_ROW} htmlFor="fg-auto">
            <input
              id="fg-auto"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={form.autoLayout}
              onChange={setToggle("autoLayout")}
            />
            <span className="text-sm font-medium">Describe with auto layout</span>
          </label>
          <label className={CHECK_ROW} htmlFor="fg-grid">
            <input
              id="fg-grid"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={form.useGridUnit}
              onChange={setToggle("useGridUnit")}
            />
            <span className="text-sm font-medium">Enforce the {BASE_GRID_UNIT}px spacing grid</span>
          </label>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="fg-context">
            Extra context (optional)
          </label>
          <textarea
            id="fg-context"
            className={`mt-2 ${TEXTAREA_CLASS}`}
            rows={2}
            value={form.extraContext}
            onChange={setField("extraContext")}
            placeholder="The saved-card list can hold up to five cards. Guest checkout is out of scope."
          />
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Column width
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${PX.format(result.grid.columnWidthRounded)} px`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input below to build the prompt"
                : `${result.grid.columns} columns · ${result.grid.gutter}px gutter · ${result.grid.margin}px margins`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={hasError}
              aria-label="Copy the generated Figma prompt"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-5 space-y-2">
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
        The grid maths and the prompt are worked out in your browser; nothing about your file is
        uploaded. An AI can describe a layout, but it cannot check the design against a real user —
        keep that step.
      </p>
    </main>
  );
}

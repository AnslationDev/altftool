"use client";

import { useMemo, useState } from "react";
import { Calculator, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import { PRESETS, computeInternalMarks } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

function fromPreset(preset, startId) {
  return {
    internalMax: String(preset.internalMax),
    components: preset.components.map((component, index) => ({
      id: startId + index,
      name: component.name,
      scored: String(component.scored),
      max: String(component.max),
      weight: String(component.weight),
    })),
    nextId: startId + preset.components.length,
  };
}

const DEFAULT_STATE = fromPreset(PRESETS[0], 1);

export default function ToolHome() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [copied, setCopied] = useState(false);

  const { internalMax, components } = state;

  const setInternalMax = (event) => {
    const { value } = event.target;
    setState((prev) => ({ ...prev, internalMax: value }));
  };

  const setComponent = (id, key) => (event) => {
    const { value } = event.target;
    setState((prev) => ({
      ...prev,
      components: prev.components.map((component) =>
        component.id === id ? { ...component, [key]: value } : component,
      ),
    }));
  };

  const addComponent = () => {
    setState((prev) => ({
      ...prev,
      components: [
        ...prev.components,
        { id: prev.nextId, name: "", scored: "0", max: "10", weight: "0" },
      ],
      nextId: prev.nextId + 1,
    }));
  };

  const removeComponent = (id) => {
    setState((prev) => ({
      ...prev,
      components: prev.components.filter((component) => component.id !== id),
    }));
  };

  const applyPreset = (preset) => {
    setState((prev) => fromPreset(preset, prev.nextId));
  };

  const result = useMemo(
    () => computeInternalMarks({ components, internalMax }),
    [components, internalMax],
  );
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Internal marks: ${result.rawTotal} / ${result.internalMax} (${result.percent}%)`,
      `Recorded as (rounded): ${result.roundedTotal} / ${result.internalMax}`,
      ...result.breakdown.map(
        (row) =>
          `${row.name}: ${row.scored}/${row.max} (${row.percent}%) × ${row.weight}% weight = ${row.contribution} of ${row.contributionMax}`,
      ),
    ].join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setState(fromPreset(PRESETS[0], 1));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Calculator className="h-4 w-4" aria-hidden="true" />
          University Exams
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Internal Marks Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter each component's score, maximum and weight — the calculator scales them to your
          subject's internal maximum using the weighted-percentage formula.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="imc-max">
              Internal component maximum (marks)
            </label>
            <input
              id="imc-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              value={internalMax}
              onChange={setInternalMax}
            />
          </div>
        </div>

        <ul className="mt-4 space-y-4">
          {components.map((component, index) => (
            <li key={component.id} className="rounded-lg border border-[var(--border)] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`imc-name-${component.id}`}>
                    Component {index + 1} — name
                  </label>
                  <input
                    id={`imc-name-${component.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    placeholder="e.g. Mid-term tests"
                    value={component.name}
                    onChange={setComponent(component.id, "name")}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`imc-scored-${component.id}`}>
                    Marks scored
                  </label>
                  <input
                    id={`imc-scored-${component.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={component.scored}
                    onChange={setComponent(component.id, "scored")}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`imc-cmax-${component.id}`}>
                    Out of (maximum)
                  </label>
                  <input
                    id={`imc-cmax-${component.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="1"
                    value={component.max}
                    onChange={setComponent(component.id, "max")}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`imc-weight-${component.id}`}>
                    Weight (% of internal)
                  </label>
                  <input
                    id={`imc-weight-${component.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    value={component.weight}
                    onChange={setComponent(component.id, "weight")}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeComponent(component.id)}
                aria-label={`Remove component ${component.name || index + 1}`}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger-soft)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </li>
          ))}
        </ul>

        <button type="button" onClick={addComponent} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add component
        </button>
      </section>

      {hasError ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Internal marks
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.rawTotal} / ${result.internalMax}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${result.percent}% — usually recorded as ${result.roundedTotal} / ${result.internalMax} after rounding.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the internal marks breakdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the example scheme" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {hasError ? (
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Breakdown</dt>
              <dd className="text-right font-semibold">{DASH}</dd>
            </div>
          ) : (
            result.breakdown.map((row) => (
              <div key={row.name} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">
                  {row.name} — {row.scored}/{row.max} ({row.percent}%) × {row.weight}%
                </dt>
                <dd className="text-right font-semibold">
                  {row.contribution} / {row.contributionMax}
                </dd>
              </div>
            ))
          )}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Every university publishes its own internal-assessment split and rounding rule in its
        ordinance or course handbook — set the weights and internal maximum to match yours. Presets
        here are common examples, not any specific university's official scheme.
      </p>
    </main>
  );
}

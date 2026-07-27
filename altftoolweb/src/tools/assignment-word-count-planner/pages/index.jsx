"use client";

import { useMemo, useState } from "react";
import { AlignLeft, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import { DEFAULT_SECTIONS, TYPICAL_TOLERANCE_PERCENT, computeWordPlan } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const DEFAULT_TOTAL = "2000";

const makeDefaultSections = () =>
  DEFAULT_SECTIONS.map((section) => ({
    name: section.name,
    weight: String(section.weight),
    written: String(section.written),
  }));

export default function ToolHome() {
  const [totalWords, setTotalWords] = useState(DEFAULT_TOTAL);
  const [sections, setSections] = useState(makeDefaultSections);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeWordPlan({
        totalWords: totalWords.trim() === "" ? Number.NaN : Number(totalWords),
        sections: sections.map((section) => ({
          name: section.name,
          weight: section.weight.trim() === "" ? 0 : Number(section.weight),
          written: section.written.trim() === "" ? 0 : Number(section.written),
        })),
      }),
    [totalWords, sections],
  );

  const hasError = Boolean(result.error);

  const updateSection = (index, field, value) => {
    setSections((prev) =>
      prev.map((section, i) => (i === index ? { ...section, [field]: value } : section)),
    );
  };

  const addSection = () => {
    setSections((prev) => [...prev, { name: `Section ${prev.length + 1}`, weight: "10", written: "0" }]);
  };

  const removeSection = (index) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Word count plan — ${NUM.format(result.totalWords)} words total`,
      ...result.rows.map(
        (row) =>
          `${row.name}: target ${NUM.format(row.target)} words (${PCT.format(row.sharePercent)}%), written ${NUM.format(row.written)}, remaining ${NUM.format(row.remaining)}`,
      ),
      `Overall: ${NUM.format(result.totalWritten)} written, ${NUM.format(result.totalRemaining)} to go (${PCT.format(result.overallProgressPercent)}%)`,
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
    setTotalWords(DEFAULT_TOTAL);
    setSections(makeDefaultSections());
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AlignLeft className="h-4 w-4" aria-hidden="true" />
          Academic writing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Assignment Word Count Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Give each section a weight and the planner splits your total word budget
          proportionally — the classic 10% introduction, 80% body, 10% conclusion split is
          preloaded. Log words written to see exactly how much each section still needs.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wcp-total">
              Total word budget
            </label>
            <input
              id="wcp-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="100"
              value={totalWords}
              onChange={(event) => setTotalWords(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <p className="text-xs leading-5 text-[var(--muted-foreground)]">
              Many universities allow roughly ±{TYPICAL_TOLERANCE_PERCENT}% around the stated
              limit before penalties — check your module handbook.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {sections.map((section, index) => (
            <div
              key={index}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`wcp-name-${index}`}>
                    Section name
                  </label>
                  <input
                    id={`wcp-name-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={section.name}
                    onChange={(event) => updateSection(index, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`wcp-weight-${index}`}>
                    Weight %
                  </label>
                  <input
                    id={`wcp-weight-${index}`}
                    className={`mt-2 w-full sm:w-24 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={section.weight}
                    onChange={(event) => updateSection(index, "weight", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`wcp-written-${index}`}>
                    Words written
                  </label>
                  <input
                    id={`wcp-written-${index}`}
                    className={`mt-2 w-full sm:w-28 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="10"
                    value={section.written}
                    onChange={(event) => updateSection(index, "written", event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  aria-label={`Remove section ${section.name || index + 1}`}
                  disabled={sections.length <= 1}
                  className={`${GHOST_BTN} disabled:opacity-40`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span className="sm:hidden">Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addSection} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add section
        </button>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      {!hasError && !result.weightsSumTo100 ? (
        <p className="mt-6 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
          Weights add up to {PCT.format(result.weightSum)}%, not 100% — the budget is still
          split in proportion to the weights you entered.
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Words still to write
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.totalRemaining)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a plan."
                : `${PCT.format(result.overallProgressPercent)}% of the ${NUM.format(result.totalWords)}-word budget written so far.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the word count plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
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

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Section
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Target
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Written
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Remaining
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 pr-3 text-right">{DASH}</td>
                  <td className="py-2 pr-3 text-right">{DASH}</td>
                  <td className="py-2 pr-3 text-right">{DASH}</td>
                  <td className="py-2 text-right">{DASH}</td>
                </tr>
              ) : (
                result.rows.map((row) => (
                  <tr key={row.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      {row.name}
                      <span className="ml-1 text-xs text-[var(--muted-foreground)]">
                        ({PCT.format(row.sharePercent)}%)
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold">{NUM.format(row.target)}</td>
                    <td className="py-2 pr-3 text-right">{NUM.format(row.written)}</td>
                    <td className="py-2 pr-3 text-right">
                      {row.over > 0 ? (
                        <span className="text-[var(--danger)]">+{NUM.format(row.over)} over</span>
                      ) : (
                        NUM.format(row.remaining)
                      )}
                    </td>
                    <td className="py-2 text-right">
                      {row.done ? (
                        <span className="font-semibold text-[var(--success)]">Done</span>
                      ) : (
                        `${PCT.format(row.progressPercent)}%`
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total written", hasError ? DASH : NUM.format(result.totalWritten)],
            [
              `Typical ±${TYPICAL_TOLERANCE_PERCENT}% tolerance band`,
              hasError
                ? DASH
                : `${NUM.format(result.lowerBound)} – ${NUM.format(result.upperBound)} words`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Word-count tolerances and whether references count toward the limit vary by
        institution — always check your assignment brief or module handbook.
      </p>
    </main>
  );
}

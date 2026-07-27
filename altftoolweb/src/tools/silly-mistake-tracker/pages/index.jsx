"use client";

import { useMemo, useState } from "react";
import { Check, CircleAlert, Copy, Plus, RotateCcw, Trash2, TrendingDown } from "lucide-react";

import { MISTAKE_CATEGORIES, analyzeMistakes } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_MOCKS = [
  {
    id: 1,
    label: "Mock 1",
    counts: { misread: "3", calc: "5", sign: "1", entry: "2", instruction: "1", rush: "2" },
  },
  {
    id: 2,
    label: "Mock 2",
    counts: { misread: "2", calc: "3", sign: "1", entry: "1", instruction: "0", rush: "2" },
  },
];

export default function ToolHome() {
  const [mocks, setMocks] = useState(DEFAULT_MOCKS);
  const [nextId, setNextId] = useState(3);
  const [marksPerMistake, setMarksPerMistake] = useState("4");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      analyzeMistakes({
        mocks: mocks.map((mock) => ({
          label: mock.label,
          counts: Object.fromEntries(
            MISTAKE_CATEGORIES.map((category) => [
              category.id,
              mock.counts[category.id] === "" || mock.counts[category.id] === undefined
                ? 0
                : Number(mock.counts[category.id]),
            ]),
          ),
        })),
        marksPerMistake: marksPerMistake.trim() === "" ? 0 : Number(marksPerMistake),
      }),
    [mocks, marksPerMistake],
  );

  const hasError = Boolean(result.error);

  const updateMockLabel = (id, label) => {
    setMocks((prev) => prev.map((m) => (m.id === id ? { ...m, label } : m)));
  };

  const updateMockCount = (id, categoryId, value) => {
    setMocks((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, counts: { ...m.counts, [categoryId]: value } } : m,
      ),
    );
  };

  const addMock = () => {
    const counts = Object.fromEntries(MISTAKE_CATEGORIES.map((c) => [c.id, ""]));
    setMocks((prev) => [...prev, { id: nextId, label: "", counts }]);
    setNextId((id) => id + 1);
  };

  const removeMock = (id) => {
    setMocks((prev) => prev.filter((m) => m.id !== id));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Silly mistake log",
      `Mocks: ${result.mocks.length}`,
      `Total silly mistakes: ${result.grandTotal} (${NUM.format(result.totalMarksLost)} marks lost)`,
    ];
    if (result.trend !== null) {
      lines.push(
        `Trend first → latest: ${result.trend > 0 ? "+" : ""}${result.trend} mistakes${
          result.trendPercent === null ? "" : ` (${NUM.format(result.trendPercent)}%)`
        }`,
      );
    }
    if (result.worstCategory) {
      lines.push(`Worst category: ${result.worstCategory.label} (${result.worstCategory.total})`);
    }
    lines.push("");
    for (const mock of result.mocks) {
      lines.push(`- ${mock.label}: ${mock.total} mistakes, ${NUM.format(mock.marksLost)} marks lost`);
    }
    return lines.join("\n");
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
    setMocks(DEFAULT_MOCKS);
    setNextId(3);
    setMarksPerMistake("4");
    setCopied(false);
  };

  const improving = !hasError && result.trend !== null && result.trend < 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CircleAlert className="h-4 w-4" aria-hidden="true" />
          Mock Test Tools
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Silly Mistake Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          After each mock, log the avoidable errors by category — misreads, calculation slips,
          wrong bubbles. The tracker shows the marks they cost and whether the count is actually
          falling.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="smt-marks">
            Marks lost per silly mistake
          </label>
          <input
            id="smt-marks"
            className={`mt-2 ${INPUT_CLASS} sm:max-w-xs`}
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={marksPerMistake}
            onChange={(event) => setMarksPerMistake(event.target.value)}
          />
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Question marks plus any negative marking — e.g. 5 for a +4/−1 MCQ you got wrong
            instead of right.
          </p>
        </div>

        <div className="mt-5 space-y-5">
          {mocks.map((mock, index) => (
            <fieldset
              key={mock.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Mock {index + 1}
              </legend>
              <div>
                <label className={LABEL_CLASS} htmlFor={`smt-label-${mock.id}`}>
                  Label
                </label>
                <input
                  id={`smt-label-${mock.id}`}
                  className={`mt-2 ${INPUT_CLASS} sm:max-w-xs`}
                  type="text"
                  placeholder={`Mock ${index + 1}`}
                  value={mock.label}
                  onChange={(event) => updateMockLabel(mock.id, event.target.value)}
                />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {MISTAKE_CATEGORIES.map((category) => (
                  <div key={category.id}>
                    <label className={LABEL_CLASS} htmlFor={`smt-${category.id}-${mock.id}`}>
                      {category.label}
                    </label>
                    <input
                      id={`smt-${category.id}-${mock.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      value={mock.counts[category.id] ?? ""}
                      onChange={(event) =>
                        updateMockCount(mock.id, category.id, event.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => removeMock(mock.id)}
                aria-label={`Remove ${mock.label || `mock ${index + 1}`}`}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger-soft)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove mock
              </button>
            </fieldset>
          ))}
        </div>
        <button type="button" onClick={addMock} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add mock
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Latest mock
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.latestTotal} mistakes`}
            </p>
            <p className="mt-1 flex max-w-md items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
              {hasError ? (
                "Fix the input above to see the analysis."
              ) : result.trend === null ? (
                `Costing ${NUM.format(result.latestMarksLost)} marks. Add more mocks to see the trend.`
              ) : (
                <>
                  {improving ? (
                    <TrendingDown
                      className="h-4 w-4 shrink-0 text-[var(--success)]"
                      aria-hidden="true"
                    />
                  ) : null}
                  <span>
                    {`${result.trend > 0 ? "+" : ""}${result.trend} vs first mock`}
                    {result.trendPercent !== null
                      ? ` (${NUM.format(result.trendPercent)}%)`
                      : ""}
                    {` — costing ${NUM.format(result.latestMarksLost)} marks.`}
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the mistake analysis"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all mocks to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Total silly mistakes", DASH],
                ["Total marks lost", DASH],
              ]
            : [
                ["Total silly mistakes (all mocks)", String(result.grandTotal)],
                ["Total marks lost", NUM.format(result.totalMarksLost)],
                ["Average per mock", NUM.format(result.averagePerMock)],
                [
                  "Worst category",
                  result.worstCategory
                    ? `${result.worstCategory.label} (${result.worstCategory.total})`
                    : DASH,
                ],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.grandTotal > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Category
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Count
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Fix
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.categoryTotals
                  .filter((category) => category.total > 0)
                  .map((category) => (
                    <tr key={category.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{category.label}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{category.total}</td>
                      <td className="py-2 text-[var(--muted-foreground)]">{category.fix}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A silly mistake is one you could have avoided with the knowledge you already had. Review
        the worst category before every mock — the fix column is where the marks are.
      </p>
    </main>
  );
}

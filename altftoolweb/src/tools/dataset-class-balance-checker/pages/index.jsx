"use client";

import { useMemo, useState } from "react";
import { ChartColumn, Check, Copy, RotateCcw } from "lucide-react";
import { checkDatasetBalance, DEFAULT_CV_FOLDS } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DEC = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const PCT = new Intl.NumberFormat("en-IN", {
  style: "percent",
  maximumFractionDigits: 2,
});

const DEFAULT_TEXT = [
  "not_spam",
  "not_spam",
  "not_spam",
  "not_spam",
  "not_spam",
  "not_spam",
  "not_spam",
  "not_spam",
  "not_spam",
  "not_spam",
  "not_spam",
  "not_spam",
  "not_spam",
  "not_spam",
  "not_spam",
  "not_spam",
  "not_spam",
  "not_spam",
  "spam",
  "spam",
  "spam",
  "promotion",
  "promotion",
  "phishing",
].join("\n");

const DEFAULTS = {
  text: DEFAULT_TEXT,
  format: "lines",
  column: "label",
  hasHeader: true,
  field: "label",
  caseSensitive: true,
  folds: String(DEFAULT_CV_FOLDS),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SEVERITY_COPY = {
  balanced: "Balanced",
  mild: "Mildly imbalanced",
  moderate: "Moderately imbalanced",
  severe: "Severely imbalanced",
};

const DASH = "—";

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [format, setFormat] = useState(DEFAULTS.format);
  const [column, setColumn] = useState(DEFAULTS.column);
  const [hasHeader, setHasHeader] = useState(DEFAULTS.hasHeader);
  const [field, setField] = useState(DEFAULTS.field);
  const [caseSensitive, setCaseSensitive] = useState(DEFAULTS.caseSensitive);
  const [folds, setFolds] = useState(DEFAULTS.folds);
  const [copied, setCopied] = useState(false);

  const report = useMemo(
    () =>
      checkDatasetBalance(text, {
        format,
        column,
        hasHeader,
        field,
        caseSensitive,
        folds: Number(folds),
      }),
    [text, format, column, hasHeader, field, caseSensitive, folds],
  );

  const failed = Boolean(report.error);

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "Dataset Class Balance Checker",
      `Rows analysed: ${NUM.format(report.total)} across ${report.classCount} classes`,
      `Imbalance ratio: ${DEC.format(report.imbalanceRatio)}:1 (${SEVERITY_COPY[report.severity]})`,
      `Majority-class baseline accuracy: ${PCT.format(report.baselineAccuracy)}`,
      `Normalised entropy: ${DEC.format(report.normalisedEntropy)} · Gini impurity: ${DEC.format(report.gini)}`,
      "",
      "Label\tCount\tShare\tBalanced weight",
    ];
    for (const cls of report.classes) {
      lines.push(
        `${cls.label}\t${NUM.format(cls.count)}\t${PCT.format(cls.share)}\t${DEC.format(cls.weight)}`,
      );
    }
    if (report.warnings.length > 0) {
      lines.push("", "Warnings:");
      for (const warning of report.warnings) lines.push(`- ${warning}`);
    }
    return lines.join("\n");
  }, [failed, report]);

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
    setText(DEFAULTS.text);
    setFormat(DEFAULTS.format);
    setColumn(DEFAULTS.column);
    setHasHeader(DEFAULTS.hasHeader);
    setField(DEFAULTS.field);
    setCaseSensitive(DEFAULTS.caseSensitive);
    setFolds(DEFAULTS.folds);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ChartColumn className="h-4 w-4" aria-hidden="true" />
          Dataset tools
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Dataset Class Balance Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste your labels and see the imbalance ratio, entropy, majority-class baseline and the
          scikit-learn balanced class weights — all computed in your browser, nothing uploaded.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dcb-format">
              Input format
            </label>
            <select
              id="dcb-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            >
              <option value="lines">One label per line</option>
              <option value="csv">CSV column</option>
              <option value="jsonl">JSONL property</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dcb-folds">
              Cross-validation folds
            </label>
            <input
              id="dcb-folds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="2"
              step="1"
              value={folds}
              onChange={(event) => setFolds(event.target.value)}
            />
          </div>

          {format === "csv" && (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="dcb-column">
                  Label column (name or 0-based index)
                </label>
                <input
                  id="dcb-column"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={column}
                  onChange={(event) => setColumn(event.target.value)}
                />
              </div>
              <div className="flex items-end">
                <label
                  className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
                  htmlFor="dcb-header"
                >
                  <input
                    id="dcb-header"
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--primary)]"
                    checked={hasHeader}
                    onChange={(event) => setHasHeader(event.target.checked)}
                  />
                  First row is a header
                </label>
              </div>
            </>
          )}

          {format === "jsonl" && (
            <div>
              <label className={LABEL_CLASS} htmlFor="dcb-field">
                Label property name
              </label>
              <input
                id="dcb-field"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={field}
                onChange={(event) => setField(event.target.value)}
              />
            </div>
          )}

          <div className="flex items-end sm:col-span-2">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="dcb-case"
            >
              <input
                id="dcb-case"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={caseSensitive}
                onChange={(event) => setCaseSensitive(event.target.checked)}
              />
              Case sensitive (treat &quot;Spam&quot; and &quot;spam&quot; as different classes)
            </label>
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="dcb-text">
            Labels
          </label>
          <textarea
            id="dcb-text"
            rows={10}
            className={`mt-2 ${TEXTAREA_CLASS}`}
            value={text}
            onChange={(event) => setText(event.target.value)}
            spellCheck={false}
          />
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {report.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Imbalance ratio (majority : minority)
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${DEC.format(report.imbalanceRatio)} : 1`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? DASH
                : `${SEVERITY_COPY[report.severity]} · ${NUM.format(report.total)} rows · ${report.classCount} classes`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy class balance report"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Majority class",
              failed ? DASH : `${report.majority.label} (${NUM.format(report.majority.count)} rows)`,
            ],
            [
              "Minority class",
              failed ? DASH : `${report.minority.label} (${NUM.format(report.minority.count)} rows)`,
            ],
            [
              "Majority-class baseline accuracy",
              failed ? DASH : PCT.format(report.baselineAccuracy),
            ],
            [
              "Normalised entropy (1.0 = perfectly even)",
              failed ? DASH : DEC.format(report.normalisedEntropy),
            ],
            ["Gini impurity", failed ? DASH : DEC.format(report.gini)],
            [
              "Even split would be",
              failed ? DASH : `${DEC.format(report.perfectCountPerClass)} rows per class`,
            ],
            [
              "Rows after oversampling to the majority",
              failed ? DASH : NUM.format(report.oversampleTotal),
            ],
            [
              "Rows after undersampling to the minority",
              failed ? DASH : NUM.format(report.undersampleTotal),
            ],
            ["Rows skipped while parsing", failed ? DASH : NUM.format(report.skipped)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && report.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What to watch out for</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {report.warnings.map((warning) => (
              <li key={warning} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--danger)]">
                  •
                </span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Per-class breakdown</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Label
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Count
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Share
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Weight
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    To match majority
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.classes.map((cls) => (
                  <tr key={cls.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {cls.label}
                      <span
                        className="mt-1 block h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-[var(--muted)]"
                        aria-hidden="true"
                      >
                        <span
                          className="block h-full bg-[var(--primary)]"
                          style={{ width: `${Math.min(100, cls.share * 100)}%` }}
                        />
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right">{NUM.format(cls.count)}</td>
                    <td className="py-2 pr-3 text-right">{PCT.format(cls.share)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {DEC.format(cls.weight)}
                    </td>
                    <td className="py-2 text-right">
                      {cls.oversampleBy === 0 ? "—" : `+${NUM.format(cls.oversampleBy)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Weight is scikit-learn&apos;s <code>class_weight=&quot;balanced&quot;</code> value:
            n_samples / (n_classes x n_class_rows).
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything runs locally in your browser — labels are never sent to a server. Resampling
        counts assume you rebalance the training split only; keep your validation and test splits at
        the real-world distribution.
      </p>
    </main>
  );
}

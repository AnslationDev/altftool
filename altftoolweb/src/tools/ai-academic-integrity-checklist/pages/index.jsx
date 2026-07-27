"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardCheck, Copy, RotateCcw } from "lucide-react";

import { ANSWERS, CHECKLIST_ITEMS, STATUS, evaluateChecklist } from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US");
const DASH = "—";

const ANSWER_OPTIONS = [
  { value: ANSWERS.YES, label: "Yes" },
  { value: ANSWERS.NO, label: "No" },
  { value: ANSWERS.NA, label: "N/A" },
];

const STATUS_LABELS = {
  [STATUS.ALIGNED]: "Aligned with typical policies",
  [STATUS.CAUTION]: "Proceed with caution",
  [STATUS.HIGH_RISK]: "High risk — do not submit yet",
};

const DEFAULT_ANSWERS = Object.fromEntries(CHECKLIST_ITEMS.map((item) => [item.id, ANSWERS.YES]));

export default function ToolHome() {
  const [answers, setAnswers] = useState(DEFAULT_ANSWERS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => evaluateChecklist(answers), [answers]);
  const hasError = Boolean(result.error);

  const setAnswer = (id, value) => {
    setAnswers((current) => ({ ...current, [id]: value }));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const failLines = [
      ...result.criticalFails.map((item) => `- [CRITICAL] ${item.text}`),
      ...result.importantFails.map((item) => `- [Important] ${item.text}`),
      ...result.advisoryFails.map((item) => `- [Advisory] ${item.text}`),
    ];
    return [
      "AI academic integrity self-check",
      `Status: ${STATUS_LABELS[result.status]}`,
      `Score: ${result.score}% (${result.passed} of ${result.applicable} applicable items passed)`,
      failLines.length > 0 ? "Items to fix:" : "No failed items.",
      ...failLines,
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
    setAnswers(DEFAULT_ANSWERS);
    setCopied(false);
  };

  const statusColorClass = hasError
    ? "text-[var(--muted-foreground)]"
    : result.status === STATUS.HIGH_RISK
      ? "text-[var(--danger)]"
      : result.status === STATUS.CAUTION
        ? "text-[var(--primary)]"
        : "text-[var(--success)]";

  const rows = hasError
    ? [
        ["Status", DASH],
        ["Critical failures", DASH],
        ["Important failures", DASH],
        ["Advisory notes", DASH],
      ]
    : [
        ["Status", STATUS_LABELS[result.status]],
        ["Applicable items passed", `${NUM.format(result.passed)} of ${NUM.format(result.applicable)}`],
        ["Critical failures", NUM.format(result.criticalFails.length)],
        ["Important failures", NUM.format(result.importantFails.length)],
        ["Advisory notes", NUM.format(result.advisoryFails.length)],
      ];

  let lastCategory = "";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          AI governance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI Academic Integrity Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Answer ten questions about how you used AI on an assignment. The checklist covers the
          dimensions institutional policies share — permission, disclosure, authorship,
          verification and data handling — and flags anything that would typically count as a
          violation.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="space-y-4">
          {CHECKLIST_ITEMS.map((item) => {
            const showCategory = item.category !== lastCategory;
            lastCategory = item.category;
            return (
              <div key={item.id}>
                {showCategory ? (
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                    {item.category}
                  </p>
                ) : null}
                <fieldset className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <legend className="sr-only">{item.text}</legend>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm leading-6">
                      {item.text}
                      {item.severity === "critical" ? (
                        <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--danger)]">
                          critical
                        </span>
                      ) : null}
                    </p>
                    <div className="flex shrink-0 gap-1" role="radiogroup" aria-label={item.text}>
                      {ANSWER_OPTIONS.map((option) => {
                        const checked = answers[item.id] === option.value;
                        return (
                          <label
                            key={option.value}
                            htmlFor={`chk-${item.id}-${option.value}`}
                            className={`inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md border px-3 text-sm font-semibold transition ${
                              checked
                                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                                : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                            }`}
                          >
                            <input
                              id={`chk-${item.id}-${option.value}`}
                              type="radio"
                              name={`chk-${item.id}`}
                              value={option.value}
                              checked={checked}
                              onChange={() => setAnswer(item.id, option.value)}
                              className="sr-only"
                            />
                            {option.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </fieldset>
              </div>
            );
          })}
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
              Compliance score
            </p>
            <p className={`mt-1 text-4xl font-semibold ${statusColorClass}`}>
              {hasError ? DASH : `${NUM.format(result.score)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Answer every item to see your assessment." : result.statusDetail}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the checklist result"
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
              aria-label="Reset all answers"
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

        {!hasError &&
        result.criticalFails.length + result.importantFails.length + result.advisoryFails.length >
          0 ? (
          <div className="mt-5">
            <h2 className="text-base font-semibold">Items to fix before submitting</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {[...result.criticalFails, ...result.importantFails, ...result.advisoryFails].map(
                (item) => (
                  <li
                    key={item.id}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                  >
                    <span
                      className={`mr-2 font-semibold ${
                        item.severity === "critical"
                          ? "text-[var(--danger)]"
                          : "text-[var(--primary)]"
                      }`}
                    >
                      {item.severity === "critical"
                        ? "Critical:"
                        : item.severity === "important"
                          ? "Important:"
                          : "Advisory:"}
                    </span>
                    {item.text}
                  </li>
                ),
              )}
            </ul>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This is an informational self-check based on requirements common across institutional AI
        policies — it is not legal or academic advice. Your institution&apos;s own policy is the
        only authority; when in doubt, ask your instructor before submitting.
      </p>
    </main>
  );
}

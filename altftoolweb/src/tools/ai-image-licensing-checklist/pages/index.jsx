"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardCheck, Copy, RotateCcw } from "lucide-react";

import { CHECKLIST_ITEMS, evaluateChecklist } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const ANSWER_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "unsure", label: "Unsure" },
  { value: "no", label: "No" },
];

const STATUS_COPY = {
  ready: "All checks pass — usage-rights basics are covered.",
  caution: "Some items are unresolved — settle them before publishing.",
  "not-ready": "A high-risk item failed — do not publish commercially until it is resolved.",
};

const buildDefaults = () =>
  Object.fromEntries(CHECKLIST_ITEMS.map((item) => [item.id, "unsure"]));

export default function ToolHome() {
  const initial = useMemo(() => buildDefaults(), []);
  const [answers, setAnswers] = useState(initial);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => evaluateChecklist(answers), [answers]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "AI image licensing checklist",
      `Readiness score: ${NUM.format(result.score)}/100 (${result.status})`,
      `Passed ${result.passed} / ${result.totalItems}, failed ${result.failed}, unsure ${result.unsure}`,
    ];
    for (const item of CHECKLIST_ITEMS) {
      lines.push(`- [${answers[item.id]}] (${item.risk} risk) ${item.question}`);
    }
    return lines.join("\n");
  }, [hasError, result, answers]);

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
    setAnswers(buildDefaults());
    setCopied(false);
  };

  const setAnswer = (id, value) => setAnswers((prev) => ({ ...prev, [id]: value }));

  const statusColor =
    !hasError && result.status === "ready"
      ? "text-[var(--success)]"
      : !hasError && result.status === "not-ready"
        ? "text-[var(--danger)]"
        : "text-[var(--primary)]";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          AI governance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI Image Licensing Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Eight usage-rights questions to answer before an AI-generated image goes into
          commercial use — covering licence tier, likeness, trademarks, copyrightability and
          platform rules. High-risk items weigh double in the readiness score.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="space-y-5">
          {CHECKLIST_ITEMS.map((item, index) => (
            <fieldset key={item.id} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <legend className="px-1 text-sm font-semibold">
                {index + 1}. {item.question}{" "}
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    item.risk === "high"
                      ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {item.risk} risk
                </span>
              </legend>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{item.why}</p>
              <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={item.question}>
                {ANSWER_OPTIONS.map((opt) => {
                  const id = `lc-${item.id}-${opt.value}`;
                  const active = answers[item.id] === opt.value;
                  return (
                    <label
                      key={opt.value}
                      htmlFor={id}
                      className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-4 text-sm font-semibold transition focus-within:ring-[3px] focus-within:ring-[var(--primary)]/35 ${
                        active
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      <input
                        id={id}
                        type="radio"
                        name={`lc-${item.id}`}
                        value={opt.value}
                        checked={active}
                        onChange={() => setAnswer(item.id, opt.value)}
                        className="sr-only"
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
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
              Readiness score
            </p>
            <p className={`mt-1 text-4xl font-semibold ${statusColor}`}>
              {hasError ? "—" : `${NUM.format(result.score)}/100`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : STATUS_COPY[result.status]}
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
          {(hasError
            ? [
                ["Passed", "—"],
                ["Failed", "—"],
                ["Unsure", "—"],
              ]
            : [
                ["Passed", `${result.passed} of ${result.totalItems}`],
                ["Failed", String(result.failed)],
                ["Unsure", String(result.unsure)],
                ["High-risk failures", String(result.highRiskFails)],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.flagged.length > 0 ? (
          <div className="mt-5">
            <h2 className="text-sm font-semibold">Resolve before publishing</h2>
            <ul className="mt-2 space-y-2 text-sm text-[var(--muted-foreground)]">
              {result.flagged.map((f) => (
                <li key={f.id} className="flex gap-2">
                  <span
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                      f.risk === "high" ? "bg-[var(--danger)]" : "bg-[var(--primary)]"
                    }`}
                    aria-hidden="true"
                  />
                  <span>
                    {f.question}{" "}
                    <span className="font-semibold">({f.answer === "no" ? "failed" : "unsure"})</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational checklist, not legal advice. Licence terms, copyright office guidance and
        platform policies change and vary by country — for a product launch, ad campaign or any
        high-stakes use, have an IP lawyer review the specific images and terms.
      </p>
    </main>
  );
}

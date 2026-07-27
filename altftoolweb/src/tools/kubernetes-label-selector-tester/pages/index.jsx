"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Filter, Plus, RotateCcw, Trash2 } from "lucide-react";

import { OPERATORS, evaluateSelector } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-28 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  podLabelsText: "app=web\ntier=frontend\nenv=prod",
  matchLabelsText: "app=web",
  expressions: [{ key: "env", operator: "In", valuesText: "prod, staging" }],
};

export default function ToolHome() {
  const [podLabelsText, setPodLabelsText] = useState(DEFAULTS.podLabelsText);
  const [matchLabelsText, setMatchLabelsText] = useState(DEFAULTS.matchLabelsText);
  const [expressions, setExpressions] = useState(DEFAULTS.expressions);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => evaluateSelector({ podLabelsText, matchLabelsText, expressions }),
    [podLabelsText, matchLabelsText, expressions],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Selector ${result.matched ? "MATCHES" : "does NOT match"} the pod labels`,
      ...result.clauses.map((c) => `${c.satisfied ? "PASS" : "FAIL"}  [${c.kind}] ${c.text} — ${c.reason}`),
    ];
    if (result.empty) lines.push("Selector is empty — an empty selector matches every object.");
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
    setPodLabelsText(DEFAULTS.podLabelsText);
    setMatchLabelsText(DEFAULTS.matchLabelsText);
    setExpressions(DEFAULTS.expressions.map((e) => ({ ...e })));
    setCopied(false);
  };

  const setExprField = (index, field, value) => {
    setExpressions((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
  };

  const addExpression = () => {
    setExpressions((prev) => [...prev, { key: "", operator: "In", valuesText: "" }]);
  };

  const removeExpression = (index) => {
    setExpressions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Filter className="h-4 w-4" aria-hidden="true" />
          Kubernetes
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Kubernetes Label Selector Tester
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a pod&apos;s labels and a selector, and see clause by clause whether it matches —
          using the exact In / NotIn / Exists / DoesNotExist semantics of the Kubernetes API,
          including the surprise that NotIn also matches pods missing the key.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kls-pod">
              Pod labels (key=value per line)
            </label>
            <textarea
              id="kls-pod"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              spellCheck={false}
              value={podLabelsText}
              onChange={(event) => setPodLabelsText(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kls-ml">
              matchLabels (key=value per line)
            </label>
            <textarea
              id="kls-ml"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              spellCheck={false}
              value={matchLabelsText}
              onChange={(event) => setMatchLabelsText(event.target.value)}
            />
          </div>
        </div>

        <h2 className="mt-6 text-sm font-semibold">matchExpressions</h2>
        <div className="mt-3 space-y-4">
          {expressions.map((expr, index) => (
            <div key={index} className="rounded-lg border border-[var(--border)] p-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`kls-key-${index}`}>
                    Key
                  </label>
                  <input
                    id={`kls-key-${index}`}
                    className={`mt-2 ${INPUT_CLASS} font-mono`}
                    type="text"
                    placeholder="env"
                    value={expr.key}
                    onChange={(event) => setExprField(index, "key", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`kls-op-${index}`}>
                    Operator
                  </label>
                  <select
                    id={`kls-op-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={expr.operator}
                    onChange={(event) => setExprField(index, "operator", event.target.value)}
                  >
                    {OPERATORS.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`kls-values-${index}`}>
                    Values (comma-separated)
                  </label>
                  <input
                    id={`kls-values-${index}`}
                    className={`mt-2 ${INPUT_CLASS} font-mono`}
                    type="text"
                    placeholder="prod, staging"
                    disabled={expr.operator === "Exists" || expr.operator === "DoesNotExist"}
                    value={expr.valuesText}
                    onChange={(event) => setExprField(index, "valuesText", event.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeExpression(index)}
                aria-label={`Remove expression ${index + 1}`}
                className={`${GHOST_BTN} mt-3`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addExpression}
          className={`${GHOST_BTN} mt-3`}
          aria-label="Add a matchExpressions clause"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add expression
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
              Verdict
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError
                  ? "text-[var(--foreground)]"
                  : result.matched
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]"
              }`}
            >
              {hasError ? "—" : result.matched ? "MATCHES" : "NO MATCH"}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.empty
                  ? "The selector is empty — an empty selector matches every object."
                  : `All ${result.clauses.length} clause${result.clauses.length === 1 ? "" : "s"} are ANDed together.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the selector evaluation result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.clauses.length > 0 ? (
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {result.clauses.map((clause, index) => (
              <div key={index} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <dt className="font-mono text-[var(--muted-foreground)]">
                  [{clause.kind}] {clause.text}
                </dt>
                <dd className={`font-semibold ${clause.satisfied ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                  {clause.satisfied ? "PASS" : "FAIL"} — {clause.reason}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Operator semantics (as the API applies them)</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
          <li><strong>In</strong> — the key must exist and its value must be in the list.</li>
          <li><strong>NotIn</strong> — the value is not in the list, <em>or the key is absent entirely</em>.</li>
          <li><strong>Exists</strong> — the key is present (values list must be empty).</li>
          <li><strong>DoesNotExist</strong> — the key is absent (values list must be empty).</li>
          <li>matchLabels and matchExpressions clauses are all ANDed; an empty selector matches everything.</li>
        </ul>
      </section>
    </main>
  );
}

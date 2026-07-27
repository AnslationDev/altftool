"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";
import { TIE_BREAK_RULES, getRuleSet, resolveTie } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HELP_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_EXAM = TIE_BREAK_RULES[0].key;

/** Turn a worked example into the string-valued form state the inputs need. */
const formFromExample = (rule, side) => {
  const source = rule.example[side] ?? {};
  const values = {};
  for (const field of rule.fields) {
    const raw = source[field.key];
    values[field.key] = raw === undefined || raw === null ? "" : String(raw);
  }
  return values;
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

/** Convert form strings into the typed candidate object the rule engine wants. */
const toCandidate = (rule, form) => {
  const candidate = {};
  for (const field of rule.fields) {
    const raw = form[field.key];
    candidate[field.key] = field.kind === "number" ? toNumber(raw) : String(raw ?? "").trim();
  }
  return candidate;
};

export default function ToolHome() {
  const initialRule = getRuleSet(DEFAULT_EXAM);
  const [examKey, setExamKey] = useState(DEFAULT_EXAM);
  const [formA, setFormA] = useState(() => formFromExample(initialRule, "a"));
  const [formB, setFormB] = useState(() => formFromExample(initialRule, "b"));
  const [copied, setCopied] = useState(false);

  const rule = getRuleSet(examKey) ?? initialRule;

  const changeExam = (key) => {
    const next = getRuleSet(key) ?? initialRule;
    setExamKey(next.key);
    setFormA(formFromExample(next, "a"));
    setFormB(formFromExample(next, "b"));
    setCopied(false);
  };

  const setField = (setter) => (fieldKey, value) => {
    setter((current) => ({ ...current, [fieldKey]: value }));
    setCopied(false);
  };

  const setFieldA = setField(setFormA);
  const setFieldB = setField(setFormB);

  const result = useMemo(
    () =>
      resolveTie({
        examKey: rule.key,
        candidateA: toCandidate(rule, formA),
        candidateB: toCandidate(rule, formB),
      }),
    [rule, formA, formB],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `${rule.label} tie-breaking — ${rule.authority}`,
      result.tied
        ? "Neither candidate can be separated by the published criteria."
        : `Higher rank: Candidate ${result.winner}, decided by "${result.decidedBy}" (criterion ${result.criteriaUsed} of ${rule.criteria.length}).`,
      "",
      ...result.steps.map((step, index) => {
        const status = !step.reached
          ? "not reached"
          : step.decided
            ? `decides in favour of Candidate ${step.winner}`
            : "identical, move to the next criterion";
        return `${index + 1}. ${step.label} — A: ${step.aDisplay}, B: ${step.bDisplay} → ${status}`;
      }),
      "",
      rule.tail,
    ].join("\n");
  }, [ok, result, rule]);

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

  const reset = () => changeExam(DEFAULT_EXAM);

  const renderFields = (form, setter, side) =>
    rule.fields.map((field) => {
      const id = `tb-${rule.key}-${side}-${field.key}`;
      return (
        <div key={field.key}>
          <label className={LABEL_CLASS} htmlFor={id}>
            {field.label}
          </label>
          <input
            id={id}
            className={`mt-2 ${INPUT_CLASS}`}
            type={field.kind === "number" ? "number" : field.kind === "date" ? "date" : "text"}
            inputMode={field.kind === "number" ? "decimal" : undefined}
            min={field.kind === "number" ? "0" : undefined}
            step={field.kind === "number" ? field.step : undefined}
            value={form[field.key] ?? ""}
            onChange={(event) => setter(field.key, event.target.value)}
          />
        </div>
      );
    });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Rank resolution
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Tie Breaker Rule Explainer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          When two candidates score the same, the published tie-breaking order decides the rank — and
          it is applied strictly in sequence, so the first criterion where they differ settles it.
          Enter two candidates and watch the rules run.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="tb-exam">
          Examination
        </label>
        <select
          id="tb-exam"
          className={`mt-2 ${INPUT_CLASS}`}
          value={examKey}
          onChange={(event) => changeExam(event.target.value)}
        >
          {TIE_BREAK_RULES.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
        <p className={HELP_CLASS}>{rule.note}</p>

        <ol className="mt-4 space-y-1 text-sm text-[var(--muted-foreground)]">
          {rule.criteria.map((criterion, index) => (
            <li key={criterion.key}>
              <span className="font-semibold text-[var(--foreground)]">{index + 1}.</span> {criterion.label}
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Candidate A</h2>
          <div className="mt-4 grid gap-4">{renderFields(formA, setFieldA, "a")}</div>
        </section>
        <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Candidate B</h2>
          <div className="mt-4 grid gap-4">{renderFields(formB, setFieldB, "b")}</div>
        </section>
      </div>

      {result.error ? (
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
              Higher rank goes to
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? (result.tied ? "Same rank" : `Candidate ${result.winner}`) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.tied
                  ? "No published criterion separates them."
                  : `Decided by criterion ${result.criteriaUsed} of ${rule.criteria.length}: ${result.decidedBy}.`
                : "Fix the input above to run the rules."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the tie-breaking result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the worked example" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[380px] text-left text-sm">
            <caption className="sr-only">Each criterion applied in order</caption>
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Criterion</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">A</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">B</th>
                <th scope="col" className="py-2 text-right font-semibold">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {(ok ? result.steps : []).map((step, index) => (
                <tr
                  key={step.key}
                  className={`border-b border-[var(--border)] last:border-0 ${step.reached ? "" : "opacity-50"}`}
                >
                  <td className="py-2 pr-3">
                    <span className="font-semibold">{index + 1}.</span> {step.label}
                  </td>
                  <td className="py-2 pr-3 text-right">{step.aDisplay}</td>
                  <td className="py-2 pr-3 text-right">{step.bDisplay}</td>
                  <td
                    className={`py-2 text-right font-semibold ${
                      !step.reached
                        ? "text-[var(--muted-foreground)]"
                        : step.decided
                          ? "text-[var(--success)]"
                          : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {!step.reached ? "not reached" : step.decided ? `Candidate ${step.winner}` : "identical"}
                  </td>
                </tr>
              ))}
              {!ok && (
                <tr>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]" colSpan={4}>
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{rule.tail}</p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Worked example — {rule.label}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{rule.example.story}</p>
        <button
          type="button"
          onClick={() => {
            setFormA(formFromExample(rule, "a"));
            setFormB(formFromExample(rule, "b"));
            setCopied(false);
          }}
          className={`mt-4 ${GHOST_BTN}`}
        >
          Load this example
        </button>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Examining bodies revise their tie-breaking order between years — NEET
        dropped both the age criterion and the draw of lots within three years — so confirm the
        current sequence in the information bulletin, notice or rules for your examination year.
      </p>
    </main>
  );
}

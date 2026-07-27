"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import { COPYLEFT_OPTIONS, chooseLicense } from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CHECK_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  copyleft: "none",
  patentGrant: false,
  simplicity: false,
  publicDomain: false,
};

const DASH = "—";

export default function ToolHome() {
  const [answers, setAnswers] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => chooseLicense(answers), [answers]);
  const hasError = Boolean(result.error);

  const setAnswer = (key, value) => setAnswers((prev) => ({ ...prev, [key]: value }));

  const copyResult = async () => {
    if (hasError) return;
    try {
      const text = [
        `Recommended license: ${result.recommended.name} (${result.recommended.id})`,
        ...result.reasons.map((r) => `- ${r}`),
        result.alternatives.length > 0
          ? `Alternatives: ${result.alternatives.map((l) => l.id).join(", ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setAnswers(DEFAULTS);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Copyleft scope", DASH],
        ["Express patent grant", DASH],
        ["Main conditions", DASH],
      ]
    : [
        [
          "Copyleft scope",
          COPYLEFT_OPTIONS.find((o) => o.id === result.recommended.copyleft)?.label ??
            result.recommended.copyleft,
        ],
        ["Express patent grant", result.recommended.patentGrant ? "Yes" : "No"],
        [
          "Main conditions",
          result.recommended.conditions.length === 0
            ? "None"
            : result.recommended.conditions.join("; "),
        ],
        ["License length", `~${result.recommended.approxWords} words`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Open source licensing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Open Source License Chooser
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Answer four questions and get a recommendation from MIT, ISC, BSD-3-Clause, Apache-2.0,
          MPL-2.0, LGPL-3.0, GPL-3.0, AGPL-3.0, the Unlicense and CC0 — based on each license&apos;s
          actual copyleft scope and patent terms.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className={LABEL_CLASS}>
            1. Must people who build on your code share their changes?
          </legend>
          <div className="mt-2 space-y-1">
            {COPYLEFT_OPTIONS.map((option) => (
              <label
                key={option.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-[var(--muted)]"
                htmlFor={`lic-cl-${option.id}`}
              >
                <input
                  id={`lic-cl-${option.id}`}
                  type="radio"
                  name="copyleft"
                  className={CHECK_CLASS}
                  checked={answers.copyleft === option.id}
                  onChange={() => setAnswer("copyleft", option.id)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 space-y-1">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-[var(--muted)]" htmlFor="lic-patent">
            <input
              id="lic-patent"
              type="checkbox"
              className={CHECK_CLASS}
              checked={answers.patentGrant}
              onChange={(event) => setAnswer("patentGrant", event.target.checked)}
            />
            2. I want an express patent grant from contributors
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-[var(--muted)]" htmlFor="lic-simple">
            <input
              id="lic-simple"
              type="checkbox"
              className={CHECK_CLASS}
              checked={answers.simplicity}
              onChange={(event) => setAnswer("simplicity", event.target.checked)}
            />
            3. I want the shortest, simplest license text possible
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-[var(--muted)]" htmlFor="lic-pd">
            <input
              id="lic-pd"
              type="checkbox"
              className={CHECK_CLASS}
              checked={answers.publicDomain}
              onChange={(event) => setAnswer("publicDomain", event.target.checked)}
            />
            4. I want to waive everything — no conditions, not even attribution
          </label>
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
              Recommended license
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.recommended.id}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the answers above to see a recommendation." : result.recommended.name}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the license recommendation"
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
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <>
            <h2 className="mt-5 text-sm font-semibold">Why this license</h2>
            <ul className="mt-2 space-y-2 text-sm text-[var(--muted-foreground)]">
              {result.reasons.map((reason) => (
                <li key={reason} className="rounded-md bg-[var(--muted)] px-3 py-2 leading-6">
                  {reason}
                </li>
              ))}
            </ul>
            {result.warnings.map((warning) => (
              <p
                key={warning}
                className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                {warning}
              </p>
            ))}
            {result.alternatives.length > 0 ? (
              <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                <span className="font-semibold text-[var(--foreground)]">Also worth a look:</span>{" "}
                {result.alternatives.map((l) => `${l.name} (${l.id})`).join(", ")}
              </p>
            ) : null}
          </>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. License choice interacts with contributor
        agreements, dependencies and dual-licensing plans — consult a lawyer for anything with
        commercial stakes.
      </p>
    </main>
  );
}

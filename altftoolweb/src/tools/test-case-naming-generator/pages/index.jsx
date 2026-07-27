"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FlaskConical, Plus, RotateCcw, Trash2 } from "lucide-react";

import { CASINGS, CONVENTIONS, FRAMEWORKS, generateTestNames } from "../lib";

const DEFAULT_UNIT = "verifyToken";
const DEFAULT_SCENARIOS = [
  { id: 1, given: "an expired token", when: "the API is called", then: "respond 401" },
  { id: 2, given: "", when: "the signature is tampered with", then: "reject the request" },
];

const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [unit, setUnit] = useState(DEFAULT_UNIT);
  const [convention, setConvention] = useState("should");
  const [framework, setFramework] = useState("jest");
  const [casing, setCasing] = useState("sentence");
  const [scenarios, setScenarios] = useState(DEFAULT_SCENARIOS);
  const [nextId, setNextId] = useState(DEFAULT_SCENARIOS.length + 1);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => generateTestNames({ unit, scenarios, convention, casing, framework }),
    [unit, scenarios, convention, casing, framework],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [`// ${result.fileName}`, "", result.snippet].join("\n");
  }, [ok, result]);

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

  const updateScenario = (id, field, value) => {
    setScenarios((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const addScenario = () => {
    setScenarios((current) => [...current, { id: nextId, given: "", when: "", then: "" }]);
    setNextId(nextId + 1);
  };

  const removeScenario = (id) => {
    setScenarios((current) => (current.length > 1 ? current.filter((row) => row.id !== id) : current));
  };

  const reset = () => {
    setUnit(DEFAULT_UNIT);
    setConvention("should");
    setFramework("jest");
    setCasing("sentence");
    setScenarios(DEFAULT_SCENARIOS);
    setNextId(DEFAULT_SCENARIOS.length + 1);
    setCopied(false);
  };

  const activeConvention = CONVENTIONS.find((item) => item.id === convention);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FlaskConical className="h-4 w-4" aria-hidden="true" />
          Testing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Test Case Naming Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe what is under test and what should happen, and get names that read cleanly in a
          CI failure list — plus a runnable skeleton that already obeys your runner&apos;s naming
          rules.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="tcn-unit">
              What is under test?
            </label>
            <input
              id="tcn-unit"
              className={INPUT}
              type="text"
              value={unit}
              placeholder="verifyToken, CheckoutPage, InvoiceService"
              onChange={(event) => setUnit(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="tcn-convention">
              Naming convention
            </label>
            <select
              id="tcn-convention"
              className={INPUT}
              value={convention}
              onChange={(event) => setConvention(event.target.value)}
            >
              {CONVENTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {activeConvention ? (
              <p className="mt-1 font-mono text-xs leading-5 text-[var(--muted-foreground)]">
                {activeConvention.example}
              </p>
            ) : null}
          </div>
          <div>
            <label className={LABEL} htmlFor="tcn-framework">
              Test framework
            </label>
            <select
              id="tcn-framework"
              className={INPUT}
              value={framework}
              onChange={(event) => setFramework(event.target.value)}
            >
              {FRAMEWORKS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.language})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="tcn-casing">
              Identifier casing (where the language allows a choice)
            </label>
            <select
              id="tcn-casing"
              className={INPUT}
              value={casing}
              onChange={(event) => setCasing(event.target.value)}
            >
              {CASINGS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Scenarios</h2>
          <button type="button" onClick={addScenario} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add scenario
          </button>
        </div>

        <div className="mt-4 grid gap-5">
          {scenarios.map((row, index) => (
            <div key={row.id} className="rounded-lg border border-[var(--border)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--muted-foreground)]">
                  Scenario {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeScenario(row.id)}
                  aria-label={`Remove scenario ${index + 1}`}
                  disabled={scenarios.length < 2}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
              <div className="grid gap-4">
                <div>
                  <label className={LABEL} htmlFor={`tcn-given-${row.id}`}>
                    Given (starting state, optional)
                  </label>
                  <input
                    id={`tcn-given-${row.id}`}
                    className={INPUT}
                    type="text"
                    value={row.given}
                    placeholder="an expired token"
                    onChange={(event) => updateScenario(row.id, "given", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL} htmlFor={`tcn-when-${row.id}`}>
                    When (the trigger)
                  </label>
                  <input
                    id={`tcn-when-${row.id}`}
                    className={INPUT}
                    type="text"
                    value={row.when}
                    placeholder="the API is called"
                    onChange={(event) => updateScenario(row.id, "when", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL} htmlFor={`tcn-then-${row.id}`}>
                    Then (expected outcome)
                  </label>
                  <input
                    id={`tcn-then-${row.id}`}
                    className={INPUT}
                    type="text"
                    value={row.then}
                    placeholder="respond 401"
                    onChange={(event) => updateScenario(row.id, "then", event.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Suite file
            </p>
            <p className="mt-1 break-words font-mono text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
              {ok ? result.fileName : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `${result.cases.length} test name${result.cases.length === 1 ? "" : "s"} for ${result.framework.label}` : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generated test suite"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the generator" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(ok ? result.cases : []).map((item, index) => (
            <div key={item.identifier + index} className="py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Test {index + 1}
              </dt>
              <dd className="mt-1 break-words font-mono text-sm font-semibold">{item.sentence}</dd>
              {item.identifier !== item.sentence ? (
                <dd className="mt-1 break-words font-mono text-xs text-[var(--muted-foreground)]">
                  identifier: {item.identifier}
                </dd>
              ) : null}
              {item.warnings.map((warning) => (
                <dd key={warning} className="mt-1 text-xs text-[var(--danger)]">
                  {warning}
                </dd>
              ))}
            </div>
          ))}
          {!ok ? (
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Generated names</dt>
              <dd className="text-right font-semibold">{DASH}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      {ok ? (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Suite skeleton</h2>
          <div className="mt-3 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
            <pre className="font-mono text-xs leading-5">{result.snippet}</pre>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Each body fails on purpose so a copied skeleton can never pass silently before you write
            the assertion.
          </p>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        pytest only collects functions beginning with <code className="font-mono">test_</code>, and
        Go only runs functions matching <code className="font-mono">TestXxx</code> in a{" "}
        <code className="font-mono">_test.go</code> file — those rules are applied automatically, so
        the identifier may differ from the sentence you typed.
      </p>
    </main>
  );
}

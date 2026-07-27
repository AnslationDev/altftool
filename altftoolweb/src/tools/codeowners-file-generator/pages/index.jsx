"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Users } from "lucide-react";

import { generateCodeowners, matchOwners } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  defaultOwner: "@org/all-devs",
  rules: [
    { pattern: "*.js", owners: "@org/frontend" },
    { pattern: "/docs/", owners: "@org/docs-team" },
    { pattern: "src/api/**", owners: "@org/backend" },
  ],
  testPath: "src/api/v1/users.js",
};

export default function ToolHome() {
  const [defaultOwner, setDefaultOwner] = useState(DEFAULTS.defaultOwner);
  const [rules, setRules] = useState(DEFAULTS.rules.map((r) => ({ ...r })));
  const [testPath, setTestPath] = useState(DEFAULTS.testPath);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => generateCodeowners({ rules, defaultOwner }),
    [rules, defaultOwner],
  );

  const hasError = Boolean(result.error);

  const preview = useMemo(() => {
    if (hasError || testPath.trim() === "") return null;
    return matchOwners(result.parsedRules, testPath);
  }, [hasError, result, testPath]);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setDefaultOwner(DEFAULTS.defaultOwner);
    setRules(DEFAULTS.rules.map((r) => ({ ...r })));
    setTestPath(DEFAULTS.testPath);
    setCopied(false);
  };

  const updateRule = (index, key, value) => {
    setRules((prev) => prev.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
  };
  const addRule = () => setRules((prev) => [...prev, { pattern: "", owners: "" }]);
  const removeRule = (index) => setRules((prev) => prev.filter((_, i) => i !== index));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Users className="h-4 w-4" aria-hidden="true" />
          Git workflow
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          CODEOWNERS File Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a CODEOWNERS file with validated owner handles and gitignore-style patterns, then
          test any file path to see exactly which rule wins (the last matching rule, per GitHub's
          docs).
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="co-default">
            Default owner for everything (optional)
          </label>
          <input
            id="co-default"
            className={`mt-2 ${INPUT_CLASS} font-mono text-sm`}
            type="text"
            value={defaultOwner}
            placeholder="@org/all-devs"
            onChange={(event) => setDefaultOwner(event.target.value)}
          />
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Written first as <span className="font-mono">*</span> so every later rule overrides
            it.
          </p>
        </div>

        <div className="mt-4">
          <p className="text-sm font-semibold">Rules (pattern → owners) — order matters</p>
          {rules.map((rule, index) => (
            <div key={index} className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <div>
                <label className="sr-only" htmlFor={`co-pattern-${index}`}>
                  Path pattern for rule {index + 1}
                </label>
                <input
                  id={`co-pattern-${index}`}
                  className={`${INPUT_CLASS} font-mono text-sm`}
                  type="text"
                  placeholder="src/api/**"
                  value={rule.pattern}
                  onChange={(event) => updateRule(index, "pattern", event.target.value)}
                />
              </div>
              <div>
                <label className="sr-only" htmlFor={`co-owners-${index}`}>
                  Owners for rule {index + 1}
                </label>
                <input
                  id={`co-owners-${index}`}
                  className={`${INPUT_CLASS} font-mono text-sm`}
                  type="text"
                  placeholder="@org/team @user email@example.com"
                  value={rule.owners}
                  onChange={(event) => updateRule(index, "owners", event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeRule(index)}
                aria-label={`Remove rule ${index + 1}`}
                className={`${GHOST_BTN} px-3`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
          <button type="button" onClick={addRule} className={`${GHOST_BTN} mt-2`}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add rule
          </button>
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
              Ownership rules
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.ruleCount}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated CODEOWNERS file"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy file"}
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

        {!hasError ? (
          <>
            <div className="mt-4">
              <label className={LABEL_CLASS} htmlFor="co-test">
                Match preview — who owns this path?
              </label>
              <input
                id="co-test"
                className={`mt-2 ${INPUT_CLASS} font-mono text-sm`}
                type="text"
                value={testPath}
                placeholder="src/api/v1/users.js"
                onChange={(event) => setTestPath(event.target.value)}
              />
              {preview ? (
                preview.error ? (
                  <p className="mt-2 rounded-md bg-[var(--muted)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
                    {preview.error}
                  </p>
                ) : preview.matched ? (
                  <p className="mt-2 rounded-md bg-[var(--muted)] px-3 py-2 text-sm font-medium">
                    <span className="text-[var(--success)]">Owned by {preview.owners.join(", ")}</span>
                    <span className="text-[var(--muted-foreground)]">
                      {" "}
                      — winning rule: <span className="font-mono">{preview.pattern}</span>
                    </span>
                  </p>
                ) : (
                  <p className="mt-2 rounded-md bg-[var(--muted)] px-3 py-2 text-sm font-medium text-[var(--muted-foreground)]">
                    No rule matches — no reviewers would be auto-requested for this path.
                  </p>
                )
              ) : null}
            </div>

            <h2 className="mt-5 font-mono text-sm font-semibold">CODEOWNERS</h2>
            <pre className="mt-2 overflow-x-auto rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5 text-[var(--foreground)]">
              <code>{result.content}</code>
            </pre>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              {result.location} Teams listed as owners must have write access, and negation (!)
              or character ranges ([..]) are not supported in CODEOWNERS patterns.
            </p>
          </>
        ) : null}
      </section>
    </main>
  );
}

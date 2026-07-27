"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GitBranch, RotateCcw } from "lucide-react";

import {
  BRANCH_TYPES,
  SEPARATORS,
  buildBranchStandard,
  validateBranchName,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CODE_BLOCK =
  "overflow-x-auto rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5 text-[var(--foreground)]";

const DASH = "—";

const DEFAULTS = {
  types: ["feature", "bugfix", "hotfix"],
  separator: "/",
  requireTicket: true,
  projectKey: "PROJ",
  includeUser: false,
  sampleTicket: "123",
  sampleDescription: "add login form",
  testName: "feature/PROJ-123-add-login-form",
};

export default function ToolHome() {
  const [types, setTypes] = useState(DEFAULTS.types);
  const [separator, setSeparator] = useState(DEFAULTS.separator);
  const [requireTicket, setRequireTicket] = useState(DEFAULTS.requireTicket);
  const [projectKey, setProjectKey] = useState(DEFAULTS.projectKey);
  const [includeUser, setIncludeUser] = useState(DEFAULTS.includeUser);
  const [sampleTicket, setSampleTicket] = useState(DEFAULTS.sampleTicket);
  const [sampleDescription, setSampleDescription] = useState(DEFAULTS.sampleDescription);
  const [testName, setTestName] = useState(DEFAULTS.testName);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildBranchStandard({
        types,
        separator,
        requireTicket,
        projectKey,
        includeUser,
        sampleTicket,
        sampleDescription,
      }),
    [types, separator, requireTicket, projectKey, includeUser, sampleTicket, sampleDescription],
  );

  const hasError = Boolean(result.error);

  const testResult = useMemo(() => {
    if (hasError || testName.trim() === "") return null;
    return validateBranchName(testName, result);
  }, [hasError, testName, result]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Branch naming standard",
      `Template: ${result.template}`,
      `Regex: ${result.regexSource}`,
      "",
      "Examples:",
      ...result.examples.map((e) => `  ${e}`),
      "",
      "Rules:",
      ...result.rules.map((r) => `  - ${r}`),
      "",
      result.ciSnippet,
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
    setTypes(DEFAULTS.types);
    setSeparator(DEFAULTS.separator);
    setRequireTicket(DEFAULTS.requireTicket);
    setProjectKey(DEFAULTS.projectKey);
    setIncludeUser(DEFAULTS.includeUser);
    setSampleTicket(DEFAULTS.sampleTicket);
    setSampleDescription(DEFAULTS.sampleDescription);
    setTestName(DEFAULTS.testName);
    setCopied(false);
  };

  const toggleType = (id) => {
    setTypes((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GitBranch className="h-4 w-4" aria-hidden="true" />
          Git workflow
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Git Branch Naming Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Define a branch naming convention with types, ticket IDs and separators. Get the
          template, a validation regex, live examples and a copy-paste CI check.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold">Branch types allowed</legend>
          <div className="mt-1 grid gap-1 sm:grid-cols-2">
            {BRANCH_TYPES.map((type) => (
              <label
                key={type.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`bn-type-${type.id}`}
              >
                <input
                  id={`bn-type-${type.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={types.includes(type.id)}
                  onChange={() => toggleType(type.id)}
                />
                {type.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bn-separator">
              Separator
            </label>
            <select
              id="bn-separator"
              className={`mt-2 ${INPUT_CLASS}`}
              value={separator}
              onChange={(event) => setSeparator(event.target.value)}
            >
              {SEPARATORS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bn-key">
              Ticket project key
            </label>
            <input
              id="bn-key"
              className={`mt-2 ${INPUT_CLASS} disabled:opacity-50`}
              type="text"
              value={projectKey}
              disabled={!requireTicket}
              onChange={(event) => setProjectKey(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bn-sample-ticket">
              Sample ticket number
            </label>
            <input
              id="bn-sample-ticket"
              className={`mt-2 ${INPUT_CLASS} disabled:opacity-50`}
              type="text"
              inputMode="numeric"
              value={sampleTicket}
              disabled={!requireTicket}
              onChange={(event) => setSampleTicket(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bn-sample-desc">
              Sample description
            </label>
            <input
              id="bn-sample-desc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={sampleDescription}
              onChange={(event) => setSampleDescription(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-3 grid gap-1 sm:grid-cols-2">
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="bn-ticket"
          >
            <input
              id="bn-ticket"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={requireTicket}
              onChange={(event) => setRequireTicket(event.target.checked)}
            />
            Require a ticket ID segment
          </label>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="bn-user"
          >
            <input
              id="bn-user"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={includeUser}
              onChange={(event) => setIncludeUser(event.target.checked)}
            />
            Include a username segment
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
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Branch template
            </p>
            <p className="mt-1 break-all font-mono text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
              {hasError ? DASH : result.template}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the branch naming standard"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy standard"}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <dt className="shrink-0 text-[var(--muted-foreground)]">Validation regex</dt>
            <dd className="break-all font-mono text-xs font-semibold sm:text-right">
              {hasError ? DASH : result.regexSource}
            </dd>
          </div>
          <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <dt className="shrink-0 text-[var(--muted-foreground)]">Examples</dt>
            <dd className="break-all font-mono text-xs font-semibold sm:text-right">
              {hasError ? DASH : result.examples.join("  ·  ")}
            </dd>
          </div>
        </dl>

        {!hasError ? (
          <>
            <div className="mt-4">
              <label className={LABEL_CLASS} htmlFor="bn-test">
                Test a branch name against the standard
              </label>
              <input
                id="bn-test"
                className={`mt-2 ${INPUT_CLASS} font-mono`}
                type="text"
                value={testName}
                onChange={(event) => setTestName(event.target.value)}
              />
              {testResult ? (
                <p
                  className={`mt-2 rounded-md px-3 py-2 text-sm font-medium ${
                    testResult.valid
                      ? "bg-[var(--muted)] text-[var(--success)]"
                      : "bg-[var(--muted)] text-[var(--danger)]"
                  }`}
                >
                  {testResult.valid ? "Valid — matches the standard." : testResult.reason}
                </p>
              ) : null}
            </div>

            <ul className="mt-4 list-disc space-y-1 pl-5 text-xs leading-5 text-[var(--muted-foreground)]">
              {result.rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>

            <h2 className="mt-5 text-sm font-semibold">Enforce it in CI</h2>
            <pre className={`mt-2 ${CODE_BLOCK}`}>
              <code>{result.ciSnippet}</code>
            </pre>
          </>
        ) : null}
      </section>
    </main>
  );
}

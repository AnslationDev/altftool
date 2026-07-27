"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GitCommitHorizontal, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  DEFAULT_LINT_STAGED_ROWS,
  PACKAGE_MANAGERS,
  generateHuskySetup,
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
  packageManagerId: "npm",
  preCommit: true,
  commitMsg: true,
  prePush: false,
  prePushCommand: "npm test",
  rows: DEFAULT_LINT_STAGED_ROWS.map((row) => ({ ...row })),
};

export default function ToolHome() {
  const [packageManagerId, setPackageManagerId] = useState(DEFAULTS.packageManagerId);
  const [preCommit, setPreCommit] = useState(DEFAULTS.preCommit);
  const [commitMsg, setCommitMsg] = useState(DEFAULTS.commitMsg);
  const [prePush, setPrePush] = useState(DEFAULTS.prePush);
  const [prePushCommand, setPrePushCommand] = useState(DEFAULTS.prePushCommand);
  const [rows, setRows] = useState(DEFAULTS.rows);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      generateHuskySetup({
        packageManagerId,
        preCommit,
        commitMsg,
        prePush,
        prePushCommand,
        lintStagedRows: rows,
      }),
    [packageManagerId, preCommit, commitMsg, prePush, prePushCommand, rows],
  );

  const hasError = Boolean(result.error);

  const fullOutput = useMemo(() => {
    if (hasError) return "";
    const parts = [
      "# Husky + lint-staged setup",
      "",
      "## Commands",
      ...result.installCommands.map((c) => `# ${c.label}\n${c.command}`),
      "",
      "## package.json additions",
      result.packageJsonSnippet,
      "",
      ...result.files.map((f) => `## ${f.path}\n${f.content}`),
    ];
    return parts.join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!fullOutput) return;
    try {
      await navigator.clipboard.writeText(fullOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setPackageManagerId(DEFAULTS.packageManagerId);
    setPreCommit(DEFAULTS.preCommit);
    setCommitMsg(DEFAULTS.commitMsg);
    setPrePush(DEFAULTS.prePush);
    setPrePushCommand(DEFAULTS.prePushCommand);
    setRows(DEFAULTS.rows.map((row) => ({ ...row })));
    setCopied(false);
  };

  const updateRow = (index, key, value) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const addRow = () => setRows((prev) => [...prev, { pattern: "", command: "" }]);
  const removeRow = (index) => setRows((prev) => prev.filter((_, i) => i !== index));

  const hookToggles = [
    {
      id: "husky-precommit",
      label: "pre-commit — run lint-staged on staged files",
      checked: preCommit,
      set: setPreCommit,
    },
    {
      id: "husky-commitmsg",
      label: "commit-msg — lint messages with commitlint (Conventional Commits)",
      checked: commitMsg,
      set: setCommitMsg,
    },
    {
      id: "husky-prepush",
      label: "pre-push — run a command before every push",
      checked: prePush,
      set: setPrePush,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GitCommitHorizontal className="h-4 w-4" aria-hidden="true" />
          Git hooks
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Husky Config Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick your package manager and hooks to get the exact Husky v9 install commands, hook
          files and package.json configuration — no deprecated boilerplate.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="husky-pm">
              Package manager
            </label>
            <select
              id="husky-pm"
              className={`mt-2 ${INPUT_CLASS}`}
              value={packageManagerId}
              onChange={(event) => setPackageManagerId(event.target.value)}
            >
              {PACKAGE_MANAGERS.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  {pm.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="husky-prepush-cmd">
              pre-push command
            </label>
            <input
              id="husky-prepush-cmd"
              className={`mt-2 ${INPUT_CLASS} disabled:opacity-50`}
              type="text"
              value={prePushCommand}
              disabled={!prePush}
              onChange={(event) => setPrePushCommand(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Hooks to generate</legend>
          {hookToggles.map((hook) => (
            <label
              key={hook.id}
              className="mt-1 flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              htmlFor={hook.id}
            >
              <input
                id={hook.id}
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={hook.checked}
                onChange={(event) => hook.set(event.target.checked)}
              />
              {hook.label}
            </label>
          ))}
        </fieldset>

        {preCommit ? (
          <div className="mt-4">
            <p className="text-sm font-semibold">lint-staged rules (glob → command)</p>
            {rows.map((row, index) => (
              <div key={index} className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <div>
                  <label className="sr-only" htmlFor={`husky-row-pattern-${index}`}>
                    Glob pattern for rule {index + 1}
                  </label>
                  <input
                    id={`husky-row-pattern-${index}`}
                    className={INPUT_CLASS}
                    type="text"
                    placeholder="*.{js,ts}"
                    value={row.pattern}
                    onChange={(event) => updateRow(index, "pattern", event.target.value)}
                  />
                </div>
                <div>
                  <label className="sr-only" htmlFor={`husky-row-command-${index}`}>
                    Command for rule {index + 1}
                  </label>
                  <input
                    id={`husky-row-command-${index}`}
                    className={INPUT_CLASS}
                    type="text"
                    placeholder="eslint --fix"
                    value={row.command}
                    onChange={(event) => updateRow(index, "command", event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  aria-label={`Remove lint-staged rule ${index + 1}`}
                  className={`${GHOST_BTN} px-3`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
            <button type="button" onClick={addRow} className={`${GHOST_BTN} mt-2`}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add rule
            </button>
          </div>
        ) : null}
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
              Hooks generated
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.hookCount}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the full Husky setup to the clipboard"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy setup"}
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
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Dev dependencies</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : result.packages.join(", ")}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Files to create</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : result.files.map((f) => f.path).join(", ")}
            </dd>
          </div>
        </dl>

        {!hasError ? (
          <div className="mt-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold">Run these commands</h2>
              {result.installCommands.map((cmd) => (
                <pre key={cmd.label} className={`mt-2 ${CODE_BLOCK}`}>
                  <code>{`# ${cmd.label}\n${cmd.command}`}</code>
                </pre>
              ))}
            </div>
            <div>
              <h2 className="text-sm font-semibold">package.json additions</h2>
              <pre className={`mt-2 ${CODE_BLOCK}`}>
                <code>{result.packageJsonSnippet}</code>
              </pre>
            </div>
            {result.files.map((file) => (
              <div key={file.path}>
                <h2 className="font-mono text-sm font-semibold">{file.path}</h2>
                <pre className={`mt-2 ${CODE_BLOCK}`}>
                  <code>{file.content}</code>
                </pre>
              </div>
            ))}
            <ul className="list-disc space-y-1 pl-5 text-xs leading-5 text-[var(--muted-foreground)]">
              {result.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </main>
  );
}

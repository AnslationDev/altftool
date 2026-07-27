"use client";

import { useMemo, useState } from "react";
import { Check, Copy, KeyRound, Plus, RotateCcw, Trash2 } from "lucide-react";

import { SCOPE_LABELS, USED_BY_OPTIONS, planSecretScopes } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_SECRETS = [
  { id: 1, name: "NPM_TOKEN", usedBy: "all-repos", variesPerEnv: false, needsApproval: false },
  { id: 2, name: "AWS_DEPLOY_KEY", usedBy: "one-repo", variesPerEnv: true, needsApproval: false },
  { id: 3, name: "PROD_DB_PASSWORD", usedBy: "one-repo", variesPerEnv: false, needsApproval: true },
];

const DEFAULTS = { environments: "staging, production", org: "" };

const DASH = "—";

const SCOPE_STYLE = {
  organization: "text-[var(--primary)]",
  repository: "text-[var(--success)]",
  environment: "text-[var(--danger)]",
};

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_SECRETS);
  const [nextId, setNextId] = useState(DEFAULT_SECRETS.length + 1);
  const [environments, setEnvironments] = useState(DEFAULTS.environments);
  const [org, setOrg] = useState(DEFAULTS.org);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => planSecretScopes({ secrets: rows, environments, org }),
    [rows, environments, org],
  );
  const hasError = Boolean(result.error);

  const updateRow = (id, patch) => {
    setRows((previous) => previous.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    setRows((previous) => [
      ...previous,
      { id: nextId, name: "", usedBy: "one-repo", variesPerEnv: false, needsApproval: false },
    ]);
    setNextId((previous) => previous + 1);
  };

  const removeRow = (id) => {
    setRows((previous) => previous.filter((row) => row.id !== id));
  };

  const copyResult = async () => {
    if (hasError) return;
    const text = [
      "GitHub Actions secrets scope plan",
      ...result.plans.map(
        (plan) => `${plan.name}: ${SCOPE_LABELS[plan.scope]}\n  ${plan.reason}\n  ${plan.commands.join("\n  ")}`,
      ),
      "",
      "Checklist:",
      ...result.checklist.map((item) => `- ${item}`),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setRows(DEFAULT_SECRETS);
    setNextId(DEFAULT_SECRETS.length + 1);
    setEnvironments(DEFAULTS.environments);
    setOrg(DEFAULTS.org);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          CI / CD
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          GitHub Actions Secrets Scope Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe each secret and get the right scope — organization, repository or environment —
          with the reasoning, the gh CLI commands and a settings checklist.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-envs">
              Deployment environments (comma separated)
            </label>
            <input
              id="sp-envs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={environments}
              onChange={(event) => setEnvironments(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-org">
              Organization slug (optional)
            </label>
            <input
              id="sp-org"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              placeholder="my-org"
              value={org}
              onChange={(event) => setOrg(event.target.value)}
            />
          </div>
        </div>

        <ul className="mt-5 space-y-4">
          {rows.map((row, index) => (
            <li
              key={row.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sp-name-${row.id}`}>
                    Secret name #{index + 1}
                  </label>
                  <input
                    id={`sp-name-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS} font-mono uppercase`}
                    type="text"
                    autoComplete="off"
                    placeholder="API_TOKEN"
                    value={row.name}
                    onChange={(event) => updateRow(row.id, { name: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sp-used-${row.id}`}>
                    Used by
                  </label>
                  <select
                    id={`sp-used-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.usedBy}
                    onChange={(event) => updateRow(row.id, { usedBy: event.target.value })}
                  >
                    {USED_BY_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                <label
                  className="flex min-h-11 cursor-pointer items-center gap-2 text-sm"
                  htmlFor={`sp-varies-${row.id}`}
                >
                  <input
                    id={`sp-varies-${row.id}`}
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                    checked={row.variesPerEnv}
                    onChange={(event) => updateRow(row.id, { variesPerEnv: event.target.checked })}
                  />
                  Different value per environment
                </label>
                <label
                  className="flex min-h-11 cursor-pointer items-center gap-2 text-sm"
                  htmlFor={`sp-approval-${row.id}`}
                >
                  <input
                    id={`sp-approval-${row.id}`}
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                    checked={row.needsApproval}
                    onChange={(event) => updateRow(row.id, { needsApproval: event.target.checked })}
                  />
                  Needs approval gating (required reviewers)
                </label>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length <= 1}
                  aria-label={`Remove secret ${row.name || index + 1}`}
                  className="ml-auto inline-flex min-h-11 items-center gap-1 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger-soft)] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <button type="button" onClick={addRow} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add secret
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

      {!hasError && result.warnings.length > 0 ? (
        <ul className="mt-6 space-y-1 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
          {result.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Scope split
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError
                ? DASH
                : `${result.counts.environment} · ${result.counts.repository} · ${result.counts.organization}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : "environment · repository · organization secrets"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the scope plan, commands and checklist"
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
              aria-label="Reset all inputs to the example"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError ? [] : result.plans).map((plan) => (
            <div key={plan.name} className="py-3">
              <div className="flex items-center justify-between gap-4">
                <dt className="font-mono font-semibold">{plan.name}</dt>
                <dd className={`text-right font-semibold ${SCOPE_STYLE[plan.scope]}`}>
                  {SCOPE_LABELS[plan.scope]}
                </dd>
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{plan.reason}</p>
              <div className="mt-2 overflow-x-auto">
                <pre className="min-w-[280px] rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5 text-[var(--foreground)]">
                  {plan.commands.join("\n")}
                </pre>
              </div>
            </div>
          ))}
          {hasError ? (
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Plan</dt>
              <dd className="text-right font-semibold">{DASH}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      {hasError ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Settings checklist</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
            {result.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Based on GitHub&apos;s documented secret scopes and limits: 1,000 organization secrets, 100
        per repository, 100 per environment, 48 KB per value, and environment &gt; repository &gt;
        organization precedence when names collide.
      </p>
    </main>
  );
}

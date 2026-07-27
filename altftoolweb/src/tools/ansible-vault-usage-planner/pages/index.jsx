"use client";

import { useMemo, useState } from "react";
import { Check, Copy, LockKeyhole, RotateCcw } from "lucide-react";

import { STRATEGY_OPTIONS, planVault } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  namesText: "db_password\ndb_user\napi_key\ntls_cert\napp_port\nregion",
  strategy: "single",
  envsText: "dev, prod",
  useVaultIds: false,
};

const DASH = "—";

const LEVEL_STYLE = {
  encrypt: "text-[var(--danger)]",
  review: "text-[var(--primary)]",
  plain: "text-[var(--success)]",
};
const LEVEL_LABEL = { encrypt: "Encrypt", review: "Review", plain: "Plain" };

export default function ToolHome() {
  const [namesText, setNamesText] = useState(DEFAULTS.namesText);
  const [strategy, setStrategy] = useState(DEFAULTS.strategy);
  const [envsText, setEnvsText] = useState(DEFAULTS.envsText);
  const [useVaultIds, setUseVaultIds] = useState(DEFAULTS.useVaultIds);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => planVault({ namesText, strategy, envsText, useVaultIds }),
    [namesText, strategy, envsText, useVaultIds],
  );
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    const text = [
      "Ansible Vault plan",
      ...result.classified.map((entry) => `${LEVEL_LABEL[entry.level]}: ${entry.name}`),
      "",
      result.varsSnippet,
      "",
      result.vaultSnippet,
      "",
      ...result.commands.map((command) => `# ${command.title}\n${command.cmd}`),
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
    setNamesText(DEFAULTS.namesText);
    setStrategy(DEFAULTS.strategy);
    setEnvsText(DEFAULTS.envsText);
    setUseVaultIds(DEFAULTS.useVaultIds);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <LockKeyhole className="h-4 w-4" aria-hidden="true" />
          Configuration Management
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Ansible Vault Usage Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste your variable names and get each one classified as encrypt, review or plain, plus
          the vars/vault indirection layout and the exact ansible-vault commands to run.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="av-names">
          Variable names (one per line; &quot;key: value&quot; lines also accepted)
        </label>
        <textarea
          id="av-names"
          rows={8}
          spellCheck={false}
          className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          value={namesText}
          onChange={(event) => setNamesText(event.target.value)}
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="av-strategy">
              Vault layout
            </label>
            <select
              id="av-strategy"
              className={`mt-2 ${INPUT_CLASS}`}
              value={strategy}
              onChange={(event) => setStrategy(event.target.value)}
            >
              {STRATEGY_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {STRATEGY_OPTIONS.find((option) => option.id === strategy)?.note}
            </p>
          </div>
          {strategy === "per-env" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="av-envs">
                Environments (comma separated)
              </label>
              <input
                id="av-envs"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                autoComplete="off"
                value={envsText}
                onChange={(event) => setEnvsText(event.target.value)}
              />
            </div>
          ) : null}
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
            htmlFor="av-ids"
          >
            <input
              id="av-ids"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={useVaultIds}
              onChange={(event) => setUseVaultIds(event.target.checked)}
            />
            Label passwords with --vault-id (multiple vault passwords)
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
              Variables to encrypt
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.counts.encrypt} of ${result.counts.total}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${result.counts.review} to review, ${result.counts.plain} safely plain.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the vault plan, snippets and commands"
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
          {(hasError ? [] : result.classified).map((entry) => (
            <div key={entry.name} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="font-mono text-[var(--foreground)]">
                {entry.name}
                <span className="mt-0.5 block font-sans text-xs text-[var(--muted-foreground)]">
                  {entry.reason}
                </span>
              </dt>
              <dd className={`text-right font-semibold ${LEVEL_STYLE[entry.level]}`}>
                {LEVEL_LABEL[entry.level]}
              </dd>
            </div>
          ))}
          {hasError ? (
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Classification</dt>
              <dd className="text-right font-semibold">{DASH}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      {hasError ? null : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">vars.yml / vault.yml split</h2>
            <div className="mt-3 grid gap-4 lg:grid-cols-2">
              <div className="overflow-x-auto">
                <pre className="min-w-[280px] rounded-md bg-[var(--muted)] p-4 font-mono text-xs leading-5 text-[var(--foreground)]">
                  {result.varsSnippet}
                </pre>
              </div>
              <div className="overflow-x-auto">
                <pre className="min-w-[280px] rounded-md bg-[var(--muted)] p-4 font-mono text-xs leading-5 text-[var(--foreground)]">
                  {result.vaultSnippet}
                </pre>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Command workflow</h2>
            <ol className="mt-3 space-y-3">
              {result.commands.map((command) => (
                <li key={command.cmd}>
                  <p className="text-sm font-semibold">{command.title}</p>
                  <div className="mt-1 overflow-x-auto">
                    <pre className="min-w-[280px] rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5 text-[var(--foreground)]">
                      {command.cmd}
                    </pre>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Classification is keyword-based and informational — review the list yourself before
        committing. The vars/vault indirection pattern follows Ansible&apos;s documented best
        practice of keeping vaulted variable names greppable via a vault_ prefix.
      </p>
    </main>
  );
}

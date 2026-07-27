"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Tags } from "lucide-react";

import {
  ENVIRONMENT_OPTIONS,
  REGION_OPTIONS,
  SEPARATOR_OPTIONS,
  buildConvention,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  org: "acme",
  app: "billing",
  env: "prod",
  region: "use1",
  separator: "-",
  includeRegion: true,
};

const DASH = "—";

export default function ToolHome() {
  const [org, setOrg] = useState(DEFAULTS.org);
  const [app, setApp] = useState(DEFAULTS.app);
  const [env, setEnv] = useState(DEFAULTS.env);
  const [region, setRegion] = useState(DEFAULTS.region);
  const [separator, setSeparator] = useState(DEFAULTS.separator);
  const [includeRegion, setIncludeRegion] = useState(DEFAULTS.includeRegion);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => buildConvention({ org, app, env, region, separator, includeRegion }),
    [org, app, env, region, separator, includeRegion],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    const text = [
      `Naming pattern: ${result.pattern}`,
      "",
      ...result.results.map(
        (entry) =>
          `${entry.label}: ${entry.name} (${entry.length}/${entry.max}${entry.valid ? "" : " — " + entry.issues.join(" ")})`,
      ),
      "",
      result.localsBlock,
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
    setOrg(DEFAULTS.org);
    setApp(DEFAULTS.app);
    setEnv(DEFAULTS.env);
    setRegion(DEFAULTS.region);
    setSeparator(DEFAULTS.separator);
    setIncludeRegion(DEFAULTS.includeRegion);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Tags className="h-4 w-4" aria-hidden="true" />
          Infrastructure as Code
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Terraform Naming Convention Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick your tokens once and get a consistent {"{org}-{app}-{env}-{region}-{type}"} standard,
          checked against the real name limits of S3, Lambda, IAM, Azure storage, Key Vault and GCS.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nc-org">
              Organisation / team code
            </label>
            <input
              id="nc-org"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={org}
              onChange={(event) => setOrg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nc-app">
              Workload / application
            </label>
            <input
              id="nc-app"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={app}
              onChange={(event) => setApp(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nc-env">
              Environment
            </label>
            <select
              id="nc-env"
              className={`mt-2 ${INPUT_CLASS}`}
              value={env}
              onChange={(event) => setEnv(event.target.value)}
            >
              {ENVIRONMENT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nc-region">
              Region code
            </label>
            <select
              id="nc-region"
              className={`mt-2 ${INPUT_CLASS}`}
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              disabled={!includeRegion}
            >
              {REGION_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nc-sep">
              Separator
            </label>
            <select
              id="nc-sep"
              className={`mt-2 ${INPUT_CLASS}`}
              value={separator}
              onChange={(event) => setSeparator(event.target.value)}
            >
              {SEPARATOR_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
              htmlFor="nc-include-region"
            >
              <input
                id="nc-include-region"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={includeRegion}
                onChange={(event) => setIncludeRegion(event.target.checked)}
              />
              Include a region token
            </label>
          </div>
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
              Name prefix
            </p>
            <p className="mt-1 break-all font-mono text-3xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.prefix}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Pattern ${result.pattern} — ${result.validCount} of ${result.totalCount} resource types fit their platform limits.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the naming convention and locals block"
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Resource
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Generated name
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Length
                </th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? [] : result.results).map((entry) => (
                <tr key={entry.id} className="border-b border-[var(--border)] last:border-0 align-top">
                  <td className="py-2 pr-3">
                    <span className="font-semibold">{entry.label}</span>
                    <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                      {entry.note}
                    </span>
                  </td>
                  <td className="py-2 pr-3 font-mono">
                    {entry.name}
                    {entry.valid ? null : (
                      <span className="mt-0.5 block text-xs font-medium text-[var(--danger)]">
                        {entry.issues.join(" ")}
                      </span>
                    )}
                  </td>
                  <td
                    className={`py-2 text-right font-semibold ${entry.valid ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
                  >
                    {entry.length}/{entry.max}
                  </td>
                </tr>
              ))}
              {hasError ? (
                <tr>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 text-right">{DASH}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Terraform locals block</h2>
        <div className="mt-3 overflow-x-auto">
          <pre className="min-w-[320px] rounded-md bg-[var(--muted)] p-4 font-mono text-xs leading-5 text-[var(--foreground)]">
            {hasError ? DASH : result.localsBlock}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Length and character rules follow each provider&apos;s published naming documentation.
        Globally unique names (S3, GCS, storage accounts, Key Vault) may still collide with other
        tenants — add a random or account-id suffix where uniqueness matters.
      </p>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Tags } from "lucide-react";

import { NPM_CLIENTS, VERSIONING_MODES, buildLernaJson } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  mode: "independent",
  fixedVersion: "1.0.0",
  npmClient: "npm",
  packagesGlobs: "",
  conventionalCommits: true,
  allowBranch: "main",
  registry: "",
  distTag: "",
  message: "chore(release): publish",
  ignoreChanges: "**/*.md\n**/__tests__/**",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => buildLernaJson(form), [form]);
  const hasError = Boolean(result.error);

  const set = (key) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Tags className="h-4 w-4" aria-hidden="true" />
          Monorepo tooling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Lerna Config Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a lerna.json for Lerna v7/v8 — pick fixed or independent
          versioning, conventional commits, allowed branches and publish
          settings.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lc-mode">
              Versioning mode
            </label>
            <select
              id="lc-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.mode}
              onChange={set("mode")}
            >
              {VERSIONING_MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {VERSIONING_MODES.find((m) => m.id === form.mode)?.hint}
            </p>
          </div>

          {form.mode === "fixed" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="lc-version">
                Current fixed version
              </label>
              <input
                id="lc-version"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                inputMode="decimal"
                placeholder="1.0.0"
                value={form.fixedVersion}
                onChange={set("fixedVersion")}
              />
            </div>
          ) : null}

          <div>
            <label className={LABEL_CLASS} htmlFor="lc-client">
              npm client
            </label>
            <select
              id="lc-client"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.npmClient}
              onChange={set("npmClient")}
            >
              {NPM_CLIENTS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="lc-branches">
              Allowed release branches (comma-separated)
            </label>
            <input
              id="lc-branches"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.allowBranch}
              onChange={set("allowBranch")}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="lc-globs">
              Package globs (blank = use workspaces)
            </label>
            <input
              id="lc-globs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="packages/*"
              value={form.packagesGlobs}
              onChange={set("packagesGlobs")}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="lc-registry">
              Publish registry (optional)
            </label>
            <input
              id="lc-registry"
              className={`mt-2 ${INPUT_CLASS}`}
              type="url"
              placeholder="https://registry.npmjs.org"
              value={form.registry}
              onChange={set("registry")}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="lc-tag">
              npm dist-tag (optional)
            </label>
            <input
              id="lc-tag"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="next"
              value={form.distTag}
              onChange={set("distTag")}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="lc-message">
              Release commit message
            </label>
            <input
              id="lc-message"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.message}
              onChange={set("message")}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lc-ignore">
              ignoreChanges globs (one per line — never trigger a bump)
            </label>
            <textarea
              id="lc-ignore"
              rows={2}
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={form.ignoreChanges}
              onChange={set("ignoreChanges")}
            />
          </div>
        </div>

        <label
          htmlFor="lc-conventional"
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm"
        >
          <input
            id="lc-conventional"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={form.conventionalCommits}
            onChange={set("conventionalCommits")}
          />
          Use conventional commits to derive version bumps and changelogs
        </label>
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
              Save as
            </p>
            <p className="mt-1 font-mono text-lg font-semibold text-[var(--primary)]">
              {hasError ? DASH : "lerna.json"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated lerna.json"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy JSON"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all fields to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="min-w-[320px] p-4 text-xs leading-5">
            <code>{hasError ? DASH : result.json}</code>
          </pre>
        </div>

        {!hasError && result.notes.length ? (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Place lerna.json in the repository root, install lerna as a dev
        dependency, then release with lerna version followed by lerna publish (or
        lerna publish from-git in CI).
      </p>
    </main>
  );
}

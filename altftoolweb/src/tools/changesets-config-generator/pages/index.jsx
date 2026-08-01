"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileDiff, RotateCcw } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  ACCESS_VALUES,
  CHANGELOG_TYPES,
  CONFIG_PATH,
  INTERNAL_DEP_BUMPS,
  buildChangesetsConfig,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  changelogType: "github",
  githubRepo: "my-org/my-repo",
  commit: false,
  access: "public",
  baseBranch: "main",
  updateInternalDependencies: "patch",
  fixed: "",
  linked: "",
  ignore: "",
  versionPrivatePackages: true,
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const { copy: copyToClipboard, isCopied, announcement, reset: resetCopyState } =
    useCopyToClipboard();

  const result = useMemo(() => buildChangesetsConfig(form), [form]);
  const hasError = Boolean(result.error);

  const set = (key) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const copyResult = () => {
    if (hasError) return;
    copyToClipboard("config", result.json, { label: "changesets config" });
  };

  const reset = () => {
    setForm(DEFAULTS);
    resetCopyState();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileDiff className="h-4 w-4" aria-hidden="true" />
          Monorepo tooling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Changesets Config Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Generate .changeset/config.json — changelog generator, npm access,
          base branch, fixed and linked package groups, and ignore rules for
          @changesets/cli.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-changelog">
              Changelog generator
            </label>
            <select
              id="cs-changelog"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.changelogType}
              onChange={set("changelogType")}
            >
              {CHANGELOG_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-repo">
              GitHub repository (org/repo)
            </label>
            <input
              id="cs-repo"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              disabled={form.changelogType !== "github"}
              value={form.githubRepo}
              onChange={set("githubRepo")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-access">
              npm access
            </label>
            <select
              id="cs-access"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.access}
              onChange={set("access")}
            >
              {ACCESS_VALUES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-branch">
              Base branch
            </label>
            <input
              id="cs-branch"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.baseBranch}
              onChange={set("baseBranch")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-internal">
              updateInternalDependencies
            </label>
            <select
              id="cs-internal"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.updateInternalDependencies}
              onChange={set("updateInternalDependencies")}
            >
              {INTERNAL_DEP_BUMPS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-ignore">
              Ignore packages (comma-separated)
            </label>
            <input
              id="cs-ignore"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="docs-site, e2e-tests"
              value={form.ignore}
              onChange={set("ignore")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-fixed">
              Fixed groups (one group per line, comma-separated)
            </label>
            <textarea
              id="cs-fixed"
              rows={2}
              className={AREA_CLASS}
              placeholder="@scope/core, @scope/cli"
              value={form.fixed}
              onChange={set("fixed")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-linked">
              Linked groups (one group per line, comma-separated)
            </label>
            <textarea
              id="cs-linked"
              rows={2}
              className={AREA_CLASS}
              placeholder="@scope/ui-*"
              value={form.linked}
              onChange={set("linked")}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <label
            htmlFor="cs-commit"
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
          >
            <input
              id="cs-commit"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={form.commit}
              onChange={set("commit")}
            />
            Auto-commit when adding or versioning changesets
          </label>
          <label
            htmlFor="cs-private"
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
          >
            <input
              id="cs-private"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={form.versionPrivatePackages}
              onChange={set("versionPrivatePackages")}
            />
            Version private packages too (uncheck to skip them entirely)
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
              Save as
            </p>
            <p className="mt-1 break-all font-mono text-lg font-semibold text-[var(--primary)]">
              {hasError ? DASH : CONFIG_PATH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label={
                isCopied("config")
                  ? "Copied the generated changesets config to clipboard"
                  : "Copy the generated changesets config"
              }
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {isCopied("config") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("config") ? "Copied!" : "Copy JSON"}
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
        <span className="sr-only" role="status" aria-live="polite">
          {announcement}
        </span>

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
        Run npx changeset init once to create the .changeset folder, replace the
        generated config.json with this one, then use npx changeset to record
        changes and npx changeset version / publish to release.
      </p>
    </main>
  );
}

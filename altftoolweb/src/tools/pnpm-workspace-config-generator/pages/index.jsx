"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Package, RotateCcw } from "lucide-react";

import { CATALOG_MIN_PNPM, GLOB_PRESETS, buildPnpmWorkspaceYaml } from "../lib";

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
  globs: "apps/*\npackages/*",
  excludes: "**/test/**",
  catalog: "react ^19.0.0\nreact-dom ^19.0.0\ntypescript ^5.6.0",
  namedCatalog: "",
  namedCatalogEntries: "",
};

export default function ToolHome() {
  const [globs, setGlobs] = useState(DEFAULTS.globs);
  const [excludes, setExcludes] = useState(DEFAULTS.excludes);
  const [catalog, setCatalog] = useState(DEFAULTS.catalog);
  const [namedCatalog, setNamedCatalog] = useState(DEFAULTS.namedCatalog);
  const [namedCatalogEntries, setNamedCatalogEntries] = useState(
    DEFAULTS.namedCatalogEntries,
  );
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildPnpmWorkspaceYaml({
        globs,
        excludes,
        catalog,
        namedCatalog,
        namedCatalogEntries,
      }),
    [globs, excludes, catalog, namedCatalog, namedCatalogEntries],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.yaml);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setGlobs(DEFAULTS.globs);
    setExcludes(DEFAULTS.excludes);
    setCatalog(DEFAULTS.catalog);
    setNamedCatalog(DEFAULTS.namedCatalog);
    setNamedCatalogEntries(DEFAULTS.namedCatalogEntries);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Package className="h-4 w-4" aria-hidden="true" />
          Monorepo tooling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          pnpm Workspace Config Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build pnpm-workspace.yaml with package globs, exclusions and catalog
          dependency versions — plus the catalog: snippet your packages use to
          reference them.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap gap-2">
          {GLOB_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setGlobs(preset.globs.join("\n"))}
              className={GHOST_BTN}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-globs">
              Package globs (one per line)
            </label>
            <textarea
              id="pw-globs"
              rows={4}
              className={AREA_CLASS}
              value={globs}
              onChange={(event) => setGlobs(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-excludes">
              Exclude globs (one per line, no leading !)
            </label>
            <textarea
              id="pw-excludes"
              rows={4}
              className={AREA_CLASS}
              value={excludes}
              onChange={(event) => setExcludes(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="pw-catalog">
            Default catalog entries (name range — one per line)
          </label>
          <textarea
            id="pw-catalog"
            rows={4}
            className={AREA_CLASS}
            placeholder={"react ^19.0.0\n@types/node@^22.0.0"}
            value={catalog}
            onChange={(event) => setCatalog(event.target.value)}
          />
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Accepted formats: react ^19.0.0, react@^19.0.0 or react: ^19.0.0.
            Catalogs need pnpm {CATALOG_MIN_PNPM} or newer.
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-named">
              Named catalog (optional)
            </label>
            <input
              id="pw-named"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="react17"
              value={namedCatalog}
              onChange={(event) => setNamedCatalog(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-named-entries">
              Named catalog entries
            </label>
            <textarea
              id="pw-named-entries"
              rows={2}
              className={AREA_CLASS}
              placeholder="react ^17.0.2"
              value={namedCatalogEntries}
              onChange={(event) => setNamedCatalogEntries(event.target.value)}
            />
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
              Save as
            </p>
            <p className="mt-1 font-mono text-lg font-semibold text-[var(--primary)]">
              {hasError ? DASH : "pnpm-workspace.yaml"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated pnpm-workspace.yaml"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy YAML"}
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

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Include globs</dt>
            <dd className="text-right font-semibold">{hasError ? DASH : result.globCount}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Exclude globs</dt>
            <dd className="text-right font-semibold">{hasError ? DASH : result.excludeCount}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Catalog entries</dt>
            <dd className="text-right font-semibold">{hasError ? DASH : result.catalogCount}</dd>
          </div>
        </dl>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="min-w-[320px] p-4 text-xs leading-5">
            <code>{hasError ? DASH : result.yaml}</code>
          </pre>
        </div>

        {!hasError && result.usageSnippet ? (
          <>
            <h2 className="mt-4 text-sm font-semibold">Using the catalog in a package</h2>
            <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
              <pre className="min-w-[320px] p-4 text-xs leading-5">
                <code>{result.usageSnippet}</code>
              </pre>
            </div>
          </>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Place the file in the repository root next to package.json, then run pnpm
        install. Packages referencing catalog: entries are pinned centrally, so a
        version bump is a one-line change in pnpm-workspace.yaml.
      </p>
    </main>
  );
}

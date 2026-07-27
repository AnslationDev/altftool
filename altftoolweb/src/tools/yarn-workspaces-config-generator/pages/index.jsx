"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Layers, RotateCcw } from "lucide-react";

import {
  HOISTING_LIMITS,
  NODE_LINKERS,
  YARN_VERSIONS,
  buildYarnWorkspacesConfig,
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
  yarnVersion: "berry",
  rootName: "my-monorepo",
  globs: "apps/*\npackages/*",
  nohoist: "",
  nodeLinker: "node-modules",
  hoistingLimit: "none",
  includeConstraints: true,
};

export default function ToolHome() {
  const [yarnVersion, setYarnVersion] = useState(DEFAULTS.yarnVersion);
  const [rootName, setRootName] = useState(DEFAULTS.rootName);
  const [globs, setGlobs] = useState(DEFAULTS.globs);
  const [nohoist, setNohoist] = useState(DEFAULTS.nohoist);
  const [nodeLinker, setNodeLinker] = useState(DEFAULTS.nodeLinker);
  const [hoistingLimit, setHoistingLimit] = useState(DEFAULTS.hoistingLimit);
  const [includeConstraints, setIncludeConstraints] = useState(
    DEFAULTS.includeConstraints,
  );
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildYarnWorkspacesConfig({
        yarnVersion,
        globs,
        nohoist: yarnVersion === "classic" ? nohoist : "",
        nodeLinker,
        hoistingLimit,
        includeConstraints,
        rootName,
      }),
    [yarnVersion, globs, nohoist, nodeLinker, hoistingLimit, includeConstraints, rootName],
  );

  const hasError = Boolean(result.error);

  const combined = useMemo(() => {
    if (hasError) return "";
    return result.files
      .map((f) => `# ${f.path}\n${f.content}`)
      .join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(combined);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setYarnVersion(DEFAULTS.yarnVersion);
    setRootName(DEFAULTS.rootName);
    setGlobs(DEFAULTS.globs);
    setNohoist(DEFAULTS.nohoist);
    setNodeLinker(DEFAULTS.nodeLinker);
    setHoistingLimit(DEFAULTS.hoistingLimit);
    setIncludeConstraints(DEFAULTS.includeConstraints);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Layers className="h-4 w-4" aria-hidden="true" />
          Monorepo tooling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Yarn Workspaces Config Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Generate the root package.json for Yarn workspaces — with nohoist rules
          on Yarn 1, or .yarnrc.yml linker settings and a Yarn 4 constraints file
          on Berry.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="yw-version">
              Yarn version
            </label>
            <select
              id="yw-version"
              className={`mt-2 ${INPUT_CLASS}`}
              value={yarnVersion}
              onChange={(event) => setYarnVersion(event.target.value)}
            >
              {YARN_VERSIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="yw-name">
              Root package name
            </label>
            <input
              id="yw-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={rootName}
              onChange={(event) => setRootName(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="yw-globs">
              Workspace globs (one per line)
            </label>
            <textarea
              id="yw-globs"
              rows={3}
              className={AREA_CLASS}
              value={globs}
              onChange={(event) => setGlobs(event.target.value)}
            />
          </div>
        </div>

        {yarnVersion === "classic" ? (
          <div className="mt-4">
            <label className={LABEL_CLASS} htmlFor="yw-nohoist">
              nohoist patterns (one per line, Yarn 1 only)
            </label>
            <textarea
              id="yw-nohoist"
              rows={3}
              className={AREA_CLASS}
              placeholder={"**/react-native\n**/react-native/**"}
              value={nohoist}
              onChange={(event) => setNohoist(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Typical for React Native or other packages that break when hoisted
              to the root node_modules.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="yw-linker">
                nodeLinker (.yarnrc.yml)
              </label>
              <select
                id="yw-linker"
                className={`mt-2 ${INPUT_CLASS}`}
                value={nodeLinker}
                onChange={(event) => setNodeLinker(event.target.value)}
              >
                {NODE_LINKERS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="yw-hoist">
                nmHoistingLimits
              </label>
              <select
                id="yw-hoist"
                className={`mt-2 ${INPUT_CLASS}`}
                value={hoistingLimit}
                disabled={nodeLinker !== "node-modules"}
                onChange={(event) => setHoistingLimit(event.target.value)}
              >
                {HOISTING_LIMITS.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.label}
                  </option>
                ))}
              </select>
            </div>
            <label
              htmlFor="yw-constraints"
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm sm:col-span-2"
            >
              <input
                id="yw-constraints"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={includeConstraints}
                onChange={(event) => setIncludeConstraints(event.target.checked)}
              />
              Add a Yarn 4 constraints file that keeps dependency versions
              consistent across workspaces
            </label>
          </div>
        )}
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
              Files generated
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.files.length}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy all generated Yarn workspace files"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy all files"}
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

        {hasError ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            Fix the input above to see the generated files.
          </p>
        ) : (
          result.files.map((file) => (
            <div key={file.path} className="mt-4">
              <p className="font-mono text-sm font-semibold text-[var(--primary)]">
                {file.path}
              </p>
              <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
                <pre className="min-w-[320px] p-4 text-xs leading-5">
                  <code>{file.content}</code>
                </pre>
              </div>
            </div>
          ))
        )}

        {!hasError && result.notes.length ? (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        After committing, run yarn install to link the workspaces. On Berry, run
        yarn constraints to check the rules and yarn constraints --fix to apply
        them.
      </p>
    </main>
  );
}

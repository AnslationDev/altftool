"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCode, Plus, RotateCcw, Trash2 } from "lucide-react";

import { GO_VERSIONS, buildGoMod } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const SMALL_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_REQUIRES = [
  { id: "r1", path: "github.com/spf13/cobra", version: "v1.8.1", indirect: false },
  { id: "r2", path: "github.com/stretchr/testify", version: "v1.9.0", indirect: false },
  {
    id: "r3",
    path: "github.com/inconshreveable/mousetrap",
    version: "v1.1.0",
    indirect: true,
  },
];

const DEFAULT_REPLACES = [
  { id: "p1", from: "", fromVersion: "", to: "", toVersion: "" },
];

const DEFAULTS = {
  modulePath: "github.com/acme/widget",
  goVersion: "1.24",
  toolchain: "",
};

export default function ToolHome() {
  const [modulePath, setModulePath] = useState(DEFAULTS.modulePath);
  const [goVersion, setGoVersion] = useState(DEFAULTS.goVersion);
  const [toolchain, setToolchain] = useState(DEFAULTS.toolchain);
  const [requires, setRequires] = useState(DEFAULT_REQUIRES);
  const [replaces, setReplaces] = useState(DEFAULT_REPLACES);
  const [nextId, setNextId] = useState(10);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildGoMod({
        modulePath,
        goVersion,
        toolchain,
        requires: requires.filter((row) => row.path.trim()),
        replaces: replaces.filter((row) => row.from.trim() && row.to.trim()),
      }),
    [modulePath, goVersion, toolchain, requires, replaces],
  );

  const hasError = Boolean(result.error);

  const updateRequire = (id, patch) =>
    setRequires((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  const updateReplace = (id, patch) =>
    setReplaces((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const addRequire = () => {
    setRequires((rows) => [
      ...rows,
      { id: `r-${nextId}`, path: "", version: "v1.0.0", indirect: false },
    ]);
    setNextId((value) => value + 1);
  };
  const addReplace = () => {
    setReplaces((rows) => [
      ...rows,
      { id: `p-${nextId}`, from: "", fromVersion: "", to: "", toVersion: "" },
    ]);
    setNextId((value) => value + 1);
  };

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
    setModulePath(DEFAULTS.modulePath);
    setGoVersion(DEFAULTS.goVersion);
    setToolchain(DEFAULTS.toolchain);
    setRequires(DEFAULT_REQUIRES);
    setReplaces(DEFAULT_REPLACES);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileCode className="h-4 w-4" aria-hidden="true" />
          Go modules
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Go Mod Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Compose a go.mod file with the module, go, toolchain, require and replace directives —
          validated against the major-version suffix and canonical semver rules the go command
          enforces.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gm-path">
              Module path
            </label>
            <input
              id="gm-path"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              spellCheck="false"
              autoComplete="off"
              value={modulePath}
              onChange={(event) => setModulePath(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gm-go">
              go directive
            </label>
            <select
              id="gm-go"
              className={`mt-2 ${INPUT_CLASS}`}
              value={goVersion}
              onChange={(event) => setGoVersion(event.target.value)}
            >
              {GO_VERSIONS.map((version) => (
                <option key={version} value={version}>
                  {version}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gm-toolchain">
              toolchain (optional, Go 1.21+)
            </label>
            <input
              id="gm-toolchain"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              spellCheck="false"
              autoComplete="off"
              placeholder="go1.24.2"
              value={toolchain}
              onChange={(event) => setToolchain(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Requirements</h2>
          <button type="button" onClick={addRequire} className={SMALL_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add module
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          {requires.map((row, index) => (
            <div key={row.id} className="grid gap-3 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor={`gm-req-path-${row.id}`}>
                  Module {index + 1} path
                </label>
                <input
                  id={`gm-req-path-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  spellCheck="false"
                  autoComplete="off"
                  placeholder="github.com/user/repo"
                  value={row.path}
                  onChange={(event) => updateRequire(row.id, { path: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`gm-req-version-${row.id}`}>
                  Version
                </label>
                <input
                  id={`gm-req-version-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  spellCheck="false"
                  autoComplete="off"
                  placeholder="v1.2.3"
                  value={row.version}
                  onChange={(event) => updateRequire(row.id, { version: event.target.value })}
                />
              </div>
              <div className="flex items-end justify-between gap-3">
                <label
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold"
                  htmlFor={`gm-req-indirect-${row.id}`}
                >
                  <input
                    id={`gm-req-indirect-${row.id}`}
                    type="checkbox"
                    className="h-5 w-5 accent-[var(--primary)]"
                    checked={row.indirect}
                    onChange={(event) => updateRequire(row.id, { indirect: event.target.checked })}
                  />
                  {"// indirect"}
                </label>
                <button
                  type="button"
                  onClick={() => setRequires((rows) => rows.filter((item) => item.id !== row.id))}
                  aria-label={`Remove module ${index + 1}`}
                  className={SMALL_BTN}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Replace directives</h2>
          <button type="button" onClick={addReplace} className={SMALL_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add replace
          </button>
        </div>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Point a module at a local directory (leave the target version blank) or at another module
          path with a version.
        </p>

        <div className="mt-4 grid gap-4">
          {replaces.map((row, index) => (
            <div key={row.id} className="grid gap-3 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor={`gm-rep-from-${row.id}`}>
                  Replace {index + 1}: module
                </label>
                <input
                  id={`gm-rep-from-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  spellCheck="false"
                  autoComplete="off"
                  placeholder="github.com/acme/shared"
                  value={row.from}
                  onChange={(event) => updateReplace(row.id, { from: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`gm-rep-fromv-${row.id}`}>
                  Only this version (optional)
                </label>
                <input
                  id={`gm-rep-fromv-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  spellCheck="false"
                  autoComplete="off"
                  placeholder="v1.4.0"
                  value={row.fromVersion}
                  onChange={(event) => updateReplace(row.id, { fromVersion: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`gm-rep-to-${row.id}`}>
                  With
                </label>
                <input
                  id={`gm-rep-to-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  spellCheck="false"
                  autoComplete="off"
                  placeholder="../shared"
                  value={row.to}
                  onChange={(event) => updateReplace(row.id, { to: event.target.value })}
                />
              </div>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className={LABEL_CLASS} htmlFor={`gm-rep-tov-${row.id}`}>
                    Target version
                  </label>
                  <input
                    id={`gm-rep-tov-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    spellCheck="false"
                    autoComplete="off"
                    placeholder="blank for a local path"
                    value={row.toVersion}
                    onChange={(event) => updateReplace(row.id, { toVersion: event.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setReplaces((rows) => rows.filter((item) => item.id !== row.id))}
                  aria-label={`Remove replace ${index + 1}`}
                  className={SMALL_BTN}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              go.mod
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : `${result.directCount + result.indirectCount}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input to generate a file"
                : `requirements (${result.directCount} direct, ${result.indirectCount} indirect)`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generated go.mod file"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy go.mod"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {hasError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : (
          <>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Direct requirements", String(result.directCount)],
                ["Indirect requirements", String(result.indirectCount)],
                ["Replace directives", String(replaces.filter((row) => row.from.trim() && row.to.trim()).length)],
                ["Lines in file", String(result.lineCount)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)]">
              <pre className="p-4 text-sm leading-6">
                <code>{result.content}</code>
              </pre>
            </div>

            {result.warnings.length > 0 && (
              <ul className="mt-4 grid gap-2 text-sm text-[var(--muted-foreground)]">
                {result.warnings.map((warning) => (
                  <li key={warning} className="rounded-md bg-[var(--muted)] px-3 py-2">
                    {warning}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Run <code>go mod tidy</code> after pasting this file — it adds the indirect requirements your
        imports actually need and writes the matching go.sum entries.
      </p>
    </main>
  );
}

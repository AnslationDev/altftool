"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCog, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  DEFAULT_BINARY_PATTERNS,
  DEFAULT_LFS_PATTERNS,
  LINE_ENDING_POLICIES,
  generateGitattributes,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  policyId: "auto",
  windowsScripts: true,
  shellScripts: true,
  binaryPatterns: DEFAULT_BINARY_PATTERNS,
  lfsPatterns: DEFAULT_LFS_PATTERNS,
  exportIgnore: "/tests, /.github",
  generatedPatterns: "package-lock.json, pnpm-lock.yaml",
  diffDrivers: [],
};

export default function ToolHome() {
  const [policyId, setPolicyId] = useState(DEFAULTS.policyId);
  const [windowsScripts, setWindowsScripts] = useState(DEFAULTS.windowsScripts);
  const [shellScripts, setShellScripts] = useState(DEFAULTS.shellScripts);
  const [binaryPatterns, setBinaryPatterns] = useState(DEFAULTS.binaryPatterns);
  const [lfsPatterns, setLfsPatterns] = useState(DEFAULTS.lfsPatterns);
  const [exportIgnore, setExportIgnore] = useState(DEFAULTS.exportIgnore);
  const [generatedPatterns, setGeneratedPatterns] = useState(DEFAULTS.generatedPatterns);
  const [diffDrivers, setDiffDrivers] = useState(DEFAULTS.diffDrivers);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      generateGitattributes({
        policyId,
        windowsScripts,
        shellScripts,
        binaryPatterns,
        lfsPatterns,
        exportIgnore,
        generatedPatterns,
        diffDrivers,
      }),
    [
      policyId,
      windowsScripts,
      shellScripts,
      binaryPatterns,
      lfsPatterns,
      exportIgnore,
      generatedPatterns,
      diffDrivers,
    ],
  );

  const hasError = Boolean(result.error);

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
    setPolicyId(DEFAULTS.policyId);
    setWindowsScripts(DEFAULTS.windowsScripts);
    setShellScripts(DEFAULTS.shellScripts);
    setBinaryPatterns(DEFAULTS.binaryPatterns);
    setLfsPatterns(DEFAULTS.lfsPatterns);
    setExportIgnore(DEFAULTS.exportIgnore);
    setGeneratedPatterns(DEFAULTS.generatedPatterns);
    setDiffDrivers(DEFAULTS.diffDrivers.map((d) => ({ ...d })));
    setCopied(false);
  };

  const updateDriver = (index, key, value) => {
    setDiffDrivers((prev) => prev.map((d, i) => (i === index ? { ...d, [key]: value } : d)));
  };
  const addDriver = () => setDiffDrivers((prev) => [...prev, { pattern: "", driver: "" }]);
  const removeDriver = (index) => setDiffDrivers((prev) => prev.filter((_, i) => i !== index));

  const textFields = [
    {
      id: "ga-binary",
      label: "Binary patterns (marked `binary`)",
      hint: "Comma separated. Stops git normalizing, diffing or merging these files.",
      value: binaryPatterns,
      set: setBinaryPatterns,
    },
    {
      id: "ga-lfs",
      label: "Git LFS patterns",
      hint: "Each becomes `filter=lfs diff=lfs merge=lfs -text` — what `git lfs track` writes.",
      value: lfsPatterns,
      set: setLfsPatterns,
    },
    {
      id: "ga-export",
      label: "export-ignore paths",
      hint: "Left out of `git archive` exports (GitHub release tarballs and Download ZIP).",
      value: exportIgnore,
      set: setExportIgnore,
    },
    {
      id: "ga-generated",
      label: "linguist-generated patterns",
      hint: "Collapsed in GitHub pull-request diffs and excluded from language stats.",
      value: generatedPatterns,
      set: setGeneratedPatterns,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileCog className="h-4 w-4" aria-hidden="true" />
          Git workflow
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Gitattributes Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a .gitattributes file covering line-ending normalization, binary marking, Git LFS
          tracking, export-ignore and custom diff drivers — using the exact attribute syntax from
          the git documentation.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="ga-policy">
            Line-ending policy
          </label>
          <select
            id="ga-policy"
            className={`mt-2 ${INPUT_CLASS}`}
            value={policyId}
            onChange={(event) => setPolicyId(event.target.value)}
          >
            {LINE_ENDING_POLICIES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 grid gap-1 sm:grid-cols-2">
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="ga-win"
          >
            <input
              id="ga-win"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={windowsScripts}
              onChange={(event) => setWindowsScripts(event.target.checked)}
            />
            Keep .bat / .cmd / .ps1 as CRLF
          </label>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="ga-sh"
          >
            <input
              id="ga-sh"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={shellScripts}
              onChange={(event) => setShellScripts(event.target.checked)}
            />
            Force .sh scripts to LF
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {textFields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
              <p className={HINT_CLASS}>{field.hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-sm font-semibold">Custom diff drivers (pattern → driver name)</p>
          {diffDrivers.map((row, index) => (
            <div key={index} className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <div>
                <label className="sr-only" htmlFor={`ga-driver-pattern-${index}`}>
                  Pattern for diff driver {index + 1}
                </label>
                <input
                  id={`ga-driver-pattern-${index}`}
                  className={INPUT_CLASS}
                  type="text"
                  placeholder="*.ipynb"
                  value={row.pattern}
                  onChange={(event) => updateDriver(index, "pattern", event.target.value)}
                />
              </div>
              <div>
                <label className="sr-only" htmlFor={`ga-driver-name-${index}`}>
                  Driver name for diff driver {index + 1}
                </label>
                <input
                  id={`ga-driver-name-${index}`}
                  className={INPUT_CLASS}
                  type="text"
                  placeholder="jupyternotebook"
                  value={row.driver}
                  onChange={(event) => updateDriver(index, "driver", event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeDriver(index)}
                aria-label={`Remove diff driver row ${index + 1}`}
                className={`${GHOST_BTN} px-3`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
          <button type="button" onClick={addDriver} className={`${GHOST_BTN} mt-2`}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add diff driver
          </button>
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
              Attribute rules generated
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.ruleCount}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated .gitattributes file"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy file"}
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
            <dt className="text-[var(--muted-foreground)]">Sections</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : result.sections.length}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Total lines</dt>
            <dd className="text-right font-semibold">{hasError ? DASH : result.lineCount}</dd>
          </div>
        </dl>

        {!hasError ? (
          <>
            <h2 className="mt-5 font-mono text-sm font-semibold">.gitattributes</h2>
            <pre className="mt-2 overflow-x-auto rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5 text-[var(--foreground)]">
              <code>{result.content}</code>
            </pre>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              {result.renormalizeHint}
            </p>
          </>
        ) : null}
      </section>
    </main>
  );
}

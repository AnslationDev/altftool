"use client";

import { useMemo, useState } from "react";
import { Archive, Check, Copy, RotateCcw } from "lucide-react";
import {
  COMPRESSIONS,
  MODES,
  buildTarCommand,
  getCompression,
  toList,
} from "../lib";

const DEFAULTS = {
  mode: "create",
  archive: "backup.tar.gz",
  sources: "www\nlogs",
  compression: "auto",
  changeDir: "/var",
  excludes: "*.log\nnode_modules",
  stripComponents: "0",
  verbose: true,
  preservePermissions: false,
  keepOldFiles: false,
  followSymlinks: false,
  sparse: false,
  showProgress: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [archive, setArchive] = useState(DEFAULTS.archive);
  const [sources, setSources] = useState(DEFAULTS.sources);
  const [compression, setCompression] = useState(DEFAULTS.compression);
  const [changeDir, setChangeDir] = useState(DEFAULTS.changeDir);
  const [excludes, setExcludes] = useState(DEFAULTS.excludes);
  const [stripComponents, setStripComponents] = useState(DEFAULTS.stripComponents);
  const [verbose, setVerbose] = useState(DEFAULTS.verbose);
  const [preservePermissions, setPreservePermissions] = useState(DEFAULTS.preservePermissions);
  const [keepOldFiles, setKeepOldFiles] = useState(DEFAULTS.keepOldFiles);
  const [followSymlinks, setFollowSymlinks] = useState(DEFAULTS.followSymlinks);
  const [sparse, setSparse] = useState(DEFAULTS.sparse);
  const [showProgress, setShowProgress] = useState(DEFAULTS.showProgress);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildTarCommand({
        mode,
        archive,
        sources: toList(sources),
        compression,
        changeDir,
        excludes: toList(excludes),
        stripComponents: Number(stripComponents),
        verbose,
        preservePermissions,
        keepOldFiles,
        followSymlinks,
        sparse,
        showProgress,
      }),
    [
      mode,
      archive,
      sources,
      compression,
      changeDir,
      excludes,
      stripComponents,
      verbose,
      preservePermissions,
      keepOldFiles,
      followSymlinks,
      sparse,
      showProgress,
    ],
  );

  const copyResult = async () => {
    if (!result.command) return;
    try {
      await navigator.clipboard.writeText(result.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setMode(DEFAULTS.mode);
    setArchive(DEFAULTS.archive);
    setSources(DEFAULTS.sources);
    setCompression(DEFAULTS.compression);
    setChangeDir(DEFAULTS.changeDir);
    setExcludes(DEFAULTS.excludes);
    setStripComponents(DEFAULTS.stripComponents);
    setVerbose(DEFAULTS.verbose);
    setPreservePermissions(DEFAULTS.preservePermissions);
    setKeepOldFiles(DEFAULTS.keepOldFiles);
    setFollowSymlinks(DEFAULTS.followSymlinks);
    setSparse(DEFAULTS.sparse);
    setShowProgress(DEFAULTS.showProgress);
    setCopied(false);
  };

  const toggles = [
    { id: "tar-verbose", label: "Verbose (-v)", value: verbose, set: setVerbose, when: "all" },
    {
      id: "tar-progress",
      label: "Progress dots (--checkpoint)",
      value: showProgress,
      set: setShowProgress,
      when: "all",
    },
    {
      id: "tar-preserve",
      label: "Preserve permissions (-p)",
      value: preservePermissions,
      set: setPreservePermissions,
      when: "extract",
    },
    {
      id: "tar-keep",
      label: "Never overwrite (-k)",
      value: keepOldFiles,
      set: setKeepOldFiles,
      when: "extract",
    },
    {
      id: "tar-follow",
      label: "Follow symlinks (-h)",
      value: followSymlinks,
      set: setFollowSymlinks,
      when: "create",
    },
    { id: "tar-sparse", label: "Sparse files (-S)", value: sparse, set: setSparse, when: "create" },
  ].filter((item) => item.when === "all" || item.when === mode);

  const activeCompression = getCompression(result.compression);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Archive className="h-4 w-4" aria-hidden="true" />
          Linux admin
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Tar Command Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a mode, a compression filter and the paths you care about. The exact GNU tar command
          is assembled with correct flag order and POSIX-safe quoting, with each flag explained.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">Mode</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {MODES.map((item) => (
              <label
                key={item.id}
                htmlFor={`tar-mode-${item.id}`}
                className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                  mode === item.id
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)]"
                }`}
              >
                <input
                  id={`tar-mode-${item.id}`}
                  type="radio"
                  name="tar-mode"
                  className="accent-[var(--primary)]"
                  checked={mode === item.id}
                  onChange={() => setMode(item.id)}
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tar-archive">
              Archive file
            </label>
            <input
              id="tar-archive"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={archive}
              onChange={(event) => setArchive(event.target.value)}
            />
            <p className={HINT_CLASS}>The extension decides the filter when compression is Auto.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tar-compression">
              Compression
            </label>
            <select
              id="tar-compression"
              className={`mt-2 ${INPUT_CLASS}`}
              value={compression}
              onChange={(event) => setCompression(event.target.value)}
            >
              <option value="auto">Auto (from file extension)</option>
              {COMPRESSIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {activeCompression ? <p className={HINT_CLASS}>{activeCompression.note}</p> : null}
          </div>

          {mode !== "extract" ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="tar-sources">
                {mode === "create" ? "Paths to archive (one per line)" : "Members to list (optional)"}
              </label>
              <textarea
                id="tar-sources"
                className={`mt-2 ${AREA_CLASS}`}
                rows={3}
                spellCheck={false}
                value={sources}
                onChange={(event) => setSources(event.target.value)}
              />
            </div>
          ) : null}

          <div>
            <label className={LABEL_CLASS} htmlFor="tar-cd">
              {mode === "extract" ? "Extract into directory (-C)" : "Run from directory (-C)"}
            </label>
            <input
              id="tar-cd"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="leave blank for current directory"
              value={changeDir}
              onChange={(event) => setChangeDir(event.target.value)}
            />
          </div>

          {mode === "extract" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="tar-strip">
                Strip leading path components
              </label>
              <input
                id="tar-strip"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="20"
                step="1"
                value={stripComponents}
                onChange={(event) => setStripComponents(event.target.value)}
              />
              <p className={HINT_CLASS}>Use 1 to drop the wrapper folder inside a release tarball.</p>
            </div>
          ) : null}

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tar-excludes">
              Exclude patterns (one per line)
            </label>
            <textarea
              id="tar-excludes"
              className={`mt-2 ${AREA_CLASS}`}
              rows={2}
              spellCheck={false}
              value={excludes}
              onChange={(event) => setExcludes(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {toggles.map((item) => (
            <label
              key={item.id}
              htmlFor={item.id}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              <input
                id={item.id}
                type="checkbox"
                className="accent-[var(--primary)]"
                checked={item.value}
                onChange={(event) => item.set(event.target.checked)}
              />
              {item.label}
            </label>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Your tar command
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generated tar command"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy command"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {result.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : null}

        <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-4">
          <code className="block whitespace-pre font-mono text-sm font-semibold text-[var(--primary)]">
            {result.error ? "—" : result.command}
          </code>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Mode</dt>
            <dd className="text-right font-semibold">{result.error ? "—" : result.mode}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Compression filter</dt>
            <dd className="text-right font-semibold">{result.error ? "—" : result.compression}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Recommended extension</dt>
            <dd className="text-right font-semibold">{result.error ? "—" : result.archiveExtensionHint}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Paths listed</dt>
            <dd className="text-right font-semibold">{result.error ? "—" : result.memberCount}</dd>
          </div>
        </dl>
      </section>

      {!result.error && result.flags.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What each flag does</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Flag</th>
                  <th scope="col" className="py-2 font-semibold">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {result.flags.map(([flag, meaning]) => (
                  <tr key={flag} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-mono font-semibold text-[var(--primary)]">{flag}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!result.error && result.warnings.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Before you run it</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--primary)]">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Generated for GNU tar. bsdtar on macOS accepts the same short options but ignores a few GNU
        extensions — check <code className="font-mono">tar --version</code> if a flag is rejected.
      </p>
    </main>
  );
}

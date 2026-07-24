"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  FileCode2,
  FileJson2,
  Info,
  PackageCheck,
  RotateCcw,
  Search,
  Upload,
} from "lucide-react";

import {
  buildInstallScriptReport,
  inspectPackageInstallScripts,
  installScriptInspectorLimits,
} from "../lib/installScriptInspector.mjs";

const SAMPLE = JSON.stringify(
  {
    name: "sample-package",
    version: "1.0.0",
    scripts: {
      preinstall: "node scripts/check-platform.js",
      install: "node-gyp rebuild",
      postinstall:
        "node scripts/fetch-fixture.js https://example.invalid/fixture.json",
      test: "node --test",
    },
  },
  null,
  2,
);

const LEVEL_STYLE = {
  "multiple-cues": {
    label: "Multiple review cues",
    className: "border-warning bg-warning-soft",
    badge: "bg-warning-soft text-foreground",
    Icon: AlertTriangle,
  },
  cue: {
    label: "Review cue",
    className: "border-border bg-surface",
    badge: "bg-primary-soft text-primary",
    Icon: Info,
  },
  "no-pattern-cue": {
    label: "No configured pattern cue",
    className: "border-border bg-surface",
    badge: "bg-success-soft text-success",
    Icon: CheckCircle2,
  },
};

function downloadJson(value) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "package-install-script-inert-review.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function PackageInstallScriptInspector() {
  const [source, setSource] = useState("");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [installOnly, setInstallOnly] = useState(true);

  const visibleScripts = useMemo(() => {
    if (!result) return [];
    return installOnly ? result.installScripts : result.scripts;
  }, [installOnly, result]);

  function inspect() {
    try {
      setResult(inspectPackageInstallScripts(source));
      setError("");
    } catch (inspectionError) {
      setResult(null);
      setError(
        inspectionError instanceof Error
          ? inspectionError.message
          : "Unable to inspect the package scripts.",
      );
    }
  }

  async function loadFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > installScriptInspectorLimits.maxFileBytes) {
      setError(
        `File exceeds the ${installScriptInspectorLimits.maxFileBytes.toLocaleString("en-US")}-byte limit.`,
      );
      return;
    }
    setSource(await file.text());
    setFileName(file.name);
    setResult(null);
    setError("");
  }

  function reset() {
    setSource("");
    setFileName("");
    setResult(null);
    setError("");
    setInstallOnly(true);
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-pill bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              <PackageCheck className="h-4 w-4" aria-hidden="true" />
              Inert local inspection
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground">
              Package Install-Script Inspector
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Read package.json script commands as plain text and surface
              evidence for manual review. This tool never runs a command or
              referenced file.
            </p>
          </div>
          <div className="rounded-lg border border-warning bg-warning-soft p-4 text-sm leading-relaxed text-foreground lg:max-w-sm">
            <p className="font-bold">Cues are not a verdict</p>
            <p className="mt-1 text-muted-foreground">
              Common legitimate build scripts can match these patterns. A script
              with no match can still behave unexpectedly through referenced
              code, aliases, or runtime conditions.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                package.json
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Lockfiles are rejected because they usually omit command text.
              </p>
            </div>
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground focus-within:ring-2 focus-within:ring-primary">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Choose package.json
              <input
                className="sr-only"
                type="file"
                accept=".json,application/json"
                onChange={loadFile}
              />
            </label>
          </div>
          {fileName ? (
            <p className="mt-3 text-xs font-semibold text-primary">
              Loaded: {fileName}
            </p>
          ) : null}
          <label
            className="mt-4 block text-sm font-bold text-foreground"
            htmlFor="script-json"
          >
            JSON source
          </label>
          <textarea
            id="script-json"
            className="mt-2 min-h-80 w-full resize-y rounded-lg border border-border bg-canvas p-4 font-mono text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            value={source}
            maxLength={installScriptInspectorLimits.maxSourceCharacters}
            spellCheck={false}
            onChange={(event) => {
              setSource(event.target.value);
              setFileName("");
              setResult(null);
              setError("");
            }}
            placeholder='{"scripts":{"install":"node-gyp rebuild"}}'
          />
          <div className="mt-2 flex justify-between gap-3 text-xs text-muted-foreground">
            <span>{source.length.toLocaleString("en-US")} characters</span>
            <span>
              Limit{" "}
              {installScriptInspectorLimits.maxSourceCharacters.toLocaleString(
                "en-US",
              )}
            </span>
          </div>
          {error ? (
            <div
              className="mt-4 flex gap-3 rounded-lg border border-danger bg-danger-soft p-4 text-sm text-foreground"
              role="alert"
            >
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-danger"
                aria-hidden="true"
              />
              <span>{error}</span>
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!source.trim()}
              onClick={inspect}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Inspect without running
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => {
                setSource(SAMPLE);
                setFileName("sample-package.json");
                setResult(null);
                setError("");
              }}
            >
              <FileJson2 className="h-4 w-4" aria-hidden="true" />
              Load safe sample
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={reset}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <aside className="space-y-4">
          {result ? (
            <>
              <section
                className="rounded-xl border border-border bg-surface p-5 shadow-sm"
                aria-live="polite"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Inert text analysis
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-foreground">
                      Script summary
                    </h2>
                  </div>
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    onClick={() =>
                      downloadJson(buildInstallScriptReport(result))
                    }
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download local JSON
                  </button>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    ["All scripts", result.counts.scripts],
                    ["Install lifecycle", result.counts.installLifecycle],
                    ["With cues", result.counts.scriptsWithCues],
                    ["No pattern cue", result.counts.scriptsWithoutPatternCues],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-border bg-surface-soft p-3"
                    >
                      <dt className="text-xs font-semibold text-muted-foreground">
                        {label}
                      </dt>
                      <dd className="mt-1 text-xl font-black text-foreground">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
                {result.truncated ? (
                  <p className="mt-4 rounded-lg border border-warning bg-warning-soft p-3 text-sm text-foreground">
                    Displayed analysis stopped at the configured script-count
                    limit.
                  </p>
                ) : null}
              </section>
              <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                <h2 className="text-lg font-bold text-foreground">
                  Interpret carefully
                </h2>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {result.limitations.map((limitation) => (
                    <li key={limitation} className="flex gap-2">
                      <Info
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          ) : (
            <section className="rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
              <FileCode2
                className="mx-auto h-10 w-10 text-primary"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-lg font-bold text-foreground">
                No inspection yet
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Paste package.json to review commands without invoking a shell.
              </p>
            </section>
          )}
        </aside>
      </section>

      {result ? (
        <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Script evidence
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Install lifecycle includes install hooks plus prepare and
                packaging hooks that npm may run in lifecycle contexts.
              </p>
            </div>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface-soft px-4 py-2 text-sm font-bold text-foreground">
              <input
                className="h-4 w-4 accent-primary"
                type="checkbox"
                checked={installOnly}
                onChange={(event) => setInstallOnly(event.target.checked)}
              />
              Show install-lifecycle names only
            </label>
          </div>

          {visibleScripts.length ? (
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {visibleScripts.map((script) => {
                const style = LEVEL_STYLE[script.reviewLevel];
                const Icon = style.Icon;
                return (
                  <article
                    key={script.name}
                    className={`rounded-xl border p-4 ${style.className}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-mono text-base font-bold text-foreground">
                        {script.name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-bold ${style.badge}`}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {style.label}
                      </span>
                    </div>
                    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-canvas p-3 text-xs leading-relaxed text-foreground">
                      {script.command}
                    </pre>
                    {script.cues.length ? (
                      <ul className="mt-3 space-y-2">
                        {script.cues.map((cue) => (
                          <li
                            key={cue.category}
                            className="rounded-lg border border-border bg-surface p-3 text-sm"
                          >
                            <p className="font-bold text-foreground">
                              {cue.label}
                            </p>
                            <code className="mt-1 block break-words text-xs text-muted-foreground">
                              {cue.evidence}
                            </code>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        No configured text pattern matched. This is not a safety
                        result.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mt-5 rounded-lg border border-border bg-surface-soft p-4 text-sm text-muted-foreground">
              No script names in the selected view.
            </p>
          )}
        </section>
      ) : null}

      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">
          Primary references
        </h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <a
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-primary hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            href="https://docs.npmjs.com/cli/using-npm/scripts/"
            target="_blank"
            rel="noreferrer"
          >
            npm scripts and lifecycle docs
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-primary hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            href="https://docs.npmjs.com/cli/v11/configuring-npm/package-json#scripts"
            target="_blank"
            rel="noreferrer"
          >
            package.json scripts field
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  );
}

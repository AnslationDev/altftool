"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Download,
  ExternalLink,
  FileJson2,
  Info,
  RotateCcw,
  Scale,
  Search,
  Upload,
} from "lucide-react";

import {
  npmInventoryLimits,
  parseNpmSupplyChainInventory,
} from "../../_shared/npmSupplyChainInventory.mjs";
import {
  analyzeDependencyLicenses,
  buildLicenseReport,
} from "../lib/licenseScanner.mjs";

const SAMPLE = JSON.stringify(
  {
    name: "sample-app",
    lockfileVersion: 3,
    packages: {
      "": {
        name: "sample-app",
        version: "1.0.0",
        license: "MIT",
        dependencies: { alpha: "^2.0.0", beta: "^3.0.0" },
      },
      "node_modules/alpha": {
        version: "2.1.0",
        license: "Apache-2.0",
      },
      "node_modules/beta": {
        version: "3.0.1",
        license: "AGPL-3.0-only",
      },
      "node_modules/gamma": { version: "4.2.0" },
    },
  },
  null,
  2,
);

const STATUS_STYLE = {
  declared: {
    label: "Declared text",
    className: "bg-surface-soft text-foreground",
    Icon: Info,
  },
  review: {
    label: "Review cue",
    className: "bg-warning-soft text-foreground",
    Icon: AlertTriangle,
  },
  missing: {
    label: "Missing field",
    className: "bg-danger-soft text-danger",
    Icon: AlertTriangle,
  },
  unknown: {
    label: "Unresolved declaration",
    className: "bg-surface-soft text-foreground",
    Icon: Info,
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
  anchor.download = "dependency-license-declared-metadata-report.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function DependencyLicenseScanner() {
  const [source, setSource] = useState("");
  const [fileName, setFileName] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const fileReadGeneration = useRef(0);

  const visibleFindings = useMemo(() => {
    if (!analysis) return [];
    const matching =
      filter === "all"
        ? analysis.findings
        : analysis.findings.filter((finding) => finding.status === filter);
    return matching.slice(0, 300);
  }, [analysis, filter]);

  function runScan() {
    fileReadGeneration.current += 1;
    try {
      const inventory = parseNpmSupplyChainInventory(source, { fileName });
      setAnalysis(analyzeDependencyLicenses(inventory));
      setError("");
    } catch (scanError) {
      setAnalysis(null);
      setError(
        scanError instanceof Error
          ? scanError.message
          : "Unable to review the JSON.",
      );
    }
  }

  async function loadFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const generation = fileReadGeneration.current + 1;
    fileReadGeneration.current = generation;
    if (file.size > npmInventoryLimits.maxFileBytes) {
      setAnalysis(null);
      setError(
        `File exceeds the ${npmInventoryLimits.maxFileBytes.toLocaleString("en-US")}-byte limit.`,
      );
      return;
    }
    try {
      const text = await file.text();
      if (fileReadGeneration.current !== generation) return;
      setSource(text);
      setFileName(file.name);
      setAnalysis(null);
      setError("");
    } catch {
      if (fileReadGeneration.current !== generation) return;
      setAnalysis(null);
      setError("The selected JSON file could not be read.");
    }
  }

  function reset() {
    fileReadGeneration.current += 1;
    setSource("");
    setFileName("");
    setAnalysis(null);
    setError("");
    setFilter("all");
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-pill bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              <Scale className="h-4 w-4" aria-hidden="true" />
              Local declared-metadata review
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground">
              Dependency License Scanner
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Inspect license fields already present in npm manifest or lockfile
              JSON. Nothing is uploaded, looked up, or legally interpreted.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface-soft p-4 text-sm text-foreground lg:max-w-sm">
            <p className="font-bold">Important limitation</p>
            <p className="mt-1 leading-relaxed text-muted-foreground">
              Text cues help prioritize human review. They do not validate SPDX,
              decide compatibility, or replace the package&apos;s distributed
              license files and legal advice.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Manifest or lockfile JSON
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Supports package.json, package-lock.json, and
                npm-shrinkwrap.json.
              </p>
            </div>
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground focus-within:ring-2 focus-within:ring-primary">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Choose JSON
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
            htmlFor="license-json"
          >
            JSON source
          </label>
          <textarea
            id="license-json"
            className="mt-2 min-h-80 w-full resize-y rounded-lg border border-border bg-canvas p-4 font-mono text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            value={source}
            maxLength={npmInventoryLimits.maxSourceCharacters}
            spellCheck={false}
            onChange={(event) => {
              fileReadGeneration.current += 1;
              setSource(event.target.value);
              setFileName("");
              setAnalysis(null);
              setError("");
            }}
            placeholder="Paste package.json or package-lock.json…"
          />
          <div className="mt-2 flex justify-between gap-3 text-xs text-muted-foreground">
            <span>{source.length.toLocaleString("en-US")} characters</span>
            <span>
              Limit{" "}
              {npmInventoryLimits.maxSourceCharacters.toLocaleString("en-US")}
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
              onClick={runScan}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Review declared licenses
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => {
                fileReadGeneration.current += 1;
                setSource(SAMPLE);
                setFileName("sample-package-lock.json");
                setAnalysis(null);
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
          {analysis ? (
            <>
              <section
                className="rounded-xl border border-border bg-surface p-5 shadow-sm"
                aria-live="polite"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Parsed {analysis.sourceKind}
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-foreground">
                      Declared metadata summary
                    </h2>
                  </div>
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    onClick={() => downloadJson(buildLicenseReport(analysis))}
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download local JSON
                  </button>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["Total", analysis.counts.total],
                    ["Declared text", analysis.counts.declared],
                    ["Review cues", analysis.counts.review],
                    ["Unresolved", analysis.counts.unknown],
                    ["Missing", analysis.counts.missing],
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
                {analysis.warnings.map((warning) => (
                  <p
                    key={warning}
                    className="mt-3 text-sm leading-relaxed text-muted-foreground"
                  >
                    {warning}
                  </p>
                ))}
              </section>

              <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                <h2 className="text-lg font-bold text-foreground">
                  What this result means
                </h2>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {analysis.limitations.map((limitation) => (
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
              <Scale
                className="mx-auto h-10 w-10 text-primary"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-lg font-bold text-foreground">
                No scan yet
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Add local npm JSON, then review only the metadata that document
                actually contains.
              </p>
            </section>
          )}
        </aside>
      </section>

      {analysis ? (
        <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Dependency findings
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Showing up to 300 rows in the browser; the local JSON export
                includes all parsed rows.
              </p>
            </div>
            <label className="text-sm font-bold text-foreground">
              Filter
              <select
                className="ml-2 min-h-11 rounded-lg border border-border bg-canvas px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option value="all">All</option>
                <option value="missing">Missing field</option>
                <option value="review">Review cue</option>
                <option value="unknown">Unresolved declaration</option>
                <option value="declared">Declared text</option>
              </select>
            </label>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-3xl border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="bg-surface-soft text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="border-b border-border p-3">Package</th>
                  <th className="border-b border-border p-3">
                    Resolved / range
                  </th>
                  <th className="border-b border-border p-3">
                    Declared license
                  </th>
                  <th className="border-b border-border p-3">Result</th>
                </tr>
              </thead>
              <tbody>
                {visibleFindings.map((finding, index) => {
                  const style = STATUS_STYLE[finding.status];
                  const Icon = style.Icon;
                  return (
                    <tr
                      key={`${finding.name}-${finding.version}-${index}`}
                      className="text-foreground"
                    >
                      <td className="border-b border-border p-3">
                        <span className="font-semibold">{finding.name}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {finding.relationship} · {finding.scope} ·{" "}
                          {finding.occurrenceCount}{" "}
                          {finding.occurrenceCount === 1
                            ? "occurrence"
                            : "occurrences"}
                        </span>
                        {finding.aliases.length ? (
                          <span className="mt-1 block text-xs text-muted-foreground">
                            Installed as {finding.aliases.join(", ")}
                          </span>
                        ) : null}
                      </td>
                      <td className="border-b border-border p-3 font-mono text-xs">
                        {finding.version ||
                          finding.declaredRange ||
                          "Not present"}
                      </td>
                      <td className="border-b border-border p-3 font-mono text-xs">
                        {finding.license || "Not present in JSON"}
                      </td>
                      <td className="border-b border-border p-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-bold ${style.className}`}
                        >
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                          {style.label}
                        </span>
                        {finding.cues.map((cue) => (
                          <span
                            key={cue.id}
                            className="mt-1 block text-xs text-muted-foreground"
                          >
                            {cue.label}
                          </span>
                        ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">
          Primary references
        </h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <a
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-primary hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            href="https://docs.npmjs.com/cli/v11/configuring-npm/package-json#license"
            target="_blank"
            rel="noreferrer"
          >
            npm package.json license field
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-primary hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            href="https://spdx.dev/learn/handling-license-info/"
            target="_blank"
            rel="noreferrer"
          >
            SPDX license information
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Boxes, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import { DEFAULT_PRIVATE_ASSETS, buildPackageReferences } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const SMALL_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_LABEL =
  "inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-[var(--foreground)]";

const DEFAULT_PACKAGES = [
  { id: "p1", pkg: "Newtonsoft.Json", version: "13.0.3", privateAssets: "", includeAssets: "", excludeAssets: "" },
  { id: "p2", pkg: "Serilog.AspNetCore", version: "[8.0.0,9.0.0)", privateAssets: "", includeAssets: "", excludeAssets: "" },
  { id: "p3", pkg: "StyleCop.Analyzers", version: "1.2.0-beta.556", privateAssets: "all", includeAssets: "", excludeAssets: "" },
];

export default function ToolHome() {
  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  const [centralManagement, setCentralManagement] = useState(false);
  const [transitivePinning, setTransitivePinning] = useState(false);
  const [indentSpaces, setIndentSpaces] = useState("2");
  const [nextId, setNextId] = useState(10);
  const [copied, setCopied] = useState("");

  const result = useMemo(
    () =>
      buildPackageReferences({
        packages: packages
          .filter((row) => row.pkg.trim())
          .map((row) => ({
            id: row.pkg,
            version: row.version,
            privateAssets: row.privateAssets,
            includeAssets: row.includeAssets,
            excludeAssets: row.excludeAssets,
          })),
        centralManagement,
        transitivePinning,
        indentSpaces: Number(indentSpaces),
      }),
    [packages, centralManagement, transitivePinning, indentSpaces],
  );
  const hasError = Boolean(result.error);

  const updateRow = (id, patch) =>
    setPackages((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const addRow = () => {
    setPackages((rows) => [
      ...rows,
      { id: `p-${nextId}`, pkg: "", version: "1.0.0", privateAssets: "", includeAssets: "", excludeAssets: "" },
    ]);
    setNextId((value) => value + 1);
  };

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setPackages(DEFAULT_PACKAGES);
    setCentralManagement(false);
    setTransitivePinning(false);
    setIndentSpaces("2");
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Boxes className="h-4 w-4" aria-hidden="true" />
          .NET / NuGet
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          NuGet Package Reference Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Compose PackageReference items with version ranges and asset flags, switch on Central
          Package Management, and read back in plain English what each range actually allows.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Output options</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ng-indent">
              Indent (spaces)
            </label>
            <input
              id="ng-indent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="8"
              value={indentSpaces}
              onChange={(event) => setIndentSpaces(event.target.value)}
            />
          </div>
          <div className="grid content-end gap-1">
            <label className={CHECK_LABEL} htmlFor="ng-cpm">
              <input
                id="ng-cpm"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={centralManagement}
                onChange={(event) => setCentralManagement(event.target.checked)}
              />
              Central Package Management
            </label>
            <label className={CHECK_LABEL} htmlFor="ng-pin">
              <input
                id="ng-pin"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                disabled={!centralManagement}
                checked={transitivePinning}
                onChange={(event) => setTransitivePinning(event.target.checked)}
              />
              Pin transitive dependencies
            </label>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Packages</h2>
          <button type="button" onClick={addRow} className={SMALL_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add package
          </button>
        </div>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Leave the asset fields blank to accept the NuGet defaults (IncludeAssets=all,
          ExcludeAssets=none, PrivateAssets={DEFAULT_PRIVATE_ASSETS}).
        </p>

        <div className="mt-4 grid gap-4">
          {packages.map((row, index) => (
            <div key={row.id} className="grid gap-3 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor={`ng-id-${row.id}`}>
                  Package {index + 1} id
                </label>
                <input
                  id={`ng-id-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  spellCheck="false"
                  autoComplete="off"
                  value={row.pkg}
                  onChange={(event) => updateRow(row.id, { pkg: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`ng-version-${row.id}`}>
                  Version or range
                </label>
                <input
                  id={`ng-version-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  spellCheck="false"
                  autoComplete="off"
                  placeholder="[1.0,2.0)"
                  value={row.version}
                  onChange={(event) => updateRow(row.id, { version: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`ng-private-${row.id}`}>
                  PrivateAssets
                </label>
                <input
                  id={`ng-private-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  spellCheck="false"
                  autoComplete="off"
                  placeholder="all"
                  value={row.privateAssets}
                  onChange={(event) => updateRow(row.id, { privateAssets: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`ng-include-${row.id}`}>
                  IncludeAssets
                </label>
                <input
                  id={`ng-include-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  spellCheck="false"
                  autoComplete="off"
                  placeholder="compile;runtime"
                  value={row.includeAssets}
                  onChange={(event) => updateRow(row.id, { includeAssets: event.target.value })}
                />
              </div>
              <div className="flex items-end gap-3 sm:col-span-2">
                <div className="flex-1">
                  <label className={LABEL_CLASS} htmlFor={`ng-exclude-${row.id}`}>
                    ExcludeAssets
                  </label>
                  <input
                    id={`ng-exclude-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    spellCheck="false"
                    autoComplete="off"
                    placeholder="contentFiles"
                    value={row.excludeAssets}
                    onChange={(event) => updateRow(row.id, { excludeAssets: event.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setPackages((rows) => rows.filter((item) => item.id !== row.id))}
                  aria-label={`Remove package ${index + 1}`}
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
              PackageReference items
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : result.packageCount}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input to generate XML"
                : centralManagement
                  ? "versions live in Directory.Packages.props"
                  : "versions inline in the project file"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy(result.projectXml, "project")}
              aria-label="Copy the PackageReference item group"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied === "project" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "project" ? "Copied!" : "Copy ItemGroup"}
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
            <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)]">
              <pre className="p-4 text-sm leading-6">
                <code>{result.projectXml}</code>
              </pre>
            </div>

            {result.propsXml && (
              <div className="mt-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">Directory.Packages.props</h3>
                  <button
                    type="button"
                    onClick={() => copy(result.propsXml, "props")}
                    aria-label="Copy Directory.Packages.props"
                    className={SMALL_BTN}
                  >
                    {copied === "props" ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    )}
                    {copied === "props" ? "Copied!" : "Copy props"}
                  </button>
                </div>
                <div className="mt-2 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)]">
                  <pre className="p-4 text-sm leading-6">
                    <code>{result.propsXml}</code>
                  </pre>
                </div>
              </div>
            )}

            <div className="mt-5">
              <h3 className="text-sm font-semibold">What each version range allows</h3>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">Package</th>
                      <th scope="col" className="py-2 pr-3 font-semibold">Range</th>
                      <th scope="col" className="py-2 font-semibold">Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row) => (
                      <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 font-semibold">{row.id}</td>
                        <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.range.notation}</td>
                        <td className="py-2">{row.range.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
        Paste the ItemGroup into your .csproj. With Central Package Management on, put
        Directory.Packages.props at the repository root so every project inherits the same versions.
      </p>
    </main>
  );
}

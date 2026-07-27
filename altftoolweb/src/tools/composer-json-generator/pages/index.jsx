"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Package, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  LICENSES,
  PACKAGE_TYPES,
  PHP_CONSTRAINTS,
  STABILITIES,
  buildComposerJson,
} from "../lib";

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

const DEFAULTS = {
  name: "acme/widget",
  description: "Reusable widget components for PHP applications.",
  type: "library",
  license: "MIT",
  authorName: "",
  authorEmail: "",
  keywords: "widget, php",
  homepage: "",
  phpConstraint: "^8.2",
  namespace: "Acme\\Widget\\",
  sourceDir: "src",
  testNamespace: "Acme\\Widget\\Tests\\",
  testDir: "tests",
  minimumStability: "stable",
  preferStable: true,
  sortPackages: true,
  optimizeAutoloader: false,
};

const DEFAULT_REQUIRES = [
  { id: "q1", name: "symfony/console", constraint: "^7.1" },
  { id: "q2", name: "ext-json", constraint: "*" },
];
const DEFAULT_DEV = [
  { id: "d1", name: "phpunit/phpunit", constraint: "^11.0" },
  { id: "d2", name: "friendsofphp/php-cs-fixer", constraint: "^3.58" },
];
const DEFAULT_SCRIPTS = [
  { id: "s1", name: "test", command: "phpunit" },
  { id: "s2", name: "cs-fix", command: "php-cs-fixer fix" },
];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [requires, setRequires] = useState(DEFAULT_REQUIRES);
  const [devs, setDevs] = useState(DEFAULT_DEV);
  const [scripts, setScripts] = useState(DEFAULT_SCRIPTS);
  const [nextId, setNextId] = useState(10);
  const [copied, setCopied] = useState(false);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const result = useMemo(
    () =>
      buildComposerJson({
        ...form,
        requires: requires.filter((row) => row.name.trim()),
        requireDev: devs.filter((row) => row.name.trim()),
        scripts: scripts.filter((row) => row.name.trim() && row.command.trim()),
      }),
    [form, requires, devs, scripts],
  );
  const hasError = Boolean(result.error);

  const addRow = (setter, prefix, empty) => {
    setter((rows) => [...rows, { id: `${prefix}-${nextId}`, ...empty }]);
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
    setForm(DEFAULTS);
    setRequires(DEFAULT_REQUIRES);
    setDevs(DEFAULT_DEV);
    setScripts(DEFAULT_SCRIPTS);
    setCopied(false);
  };

  const renderPackageRows = (rows, setter, prefix, legend) => (
    <div className="mt-4 grid gap-3">
      {rows.map((row, index) => (
        <div key={row.id} className="grid gap-3 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor={`cj-${prefix}-name-${row.id}`}>
              {legend} {index + 1} package
            </label>
            <input
              id={`cj-${prefix}-name-${row.id}`}
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              spellCheck="false"
              autoComplete="off"
              placeholder="vendor/package"
              value={row.name}
              onChange={(event) =>
                setter((items) =>
                  items.map((item) => (item.id === row.id ? { ...item, name: event.target.value } : item)),
                )
              }
            />
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className={LABEL_CLASS} htmlFor={`cj-${prefix}-constraint-${row.id}`}>
                Constraint
              </label>
              <input
                id={`cj-${prefix}-constraint-${row.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                spellCheck="false"
                autoComplete="off"
                placeholder="^1.0"
                value={row.constraint}
                onChange={(event) =>
                  setter((items) =>
                    items.map((item) =>
                      item.id === row.id ? { ...item, constraint: event.target.value } : item,
                    ),
                  )
                }
              />
            </div>
            <button
              type="button"
              onClick={() => setter((items) => items.filter((item) => item.id !== row.id))}
              aria-label={`Remove ${legend} ${index + 1}`}
              className={SMALL_BTN}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Package className="h-4 w-4" aria-hidden="true" />
          PHP / Composer
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Composer JSON Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Assemble a composer.json with PSR-4 autoloading, platform requirements, scripts and config —
          checked against the vendor/package naming pattern and constraint syntax Composer enforces.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Package</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cj-name">
              Name (vendor/package)
            </label>
            <input
              id="cj-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              spellCheck="false"
              autoComplete="off"
              value={form.name}
              onChange={(event) => set("name", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cj-type">
              Type
            </label>
            <select
              id="cj-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.type}
              onChange={(event) => set("type", event.target.value)}
            >
              {PACKAGE_TYPES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cj-description">
              Description
            </label>
            <input
              id="cj-description"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cj-license">
              License
            </label>
            <select
              id="cj-license"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.license}
              onChange={(event) => set("license", event.target.value)}
            >
              {LICENSES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cj-php">
              PHP requirement
            </label>
            <input
              id="cj-php"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              spellCheck="false"
              autoComplete="off"
              list="cj-php-options"
              value={form.phpConstraint}
              onChange={(event) => set("phpConstraint", event.target.value)}
            />
            <datalist id="cj-php-options">
              {PHP_CONSTRAINTS.map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cj-author">
              Author name (optional)
            </label>
            <input
              id="cj-author"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={form.authorName}
              onChange={(event) => set("authorName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cj-email">
              Author email (optional)
            </label>
            <input
              id="cj-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              autoComplete="off"
              value={form.authorEmail}
              onChange={(event) => set("authorEmail", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cj-keywords">
              Keywords (comma separated)
            </label>
            <input
              id="cj-keywords"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.keywords}
              onChange={(event) => set("keywords", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cj-homepage">
              Homepage (optional)
            </label>
            <input
              id="cj-homepage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="url"
              spellCheck="false"
              autoComplete="off"
              placeholder="https://example.com"
              value={form.homepage}
              onChange={(event) => set("homepage", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Autoloading</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cj-ns">
              PSR-4 namespace prefix
            </label>
            <input
              id="cj-ns"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              spellCheck="false"
              autoComplete="off"
              value={form.namespace}
              onChange={(event) => set("namespace", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cj-src">
              Source directory
            </label>
            <input
              id="cj-src"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              spellCheck="false"
              autoComplete="off"
              value={form.sourceDir}
              onChange={(event) => set("sourceDir", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cj-testns">
              Test namespace prefix
            </label>
            <input
              id="cj-testns"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              spellCheck="false"
              autoComplete="off"
              value={form.testNamespace}
              onChange={(event) => set("testNamespace", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cj-testdir">
              Test directory
            </label>
            <input
              id="cj-testdir"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              spellCheck="false"
              autoComplete="off"
              value={form.testDir}
              onChange={(event) => set("testDir", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cj-stability">
              minimum-stability
            </label>
            <select
              id="cj-stability"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.minimumStability}
              onChange={(event) => set("minimumStability", event.target.value)}
            >
              {STABILITIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="grid content-end gap-1">
            <label className={CHECK_LABEL} htmlFor="cj-prefer">
              <input
                id="cj-prefer"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={form.preferStable}
                onChange={(event) => set("preferStable", event.target.checked)}
              />
              prefer-stable
            </label>
            <label className={CHECK_LABEL} htmlFor="cj-sort">
              <input
                id="cj-sort"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={form.sortPackages}
                onChange={(event) => set("sortPackages", event.target.checked)}
              />
              config.sort-packages
            </label>
            <label className={CHECK_LABEL} htmlFor="cj-optimize">
              <input
                id="cj-optimize"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={form.optimizeAutoloader}
                onChange={(event) => set("optimizeAutoloader", event.target.checked)}
              />
              config.optimize-autoloader
            </label>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">require</h2>
          <button
            type="button"
            onClick={() => addRow(setRequires, "q", { name: "", constraint: "^1.0" })}
            className={SMALL_BTN}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add package
          </button>
        </div>
        {renderPackageRows(requires, setRequires, "req", "Require")}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">require-dev</h2>
          <button
            type="button"
            onClick={() => addRow(setDevs, "d", { name: "", constraint: "^1.0" })}
            className={SMALL_BTN}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add dev package
          </button>
        </div>
        {renderPackageRows(devs, setDevs, "dev", "Dev")}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">scripts</h2>
          <button
            type="button"
            onClick={() => addRow(setScripts, "s", { name: "", command: "" })}
            className={SMALL_BTN}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add script
          </button>
        </div>
        <div className="mt-4 grid gap-3">
          {scripts.map((row, index) => (
            <div key={row.id} className="grid gap-3 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor={`cj-script-name-${row.id}`}>
                  Script {index + 1} name
                </label>
                <input
                  id={`cj-script-name-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  spellCheck="false"
                  autoComplete="off"
                  value={row.name}
                  onChange={(event) =>
                    setScripts((items) =>
                      items.map((item) => (item.id === row.id ? { ...item, name: event.target.value } : item)),
                    )
                  }
                />
              </div>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className={LABEL_CLASS} htmlFor={`cj-script-cmd-${row.id}`}>
                    Command
                  </label>
                  <input
                    id={`cj-script-cmd-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    spellCheck="false"
                    autoComplete="off"
                    value={row.command}
                    onChange={(event) =>
                      setScripts((items) =>
                        items.map((item) =>
                          item.id === row.id ? { ...item, command: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setScripts((items) => items.filter((item) => item.id !== row.id))}
                  aria-label={`Remove script ${index + 1}`}
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
              composer.json
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : result.requireCount + result.devCount}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input to generate a file" : "declared requirements"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generated composer.json"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy JSON"}
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
                ["Runtime requirements (incl. php)", String(result.requireCount)],
                ["Development requirements", String(result.devCount)],
                ["Top-level keys", String(Object.keys(result.json).length)],
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
        Run <code>composer validate</code> after saving the file — it reports schema problems and
        warns when composer.lock is out of sync with your requirements.
      </p>
    </main>
  );
}

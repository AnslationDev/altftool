"use client";

import { useMemo, useState } from "react";
import { AlignLeft, Braces, Check, Copy, FileJson, ListTree, RotateCcw } from "lucide-react";

import {
  DEFAULT_LINE_WIDTH,
  INDENT_OPTIONS,
  LINE_WIDTH_OPTIONS,
  SAMPLE_YAML,
  UNLIMITED_LINE_WIDTH,
  formatYaml,
} from "../lib";

const DEFAULTS = {
  source: SAMPLE_YAML,
  indent: INDENT_OPTIONS[0],
  lineWidth: DEFAULT_LINE_WIDTH,
  sortKeys: false,
  forceQuotes: false,
  view: "yaml",
};

const VIEWS = [
  { key: "yaml", label: "Formatted YAML", Icon: AlignLeft },
  { key: "json", label: "JSON", Icon: FileJson },
  { key: "keys", label: "Key list", Icon: ListTree },
];

const numberFormat = new Intl.NumberFormat("en-US");

const inputClass =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const buttonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";

const ghostButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";

const EM_DASH = "—";

function lineWidthLabel(value) {
  return value === UNLIMITED_LINE_WIDTH ? "Never fold" : `${value} columns`;
}

export default function ToolHome() {
  const [source, setSource] = useState(DEFAULTS.source);
  const [indent, setIndent] = useState(DEFAULTS.indent);
  const [lineWidth, setLineWidth] = useState(DEFAULTS.lineWidth);
  const [sortKeys, setSortKeys] = useState(DEFAULTS.sortKeys);
  const [forceQuotes, setForceQuotes] = useState(DEFAULTS.forceQuotes);
  const [view, setView] = useState(DEFAULTS.view);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => formatYaml(source, { indent, lineWidth, sortKeys, forceQuotes }),
    [source, indent, lineWidth, sortKeys, forceQuotes],
  );

  const error = result.error || null;
  const stats = error ? null : result.stats;
  const keys = error ? [] : result.keys;

  const copyText = useMemo(() => {
    if (error) return "";
    if (view === "json") return result.json;
    if (view === "keys") return keys.map((entry) => `${entry.path}\t${entry.type}`).join("\n");
    return result.output;
  }, [error, view, result.json, result.output, keys]);

  async function handleCopy() {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function handleReset() {
    setSource(DEFAULTS.source);
    setIndent(DEFAULTS.indent);
    setLineWidth(DEFAULTS.lineWidth);
    setSortKeys(DEFAULTS.sortKeys);
    setForceQuotes(DEFAULTS.forceQuotes);
    setView(DEFAULTS.view);
    setCopied(false);
  }

  const stat = (value) => (stats ? numberFormat.format(value) : EM_DASH);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Braces aria-hidden="true" className="size-6 text-[var(--primary)]" />
          YAML Formatter
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Re-indent YAML, list every key path, and convert the document to JSON. Parsed with the
          YAML 1.2 core schema, entirely in your browser.
        </p>
      </header>

      <section className="grid gap-4">
        <div>
          <label
            htmlFor="yaml-source"
            className="mb-1 block text-sm font-medium text-[var(--foreground)]"
          >
            YAML input
          </label>
          <textarea
            id="yaml-source"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            rows={12}
            spellCheck={false}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            placeholder={"name: my-service\nreplicas: 3"}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="yaml-indent"
              className="mb-1 block text-sm font-medium text-[var(--foreground)]"
            >
              Indent width
            </label>
            <select
              id="yaml-indent"
              value={indent}
              onChange={(event) => setIndent(Number(event.target.value))}
              className={inputClass}
            >
              {INDENT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} spaces
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="yaml-line-width"
              className="mb-1 block text-sm font-medium text-[var(--foreground)]"
            >
              Fold long scalars at
            </label>
            <select
              id="yaml-line-width"
              value={lineWidth}
              onChange={(event) => setLineWidth(Number(event.target.value))}
              className={inputClass}
            >
              {LINE_WIDTH_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {lineWidthLabel(option)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label
            htmlFor="yaml-sort-keys"
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]"
          >
            <input
              id="yaml-sort-keys"
              type="checkbox"
              checked={sortKeys}
              onChange={(event) => setSortKeys(event.target.checked)}
              className="size-4 accent-[var(--primary)]"
            />
            Sort mapping keys A–Z
          </label>

          <label
            htmlFor="yaml-force-quotes"
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]"
          >
            <input
              id="yaml-force-quotes"
              type="checkbox"
              checked={forceQuotes}
              onChange={(event) => setForceQuotes(event.target.checked)}
              className="size-4 accent-[var(--primary)]"
            />
            Quote every scalar
          </label>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">Mapping keys found</p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-[var(--primary)]">
          {stats ? numberFormat.format(stats.keyCount) : EM_DASH}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {stats
            ? `${numberFormat.format(stats.uniqueKeyCount)} distinct key names across ${numberFormat.format(stats.documents)} document${stats.documents === 1 ? "" : "s"}`
            : "Fix the error above to see results"}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[var(--muted-foreground)]">Documents</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {stats ? stat(stats.documents) : EM_DASH}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Max nesting depth</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {stats ? stat(stats.maxDepth) : EM_DASH}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Distinct key names</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {stats ? stat(stats.uniqueKeyCount) : EM_DASH}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Lines in / out</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {stats ? `${stat(stats.inputLines)} / ${stat(stats.outputLines)}` : EM_DASH}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Bytes in / out</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {stats ? `${stat(stats.inputBytes)} / ${stat(stats.outputBytes)}` : EM_DASH}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Status</dt>
            <dd
              className={
                error
                  ? "font-semibold text-[var(--danger)]"
                  : "font-semibold text-[var(--success)]"
              }
            >
              {error ? "Invalid" : "Valid YAML"}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Output view">
          {VIEWS.map(({ key, label, Icon }) => {
            const active = view === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setView(key)}
                className={
                  active
                    ? `${buttonClass} px-3`
                    : `${ghostButtonClass} px-3 text-[var(--muted-foreground)]`
                }
              >
                <Icon aria-hidden="true" className="size-4" />
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          {error ? (
            <p className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--muted-foreground)]">
              {EM_DASH}
            </p>
          ) : view === "keys" ? (
            keys.length === 0 ? (
              <p className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--muted-foreground)]">
                This document has no mapping keys.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-[var(--border)]">
                <table className="w-full min-w-[32rem] text-left text-sm">
                  <thead className="bg-[var(--background)] text-[var(--muted-foreground)]">
                    <tr>
                      <th scope="col" className="px-3 py-2 font-medium">
                        Key path
                      </th>
                      <th scope="col" className="px-3 py-2 font-medium">
                        Type
                      </th>
                      <th scope="col" className="px-3 py-2 font-medium">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map((entry, index) => (
                      <tr
                        key={`${entry.path}-${index}`}
                        className="border-t border-[var(--border)]"
                      >
                        <td className="px-3 py-2 font-mono text-[var(--foreground)]">
                          {entry.path}
                        </td>
                        <td className="px-3 py-2 text-[var(--muted-foreground)]">{entry.type}</td>
                        <td className="px-3 py-2 text-[var(--muted-foreground)]">
                          {entry.preview}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <pre className="overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)]">
              {view === "json" ? result.json : result.output}
            </pre>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!copyText}
            aria-label={`Copy ${view === "json" ? "JSON" : view === "keys" ? "key list" : "formatted YAML"} to clipboard`}
            className={`${buttonClass} disabled:opacity-50`}
          >
            {copied ? (
              <Check aria-hidden="true" className="size-4" />
            ) : (
              <Copy aria-hidden="true" className="size-4" />
            )}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button type="button" onClick={handleReset} className={ghostButtonClass}>
            <RotateCcw aria-hidden="true" className="size-4" />
            Reset
          </button>
        </div>
      </section>

      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        Duplicate mapping keys are rejected, anchors and aliases are expanded, and YAML 1.1 habits
        such as <code>enabled: no</code> stay strings under the YAML 1.2 core schema.
      </p>
    </div>
  );
}

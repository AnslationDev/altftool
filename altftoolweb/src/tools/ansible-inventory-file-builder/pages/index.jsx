"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListTree, RotateCcw } from "lucide-react";

import { buildInventory } from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_SPEC = `[webservers]
web[01:03].example.com ansible_user=deploy
lb1.example.com

[dbservers]
db1.example.com ansible_port=2222

[prod:children]
webservers
dbservers

[prod:vars]
env=prod
`;

const DASH = "—";
const NUM = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [spec, setSpec] = useState(DEFAULT_SPEC);
  const [format, setFormat] = useState("yaml");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => buildInventory(spec), [spec]);
  const hasError = Boolean(result.error);
  const output = hasError ? "" : format === "yaml" ? result.yaml : result.ini;

  const copyResult = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSpec(DEFAULT_SPEC);
    setFormat("yaml");
    setCopied(false);
  };

  const statRows = hasError
    ? [
        ["Groups", DASH],
        ["Hosts (ranges expanded)", DASH],
        ["Child links", DASH],
        ["Variables", DASH],
      ]
    : [
        ["Groups", NUM.format(result.stats.groups)],
        ["Hosts (ranges expanded)", NUM.format(result.stats.hosts)],
        ["Child links", NUM.format(result.stats.childLinks)],
        ["Variables", NUM.format(result.stats.vars)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListTree className="h-4 w-4" aria-hidden="true" />
          Configuration Management
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Ansible Inventory File Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Type your groups, hosts and variables in INI style — with [group], [group:children] and
          [group:vars] sections — and get a validated inventory in both INI and YAML form.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="inv-spec">
          Inventory spec (INI style, host ranges like web[01:05] supported)
        </label>
        <textarea
          id="inv-spec"
          rows={12}
          spellCheck={false}
          className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          value={spec}
          onChange={(event) => setSpec(event.target.value)}
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="inv-format">
              Output format
            </label>
            <select
              id="inv-format"
              className="mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            >
              <option value="yaml">YAML (inventory.yml)</option>
              <option value="ini">INI (hosts)</option>
            </select>
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

      {!hasError && result.warnings.length > 0 ? (
        <ul className="mt-6 space-y-1 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
          {result.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Hosts in inventory
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.stats.hosts)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the spec above to see a result."
                : `Across ${NUM.format(result.stats.groups)} group${result.stats.groups === 1 ? "" : "s"}, numeric ranges expanded.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label={`Copy the ${format.toUpperCase()} inventory`}
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the spec to the example"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {statRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 overflow-x-auto">
          <pre className="min-w-[320px] rounded-md bg-[var(--muted)] p-4 font-mono text-xs leading-5 text-[var(--foreground)]">
            {hasError ? DASH : output}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Syntax follows the Ansible inventory guide: hosts before any [group] header fall into
        ungrouped, :children nests groups, and :vars attaches group variables. Verify with
        ansible-inventory --list -i your-file before relying on it in production.
      </p>
    </main>
  );
}

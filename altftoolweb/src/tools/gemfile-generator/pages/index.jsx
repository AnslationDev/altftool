"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gem, Plus, RotateCcw, Trash2 } from "lucide-react";

import { COMMON_GROUPS, DEFAULT_SOURCE, RUBY_VERSIONS, buildGemfile } from "../lib";

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

const DEFAULT_GEMS = [
  { id: "g1", name: "rails", requirement: "~> 7.1.3", group: "default", github: "", branch: "", requireFalse: false },
  { id: "g2", name: "pg", requirement: ">= 1.1, < 2.0", group: "default", github: "", branch: "", requireFalse: false },
  { id: "g3", name: "puma", requirement: "~> 6.4", group: "default", github: "", branch: "", requireFalse: false },
  { id: "g4", name: "bootsnap", requirement: "", group: "default", github: "", branch: "", requireFalse: true },
  { id: "g5", name: "rspec-rails", requirement: "~> 6.1", group: "test", github: "", branch: "", requireFalse: false },
  { id: "g6", name: "debug", requirement: "", group: "development", github: "", branch: "", requireFalse: false },
];

const DEFAULTS = {
  source: DEFAULT_SOURCE,
  rubyVersion: "3.3.6",
  useRubyFile: false,
  useGemspec: false,
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [gems, setGems] = useState(DEFAULT_GEMS);
  const [nextId, setNextId] = useState(10);
  const [copied, setCopied] = useState(false);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateGem = (id, patch) =>
    setGems((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const result = useMemo(
    () => buildGemfile({ ...form, gems: gems.filter((row) => row.name.trim()) }),
    [form, gems],
  );
  const hasError = Boolean(result.error);

  const addGem = () => {
    setGems((rows) => [
      ...rows,
      { id: `g-${nextId}`, name: "", requirement: "", group: "default", github: "", branch: "", requireFalse: false },
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
    setForm(DEFAULTS);
    setGems(DEFAULT_GEMS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gem className="h-4 w-4" aria-hidden="true" />
          Ruby / Bundler
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Gemfile Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write a Bundler Gemfile with a source, a ruby version, grouped gems and git or path
          sources — and see exactly what each pessimistic <code>~&gt;</code> constraint allows.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Header</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gf-source">
              Gem source
            </label>
            <input
              id="gf-source"
              className={`mt-2 ${INPUT_CLASS}`}
              type="url"
              spellCheck="false"
              autoComplete="off"
              value={form.source}
              onChange={(event) => set("source", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gf-ruby">
              Ruby version
            </label>
            <input
              id="gf-ruby"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              spellCheck="false"
              autoComplete="off"
              list="gf-ruby-options"
              disabled={form.useRubyFile}
              value={form.rubyVersion}
              onChange={(event) => set("rubyVersion", event.target.value)}
            />
            <datalist id="gf-ruby-options">
              {RUBY_VERSIONS.map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
          </div>
          <div className="grid content-end gap-1">
            <label className={CHECK_LABEL} htmlFor="gf-rubyfile">
              <input
                id="gf-rubyfile"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={form.useRubyFile}
                onChange={(event) => set("useRubyFile", event.target.checked)}
              />
              Read version from .ruby-version
            </label>
            <label className={CHECK_LABEL} htmlFor="gf-gemspec">
              <input
                id="gf-gemspec"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={form.useGemspec}
                onChange={(event) => set("useGemspec", event.target.checked)}
              />
              Add gemspec directive
            </label>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Gems</h2>
          <button type="button" onClick={addGem} className={SMALL_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add gem
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          {gems.map((row, index) => (
            <div key={row.id} className="grid gap-3 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor={`gf-name-${row.id}`}>
                  Gem {index + 1} name
                </label>
                <input
                  id={`gf-name-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  spellCheck="false"
                  autoComplete="off"
                  value={row.name}
                  onChange={(event) => updateGem(row.id, { name: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`gf-req-${row.id}`}>
                  Version requirement
                </label>
                <input
                  id={`gf-req-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  spellCheck="false"
                  autoComplete="off"
                  placeholder="~> 1.2"
                  value={row.requirement}
                  onChange={(event) => updateGem(row.id, { requirement: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`gf-group-${row.id}`}>
                  Group
                </label>
                <select
                  id={`gf-group-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={row.group}
                  onChange={(event) => updateGem(row.id, { group: event.target.value })}
                >
                  {COMMON_GROUPS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`gf-github-${row.id}`}>
                  github: owner/repo (optional)
                </label>
                <input
                  id={`gf-github-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  spellCheck="false"
                  autoComplete="off"
                  value={row.github}
                  onChange={(event) => updateGem(row.id, { github: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`gf-branch-${row.id}`}>
                  branch: (optional)
                </label>
                <input
                  id={`gf-branch-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  spellCheck="false"
                  autoComplete="off"
                  value={row.branch}
                  onChange={(event) => updateGem(row.id, { branch: event.target.value })}
                />
              </div>
              <div className="flex items-end justify-between gap-3">
                <label className={CHECK_LABEL} htmlFor={`gf-require-${row.id}`}>
                  <input
                    id={`gf-require-${row.id}`}
                    type="checkbox"
                    className="h-5 w-5 accent-[var(--primary)]"
                    checked={row.requireFalse}
                    onChange={(event) => updateGem(row.id, { requireFalse: event.target.checked })}
                  />
                  require: false
                </label>
                <button
                  type="button"
                  onClick={() => setGems((rows) => rows.filter((item) => item.id !== row.id))}
                  aria-label={`Remove gem ${index + 1}`}
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
              Gemfile
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : result.gemCount}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input to generate a file" : `gems across ${result.groupCount} group(s)`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generated Gemfile"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy Gemfile"}
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
                ["Gems declared", String(result.gemCount)],
                ["Groups", String(result.groupCount)],
                ["Pessimistic constraints", String(result.expansions.length)],
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

            {result.expansions.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold">What each ~&gt; constraint allows</h3>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full min-w-[320px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                        <th scope="col" className="py-2 pr-3 font-semibold">Gem</th>
                        <th scope="col" className="py-2 pr-3 font-semibold">Written</th>
                        <th scope="col" className="py-2 font-semibold">Resolves to</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.expansions.map((row) => (
                        <tr key={row.name} className="border-b border-[var(--border)] last:border-0">
                          <td className="py-2 pr-3 font-semibold">{row.name}</td>
                          <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.constraint}</td>
                          <td className="py-2">{row.range}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

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
        Run <code>bundle install</code> to resolve the graph and write Gemfile.lock, then commit the
        lock file so every machine and CI run installs the same versions.
      </p>
    </main>
  );
}

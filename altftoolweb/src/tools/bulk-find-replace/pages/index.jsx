"use client";

import { useCallback, useMemo, useState } from "react";
import { Copy, Plus, Replace, Trash2 } from "lucide-react";

const SAMPLE = `Dear Mr Sharma,

Thank you for contacting ACME Corp. Your order ACME-1042 ships on 12/03/2026.
If you have questions about ACME Corp policies, reply to support@acme-corp.test.

Regards,
The ACME Corp team`;

const DEFAULT_RULES = [
  { id: 1, find: "ACME Corp", replace: "Northwind Ltd", enabled: true },
  { id: 2, find: "Mr Sharma", replace: "Ms Iyer", enabled: true },
  { id: 3, find: "", replace: "", enabled: true },
];

const nf = new Intl.NumberFormat("en-IN");

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function buildPattern(rule, { useRegex, caseSensitive, wholeWord }) {
  let source = useRegex ? rule.find : escapeRegExp(rule.find);
  if (wholeWord) source = `\\b(?:${source})\\b`;
  const flags = caseSensitive ? "gm" : "gmi";
  return new RegExp(source, flags);
}

function runRules(input, rules, options) {
  let text = input;
  let totalReplacements = 0;
  const perRule = [];
  let error = null;

  for (const rule of rules) {
    if (!rule.enabled || rule.find === "") {
      perRule.push({ id: rule.id, matches: 0, skipped: true });
      continue;
    }

    let pattern;
    try {
      pattern = buildPattern(rule, options);
    } catch (patternError) {
      error = `Rule ${rules.indexOf(rule) + 1} is not a valid regular expression: ${patternError.message}`;
      perRule.push({ id: rule.id, matches: 0, invalid: true });
      continue;
    }

    // A zero-width pattern (a*, ^, \b) would fire between every character, so
    // skip it rather than shredding the text.
    if (pattern.test("")) {
      pattern.lastIndex = 0;
      error = `Rule ${rules.indexOf(rule) + 1} can match an empty string, so it was skipped. Make the pattern match at least one character.`;
      perRule.push({ id: rule.id, matches: 0, invalid: true });
      continue;
    }
    pattern.lastIndex = 0;

    const matches = text.match(pattern);
    const count = matches ? matches.length : 0;
    if (count > 0) {
      text = text.replace(pattern, options.useRegex ? rule.replace : rule.replace.replace(/\$/g, "$$$$"));
      totalReplacements += count;
    }
    perRule.push({ id: rule.id, matches: count });
  }

  return { output: text, totalReplacements, perRule, error };
}

export default function ToolHome() {
  const [text, setText] = useState(SAMPLE);
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [wholeWord, setWholeWord] = useState(false);
  const [copied, setCopied] = useState(false);

  const options = useMemo(
    () => ({ useRegex, caseSensitive, wholeWord }),
    [caseSensitive, useRegex, wholeWord]
  );

  const result = useMemo(() => runRules(text, rules, options), [options, rules, text]);

  const matchesById = useMemo(() => {
    const map = new Map();
    for (const entry of result.perRule) map.set(entry.id, entry);
    return map;
  }, [result.perRule]);

  const updateRule = (id, patch) =>
    setRules((current) => current.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)));

  const addRule = () =>
    setRules((current) => [
      ...current,
      { id: (current.at(-1)?.id || 0) + 1, find: "", replace: "", enabled: true },
    ]);

  const removeRule = (id) =>
    setRules((current) =>
      current.length === 1 ? current : current.filter((rule) => rule.id !== id)
    );

  const copyOutput = useCallback(async () => {
    if (!result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }, [result.output]);

  const reset = () => {
    setText(SAMPLE);
    setRules(DEFAULT_RULES);
    setUseRegex(false);
    setCaseSensitive(true);
    setWholeWord(false);
  };

  const activeRules = rules.filter((rule) => rule.enabled && rule.find !== "").length;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Replace className="h-4 w-4" aria-hidden="true" />
            Text & Writing
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Bulk Find and Replace</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Apply as many find and replace rules as you need in one pass. Switch on regular
            expressions for patterns and capture groups, or keep it literal — every rule shows its
            own match count.
          </p>
        </header>

        <section className="mt-6 grid gap-6">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">Replacement rules</h2>
              <span className="text-xs text-[var(--muted-foreground)]">
                {nf.format(activeRules)} active rule{activeRules === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-3 grid gap-3">
              {rules.map((rule, index) => {
                const info = matchesById.get(rule.id);
                return (
                  <div
                    key={rule.id}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor={`bfr-find-${rule.id}`} className="text-xs font-semibold">
                          Find {index + 1}
                        </label>
                        <input
                          id={`bfr-find-${rule.id}`}
                          type="text"
                          value={rule.find}
                          onChange={(event) => updateRule(rule.id, { find: event.target.value })}
                          spellCheck="false"
                          placeholder={useRegex ? "\\d{2}/\\d{2}/\\d{4}" : "old text"}
                          className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor={`bfr-replace-${rule.id}`} className="text-xs font-semibold">
                          Replace with
                        </label>
                        <input
                          id={`bfr-replace-${rule.id}`}
                          type="text"
                          value={rule.replace}
                          onChange={(event) => updateRule(rule.id, { replace: event.target.value })}
                          spellCheck="false"
                          placeholder={useRegex ? "$1-$2" : "new text"}
                          className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(event) => updateRule(rule.id, { enabled: event.target.checked })}
                          className="h-4 w-4 accent-[var(--primary)]"
                        />
                        Enabled
                      </label>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-semibold ${
                            info?.invalid
                              ? "text-[var(--danger)]"
                              : info?.matches
                                ? "text-[var(--success)]"
                                : "text-[var(--muted-foreground)]"
                          }`}
                        >
                          {info?.invalid
                            ? "invalid pattern"
                            : `${nf.format(info?.matches || 0)} match${(info?.matches || 0) === 1 ? "" : "es"}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeRule(rule.id)}
                          aria-label={`Remove rule ${index + 1}`}
                          disabled={rules.length === 1}
                          className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-xs font-semibold text-[var(--muted-foreground)] transition hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={addRule}
              aria-label="Add another find and replace rule"
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add rule
            </button>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["Use regular expressions", useRegex, setUseRegex, "Enables patterns like \\d+ and $1 capture groups."],
                ["Case sensitive", caseSensitive, setCaseSensitive, "Off matches Apple, APPLE and apple alike."],
                ["Whole words only", wholeWord, setWholeWord, "cat will not match category."],
              ].map(([label, value, setter, hint]) => (
                <label key={label} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(event) => setter(event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                  />
                  <span>
                    {label}
                    <span className="block text-xs text-[var(--muted-foreground)]">{hint}</span>
                  </span>
                </label>
              ))}
            </div>

            {result.error && (
              <p
                role="alert"
                className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                {result.error}
              </p>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <label htmlFor="bfr-input" className="text-sm font-semibold">
                Original text
              </label>
              <textarea
                id="bfr-input"
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={12}
                spellCheck="false"
                placeholder="Paste the text you want to edit…"
                className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm leading-6 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setText(result.output)}
                  aria-label="Replace the original text with the result"
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  Apply to input
                </button>
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Reset text and rules"
                  className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label htmlFor="bfr-output" className="text-sm font-semibold">
                  Result
                </label>
                <button
                  type="button"
                  onClick={copyOutput}
                  aria-label="Copy the replaced text"
                  className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  {copied ? "Copied!" : "Copy result"}
                </button>
              </div>
              <textarea
                id="bfr-output"
                value={result.output}
                readOnly
                rows={12}
                spellCheck="false"
                className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm leading-6 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
              Total replacements
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {nf.format(result.totalReplacements)}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Active rules", nf.format(activeRules)],
                ["Characters in", nf.format(text.length)],
                ["Characters out", nf.format(result.output.length)],
                [
                  "Difference",
                  `${result.output.length - text.length >= 0 ? "+" : ""}${nf.format(result.output.length - text.length)}`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs font-medium text-[var(--muted-foreground)]">{label}</p>
                  <p className="mt-1 text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              Rules run top to bottom, so a later rule sees the output of the earlier ones. In regex
              mode you can reuse capture groups in the replacement with $1, $2 and so on.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

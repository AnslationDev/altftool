"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Replace, RotateCcw } from "lucide-react";

import { previewReplace } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const MAX_ROWS_SHOWN = 100;

const FLAG_OPTIONS = [
  { id: "g", label: "g — all matches" },
  { id: "i", label: "i — ignore case" },
  { id: "m", label: "m — multiline ^$" },
  { id: "s", label: "s — dot matches newline" },
];

const DEFAULTS = {
  text: "Order #1024 shipped on 2026-07-20.\nOrder #1025 shipped on 2026-07-24.",
  pattern: "(?<y>\\d{4})-(?<m>\\d{2})-(?<d>\\d{2})",
  replacement: "$<d>/$<m>/$<y>",
  flags: { g: true, i: false, m: false, s: false },
};

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [pattern, setPattern] = useState(DEFAULTS.pattern);
  const [replacement, setReplacement] = useState(DEFAULTS.replacement);
  const [flagState, setFlagState] = useState(DEFAULTS.flags);
  const [copied, setCopied] = useState(false);

  const flags = FLAG_OPTIONS.filter((option) => flagState[option.id])
    .map((option) => option.id)
    .join("");

  const result = useMemo(
    () => previewReplace({ text, pattern, flags, replacement }),
    [text, pattern, flags, replacement],
  );
  const hasError = Boolean(result.error);

  const toggleFlag = (id) => {
    setFlagState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyOutput = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setText(DEFAULTS.text);
    setPattern(DEFAULTS.pattern);
    setReplacement(DEFAULTS.replacement);
    setFlagState(DEFAULTS.flags);
    setCopied(false);
  };

  const shownMatches = hasError ? [] : result.matches.slice(0, MAX_ROWS_SHOWN);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Replace className="h-4 w-4" aria-hidden="true" />
          Regex Toolkit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Regex Replace Preview Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          See exactly what a find &amp; replace will do before you run it — full output plus a
          per-match breakdown, with $1, $&amp;, $`, $&apos; and $&lt;name&gt; capture references
          expanded the way JavaScript&apos;s replace does.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="rrp-text">
            Text to search
          </label>
          <textarea
            id="rrp-text"
            className={`mt-2 ${TEXTAREA_CLASS}`}
            rows={5}
            spellCheck="false"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rrp-pattern">
              Find (regex pattern)
            </label>
            <input
              id="rrp-pattern"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck="false"
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rrp-replacement">
              Replace with
            </label>
            <input
              id="rrp-replacement"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck="false"
              value={replacement}
              onChange={(event) => setReplacement(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Supports $1…$99, $&amp;, $`, $&apos;, $&lt;name&gt; and $$ for a literal dollar.
            </p>
          </div>
        </div>
        <fieldset className="mt-4">
          <legend className={LABEL_CLASS}>Flags</legend>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
            {FLAG_OPTIONS.map((option) => (
              <label
                key={option.id}
                className="flex min-h-11 cursor-pointer items-center gap-2 text-sm"
                htmlFor={`rrp-flag-${option.id}`}
              >
                <input
                  id={`rrp-flag-${option.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={Boolean(flagState[option.id])}
                  onChange={() => toggleFlag(option.id)}
                />
                <code className="text-xs">{option.label}</code>
              </label>
            ))}
          </div>
        </fieldset>
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
              Matches found
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.matchCount.toLocaleString()}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a preview."
                : result.truncated
                  ? "Match limit reached — the preview stops replacing after the cap."
                  : `Pattern /${pattern}/${flags} applied to ${text.length.toLocaleString()} characters.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyOutput}
              disabled={hasError}
              aria-label="Copy the replaced output text"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy output"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset text, pattern and replacement to the example"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <h3 className="mt-5 text-sm font-semibold">Result after replace</h3>
        <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
          <pre className="whitespace-pre-wrap break-words text-xs leading-5 text-[var(--foreground)]">
            {hasError ? DASH : result.output === "" ? "(empty result)" : result.output}
          </pre>
        </div>

        <h3 className="mt-5 text-sm font-semibold">Per-match breakdown</h3>
        {!hasError && result.matchCount === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            No matches — the output is identical to the input.
          </p>
        ) : (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    #
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Index
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Matched
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Becomes
                  </th>
                </tr>
              </thead>
              <tbody>
                {shownMatches.map((match, position) => (
                  <tr
                    key={`${match.index}-${position}`}
                    className="border-b border-[var(--border)] align-top last:border-0"
                  >
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{position + 1}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{match.index}</td>
                    <td className="py-2 pr-3">
                      <code className="break-all rounded bg-[var(--muted)] px-1.5 py-0.5 text-xs">
                        {match.matched === "" ? "(empty)" : match.matched}
                      </code>
                    </td>
                    <td className="py-2">
                      <code className="break-all rounded bg-[var(--muted)] px-1.5 py-0.5 text-xs text-[var(--success)]">
                        {match.replacement === "" ? "(removed)" : match.replacement}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!hasError && result.matchCount > MAX_ROWS_SHOWN ? (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Showing the first {MAX_ROWS_SHOWN} of {result.matchCount.toLocaleString()} matches;
                the output above includes all of them.
              </p>
            ) : null}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Replacement reference cheatsheet</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Token
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Inserts
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["$1 … $99", "The numbered capture group (literal text if the group does not exist)"],
                ["$<name>", "The named capture group from (?<name>…)"],
                ["$&", "The entire matched text"],
                ["$`", "Everything before the match"],
                ["$'", "Everything after the match"],
                ["$$", "A literal dollar sign"],
              ].map(([token, meaning]) => (
                <tr key={token} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">
                    <code className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-xs">{token}</code>
                  </td>
                  <td className="py-2">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything runs locally in your browser using JavaScript regex semantics (ECMA-262). Other
        engines differ: sed and Perl use \1 backreference syntax, and Python uses \g&lt;name&gt; —
        preview here, then adapt the replacement string to your target tool.
      </p>
    </main>
  );
}

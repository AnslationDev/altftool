"use client";

import { useMemo, useState } from "react";
import { Braces, Check, Copy, RotateCcw } from "lucide-react";

import { MAX_INPUT_CHARS, TARGETS, TARGET_GROUPS, escapeForTarget } from "../lib";

const COUNT = new Intl.NumberFormat("en-US");
const PERCENT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DASH = "—";

const DEFAULT_TEXT = `You are a release notes writer.

Rules:
- Use the template "{{version}} — {{date}}" for the heading.
- Refer to the user's file as \`config.json\`, never as "the config".
- If a change is breaking, prefix it with $BREAKING and don't soften it.
- Reply in the customer's language; O'Brien's team reads it in Spanish.`;

const DEFAULTS = {
  text: DEFAULT_TEXT,
  targetId: "js-double",
  wrap: true,
};

const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const RISKY_LABELS = [
  ["backslash", "Backslashes"],
  ["doubleQuote", "Double quotes"],
  ["singleQuote", "Single quotes"],
  ["backtick", "Backticks"],
  ["openBrace", "Opening braces"],
  ["closeBrace", "Closing braces"],
  ["dollar", "Dollar signs"],
  ["newline", "Line breaks"],
  ["tab", "Tabs"],
];

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [targetId, setTargetId] = useState(DEFAULTS.targetId);
  const [wrap, setWrap] = useState(DEFAULTS.wrap);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => escapeForTarget(text, targetId, { wrap }), [text, targetId, wrap]);
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.wrapped);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setText(DEFAULTS.text);
    setTargetId(DEFAULTS.targetId);
    setWrap(DEFAULTS.wrap);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Original length", DASH],
        ["Escaped length", DASH],
        ["Characters added", DASH],
        ["Growth", DASH],
        ["Line breaks", DASH],
      ]
    : [
        ["Original length", `${COUNT.format(result.originalLength)} characters`],
        ["Escaped length", `${COUNT.format(result.escapedLength)} characters`],
        ["Characters added", COUNT.format(result.addedCharacters)],
        ["Growth", `${PERCENT.format(result.growthPercent)}%`],
        ["Line breaks", COUNT.format(result.risky.newline)],
      ];

  const selectedTarget = TARGETS.find((entry) => entry.id === targetId);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Braces className="h-4 w-4" aria-hidden="true" />
          Prompt formatting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Prompt Escape Helper</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a prompt full of quotes, braces, backticks and backslashes, and get it back escaped
          for the language you are embedding it in — including the awkward ones, like POSIX single
          quotes and Python format strings.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="pe-input">
          Your prompt
        </label>
        <textarea
          id="pe-input"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          rows={9}
          value={text}
          onChange={(event) => setText(event.target.value)}
          spellCheck={false}
        />
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          {COUNT.format(text.length)} of {COUNT.format(MAX_INPUT_CHARS)} characters
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-target">
              Escape for
            </label>
            <select
              id="pe-target"
              className={`mt-2 ${INPUT_CLASS}`}
              value={targetId}
              onChange={(event) => setTargetId(event.target.value)}
            >
              {TARGET_GROUPS.map((group) => (
                <optgroup key={group} label={group}>
                  {TARGETS.filter((entry) => entry.group === group).map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <label
            className="flex min-h-11 items-center gap-3 self-end rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            htmlFor="pe-wrap"
          >
            <input
              id="pe-wrap"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={wrap}
              onChange={(event) => setWrap(event.target.checked)}
            />
            <span className="text-sm font-medium">Include the surrounding quotes</span>
          </label>
        </div>

        {selectedTarget ? (
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{selectedTarget.note}</p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Characters added
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `+${COUNT.format(result.addedCharacters)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Paste a prompt above" : `${result.target.label}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the escaped prompt"
              className={`${GHOST_BTN} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy escaped"}
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
            className="mt-5 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Escaped output</h2>
            <div className="mt-3 overflow-x-auto">
              <pre className="min-w-full whitespace-pre-wrap break-all rounded-md bg-[var(--background)] p-4 font-mono text-sm leading-6 text-[var(--foreground)]">
                {result.wrapped}
              </pre>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">What needed escaping</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Character
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {RISKY_LABELS.map(([key, label]) => (
                    <tr key={key} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{label}</td>
                      <td
                        className={`py-2 text-right font-semibold ${
                          result.risky[key] > 0 ? "" : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {COUNT.format(result.risky[key])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Escaping runs entirely in your browser — nothing is uploaded. Escaping makes a string safe to
        embed, not safe to execute: for SQL use bound parameters, and never build a shell command out
        of untrusted input even when it is quoted correctly.
      </p>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { AlignLeft, Check, Copy, RotateCcw } from "lucide-react";

import { BULLET_STYLES, COUNT_LABELS, MAX_INPUT_CHARS, stripMarkdown } from "../lib";

const COUNT = new Intl.NumberFormat("en-US");
const PERCENT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DASH = "—";

const DEFAULT_TEXT = `# Release Notes Writer

You turn a changelog into **customer-facing** release notes.

## Rules

- Lead with the _outcome_, not the ticket number.
- Link the docs like [this](https://docs.example.com/upgrade).
- Never use the word \`synergy\`.

> Breaking changes go first, always.

| Type | Prefix |
| ---- | ------ |
| Breaking | BREAKING |
| Fix | Fixed |

\`\`\`json
{ "version": "2.4.0" }
\`\`\`
`;

const DEFAULTS = {
  text: DEFAULT_TEXT,
  bulletStyle: "dash",
  keepLinkUrls: false,
  keepImageAlt: true,
  keepCodeContent: true,
  keepOrderedNumbers: true,
  collapseBlankLines: true,
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
const CHECK_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2";

const TOGGLES = [
  ["keepCodeContent", "Keep the text inside code"],
  ["keepLinkUrls", "Keep link URLs in brackets"],
  ["keepImageAlt", "Keep image alt text"],
  ["keepOrderedNumbers", "Keep numbers on ordered lists"],
  ["collapseBlankLines", "Collapse runs of blank lines"],
];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setText = (event) => {
    const { value } = event.target;
    setForm((previous) => ({ ...previous, text: value }));
  };
  const setBullet = (event) => {
    const { value } = event.target;
    setForm((previous) => ({ ...previous, bulletStyle: value }));
  };
  const setToggle = (key) => (event) => {
    const { checked } = event.target;
    setForm((previous) => ({ ...previous, [key]: checked }));
  };

  const result = useMemo(() => stripMarkdown(form.text, form), [form]);
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Markdown length", DASH],
        ["Plain length", DASH],
        ["Characters removed", DASH],
        ["Words", DASH],
        ["Lines", DASH],
      ]
    : [
        ["Markdown length", `${COUNT.format(result.originalLength)} characters`],
        ["Plain length", `${COUNT.format(result.plainLength)} characters`],
        ["Characters removed", COUNT.format(result.removedCharacters)],
        ["Words", COUNT.format(result.wordCount)],
        ["Lines", COUNT.format(result.lineCount)],
      ];

  const usedConstructs = hasError ? [] : COUNT_LABELS.filter(([key]) => result.counts[key] > 0);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AlignLeft className="h-4 w-4" aria-hidden="true" />
          Prompt formatting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Prompt Markdown to Plain</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Some destinations render Markdown as literal asterisks and hashes. Paste your prompt and
          get clean prose back — headings, emphasis, links, tables and code fences resolved, with the
          text inside code blocks left exactly as written.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="md-input">
          Markdown prompt
        </label>
        <textarea
          id="md-input"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          rows={11}
          value={form.text}
          onChange={setText}
          spellCheck={false}
        />
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          {COUNT.format(form.text.length)} of {COUNT.format(MAX_INPUT_CHARS)} characters
        </p>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="md-bullet">
            Bullet markers
          </label>
          <select id="md-bullet" className={`mt-2 ${INPUT_CLASS}`} value={form.bulletStyle} onChange={setBullet}>
            {BULLET_STYLES.map((style) => (
              <option key={style.id} value={style.id}>
                {style.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {TOGGLES.map(([key, label]) => (
            <label key={key} className={CHECK_ROW} htmlFor={`md-${key}`}>
              <input
                id={`md-${key}`}
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={form[key]}
                onChange={setToggle(key)}
              />
              <span className="text-sm font-medium">{label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Markup removed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${PERCENT.format(result.reductionPercent)}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Paste a prompt above"
                : `${COUNT.format(result.removedCharacters)} characters of markup gone`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the plain text prompt"
              className={`${GHOST_BTN} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plain text"}
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
            <h2 className="text-base font-semibold">Plain text</h2>
            <div className="mt-3 overflow-x-auto">
              <pre className="min-w-full whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-4 text-sm leading-6 text-[var(--foreground)]">
                {result.text}
              </pre>
            </div>
          </section>

          {usedConstructs.length > 0 ? (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">What was found</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">
                        Construct
                      </th>
                      <th scope="col" className="py-2 text-right font-semibold">
                        Count
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {usedConstructs.map(([key, label]) => (
                      <tr key={key} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3">{label}</td>
                        <td className="py-2 text-right font-semibold">{COUNT.format(result.counts[key])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Runs entirely in your browser — nothing is uploaded. Note that plain text containing literal
        asterisks or underscores is ambiguous, so run this once on your Markdown rather than
        repeatedly on its own output.
      </p>
    </main>
  );
}

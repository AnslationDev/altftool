"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileX2, RotateCcw } from "lucide-react";

import { TEMPLATES, TEMPLATE_GROUPS, buildGitignore } from "../lib";

const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  selected: ["node", "nextjs", "macos", "vscode"],
  extraPatterns: "",
};

const DASH = "—";
const NUM = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [selected, setSelected] = useState(DEFAULTS.selected);
  const [extraPatterns, setExtraPatterns] = useState(DEFAULTS.extraPatterns);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => buildGitignore({ selectedIds: selected, extraPatterns }),
    [selected, extraPatterns],
  );

  const hasError = Boolean(result.error);

  const toggle = (id) => {
    setSelected((previous) =>
      previous.includes(id) ? previous.filter((entry) => entry !== id) : [...previous, id],
    );
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
    setSelected(DEFAULTS.selected);
    setExtraPatterns(DEFAULTS.extraPatterns);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Patterns", DASH],
        ["Sections", DASH],
        ["Duplicates removed", DASH],
      ]
    : [
        ["Patterns", NUM.format(result.patternCount)],
        ["Sections", NUM.format(result.sections)],
        ["Duplicates removed", NUM.format(result.duplicatesRemoved)],
        ["Total lines", NUM.format(result.lineCount)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileX2 className="h-4 w-4" aria-hidden="true" />
          Git workflow
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Gitignore Generator by Stack
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick the languages, frameworks, editors and operating systems in your stack to combine
          their community .gitignore templates into one de-duplicated file.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-6 sm:grid-cols-2">
          {TEMPLATE_GROUPS.map((group) => (
            <fieldset key={group}>
              <legend className="text-sm font-semibold text-[var(--foreground)]">{group}</legend>
              <div className="mt-2 space-y-1">
                {TEMPLATES.filter((template) => template.group === group).map((template) => (
                  <label
                    key={template.id}
                    htmlFor={`gi-${template.id}`}
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 transition hover:bg-[var(--muted)]"
                  >
                    <input
                      id={`gi-${template.id}`}
                      type="checkbox"
                      className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                      checked={selected.includes(template.id)}
                      onChange={() => toggle(template.id)}
                    />
                    <span className="text-sm leading-6">{template.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-6">
          <label className={LABEL_CLASS} htmlFor="gi-extra">
            Extra patterns (optional, one per line)
          </label>
          <textarea
            id="gi-extra"
            className={`mt-2 min-h-20 ${TEXTAREA_CLASS}`}
            spellCheck={false}
            placeholder={"secrets/\n*.bak"}
            value={extraPatterns}
            onChange={(event) => setExtraPatterns(event.target.value)}
          />
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Generated .gitignore
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.patternCount)} patterns`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated .gitignore file"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy .gitignore"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 max-h-96 overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
          <pre className="text-sm leading-6 whitespace-pre">
            <code>{hasError ? DASH : result.content}</code>
          </pre>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Pattern sets track the community templates at github.com/github/gitignore. A trailing slash
        matches directories only, and .gitignore does not untrack files already committed — run
        git rm --cached on those first.
      </p>
    </main>
  );
}

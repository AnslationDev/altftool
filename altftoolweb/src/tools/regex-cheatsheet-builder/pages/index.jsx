"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Regex, RotateCcw } from "lucide-react";

import { FLAVORS, SECTIONS, buildCheatsheet, toMarkdown } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUMBER = new Intl.NumberFormat("en-IN");

const DEFAULTS = {
  flavorId: "js",
  sectionIds: SECTIONS.map((section) => section.id),
};

export default function ToolHome() {
  const [flavorId, setFlavorId] = useState(DEFAULTS.flavorId);
  const [sectionIds, setSectionIds] = useState(DEFAULTS.sectionIds);
  const [copied, setCopied] = useState(false);

  const cheatsheet = useMemo(
    () => buildCheatsheet({ flavorId, sectionIds }),
    [flavorId, sectionIds],
  );
  const hasError = Boolean(cheatsheet.error);
  const markdown = useMemo(() => toMarkdown(cheatsheet), [cheatsheet]);

  const toggleSection = (id) => {
    setSectionIds((current) =>
      current.includes(id)
        ? current.filter((existing) => existing !== id)
        : [...current, id],
    );
  };

  const copyMarkdown = async () => {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setFlavorId(DEFAULTS.flavorId);
    setSectionIds(DEFAULTS.sectionIds);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Regex className="h-4 w-4" aria-hidden="true" />
          Regex Toolkit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Regex Cheatsheet Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick your regex flavor and the feature groups you actually use, and get a
          cheatsheet that only shows syntax your engine supports — copy it as Markdown or
          print the page.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rcb-flavor">
              Regex flavor
            </label>
            <select
              id="rcb-flavor"
              className={`mt-2 ${INPUT_CLASS}`}
              value={flavorId}
              onChange={(event) => setFlavorId(event.target.value)}
            >
              {FLAVORS.map((flavor) => (
                <option key={flavor.id} value={flavor.id}>
                  {flavor.name}
                </option>
              ))}
            </select>
          </div>
          <fieldset>
            <legend className={LABEL_CLASS}>Sections to include</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {SECTIONS.map((section) => {
                const active = sectionIds.includes(section.id);
                return (
                  <label
                    key={section.id}
                    htmlFor={`rcb-section-${section.id}`}
                    className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-medium transition ${
                      active
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    <input
                      id={`rcb-section-${section.id}`}
                      type="checkbox"
                      className="h-4 w-4 accent-[var(--primary)]"
                      checked={active}
                      onChange={() => toggleSection(section.id)}
                    />
                    {section.title}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {cheatsheet.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cheatsheet size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUMBER.format(cheatsheet.entryCount)} tokens`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the selection above to build the cheatsheet."
                : `Filtered for ${cheatsheet.flavor.name}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyMarkdown}
              disabled={hasError}
              aria-label="Copy the cheatsheet as Markdown"
              className={`${GHOST_BTN} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy Markdown"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset flavor and sections to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Sections included</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : cheatsheet.sections.length}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Tokens shown</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : NUMBER.format(cheatsheet.entryCount)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">
              Hidden (unsupported in this flavor)
            </dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : NUMBER.format(cheatsheet.skippedCount)}
            </dd>
          </div>
        </dl>
      </section>

      {!hasError
        ? cheatsheet.sections
            .filter((section) => section.entries.length > 0)
            .map((section) => (
              <section
                key={section.id}
                className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
              >
                <h2 className="text-base font-semibold">{section.title}</h2>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                        <th scope="col" className="py-2 pr-3 font-semibold">
                          Token
                        </th>
                        <th scope="col" className="py-2 pr-3 font-semibold">
                          Meaning
                        </th>
                        <th scope="col" className="py-2 font-semibold">
                          Example
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.entries.map((entry) => (
                        <tr
                          key={entry.token}
                          className="border-b border-[var(--border)] align-top last:border-0"
                        >
                          <td className="py-2 pr-3 whitespace-nowrap">
                            <code className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-xs">
                              {entry.token}
                            </code>
                          </td>
                          <td className="py-2 pr-3 min-w-[200px]">
                            {entry.meaning}
                            {entry.note ? (
                              <span className="block text-xs text-[var(--muted-foreground)]">
                                {entry.note}
                              </span>
                            ) : null}
                          </td>
                          <td className="py-2 whitespace-nowrap">
                            <code className="text-xs">{entry.example}</code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))
        : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Support columns follow ECMA-262 for JavaScript, the PCRE2 documentation, and the
        Python 3 re module docs. Tokens your chosen flavor does not support are hidden
        rather than shown with a warning, so everything on the sheet is safe to paste.
      </p>
    </main>
  );
}

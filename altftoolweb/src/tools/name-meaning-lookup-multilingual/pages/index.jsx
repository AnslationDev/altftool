"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Languages, RotateCcw, Search } from "lucide-react";

import {
  browseByOrigin,
  LANGUAGE_FAMILIES,
  lookupName,
  NAME_ENTRIES,
  summariseMatch,
} from "../lib";

const DEFAULT_QUERY = "Alexander";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "inline-flex min-h-11 items-center rounded-full border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const LINK_BTN =
  "mr-2 min-h-11 underline underline-offset-4 transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const EXAMPLES = ["Ivan", "Iskandar", "محمد", "राजन्", "Σοφία", "Yusuf", "Priya", "Bogdan"];

export default function ToolHome() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [showBrowse, setShowBrowse] = useState(false);
  const [copiedId, setCopiedId] = useState("");

  const result = useMemo(() => lookupName(query), [query]);
  const origins = useMemo(() => browseByOrigin(), []);

  const copyMatch = async (match) => {
    const text = summariseMatch(match);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(match.entry.id);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      setCopiedId("");
    }
  };

  const reset = () => {
    setQuery(DEFAULT_QUERY);
    setShowBrowse(false);
    setCopiedId("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Languages className="h-4 w-4" aria-hidden="true" />
          Name etymology
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Multilingual Name Meaning Lookup
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          An offline dictionary of {NAME_ENTRIES.length} given names traced to the word each is
          built on — the Semitic three-consonant root, the Sanskrit verbal root, the Greek or
          Germanic compound — with the forms the same name takes in other languages and, where it is
          established, the Proto-Indo-European or Proto-Semitic ancestor. Search in Latin script or
          in Arabic, Hebrew, Greek or Devanagari.
        </p>
      </header>

      <section className={CARD}>
        <label className={LABEL_CLASS} htmlFor="name-query">
          Name to look up
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="name-query"
            className={INPUT_CLASS}
            type="search"
            autoComplete="off"
            spellCheck="false"
            placeholder="John, Yusuf, Priya, Σοφία…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="button" onClick={reset} aria-label="Reset the search" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              className={CHIP}
              onClick={() => setQuery(example)}
              aria-label={`Look up ${example}`}
            >
              {example}
            </button>
          ))}
        </div>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      {result.notFound && (
        <section className={`mt-6 ${CARD}`}>
          <div className="flex items-start gap-3">
            <Search
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--muted-foreground)]"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold">“{result.query}” is not in this dictionary.</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                It holds {result.dictionarySize} names whose etymology is documented in standard
                reference works, so a great many real names are missing. Nothing is guessed for a
                name that is not in it.
              </p>
              {result.suggestions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.suggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.entryId}-${suggestion.label}`}
                      type="button"
                      className={CHIP}
                      onClick={() => setQuery(suggestion.label)}
                    >
                      {suggestion.label}
                      {suggestion.label !== suggestion.headword && (
                        <span className="ml-1 text-[var(--muted-foreground)]">
                          → {suggestion.headword}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {result.matches &&
        result.matches.map((match) => {
          const entry = match.entry;
          return (
            <section key={entry.id} className={`mt-6 ${CARD}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                    {entry.origin} · {LANGUAGE_FAMILIES[entry.origin] ?? "Other"} · {entry.gender}
                  </p>
                  <h2 className="mt-1 text-3xl font-semibold">{entry.name}</h2>
                  {entry.native && (
                    <p className="mt-1 text-lg text-[var(--muted-foreground)]">
                      {entry.native} · {entry.translit}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className={GHOST_BTN}
                  onClick={() => copyMatch(match)}
                  aria-label={`Copy the entry for ${entry.name}`}
                >
                  {copiedId === entry.id ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copiedId === entry.id ? "Copied!" : "Copy result"}
                </button>
              </div>

              <p className="mt-4 text-xl font-semibold text-[var(--primary)]">{entry.meaning}</p>
              {entry.certainty === "debated" && (
                <p className="mt-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
                  The meaning of this name is genuinely disputed. The candidates are listed rather
                  than one being presented as settled.
                </p>
              )}

              {match.matchKind !== "headword" && (
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Matched on <strong>{match.matchedOn}</strong>, the {match.matchLanguage}{" "}
                  {match.matchKind}.
                </p>
              )}

              <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
                <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <dt className="text-[var(--muted-foreground)]">Root word</dt>
                  <dd className="font-semibold sm:max-w-[62%] sm:text-right">
                    {entry.root.text}
                    {entry.root.script ? ` (${entry.root.script})` : ""} — {entry.root.gloss}
                    <span className="ml-1 font-normal text-[var(--muted-foreground)]">
                      [{entry.root.language}]
                    </span>
                  </dd>
                </div>
                {entry.deepRoot && (
                  <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <dt className="text-[var(--muted-foreground)]">{entry.deepRoot.label} root</dt>
                    <dd className="font-semibold sm:max-w-[62%] sm:text-right">
                      {entry.deepRoot.form} — {entry.deepRoot.gloss}
                    </dd>
                  </div>
                )}
              </dl>

              {entry.deepRoot && entry.deepRoot.cognates && entry.deepRoot.cognates.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold">
                    Words descended from {entry.deepRoot.form}
                  </h3>
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full min-w-[340px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                          <th scope="col" className="py-2 pr-3 font-semibold">
                            Language
                          </th>
                          <th scope="col" className="py-2 pr-3 font-semibold">
                            Form
                          </th>
                          <th scope="col" className="py-2 font-semibold">
                            Meaning
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {entry.deepRoot.cognates.map((cognate) => (
                          <tr
                            key={`${cognate.language}-${cognate.form}`}
                            className="border-b border-[var(--border)] last:border-0"
                          >
                            <td className="py-2 pr-3 whitespace-nowrap">{cognate.language}</td>
                            <td className="py-2 pr-3 font-semibold">
                              {cognate.form}
                              {cognate.script ? ` ${cognate.script}` : ""}
                            </td>
                            <td className="py-2 text-[var(--muted-foreground)]">{cognate.gloss}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mt-5">
                <h3 className="text-sm font-semibold">The same name in other languages</h3>
                <div className="mt-2 space-y-3">
                  {match.families.map((group) => (
                    <div key={group.family}>
                      <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                        {group.family}
                      </p>
                      <ul className="mt-1 space-y-1 text-sm">
                        {group.forms.map((form) => (
                          <li key={`${form.language}-${form.form}`}>
                            <span className="text-[var(--muted-foreground)]">{form.language}:</span>{" "}
                            <strong>{form.form}</strong>
                            {form.script ? ` ${form.script}` : ""}
                            {form.note ? (
                              <span className="text-[var(--muted-foreground)]"> — {form.note}</span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {(match.sameRoot.length > 0 ||
                match.sameDeepRoot.length > 0 ||
                match.sameMeaning.length > 0) && (
                <div className="mt-5 space-y-3 text-sm">
                  {match.sameRoot.length > 0 && (
                    <p>
                      <span className="font-semibold">Built on the same root: </span>
                      {match.sameRoot.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={LINK_BTN}
                          onClick={() => setQuery(item.name)}
                        >
                          {item.name}
                        </button>
                      ))}
                    </p>
                  )}
                  {match.sameDeepRoot.length > 0 && entry.deepRoot && (
                    <p>
                      <span className="font-semibold">
                        Inherited from the same {entry.deepRoot.label} root:{" "}
                      </span>
                      {match.sameDeepRoot.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={LINK_BTN}
                          onClick={() => setQuery(item.name)}
                        >
                          {item.name}
                        </button>
                      ))}
                    </p>
                  )}
                  {match.sameMeaning.length > 0 && (
                    <p>
                      <span className="font-semibold">Unrelated names with the same meaning: </span>
                      {match.sameMeaning.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={LINK_BTN}
                          onClick={() => setQuery(item.name)}
                        >
                          {item.name}
                        </button>
                      ))}
                    </p>
                  )}
                </div>
              )}

              {entry.notes.length > 0 && (
                <ul className="mt-5 space-y-2 text-sm text-[var(--muted-foreground)]">
                  {entry.notes.map((note) => (
                    <li key={note} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]"
                      />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}

      <section className={`mt-6 ${CARD}`}>
        <button
          type="button"
          className={`${GHOST_BTN} w-full sm:w-auto`}
          onClick={() => setShowBrowse((value) => !value)}
          aria-expanded={showBrowse}
        >
          {showBrowse ? "Hide" : "Show"} everything in the dictionary ({NAME_ENTRIES.length} names)
        </button>

        {showBrowse && (
          <div className="mt-4 space-y-4">
            {origins.map((group) => (
              <div key={group.origin}>
                <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                  {group.origin} · {group.family}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {group.entries.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      className={CHIP}
                      onClick={() => setQuery(entry.name)}
                    >
                      {entry.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This is a fixed offline dictionary, not a search of the whole world&apos;s naming stock. It
        covers names whose derivation is agreed in published reference works, marks the disputed
        ones as disputed, and returns nothing at all rather than a plausible-sounding guess for a
        name it does not hold. Etymology describes where a word came from; it does not decide what a
        name means to the family that gave it.
      </p>
    </main>
  );
}

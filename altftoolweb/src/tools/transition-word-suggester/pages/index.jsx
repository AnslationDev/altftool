"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Waypoints } from "lucide-react";

import {
  HEAVY_DENSITY_PER_100_WORDS,
  REGISTERS,
  RELATIONSHIPS,
  REPEAT_FLAG_COUNT,
  TRANSITION_TYPES,
  analyseText,
  resultToText,
  suggestTransitions,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const SAMPLE_TEXT =
  "The pilot missed two of its three targets. However, the district team argued that the delay was caused by supply problems. However, the audit found no evidence of that. Therefore, the committee asked for a second round of data before any decision.";

const DEFAULTS = {
  relationship: "contrast",
  register: "all",
  type: "all",
  search: "",
  text: SAMPLE_TEXT,
};

export default function ToolHome() {
  const [relationship, setRelationship] = useState(DEFAULTS.relationship);
  const [register, setRegister] = useState(DEFAULTS.register);
  const [type, setType] = useState(DEFAULTS.type);
  const [search, setSearch] = useState(DEFAULTS.search);
  const [text, setText] = useState(DEFAULTS.text);
  const [includeAmbiguous, setIncludeAmbiguous] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => suggestTransitions({ relationship, register, type, search }),
    [relationship, register, type, search],
  );

  const scan = useMemo(() => analyseText(text, { includeAmbiguous }), [text, includeAmbiguous]);

  const plainText = useMemo(() => resultToText(result), [result]);
  const hasError = Boolean(result.error);
  const activeRelationship = RELATIONSHIPS.find((item) => item.id === relationship);

  const copyResult = async () => {
    if (!plainText) return;
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setRelationship(DEFAULTS.relationship);
    setRegister(DEFAULTS.register);
    setType(DEFAULTS.type);
    setSearch(DEFAULTS.search);
    setText(DEFAULTS.text);
    setIncludeAmbiguous(false);
    setCopied(false);
  };

  const stats = hasError
    ? [
        ["Relationship", DASH],
        ["Options shown", DASH],
        ["Formal options", DASH],
        ["Conversational options", DASH],
      ]
    : [
        ["Relationship", relationship === "all" ? "All relationships" : activeRelationship?.label ?? DASH],
        ["Options shown", `${result.count} of 94`],
        ["Formal options", String(result.items.filter((item) => item.register === "formal").length)],
        ["Conversational options", String(result.items.filter((item) => item.register === "informal").length)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Waypoints className="h-4 w-4" aria-hidden="true" />
          Connectives
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Transition Word Suggester</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Start from the relationship between your two sentences — contrast, cause, sequence,
          concession — and get the transitions that carry it, each with the punctuation rule that
          applies to it and a worked example. Then paste your paragraph to see which connectives you
          are already leaning on.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tws-relationship">
              Relationship
            </label>
            <select
              id="tws-relationship"
              className={`mt-2 ${INPUT_CLASS}`}
              value={relationship}
              onChange={(event) => setRelationship(event.target.value)}
            >
              <option value="all">All relationships</option>
              {RELATIONSHIPS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tws-register">
              Register
            </label>
            <select
              id="tws-register"
              className={`mt-2 ${INPUT_CLASS}`}
              value={register}
              onChange={(event) => setRegister(event.target.value)}
            >
              <option value="all">Any register</option>
              {Object.values(REGISTERS).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tws-type">
              Grammatical type
            </label>
            <select
              id="tws-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="all">Any type</option>
              {Object.values(TRANSITION_TYPES).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tws-search">
              Search within the list
            </label>
            <input
              id="tws-search"
              className={`mt-2 ${INPUT_CLASS}`}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="e.g. however"
            />
          </div>
        </div>

        {activeRelationship && relationship !== "all" && (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">{activeRelationship.description}</p>
        )}
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Transitions matched
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.count}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Adjust the filters to see options."
                : "Each one below shows the punctuation rule and a sentence you can copy the shape of."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError || result.count === 0}
              aria-label="Copy the matched transition words and examples"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy list"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all filters" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {stats.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Options</h2>
          {result.count === 0 ? (
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              Nothing matches those filters. Try widening the register or clearing the search box.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {result.items.map((entry) => (
                <li
                  key={`${entry.relationship}-${entry.word}`}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold">{entry.word}</h3>
                    <p className="text-xs font-semibold text-[var(--primary)]">
                      {entry.relationshipLabel} · {entry.typeLabel}
                    </p>
                  </div>
                  <p className="mt-2 text-sm italic text-[var(--foreground)]">{entry.example}</p>
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">{entry.punctuation}</p>
                  {entry.note && (
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">Note: {entry.note}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Check a paragraph you have written</h2>
        <label className="mt-3 block text-sm font-semibold text-[var(--foreground)]" htmlFor="tws-text">
          Your text
        </label>
        <textarea
          id="tws-text"
          rows={5}
          className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <label className="mt-3 flex min-h-11 items-center gap-2 text-sm" htmlFor="tws-ambiguous">
          <input
            id="tws-ambiguous"
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
            checked={includeAmbiguous}
            onChange={(event) => setIncludeAmbiguous(event.target.checked)}
          />
          Count everyday words too (and, as, for, if, so, since, while)
        </label>

        {scan.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {scan.error}
          </p>
        ) : (
          <>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {[
                ["Words", String(scan.words)],
                ["Transitions used", String(scan.totalUses)],
                ["Different transitions", String(scan.uniqueTransitions)],
                ["Density", `${scan.densityPer100} per 100 words`],
                [
                  "Relationships covered",
                  scan.relationshipsUsed.length > 0 ? scan.relationshipsUsed.join(", ") : "None detected",
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 space-y-2">
              {scan.heavy && (
                <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                  {scan.densityPer100} transitions per 100 words is above the{" "}
                  {HEAVY_DENSITY_PER_100_WORDS} this tool treats as heavy — roughly one signpost per
                  sentence. Cutting a few usually makes the argument easier to follow, not harder.
                </p>
              )}
              {scan.overused.length > 0 && (
                <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                  Repeated {REPEAT_FLAG_COUNT} times or more:{" "}
                  {scan.overused.map((item) => `${item.word} (${item.count})`).join(", ")}. Swap one
                  for another option from the same relationship above.
                </p>
              )}
              {!includeAmbiguous && scan.ambiguousTotal > 0 && (
                <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                  {scan.ambiguousTotal} use{scan.ambiguousTotal === 1 ? "" : "s"} of everyday words
                  ({scan.ambiguousUses.map((item) => item.word).join(", ")}) were left out, because
                  they are usually not working as transitions.
                </p>
              )}
            </div>

            {scan.found.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <caption className="sr-only">Transitions found in your text</caption>
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">Transition</th>
                      <th scope="col" className="py-2 pr-3 font-semibold">Relationship</th>
                      <th scope="col" className="py-2 text-right font-semibold">Uses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scan.found.map((item) => (
                      <tr key={`${item.relationship}-${item.word}`} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 font-semibold">{item.word}</td>
                        <td className="py-2 pr-3 text-[var(--muted-foreground)]">{item.relationshipLabel}</td>
                        <td className="py-2 text-right">{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The scan matches words on the surface, so a connective used in another sense will still be
        counted. Density thresholds are this tool&apos;s editorial judgement, not a published
        standard — a transition is only worth keeping if it names a relationship the sentences do
        not already make obvious.
      </p>
    </main>
  );
}

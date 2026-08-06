"use client";

import { useCallback, useState } from "react";
import { Grid3x3 } from "lucide-react";

import {
  CHIP_CLASS,
  EmptyState,
  ErrorState,
  FIELD_CLASS,
  GHOST_CLASS,
  HINT_CLASS,
  LABEL_CLASS,
  Loading,
  ResultSummary,
  ToolPanel,
  WordResult,
  useToolQuery,
} from "../_shared/toolkit";

const EXAMPLES = ["st??e", "*ology", "@#@#@", "c?##?t"];

const TOKENS = [
  { token: "?", meaning: "exactly one letter" },
  { token: "*", meaning: "any run of letters, including none" },
  { token: "@", meaning: "any vowel — a e i o u" },
  { token: "#", meaning: "any consonant" },
];

/**
 * Crossword pattern search.
 *
 * The pattern is compiled to a regular expression on the server, where the
 * compiler drops every character that is not a letter or one of the four
 * tokens. Nothing typed here can reach the regex engine as a metacharacter,
 * which is why the box accepts anything without complaining about it.
 *
 * Results come back ordered by commonness rather than alphabetically: a solver
 * filling a grid wants the word most likely to be the answer, not the first
 * one in the dictionary.
 */
export default function PatternSearch() {
  const [pattern, setPattern] = useState("");

  const trimmed = pattern.trim();
  const usable = /[a-zA-Z?@#]/.test(trimmed);

  const build = useCallback(
    () => (usable ? `/lexicon/api/pattern?q=${encodeURIComponent(trimmed)}` : null),
    [trimmed, usable],
  );

  const { phase, data, error, retry } = useToolQuery({ build });

  return (
    <ToolPanel className="mt-8">
      <form onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="pattern-input" className={LABEL_CLASS}>
          Your pattern
        </label>
        <input
          id="pattern-input"
          name="pattern"
          type="text"
          value={pattern}
          onChange={(event) => setPattern(event.target.value)}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck="false"
          placeholder="st??e"
          aria-describedby="pattern-input-hint"
          className={`${FIELD_CLASS} font-mono tracking-[0.12em]`}
        />
        <p id="pattern-input-hint" className={HINT_CLASS}>
          Write the letters you know and a token for each one you do not.
        </p>
      </form>

      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {TOKENS.map((entry) => (
          <div key={entry.token} className="flex items-baseline gap-3">
            <dt className="w-6 shrink-0 rounded-sm bg-surface text-center font-mono text-sm font-semibold text-primary">
              {entry.token}
            </dt>
            <dd className="text-sm text-muted-foreground">{entry.meaning}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Try:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setPattern(example)}
            className={CHIP_CLASS}
          >
            {example}
          </button>
        ))}
        {pattern ? (
          <button type="button" onClick={() => setPattern("")} className={GHOST_CLASS}>
            Clear
          </button>
        ) : null}
      </div>

      <div className="mt-6 border-t border-border pt-6">
        {phase === "idle" ? (
          <p className="flex items-center gap-2.5 py-8 text-sm text-muted-foreground">
            <Grid3x3 className="h-4 w-4 shrink-0" aria-hidden="true" />
            {trimmed && !usable
              ? "A pattern of nothing but * matches most of the dictionary. Add a letter or a ? to narrow it."
              : "Write a pattern above. Matching words appear here, commonest first."}
          </p>
        ) : null}

        {phase === "loading" ? <Loading label="Scanning the dictionary…" /> : null}

        {phase === "error" ? <ErrorState message={error} onRetry={retry} /> : null}

        {phase === "done" && data ? (
          data.total === 0 ? (
            <EmptyState title={`Nothing matches ${data.pattern || trimmed}`}>
              The pattern is matched against whole words, so it has to describe the word from its
              first letter to its last — <span className="font-mono">st??e</span> finds STONE but
              not MISTAKE. Add <span className="font-mono">*</span> at either end to let the
              pattern float: <span className="font-mono">*st??e*</span> matches anywhere inside a
              word.
            </EmptyState>
          ) : (
            <>
              <ResultSummary capped={data.capped} total={data.total} limit={data.limit}>
                <span className="text-foreground">
                  {data.total.toLocaleString("en-US")}{" "}
                  {data.total === 1 ? "word matches" : "words match"}{" "}
                  <span className="font-mono">{data.pattern}</span>
                </span>{" "}
                — {data.minLength === data.maxLength
                  ? `${data.minLength} letters`
                  : `${data.minLength} to ${data.maxLength} letters`}
                , scanned across {data.scanned.toLocaleString("en-US")} entries.
              </ResultSummary>

              <ul
                className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-2"
                style={{ listStyle: "none" }}
              >
                {data.words.map((row) => (
                  <WordResult key={row.s} row={row} badge={`${row.l}`} />
                ))}
              </ul>
            </>
          )
        ) : null}
      </div>
    </ToolPanel>
  );
}

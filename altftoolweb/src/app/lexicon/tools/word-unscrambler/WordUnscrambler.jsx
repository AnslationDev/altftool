"use client";

import { useCallback, useState } from "react";
import { WandSparkles } from "lucide-react";

import {
  CHIP_CLASS,
  EmptyState,
  ErrorState,
  FIELD_CLASS,
  GHOST_CLASS,
  HINT_CLASS,
  LABEL_CLASS,
  Loading,
  ResultGroups,
  ResultSummary,
  ToolPanel,
  useToolQuery,
} from "../_shared/toolkit";

const EXAMPLES = ["sprained", "goldfish", "rewarding", "carto?n"];

/**
 * The unscrambler.
 *
 * Same index and same request as the anagram solver, with `subset=1` — the one
 * flag that drops the rule that every letter must be spent. That is the whole
 * difference between the two tools, and the reason they share a route.
 *
 * A minimum length filter lives on the client rather than in the query: the
 * answer set does not change when you slide it, so re-asking the server for a
 * list it already sent would be a round trip that buys nothing.
 */
export default function WordUnscrambler() {
  const [letters, setLetters] = useState("");
  const [minLength, setMinLength] = useState(2);

  const trimmed = letters.trim();
  const tiles = trimmed.replace(/[^a-zA-Z?*_]/g, "").length;

  const build = useCallback(
    () =>
      tiles >= 2 ? `/lexicon/api/anagrams?letters=${encodeURIComponent(trimmed)}&subset=1` : null,
    [trimmed, tiles],
  );

  const { phase, data, error, retry } = useToolQuery({ build });

  const groups = (data?.groups || []).filter((group) => group.key >= minLength);
  const visible = groups.reduce((sum, group) => sum + group.words.length, 0);

  return (
    <ToolPanel className="mt-8">
      <form onSubmit={(event) => event.preventDefault()}>
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_11rem]">
          <div>
            <label htmlFor="unscramble-letters" className={LABEL_CLASS}>
              Scrambled letters
            </label>
            <input
              id="unscramble-letters"
              name="letters"
              type="text"
              value={letters}
              onChange={(event) => setLetters(event.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck="false"
              placeholder="sprained"
              aria-describedby="unscramble-letters-hint"
              className={FIELD_CLASS}
            />
            <p id="unscramble-letters-hint" className={HINT_CLASS}>
              Up to 15 letters. Type <span className="font-mono text-foreground">?</span> for a
              letter you do not have — two at most. Answers may leave letters unused.
            </p>
          </div>

          <div>
            <label htmlFor="unscramble-min" className={LABEL_CLASS}>
              Shortest answer
            </label>
            <select
              id="unscramble-min"
              name="min"
              value={minLength}
              onChange={(event) => setMinLength(Number(event.target.value))}
              className={`${FIELD_CLASS} pr-3`}
              aria-describedby="unscramble-min-hint"
            >
              {[2, 3, 4, 5, 6, 7].map((value) => (
                <option key={value} value={value}>
                  {value} letters or more
                </option>
              ))}
            </select>
            <p id="unscramble-min-hint" className={HINT_CLASS}>
              Hides the short tail without asking the server again.
            </p>
          </div>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Try:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setLetters(example)}
            className={CHIP_CLASS}
          >
            {example}
          </button>
        ))}
        {letters ? (
          <button type="button" onClick={() => setLetters("")} className={GHOST_CLASS}>
            Clear
          </button>
        ) : null}
      </div>

      <div className="mt-6 border-t border-border pt-6">
        {phase === "idle" ? (
          <p className="flex items-center gap-2.5 py-8 text-sm text-muted-foreground">
            <WandSparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
            Type at least two letters. Every word hiding in them appears here, longest first.
          </p>
        ) : null}

        {phase === "loading" ? <Loading label="Unscrambling…" /> : null}

        {phase === "error" ? <ErrorState message={error} onRetry={retry} /> : null}

        {phase === "done" && data ? (
          data.total === 0 ? (
            <EmptyState title="Nothing can be spelled from those letters">
              Every answer has to be at least two letters long and has to be a headword in the
              dictionary. A run of rare consonants with no vowel produces nothing at all — add a
              vowel, or type <span className="font-mono">?</span> to stand in for a letter you do
              not have.
            </EmptyState>
          ) : visible === 0 ? (
            <EmptyState title={`No answer is ${minLength} letters or longer`}>
              {data.total.toLocaleString("en-US")}{" "}
              {data.total === 1 ? "word was" : "words were"} found, but all of them are shorter
              than {minLength} letters. Lower the shortest-answer setting to see them.
            </EmptyState>
          ) : (
            <>
              <ResultSummary capped={data.capped} total={data.total} limit={data.limit}>
                <span className="text-foreground">
                  {visible.toLocaleString("en-US")}{" "}
                  {visible === 1 ? "word" : "words"} from{" "}
                  {data.letters.toUpperCase().split("").join(" ")}
                  {data.blanks > 0
                    ? ` plus ${data.blanks === 1 ? "one blank" : `${data.blanks} blanks`}`
                    : ""}
                </span>
                {minLength > 2
                  ? `, of ${data.total.toLocaleString("en-US")} at any length.`
                  : "."}
                {data.truncated ? " Only the first 15 tiles were read." : ""}
              </ResultSummary>
              <ResultGroups groups={groups} />
            </>
          )
        ) : null}
      </div>
    </ToolPanel>
  );
}

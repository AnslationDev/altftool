"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Dices } from "lucide-react";

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

const EXAMPLES = ["aeinrst", "quizze?", "wordplay", "bcdfghj"];

/**
 * The rack solver.
 *
 * Same index as the unscrambler, ordered by what each word is worth instead of
 * by how long it is — which is a different list, not a re-sorted one. QI scores
 * eleven from two tiles and beats plenty of six-letter plays.
 *
 * Scores are face values with no board multipliers, and a letter covered by a
 * blank is scored at zero, because that is what the rules say a blank is worth.
 */
export default function RackSolver() {
  const [letters, setLetters] = useState("");

  const trimmed = letters.trim();
  const tiles = trimmed.replace(/[^a-zA-Z?*_]/g, "").length;

  const build = useCallback(
    () => (tiles >= 2 ? `/lexicon/api/rack?letters=${encodeURIComponent(trimmed)}` : null),
    [trimmed, tiles],
  );

  const { phase, data, error, retry } = useToolQuery({ build });

  return (
    <ToolPanel className="mt-8">
      <form onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="rack-letters" className={LABEL_CLASS}>
          Your rack
        </label>
        <input
          id="rack-letters"
          name="letters"
          type="text"
          value={letters}
          onChange={(event) => setLetters(event.target.value)}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck="false"
          placeholder="aeinrst"
          aria-describedby="rack-letters-hint"
          className={`${FIELD_CLASS} uppercase tracking-[0.18em]`}
        />
        <p id="rack-letters-hint" className={HINT_CLASS}>
          Seven tiles is a full rack, but up to fifteen are read. Type{" "}
          <span className="font-mono text-foreground">?</span> for a blank — a standard set has
          two, and a blank scores nothing.
        </p>
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
            <Dices className="h-4 w-4 shrink-0" aria-hidden="true" />
            Type at least two tiles. Every playable word appears here, worth the most first.
          </p>
        ) : null}

        {phase === "loading" ? <Loading label="Scoring your rack…" /> : null}

        {phase === "error" ? <ErrorState message={error} onRetry={retry} /> : null}

        {phase === "done" && data ? (
          data.total === 0 ? (
            <EmptyState title="No word can be played from those tiles">
              Every answer needs at least two tiles and has to be a headword in the dictionary. A
              rack with no vowel is the usual cause — in a real game that is a rack you exchange.
              Type <span className="font-mono">?</span> to stand a blank in for a tile you do not
              have.
            </EmptyState>
          ) : (
            <div className="space-y-6">
              {data.best ? (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface p-5">
                  <div>
                    <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
                      Highest scoring play
                    </p>
                    <Link
                      href={`/lexicon/word/${data.best.s}`}
                      className="afl-headword mt-1.5 block text-[clamp(1.5rem,4vw,2.25rem)] text-foreground no-underline hover:text-primary"
                    >
                      {data.best.w}
                    </Link>
                    {data.best.b ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        A blank stands in for the{" "}
                        <span className="font-mono uppercase text-foreground">{data.best.b}</span>,
                        which scores nothing.
                      </p>
                    ) : null}
                  </div>
                  <p className="font-mono text-[clamp(2rem,6vw,3rem)] font-semibold tabular-nums text-primary">
                    {data.best.sc}
                    <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                      points
                    </span>
                  </p>
                </div>
              ) : null}

              <ResultSummary capped={data.capped} total={data.total} limit={data.limit}>
                <span className="text-foreground">
                  {data.total.toLocaleString("en-US")}{" "}
                  {data.total === 1 ? "word plays" : "words play"} from{" "}
                  {data.letters.toUpperCase().split("").join(" ")}
                  {data.blanks > 0
                    ? ` plus ${data.blanks === 1 ? "one blank" : `${data.blanks} blanks`}`
                    : ""}
                </span>
                , grouped by face value.{" "}
                {data.truncated ? "Only the first 15 tiles were read." : ""}
              </ResultSummary>

              <ResultGroups groups={data.groups} badgeOf={(row) => `${row.sc}`} />
            </div>
          )
        ) : null}
      </div>
    </ToolPanel>
  );
}

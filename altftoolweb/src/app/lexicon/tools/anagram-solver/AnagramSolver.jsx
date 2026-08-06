"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Shuffle } from "lucide-react";

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

const EXAMPLES = ["listen", "teaching", "dormitory", "lis?en"];

/**
 * The anagram solver.
 *
 * Full anagrams only: every answer uses every letter you typed, which is what
 * "anagram" means and what separates this from the unscrambler next door. The
 * only relaxation is `?`, which stands for one unknown letter — two of them at
 * most, because a third turns the answer into a list of every word of that
 * length and stops being an answer.
 */
export default function AnagramSolver() {
  const [letters, setLetters] = useState("");

  const trimmed = letters.trim();
  const tiles = trimmed.replace(/[^a-zA-Z?*_]/g, "").length;

  const build = useCallback(
    () => (tiles >= 2 ? `/lexicon/api/anagrams?letters=${encodeURIComponent(trimmed)}` : null),
    [trimmed, tiles],
  );

  const { phase, data, error, retry } = useToolQuery({ build });

  return (
    <ToolPanel className="mt-8">
      <form onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="anagram-letters" className={LABEL_CLASS}>
          Your letters
        </label>
        <input
          id="anagram-letters"
          name="letters"
          type="text"
          value={letters}
          onChange={(event) => setLetters(event.target.value)}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck="false"
          inputMode="text"
          placeholder="listen"
          aria-describedby="anagram-letters-hint"
          className={FIELD_CLASS}
        />
        <p id="anagram-letters-hint" className={HINT_CLASS}>
          Letters only. Type <span className="font-mono text-foreground">?</span> for a blank —
          up to two. Spaces, commas and hyphens are ignored, so you can paste tiles however you
          like.
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
            <Shuffle className="h-4 w-4 shrink-0" aria-hidden="true" />
            Type at least two letters and the answers appear here.
          </p>
        ) : null}

        {phase === "loading" ? <Loading label="Rearranging your letters…" /> : null}

        {phase === "error" ? <ErrorState message={error} onRetry={retry} /> : null}

        {phase === "done" && data ? (
          data.total === 0 ? (
            <EmptyState title={`No word uses exactly those ${data.tiles || tiles} letters`}>
              An anagram has to spend every letter, so a rack with an awkward consonant run often
              has no answer at all. Try the{" "}
              <Link href="/lexicon/tools/word-unscrambler" className="text-primary hover:underline">
                word unscrambler
              </Link>
              , which allows letters to be left over, or replace an unknown letter with{" "}
              <span className="font-mono">?</span>.
            </EmptyState>
          ) : (
            <>
              <ResultSummary capped={data.capped} total={data.total} limit={data.limit}>
                <span className="text-foreground">
                  {data.total.toLocaleString("en-US")}{" "}
                  {data.total === 1 ? "word uses" : "words use"} all{" "}
                  {data.tiles.toLocaleString("en-US")} letters
                </span>{" "}
                {data.blanks > 0
                  ? `— ${data.letters.toUpperCase().split("").join(" ")} plus ${data.blanks === 1 ? "one blank" : `${data.blanks} blanks`}.`
                  : `— ${data.letters.toUpperCase().split("").join(" ")}.`}
                {data.truncated
                  ? " Only the first 15 tiles were read; the rest were ignored."
                  : ""}
              </ResultSummary>
              <ResultGroups groups={data.groups} />
            </>
          )
        ) : null}
      </div>
    </ToolPanel>
  );
}

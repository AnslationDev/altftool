"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowRight, Music } from "lucide-react";

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

const EXAMPLES = ["light", "silver", "purple", "machine"];

/**
 * The rhyme finder.
 *
 * The lookup has to happen on the server because rhyme is a fact about
 * pronunciation, and pronunciation lives in the CMU Pronouncing Dictionary
 * rather than in the spelling. The panel that appears above the answers shows
 * the syllable division and the IPA the match was made from, so the reader can
 * see why THROUGH and BLUE are in the same set and THOUGH is not.
 *
 * The syllable line is drawn here rather than imported from the shared atoms:
 * those are server components, and pulling one into a client bundle to render
 * five spans would couple this tool to a file it does not own.
 */
export default function RhymeFinder() {
  const [word, setWord] = useState("");

  const trimmed = word.trim();

  const build = useCallback(
    () =>
      trimmed.length >= 2 ? `/lexicon/api/rhymes?word=${encodeURIComponent(trimmed)}` : null,
    [trimmed],
  );

  const { phase, data, error, retry } = useToolQuery({ build });

  return (
    <ToolPanel className="mt-8">
      <form onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="rhyme-word" className={LABEL_CLASS}>
          Word to rhyme with
        </label>
        <input
          id="rhyme-word"
          name="word"
          type="text"
          value={word}
          onChange={(event) => setWord(event.target.value)}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck="false"
          placeholder="light"
          aria-describedby="rhyme-word-hint"
          className={FIELD_CLASS}
        />
        <p id="rhyme-word-hint" className={HINT_CLASS}>
          One word. Inflected forms resolve to their base, so <em>ran</em> answers as{" "}
          <em>run</em>.
        </p>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Try:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setWord(example)}
            className={CHIP_CLASS}
          >
            {example}
          </button>
        ))}
        {word ? (
          <button type="button" onClick={() => setWord("")} className={GHOST_CLASS}>
            Clear
          </button>
        ) : null}
      </div>

      <div className="mt-6 border-t border-border pt-6">
        {phase === "idle" ? (
          <p className="flex items-center gap-2.5 py-8 text-sm text-muted-foreground">
            <Music className="h-4 w-4 shrink-0" aria-hidden="true" />
            Type a word. Its rhymes appear here, grouped by how many syllables they run to.
          </p>
        ) : null}

        {phase === "loading" ? <Loading label="Reading the pronouncing dictionary…" /> : null}

        {phase === "error" ? <ErrorState message={error} onRetry={retry} /> : null}

        {phase === "done" && data ? (
          !data.found ? (
            <EmptyState title={`“${data.query}” is not in the dictionary`}>
              Rhymes are matched on a stored pronunciation, so a word has to have an entry before
              it can have rhymes. Check the spelling, or{" "}
              <Link href="/lexicon" className="text-primary hover:underline">
                search the dictionary
              </Link>{" "}
              for the word you meant.
            </EmptyState>
          ) : (
            <div className="space-y-6">
              <Pronunciation word={data.word} />

              {data.total === 0 ? (
                <EmptyState title={`Nothing in the dictionary rhymes with ${data.word.w}`}>
                  {data.word.rk
                    ? `Its rhyme key is ${data.word.rk}, and no other entry shares it. `
                    : "No stored pronunciation means no rhyme key, and no rhyme key means no matches. "}
                  Words like <em>orange</em>, <em>silver</em> and <em>month</em> are famous for
                  this: the sound after their last stressed vowel occurs in one English word only.
                  A near rhyme is the usual answer, and this tool does not invent them.
                </EmptyState>
              ) : (
                <>
                  <ResultSummary capped={data.capped} total={data.total} limit={data.limit}>
                    <span className="text-foreground">
                      {data.total.toLocaleString("en-US")}{" "}
                      {data.total === 1 ? "word rhymes" : "words rhyme"} with {data.word.w}
                    </span>{" "}
                    — every entry that shares the sound from its last stressed vowel onward.
                  </ResultSummary>

                  <ResultGroups groups={data.groups} />

                  <Link
                    href={`/lexicon/rhymes/${data.word.s}`}
                    className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-primary no-underline motion-safe:transition hover:border-border-strong"
                  >
                    Full rhyme page for {data.word.w}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </>
              )}
            </div>
          )
        ) : null}
      </div>
    </ToolPanel>
  );
}

/** What the match was actually made from — shown so the answer is checkable. */
function Pronunciation({ word }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      {word.via ? (
        <p className="mb-3 text-xs text-muted-foreground">
          <span className="text-foreground">{word.via.from.replace(/-/g, " ")}</span> resolves to
          its {word.via.kind === "irregular" ? "irregular" : "base"} form.
        </p>
      ) : null}

      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <span className="afl-headword text-[clamp(1.5rem,4vw,2rem)] text-foreground">
          {word.w}
        </span>

        {word.pt?.length ? (
          <span className="afl-syllables text-lg">
            {word.pt.map((part, index) => (
              <span key={`${part}-${index}`} className="contents">
                {index > 0 ? (
                  <span className="afl-syllables__dot" aria-hidden="true">
                    ·
                  </span>
                ) : null}
                <span
                  className={`afl-syllables__part${
                    index === word.st && word.pt.length > 1 ? " afl-syllables__part--stress" : ""
                  }`}
                >
                  {part}
                </span>
              </span>
            ))}
          </span>
        ) : null}

        {word.ip ? (
          <span className="font-mono text-sm text-muted-foreground">/{word.ip}/</span>
        ) : null}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {word.pd
          ? "This word is not in the pronouncing dictionary, so its syllable division was derived from spelling and no transcription is shown."
          : null}
        {word.rk ? (
          <>
            Rhymes are matched on the rhyme key{" "}
            <span className="font-mono text-foreground">{word.rk}</span> — the phonemes from the
            last stressed vowel to the end of the word.
          </>
        ) : (
          "Without a stored pronunciation there is no rhyme key, so no rhymes can be matched."
        )}
      </p>
    </div>
  );
}

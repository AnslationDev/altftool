"use client";

import { useState } from "react";

import { useAnswerKeys } from "../_shared/useAnswerKeys";
import { ArrowRight, Check, X } from "lucide-react";
import Link from "next/link";
import { CommonnessMeter } from "../../_components/WordAtoms";
import { hashString, seededShuffle } from "../_shared/rng";
import {
  BTN_CHOICE,
  BTN_PRIMARY,
  RestartButton,
  Reveal,
  RoundShell,
  Scoreboard,
  Summary,
} from "../_shared/GameUI";

/*
 * Odd one out.
 *
 * One choice, no take-backs, same as the definition quiz — a grouping question
 * you can keep poking at until it turns green is not a question.
 *
 * The whole point of the reveal is the four labels. A player who picked wrongly
 * has usually grouped the words a different but reasonable way, and the only
 * useful answer to that is to show what WordNet filed each of the four under,
 * in English, with the definition that decided it.
 *
 * Nothing is fetched. `rounds` arrives complete from the server page.
 */

const KEYS = ["1", "2", "3", "4"];

const PROMPT = "Three of these four share a semantic field. Pick the one that does not.";

const START = {
  index: 0,
  picked: -1,
  score: 0,
  asked: 0,
  streak: 0,
  best: 0,
  message: PROMPT,
};

export default function OddOneOutGame({ rounds }) {
  const [order, setOrder] = useState(rounds);
  const [state, setState] = useState(START);
  const [run, setRun] = useState(0);

  const round = order[state.index];
  const finished = state.index >= order.length;
  const settled = state.picked >= 0;

  const choose = (choice) => {
    if (settled || !round) return;

    const right = choice === round.answer;
    setState((current) => {
      const streak = right ? current.streak + 1 : 0;
      return {
        ...current,
        picked: choice,
        score: current.score + (right ? 1 : 0),
        asked: current.asked + 1,
        streak,
        best: Math.max(current.best, streak),
        message: right
          ? `Correct. The other three are all ${round.homeLabel}; ${round.word} is filed under ${round.oddLabel}.`
          : `Not that one. ${round.word} is the odd word — it is filed under ${round.oddLabel}, and the other three are ${round.homeLabel}.`,
      };
    });
  };

  /* Window-level, via the shared hook: a shortcut that needs focus inside the
     options list first is a shortcut nobody reaches, because clicking into the
     list is already answering. */
  useAnswerKeys((pressed) => choose(pressed - 1), KEYS.length);

  const next = () => {
    setState((current) => ({
      ...current,
      index: current.index + 1,
      picked: -1,
      message: current.index + 1 >= order.length ? "That was the last set." : PROMPT,
    }));
  };

  /*
   * Restart reshuffles the order of the eighteen sets rather than drawing new
   * ones, and it happens in the handler — a shuffle during render would make
   * the first paint disagree with the server HTML.
   */
  const restart = () => {
    setOrder(seededShuffle(rounds, hashString(`odd-run-${run + 1}`)));
    setRun(run + 1);
    setState(START);
  };

  return (
    <div className="mt-8 grid gap-4">
      <Scoreboard
        score={state.score}
        asked={state.asked}
        streak={state.streak}
        best={state.best}
        roundNumber={state.index + 1}
        roundCount={order.length}
        message={state.message}
      />

      {finished ? (
        <Summary score={state.score} total={order.length} best={state.best} onRestart={restart}>
          Every grouping here is WordNet&rsquo;s own, so a round you disagree with is worth opening
          the entry for — the file a word sits in is printed on its page.
        </Summary>
      ) : (
        <RoundShell>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
              Round {state.index + 1} of {order.length}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {round.words.length} words, one intruder
            </span>
          </div>

          <p className="mt-4 text-[0.9375rem] leading-relaxed text-foreground">{PROMPT}</p>
          <ul
            className="mt-5 grid gap-2.5 sm:grid-cols-2"
            style={{ listStyle: "none" }}
          >
            {round.words.map((item, slot) => {
              const isAnswer = slot === round.answer;
              const isPicked = slot === state.picked;
              const wrongPick = settled && isPicked && !isAnswer;

              return (
                <li key={item.slug}>
                  <button
                    type="button"
                    onClick={() => choose(slot)}
                    disabled={settled}
                    aria-pressed={isPicked}
                    className={`${BTN_CHOICE} items-center`}
                    style={
                      settled && isAnswer
                        ? { borderColor: "var(--success)" }
                        : wrongPick
                          ? { borderColor: "var(--danger)" }
                          : undefined
                    }
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-border bg-surface-soft font-mono text-xs text-muted-foreground"
                    >
                      {settled && isAnswer ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                      ) : wrongPick ? (
                        <X className="h-3.5 w-3.5 text-danger" />
                      ) : (
                        KEYS[slot]
                      )}
                    </span>
                    <span className="afl-headword min-w-0 text-xl text-foreground">
                      {item.word}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-3 text-xs text-muted-foreground">
            Tab to move between the four, Enter or Space to choose. Keys 1 to 4 work too.
          </p>

          {settled ? (
            <div className="mt-5 grid gap-4">
              <Reveal
                tone={state.picked === round.answer ? "correct" : "wrong"}
                slug={round.slug}
                word={round.word}
              >
                <p className="text-[0.9375rem] leading-relaxed text-foreground">
                  <strong className="afl-headword text-lg">{round.word}</strong> is the odd word.
                  The other three are all filed under {round.homeLabel}; it is filed under{" "}
                  {round.oddLabel}.
                </p>

                <ul className="afl-divide" style={{ listStyle: "none" }}>
                  {round.words.map((item) => (
                    <li key={item.slug} className="py-3">
                      <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <Link
                          href={`/lexicon/word/${item.slug}`}
                          className="afl-headword text-base text-foreground no-underline hover:text-primary"
                        >
                          {item.word}
                        </Link>
                        <span
                          className="font-mono text-xs"
                          style={{ color: item.odd ? "var(--danger)" : "var(--success)" }}
                        >
                          {item.label}
                        </span>
                        <CommonnessMeter band={item.band} showLabel={false} />
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                        {item.gloss}
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={next} className={BTN_PRIMARY}>
                  {state.index + 1 >= order.length ? "See your score" : "Next set"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <RestartButton onRestart={restart} />
              </div>
            </div>
          ) : (
            <div className="mt-5">
              <RestartButton onRestart={restart} />
            </div>
          )}
        </RoundShell>
      )}
    </div>
  );
}

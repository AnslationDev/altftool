"use client";

import { useState } from "react";

import { useAnswerKeys } from "../_shared/useAnswerKeys";
import { ArrowRight, Check, X } from "lucide-react";
import { CommonnessMeter, PosChip } from "../../_components/WordAtoms";
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
 * Guess the definition.
 *
 * One choice per round and no take-backs — the answer settles the moment you
 * pick, because a multiple choice question you can keep guessing at until it
 * goes green is not a test of anything.
 *
 * Options are real <button>s in a list, so Tab reaches them, Enter and Space
 * activate them, and a screen reader is told which one was chosen and which one
 * was right. The 1-4 keys are a shortcut layered on top, never the only route.
 */

const KEYS = ["1", "2", "3", "4"];

const START = {
  index: 0,
  picked: -1,
  score: 0,
  asked: 0,
  streak: 0,
  best: 0,
  message: "Four definitions. One belongs to the word; the other three belong to other entries.",
};

export default function DefinitionGame({ rounds }) {
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
          ? `Correct. ${round.word} means "${round.options[round.answer]}".`
          : `Not that one. ${round.word} means "${round.options[round.answer]}".`,
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
      message:
        current.index + 1 >= order.length
          ? "That was the last word."
          : "Four definitions. One belongs to the word; the other three belong to other entries.",
    }));
  };

  const restart = () => {
    setOrder(seededShuffle(rounds, hashString(`definition-run-${run + 1}`)));
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
          Guessing at random scores about a quarter of them, so anything above six is real
          vocabulary rather than luck.
        </Summary>
      ) : (
        <RoundShell>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
              Round {state.index + 1} of {order.length}
            </span>
            <span className="flex flex-wrap items-center gap-3">
              <PosChip pos={round.pos} />
              <CommonnessMeter band={round.band} />
            </span>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">Which definition belongs to</p>
          <p className="afl-headword mt-1 text-[clamp(2rem,5.5vw,3rem)] text-foreground">
            {round.word}
          </p>

          <ul
            className="mt-6 grid gap-2.5"
            style={{ listStyle: "none" }}
          >
            {round.options.map((gloss, slot) => {
              const isAnswer = slot === round.answer;
              const isPicked = slot === state.picked;
              const accent = settled && isAnswer ? "var(--success)" : null;
              const wrongPick = settled && isPicked && !isAnswer;

              return (
                <li key={gloss}>
                  <button
                    type="button"
                    onClick={() => choose(slot)}
                    disabled={settled}
                    aria-pressed={isPicked}
                    className={BTN_CHOICE}
                    style={
                      accent
                        ? { borderColor: accent }
                        : wrongPick
                          ? { borderColor: "var(--danger)" }
                          : undefined
                    }
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-border bg-surface-soft font-mono text-xs text-muted-foreground"
                    >
                      {settled && isAnswer ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                      ) : wrongPick ? (
                        <X className="h-3.5 w-3.5 text-danger" />
                      ) : (
                        KEYS[slot]
                      )}
                    </span>
                    <span className="min-w-0 text-[0.9375rem] leading-relaxed text-foreground">
                      {gloss}
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
                  <strong className="afl-headword text-lg">{round.word}</strong> —{" "}
                  {round.options[round.answer]}
                </p>
                {state.picked === round.answer ? null : (
                  <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
                    You picked &ldquo;{round.options[state.picked]}&rdquo;, which is the definition
                    of a different entry in the same part of speech.
                  </p>
                )}
              </Reveal>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={next} className={BTN_PRIMARY}>
                  {state.index + 1 >= order.length ? "See your score" : "Next word"}
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

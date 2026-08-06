"use client";

import { useCallback, useState } from "react";

import { useAnswerKeys } from "../_shared/useAnswerKeys";
import { ArrowRight } from "lucide-react";
import { CommonnessMeter, PosChips, SyllableLine } from "../../_components/WordAtoms";
import { hashString, seededShuffle } from "../_shared/rng";
import {
  BTN_PRIMARY,
  RestartButton,
  Reveal,
  RoundShell,
  Scoreboard,
  Summary,
} from "../_shared/GameUI";

/*
 * Syllable split.
 *
 * One question — how many beats? — and then the word opens up. The reveal is
 * the point of the game: the split with the stressed syllable inked, the IPA,
 * the respelling, and one sentence saying why the stress sits where it does.
 * Guessing "three" and being told "correct" teaches nothing; guessing "three"
 * and seeing `pho·TOG·ra·pher` teaches the rule that governs a hundred other
 * words.
 *
 * Answering is a single press either way: the six buttons are real buttons, so
 * Tab and Enter reach them, and the 1-6 keys are a shortcut on top of that
 * rather than the only route in. The shortcut listens on the window because
 * there is no text field anywhere on this page to steal a digit from — and it
 * still stands aside for an editable target and for anything held with a
 * modifier, so browser shortcuts keep working.
 *
 * Nothing is fetched. `rounds` arrives complete from the server page.
 */

const PROMPT = "How many syllables does this word have?";

const START = {
  index: 0,
  picked: 0,
  score: 0,
  asked: 0,
  streak: 0,
  best: 0,
  message: PROMPT,
};

const plural = (count) => (count === 1 ? "syllable" : "syllables");

export default function SyllableGame({ rounds, maxCount = 6 }) {
  const [order, setOrder] = useState(rounds);
  const [state, setState] = useState(START);
  const [run, setRun] = useState(0);

  const round = order[state.index];
  const finished = state.index >= order.length;
  const settled = state.picked > 0;

  const choices = Array.from({ length: maxCount }, (_, index) => index + 1);

  const answer = useCallback(
    (choice) => {
      setState((current) => {
        const active = order[current.index];
        if (!active || current.picked > 0) return current;

        const right = choice === active.count;
        const streak = right ? current.streak + 1 : 0;
        return {
          ...current,
          picked: choice,
          score: current.score + (right ? 1 : 0),
          asked: current.asked + 1,
          streak,
          best: Math.max(current.best, streak),
          message: right
            ? `Correct — ${active.word} has ${active.count} ${plural(active.count)}, with the beat on "${active.parts[active.stress]}".`
            : `Not quite. ${active.word} has ${active.count} ${plural(active.count)}: ${active.parts.join("-")}.`,
        };
      });
    },
    [order],
  );

  useAnswerKeys(answer, maxCount);

  const next = () => {
    setState((current) => ({
      ...current,
      index: current.index + 1,
      picked: 0,
      message: current.index + 1 >= order.length ? "That was the last word." : PROMPT,
    }));
  };

  /*
   * Restart reshuffles the thirty words rather than drawing new ones, and it
   * happens in the handler — a shuffle during render would make the first paint
   * disagree with the server HTML.
   */
  const restart = () => {
    setOrder(seededShuffle(rounds, hashString(`syllable-run-${run + 1}`)));
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
          Play again and the same thirty words come back in a different order — five at each length
          from one syllable to six.
        </Summary>
      ) : (
        <RoundShell>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
              Round {state.index + 1} of {order.length}
            </span>
            <span className="flex flex-wrap items-center gap-3">
              <PosChips parts={round.pos.split("")} abbreviated />
              <CommonnessMeter band={round.band} />
            </span>
          </div>

          {/* ---------------- The word, undivided ---------------- */}
          <p className="mt-5 text-xs text-muted-foreground">{PROMPT}</p>
          <p className="afl-headword mt-2 text-[clamp(2rem,6vw,3.25rem)] text-foreground">
            {round.word}
          </p>

          {/* ---------------- The six counts ---------------- */}
          <ul className="mt-6 flex flex-wrap gap-2" style={{ listStyle: "none" }}>
            {choices.map((choice) => {
              const isAnswer = choice === round.count;
              const isPicked = choice === state.picked;
              const accent =
                settled && isAnswer
                  ? "var(--success)"
                  : settled && isPicked
                    ? "var(--danger)"
                    : null;

              return (
                <li key={choice}>
                  <button
                    type="button"
                    onClick={() => answer(choice)}
                    disabled={settled}
                    aria-label={`${choice} ${plural(choice)}`}
                    aria-pressed={isPicked}
                    className="afl-tile w-12 text-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-default sm:w-14 sm:text-2xl"
                    style={
                      accent
                        ? { boxShadow: `inset 0 0 0 2px ${accent}`, color: accent }
                        : undefined
                    }
                  >
                    {choice}
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-3 text-xs text-muted-foreground">
            Tab to move between the six, Enter or Space to choose. Keys 1 to {maxCount} work too.
          </p>

          {settled ? (
            <div className="mt-5 grid gap-4">
              <Reveal
                tone={state.picked === round.count ? "correct" : "wrong"}
                slug={round.slug}
                word={round.word}
              >
                {/* The split, with the stressed syllable inked. */}
                <SyllableLine parts={round.parts} stress={round.stress} size="lg" />

                <dl className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">Pronunciation</dt>
                    <dd className="mt-0.5 font-mono text-[0.9375rem] text-foreground">
                      /{round.ipa}/
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Say it</dt>
                    <dd className="mt-0.5 text-[0.9375rem] text-foreground">{round.respelling}</dd>
                  </div>
                </dl>

                <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {/* The count, then the reason — the note already says where the
                      stress sits, so repeating the position here would only crowd it. */}
                  <strong className="font-semibold text-foreground">
                    {round.count} {plural(round.count)}.
                  </strong>{" "}
                  {round.note}
                </p>
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

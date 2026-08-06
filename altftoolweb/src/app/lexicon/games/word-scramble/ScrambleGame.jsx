"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Delete, Eye } from "lucide-react";
import { CommonnessMeter, PosChips } from "../../_components/WordAtoms";
import { hashString, seededShuffle } from "../_shared/rng";
import {
  BTN_PRIMARY,
  BTN_QUIET,
  RestartButton,
  Reveal,
  RoundShell,
  Scoreboard,
  Summary,
} from "../_shared/GameUI";

/*
 * The scramble.
 *
 * Two ways in, because the two devices people play this on want different
 * things: a text field, which is what a keyboard wants, and a row of letter
 * tiles, which is what a thumb wants. They write to the same state, so a player
 * can start with tiles and finish by typing without the game noticing.
 *
 * Nothing is fetched. `rounds` arrives complete from the server page.
 */

const START = {
  index: 0,
  guess: "",
  status: "playing",
  attempts: 0,
  score: 0,
  asked: 0,
  streak: 0,
  best: 0,
  message: "Rearrange the letters into the word the definition describes.",
};

export default function ScrambleGame({ rounds }) {
  const [order, setOrder] = useState(rounds);
  const [state, setState] = useState(START);
  const [run, setRun] = useState(0);
  const inputRef = useRef(null);

  const round = order[state.index];
  const finished = state.index >= order.length;
  const settled = state.status !== "playing";

  /*
   * Which tiles the current guess has already consumed.
   *
   * Derived rather than stored, so typing "staff" by hand greys the same tiles
   * that tapping them would have. First-occurrence-wins, which is the only rule
   * that behaves sensibly when a word has a repeated letter.
   */
  const tiles = useMemo(() => {
    if (!round) return [];
    const remaining = {};
    for (const character of state.guess.toLowerCase()) {
      remaining[character] = (remaining[character] || 0) + 1;
    }
    return round.scrambled.split("").map((letter) => {
      if (remaining[letter] > 0) {
        remaining[letter] -= 1;
        return { letter, used: true };
      }
      return { letter, used: false };
    });
  }, [round, state.guess]);

  const focusInput = () => {
    // Deferred so focus lands after React has re-enabled the field.
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const addLetter = (letter) => {
    if (settled) return;
    setState((current) => ({ ...current, guess: current.guess + letter }));
  };

  const backspace = () => {
    if (settled) return;
    setState((current) => ({ ...current, guess: current.guess.slice(0, -1) }));
  };

  const check = (event) => {
    event.preventDefault();
    if (settled || !round) return;

    const attempt = state.guess.trim().toLowerCase();
    if (!attempt) return;

    if (attempt === round.word) {
      setState((current) => {
        const streak = current.streak + 1;
        return {
          ...current,
          status: "correct",
          score: current.score + 1,
          asked: current.asked + 1,
          streak,
          best: Math.max(current.best, streak),
          message: `Correct — ${round.word}.`,
        };
      });
      return;
    }

    setState((current) => ({
      ...current,
      attempts: current.attempts + 1,
      message: `${attempt} is not it. Every letter is used exactly once — try again, or reveal the answer.`,
    }));
  };

  const reveal = () => {
    if (settled || !round) return;
    setState((current) => ({
      ...current,
      status: "revealed",
      asked: current.asked + 1,
      streak: 0,
      message: `The word was ${round.word}.`,
    }));
  };

  const next = () => {
    setState((current) => ({
      ...current,
      index: current.index + 1,
      guess: "",
      status: "playing",
      attempts: 0,
      message:
        current.index + 1 >= order.length
          ? "That was the last word."
          : "Rearrange the letters into the word the definition describes.",
    }));
    focusInput();
  };

  /*
   * Restart reshuffles rather than replaying.
   *
   * Done in the event handler, never during render: the first paint has to
   * match the server HTML exactly, and a shuffle at render time is the classic
   * way to break hydration on a page that is otherwise static.
   */
  const restart = () => {
    setOrder(seededShuffle(rounds, hashString(`scramble-run-${run + 1}`)));
    setRun(run + 1);
    setState(START);
    focusInput();
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
          Play again and the same thirty words come back in a different order.
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

          {/* ---------------- The scrambled letters ---------------- */}
          <ul
            className="mt-5 flex flex-wrap gap-2"
            style={{ listStyle: "none" }}
            aria-label={`Scrambled letters: ${round.scrambled.split("").join(" ")}`}
          >
            {tiles.map((tile, position) => (
              <li key={`${tile.letter}-${position}`}>
                <button
                  type="button"
                  onClick={() => addLetter(tile.letter)}
                  disabled={settled}
                  aria-label={`Add the letter ${tile.letter}`}
                  className="afl-tile w-11 text-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas sm:w-12 sm:text-2xl"
                  style={tile.used ? { opacity: 0.32 } : undefined}
                >
                  {tile.letter}
                </button>
              </li>
            ))}
          </ul>

          {/* ---------------- The hint ---------------- */}
          <p className="mt-6 text-xs text-muted-foreground">Definition</p>
          <p className="afl-sense__gloss mt-1">{round.gloss}</p>

          {/* ---------------- The answer ---------------- */}
          <form onSubmit={check} className="mt-6">
            <label
              htmlFor="scramble-answer"
              className="block text-xs text-muted-foreground"
            >
              Your answer ({round.word.length} letters)
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                id="scramble-answer"
                ref={inputRef}
                type="text"
                value={state.guess}
                onChange={(event) => setState((c) => ({ ...c, guess: event.target.value }))}
                disabled={settled}
                maxLength={round.word.length + 4}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                inputMode="text"
                className="h-12 min-w-0 flex-1 rounded-lg border border-border bg-surface px-4 font-mono text-lg tracking-[0.14em] text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 motion-reduce:transition-none"
              />
              <button type="submit" className={BTN_PRIMARY} disabled={settled}>
                <Check className="h-4 w-4" aria-hidden="true" />
                Check
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={backspace} className={BTN_QUIET} disabled={settled}>
                <Delete className="h-4 w-4" aria-hidden="true" />
                Backspace
              </button>
              <button type="button" onClick={reveal} className={BTN_QUIET} disabled={settled}>
                <Eye className="h-4 w-4" aria-hidden="true" />
                Reveal
              </button>
              <RestartButton onRestart={restart} />
            </div>
          </form>

          {settled ? (
            <div className="mt-5 grid gap-4">
              <Reveal
                tone={state.status === "correct" ? "correct" : "wrong"}
                slug={round.slug}
                word={round.word}
              >
                <p className="afl-headword text-3xl text-foreground">{round.word}</p>
                <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {round.gloss}
                </p>
                <p className="text-xs text-muted-foreground">
                  {state.status === "correct"
                    ? state.attempts === 0
                      ? "Solved first try."
                      : `Solved after ${state.attempts} wrong ${
                          state.attempts === 1 ? "guess" : "guesses"
                        }.`
                    : "Revealed — this one does not count towards the score."}
                </p>
              </Reveal>
              <div>
                <button type="button" onClick={next} className={BTN_PRIMARY}>
                  {state.index + 1 >= order.length ? "See your score" : "Next word"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : null}
        </RoundShell>
      )}
    </div>
  );
}

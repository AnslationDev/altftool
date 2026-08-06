"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { ArrowRight, Lightbulb, ListRestart, Play, Trophy } from "lucide-react";
import GameShell from "@/tools/_shared/game/GameShell";
import useBestScore from "@/tools/_shared/game/useBestScore";
import HangmanFigure from "../components/HangmanFigure";
import LetterKeys from "../components/LetterKeys";
import createSoundEngine from "../lib/sound";
import { ALL_CATEGORY_ID, CATEGORIES, pickWord } from "../lib/words";

const MAX_WRONG = 6;
const MAX_HINTS = 2;
const HINT_COST = 15;
const RECENT_WORDS_LIMIT = 10;

const PRIMARY_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const SECONDARY_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function isWordComplete(word, letterStates) {
  return [...new Set(word)].every((letter) => letterStates[letter] === "correct");
}

function countWrong(letterStates) {
  return Object.values(letterStates).filter((state) => state === "wrong").length;
}

function roundPoints(livesLeft, hintsUsed) {
  return Math.max(5, 20 + livesLeft * 10 - hintsUsed * HINT_COST);
}

// All round state lives in one reducer so rapid inputs (fast typing, key
// rollover on physical keyboards) always apply against the latest state and
// never a stale render snapshot.
// status: ready -> playing <-> paused -> won | lost -> (next word) playing / (restart) ready
const INITIAL_STATE = {
  status: "ready",
  round: null, // { word, categoryLabel }
  letterStates: {}, // letter -> "correct" | "wrong"
  hintsUsed: 0,
  score: 0,
  streak: 0,
  lastPoints: 0,
  fx: null, // { sound, id } — id is monotonic so each sound plays exactly once
};

function withFx(state, sound) {
  return { sound, id: (state.fx ? state.fx.id : 0) + 1 };
}

function reducer(state, action) {
  switch (action.type) {
    case "start":
      return {
        ...state,
        status: "playing",
        round: action.round,
        letterStates: {},
        hintsUsed: 0,
        lastPoints: 0,
      };
    case "guess": {
      const { letter } = action;
      if (state.status !== "playing" || !state.round || state.letterStates[letter]) {
        return state;
      }
      const { word } = state.round;
      if (word.includes(letter)) {
        const letterStates = { ...state.letterStates, [letter]: "correct" };
        if (isWordComplete(word, letterStates)) {
          const points = roundPoints(MAX_WRONG - countWrong(letterStates), state.hintsUsed);
          return {
            ...state,
            letterStates,
            status: "won",
            score: state.score + points,
            streak: state.streak + 1,
            lastPoints: points,
            fx: withFx(state, "win"),
          };
        }
        return { ...state, letterStates, fx: withFx(state, "correct") };
      }
      const letterStates = { ...state.letterStates, [letter]: "wrong" };
      if (countWrong(letterStates) >= MAX_WRONG) {
        return { ...state, letterStates, status: "lost", streak: 0, fx: withFx(state, "lose") };
      }
      return { ...state, letterStates, fx: withFx(state, "wrong") };
    }
    case "hint": {
      if (state.status !== "playing" || !state.round || state.hintsUsed >= MAX_HINTS) {
        return state;
      }
      const hidden = [...new Set(state.round.word)].filter(
        (letter) => state.letterStates[letter] !== "correct",
      );
      if (hidden.length === 0) return state;
      // `rand` comes in on the action so the reducer stays pure.
      const letter = hidden[Math.floor(action.rand * hidden.length)];
      const hintsUsed = state.hintsUsed + 1;
      const letterStates = { ...state.letterStates, [letter]: "correct" };
      if (isWordComplete(state.round.word, letterStates)) {
        const points = roundPoints(MAX_WRONG - countWrong(letterStates), hintsUsed);
        return {
          ...state,
          letterStates,
          hintsUsed,
          status: "won",
          score: state.score + points,
          streak: state.streak + 1,
          lastPoints: points,
          fx: withFx(state, "win"),
        };
      }
      return { ...state, letterStates, hintsUsed, fx: withFx(state, "hint") };
    }
    case "togglePause":
      if (state.status === "playing") return { ...state, status: "paused" };
      if (state.status === "paused") return { ...state, status: "playing" };
      return state;
    case "restart":
      // Carry `fx` so its monotonic id survives the reset — otherwise the
      // sound effect could replay after restart.
      return { ...INITIAL_STATE, fx: state.fx };
    default:
      return state;
  }
}

export default function ToolHome() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const { status, round, letterStates, hintsUsed, score, streak, lastPoints, fx } = state;
  const [categoryId, setCategoryId] = useState(ALL_CATEGORY_ID);
  const [soundOn, setSoundOn] = useState(true);

  const [bestScore, submitBestScore] = useBestScore("hangman");
  const [bestStreak, submitBestStreak] = useBestScore("hangman-streak");

  const recentWordsRef = useRef([]);
  const soundRef = useRef(null);

  const playSound = useCallback(
    (name) => {
      if (!soundOn) return;
      if (!soundRef.current) soundRef.current = createSoundEngine();
      soundRef.current[name]?.();
    },
    [soundOn],
  );

  useEffect(() => {
    return () => {
      soundRef.current?.dispose();
      soundRef.current = null;
    };
  }, []);

  // Play each fx exactly once. The monotonic id guards StrictMode re-runs and
  // effect re-runs caused by unrelated dependency changes (e.g. mute toggle).
  const lastFxIdRef = useRef(0);
  useEffect(() => {
    if (!fx || fx.id <= lastFxIdRef.current) return;
    lastFxIdRef.current = fx.id;
    playSound(fx.sound);
  }, [fx, playSound]);

  // Record bests when a round is won; submit() only keeps improvements, so
  // re-runs while status stays "won" are harmless.
  useEffect(() => {
    if (status !== "won") return;
    submitBestScore(score);
    submitBestStreak(streak);
  }, [status, score, streak, submitBestScore, submitBestStreak]);

  const wrongCount = useMemo(() => countWrong(letterStates), [letterStates]);

  const startRound = useCallback((nextCategoryId) => {
    const next = pickWord(nextCategoryId, recentWordsRef.current);
    recentWordsRef.current = [...recentWordsRef.current, next.word].slice(-RECENT_WORDS_LIMIT);
    dispatch({ type: "start", round: next });
  }, []);

  const guessLetter = useCallback((letter) => {
    dispatch({ type: "guess", letter });
  }, []);

  const revealHint = useCallback(() => {
    dispatch({ type: "hint", rand: Math.random() });
  }, []);

  const nextWord = useCallback(() => {
    startRound(categoryId);
  }, [startRound, categoryId]);

  const restart = useCallback(() => {
    dispatch({ type: "restart" });
  }, []);

  const togglePause = useCallback(() => {
    dispatch({ type: "togglePause" });
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key;
      if (status === "playing" && /^[a-zA-Z]$/.test(key)) {
        event.preventDefault();
        guessLetter(key.toUpperCase());
        return;
      }
      // Let Enter/Space activate a focused button normally instead of
      // hijacking it for the global start/next-word shortcut.
      const onInteractiveTarget =
        event.target instanceof Element &&
        event.target.closest("button, a, input, select, textarea") !== null;
      if (status === "ready" && (key === "Enter" || key === " ") && !onInteractiveTarget) {
        event.preventDefault();
        startRound(categoryId);
        return;
      }
      if (
        (status === "won" || status === "lost") &&
        (key === "Enter" || key === " ") &&
        !onInteractiveTarget
      ) {
        event.preventDefault();
        nextWord();
        return;
      }
      if (key === "Escape" && (status === "playing" || status === "paused")) {
        event.preventDefault();
        togglePause();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [status, categoryId, guessLetter, startRound, nextWord, togglePause]);

  const stats = [
    { label: "Score", value: score },
    { label: "Best", value: bestScore ?? 0 },
    { label: "Streak", value: streak },
    { label: "Best streak", value: bestStreak ?? 0 },
  ];

  const inRound = status === "playing" || status === "paused" || status === "won" || status === "lost";

  return (
    <GameShell
      title="Hangman"
      stats={stats}
      onRestart={restart}
      paused={status === "paused"}
      onTogglePause={status === "playing" || status === "paused" ? togglePause : undefined}
      soundOn={soundOn}
      onToggleSound={() => setSoundOn((current) => !current)}
      help="Guess the hidden word one letter at a time — six wrong guesses ends the round. Type letters or tap the keyboard, press Enter for the next word, and Escape to pause. Hints reveal a letter but cost points."
    >
      {status === "ready" ? (
        <div className="flex flex-col items-center gap-5 rounded-lg bg-muted p-4 py-8 sm:p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground">Pick a category</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Reveal the word before the drawing is finished. Build a streak of wins!
            </p>
          </div>
          <div className="flex w-full max-w-md flex-wrap justify-center gap-2" role="group" aria-label="Word category">
            {[{ id: ALL_CATEGORY_ID, label: "All categories" }, ...CATEGORIES].map((category) => {
              const selected = categoryId === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setCategoryId(category.id)}
                  aria-pressed={selected}
                  className={
                    selected
                      ? "inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      : "inline-flex min-h-11 items-center rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  }
                >
                  {category.label}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => startRound(categoryId)} className={PRIMARY_BUTTON_CLASS}>
            <Play className="h-4 w-4" aria-hidden="true" />
            Start game
          </button>
        </div>
      ) : null}

      {inRound && round ? (
        <div className="flex flex-col gap-4">
          {/* Play area — defines its own background, legible in light and dark */}
          <div className="relative rounded-lg bg-muted p-3 sm:p-4">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-stretch sm:gap-4">
              <div className="h-40 w-32 shrink-0 text-foreground sm:h-52 sm:w-44">
                <HangmanFigure wrongCount={wrongCount} lost={status === "lost"} />
              </div>

              <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3">
                <div
                  className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-muted-foreground"
                  aria-live="polite"
                  role="status"
                >
                  <span className="rounded-md bg-card px-2.5 py-1">{round.categoryLabel}</span>
                  <span className="rounded-md bg-card px-2.5 py-1">
                    Guesses left{" "}
                    <span className="font-semibold tabular-nums text-foreground">{MAX_WRONG - wrongCount}</span>
                  </span>
                  <span className="sr-only">
                    {`Word: ${round.word
                      .split("")
                      .map((letter) =>
                        letterStates[letter] === "correct" || status === "lost" ? letter : "blank",
                      )
                      .join(", ")}.`}
                  </span>
                </div>

                <div
                  role="img"
                  className="flex flex-wrap justify-center gap-1.5"
                  aria-label={`Hidden word, ${round.word.length} letters: ${round.word
                    .split("")
                    .map((letter) =>
                      letterStates[letter] === "correct" || status === "lost" ? letter : "blank",
                    )
                    .join(", ")}`}
                >
                  {round.word.split("").map((letter, index) => {
                    const revealed = letterStates[letter] === "correct" || status === "lost";
                    const missed = status === "lost" && letterStates[letter] !== "correct";
                    return (
                      <span
                        key={`${letter}-${index}`}
                        aria-hidden="true"
                        className={`flex h-10 w-7 items-end justify-center border-b-4 pb-0.5 text-xl font-bold sm:h-11 sm:w-8 ${
                          revealed
                            ? missed
                              ? "border-rose-500/70 text-rose-500"
                              : "border-primary text-foreground"
                            : "border-foreground/30 text-transparent"
                        } motion-safe:transition-colors motion-safe:duration-200`}
                      >
                        {revealed ? letter : "•"}
                      </span>
                    );
                  })}
                </div>

                {status === "playing" ? (
                  <button
                    type="button"
                    onClick={revealHint}
                    disabled={hintsUsed >= MAX_HINTS}
                    className={`${SECONDARY_BUTTON_CLASS} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <Lightbulb className="h-4 w-4" aria-hidden="true" />
                    Hint ({MAX_HINTS - hintsUsed} left, -{HINT_COST} pts)
                  </button>
                ) : null}
              </div>
            </div>

            {status === "paused" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-card/95">
                <p className="text-base font-semibold text-foreground">Paused</p>
                <button type="button" onClick={togglePause} className={PRIMARY_BUTTON_CLASS}>
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Resume
                </button>
              </div>
            ) : null}
          </div>

          {/* Round result banner */}
          <div aria-live="polite">
            {status === "won" ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-primary/40 bg-primary/10 p-4 text-center">
                <p className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Trophy className="h-5 w-5 text-primary" aria-hidden="true" />
                  You got it! +{lastPoints} points
                </p>
                <p className="text-sm text-muted-foreground">
                  Streak {streak} — keep it going.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={nextWord} className={PRIMARY_BUTTON_CLASS}>
                    Next word
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={restart} className={SECONDARY_BUTTON_CLASS}>
                    <ListRestart className="h-4 w-4" aria-hidden="true" />
                    Change category
                  </button>
                </div>
              </div>
            ) : null}
            {status === "lost" ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-muted p-4 text-center">
                <p className="text-base font-semibold text-foreground">Out of guesses!</p>
                <p className="text-sm text-muted-foreground">
                  The word was <span className="font-bold tracking-wide text-foreground">{round.word}</span>. Your
                  streak has reset.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={nextWord} className={PRIMARY_BUTTON_CLASS}>
                    Try another word
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={restart} className={SECONDARY_BUTTON_CLASS}>
                    <ListRestart className="h-4 w-4" aria-hidden="true" />
                    Change category
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <LetterKeys
            letterStates={letterStates}
            disabled={status !== "playing"}
            onGuess={guessLetter}
          />
        </div>
      ) : null}
    </GameShell>
  );
}

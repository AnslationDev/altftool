"use client";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const BASE_KEY_CLASS =
  "flex min-h-11 min-w-0 items-center justify-center rounded-md border text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function keyClass(state, disabled) {
  if (state === "correct") {
    return `${BASE_KEY_CLASS} border-transparent bg-primary text-primary-foreground`;
  }
  if (state === "wrong") {
    return `${BASE_KEY_CLASS} border-transparent bg-muted text-muted-foreground opacity-50`;
  }
  if (disabled) {
    return `${BASE_KEY_CLASS} border-border bg-card text-muted-foreground opacity-60`;
  }
  return `${BASE_KEY_CLASS} border-border bg-card text-foreground hover:bg-muted active:bg-muted`;
}

/**
 * On-screen A-Z keyboard. `letterStates` maps a letter to "correct" | "wrong".
 * Keys are >= 44px tall for touch; used keys are disabled but stay visible so
 * the player can see what has already been tried.
 */
export default function LetterKeys({ letterStates, disabled, onGuess }) {
  return (
    <div
      role="group"
      aria-label="Letter keyboard"
      className="grid w-full grid-cols-7 gap-1.5 sm:grid-cols-9"
    >
      {LETTERS.map((letter) => {
        const state = letterStates[letter];
        const used = state === "correct" || state === "wrong";
        const stateLabel =
          state === "correct"
            ? ", in the word"
            : state === "wrong"
              ? ", not in the word"
              : "";
        return (
          <button
            key={letter}
            type="button"
            disabled={used || disabled}
            onClick={() => onGuess(letter)}
            className={keyClass(state, disabled)}
            aria-label={`Guess letter ${letter}${stateLabel}`}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
}

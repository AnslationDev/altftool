"use client";

import { useState, forwardRef, useImperativeHandle } from "react";

const GuessWinner = forwardRef(({ options, votes }, ref) => {
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);

  useImperativeHandle(ref, () => ({
    lockGuess() {
      setLocked(true);
    },
  }));

  const maxVotes = votes.length ? Math.max(...votes) : null;

  const winnerIndex =
    maxVotes !== null ? votes.indexOf(maxVotes) : null;

  const winner =
    winnerIndex !== null && winnerIndex !== -1
      ? options[winnerIndex]
      : null;

  // A tie exists when more than one option shares the top vote count.
  const tiedOptions =
    maxVotes !== null && maxVotes > 0
      ? options.filter((_, i) => votes[i] === maxVotes)
      : [];
  const isTie = tiedOptions.length > 1;

  return (
    <div className="text-center mt-2">
      <p className="font-medium mb-2">Guess the winner</p>

      <div className="flex flex-wrap justify-center gap-2">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => !locked && setSelected(opt)}
            className={`px-3 py-1.5 rounded transition ${
              selected === opt ? "bg-blue-500  text-white " : "bg-(--muted) text-(--foreground) hover:bg-(--primary) hover:text-white "
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {locked && selected && winner && (
        <p className="mt-2" aria-live="polite" role="status">
          {isTie
            ? `It's a tie between ${tiedOptions.join(" and ")}`
            : selected === winner
              ? "You guessed it right!! "
              : `Actual winner is ${winner}`}
        </p>
      )}
    </div>
  );
});

GuessWinner.displayName = "GuessWinner";

export default GuessWinner;

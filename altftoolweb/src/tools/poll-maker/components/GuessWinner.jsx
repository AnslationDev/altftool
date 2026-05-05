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

  const winnerIndex = votes.length
    ? votes.indexOf(Math.max(...votes))
    : null;

  const winner =
    winnerIndex !== null && winnerIndex !== -1
      ? options[winnerIndex]
      : null;

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
        <p className="mt-2">
          {selected === winner
            ? "You guessed it right!! "
            : `Actual winner is ${winner}`}
        </p>
      )}
    </div>
  );
});

GuessWinner.displayName = "GuessWinner";

export default GuessWinner;

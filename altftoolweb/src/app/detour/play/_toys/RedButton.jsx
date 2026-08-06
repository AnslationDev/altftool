"use client";

import { useState } from "react";

/*
 * One button, one instruction not to press it, and an escalating opinion about
 * the fact that you keep pressing it.
 *
 * The joke only works if the copy keeps escalating past the point the visitor
 * expects it to loop — most versions of this have six lines and run dry. After
 * the scripted lines it falls back to a generated tally, which reads as the
 * page having given up rather than as the page having run out.
 */

const LINES = [
  "Please do not press this button.",
  "You pressed it.",
  "It says, quite clearly, not to press it.",
  "Right, so we're doing this.",
  "There is genuinely nothing on the other side of this button.",
  "No prize. No easter egg. This is the whole thing.",
  "You could be doing almost anything else.",
  "Some of it would even be productive.",
  "We're not judging. We built the button.",
  "Although we did think it would take longer than this.",
  "Do you want to talk about it?",
  "Fair enough.",
  "For what it's worth, this is the most engagement we've had all week.",
  "The button is starting to feel used.",
  "That's a joke. The button has no feelings. Probably.",
  "Still here.",
  "Genuinely impressive commitment to a bit.",
  "We've run out of writing. You've won something after all.",
];

export default function RedButton() {
  const [count, setCount] = useState(0);

  const line =
    count === 0
      ? LINES[0]
      : (LINES[Math.min(count, LINES.length - 1)] ??
        `Press ${count}. Still nothing.`);

  const message =
    count >= LINES.length
      ? `Press number ${count}. Still nothing.`
      : line;

  return (
    <div className="flex min-h-[52vh] flex-col items-center justify-center gap-8 text-center">
      <p
        className="max-w-md text-balance text-lg font-medium sm:text-xl"
        aria-live="polite"
      >
        {message}
      </p>

      <button
        type="button"
        onClick={() => setCount((n) => n + 1)}
        className="dtr-big-button"
        aria-label="A large red button you were asked not to press"
      >
        <span aria-hidden="true">DO NOT PRESS</span>
      </button>

      {count > 0 ? (
        <p className="font-mono text-sm text-muted-foreground">
          Pressed <span className="font-semibold text-foreground">{count}</span>{" "}
          {count === 1 ? "time" : "times"}
        </p>
      ) : null}
    </div>
  );
}

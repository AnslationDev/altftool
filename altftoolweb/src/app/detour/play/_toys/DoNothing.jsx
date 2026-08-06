"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/*
 * A timer that counts how long you manage to do nothing.
 *
 * Any pointer movement, key press, scroll or touch resets it to zero. The
 * interesting design problem is what counts as "something": listening for every
 * event would reset on a phone simply being held, so touch is only counted on
 * an actual touchstart, and pointermove ignores sub-pixel jitter.
 *
 * Milestones are the reward loop — without them the page is a number that goes
 * up, and people leave after ten seconds.
 */

const MILESTONES = [
  { at: 10, text: "Ten seconds. A start." },
  { at: 30, text: "Thirty. Most people have moved by now." },
  { at: 60, text: "One minute of genuine stillness." },
  { at: 120, text: "Two minutes. This is officially a practice." },
  { at: 300, text: "Five minutes. Are you still there?" },
  { at: 600, text: "Ten minutes. We have run out of things to say." },
];

const JITTER_TOLERANCE = 6; // px — ignores trackpad drift and hand tremor.

function format(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function DoNothing() {
  const [seconds, setSeconds] = useState(0);
  const [best, setBest] = useState(0);
  const [resetFlash, setResetFlash] = useState(false);

  const secondsRef = useRef(0);
  const lastPointer = useRef(null);

  const reset = useCallback(() => {
    if (secondsRef.current === 0) return;
    setBest((current) => Math.max(current, secondsRef.current));
    secondsRef.current = 0;
    setSeconds(0);
    setResetFlash(true);
    setTimeout(() => setResetFlash(false), 420);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      secondsRef.current += 1;
      setSeconds(secondsRef.current);
    }, 1000);

    const onPointerMove = (event) => {
      const previous = lastPointer.current;
      lastPointer.current = { x: event.clientX, y: event.clientY };
      if (!previous) return;
      const moved = Math.hypot(event.clientX - previous.x, event.clientY - previous.y);
      if (moved > JITTER_TOLERANCE) reset();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", reset, { passive: true });
    window.addEventListener("keydown", reset);
    window.addEventListener("wheel", reset, { passive: true });
    window.addEventListener("touchstart", reset, { passive: true });

    return () => {
      clearInterval(tick);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", reset);
      window.removeEventListener("keydown", reset);
      window.removeEventListener("wheel", reset);
      window.removeEventListener("touchstart", reset);
    };
  }, [reset]);

  const milestone = [...MILESTONES].reverse().find((m) => seconds >= m.at);

  return (
    <div className="flex min-h-[52vh] flex-col items-center justify-center gap-6 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
        Do nothing
      </p>

      <p
        className={`font-mono text-6xl font-bold tabular-nums transition-opacity duration-300 sm:text-8xl ${
          resetFlash ? "opacity-30" : "opacity-100"
        }`}
        style={{ color: "var(--dtr-accent)" }}
        aria-live="off"
      >
        {format(seconds)}
      </p>

      <p className="max-w-sm text-balance text-muted-foreground" aria-live="polite">
        {resetFlash
          ? "You moved."
          : (milestone?.text ??
            "Move the mouse, press a key or scroll and it starts again.")}
      </p>

      {best > 0 ? (
        <p className="font-mono text-sm text-muted-foreground">
          Best: <span className="font-semibold text-foreground">{format(best)}</span>
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/*
 * The Most Useless Machine, as a web page.
 *
 * Flick the switch on; a hand reaches out of the box and flicks it back off.
 * The original is a physical object by Marvin Minsky by way of Claude Shannon,
 * and the entire charm is the delay — the machine appears to consider the
 * request before refusing it.
 *
 * The delay is randomised and occasionally long, because a fixed 600ms reads as
 * a scripted animation rather than as something with an opinion. `mood` picks
 * the flavour of refusal so repeated flicks are not identical.
 */

const MOODS = [
  { delay: 700, note: "" },
  { delay: 1500, note: "" },
  { delay: 350, note: "" },
  { delay: 2600, note: "It had to think about that one." },
  { delay: 500, note: "" },
  { delay: 4200, note: "It nearly let you have that." },
];

export default function UselessSwitch() {
  const [on, setOn] = useState(false);
  const [reaching, setReaching] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [note, setNote] = useState("");

  const timers = useRef([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const flick = () => {
    if (on || reaching) return;

    setOn(true);
    setAttempts((n) => n + 1);
    setNote("");

    const mood = MOODS[Math.floor(Math.random() * MOODS.length)];

    timers.current.push(
      setTimeout(() => {
        setReaching(true);

        timers.current.push(
          setTimeout(() => {
            setOn(false);
            setNote(mood.note);

            timers.current.push(
              setTimeout(() => setReaching(false), 420),
            );
          }, 380),
        );
      }, mood.delay),
    );
  };

  return (
    <div className="flex min-h-[52vh] flex-col items-center justify-center gap-8 text-center">
      <div className="dtr-switch-box">
        <div className={`dtr-switch-lid${reaching ? " dtr-switch-lid--open" : ""}`} />
        <div className={`dtr-switch-hand${reaching ? " dtr-switch-hand--out" : ""}`} aria-hidden="true" />

        <button
          type="button"
          onClick={flick}
          role="switch"
          aria-checked={on}
          aria-label="A switch that refuses to stay on"
          className={`dtr-switch${on ? " dtr-switch--on" : ""}`}
        >
          <span className="dtr-switch-knob" />
        </button>
      </div>

      <div className="min-h-12">
        <p className="text-lg font-medium" aria-live="polite">
          {on ? "On." : "Off."}
        </p>
        {note ? (
          <p className="mt-1 text-sm text-muted-foreground">{note}</p>
        ) : null}
      </div>

      <p className="max-w-sm text-balance text-sm text-muted-foreground">
        {attempts === 0
          ? "Turn it on."
          : `You have turned it on ${attempts} ${attempts === 1 ? "time" : "times"}. It has turned itself off just as often.`}
      </p>
    </div>
  );
}

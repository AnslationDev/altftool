"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";

/*
 * Infinite bubble wrap.
 *
 * Popped bubbles refill on a stagger rather than all at once, so the sheet
 * never presents a wall of unpopped bubbles and never empties. Dragging pops a
 * run, which is the half of the real-world experience most versions miss.
 *
 * Sound is generated with WebAudio rather than shipped as a file: a short
 * filtered noise burst is a closer match to the real thing than any sample this
 * small would be, and it keeps the page asset-free. It is off until the user
 * turns it on, because autoplaying audio is hostile and browsers block it anyway.
 */

const COLS = 14;
const ROWS = 18;
const REFILL_MS = 2600;

export default function BubbleWrap() {
  const [popped, setPopped] = useState(() => new Set());
  const [total, setTotal] = useState(0);
  const [sound, setSound] = useState(false);

  const draggingRef = useRef(false);
  const audioRef = useRef(null);
  const timersRef = useRef(new Map());

  const cells = useMemo(
    () => Array.from({ length: COLS * ROWS }, (_, index) => index),
    [],
  );

  const playPop = useCallback(() => {
    if (!sound) return;
    try {
      if (!audioRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audioRef.current = new Ctx();
      }
      const ctx = audioRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // A fast downward pitch sweep reads as a "pop" far better than a click.
      osc.type = "triangle";
      osc.frequency.setValueAtTime(820 + Math.random() * 260, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.055);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Audio is decoration; a blocked or unavailable context must not break
      // the toy, and there is nothing useful to tell the user about it.
    }
  }, [sound]);

  const pop = useCallback(
    (index) => {
      setPopped((current) => {
        if (current.has(index)) return current;
        const next = new Set(current);
        next.add(index);
        return next;
      });

      setTotal((count) => count + 1);
      playPop();

      // Each bubble refills on its own timer so the sheet regenerates
      // organically instead of snapping back in one frame.
      if (!timersRef.current.has(index)) {
        const timer = setTimeout(
          () => {
            timersRef.current.delete(index);
            setPopped((current) => {
              if (!current.has(index)) return current;
              const next = new Set(current);
              next.delete(index);
              return next;
            });
          },
          REFILL_MS + Math.random() * 1800,
        );
        timersRef.current.set(index, timer);
      }
    },
    [playPop],
  );

  useEffect(() => {
    const stop = () => {
      draggingRef.current = false;
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, []);

  // The Map instance is created once and never replaced, so reading it inside
  // the effect is both correct and the only place a ref may be touched.
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  const reset = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setPopped(new Set());
    setTotal(0);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="dtr-wrap grid w-full max-w-lg gap-1 rounded-2xl border border-border bg-card p-3 sm:gap-1.5 sm:p-4"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        onPointerDown={() => {
          draggingRef.current = true;
        }}
      >
        {cells.map((index) => {
          const isPopped = popped.has(index);
          return (
            <button
              key={index}
              type="button"
              className={`dtr-bubble${isPopped ? " dtr-bubble--popped" : ""}`}
              aria-label={isPopped ? "Popped bubble" : "Unpopped bubble"}
              aria-pressed={isPopped}
              onPointerDown={() => pop(index)}
              onPointerEnter={() => {
                if (draggingRef.current) pop(index);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  pop(index);
                }
              }}
            />
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <p className="font-mono text-sm text-muted-foreground">
          Popped: <span className="font-semibold text-foreground">{total}</span>
        </p>
        <button
          type="button"
          onClick={() => setSound((on) => !on)}
          aria-pressed={sound}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
        >
          {sound ? (
            <Volume2 className="h-4 w-4" aria-hidden="true" />
          ) : (
            <VolumeX className="h-4 w-4" aria-hidden="true" />
          )}
          Sound {sound ? "on" : "off"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Fresh sheet
        </button>
      </div>
    </div>
  );
}

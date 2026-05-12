"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { analyzeTaps, applyBeatsToSlides } from "../utils/beatSync";

export default function BeatTapEditor({ slides, onApply }) {
  const [taps,       setTaps]       = useState([]);
  const [isListening, setListening] = useState(false);
  const [bpm,        setBpm]        = useState(0);
  const [applied,    setApplied]    = useState(false);
  const startRef = useRef(null);

  // ── Tap handler ──
  const recordTap = useCallback(() => {
    const now = performance.now();
    if (!startRef.current) startRef.current = now;

    const relative = now - startRef.current;

    setTaps((prev) => {
      const next = [...prev, relative];
      const { bpm } = analyzeTaps(next);
      setBpm(bpm);
      return next;
    });
    setApplied(false);
  }, []);

  // ── Spacebar listener ──
  useEffect(() => {
    if (!isListening) return;

    const onKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        recordTap();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isListening, recordTap]);

  const handleStart = () => {
    setTaps([]);
    setBpm(0);
    setApplied(false);
    startRef.current = null;
    setListening(true);
  };

  const handleStop = () => setListening(false);

  const handleApply = () => {
    if (taps.length < 2) return;
    const updated = applyBeatsToSlides(slides, taps);
    onApply(updated);
    setApplied(true);
  };

  const handleClear = () => {
    setTaps([]);
    setBpm(0);
    setApplied(false);
    startRef.current = null;
    setListening(false);
  };

  // Visual beat flash
  const lastTap   = taps[taps.length - 1];
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (!lastTap) return;
    const startFlash = setTimeout(() => setFlash(true), 0);
    const t = setTimeout(() => setFlash(false), 120);
    return () => {
      clearTimeout(startFlash);
      clearTimeout(t);
    };
  }, [lastTap]);

  return (
    <div className="w-full rounded-2xl border border-(--border) bg-(--muted)/20 p-4 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-(--foreground)">Beat Tap Sync</p>
          <p className="text-xs text-(--muted-foreground) mt-0.5">
            Tap spacebar to mark slide transitions
          </p>
        </div>
        {bpm > 0 && (
          <div className="text-right">
            <p className="text-xl font-bold text-(--primary)">{bpm}</p>
            <p className="text-[10px] text-(--muted-foreground)">BPM</p>
          </div>
        )}
      </div>

      {/* Big tap button + flash ring */}
      <div className="flex justify-center">
        <button
          onClick={isListening ? recordTap : handleStart}
          className={`
            relative w-24 h-24 rounded-full font-bold text-sm transition-all duration-100 cursor-pointer
            flex items-center justify-center select-none
            ${isListening
              ? "bg-(--primary) text-(--primary-foreground) scale-95 shadow-lg"
              : "border-2 border-(--border) text-(--foreground) hover:border-(--primary)"}
            ${flash ? "scale-[1.08]" : ""}
          `}
        >
          {/* Pulse ring when listening */}
          {isListening && (
            <span className="absolute inset-0 rounded-full border-2 border-(--primary) animate-ping opacity-40" />
          )}
          {isListening ? "TAP" : "START"}
        </button>
      </div>

      {/* Tap counter + timeline dots */}
      {taps.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-(--muted-foreground)">
            <span>{taps.length} tap{taps.length !== 1 ? "s" : ""} recorded</span>
            <span>{taps.length >= 2
              ? `${taps.length - 1} transition${taps.length > 2 ? "s" : ""}`
              : "tap more to set transitions"}
            </span>
          </div>

          {/* Visual dot timeline */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {taps.map((tap, i) => (
              <div key={i} className="flex items-center gap-1 flex-shrink-0">
                <div className={`
                  w-3 h-3 rounded-full flex-shrink-0 transition-all
                  ${i === taps.length - 1
                    ? "bg-(--primary) scale-125"
                    : "bg-(--primary)/50"}
                `} />
                {i < taps.length - 1 && (
                  <div
                    className="h-0.5 bg-(--border) flex-shrink-0"
                    style={{
                      width: Math.min(
                        80,
                        Math.max(12, ((taps[i + 1] - tap) / 500) * 20)
                      ),
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Per-tap durations */}
          {taps.length >= 2 && (
            <div className="flex gap-1 flex-wrap">
              {taps.slice(1).map((tap, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-(--muted) text-(--muted-foreground) px-1.5 py-0.5 rounded-full"
                >
                  {((tap - taps[i]) / 1000).toFixed(2)}s
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={handleStop}
          disabled={!isListening}
          className="py-2 rounded-xl border border-(--border) text-xs font-medium text-(--foreground) hover:bg-(--muted)/60 disabled:opacity-40 transition cursor-pointer"
        >
          ⏹ Stop
        </button>
        <button
          onClick={handleApply}
          disabled={taps.length < 2}
          className="py-2 rounded-xl text-xs font-medium transition cursor-pointer
            bg-(--primary) text-(--primary-foreground) hover:opacity-90 disabled:opacity-40"
        >
          {applied ? "✓ Applied" : "✓ Apply"}
        </button>
        <button
          onClick={handleClear}
          disabled={!taps.length}
          className="py-2 rounded-xl border border-(--border) text-xs font-medium text-(--foreground) hover:bg-(--muted)/60 disabled:opacity-40 transition cursor-pointer"
        >
          ✕ Clear
        </button>
      </div>

      {/* Hint */}
      <p className="text-[12px] text-center text-(--muted-foreground)">
        {isListening
          ? "Press SPACE or tap the button on each beat"
          : taps.length >= 2
            ? `${slides.length} slides · ${taps.length - 1} beats mapped → hit Apply`
            : "Press START then tap the beat of your music"}
      </p>
    </div>
  );
}

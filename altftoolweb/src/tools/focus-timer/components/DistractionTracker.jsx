"use client";

import { useState } from "react";
import { AlertTriangle, ZapOff } from "lucide-react";

export default function DistractionTracker({ isRunning, phase, seconds, totalSeconds, onDistraction, locked}) {
  const [distractions, setDistractions] = useState(0);
  const [distractionTimes, setDistractionTimes] = useState([]);

  const handleDistraction = () => {
    const elapsed = totalSeconds - seconds;
    setDistractions((prev) => prev + 1);
    setDistractionTimes((prev) => [...prev, elapsed]);
    onDistraction?.(); // callback to parent for score update
  };

  const avgDistractEvery = () => {
    if (distractionTimes.length === 0) return null;
    if (distractionTimes.length === 1) return Math.max(1, Math.round(distractionTimes[0] / 60));
    const gaps = [];
    for (let i = 1; i < distractionTimes.length; i++) {
      gaps.push(distractionTimes[i] - distractionTimes[i - 1]);
    }
    const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    return Math.max(1, Math.round(avg / 60));
  };

  // expose reset to parent via ref — OR just reset when distractions prop resets
  // simplest: parent calls reset by passing key prop to remount
  const isActive = isRunning && phase === "focus" && !locked;

  return (
    <div className="bg-(--background) border border-(--border) rounded-xl p-4 mb-4">

      {/* TOP ROW */}
      <div className="flex items-center justify-between flex-wrap gap-3">

        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-(--muted)">
            <AlertTriangle size={16} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-bold font-primary text-(--foreground)">
              Distraction Tracker
            </p>
            {distractions === 0 ? (
              <p className="text-xs text-(--muted-foreground) font-secondary">
                No distractions yet — stay locked in!
              </p>
            ) : (
              <p className="text-xs text-(--muted-foreground) font-secondary">
                {distractions} distraction{distractions > 1 ? "s" : ""} this session
                {avgDistractEvery() && (
                  <span className="ml-1 text-orange-500 font-semibold">
                    · every ~{avgDistractEvery()} min
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Right — button */}
        <button
          onClick={handleDistraction}
          disabled={!isActive}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-primary font-bold text-sm border transition-all duration-150
            ${!isActive
              ? "bg-(--muted) text-(--muted-foreground) border-(--border) cursor-not-allowed opacity-50"
              : "bg-orange-50 text-orange-500 border-orange-200 cursor-pointer hover:bg-orange-100"
            }`}
        >
          <ZapOff size={15} />
          I got distracted
        </button>

      </div>

      {/* DISTRACTION DOTS */}
      {distractions > 0 && (
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {Array.from({ length: distractions }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-orange-400"
              title={`Distraction ${i + 1}`}
            />
          ))}
        </div>
      )}

    </div>
  );
}
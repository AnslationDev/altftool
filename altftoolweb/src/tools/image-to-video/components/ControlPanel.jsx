"use client";
import { EASING_OPTIONS } from "../utils/easing";

export default function ControlPanel({ globalDuration, onDurationChange, easing, onEasingChange }) {
  return (
    <div className="w-full space-y-5 p-4 rounded-2xl border border-(--border) bg-(--muted)/20">

      {/* Duration slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-(--foreground)">Duration per slide</span>
          <span className="text-sm font-semibold text-(--primary)">{globalDuration}s</span>
        </div>
        <input
          type="range" min={1} max={8} step={0.5}
          value={globalDuration}
          onChange={(e) => onDurationChange(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[11px] text-(--muted-foreground) mt-1">
          <span>1s (fast)</span><span>8s (slow)</span>
        </div>
      </div>

      {/* Easing buttons */}
      <div>
        <span className="text-sm font-medium text-(--foreground) block mb-2">Speed curve</span>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
          {EASING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onEasingChange(opt.value)}
              className={`
                px-2 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer
                ${easing === opt.value
                  ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                  : "border-(--border) text-(--foreground) hover:border-(--primary)/50 hover:bg-(--muted)/40"}
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
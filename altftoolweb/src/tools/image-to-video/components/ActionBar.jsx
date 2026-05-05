"use client";

import { Shuffle, Sparkles, Camera, Play } from "lucide-react";

export default function ActionBar({
  onGenerate, onShuffle, onMakeBetter, onExportFrame,
  isGenerating, progress, hasSlides,
}) {
  return (
    <div className="w-full space-y-3">

      {/* Primary */}
      <button
        onClick={onGenerate}
        disabled={!hasSlides || isGenerating}
        className="w-full py-3 rounded-xl bg-(--primary) text-(--primary-foreground) font-semibold text-sm sm:text-base disabled:opacity-50 hover:opacity-90 active:scale-[.98] transition cursor-pointer"
      >
        <span className="flex items-center justify-center gap-2">
  <Play className="w-4 h-4" />
  {isGenerating ? `Generating… ${progress}%` : "Generate Video"}
</span>
      </button>

      {/* Progress bar */}
      {isGenerating && (
        <div className="w-full h-1.5 bg-(--muted) rounded-full overflow-hidden">
          <div
            className="h-full bg-(--primary) rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Secondary row */}
      <div className="grid grid-cols-3 gap-2">
        {[
  {
    label: "Shuffle",
    icon: Shuffle,
    onClick: onShuffle,
    title: "Randomise slide order",
  },
  {
    label: "Better",
    icon: Sparkles,
    onClick: onMakeBetter,
    title: "Auto-apply best preset",
  },
  {
    label: "Frame",
    icon: Camera,
    onClick: onExportFrame,
    title: "Export current frame as PNG",
  },
].map(({ label, icon: Icon, onClick, title }) => (
          <button
            key={label}
            onClick={onClick}
            disabled={!hasSlides}
            title={title}
            className="py-2 rounded-xl border border-(--border) text-xs sm:text-sm font-medium text-(--foreground) hover:bg-(--muted)/60 disabled:opacity-40 active:scale-[.97] transition cursor-pointer"
          >
            <span className="flex items-center justify-center gap-1.5">
  <Icon className="w-4 h-4" />
  {label}
</span>
          </button>
        ))}
      </div>
    </div>
  );
}
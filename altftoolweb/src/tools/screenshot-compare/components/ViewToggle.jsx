"use client";

const modes = [
  { key: "slider", label: "Slider", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
  { key: "side-by-side", label: "Side by Side", icon: "M9 17V7m0 0L5 11m4-4l4 4m2 10V7m0 0l-4 4m4-4l4 4" },
  { key: "diff", label: "Diff Overlay", icon: "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
];

export default function ViewToggle({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {modes.map((mode) => (
        <button
          key={mode.key}
          onClick={() => onChange(mode.key)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            active === mode.key
              ? "bg-(--primary) text-(--primary-foreground) shadow-md"
              : "border border-(--border) bg-(--background) text-(--foreground) hover:bg-(--muted)"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mode.icon} />
          </svg>
          {mode.label}
        </button>
      ))}
    </div>
  );
}

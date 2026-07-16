"use client";

const modes = [
  { key: "fast", label: "Fast" },
  { key: "balanced", label: "Balanced" },
  { key: "high-quality", label: "High Quality" },
  { key: "ultra", label: "Ultra Quality" },
  { key: "professional", label: "Professional" },
];

const aiDetection = [
  { key: "logo", label: "Logo" },
  { key: "text", label: "Text" },
  { key: "transparent", label: "Transparent" },
  { key: "semi-transparent", label: "Semi-transparent" },
  { key: "repeated", label: "Repeated" },
];

export default function RemovalControls({
  removalMode, setRemovalMode, selectionType, selectionTypeLabel,
  onCompute, onAIDetect, isProcessing, featherRadius, setFeatherRadius,
}) {
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-semibold text-(--foreground) mb-3">Removal Mode</h4>
        <div className="flex flex-wrap gap-2">
          {modes.map((mode) => (
            <button
              key={mode.key}
              onClick={() => setRemovalMode(mode.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                removalMode === mode.key
                  ? "bg-(--primary) text-(--primary-foreground) shadow-md"
                  : "border border-(--border) bg-(--background) text-(--foreground) hover:bg-(--muted)"
              }`}
            >{mode.label}</button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-(--foreground) mb-3">AI Detection</h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {aiDetection.map((d) => (
            <span key={d.key} className="px-2.5 py-1 rounded-full text-xs border border-(--border) bg-(--background) text-(--muted-foreground)">
              {d.label}
            </span>
          ))}
        </div>
        <button
          onClick={onAIDetect}
          disabled={isProcessing}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-(--primary) to-cyan-500 text-white font-medium hover:opacity-90 transition text-sm cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI Auto Detect & Remove
        </button>
      </div>

      <div className="border-t border-(--border) pt-4">
        <h4 className="text-sm font-semibold text-(--foreground) mb-3">Manual Removal</h4>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={onCompute}
            disabled={isProcessing || (selectionType !== "brush" && selectionType !== "rect")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-(--primary) text-(--primary-foreground) font-medium hover:opacity-90 transition text-sm cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Apply Removal
          </button>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-(--muted-foreground)">Feather:</label>
          <input
            type="range" min="0" max="15" value={featherRadius}
            onChange={(e) => setFeatherRadius(Number(e.target.value))}
            className="w-24 h-1.5 rounded-lg appearance-none cursor-pointer bg-(--border) accent-(--primary)"
          />
          <span className="text-xs text-(--foreground)">{featherRadius}px</span>
        </div>
      </div>
    </div>
  );
}

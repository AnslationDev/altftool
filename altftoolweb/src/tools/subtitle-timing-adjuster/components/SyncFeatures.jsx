"use client";

export default function SyncFeatures({
  sourceFps,
  setSourceFps,
  targetFps,
  setTargetFps,
  minGapMs,
  setMinGapMs,
  applyFpsMode,
  setApplyFpsMode,
  trimNegative,
  setTrimNegative,
  removeOverlaps,
  setRemoveOverlaps,
}) {
  return (
    <div className="rounded-xl border border-(--border) bg-(--background) p-4">
      <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">Professional Sync Features</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input value={sourceFps} onChange={(e) => setSourceFps(e.target.value)} type="number" step="0.001" placeholder="Source FPS" aria-label="Source frames per second" className="px-3 py-2 rounded-lg border border-(--border) bg-(--card) focus:outline-none focus:ring-2 focus:ring-(--primary)" />
        <input value={targetFps} onChange={(e) => setTargetFps(e.target.value)} type="number" step="0.001" placeholder="Target FPS" aria-label="Target frames per second" className="px-3 py-2 rounded-lg border border-(--border) bg-(--card) focus:outline-none focus:ring-2 focus:ring-(--primary)" />
        <input value={minGapMs} onChange={(e) => setMinGapMs(e.target.value)} type="number" placeholder="Minimum gap ms" aria-label="Minimum gap in milliseconds" className="px-3 py-2 rounded-lg border border-(--border) bg-(--card) focus:outline-none focus:ring-2 focus:ring-(--primary)" />
        <button
          onClick={() => setApplyFpsMode((v) => !v)}
          className={`px-3 py-2 rounded-lg border transition-colors ${applyFpsMode ? "bg-(--primary) text-white border-(--primary)" : "border-(--border) hover:border-(--primary)"}`}
        >
          {applyFpsMode ? "FPS Convert: ON" : "FPS Convert: OFF"}
        </button>
      </div>
      <div className="flex gap-3 mt-3">
        <button
          onClick={() => setTrimNegative((v) => !v)}
          className={`px-3 py-2 rounded-lg border transition-colors ${trimNegative ? "bg-(--primary) text-white border-(--primary)" : "border-(--border) hover:border-(--primary)"}`}
        >
          {trimNegative ? "Trim Negative: ON" : "Trim Negative: OFF"}
        </button>
        <button
          onClick={() => setRemoveOverlaps((v) => !v)}
          className={`px-3 py-2 rounded-lg border transition-colors ${removeOverlaps ? "bg-(--primary) text-white border-(--primary)" : "border-(--border) hover:border-(--primary)"}`}
        >
          {removeOverlaps ? "Fix Overlaps: ON" : "Fix Overlaps: OFF"}
        </button>
      </div>
    </div>
  );
}

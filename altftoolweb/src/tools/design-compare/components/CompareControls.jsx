import { Download, Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import { COMPARE_MODES } from "../constants/compareModes";

export default function CompareControls({ state }) {
  return (
    <aside className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <p className="text-xs font-semibold uppercase text-[var(--primary)]">Comparison</p>
      <div className="mt-4 grid gap-2">
        {COMPARE_MODES.map((mode) => (
          <button key={mode.id} type="button" onClick={() => state.setMode(mode.id)} className={`h-10 rounded-md border px-3 text-sm font-semibold transition focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] ${state.mode === mode.id ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"}`}>
            {mode.label}
          </button>
        ))}
      </div>

      <label className="mt-5 block text-sm font-semibold" htmlFor="design-opacity">Opacity</label>
      <input id="design-opacity" type="range" min="0" max="100" value={state.opacity} onChange={(event) => state.setOpacity(Number(event.target.value))} className="mt-2 w-full accent-[var(--primary)]" />

      <label className="mt-5 block text-sm font-semibold" htmlFor="design-slider">Slider</label>
      <input id="design-slider" type="range" min="0" max="100" value={state.slider} onChange={(event) => state.setSlider(Number(event.target.value))} className="mt-2 w-full accent-[var(--primary)]" />

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => state.setZoom(Math.max(0.5, state.zoom - 0.1))} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm font-semibold focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"><Minus className="h-4 w-4" /> Zoom</button>
        <button type="button" onClick={() => state.setZoom(Math.min(3, state.zoom + 0.1))} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm font-semibold focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"><Plus className="h-4 w-4" /> Zoom</button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => state.setShowGrid(!state.showGrid)} className="h-10 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm font-semibold focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]">Grid</button>
        <button type="button" onClick={() => state.setHighlightDiff(!state.highlightDiff)} className="h-10 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm font-semibold focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]">Diff</button>
      </div>

      <div className="mt-3 grid gap-2">
        <button type="button" onClick={state.resetView} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm font-semibold focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"><RotateCcw className="h-4 w-4" /> Reset view</button>
        <button type="button" onClick={() => document.fullscreenElement ? document.exitFullscreen() : state.previewRef.current?.requestFullscreen?.()} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm font-semibold focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"><Maximize2 className="h-4 w-4" /> Fullscreen</button>
        <button type="button" onClick={state.download} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--primary)] bg-[var(--primary)] text-sm font-semibold text-[var(--primary-foreground)] focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"><Download className="h-4 w-4" /> Download view</button>
      </div>
    </aside>
  );
}

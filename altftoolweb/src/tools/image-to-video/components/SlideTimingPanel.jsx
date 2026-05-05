"use client";
import { ENTRY_OPTIONS, EXIT_OPTIONS } from "../utils/transitions";
import { MASK_OPTIONS } from "../utils/maskTransitions";
export default function SlideTimingPanel({ slide, globalDuration, onChange }) {
  if (!slide) return null;

  const dur = slide.duration ?? globalDuration;
  const entryAnim = slide.entryAnim ?? "fadeIn";
  const exitAnim = slide.exitAnim ?? "fadeOut";
  const entryFrac = slide.entryFrac ?? 0.2;
  const exitFrac = slide.exitFrac ?? 0.2;

  const update = (key, val) => {
    onChange(slide.id, { [key]: val });
  };

  const entrySeconds = (entryFrac * dur).toFixed(1);
  const exitSeconds = (exitFrac * dur).toFixed(1);

  return (
    <div className="w-full rounded-2xl border border-(--border) bg-(--muted)/20 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg bg-cover bg-center flex-shrink-0 border border-(--border)"
          style={{ backgroundImage: `url(${slide.url})` }}
        />
        <div>
          <p className="text-sm font-semibold text-(--foreground)">
            Slide timing
          </p>
          <p className="text-xs text-(--muted-foreground)">
            Total: {dur}s &nbsp;·&nbsp; Entry: {entrySeconds}s &nbsp;·&nbsp;
            Exit: {exitSeconds}s
          </p>
        </div>
      </div>

      {/* Duration override */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-xs font-medium text-(--foreground)">
            Slide duration
          </span>
          <span className="text-xs font-semibold text-(--primary)">{dur}s</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={0.5}
          value={dur}
          onChange={(e) => update("duration", parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Entry */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-medium text-(--foreground) mb-1.5">
            ▶ Entry animation
          </p>
          <select
            value={entryAnim}
            onChange={(e) => update("entryAnim", e.target.value)}
            className="w-full text-xs bg-(--background) text-(--foreground) border border-(--border) rounded-lg px-2 py-1.5 cursor-pointer"
          >
            {ENTRY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-xs font-medium text-(--foreground) mb-1.5">
            ⏎ Exit animation
          </p>
          <select
            value={exitAnim}
            onChange={(e) => update("exitAnim", e.target.value)}
            className="w-full text-xs bg-(--background) text-(--foreground) border border-(--border) rounded-lg px-2 py-1.5 cursor-pointer"
          >
            {EXIT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Entry duration fraction */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-(--muted-foreground)">
              Entry length
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: "rgba(83,74,183,0.9)" }}
            >
              {entrySeconds}s
            </span>
          </div>
          <input
            type="range"
            min={0.05}
            max={0.45}
            step={0.05}
            value={entryFrac}
            onChange={(e) => update("entryFrac", parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-(--muted-foreground)">
              Exit length
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: "rgba(216,90,48,0.9)" }}
            >
              {exitSeconds}s
            </span>
          </div>
          <input
            type="range"
            min={0.05}
            max={0.45}
            step={0.05}
            value={exitFrac}
            onChange={(e) => update("exitFrac", parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      {/* Mask Transition picker */}
      <p className="text-xs font-medium text-(--foreground) mb-1.5">
        Mask transition to next slide
      </p>
      <div className="grid grid-cols-2 gap-1.5 ">
        {MASK_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => update("maskTransition", opt.value)}
            className={`
          py-1.5 px-2 rounded-lg text-xs font-medium border transition-all cursor-pointer text-center
          ${
            (slide.maskTransition ?? "none") === opt.value
              ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
              : "border-(--border) text-(--foreground) hover:border-(--primary)/50"
          }
        `}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <p className="text-[12px] text-(--muted-foreground) mt-1.5 text-center">
        Plays during last 40% of this slide → into next slide
      </p>
    </div>
  );
}

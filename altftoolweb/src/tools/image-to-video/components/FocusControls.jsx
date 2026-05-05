"use client";

export default function FocusControls({ slide, onChange }) {
  if (!slide) return null;

  const focus = slide.focus ?? { x: 50, y: 50, zoom: 1.2 };

  const update = (key, val) => {
    onChange(slide.id, {
      focus: { ...focus, [key]: val },
    });
  };

  return (
    <div className="w-full rounded-xl border border-(--border) bg-(--muted)/20 p-3 space-y-3">
      <p className="text-sm font-semibold">Focus Mode</p>

      {/* Zoom */}
      <div>
        <div className="flex justify-between text-xs">
          <span>Zoom</span>
          <span>{focus.zoom.toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min={1}
          max={2}
          step={0.05}
          value={focus.zoom}
          onChange={(e) => update("zoom", parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <p className="text-[12px] text-(--muted-foreground) text-center">
        Click on preview to set focus point
      </p>
    </div>
  );
}
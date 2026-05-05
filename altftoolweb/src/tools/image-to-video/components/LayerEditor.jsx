"use client";

const SHAPE_TYPES = [
  { value: "rect",    label: "Rectangle" },
  { value: "circle",  label: "Circle" },
  { value: "triangle",label: "Triangle" },
  { value: "line",    label: "Line" },
];

const FONT_FAMILIES = [
  "Arial", "Georgia", "Impact", "Courier New",
  "Trebuchet MS", "Palatino", "Verdana", "Comic Sans MS",
];

const FONT_WEIGHTS = [
  { value: "normal", label: "Regular" },
  { value: "bold",   label: "Bold" },
  { value: "900",    label: "Black" },
];

const TEXT_ALIGNS = ["left", "center", "right"];

export default function LayerEditor({ layer, onChange }) {
  if (!layer) {
    return (
      <div className="w-full rounded-2xl border border-(--border) bg-(--muted)/20 p-4 text-center">
        <p className="text-xs text-(--muted-foreground)">Select a layer to edit its properties</p>
      </div>
    );
  }

  const update = (patch) => onChange({ ...layer, ...patch });

  return (
    <div className="w-full rounded-2xl border border-(--border) bg-(--muted)/20 overflow-hidden">

      {/* Header */}
      <div className="px-3 py-2.5 border-b border-(--border) bg-(--muted)/30">
        <span className="text-xs font-semibold uppercase tracking-widest text-(--muted-foreground)">
          Edit Layer — <span className="text-(--foreground) capitalize">{layer.type}</span>
        </span>
      </div>

      <div className="p-3 space-y-4">

        {/* ── TEXT LAYER ── */}
        {layer.type === "text" && (
          <>
            {/* Text content */}
            <div>
              <label className="text-[11px] font-medium text-(--muted-foreground) block mb-1">Content</label>
              <textarea
                value={layer.text ?? ""}
                onChange={(e) => update({ text: e.target.value })}
                rows={2}
                placeholder="Enter text…"
                className="w-full text-xs bg-(--background) text-(--foreground) border border-(--border) rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:border-(--primary)/60"
              />
            </div>

            {/* Font size */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[11px] font-medium text-(--muted-foreground)">Font Size</label>
                <span className="text-[11px] font-semibold text-(--primary)">{layer.fontSize ?? 48}px</span>
              </div>
              <input
                type="range" min={10} max={200} step={1}
                value={layer.fontSize ?? 48}
                onChange={(e) => update({ fontSize: parseInt(e.target.value) })}
                className="w-full accent-(--primary)"
              />
            </div>

            {/* Font family */}
            <div>
              <label className="text-[11px] font-medium text-(--muted-foreground) block mb-1">Font</label>
              <select
                value={layer.fontFamily ?? "Arial"}
                onChange={(e) => update({ fontFamily: e.target.value })}
                className="w-full text-xs bg-(--background) text-(--foreground) border border-(--border) rounded-lg px-2 py-1.5 cursor-pointer"
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Font weight + align row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-(--muted-foreground) block mb-1">Weight</label>
                <div className="flex gap-1">
                  {FONT_WEIGHTS.map((w) => (
                    <button
                      key={w.value}
                      onClick={() => update({ fontWeight: w.value })}
                      className={`flex-1 py-1 text-[10px] rounded-lg border transition-all cursor-pointer
                        ${(layer.fontWeight ?? "bold") === w.value
                          ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                          : "border-(--border) text-(--foreground) hover:border-(--primary)/50"}`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-(--muted-foreground) block mb-1">Align</label>
                <div className="flex gap-1">
                  {TEXT_ALIGNS.map((a) => (
                    <button
                      key={a}
                      onClick={() => update({ textAlign: a })}
                      className={`flex-1 py-1 text-[10px] rounded-lg border transition-all cursor-pointer
                        ${(layer.textAlign ?? "center") === a
                          ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                          : "border-(--border) text-(--foreground) hover:border-(--primary)/50"}`}
                    >
                      {a === "left" ? "⬛▭▭" : a === "center" ? "▭⬛▭" : "▭▭⬛"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Text color */}
            <div className="flex items-center gap-3">
              <label className="text-[11px] font-medium text-(--muted-foreground)">Color</label>
              <input
                type="color"
                value={layer.color ?? "#ffffff"}
                onChange={(e) => update({ color: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border border-(--border) bg-transparent"
              />
              <span className="text-xs text-(--muted-foreground) font-mono">{layer.color ?? "#ffffff"}</span>

              {/* Stroke toggle */}
              <label className="flex items-center gap-1.5 ml-auto cursor-pointer">
                <input
                  type="checkbox"
                  checked={layer.stroke ?? false}
                  onChange={(e) => update({ stroke: e.target.checked })}
                  className="rounded"
                />
                <span className="text-[11px] text-(--muted-foreground)">Outline</span>
              </label>
              {layer.stroke && (
                <input
                  type="color"
                  value={layer.strokeColor ?? "#000000"}
                  onChange={(e) => update({ strokeColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-(--border)"
                />
              )}
            </div>
          </>
        )}

        {/* ── SHAPE LAYER ── */}
        {layer.type === "shape" && (
          <>
            {/* Shape type */}
            <div>
              <label className="text-[11px] font-medium text-(--muted-foreground) block mb-1">Shape</label>
              <div className="grid grid-cols-4 gap-1">
                {SHAPE_TYPES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => update({ shapeType: s.value })}
                    className={`py-1.5 text-[10px] rounded-lg border transition-all cursor-pointer
                      ${(layer.shapeType ?? "rect") === s.value
                        ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                        : "border-(--border) text-(--foreground) hover:border-(--primary)/50"}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fill color */}
            <div className="flex items-center gap-3">
              <label className="text-[11px] font-medium text-(--muted-foreground)">Fill</label>
              <input
                type="color"
                value={layer.fillColor ?? "#ff0000"}
                onChange={(e) => update({ fillColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border border-(--border)"
              />
              <label className="flex items-center gap-1.5 ml-auto cursor-pointer">
                <input
                  type="checkbox"
                  checked={layer.borderEnabled ?? false}
                  onChange={(e) => update({ borderEnabled: e.target.checked })}
                />
                <span className="text-[11px] text-(--muted-foreground)">Border</span>
              </label>
              {layer.borderEnabled && (
                <>
                  <input
                    type="color"
                    value={layer.borderColor ?? "#ffffff"}
                    onChange={(e) => update({ borderColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border border-(--border)"
                  />
                  <input
                    type="number" min={1} max={20}
                    value={layer.borderWidth ?? 2}
                    onChange={(e) => update({ borderWidth: parseInt(e.target.value) })}
                    className="w-12 text-xs bg-(--background) text-(--foreground) border border-(--border) rounded px-1.5 py-1"
                  />
                </>
              )}
            </div>

            {/* Width / Height */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[11px] font-medium text-(--muted-foreground)">Width %</label>
                  <span className="text-[11px] text-(--primary) font-semibold">{layer.w ?? 50}%</span>
                </div>
                <input
                  type="range" min={5} max={100}
                  value={layer.w ?? 50}
                  onChange={(e) => update({ w: parseInt(e.target.value) })}
                  className="w-full accent-(--primary)"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[11px] font-medium text-(--muted-foreground)">Height %</label>
                  <span className="text-[11px] text-(--primary) font-semibold">{layer.h ?? 20}%</span>
                </div>
                <input
                  type="range" min={5} max={100}
                  value={layer.h ?? 20}
                  onChange={(e) => update({ h: parseInt(e.target.value) })}
                  className="w-full accent-(--primary)"
                />
              </div>
            </div>
          </>
        )}

        {/* ── IMAGE LAYER (base) ── */}
        {layer.type === "image" && (
          <p className="text-xs text-(--muted-foreground) text-center py-2">
            Base image layer — use the animation controls above to animate it.
          </p>
        )}

        {/* ── SHARED: Position (X / Y) for text + shape ── */}
        {layer.type !== "image" && (
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-(--border)/40">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[11px] font-medium text-(--muted-foreground)">X Position</label>
                <span className="text-[11px] text-(--primary) font-semibold">{layer.x ?? 50}%</span>
              </div>
              <input
                type="range" min={0} max={100}
                value={layer.x ?? 50}
                onChange={(e) => update({ x: parseInt(e.target.value) })}
                className="w-full accent-(--primary)"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[11px] font-medium text-(--muted-foreground)">Y Position</label>
                <span className="text-[11px] text-(--primary) font-semibold">{layer.y ?? 50}%</span>
              </div>
              <input
                type="range" min={0} max={100}
                value={layer.y ?? 50}
                onChange={(e) => update({ y: parseInt(e.target.value) })}
                className="w-full accent-(--primary)"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

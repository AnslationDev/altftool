"use client";

const tools = [
  { key: "ai-auto", label: "AI Auto Detect", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { key: "brush", label: "Brush Tool", icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" },
  { key: "rect", label: "Rectangle", icon: "M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" },
];

export default function SelectionTools({ active, onChange, brushSize, setBrushSize, brushHardness, setBrushHardness, brushOpacity, setBrushOpacity }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tools.map((tool) => (
          <button
            key={tool.key}
            onClick={() => onChange(tool.key)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              active === tool.key
                ? "bg-(--primary) text-(--primary-foreground) shadow-md ring-2 ring-(--primary)/30"
                : "border border-(--border) bg-(--background) text-(--foreground) hover:bg-(--muted)"
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} />
            </svg>
            {tool.label}
          </button>
        ))}
      </div>

      {active === "brush" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-(--border) bg-(--background)">
          <div>
            <label className="block text-xs text-(--muted-foreground) mb-1">Brush Size: {brushSize}px</label>
            <input
              type="range" min="3" max="100" value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-(--border) accent-(--primary)"
            />
          </div>
          <div>
            <label className="block text-xs text-(--muted-foreground) mb-1">Hardness: {brushHardness}%</label>
            <input
              type="range" min="0" max="100" value={brushHardness}
              onChange={(e) => setBrushHardness(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-(--border) accent-(--primary)"
            />
          </div>
          <div>
            <label className="block text-xs text-(--muted-foreground) mb-1">Opacity: {brushOpacity}%</label>
            <input
              type="range" min="10" max="100" value={brushOpacity}
              onChange={(e) => setBrushOpacity(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-(--border) accent-(--primary)"
            />
          </div>
        </div>
      )}
    </div>
  );
}

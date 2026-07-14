"use client";

import { STYLES } from "../utils/defaults";
import { Palette } from "lucide-react";

// Segmented style picker. Each style switches the SVG rendering approach.
export default function StylePicker({ value, onChange }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-(--card-foreground)">
        <Palette size={16} className="text-(--primary)" />
        Avatar Style
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STYLES.map((s) => {
          const active = value === s.id;
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(s.id)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-center transition active:scale-95 ${
                active
                  ? "border-(--primary) bg-(--primary)/10 text-(--primary)"
                  : "border-(--border) bg-(--background) text-(--muted-foreground) hover:bg-(--muted)"
              }`}
            >
              <span className="text-sm font-semibold">{s.name}</span>
              <span className="text-[10px] leading-tight opacity-80">{s.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

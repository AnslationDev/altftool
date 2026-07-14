"use client";

import { CARD_THEMES, THEME_KEYS } from "../utils/deck";

// Card visual-theme picker. Renders a small swatch per theme and highlights
// the active one.
export default function ThemePicker({ theme, onChange }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
        Card style
      </span>
      {THEME_KEYS.map((key) => {
        const t = CARD_THEMES[key];
        const active = theme === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-label={`Use ${t.name} card theme`}
            aria-pressed={active}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
              active
                ? "border-(--primary) bg-(--primary)/10 text-(--primary)"
                : "border-(--border) text-(--muted-foreground) hover:bg-(--muted)"
            }`}
          >
            <span
              className="h-3.5 w-3.5 rounded-full border border-white/20"
              style={{ background: t.face }}
            />
            {t.name}
          </button>
        );
      })}
    </div>
  );
}

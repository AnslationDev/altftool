"use client";

import { Moon, Palette, Sparkles, Flame } from "lucide-react";

export default function ThemeSelector({ theme, setTheme }) {
  const themes = [
    { id: "dark", label: "Dark", icon: Moon, color: "text-gray-400" },
    { id: "gradient", label: "Gradient", icon: Palette, color: "text-blue-500" },
    { id: "glass", label: "Glass", icon: Sparkles, color: "text-cyan-400" },
    { id: "neon", label: "Neon", icon: Flame, color: "text-pink-500" },
  ];

  return (
    <div className="mt-4">
      <p className="text-sm mb-2 text-(--muted-foreground)">
         Select Theme:
      </p>

      <div className="flex flex-wrap gap-2">
        {themes.map((t) => {
          const Icon = t.icon;

          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition cursor-pointer
                ${
                  theme === t.id
                    ? "bg-(--primary) text-white border-(--primary)"
                    : "bg-(--muted) text-(--foreground) border-(--border)"
                }`}
            >
              <Icon size={16} className={t.color} />
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
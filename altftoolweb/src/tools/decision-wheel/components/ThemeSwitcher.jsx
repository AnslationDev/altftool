import { Palette } from "lucide-react";

const THEMES = [
  { key: "ocean", label: "Ocean", colors: ["#0EA5E9", "#0284C7", "#0369A1", "#38BDF8"] },
  { key: "sunset", label: "Sunset", colors: ["#F97316", "#EA580C", "#C2410C", "#FB923C"] },
  { key: "forest", label: "Forest", colors: ["#22C55E", "#16A34A", "#15803D", "#4ADE80"] },
  { key: "midnight", label: "Midnight", colors: ["#1E293B", "#334155", "#475569", "#64748B"] },
  { key: "candy", label: "Candy", colors: ["#EC4899", "#F43F5E", "#8B5CF6", "#3B82F6"] },
  { key: "teal", label: "Teal", colors: ["#14B8A6", "#0D9488", "#0F766E", "#2DD4BF"] },
];

export default function ThemeSwitcher({ current, onChange }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Palette size="14" className="text-(--muted-foreground)" />
        <span className="text-xs font-semibold text-(--foreground)">Theme</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {THEMES.map((theme) => (
          <button
            key={theme.key}
            onClick={() => onChange(theme.key)}
            className={`p-1.5 rounded-lg border transition ${
              current === theme.key
                ? "border-(--primary) ring-1 ring-(--primary)"
                : "border-(--border) hover:border-(--border-strong)"
            }`}
          >
            <div className="flex gap-0.5 mb-1">
              {theme.colors.slice(0, 4).map((c, i) => (
                <div key={i} className="w-full h-1.5 rounded-full" style={{ background: c }} />
              ))}
            </div>
            <p className="text-[10px] text-(--muted-foreground) truncate">{theme.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

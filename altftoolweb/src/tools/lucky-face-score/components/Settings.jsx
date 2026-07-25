"use client";

import { Settings2, Moon, Sun, Save, Zap, Trash2 } from "lucide-react";

export default function Settings({
  settings,
  onToggleDarkMode,
  onToggleAutoSave,
  onAnimationSpeedChange,
  onClearData,
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Settings2 size={18} className="text-muted-foreground" />
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Settings
        </h3>
      </div>

      <div className="space-y-4">
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition">
              {settings.darkMode ? (
                <Moon size={16} className="text-primary" />
              ) : (
                <Sun size={16} className="text-amber-500" />
              )}
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">Dark Mode</span>
              <p className="text-[10px] text-muted-foreground">Toggle dark theme</p>
            </div>
          </div>
          <button
            onClick={onToggleDarkMode}
            aria-label="Toggle dark mode"
            aria-pressed={settings.darkMode}
            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 ${
              settings.darkMode ? "bg-primary" : "bg-muted/50"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                settings.darkMode ? "translate-x-5" : ""
              }`}
            />
          </button>
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition">
              <Save size={16} className={settings.autoSave ? "text-primary" : "text-muted-foreground"} />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">Auto-Save</span>
              <p className="text-[10px] text-muted-foreground">Save readings automatically</p>
            </div>
          </div>
          <button
            onClick={onToggleAutoSave}
            aria-label="Toggle auto-save"
            aria-pressed={settings.autoSave}
            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 ${
              settings.autoSave ? "bg-primary" : "bg-muted/50"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                settings.autoSave ? "translate-x-5" : ""
              }`}
            />
          </button>
        </label>

        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition">
              <Zap size={16} className="text-muted-foreground" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">Animation Speed</span>
              <p className="text-[10px] text-muted-foreground">Adjust motion speed</p>
            </div>
          </div>
          <select
            value={settings.animationSpeed}
            onChange={(e) => onAnimationSpeedChange(e.target.value)}
            aria-label="Animation speed"
            className="text-xs font-medium bg-muted/30 border border-border rounded-lg px-3 py-1.5 text-foreground cursor-pointer focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
          >
            <option value="slow">Slow</option>
            <option value="normal">Normal</option>
            <option value="fast">Fast</option>
          </select>
        </div>

        <div className="pt-3 border-t border-border">
          <button
            onClick={onClearData}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 min-h-11 rounded-xl border border-(--danger)/30 text-(--danger) hover:bg-(--danger)/10 font-semibold text-sm cursor-pointer transition active:scale-[0.98] motion-reduce:active:scale-100 duration-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
          >
            <Trash2 size={16} />
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}

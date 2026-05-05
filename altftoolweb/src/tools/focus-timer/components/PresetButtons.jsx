"use client"

import { useState } from "react"; 
import { Target, Zap, Brain, Timer } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const PRESETS = [
  { id: "pomodoro", label: "Pomodoro", icon: Timer, focus: 25, breakMin: 5 },
  { id: "deepwork", label: "Deep Work", icon: Brain, focus: 50, breakMin: 10 },
  { id: "quickfocus", label: "Quick Focus", icon: Zap, focus: 15, breakMin: 3 },
  { id: "custom", label: "Custom", icon: Target, focus: null, breakMin: null },
];

export default function PresetButtons({
  activePreset,
  isRunning,
  lockMode,
  onPreset,
  customFocus,
  customBreak,
  setCustomFocus,
  setCustomBreak,
  onApplyCustom,
}) {
  const [confirmed, setConfirmed] = useState(false); // ← add

  const handlePresetClick = (preset) => {
    setConfirmed(false); // ← reset
    onPreset(preset);
  };

  // Set Timer click
  const handleApply = () => {
    const f = Number(customFocus);
    if (f < 1) {
      // alert("Focus time must be at least 1 minute!");
      toast("Focus time must be at least 1 minute!", {
        id: "focus-warning",
        icon: "⚠️",
        style: {
          background: "#fef3c7",
          color: "#92400e", 
          border: "1px solid #facc15",
        },
      });
      return;
    }
    onApplyCustom();
    setConfirmed(true); 
  };

  return (
    <div>
      {/* PRESET GRID */}
      <Toaster position="top-right" />

      <div className="grid sm:grid-cols-4 gap-3 mb-3">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset)} // ← updated
            disabled={isRunning || lockMode}
            className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl border cursor-pointer transition-all duration-200 font-primary font-semibold text-sm
              ${isRunning || lockMode ? "opacity-50 cursor-not-allowed" : ""}
              ${
                activePreset === preset.id
                  ? "bg-(--primary) text-white border-(--primary)"
                  : "bg-(--background) text-(--foreground) border-(--border) hover:border-(--primary) hover:text-(--primary)"
              }`}
          >
            <div className="flex flex-row gap-2">
              <preset.icon size={20} />
              <span>{preset.label}</span>
            </div>
            {preset.id !== "custom" && (
              <span
                className={`text-xs font-normal
                ${activePreset === preset.id ? "text-white/70" : "text-(--muted-foreground)"}`}
              >
                {preset.focus}m / {preset.breakMin}m
              </span>
            )}
          </button>
        ))}
      </div>

      {/* CUSTOM INPUTS — if confirmed then hide */}
      {activePreset === "custom" && !confirmed && (
        <div className="flex flex-wrap gap-3 items-end mb-6 p-4 rounded-xl border border-(--border) bg-(--background)">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-(--muted-foreground) font-secondary">
              Focus (minutes)
            </label>
            <input
              type="number"
              min={1}
              placeholder="e.g. 30"
              value={customFocus}
              onChange={(e) => setCustomFocus(e.target.value)}
              className="w-28 px-3 py-2 rounded-lg border border-(--border) bg-(--muted) text-(--foreground) text-sm outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-(--muted-foreground) font-secondary">
              Break (minutes)
            </label>
            <input
              type="number"
              min={0}
              placeholder="e.g. 5"
              value={customBreak}
              onChange={(e) => setCustomBreak(e.target.value)}
              className="w-28 px-3 py-2 rounded-lg border border-(--border) bg-(--muted) text-(--foreground) text-sm outline-none"
            />
          </div>
          <button
            onClick={handleApply} // ← updated
            className="px-5 py-2 rounded-lg bg-(--primary) text-white font-primary font-bold text-sm cursor-pointer border-none"
          >
            Set Timer
          </button>
        </div>
      )}

      {/* CUSTOM SET — if confirmed show summary */}
      {activePreset === "custom" && confirmed && (
        <div className="flex items-center justify-between mb-6 px-4 py-3 rounded-xl border border-(--border) bg-(--background)">
          <p className="text-sm font-secondary text-(--muted-foreground)">
            Custom:{" "}
            <span className="font-bold text-(--foreground)">
              {customFocus}m focus
            </span>
            {Number(customBreak) > 0 && (
              <span>
                {" "}
                →{" "}
                <span className="font-bold text-(--foreground)">
                  {customBreak}m break
                </span>
              </span>
            )}
          </p>
          <button
            onClick={() => setConfirmed(false)}
            className="text-xs font-primary font-bold text-(--primary) cursor-pointer bg-transparent border-none hover:underline"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

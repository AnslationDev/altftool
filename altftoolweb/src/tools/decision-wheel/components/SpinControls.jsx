"use client";

import { Button } from "@altftool/ui";
import { Play, RotateCcw, Users, Gauge, Undo2, Redo2 } from "lucide-react";

export default function SpinControls({
  mode, onSpin, onTeamSelect, onResetTeam, entries, isSpinning, spinSpeed,
  onSpeedChange, selectedEntries, onUndo, onRedo, canUndo, canRedo, onModeChange,
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => onModeChange("wheel")}
          className={`flex-1 py-2 px-3 min-h-11 rounded-lg text-xs font-semibold transition border active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 ${
            mode === "wheel"
              ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
              : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--border-strong)"
          }`}
        >
          <Play size="14" className="mx-auto mb-0.5" />
          Spin Wheel
        </button>
        <button
          onClick={() => onModeChange("team")}
          className={`flex-1 py-2 px-3 min-h-11 rounded-lg text-xs font-semibold transition border active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 ${
            mode === "team"
              ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
              : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--border-strong)"
          }`}
        >
          <Users size="14" className="mx-auto mb-0.5" />
          Team Picker
        </button>
      </div>

      <div className="flex items-center gap-2 pb-1">
        <Gauge size="14" className="text-(--muted-foreground)" />
        <span className="text-xs text-(--muted-foreground)">Speed</span>
        <input
          type="range"
          min="1"
          max="10"
          aria-label="Spin speed"
          value={spinSpeed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--primary) ${spinSpeed * 10}%, var(--border) ${spinSpeed * 10}%)`,
            accentColor: "var(--primary)",
          }}
        />
        <span className="text-xs font-medium text-(--foreground) w-4 text-right">{spinSpeed}</span>
      </div>

      {mode === "wheel" ? (
        <Button
          variant="primary"
          size="lg"
          className="w-full h-11 text-sm font-bold active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
          onClick={onSpin}
          disabled={entries.length < 2 || isSpinning}
        >
          {isSpinning ? "Spinning..." : "SPIN!"}
        </Button>
      ) : (
        <div className="space-y-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full h-11 text-sm font-bold active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
            onClick={onTeamSelect}
            disabled={entries.length - selectedEntries.length < 1}
          >
            Pick Member
          </Button>
          {selectedEntries.length > 0 && (
            <Button variant="outline" size="sm" className="w-full" onClick={onResetTeam}>
              <RotateCcw size="14" /> Reset Team
            </Button>
          )}
          <p className="text-xs text-(--muted-foreground) text-center">
            {entries.length - selectedEntries.length} remaining / {selectedEntries.length} selected
          </p>
        </div>
      )}

      <div className="flex gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex-1 p-2 min-h-11 rounded-lg text-xs font-medium border border-(--border) bg-(--card) text-(--muted-foreground) disabled:opacity-30 hover:bg-(--muted) transition active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
        >
          <Undo2 size="14" className="mx-auto mb-0.5" />
          Undo
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="flex-1 p-2 min-h-11 rounded-lg text-xs font-medium border border-(--border) bg-(--card) text-(--muted-foreground) disabled:opacity-30 hover:bg-(--muted) transition active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
        >
          <Redo2 size="14" className="mx-auto mb-0.5" />
          Redo
        </button>
      </div>
    </div>
  );
}

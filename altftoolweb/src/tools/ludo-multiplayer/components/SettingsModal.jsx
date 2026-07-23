"use client";

import { Modal, Button } from "@altftool/ui";
import ThemeSelector from "./ThemeSelector";

export default function SettingsModal({ open, onClose, settings, onUpdate, mode, difficulty, onDifficultyChange, onModeChange }) {
  return (
    <Modal open={open} onClose={onClose} title="Settings" size="md">
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold text-(--foreground) mb-2">Game Mode</p>
          <div className="flex gap-2">
            {[
              { key: "ai", label: "vs Computer" },
              { key: "pvp", label: "Local Multiplayer" },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => onModeChange(m.key)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition ${
                  mode === m.key
                    ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                    : "bg-(--card) text-(--muted-foreground) border-(--border)"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {mode === "ai" && (
          <div>
            <p className="text-xs font-semibold text-(--foreground) mb-2">AI Difficulty</p>
            <div className="flex gap-2">
              {["easy", "medium", "hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => onDifficultyChange(d)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border capitalize transition ${
                    difficulty === d
                      ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                      : "bg-(--card) text-(--muted-foreground) border-(--border)"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        <ThemeSelector settings={settings} onUpdate={onUpdate} />
      </div>
    </Modal>
  );
}

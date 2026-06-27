"use client";

import { X } from "lucide-react";

const IS_MAC = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform || "");
const MOD = IS_MAC ? "⌘" : "Ctrl";

const SHORTCUTS = [
  { keys: [MOD, "S"], label: "Save draft" },
  { keys: [MOD, "↵"], label: "Run primary action (publish / request review)" },
  { keys: [MOD, "P"], label: "Toggle preview" },
  { keys: [MOD, "K"], label: "Command palette — jump to a section" },
  { keys: [MOD, "/"], label: "Show this help" },
];

function Kbd({ children }) {
  return (
    <kbd className="inline-flex min-w-[24px] items-center justify-center rounded-md border border-border bg-surface-soft px-1.5 py-0.5 text-[11px] font-bold text-foreground">
      {children}
    </kbd>
  );
}

export default function KeyboardShortcutsHelp({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[96] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Keyboard shortcuts</h2>
          <button onClick={onClose} className="rounded-lg border border-border p-1.5 text-muted hover:bg-surface-soft" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="space-y-2">
          {SHORTCUTS.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-3">
              <span className="text-sm text-foreground">{s.label}</span>
              <span className="flex items-center gap-1">
                {s.keys.map((k, i) => <Kbd key={i}>{k}</Kbd>)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

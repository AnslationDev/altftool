"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Moon, Sun, Save, Zap, Trash2, AlertTriangle } from "lucide-react";

export default function SettingsModal({ open, onClose, settings, onUpdate, onClearAll }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearAll = () => {
    onClearAll();
    setShowConfirm(false);
  };

  const speedOptions = [
    { value: "slow", label: "Slow" },
    { value: "normal", label: "Normal" },
    { value: "fast", label: "Fast" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-(--foreground)">Settings</h2>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-lg p-1.5 min-w-11 min-h-11 inline-flex items-center justify-center text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-(--muted) p-2">
                    {settings.darkMode ? <Moon size={16} className="text-(--foreground)" /> : <Sun size={16} className="text-(--foreground)" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-(--foreground)">Dark Mode</p>
                    <p className="text-[11px] text-(--muted-foreground)">Toggle dark/light theme</p>
                  </div>
                </div>
                <button
                  onClick={() => onUpdate({ darkMode: !settings.darkMode })}
                  aria-pressed={settings.darkMode}
                  className={`relative h-6 w-11 rounded-full transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 ${
                    settings.darkMode ? "bg-(--primary)" : "bg-(--muted)"
                  }`}
                  aria-label="Toggle dark mode"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      settings.darkMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Auto Save */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-(--muted) p-2">
                    <Save size={16} className="text-(--foreground)" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-(--foreground)">Auto-Save</p>
                    <p className="text-[11px] text-(--muted-foreground)">Save history automatically</p>
                  </div>
                </div>
                <button
                  onClick={() => onUpdate({ autoSave: !settings.autoSave })}
                  aria-pressed={settings.autoSave}
                  className={`relative h-6 w-11 rounded-full transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 ${
                    settings.autoSave ? "bg-(--primary)" : "bg-(--muted)"
                  }`}
                  aria-label="Toggle auto-save"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      settings.autoSave ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Animation Speed */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-(--muted) p-2">
                    <Zap size={16} className="text-(--foreground)" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-(--foreground)">Animation Speed</p>
                    <p className="text-[11px] text-(--muted-foreground)">Adjust animation playback</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {speedOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onUpdate({ animationSpeed: opt.value })}
                      aria-pressed={settings.animationSpeed === opt.value}
                      className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 ${
                        settings.animationSpeed === opt.value
                          ? "bg-(--primary) text-(--primary-foreground)"
                          : "border border-(--border) text-(--muted-foreground) hover:text-(--foreground)"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Data */}
              <div className="border-t border-(--border) pt-4">
                {showConfirm ? (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-red-500">
                      <AlertTriangle size={16} /> Clear all data?
                    </div>
                    <p className="mt-1 text-xs text-(--muted-foreground)">
                      This will delete all history and favorites permanently.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={handleClearAll}
                        className="flex-1 rounded-xl bg-red-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-600"
                      >
                        Yes, clear
                      </button>
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="flex-1 rounded-xl border border-(--border) px-3 py-2 text-xs font-semibold text-(--foreground) transition hover:bg-(--muted)"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-500/10 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
                  >
                    <Trash2 size={16} /> Clear All Data
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

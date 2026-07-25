"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Moon, Sun, Save, Sparkles, Trash2 } from "lucide-react";

export default function SettingsModal({ open, onClose, settings, onUpdate, onClearHistory }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-(--border) bg-(--card) p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-(--foreground)">Settings</h3>
              <button onClick={onClose} aria-label="Close dialog" className="rounded-lg p-1.5 min-w-11 min-h-11 inline-flex items-center justify-center text-(--muted-foreground) hover:bg-(--muted) transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {settings.darkMode ? <Moon className="h-5 w-5 text-(--primary)" /> : <Sun className="h-5 w-5 text-(--primary)" />}
                  <div>
                    <p className="text-sm font-semibold text-(--foreground)">Dark Mode</p>
                    <p className="text-xs text-(--muted-foreground)">Toggle dark/light theme</p>
                  </div>
                </div>
                <button
                  onClick={() => onUpdate({ darkMode: !settings.darkMode })}
                  aria-label="Toggle dark mode"
                  aria-pressed={settings.darkMode}
                  className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 ${settings.darkMode ? "bg-(--primary)" : "bg-(--muted)"}`}
                >
                  <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${settings.darkMode ? "translate-x-5" : ""}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Save className="h-5 w-5 text-(--primary)" />
                  <div>
                    <p className="text-sm font-semibold text-(--foreground)">Auto-Save</p>
                    <p className="text-xs text-(--muted-foreground)">Automatically save readings</p>
                  </div>
                </div>
                <button
                  onClick={() => onUpdate({ autoSave: !settings.autoSave })}
                  aria-label="Toggle auto-save"
                  aria-pressed={settings.autoSave}
                  className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 ${settings.autoSave ? "bg-(--primary)" : "bg-(--muted)"}`}
                >
                  <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${settings.autoSave ? "translate-x-5" : ""}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-(--primary)" />
                  <div>
                    <p className="text-sm font-semibold text-(--foreground)">Animations</p>
                    <p className="text-xs text-(--muted-foreground)">Enable visual effects</p>
                  </div>
                </div>
                <button
                  onClick={() => onUpdate({ animations: !settings.animations })}
                  aria-label="Toggle animations"
                  aria-pressed={settings.animations}
                  className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 ${settings.animations ? "bg-(--primary)" : "bg-(--muted)"}`}
                >
                  <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${settings.animations ? "translate-x-5" : ""}`} />
                </button>
              </div>

              <div className="border-t border-(--border) pt-4">
                <button
                  onClick={() => {
                    if (confirm("Clear all history?")) {
                      onClearHistory();
                    }
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-(--danger)/30 px-4 py-3 text-sm font-semibold text-(--danger) transition-all motion-reduce:transition-none hover:bg-(--danger)/10 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
                >
                  <Trash2 className="h-5 w-5" />
                  Clear All History
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

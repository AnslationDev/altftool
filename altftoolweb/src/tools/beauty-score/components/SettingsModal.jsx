"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Moon, Sun, Camera, Sparkles, Trash2, AlertTriangle } from "lucide-react";

export default function SettingsModal({
  open,
  onClose,
  settings,
  onUpdateSettings,
  onClearAll,
}) {
  const [confirmClear, setConfirmClear] = useState(false);

  if (!open) return null;

  const handleToggle = (key) => {
    onUpdateSettings?.({ ...settings, [key]: !settings[key] });
  };

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    onClearAll?.();
    setConfirmClear(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="text-pink-400" size={20} />
              <h3 className="font-bold text-foreground">Settings</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-muted/30 text-muted-foreground transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Theme */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-yellow-400/20 to-orange-400/20">
                  {settings.darkMode ? (
                    <Moon className="text-blue-400" size={18} />
                  ) : (
                    <Sun className="text-yellow-500" size={18} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Dark Theme</p>
                  <p className="text-[10px] text-muted-foreground">
                    Toggle dark/light mode
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle("darkMode")}
                className={`relative w-11 h-6 rounded-full transition cursor-pointer ${
                  settings.darkMode ? "bg-pink-500" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    settings.darkMode ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

            {/* Auto-save */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-400/20 to-cyan-400/20">
                  <Camera className="text-blue-400" size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Auto-save</p>
                  <p className="text-[10px] text-muted-foreground">
                    Save results automatically
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle("autoSave")}
                className={`relative w-11 h-6 rounded-full transition cursor-pointer ${
                  settings.autoSave ? "bg-pink-500" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    settings.autoSave ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

            {/* Animations */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-400/20 to-pink-400/20">
                  <Sparkles className="text-purple-400" size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Animations</p>
                  <p className="text-[10px] text-muted-foreground">
                    Enable animated effects
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle("animations")}
                className={`relative w-11 h-6 rounded-full transition cursor-pointer ${
                  settings.animations ? "bg-pink-500" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    settings.animations ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

            {/* Clear Data */}
            <div className="pt-2 border-t border-border">
              <button
                onClick={handleClear}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition cursor-pointer ${
                  confirmClear
                    ? "bg-red-500/10 border-red-400 text-red-500"
                    : "border-border hover:bg-muted/20 text-muted-foreground hover:text-red-400"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg ${
                    confirmClear
                      ? "bg-red-500/20"
                      : "bg-gradient-to-br from-red-400/20 to-orange-400/20"
                  }`}
                >
                  {confirmClear ? (
                    <AlertTriangle size={18} />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold">
                    {confirmClear ? "Are you sure?" : "Clear All Data"}
                  </p>
                  <p className="text-[10px] opacity-70">
                    {confirmClear
                      ? "This will delete all history and favorites"
                      : "Remove all saved history and favorites"}
                  </p>
                </div>
                {confirmClear && (
                  <span className="text-xs font-bold">Tap again</span>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 bg-muted/30 border-t border-border">
            <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
              Beauty Score v1.0 &bull; All data stored locally
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

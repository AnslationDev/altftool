"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal, Button } from "@altftool/ui";
import { Settings, Moon, Sun, Download, Grid3X3, Trash2, Image, AlertTriangle, Monitor } from "lucide-react";
import { BACKGROUND_OPTIONS } from "../constants/backgrounds";

function Section({ title, icon: Icon, children }) {
  return (
    <div className="rounded-xl border border-(--border) bg-(--card) overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-(--border) bg-(--muted)/30">
        <Icon size={14} className="text-(--primary)" />
        <span className="text-xs font-bold tracking-wider text-(--muted-foreground) uppercase">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-(--foreground)">{label}</span>
        {description && <span className="text-xs text-(--muted-foreground)">{description}</span>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors duration-150 shrink-0 focus:outline-none focus:ring-2 focus:ring-(--primary)/40
          ${checked ? "bg-(--primary)" : "bg-(--border-strong)"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-150
            ${checked ? "translate-x-4" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}

export default function SettingsModal({
  open = false,
  onClose = () => {},
  settings = {},
  onUpdate = () => {},
  onClearAll = () => {},
}) {
  const [showDangerConfirm, setShowDangerConfirm] = useState(false);

  const currentSettings = {
    defaultBg: settings.defaultBg || "white",
    exportFormat: settings.exportFormat || "png",
    printLayout: settings.printLayout || "4x6",
    theme: settings.theme || "system",
    gridVisible: settings.gridVisible !== false,
    autoCrop: settings.autoCrop !== false,
  };

  const themeOptions = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ];

  const formatOptions = [
    { id: "png", label: "PNG" },
    { id: "jpeg", label: "JPG" },
    { id: "pdf", label: "PDF" },
  ];

  const layoutOptions = [
    { id: "2x2", label: "4 per page" },
    { id: "3x2", label: "6 per page" },
    { id: "4x2", label: "8 per page" },
  ];

  return (
    <Modal open={open} onClose={onClose} aria-label="Settings">
      <div className="p-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-(--primary-soft)/20">
            <Settings size={20} className="text-(--primary)" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-(--foreground)">Settings</h2>
            <p className="text-xs text-(--muted-foreground)">Customize your experience</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Section title="Theme" icon={currentSettings.theme === "dark" ? Moon : currentSettings.theme === "light" ? Sun : Monitor}>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onUpdate("theme", opt.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-150
                    ${currentSettings.theme === opt.id
                      ? "border-(--primary) bg-(--primary-soft)/10 text-(--primary)"
                      : "border-(--border) text-(--muted-foreground) hover:border-(--border-strong) hover:text-(--foreground)"}`}
                >
                  <opt.icon size={18} />
                  <span className="text-xs font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Default Background" icon={Image}>
            <div className="grid grid-cols-4 gap-2">
              {BACKGROUND_OPTIONS.filter((b) => b.id !== "blur" && b.id !== "gradient" && b.id !== "transparent").map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onUpdate("defaultBg", opt.id)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all duration-150
                    ${currentSettings.defaultBg === opt.id
                      ? "border-(--primary) bg-(--primary-soft)/10"
                      : "border-(--border) hover:border-(--border-strong)"}`}
                >
                  <div
                    className="w-6 h-6 rounded-lg border border-(--border)"
                    style={{ backgroundColor: opt.color !== "transparent" ? opt.color : undefined }}
                  />
                  <span className="text-[10px] font-medium text-(--muted-foreground)">{opt.name}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Export Format" icon={Download}>
            <div className="grid grid-cols-3 gap-2">
              {formatOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onUpdate("exportFormat", opt.id)}
                  className={`px-3 py-2 rounded-xl border-2 text-xs font-semibold transition-all duration-150
                    ${currentSettings.exportFormat === opt.id
                      ? "border-(--primary) bg-(--primary-soft)/10 text-(--primary)"
                      : "border-(--border) text-(--muted-foreground) hover:border-(--border-strong)"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Print Layout" icon={Grid3X3}>
            <div className="grid grid-cols-3 gap-2">
              {layoutOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onUpdate("printLayout", opt.id)}
                  className={`px-3 py-2 rounded-xl border-2 text-xs font-semibold transition-all duration-150
                    ${currentSettings.printLayout === opt.id
                      ? "border-(--primary) bg-(--primary-soft)/10 text-(--primary)"
                      : "border-(--border) text-(--muted-foreground) hover:border-(--border-strong)"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Display" icon={Grid3X3}>
            <div className="flex flex-col gap-4">
              <Toggle
                label="Grid Overlay"
                description="Show grid lines during cropping"
                checked={currentSettings.gridVisible}
                onChange={(v) => onUpdate("gridVisible", v)}
              />
              <Toggle
                label="Auto Crop"
                description="Automatically crop to face on import"
                checked={currentSettings.autoCrop}
                onChange={(v) => onUpdate("autoCrop", v)}
              />
            </div>
          </Section>

          <Section title="Danger Zone" icon={Trash2}>
            <div className="flex flex-col gap-3">
              <p className="text-xs text-(--muted-foreground)">
                Clear all saved history, favorites, and settings. This action cannot be undone.
              </p>
              {showDangerConfirm ? (
                <div className="flex items-center gap-2 p-3 rounded-xl border border-(--danger)/20 bg-(--danger)/5">
                  <AlertTriangle size={14} className="shrink-0 text-(--danger)" />
                  <span className="text-xs text-(--foreground) flex-1">Are you sure?</span>
                  <button
                    onClick={() => { onClearAll(); setShowDangerConfirm(false); }}
                    className="px-2 py-1 rounded-lg text-xs font-semibold bg-(--danger) text-white hover:bg-(--danger)/80 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowDangerConfirm(false)}
                    className="px-2 py-1 rounded-lg text-xs font-semibold text-(--muted-foreground) hover:bg-(--muted)/50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDangerConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold
                    bg-(--danger)/10 text-(--danger) border border-(--danger)/20 hover:bg-(--danger)/20 transition-colors"
                >
                  <Trash2 size={14} />
                  Clear All Data
                </button>
              )}
            </div>
          </Section>
        </div>
      </div>
    </Modal>
  );
}

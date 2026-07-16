"use client";

import { Settings2, Eye, EyeOff, Type, Layout, Palette } from "lucide-react";
import { THEMES, FONT_FAMILIES, FONT_SIZES } from "../utils/constants";

export default function SettingsPanel({
  settings,
  onSettingsChange,
  theme,
  onThemeChange,
}) {
  const toggle = (key) => {
    onSettingsChange({ ...settings, [key]: !settings[key] });
  };

  const set = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Settings2 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-[--foreground]">
          View Settings
        </h3>
      </div>

      <div>
        <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-[--muted]">
          <Palette className="h-3.5 w-3.5" />
          Theme
        </label>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(THEMES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => onThemeChange(key)}
              className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition-all ${
                theme === key
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-[--border] hover:border-[--border-strong]"
              }`}
            >
              <div
                className="h-6 w-full rounded-md border border-[--border]"
                style={{ background: t.bgAssistant }}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: t.textAssistant }}
              >
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-[--muted]">
          <Type className="h-3.5 w-3.5" />
          Font Family
        </label>
        <select
          value={settings.fontFamily || THEMES[theme]?.fontFamily || ""}
          onChange={(e) => set("fontFamily", e.target.value)}
          className="w-full rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--foreground] focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 text-xs font-medium text-[--muted]">
            Font Size
          </label>
          <select
            value={settings.fontSize || 15}
            onChange={(e) => set("fontSize", Number(e.target.value))}
            className="w-full rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--foreground] focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20"
          >
            {FONT_SIZES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 text-xs font-medium text-[--muted]">
            Line Height
          </label>
          <select
            value={settings.lineHeight || "1.6"}
            onChange={(e) => set("lineHeight", e.target.value)}
            className="w-full rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--foreground] focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20"
          >
            {["1.2","1.4","1.6","1.8","2.0"].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-[--muted]">
          <Eye className="h-3.5 w-3.5" />
          Visibility
        </label>
        <div className="space-y-2">
          {[
            { key: "showAvatar", label: "Show Avatars" },
            { key: "showTimestamps", label: "Show Timestamps" },
          ].map(({ key, label: lbl }) => (
            <label
              key={key}
              className="flex cursor-pointer items-center justify-between rounded-lg bg-[--surface-soft] px-3 py-2"
            >
              <span className="text-sm text-[--foreground]">{lbl}</span>
              <button
                onClick={() => toggle(key)}
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  settings[key] !== false
                    ? "bg-primary"
                    : "bg-[--border-strong]"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                    settings[key] !== false
                      ? "translate-x-4"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-[--muted]">
          <EyeOff className="h-3.5 w-3.5" />
          Hide Messages
        </label>
        <div className="space-y-2">
          {[
            { key: "hideUser", label: "Hide User Messages" },
            { key: "hideAssistant", label: "Hide Assistant Messages" },
          ].map(({ key, label: lbl }) => (
            <label
              key={key}
              className="flex cursor-pointer items-center justify-between rounded-lg bg-[--surface-soft] px-3 py-2"
            >
              <span className="text-sm text-[--foreground]">{lbl}</span>
              <button
                onClick={() => toggle(key)}
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  settings[key] ? "bg-primary" : "bg-[--border-strong]"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                    settings[key] ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-[--border] pt-4">
        <div className="flex items-center gap-2">
          <Layout className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-[--foreground]">
            Page Settings
          </h3>
        </div>
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 text-xs font-medium text-[--muted]">
                Page Size
              </label>
              <select
                value={settings.pageSize || "a4"}
                onChange={(e) => set("pageSize", e.target.value)}
                className="w-full rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--foreground] focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20"
              >
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 text-xs font-medium text-[--muted]">
                Orientation
              </label>
              <select
                value={settings.orientation || "portrait"}
                onChange={(e) => set("orientation", e.target.value)}
                className="w-full rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--foreground] focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 text-xs font-medium text-[--muted]">
              PDF Theme
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => set("pdfDarkTheme", false)}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-all ${
                  !settings.pdfDarkTheme
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-[--border] text-[--muted] hover:text-[--foreground]"
                }`}
              >
                Light PDF
              </button>
              <button
                onClick={() => set("pdfDarkTheme", true)}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-all ${
                  settings.pdfDarkTheme
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-[--border] text-[--muted] hover:text-[--foreground]"
                }`}
              >
                Dark PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

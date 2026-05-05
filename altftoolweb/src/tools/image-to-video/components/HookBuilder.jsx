"use client";
import { useState } from "react";
import {
  HOOK_PRESETS,
  HOOK_STYLES,
  HOOK_POSITIONS,
} from "../utils/hookPresets";

export default function HookBuilder({ hook, onChange }) {
  const [open, setOpen] = useState(false);

  const update = (patch) => onChange({ ...hook, ...patch });

  const applyPreset = (preset) => {
    onChange({
      enabled:  true,
      text:     preset.text,
      style:    preset.style,
      color:    preset.color,
      fontSize: preset.fontSize,
      position: preset.position,
      duration: hook?.duration ?? 0.45,
    });
  };

  return (
    <div className="w-full rounded-2xl border border-(--border) bg-(--muted)/20 p-4 space-y-4">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-(--foreground)">
            Hook Builder
          </p>
          <p className="text-xs text-(--muted-foreground) mt-0.5">
            First 3 sec text — keeps viewers watching
          </p>
        </div>

        {/* Enable toggle */}
        <button
          onClick={() => update({ enabled: !hook?.enabled })}
          className={`
            relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0
            ${hook?.enabled ? "bg-(--primary)" : "bg-(--border)"}
          `}
        >
          <span className={`
            absolute top-1 w-4 h-4 rounded-full bg-white transition-all
            ${hook?.enabled ? "left-6" : "left-1"}
          `} />
        </button>
      </div>

      {hook?.enabled && (
        <>
          {/* Preset pills */}
          <div>
            <p className="text-xs font-medium text-(--foreground) mb-2">
              Quick presets
            </p>
            <div className="flex flex-wrap gap-1.5">
              {HOOK_PRESETS.map((preset) => {
                const active = hook?.text === preset.text && preset.id !== "custom";
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className={`
                      text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer
                      ${active
                        ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                        : "border-(--border) text-(--foreground) hover:border-(--primary)/50"}
                    `}
                  >
                  {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom text input */}
          <div>
            <p className="text-xs font-medium text-(--foreground) mb-1.5">
              Hook text
            </p>
            <input
              type="text"
              value={hook?.text ?? ""}
              maxLength={60}
              placeholder="Type your hook text…"
              onChange={(e) => update({ text: e.target.value })}
              className="w-full text-sm bg-(--background) text-(--foreground) border border-(--border) rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--primary)/40"
            />
            <p className="text-[10px] text-(--muted-foreground) text-right mt-1">
              {(hook?.text ?? "").length}/60
            </p>
          </div>

          {/* Style + Position row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-(--foreground) mb-1.5">
                Animation style
              </p>
              <select
                value={hook?.style ?? "fadeSlideUp"}
                onChange={(e) => update({ style: e.target.value })}
                className="w-full text-xs bg-(--background) text-(--foreground) border border-(--border) rounded-lg px-2 py-1.5 cursor-pointer"
              >
                {HOOK_STYLES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-medium text-(--foreground) mb-1.5">
                Position
              </p>
              <select
                value={hook?.position ?? "center"}
                onChange={(e) => update({ position: e.target.value })}
                className="w-full text-xs bg-(--background) text-(--foreground) border border-(--border) rounded-lg px-2 py-1.5 cursor-pointer"
              >
                {HOOK_POSITIONS.map((pos) => (
                  <option key={pos.value} value={pos.value}>{pos.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Color + Font size row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-(--foreground) mb-1.5">
                Text color
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={hook?.color ?? "#ffffff"}
                  onChange={(e) => update({ color: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-(--border) cursor-pointer p-0.5 bg-(--background)"
                />
                <span className="text-xs text-(--muted-foreground) font-mono">
                  {hook?.color ?? "#ffffff"}
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <p className="text-xs font-medium text-(--foreground)">Font size</p>
                <span className="text-xs font-semibold text-(--primary)">
                  {hook?.fontSize ?? 52}px
                </span>
              </div>
              <input
                type="range" min={28} max={80} step={2}
                value={hook?.fontSize ?? 52}
                onChange={(e) => update({ fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>

          {/* Hook duration slider */}
          <div>
            <div className="flex justify-between mb-1.5">
              <p className="text-xs font-medium text-(--foreground)">
                Show for first
              </p>
              <span className="text-xs font-semibold text-(--primary)">
                {Math.round((hook?.duration ?? 0.45) * 100)}% of slide
              </span>
            </div>
            <input
              type="range" min={0.15} max={0.75} step={0.05}
              value={hook?.duration ?? 0.45}
              onChange={(e) => update({ duration: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-(--muted-foreground) mt-1">
              <span>Short flash</span>
              <span>Long hold</span>
            </div>
          </div>

          {/* Live preview label */}
          <p className="text-[11px] text-center text-(--muted-foreground)">
            Hook shows on the live preview canvas automatically
          </p>
        </>
      )}
    </div>
  );
}
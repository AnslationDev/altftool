"use client";

import { useState } from "react";

export default function SpirographPresets({ presets, activePreset, onApplyPreset }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="spiro-card">
      <div className="spiro-card-header">
        <span className="card-icon">*</span> Style Presets
      </div>
      <div className="spiro-card-body">
        <div className="presets-wrapper">
          <button
            type="button"
            className="presets-trigger"
            onClick={() => setOpen((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setOpen((v) => !v);
            }}
          >
            <span>{activePreset || "Select preset..."}</span>
            <span className={`arrow ${open ? "open" : ""}`}>v</span>
          </button>

          {activePreset && (
            <div className="presets-selected-label">
              {presets.find((p) => p.name === activePreset)?.mode} | {presets.find((p) => p.name === activePreset)?.loops} loops
            </div>
          )}

          {open && (
            <div className="presets-dropdown">
              {presets.map((preset, i) => (
                <div
                  key={i}
                  className={`preset-option ${activePreset === preset.name ? "selected" : ""}`}
                  onClick={() => {
                    onApplyPreset(preset);
                    setOpen(false);
                  }}
                >
                  <span className="preset-name">{preset.name}</span>
                  <span className="preset-meta">{preset.loops} loops</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

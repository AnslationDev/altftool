"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { InfoRow } from "../ui/InfoRow";

export function ScreenGraphics({ screen, loading }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] border-l-4
                    border-l-emerald-500 rounded-2xl shadow-sm
                    transition-all duration-300 ease-out">

      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer select-none
                   hover:bg-[var(--muted)]/40 rounded-2xl transition-colors duration-200"
        onClick={() => setIsOpen((p) => !p)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20
                         flex items-center justify-center text-lg shrink-0">
            🖥️
          </div>

          <div>
            <p className="text-sm font-semibold font-primary text-[var(--card-foreground)]">
              Screen & Graphics
            </p>
            {!isOpen && !loading && screen && (
              <p className="text-xs text-emerald-400 font-secondary font-medium mt-0.5">
                {screen.screenWidth} × {screen.screenHeight} · {screen.devicePixelRatio}x
              </p>
            )}
            {!isOpen && loading && (
              <div className="h-3 w-28 bg-[var(--muted)] rounded animate-pulse mt-1" />
            )}
          </div>
        </div>

        {/* Badge + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          {!loading && screen && (
            <span className="text-[10px] px-2 py-0.5 rounded-full border font-secondary
                             text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
              {screen.colorDepth}-bit
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-[var(--muted-foreground)]
                        transition-transform duration-300
                        ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        </div>
      </div>

      {/* ─ Expandable Content ─ */}
      <div className={`overflow-hidden transition-all duration-400 ease-in-out
                      ${isOpen ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-5 pb-5">

          <div className="h-px bg-[var(--border)] mb-4" />

          {loading ? (
            <div className="space-y-2">
              {[1,2,3,4,5,6,7].map((i) => (
                <div key={i} className="h-9 bg-[var(--muted)] rounded-lg animate-pulse" />
              ))}
            </div>

          ) : (
            <div>
              <InfoRow label="Screen Resolution" value={`${screen?.screenWidth} × ${screen?.screenHeight}`} highlight />
              <InfoRow label="Available Area"    value={`${screen?.availWidth} × ${screen?.availHeight}`} />
              <InfoRow label="Viewport Size"     value={`${screen?.viewportWidth} × ${screen?.viewportHeight}`} />
              <InfoRow label="Outer Window"      value={`${screen?.outerWidth} × ${screen?.outerHeight}`} />
              <InfoRow label="Color Depth"       value={`${screen?.colorDepth}-bit color`} />
              <InfoRow
                label="Pixel Ratio"
                value={`${screen?.devicePixelRatio}x${screen?.isRetina ? " (Retina / HiDPI)" : " (Standard)"}`}
              />
              <InfoRow label="Orientation"    value={screen?.orientation?.type || "Unknown"} />
              <InfoRow label="Taskbar Height" value={`${screen?.taskbarHeight || 0}px`} />
              <InfoRow label="Window Position" value={`X: ${screen?.windowX}, Y: ${screen?.windowY}`} />

              <div className="mt-3 p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
                <p className="text-[10px] text-[var(--muted-foreground)] font-secondary leading-relaxed">
                  📐 The difference between Screen and Available Area reveals your OS taskbar/dock height.
                  Combined with window position, trackers can detect multi-monitor setups.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

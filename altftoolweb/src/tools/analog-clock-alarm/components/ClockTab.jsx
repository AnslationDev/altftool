"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import AnalogClock from "./AnalogClock";
import { formatTime, formatDate, getTimezoneLabel } from "../utils/timeUtils";

const THEMES = [
  { id: "modern", label: "Modern" },
  { id: "classic", label: "Classic" },
  { id: "minimal", label: "Minimal" },
  { id: "glass", label: "Glass" },
];

const ACCENT_COLORS = [
  { label: "Teal", value: "var(--primary)" },
  { label: "Cyan", value: "#22D3EE" },
  { label: "Violet", value: "#8B5CF6" },
  { label: "Rose", value: "#F43F5E" },
  { label: "Amber", value: "#F59E0B" },
  { label: "Emerald", value: "#10B981" },
];

export default function ClockTab({ nextAlarmLabel }) {
  const [date, setDate] = useState(new Date());
  const [use24h, setUse24h] = useState(false);
  const [showSeconds, setShowSeconds] = useState(true);
  const [showNumbers, setShowNumbers] = useState(true);
  const [showTicks, setShowTicks] = useState(true);
  const [theme, setTheme] = useState("modern");
  const [accentIdx, setAccentIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const fullscreenRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setDate(new Date()), 250);
    return () => clearInterval(id);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await fullscreenRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } catch {}
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const accentColor = ACCENT_COLORS[accentIdx].value;

  return (
    <div className="space-y-6">
      {/* Clock display */}
      <div
        ref={fullscreenRef}
        className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-[var(--anslation-ds-shadow-sm)] transition-all"
        style={isFullscreen ? { minHeight: "100vh", borderRadius: 0 } : {}}
      >
        {/* Next alarm hint */}
        {nextAlarmLabel && (
          <div className="flex items-center gap-2 rounded-full bg-[var(--muted)] px-4 py-1.5 text-xs font-semibold text-[var(--primary)]">
            <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
              <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            {nextAlarmLabel}
          </div>
        )}

        {/* SVG Clock */}
        <div className="relative">
          <AnalogClock
            date={date}
            showSeconds={showSeconds}
            showNumbers={showNumbers}
            showTicks={showTicks}
            theme={theme}
            accentColor={accentColor === "var(--primary)" ? undefined : accentColor}
            size={Math.min(320, typeof window !== "undefined" ? window.innerWidth - 80 : 300)}
          />
        </div>

        {/* Digital time */}
        <div className="text-center">
          <p
            className="text-4xl sm:text-5xl font-bold tabular-nums tracking-tight"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--foreground)" }}
          >
            {formatTime(date, use24h)}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {formatDate(date)}
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
            {getTimezoneLabel(date)}
          </p>
        </div>

        {/* Fullscreen button */}
        <button
          onClick={toggleFullscreen}
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--primary)] transition-all"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
          )}
        </button>
      </div>

      {/* Options toggle */}
      <button
        onClick={() => setShowOptions((v) => !v)}
        className="flex items-center gap-2 w-full justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:border-[var(--primary)] transition-all"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[var(--primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93a10 10 0 0 0-14.14 0M4.93 19.07a10 10 0 0 0 14.14 0" />
          </svg>
          Clock Options
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${showOptions ? "rotate-180" : ""}`}
          viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
        >
          <path d="M5.5 7.5L10 12l4.5-4.5" />
        </svg>
      </button>

      {showOptions && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          {/* Toggles */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Display</p>
            {[
              { label: "24-Hour Format", value: use24h, set: setUse24h },
              { label: "Show Seconds Hand", value: showSeconds, set: setShowSeconds },
              { label: "Show Hour Numbers", value: showNumbers, set: setShowNumbers },
              { label: "Show Tick Marks", value: showTicks, set: setShowTicks },
            ].map(({ label, value, set }) => (
              <label key={label} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[var(--foreground)]">{label}</span>
                <button
                  role="switch"
                  aria-checked={value}
                  onClick={() => set((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors ${
                    value
                      ? "bg-[var(--primary)] border-[var(--primary)]"
                      : "bg-[var(--muted)] border-[var(--border)]"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      value ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </label>
            ))}
          </div>

          {/* Theme + Accent */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-2">Theme</p>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                      theme === th.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                        : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-2">Accent Color</p>
              <div className="flex flex-wrap gap-2">
                {ACCENT_COLORS.map((color, idx) => (
                  <button
                    key={color.label}
                    onClick={() => setAccentIdx(idx)}
                    title={color.label}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      accentIdx === idx ? "border-[var(--foreground)] scale-110" : "border-transparent"
                    }`}
                    style={{ background: color.value }}
                    aria-label={color.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

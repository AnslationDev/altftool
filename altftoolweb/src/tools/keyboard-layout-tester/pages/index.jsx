"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Keyboard, Monitor, Trash2, CheckCircle, AlertCircle } from "lucide-react";

const KEY_ROWS = [
  ["Esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
  ["Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
  ["Caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "Enter"],
  ["Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "Shift"],
  ["Ctrl", "Alt", "Space", "Alt", "Ctrl"],
];

const KEY_WIDTHS = {
  Esc: "w-10",
  Backspace: "w-16",
  Tab: "w-12",
  "\\": "w-12",
  Caps: "w-14",
  Enter: "w-14",
  Shift: "w-18",
  Space: "w-40",
  Ctrl: "w-14",
  Alt: "w-12",
};

export default function ToolHome() {
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [keyLog, setKeyLog] = useState([]);
  const [keyCount, setKeyCount] = useState({});
  const [isTesting, setIsTesting] = useState(false);
  const [testStart, setTestStart] = useState(null);

  const handleKeyDown = useCallback((e) => {
    e.preventDefault();
    const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
    setPressedKeys((prev) => new Set(prev).add(key));
    setKeyLog((prev) => {
      const next = [...prev, { key, time: Date.now() }];
      return next.slice(-100);
    });
    setKeyCount((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));

    if (!isTesting) {
      setIsTesting(true);
      setTestStart(Date.now());
    }
  }, [isTesting]);

  const handleKeyUp = useCallback((e) => {
    const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
    setPressedKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const resetTest = () => {
    setPressedKeys(new Set());
    setKeyLog([]);
    setKeyCount({});
    setIsTesting(false);
    setTestStart(null);
  };

  const isPressed = (label) => pressedKeys.has(label) || pressedKeys.has(label.toLowerCase());

  const totalKeys = Object.values(keyCount).reduce((a, b) => a + b, 0);
  const uniqueKeys = Object.keys(keyCount).length;
  const elapsed = testStart ? ((Date.now() - testStart) / 1000).toFixed(1) : 0;
  const wpm = elapsed > 0 ? Math.round((totalKeys / 5) / (elapsed / 60)) : 0;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Keyboard className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">Keyboard Layout Tester</h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Utility, Developer</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Press any keys to test your keyboard layout — see real-time feedback, key rollover, and diagnostics.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Monitor size={14} className="text-primary" />
                  Visual Keyboard
                </h2>
                <button
                  onClick={resetTest}
                  className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  Reset
                </button>
              </div>

              <div className="space-y-1.5 select-none">
                {KEY_ROWS.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex justify-center gap-1">
                    {row.map((key) => {
                      const pressed = isPressed(key);
                      const width = KEY_WIDTHS[key] || "w-10";
                      return (
                        <div
                          key={key}
                          className={`${width} h-10 flex items-center justify-center rounded-lg border text-[9px] font-bold transition-all duration-75 ${
                            pressed
                              ? "bg-primary text-primary-foreground border-primary scale-95 shadow-md"
                              : "bg-surface-soft text-muted-foreground border-border"
                          }`}
                        >
                          {key === "Space" ? "" : key}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-primary" />
                Key Log (last 100)
              </h2>
              <div className="bg-surface-soft rounded-xl p-4 border border-border min-h-[80px] max-h-[120px] overflow-y-auto font-mono text-[11px] text-foreground leading-relaxed">
                {keyLog.length > 0 ? (
                  keyLog.map((entry, i) => (
                    <span key={i} className="inline-block mr-2 px-1.5 py-0.5 bg-background rounded border border-border mb-0.5">
                      {entry.key}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground italic">Press any key to start logging...</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle size={14} className="text-primary" />
                Session Stats
              </h2>

              {isTesting ? (
                <div className="space-y-3">
                  {[
                    { label: "Keys Pressed", value: totalKeys },
                    { label: "Unique Keys", value: uniqueKeys },
                    { label: "Elapsed (s)", value: elapsed },
                    { label: "Est. WPM", value: wpm },
                  ].map((s) => (
                    <div key={s.label} className="flex justify-between items-center px-4 py-2 bg-surface-soft rounded-lg border border-border">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{s.label}</span>
                      <span className="text-sm font-black text-foreground">{s.value}</span>
                    </div>
                  ))}

                  <div className="pt-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block">Key Frequency</label>
                    <div className="max-h-[160px] overflow-y-auto space-y-1">
                      {Object.entries(keyCount)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 15)
                        .map(([key, count]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="w-6 text-center text-[10px] font-bold text-foreground bg-surface-soft rounded px-1">{key}</span>
                            <div className="flex-1 bg-surface-soft rounded-full h-2 border border-border overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${(count / totalKeys) * 100}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground w-8 text-right">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Keyboard size={32} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-xs text-muted-foreground">Start pressing keys to begin the test.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

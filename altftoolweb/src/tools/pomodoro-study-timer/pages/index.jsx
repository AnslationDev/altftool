"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Timer, Coffee, BookOpen, Settings, RotateCcw, Play, Pause, SkipForward, Bell } from "lucide-react";

const MODES = {
  work: { label: "Focus", duration: 25, color: "text-primary" },
  short: { label: "Short Break", duration: 5, color: "text-emerald-500" },
  long: { label: "Long Break", duration: 15, color: "text-sky-500" },
};

export default function ToolHome() {
  const [mode, setMode] = useState("work");
  const [seconds, setSeconds] = useState(MODES.work.duration * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [workMins, setWorkMins] = useState(25);
  const [shortMins, setShortMins] = useState(5);
  const [longMins, setLongMins] = useState(15);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef(null);

  const totalSeconds = mode === "work" ? workMins * 60 : mode === "short" ? shortMins * 60 : longMins * 60;
  const progress = ((totalSeconds - seconds) / totalSeconds) * 100;

  const switchMode = useCallback((m) => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setMode(m);
    setSeconds((m === "work" ? workMins : m === "short" ? shortMins : longMins) * 60);
  }, [workMins, shortMins, longMins]);

  const reset = useCallback(() => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setSeconds(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === "work") setSessions(n => n + 1);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  useEffect(() => {
    setSeconds((mode === "work" ? workMins : mode === "short" ? shortMins : longMins) * 60);
  }, [workMins, shortMins, longMins, mode]);

  const pad = (n) => String(n).padStart(2, "0");
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const circumference = 2 * Math.PI * 90;
  const dashoffset = circumference * (1 - progress / 100);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl mx-auto space-y-6">

        {/* Header Card */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">Pomodoro Study Timer</h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Productivity</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Boost focus with customizable work and break intervals.
                </p>
              </div>
            </div>
            <div className="flex gap-1.5 shrink-0 self-start md:self-auto">
              {[["work","Focus"], ["short","Short Break"], ["long","Long Break"]].map(([k,l]) => (
                <button key={k} onClick={() => switchMode(k)}
                  className={`rounded-md px-2.5 py-1 text-[10px] font-semibold border transition-colors ${mode === k ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Timer Circle */}
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm flex flex-col items-center gap-6">
          <div className="relative w-52 h-52">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="var(--border)" strokeWidth="8" />
              <circle cx="100" cy="100" r="90" fill="none"
                stroke={mode === "work" ? "var(--primary)" : mode === "short" ? "#10b981" : "#0ea5e9"}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={dashoffset}
                style={{ transition: "stroke-dashoffset 1s linear" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold font-mono text-foreground tabular-nums">{pad(mins)}:{pad(secs)}</span>
              <span className="text-xs text-muted-foreground mt-1">{MODES[mode].label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={reset}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-surface-soft transition-colors">
              <RotateCcw className="h-4 w-4" />
            </button>
            <button onClick={() => setRunning(r => !r)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-colors">
              {running ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
            </button>
            <button onClick={() => switchMode(mode === "work" ? "short" : "work")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-surface-soft transition-colors">
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{sessions}</div>
              <div className="text-xs text-muted-foreground">Sessions Done</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <div className="text-2xl font-bold text-foreground">{Math.round(progress)}%</div>
              <div className="text-xs text-muted-foreground">Progress</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <div className="text-2xl font-bold text-foreground">{sessions >= 4 ? "🔥" : sessions >= 2 ? "⭐" : "🌱"}</div>
              <div className="text-xs text-muted-foreground">Streak</div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <button onClick={() => setShowSettings(s => !s)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-foreground hover:bg-surface-soft transition-colors">
            <span className="flex items-center gap-2"><Settings className="h-4 w-4 text-primary" /> Custom Durations</span>
            <span className="text-xs text-muted-foreground">{showSettings ? "Hide" : "Show"}</span>
          </button>
          {showSettings && (
            <div className="border-t border-border px-5 py-4 grid grid-cols-3 gap-4">
              {[["Focus (mins)", workMins, setWorkMins], ["Short Break", shortMins, setShortMins], ["Long Break", longMins, setLongMins]].map(([label, val, setter]) => (
                <div key={label}>
                  <label className="text-xs text-muted-foreground font-medium mb-1.5 block">{label}</label>
                  <input type="number" min={1} max={120} value={val}
                    onChange={e => setter(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono font-bold text-foreground outline-none focus:border-primary" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Guide */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5" /> How to use
          </h2>
          <ol className="space-y-2 text-xs text-muted-foreground">
            <li className="flex gap-2"><span className="font-bold text-primary">1.</span> Set your focus duration (default: 25 mins)</li>
            <li className="flex gap-2"><span className="font-bold text-primary">2.</span> Press Play and focus on one task only</li>
            <li className="flex gap-2"><span className="font-bold text-primary">3.</span> Take a short break when the timer ends</li>
            <li className="flex gap-2"><span className="font-bold text-primary">4.</span> After 4 sessions, take a long break</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

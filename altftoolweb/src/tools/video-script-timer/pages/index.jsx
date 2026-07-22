"use client";

import React, { useState } from "react";
import { Mic, Clock, Copy, Check, Info } from "lucide-react";

const SPEEDS = [
  { label: "Slow (podcast)", wpm: 130 },
  { label: "Conversational", wpm: 150 },
  { label: "Standard speech", wpm: 175 },
  { label: "Fast speech", wpm: 200 },
  { label: "Rapid (auctioneer)", wpm: 250 },
];

const LANGUAGES = [
  { label: "English", syllables: 1.5 },
  { label: "Spanish", syllables: 2.2 },
  { label: "French", syllables: 1.8 },
  { label: "German", syllables: 1.6 },
  { label: "Japanese", syllables: 1.2 },
  { label: "Mandarin", syllables: 1.1 },
];

export default function ToolHome() {
  const [script, setScript] = useState("");
  const [speed, setSpeed] = useState(SPEEDS[2]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [includePauses, setIncludePauses] = useState(true);
  const [copied, setCopied] = useState(false);

  const words = script.trim() ? script.trim().split(/\s+/).length : 0;
  const chars = script.length;
  const syllables = words * language.syllables;

  const baseSeconds = (words / speed.wpm) * 60;
  const pauseSeconds = includePauses ? Math.floor(baseSeconds / 45) * 2 : 0;
  const totalSeconds = baseSeconds + pauseSeconds;

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.round(secs % 60);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const copyResult = () => {
    const text = [
      `Script: ${words} words / ${chars} characters`,
      `Speed: ${speed.wpm} WPM (${speed.label})`,
      `Language: ${language.label}`,
      `Estimated Duration: ${formatTime(totalSeconds)}`,
      pauses > 0 ? `(with ${pauses} pauses for punctuation/paragraphs)` : "",
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pauses = includePauses ? Math.floor(baseSeconds / 45) : 0;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl mx-auto space-y-6">

        {/* Header Card */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft group-hover:bg-primary/10 transition-colors">
              <Mic className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground leading-none">Video Script Timer</h1>
                <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Video Tools</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Estimate your video or voiceover duration from script word count.</p>
            </div>
          </div>
        </section>

        {/* Script Input */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <textarea value={script} onChange={e => setScript(e.target.value)}
            placeholder="Paste or type your script here..."
            rows={8}
            className="w-full resize-y rounded-t-xl border-0 bg-background px-5 py-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-0" />
          <div className="flex items-center justify-between border-t border-border px-5 py-2.5 text-[11px] text-muted-foreground">
            <span>{words} words · {chars} characters</span>
          </div>
        </div>

        {/* Settings */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Speaking Speed</label>
              <div className="flex flex-wrap gap-2">
                {SPEEDS.map(s => (
                  <button key={s.label} onClick={() => setSpeed(s)}
                    className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${speed.wpm === s.wpm ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:bg-surface-soft"}`}>
                    {s.wpm} WPM
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">Selected: {speed.label}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Language / Syllable Rate</label>
              <select value={language.label} onChange={e => setLanguage(LANGUAGES.find(l => l.label === e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
                {LANGUAGES.map(l => <option key={l.label} value={l.label}>{l.label} ({l.syllables} syll/word avg)</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={includePauses} onChange={e => setIncludePauses(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary" />
            <span className="text-xs text-foreground font-medium">Include pauses for punctuation and paragraph breaks (~2s per 45s of speech)</span>
          </label>
        </div>

        {/* Results */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Estimated Duration</span>
            </div>
            <button onClick={copyResult}
              className="rounded-lg border border-border px-3 py-1.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-soft transition-colors flex items-center gap-1.5">
              {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              ["Total Duration", formatTime(totalSeconds)],
              ["Speaking Time", formatTime(baseSeconds)],
              ["Pauses", `${pauses} pauses (${formatTime(pauseSeconds)})`],
              ["Speaking Rate", `${speed.wpm} WPM`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border bg-background p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">{label}</div>
                <div className="text-lg font-bold font-mono text-primary">{value}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border text-[10px] text-muted-foreground flex items-start gap-1.5">
            <Info className="h-3 w-3 shrink-0 mt-0.5" />
            <span>Estimates based on average speaking rates. Actual duration varies by delivery style, language, and content complexity.</span>
          </div>
        </div>

      </div>
    </div>
  );
}

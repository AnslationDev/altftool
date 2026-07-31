"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { BookOpen, Play, RotateCcw, TrendingUp, ChevronRight } from "lucide-react";

const PASSAGES = [
  {
    title: "Technology & Future",
    text: "Artificial intelligence is transforming every industry, from healthcare diagnostics to autonomous vehicles. Machine learning algorithms can now detect early-stage cancers with greater accuracy than experienced radiologists, while natural language processing enables computers to understand and generate human language with remarkable fluency. The convergence of these technologies is creating unprecedented opportunities for innovation, but also raises profound ethical questions about privacy, employment, and the nature of human creativity in an increasingly automated world.",
  },
  {
    title: "The Ocean Depths",
    text: "The deep ocean remains one of Earth's greatest unexplored frontiers. Below 200 meters, sunlight disappears entirely and pressure becomes crushing. Yet life thrives in extraordinary diversity. Bioluminescent creatures like anglerfish and comb jellies illuminate the darkness with their own cold light. Giant tube worms cluster around hydrothermal vents where superheated mineral-rich water shoots from the seafloor, supporting entire ecosystems independent of solar energy. Scientists estimate that the deep ocean may harbor millions of undiscovered species.",
  },
  {
    title: "Urban Architecture",
    text: "Modern cities are living laboratories for architectural innovation. Vertical gardens cascade down glass facades while rooftop parks provide urban green space above the concrete jungle. Parametric design tools allow architects to create swooping organic forms previously impossible to calculate by hand. Smart buildings embed thousands of sensors to optimize energy use, adjusting lighting, temperature, and ventilation in real time. The boundary between architecture and engineering continues to blur as buildings become increasingly complex integrated systems of structure, skin, and technology.",
  },
];

export default function ToolHome() {
  const [passageIdx, setPassageIdx] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle | countdown | reading | result
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [wpm, setWpm] = useState(null);
  const [history, setHistory] = useState([]);
  const [announcement, setAnnouncement] = useState("");
  const intervalRef = useRef(null);
  const passage = PASSAGES[passageIdx];
  const wordCount = passage.text.split(/\s+/).length;

  const getLevel = (w) => {
    if (w >= 500) return { label: "Speed Reader", color: "text-info" };
    if (w >= 350) return { label: "Advanced", color: "text-success-text" };
    if (w >= 250) return { label: "Average", color: "text-primary" };
    if (w >= 150) return { label: "Below Average", color: "text-warning-text" };
    return { label: "Beginner", color: "text-muted-foreground" };
  };

  const startTest = useCallback(() => {
    setPhase("countdown");
    setCountdown(3);
    setAnnouncement("Get ready. Reading starts in 3 seconds.");
    let c = 3;
    // Stored on intervalRef (not a local variable) from the moment it is
    // created so reset()/unmount can always cancel whichever timer -
    // countdown or reading - is currently running.
    intervalRef.current = setInterval(() => {
      c--;
      if (c <= 0) {
        clearInterval(intervalRef.current);
        setPhase("reading");
        setElapsed(0);
        setAnnouncement('Reading started. Press "I Finished Reading" when you reach the end.');
        intervalRef.current = setInterval(() => setElapsed(e => e + 100), 100);
      } else {
        setCountdown(c);
      }
    }, 1000);
  }, []);

  const finish = useCallback(() => {
    // Guard against a zero-elapsed click (e.g. the instant the "reading"
    // phase begins, before the first 100ms tick lands) - dividing by zero
    // would otherwise produce an "Infinity WPM" result saved into history.
    if (elapsed <= 0) return;
    clearInterval(intervalRef.current);
    const mins = elapsed / 60000;
    const calculated = Math.round(wordCount / mins);
    setWpm(calculated);
    setHistory(h => [{ wpm: calculated, passage: passage.title, words: wordCount }, ...h].slice(0, 8));
    setPhase("result");
    setAnnouncement(`Result ready: ${calculated} words per minute, ${getLevel(calculated).label}.`);
  }, [elapsed, wordCount, passage.title]);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setPhase("idle");
    setElapsed(0);
    setWpm(null);
    setCountdown(3);
    setAnnouncement("");
  }, []);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft group-hover:bg-primary/10 transition-colors">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground leading-none">Reading Speed Calculator</h1>
                <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Productivity</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Measure your reading speed in words per minute (WPM).</p>
            </div>
          </div>
        </section>

        <div className="sr-only" role="status" aria-live="polite">{announcement}</div>

        {/* Passage Selector */}
        {phase === "idle" && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold text-foreground mb-3">Choose Passage</p>
            <div className="grid gap-2">
              {PASSAGES.map((p, i) => (
                <button key={i} onClick={() => setPassageIdx(i)}
                  className={`rounded-lg border p-3 text-left transition-colors flex items-center justify-between ${passageIdx === i ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:bg-surface-soft"}`}>
                  <div>
                    <div className="text-xs font-bold">{p.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{p.text.split(/\s+/).length} words</div>
                  </div>
                  <ChevronRight className={`h-4 w-4 ${passageIdx === i ? "text-primary" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reading Area */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {phase === "idle" && (
            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{passage.title}</p>
              <p className="text-sm leading-relaxed text-muted-foreground blur-sm select-none" aria-hidden="true">{passage.text}</p>
              <p className="text-xs text-center text-primary font-semibold mt-4">Text will reveal when the test starts</p>
            </div>
          )}
          {phase === "countdown" && (
            <div className="p-16 flex flex-col items-center gap-4">
              <div className="text-6xl font-black text-primary">{countdown}</div>
              <p className="text-sm text-muted-foreground">Get ready to read...</p>
            </div>
          )}
          {phase === "reading" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">{passage.title}</p>
                <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">{(elapsed / 1000).toFixed(1)}s</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground">{passage.text}</p>
            </div>
          )}
          {phase === "result" && wpm && (
            <div className="p-8 flex flex-col items-center gap-3">
              <div className={`text-6xl font-black ${getLevel(wpm).color}`}>{wpm}</div>
              <div className="text-lg font-bold text-foreground">Words Per Minute</div>
              <div className={`text-sm font-semibold ${getLevel(wpm).color}`}>{getLevel(wpm).label}</div>
              <div className="text-xs text-muted-foreground">{wordCount} words in {(elapsed / 1000).toFixed(1)}s</div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {phase === "idle" && (
            <button onClick={startTest} className="flex-1 rounded-xl bg-primary text-white py-3 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
              <Play className="h-4 w-4" /> Start Reading Test
            </button>
          )}
          {phase === "reading" && (
            <button onClick={finish} disabled={elapsed <= 0} className="flex-1 rounded-xl bg-emerald-500 text-white py-3 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <TrendingUp className="h-4 w-4" /> I Finished Reading
            </button>
          )}
          {(phase === "result" || phase === "countdown") && (
            <button onClick={reset} className="flex-1 rounded-xl border border-border bg-card text-foreground py-3 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-surface-soft transition-colors">
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          )}
          {phase === "result" && (
            <button onClick={startTest} className="flex-1 rounded-xl bg-primary text-white py-3 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
              <Play className="h-4 w-4" /> Try Again
            </button>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-border text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> History
            </div>
            <div className="divide-y divide-border">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-2.5 text-xs">
                  <span className="text-muted-foreground">{h.passage}</span>
                  <span className={`font-bold ${getLevel(h.wpm).color}`}>{h.wpm} WPM</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WPM Scale */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2"><BookOpen className="h-3.5 w-3.5" /> WPM Scale</p>
          <div className="space-y-2">
            {[["< 150", "Beginner", "text-muted-foreground"], ["150–250", "Below Average", "text-warning-text"], ["250–350", "Average", "text-primary"], ["350–500", "Advanced", "text-success-text"], ["> 500", "Speed Reader", "text-info"]].map(([r, l, c]) => (
              <div key={r} className="flex items-center justify-between text-xs">
                <span className="font-mono text-muted-foreground">{r} WPM</span>
                <span className={`font-semibold ${c}`}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

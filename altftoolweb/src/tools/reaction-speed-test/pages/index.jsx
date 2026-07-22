"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Zap, RotateCcw, TrendingUp, Award, Activity } from "lucide-react";

const STATES = { waiting: "waiting", ready: "ready", go: "go", result: "result", toosoon: "toosoon" };

export default function ToolHome() {
  const [gameState, setGameState] = useState(STATES.waiting);
  const [reactionTime, setReactionTime] = useState(null);
  const [history, setHistory] = useState([]);
  const timeoutRef = useRef(null);
  const startRef = useRef(null);

  const startTest = useCallback(() => {
    setGameState(STATES.ready);
    setReactionTime(null);
    const delay = 2000 + Math.random() * 3000;
    timeoutRef.current = setTimeout(() => {
      startRef.current = Date.now();
      setGameState(STATES.go);
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    if (gameState === STATES.waiting) { startTest(); return; }
    if (gameState === STATES.ready) {
      clearTimeout(timeoutRef.current);
      setGameState(STATES.toosoon);
      return;
    }
    if (gameState === STATES.go) {
      const rt = Date.now() - startRef.current;
      setReactionTime(rt);
      setHistory(h => [rt, ...h].slice(0, 10));
      setGameState(STATES.result);
      return;
    }
    if (gameState === STATES.result || gameState === STATES.toosoon) {
      startTest();
    }
  }, [gameState, startTest]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const avg = history.length ? Math.round(history.reduce((a, b) => a + b, 0) / history.length) : null;
  const best = history.length ? Math.min(...history) : null;

  const getCategory = (ms) => {
    if (ms < 150) return { label: "Elite", color: "text-purple-500" };
    if (ms < 200) return { label: "Pro", color: "text-emerald-500" };
    if (ms < 250) return { label: "Above Average", color: "text-primary" };
    if (ms < 350) return { label: "Average", color: "text-amber-500" };
    return { label: "Keep Practicing", color: "text-muted-foreground" };
  };

  const bgColor = {
    waiting: "bg-card", ready: "bg-amber-500/10", go: "bg-emerald-500/20", result: "bg-primary/5", toosoon: "bg-red-500/10"
  }[gameState];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft group-hover:bg-primary/10 transition-colors">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground leading-none">Reaction Speed Test</h1>
                <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Games & Fun</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Test your reflexes. Click when the screen turns green!</p>
            </div>
          </div>
        </section>

        {/* Game Area */}
        <button onClick={handleClick}
          className={`w-full rounded-2xl border border-border p-16 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 select-none ${bgColor} hover:opacity-90 active:scale-[0.99]`}>

          {gameState === STATES.waiting && (
            <>
              <Zap className="h-12 w-12 text-primary" />
              <p className="text-xl font-bold text-foreground">Click to Start</p>
              <p className="text-sm text-muted-foreground">Click anywhere to begin the test</p>
            </>
          )}
          {gameState === STATES.ready && (
            <>
              <div className="h-12 w-12 rounded-full bg-amber-500 flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <p className="text-xl font-bold text-amber-600">Get Ready...</p>
              <p className="text-sm text-muted-foreground">Wait for green, then click!</p>
            </>
          )}
          {gameState === STATES.go && (
            <>
              <Zap className="h-12 w-12 text-emerald-500 animate-bounce" />
              <p className="text-3xl font-black text-emerald-500">CLICK NOW!</p>
            </>
          )}
          {gameState === STATES.result && reactionTime && (
            <>
              <div className={`text-5xl font-black ${getCategory(reactionTime).color}`}>{reactionTime} ms</div>
              <div className={`text-lg font-bold ${getCategory(reactionTime).color}`}>{getCategory(reactionTime).label}</div>
              <p className="text-sm text-muted-foreground">Click to try again</p>
            </>
          )}
          {gameState === STATES.toosoon && (
            <>
              <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-xl font-bold text-red-500">Too Soon!</p>
              <p className="text-sm text-muted-foreground">Wait for the green signal. Click to retry.</p>
            </>
          )}
        </button>

        {/* Stats */}
        {history.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[["Best", best ? `${best} ms` : "—", "text-emerald-500"], ["Average", avg ? `${avg} ms` : "—", "text-primary"], ["Attempts", history.length, "text-foreground"]].map(([l, v, c]) => (
              <div key={l} className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
                <div className={`text-2xl font-bold ${c}`}>{v}</div>
                <div className="text-xs text-muted-foreground mt-1">{l}</div>
              </div>
            ))}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <span className="text-sm font-semibold text-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Recent Attempts</span>
              <button onClick={() => setHistory([])} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear</button>
            </div>
            <div className="divide-y divide-border">
              {history.map((rt, i) => {
                const cat = getCategory(rt);
                return (
                  <div key={i} className="flex items-center justify-between px-5 py-2.5">
                    <span className="text-xs text-muted-foreground">#{history.length - i}</span>
                    <span className="text-sm font-mono font-bold text-foreground">{rt} ms</span>
                    <span className={`text-xs font-semibold ${cat.color}`}>{cat.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scale */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2"><Award className="h-3.5 w-3.5" /> Performance Scale</p>
          <div className="space-y-2">
            {[["< 150 ms", "Elite", "text-purple-500"], ["150–200 ms", "Pro", "text-emerald-500"], ["200–250 ms", "Above Average", "text-primary"], ["250–350 ms", "Average", "text-amber-500"], ["> 350 ms", "Keep Practicing", "text-muted-foreground"]].map(([r, l, c]) => (
              <div key={r} className="flex items-center justify-between text-xs">
                <span className="font-mono text-muted-foreground">{r}</span>
                <span className={`font-semibold ${c}`}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

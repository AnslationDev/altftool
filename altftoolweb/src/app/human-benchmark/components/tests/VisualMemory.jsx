"use client";
import { StatsChart, AboutCard } from "../shared/StatsPanel";

const DIST = [
  {label:"1",value:2},{label:"2",value:6},{label:"3",value:14},{label:"4",value:28},
  {label:"5",value:46},{label:"6",value:62},{label:"7",value:68},{label:"8",value:54},
  {label:"9",value:36},{label:"10",value:22},{label:"11",value:12},{label:"12",value:6},
  {label:"13",value:3},{label:"14",value:1},
];
const ABOUT = {
  what: "Visual memory tests your visuospatial working memory — the ability to encode, retain, and recall spatial patterns. Each level adds more squares and expands the grid, increasingly challenging your capacity.",
  average: "Level 7 (approximately 9 flashing squares)",
  facts: [
    "Working memory holds roughly 4±1 chunks simultaneously (Cowan, 2001).",
    "Chess grandmasters use 'chunking' to remember complex board positions, not raw memory.",
    "Visuospatial memory declines with age faster than verbal memory.",
  ],
};
import { useState, useEffect, useCallback } from "react";

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function getGridSize(level) { return Math.min(10, 4 + Math.floor((level - 1) / 2)); }
function getFlashCount(level) { return Math.min(level + 2, getGridSize(level) ** 2 - 1); }
function pickRandom(n, max) { const a=[]; while(a.length<n){const r=Math.floor(Math.random()*max);if(!a.includes(r))a.push(r);} return a; }

export default function VisualMemory({ onComplete, beep }) {
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [state, setState] = useState("idle"); // idle|show|input|gameover
  const [flashed, setFlashed] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState([]);
  const [bestLevel, setBestLevel] = useState(1);

  const startLevel = useCallback((lvl) => {
    const gs = getGridSize(lvl);
    const total = gs * gs;
    const fc = getFlashCount(lvl);
    const cells = pickRandom(fc, total);
    setFlashed(cells);
    setSelected([]);
    setRevealed(true);
    setState("show");
    setTimeout(() => { setRevealed(false); setState("input"); }, 1200);
  }, []);

  const handleStart = () => startLevel(level);

  const handleCellClick = useCallback((idx) => {
    if (state !== "input") return;
    if (selected.includes(idx)) return;
    if (!flashed.includes(idx)) {
      beep?.wrong();
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) { setState("gameover"); return; }
      startLevel(level);
      return;
    }
    beep?.correct();
    const next = [...selected, idx];
    setSelected(next);
    if (next.length === flashed.length) {
      const nl = level + 1;
      setBestLevel(l => Math.max(l, level));
      setLevel(nl);
      setTimeout(() => startLevel(nl), 600);
    }
  }, [state, selected, flashed, lives, level, startLevel, beep]);

  const gs = getGridSize(level);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm font-bold text-[var(--foreground)]">Level {level} — Grid {gs}×{gs}</div>
        <div className="flex gap-1">{Array.from({length:3}).map((_,i)=>(
          <span key={i} className={`text-lg ${i<lives?"":"opacity-20"}`}>❤️</span>
        ))}</div>
      </div>
      {state === "idle" && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-10 text-center">
          <div className="text-5xl mb-4">👁️</div>
          <p className="text-sm text-[var(--secondary-foreground)] mb-6">{getFlashCount(level)} squares will flash. Memorize and click them.</p>
          <button onClick={handleStart} className="rounded-xl bg-[var(--primary)] px-8 py-3 font-black text-[var(--primary-foreground)]">Start Level {level}</button>
        </div>
      )}
      {(state === "show" || state === "input") && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="grid gap-1.5 mx-auto" style={{ gridTemplateColumns:`repeat(${gs},1fr)`, maxWidth: gs*56 }}>
            {Array.from({length:gs*gs}).map((_,i) => {
              const isFlash = flashed.includes(i);
              const isSel = selected.includes(i);
              return (
                <button key={i} onClick={() => handleCellClick(i)}
                  className={`aspect-square rounded-lg border ${
                    revealed && isFlash ? "bg-[var(--primary)] border-[var(--primary)]"
                    : isSel ? "bg-[var(--primary)]/50 border-[var(--primary)]/50"
                    : "bg-[var(--background)] border-[var(--card-border)]"
                  }`}
                  style={{ minWidth:40, minHeight:40 }}
                />
              );
            })}
          </div>
        </div>
      )}
      {state === "gameover" && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-10 text-center space-y-4">
          <div className="text-4xl font-black text-[var(--primary)]">Level {bestLevel}</div>
          <p className="text-sm text-[var(--secondary-foreground)]">Game over — you reached level {bestLevel}.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => onComplete(bestLevel)} className="rounded-xl bg-[var(--primary)] px-6 py-3 font-black text-[var(--primary-foreground)]">Save Score</button>
            <button onClick={() => { setLevel(1); setLives(3); setBestLevel(1); setState("idle"); }}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-6 py-3 font-bold text-[var(--secondary-foreground)]">Retry</button>
          </div>
        </div>
      )}
      <StatsChart data={DIST} xLabel="Level reached" title="Population Score Distribution" subtitle="How 200,000+ users scored on this test" />
      <AboutCard {...ABOUT} />
    </div>
  );
}

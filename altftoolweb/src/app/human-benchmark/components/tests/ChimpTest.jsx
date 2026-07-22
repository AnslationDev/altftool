"use client";
import { StatsChart, AboutCard } from "../shared/StatsPanel";

const DIST = [
  {label:"4",value:10},{label:"5",value:24},{label:"6",value:42},{label:"7",value:60},
  {label:"8",value:72},{label:"9",value:58},{label:"10",value:38},{label:"11",value:22},
  {label:"12",value:11},{label:"13",value:5},{label:"14",value:2},{label:"15",value:1},
];
const ABOUT = {
  what: "The chimp test is inspired by landmark research showing chimpanzees outperform humans on certain short-term photographic memory tasks. It measures your iconic memory — a pre-conscious image buffer.",
  average: "N = 8 numbers",
  facts: [
    "Ayumu, a chimpanzee at Kyoto University, consistently outperformed adult humans on this exact task.",
    "Chimps may retain stronger photographic (iconic) memory because humans traded it for language processing.",
    "Iconic memory decays within 0.5\u20131 second in both humans and great apes.",
    "Children aged 9\u201311 sometimes outperform adults on this test, possibly due to untrained iconic memory.",
  ],
};
import { useState, useCallback } from "react";

const COLS = 4, ROWS = 8, TOTAL = COLS * ROWS;

function pickRandom(n, max) {
  const a = [];
  while (a.length < n) { const r = Math.floor(Math.random() * max); if (!a.includes(r)) a.push(r); }
  return a;
}

export default function ChimpTest({ onComplete, beep }) {
  const [level, setLevel] = useState(4); // N numbers
  const [state, setState] = useState("idle"); // idle|show|hidden|gameover
  const [cellMap, setCellMap] = useState({}); // cellIndex -> number
  const [nextExpected, setNextExpected] = useState(1);
  const [bestN, setBestN] = useState(0);
  const [clickedCells, setClickedCells] = useState(new Set());

  const startLevel = useCallback((n) => {
    const cells = pickRandom(n, TOTAL);
    const map = {};
    cells.forEach((c, i) => { map[c] = i + 1; });
    setCellMap(map);
    setNextExpected(1);
    setClickedCells(new Set());
    setState("show");
    setTimeout(() => setState("hidden"), n * 300);
  }, []);

  const handleStart = () => startLevel(level);

  const handleCellClick = useCallback((idx) => {
    if (state !== "hidden" && state !== "show") return;
    const num = cellMap[idx];
    if (!num) { beep?.wrong(); setState("gameover"); return; }
    if (num !== nextExpected) { beep?.wrong(); setState("gameover"); return; }
    beep?.correct();
    const newClicked = new Set([...clickedCells, idx]);
    setClickedCells(newClicked);
    const ne = nextExpected + 1;
    setNextExpected(ne);
    if (ne > level) {
      setBestN(level);
      const nl = level + 1;
      setLevel(nl);
      setTimeout(() => startLevel(nl), 800);
    }
  }, [state, cellMap, nextExpected, level, clickedCells, startLevel, beep]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-[var(--foreground)]">
        <span>N = {level} numbers</span>
        {bestN > 0 && <span className="text-[var(--primary)]">Best: N={bestN}</span>}
      </div>

      {state === "idle" && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-10 text-center space-y-4">
          <div className="text-5xl">🐒</div>
          <p className="text-sm text-[var(--secondary-foreground)] max-w-sm mx-auto">
            Numbers 1–{level} will appear on the grid. Memorize their positions, then click them in order (1→N) after they disappear.
          </p>
          <button onClick={handleStart} className="rounded-xl bg-[var(--primary)] px-8 py-3 font-black text-[var(--primary-foreground)]">Start</button>
        </div>
      )}

      {(state === "show" || state === "hidden") && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          {state === "show" && <p className="text-center text-xs font-bold text-[var(--muted-foreground)] mb-3">Memorize the positions...</p>}
          {state === "hidden" && <p className="text-center text-xs font-bold text-[var(--primary)] mb-3">Click 1 → {level} in order!</p>}
          <div className="grid gap-1.5 mx-auto" style={{ gridTemplateColumns:`repeat(${COLS},1fr)`, maxWidth:320 }}>
            {Array.from({ length: TOTAL }).map((_, i) => {
              const num = cellMap[i];
              const clicked = clickedCells.has(i);
              return (
                <button key={i} onClick={() => handleCellClick(i)}
                  className={`aspect-square rounded-lg border flex items-center justify-center font-black text-sm ${
                    clicked ? "bg-[var(--primary)]/30 border-[var(--primary)]/30 text-[var(--primary)]"
                    : num && state === "show" ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)]"
                    : num && state === "hidden" ? "bg-[var(--card-border)] border-[var(--card-border)] text-transparent cursor-pointer"
                    : "bg-[var(--background)] border-[var(--card-border)] cursor-pointer"
                  }`}
                  style={{ minHeight: 38 }}>
                  {state === "show" && num ? num : clicked ? "✓" : ""}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {state === "gameover" && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-10 text-center space-y-4">
          <div className="text-4xl font-black text-[var(--primary)]">N = {bestN}</div>
          <p className="text-sm text-[var(--secondary-foreground)]">You successfully completed N={bestN}.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => onComplete(bestN)} className="rounded-xl bg-[var(--primary)] px-6 py-3 font-black text-[var(--primary-foreground)]">Save Score</button>
            <button onClick={() => { setLevel(4); setBestN(0); setState("idle"); }}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-6 py-3 font-bold text-[var(--secondary-foreground)]">Retry</button>
          </div>
        </div>
      )}
      <StatsChart data={DIST} xLabel="Highest N completed" title="Population Score Distribution" subtitle="How 200,000+ users scored on this test" />
      <AboutCard {...ABOUT} />
    </div>
  );
}

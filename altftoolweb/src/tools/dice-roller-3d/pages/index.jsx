"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Dices, RefreshCw, History, Plus, Minus } from "lucide-react";

const DICE_TYPES = [
  { sides: 4, label: "D4", icon: "▲" },
  { sides: 6, label: "D6", icon: "●" },
  { sides: 8, label: "D8", icon: "◆" },
  { sides: 10, label: "D10", icon: "🔷" },
  { sides: 12, label: "D12", icon: "⬡" },
  { sides: 20, label: "D20", icon: "⬠" },
];

function getRollAnimation(sides) {
  const results = [];
  const count = Math.min(sides, 20);
  for (let i = 0; i < 6; i++) {
    results.push(Math.floor(Math.random() * sides) + 1);
  }
  results.push(Math.floor(Math.random() * sides) + 1);
  return results;
}

function DiceFace({ value, sides, isRolling, color }) {
  const maxDots = Math.min(value, 6);
  const dotPositions = [];
  if (maxDots >= 1) dotPositions.push("top-left");
  if (maxDots >= 2) dotPositions.push("top-right");
  if (maxDots >= 3) dotPositions.push("middle-left");
  if (maxDots >= 4) dotPositions.push("middle-right");
  if (maxDots >= 5) dotPositions.push("bottom-left");
  if (maxDots >= 6) dotPositions.push("bottom-right");

  const getDotStyle = (pos) => {
    const styles = {
      "top-left": { top: "22%", left: "22%" },
      "top-right": { top: "22%", right: "22%" },
      "middle-left": { top: "50%", left: "22%", transform: "translateY(-50%)" },
      "middle-right": { top: "50%", right: "22%", transform: "translateY(-50%)" },
      "bottom-left": { bottom: "22%", left: "22%" },
      "bottom-right": { bottom: "22%", right: "22%" },
    };
    return styles[pos];
  };

  if (sides <= 6) {
    return (
      <div className={`relative flex h-24 w-24 items-center justify-center rounded-2xl shadow-lg transition-all duration-200 ${isRolling ? "animate-bounce" : ""}`} style={{ backgroundColor: color, transform: isRolling ? `rotate(${Math.random() * 720}deg)` : "none" }}>
        {dotPositions.map((pos, i) => (
          <div key={i} className="absolute h-3 w-3 rounded-full bg-white/90" style={getDotStyle(pos)} />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex h-24 w-24 items-center justify-center rounded-2xl shadow-lg transition-all duration-200 ${isRolling ? "animate-bounce" : ""}`} style={{ backgroundColor: color, transform: isRolling ? `rotate(${Math.random() * 720}deg)` : "none" }}>
      <span className="text-3xl font-black text-white">{value}</span>
    </div>
  );
}

export default function ToolHome() {
  const [diceType, setDiceType] = useState(DICE_TYPES[1]);
  const [count, setCount] = useState(1);
  const [results, setResults] = useState([]);
  const [isRolling, setIsRolling] = useState(false);
  const [total, setTotal] = useState(0);
  const [history, setHistory] = useState([]);
  const [animValues, setAnimValues] = useState([]);

  const rollDice = useCallback(() => {
    if (isRolling) return;
    setIsRolling(true);

    const anims = [];
    const finalResults = [];
    let sum = 0;

    for (let i = 0; i < count; i++) {
      const r = Math.floor(Math.random() * diceType.sides) + 1;
      finalResults.push(r);
      sum += r;
      anims.push(getRollAnimation(diceType.sides));
    }

    setAnimValues(anims);
    setTimeout(() => {
      setResults(finalResults);
      setTotal(sum);
      setIsRolling(false);
      setHistory((prev) => [{ dice: diceType.label, count, results: finalResults, total: sum, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 20));
    }, 800);
  }, [diceType, count, isRolling]);

  const DICE_COLORS = ["#FF6B6B", "#FFA502", "#FFD93D", "#6BCB77", "#4D96FF", "#9B59B6", "#FF6B9D", "#2DD4BF"];

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--primary)">
            <Dices className="h-4 w-4" /> Classic Gaming
          </div>
          <h1 className="text-4xl font-bold text-(--foreground)">Dice Roller (3D)</h1>
          <p className="mt-2 text-(--muted-foreground)">Roll virtual dice with realistic animations. Supports D4 through D20.</p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
          <div className="mb-6 flex flex-wrap gap-2">
            {DICE_TYPES.map((dt) => (
              <button key={dt.sides} onClick={() => setDiceType(dt)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${diceType.sides === dt.sides ? "bg-(--primary) text-white shadow-md" : "border border-(--border) bg-(--background) text-(--muted-foreground) hover:border-(--primary)"}`}>
                <span>{dt.icon}</span> {dt.label}
              </button>
            ))}
          </div>

          <div className="mb-6 flex items-center gap-4">
            <span className="text-sm font-semibold text-(--foreground)">Dice count:</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCount(Math.max(1, count - 1))} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-(--border) bg-(--background) text-(--muted-foreground) hover:border-(--primary)"><Minus className="h-4 w-4" /></button>
              <span className="w-8 text-center text-lg font-bold text-(--foreground)">{count}</span>
              <button onClick={() => setCount(Math.min(10, count + 1))} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-(--border) bg-(--background) text-(--muted-foreground) hover:border-(--primary)"><Plus className="h-4 w-4" /></button>
            </div>
          </div>

          <button onClick={rollDice} disabled={isRolling} className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-(--primary) px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
            <Dices className="h-5 w-5" /> {isRolling ? "Rolling..." : "Roll Dice"}
          </button>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
          <div className="flex flex-wrap justify-center gap-4">
            {isRolling ? (
              Array.from({ length: count }).map((_, i) => (
                <DiceFace key={i} value={Math.floor(Math.random() * diceType.sides) + 1} sides={diceType.sides} isRolling color={DICE_COLORS[i % DICE_COLORS.length]} />
              ))
            ) : results.length > 0 ? (
              results.map((r, i) => (
                <DiceFace key={i} value={r} sides={diceType.sides} color={DICE_COLORS[i % DICE_COLORS.length]} />
              ))
            ) : (
              <div className="py-8 text-center text-(--muted-foreground)">Click "Roll Dice" to start</div>
            )}
          </div>

          {results.length > 0 && !isRolling && (
            <div className="mt-6 border-t border-(--border) pt-4 text-center">
              <p className="text-sm text-(--muted-foreground)">Results: {results.join(", ")}</p>
              <p className="text-2xl font-bold text-(--primary)">Total: {total}</p>
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-(--muted-foreground)"><History className="h-4 w-4" /> Roll History</h3>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-(--muted) px-4 py-2 text-sm">
                  <span className="font-semibold text-(--foreground)">{h.dice} ×{h.count}</span>
                  <span className="text-(--muted-foreground)">[{h.results.join(", ")}]</span>
                  <span className="font-bold text-(--primary)">= {h.total}</span>
                  <span className="text-xs text-(--muted-foreground)">{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

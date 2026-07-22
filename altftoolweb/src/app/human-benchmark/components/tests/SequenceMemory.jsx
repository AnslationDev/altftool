"use client";
import { StatsChart, AboutCard } from "../shared/StatsPanel";

const DIST = [
  {label:"2",value:4},{label:"3",value:9},{label:"4",value:18},{label:"5",value:30},
  {label:"6",value:46},{label:"7",value:62},{label:"8",value:70},{label:"9",value:58},
  {label:"10",value:40},{label:"11",value:24},{label:"12",value:13},{label:"13",value:6},
  {label:"14",value:2},{label:"15",value:1},
];
const ABOUT = {
  what: "Sequence memory tests temporal ordering in working memory — your ability to reproduce not just which squares lit up, but in what order. It mirrors classic cognitive laboratory sequence recall paradigms.",
  average: "8 steps before a mistake",
  facts: [
    "Sequential memory underpins music performance, language production, and procedural motor skills.",
    "The Simon Says paradigm — this test's cousin — has been used in cognitive research since the 1960s.",
    "Working memory capacity for ordered sequences correlates with fluid intelligence (Gf).",
    "Musical training is consistently linked to improved auditory and visual sequence memory.",
  ],
};
import { useState, useCallback, useRef } from "react";

const GRID = 9; // 3×3

export default function SequenceMemory({ onComplete, beep }) {
  const [state, setState] = useState("idle"); // idle|show|input|gameover
  const [sequence, setSequence] = useState([]);
  const [flashIdx, setFlashIdx] = useState(-1);
  const [userInput, setUserInput] = useState([]);
  const [bestLen, setBestLen] = useState(0);
  const timeoutRef = useRef(null);

  const showSequence = useCallback((seq) => {
    setState("show");
    setFlashIdx(-1);
    setUserInput([]);
    let i = 0;
    const flash = () => {
      setFlashIdx(seq[i]);
      timeoutRef.current = setTimeout(() => {
        setFlashIdx(-1);
        i++;
        if (i < seq.length) {
          timeoutRef.current = setTimeout(flash, 250);
        } else {
          timeoutRef.current = setTimeout(() => setState("input"), 400);
        }
      }, 500);
    };
    timeoutRef.current = setTimeout(flash, 400);
  }, []);

  const handleStart = () => {
    const seq = [Math.floor(Math.random() * GRID)];
    setSequence(seq);
    setBestLen(0);
    showSequence(seq);
  };

  const handleCellClick = useCallback((idx) => {
    if (state !== "input") return;
    const pos = userInput.length;
    if (sequence[pos] !== idx) {
      beep?.wrong();
      setBestLen(Math.max(bestLen, sequence.length - 1));
      setState("gameover");
      return;
    }
    beep?.correct();
    const next = [...userInput, idx];
    setUserInput(next);
    if (next.length === sequence.length) {
      const newSeq = [...sequence, Math.floor(Math.random() * GRID)];
      setSequence(newSeq);
      setTimeout(() => showSequence(newSeq), 600);
    }
  }, [state, userInput, sequence, bestLen, showSequence, beep]);

  const score = state === "gameover" ? Math.max(bestLen, sequence.length - 1) : sequence.length > 0 ? sequence.length : 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-[var(--foreground)]">
        <span>{state !== "idle" ? `Round ${sequence.length}` : "Sequence Memory"}</span>
        {bestLen > 0 && <span className="text-[var(--primary)]">Best: {bestLen}</span>}
      </div>

      {state === "idle" && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-10 text-center space-y-4">
          <div className="text-5xl">🔷</div>
          <p className="text-sm text-[var(--secondary-foreground)]">Squares will flash in a sequence. Repeat the pattern. One wrong click ends the game.</p>
          <button onClick={handleStart} className="rounded-xl bg-[var(--primary)] px-8 py-3 font-black text-[var(--primary-foreground)]">Start</button>
        </div>
      )}

      {(state === "show" || state === "input") && (
        <div className="space-y-3">
          <p className="text-center text-xs font-bold text-[var(--muted-foreground)]">
            {state === "show" ? "Watch the sequence..." : `Repeat ${sequence.length} steps (${userInput.length}/${sequence.length})`}
          </p>
          <div className="grid gap-3 mx-auto" style={{ gridTemplateColumns:"repeat(3,1fr)", maxWidth:260 }}>
            {Array.from({ length: GRID }).map((_, i) => (
              <button key={i} onClick={() => handleCellClick(i)}
                className={`aspect-square rounded-xl border flex items-center justify-center ${
                  flashIdx === i ? "bg-[var(--primary)] border-[var(--primary)] shadow-lg"
                  : userInput[userInput.length-1] === i && state==="input" ? "bg-[var(--primary)]/40 border-[var(--primary)]/40"
                  : "bg-[var(--card)] border-[var(--card-border)]"
                }`}
                style={{ minHeight:80 }}
                disabled={state === "show"}
              />
            ))}
          </div>
        </div>
      )}

      {state === "gameover" && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-10 text-center space-y-4">
          <div className="text-4xl font-black font-mono text-[var(--primary)]">{score}</div>
          <p className="text-sm text-[var(--secondary-foreground)]">Longest correct sequence</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => onComplete(score)} className="rounded-xl bg-[var(--primary)] px-6 py-3 font-black text-[var(--primary-foreground)]">Save Score</button>
            <button onClick={() => { setSequence([]); setBestLen(0); setState("idle"); }}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-6 py-3 font-bold text-[var(--secondary-foreground)]">Retry</button>
          </div>
        </div>
      )}
      <StatsChart data={DIST} xLabel="Sequence length reached" title="Population Score Distribution" subtitle="How 200,000+ users scored on this test" />
      <AboutCard {...ABOUT} />
    </div>
  );
}

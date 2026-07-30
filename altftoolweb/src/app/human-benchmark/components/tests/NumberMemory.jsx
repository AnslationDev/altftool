"use client";
import { StatsChart, AboutCard } from "../shared/StatsPanel";

const DIST = [
  {label:"4",value:4},{label:"5",value:12},{label:"6",value:24},{label:"7",value:42},
  {label:"8",value:60},{label:"9",value:68},{label:"10",value:52},{label:"11",value:32},
  {label:"12",value:16},{label:"13",value:8},{label:"14",value:3},{label:"15",value:1},
];
const ABOUT = {
  what: "Number memory tests your digit span — the maximum number of digits you can hold and repeat correctly. This is one of the oldest and most replicated measurements in cognitive psychology.",
  average: "8 digits (within Miller's 7\u00b12 range)",
  facts: [
    "George Miller's 1956 paper established 7\u00b12 as the average human memory span.",
    "Chunking (grouping digits) can dramatically extend apparent digit span.",
    "Phone numbers were historically limited to 7 digits partly based on this research.",
    "Short-term memory span correlates strongly with general cognitive ability (g-factor).",
  ],
};
import { useState, useEffect, useRef } from "react";

function randNum(digits) {
  const min = 10 ** (digits - 1);
  return String(Math.floor(min + Math.random() * min * 9));
}

export default function NumberMemory({ onComplete, beep }) {
  const [level, setLevel] = useState(1);
  const [number, setNumber] = useState("");
  const [typed, setTyped] = useState("");
  const [state, setState] = useState("idle"); // idle|show|input|result
  const [correct, setCorrect] = useState(null);
  const timerRef = useRef(null);

  const startLevel = (lvl) => {
    const digits = lvl + 1;
    const num = randNum(digits);
    setNumber(num);
    setTyped("");
    setCorrect(null);
    setState("show");
    const displayMs = Math.min(1500, 800 + (digits - 2) * 120);
    timerRef.current = setTimeout(() => setState("input"), displayMs);
  };

  const handleStart = () => startLevel(level);

  const handleSubmit = () => {
    if (typed === number) {
      beep?.correct();
      setCorrect(true);
      setState("result");
      setTimeout(() => { setLevel(l => l + 1); startLevel(level + 1); }, 1000);
    } else {
      beep?.wrong();
      setCorrect(false);
      setState("result");
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center text-sm font-bold text-[var(--foreground)]">Level {level} — {level+1} digit number</div>
      {state === "idle" && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-12 text-center space-y-4">
          <div className="text-5xl">🔢</div>
          <p className="text-sm text-[var(--secondary-foreground)]">A number will appear. Memorize it, then type it back.</p>
          <button onClick={handleStart} className="rounded-xl bg-[var(--primary)] px-8 py-3 font-black text-[var(--primary-foreground)]">Start</button>
        </div>
      )}
      {state === "show" && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <div className="text-5xl font-black font-mono tracking-widest text-[var(--foreground)]">{number}</div>
        </div>
      )}
      {state === "input" && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center space-y-4">
          <p className="text-sm text-[var(--secondary-foreground)]">What was the number?</p>
          <input autoFocus type="text" inputMode="numeric" value={typed}
            onChange={e => setTyped(e.target.value.replace(/\D/g,""))}
            onKeyDown={e => e.key==="Enter" && typed && handleSubmit()}
            className="text-center text-3xl font-black font-mono w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
            placeholder="Type number..." />
          <button onClick={handleSubmit} disabled={!typed}
            className="rounded-xl bg-[var(--primary)] px-8 py-3 font-black text-[var(--primary-foreground)] disabled:opacity-40">
            Submit
          </button>
        </div>
      )}
      {state === "result" && correct === false && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center space-y-4">
          <div className="text-3xl">❌</div>
          <p className="text-sm text-[var(--secondary-foreground)]">The number was <span className="font-black text-[var(--primary)]">{number}</span>. You typed <span className="font-black">{typed}</span>.</p>
          <p className="text-sm text-[var(--muted-foreground)]">You reached <span className="font-black text-[var(--foreground)]">Level {level}</span></p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => onComplete(level)} className="rounded-xl bg-[var(--primary)] px-6 py-3 font-black text-[var(--primary-foreground)]">Save Score</button>
            <button onClick={() => { setLevel(1); setState("idle"); }} className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-6 py-3 font-bold text-[var(--secondary-foreground)]">Retry</button>
          </div>
        </div>
      )}
      {state === "result" && correct === true && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
          <div className="text-3xl">✅</div>
          <p className="text-sm text-[var(--secondary-foreground)] mt-2">Correct! Loading next level...</p>
        </div>
      )}
      <StatsChart data={DIST} xLabel="Level (digit length) reached" title="Population Score Distribution" subtitle="Illustrative example distribution, not measured from real users" />
      <AboutCard {...ABOUT} />
    </div>
  );
}

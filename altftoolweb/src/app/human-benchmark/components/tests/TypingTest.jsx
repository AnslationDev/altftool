"use client";
import { StatsChart, AboutCard } from "../shared/StatsPanel";

const DIST = [
  {label:"10",value:3},{label:"20",value:7},{label:"30",value:13},{label:"40",value:22},
  {label:"50",value:36},{label:"60",value:54},{label:"70",value:66},{label:"80",value:58},
  {label:"90",value:42},{label:"100",value:26},{label:"110",value:14},{label:"120",value:8},
  {label:"130",value:4},{label:"140",value:2},{label:"150",value:1},
];
const ABOUT = {
  what: "The typing test measures your adjusted WPM (words per minute \u00d7 accuracy) — a unified score balancing raw speed with correctness. It is the most universal measure of keyboard proficiency.",
  average: "65 adjusted WPM (speed \u00d7 accuracy combined)",
  facts: [
    "The average office worker types at 40 WPM; trained typists reach 75\u2013100 WPM.",
    "World record typing speed exceeds 200 WPM on standard keyboards.",
    "Touch typing (without looking) is typically 20\u201330% faster than hunt-and-peck.",
    "Keyboard layout (QWERTY vs Dvorak) has less impact on speed than most people assume.",
  ],
};
import { useState, useRef, useCallback } from "react";
import { PARAGRAPHS } from "../../data/constants";

function calcWpm(chars, ms) { return Math.round((chars / 5) / (ms / 60000)); }
function calcAccuracy(typed, target) {
  let correct = 0;
  for (let i = 0; i < typed.length; i++) { if (typed[i] === target[i]) correct++; }
  return typed.length > 0 ? correct / typed.length : 1;
}

export default function TypingTest({ onComplete, beep }) {
  const [state, setState] = useState("idle");
  const [para] = useState(() => PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)]);
  const [typed, setTyped] = useState("");
  const [liveWpm, setLiveWpm] = useState(0);
  const startRef = useRef(null);
  const [result, setResult] = useState(null);

  const handleChange = useCallback((e) => {
    const val = e.target.value;
    const now = Date.now();
    if (!startRef.current) startRef.current = now;
    setTyped(val);
    setLiveWpm(val.length > 0 ? calcWpm(val.length, Math.max(now - startRef.current, 1)) : 0);
    if (val.length >= para.length) {
      const ms = now - startRef.current;
      const acc = calcAccuracy(val, para);
      const wpm = calcWpm(para.length, ms);
      const score = Math.round(wpm * acc);
      setResult({ wpm, acc: Math.round(acc * 100), score, ms });
      setState("done");
    }
  }, [para]);

  const renderPara = () => {
    return para.split("").map((ch, i) => {
      let cls = "text-[var(--muted-foreground)]";
      if (i < typed.length) cls = typed[i] === ch ? "text-[var(--foreground)]" : "text-red-400 bg-red-400/20";
      if (i === typed.length) cls = "text-[var(--foreground)] bg-[var(--primary)]/30";
      return <span key={i} className={cls}>{ch}</span>;
    });
  };

  if (state === "idle") return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center space-y-4">
      <div className="text-5xl">⌨️</div>
      <p className="text-sm text-[var(--secondary-foreground)]">Type the paragraph as fast and accurately as possible. Timer starts on first keystroke.</p>
      <button onClick={() => setState("typing")} className="rounded-xl bg-[var(--primary)] px-8 py-3 font-black text-[var(--primary-foreground)]">Start</button>
    </div>
  );

  if (state === "done" && result) return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[["WPM", result.wpm], ["Accuracy", `${result.acc}%`], ["Score", result.score]].map(([l,v]) => (
          <div key={l} className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4">
            <div className="text-2xl font-black font-mono text-[var(--primary)]">{v}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">{l}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={() => onComplete(result.score)} className="rounded-xl bg-[var(--primary)] px-6 py-3 font-black text-[var(--primary-foreground)]">Save Score</button>
        <button onClick={() => { setTyped(""); setLiveWpm(0); startRef.current=null; setState("typing"); }}
          className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-6 py-3 font-bold text-[var(--secondary-foreground)]">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
        <span>{typed.length}/{para.length} chars</span>
        <span>{liveWpm} WPM live</span>
      </div>
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 font-mono text-lg leading-relaxed tracking-wide">
        {renderPara()}
      </div>
      <textarea autoFocus value={typed} onChange={handleChange}
        rows={4} maxLength={para.length + 10}
        className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] font-mono resize-none"
        placeholder="Start typing here..." />
      <StatsChart data={DIST} xLabel="Adjusted score (WPM)" title="Population Score Distribution" subtitle="Illustrative example distribution, not measured from real users" />
      <AboutCard {...ABOUT} />
    </div>
  );
}

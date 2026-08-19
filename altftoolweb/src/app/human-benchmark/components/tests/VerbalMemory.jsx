"use client";
import { StatsChart, AboutCard } from "../shared/StatsPanel";

const DIST = [
  {label:"20",value:5},{label:"40",value:11},{label:"60",value:20},{label:"80",value:32},
  {label:"100",value:48},{label:"120",value:62},{label:"140",value:56},{label:"160",value:40},
  {label:"180",value:26},{label:"200",value:15},{label:"220",value:7},{label:"240",value:3},
];
const ABOUT = {
  what: "Verbal memory tests recognition memory — your ability to identify whether a word has appeared before in this session. It engages your episodic memory and semantic familiarity systems.",
  average: "~120 correct answers before 3 mistakes",
  facts: [
    "Recognition memory is significantly stronger than free recall for most people.",
    "Interference effects occur when similar words confuse memory traces (proactive inhibition).",
    "Sleep consolidates verbal memories — studying before sleep improves long-term retention.",
    "The tip-of-the-tongue phenomenon reveals gaps between storage and retrieval in verbal memory.",
  ],
};
import { useState, useMemo } from "react";
import { WORD_LIST } from "../../data/constants";

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function VerbalMemory({ onComplete, beep }) {
  const [state, setState] = useState("idle");
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [idx, setIdx] = useState(0);
  const [seen, setSeen] = useState(new Set());
  const [words] = useState(() => shuffle(WORD_LIST));
  const [lastFeedback, setLastFeedback] = useState(null);

  const currentWord = words[idx % words.length];
  const isSeen = seen.has(currentWord);

  const nextWord = () => setIdx(i => i + 1);

  const answer = (choice) => {
    const isCorrect = choice === "SEEN" ? isSeen : !isSeen;
    if (isCorrect) {
      beep?.correct();
      setScore(s => s + 1);
      if (choice === "NEW") setSeen(s => new Set([...s, currentWord]));
    } else {
      beep?.wrong();
      const nl = lives - 1;
      setLives(nl);
      if (nl <= 0) { setState("done"); return; }
    }
    setLastFeedback(isCorrect ? "correct" : "wrong");
    setTimeout(() => setLastFeedback(null), 300);
    nextWord();
  };

  if (state === "idle") return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-12 text-center space-y-4">
      <div className="text-5xl">💬</div>
      <p className="text-sm text-[var(--secondary-foreground)] max-w-sm mx-auto">
        A word will appear. Click <strong>SEEN</strong> if you've seen it in this session, or <strong>NEW</strong> if it's the first time.
      </p>
      <button onClick={() => setState("playing")} className="rounded-xl bg-[var(--primary)] px-8 py-3 font-black text-[var(--primary-foreground)]">Start</button>
    </div>
  );

  if (state === "done") return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-12 text-center space-y-4">
      <div className="text-5xl font-black text-[var(--primary)]">{score}</div>
      <p className="text-sm text-[var(--secondary-foreground)]">Correct answers</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => onComplete(score)} className="rounded-xl bg-[var(--primary)] px-6 py-3 font-black text-[var(--primary-foreground)]">Save Score</button>
        <button onClick={() => { setLives(3); setScore(0); setIdx(0); setSeen(new Set()); setState("playing"); }}
          className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-6 py-3 font-bold text-[var(--secondary-foreground)]">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm font-bold text-[var(--foreground)]">Score: {score}</div>
        <div className="flex gap-1">{Array.from({length:3}).map((_,i)=>(
          <span key={i} className={`text-lg ${i<lives?"":"opacity-20"}`}>❤️</span>
        ))}</div>
      </div>
      <div className={`rounded-xl border bg-[var(--card)] flex items-center justify-center ${
        lastFeedback==="correct"?"border-[var(--primary)]":lastFeedback==="wrong"?"border-[var(--danger)]":"border-[var(--card-border)]"}`}
        style={{ height:220 }}>
        <div className="text-4xl font-black text-[var(--foreground)]">{currentWord}</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => answer("SEEN")}
          className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] py-5 font-black text-lg text-[var(--foreground)]">
          SEEN
        </button>
        <button onClick={() => answer("NEW")}
          className="rounded-xl bg-[var(--primary)] py-5 font-black text-lg text-[var(--primary-foreground)]">
          NEW
        </button>
      </div>
      <StatsChart data={DIST} xLabel="Correct answers" title="Population Score Distribution" subtitle="Illustrative example distribution, not measured from real users" />
      <AboutCard {...ABOUT} />
    </div>
  );
}

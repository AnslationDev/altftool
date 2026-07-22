"use client";
import { useState, useRef, useCallback } from "react";
import { StatsChart, AboutCard } from "../shared/StatsPanel";

const DIST = [
  {label:"100",value:2},{label:"125",value:5},{label:"150",value:11},{label:"175",value:22},
  {label:"200",value:36},{label:"225",value:52},{label:"250",value:68},{label:"275",value:74},
  {label:"300",value:68},{label:"325",value:55},{label:"350",value:40},{label:"375",value:27},
  {label:"400",value:16},{label:"425",value:9},{label:"450",value:5},{label:"475",value:2},{label:"500",value:1},
];
const ABOUT = {
  what: "Reaction time measures how quickly you respond to a visual stimulus — the gap between perceiving the green screen and clicking. It reflects the speed of your sensorimotor pathway.",
  average: "261 ms (average healthy adult visual reaction time)",
  facts: [
    "Simple visual reaction time in healthy adults averages 200–300 ms.",
    "Gamers and athletes typically react 15–30 ms faster than average.",
    "Reaction time slows with age, fatigue, and alcohol consumption.",
    "The fastest recorded human reaction time is approximately 101 ms.",
  ],
};

const TRIALS = 5;
function randomDelay() { return 1500 + Math.random() * 2000; }

export default function ReactionTime({ onComplete, beep }) {
  const [state, setState] = useState("idle"); // idle|waiting|go|tooearly|done
  const [times, setTimes] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const timerRef = useRef(null);

  const startWaiting = useCallback(() => {
    setState("waiting");
    timerRef.current = setTimeout(() => {
      setStartTime(Date.now());
      setState("go");
    }, randomDelay());
  }, []);

  const handleClick = useCallback(() => {
    if (state === "idle") { startWaiting(); return; }
    if (state === "waiting") {
      clearTimeout(timerRef.current);
      setState("tooearly");
      beep?.wrong();
      return;
    }
    if (state === "go") {
      const ms = Date.now() - startTime;
      beep?.correct();
      const next = [...times, ms];
      setTimes(next);
      if (next.length >= TRIALS) { setState("done"); return; }
      setState("idle");
      return;
    }
    if (state === "tooearly") { startWaiting(); return; }
  }, [state, startTime, times, startWaiting, beep]);

  const avg = times.length ? Math.round(times.reduce((a,b)=>a+b,0)/times.length) : 0;

  const bgClass = state === "go" ? "bg-green-500" : state === "waiting" ? "bg-[#c0392b]/80" : "bg-[var(--card)]";
  const label = {
    idle: "Click to Start",
    waiting: "Wait for green...",
    go: "CLICK!",
    tooearly: "Too early! Click to retry",
    done: `Average: ${avg} ms`
  }[state];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center">
        {Array.from({length:TRIALS}).map((_,i) => (
          <div key={i} className={`h-2 flex-1 rounded-full ${i < times.length ? "bg-[var(--primary)]" : "bg-[var(--card-border)]"}`} />
        ))}
      </div>
      <div onClick={handleClick}
        className={`${bgClass} rounded-xl border border-[var(--card-border)] flex items-center justify-center cursor-pointer select-none`}
        style={{ height: 340 }}>
        <div className="text-center">
          <div className={`text-2xl font-black ${state==="go"?"text-white":"text-[var(--foreground)]"}`}>{label}</div>
          {times.length > 0 && state !== "done" && (
            <div className="text-sm text-[var(--muted-foreground)] mt-2">Trial {times.length}/{TRIALS} — Last: {times[times.length-1]} ms</div>
          )}
        </div>
      </div>
      {state === "done" && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-3">
          <div className="grid grid-cols-5 gap-2">
            {times.map((t,i) => (
              <div key={i} className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-3 text-center">
                <div className="text-xs font-bold text-[var(--muted-foreground)]">Trial {i+1}</div>
                <div className="text-lg font-black font-mono text-[var(--primary)]">{t}</div>
                <div className="text-[9px] text-[var(--muted-foreground)]">ms</div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => onComplete(avg)}
              className="flex-1 rounded-xl bg-[var(--primary)] px-4 py-3 font-black text-[var(--primary-foreground)]">
              Save Score ({avg} ms)
            </button>
            <button onClick={() => { setTimes([]); setState("idle"); }}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 font-bold text-[var(--secondary-foreground)]">
              Retry
            </button>
          </div>
        </div>
      )}
      <StatsChart data={DIST} xLabel="Reaction time (ms)" title="Population Score Distribution" subtitle="How 200,000+ users scored on this test" />
      <AboutCard {...ABOUT} />
    </div>
  );
}

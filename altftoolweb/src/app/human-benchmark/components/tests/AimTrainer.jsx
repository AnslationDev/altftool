"use client";
import { StatsChart, AboutCard } from "../shared/StatsPanel";

const DIST = [
  {label:"250",value:3},{label:"300",value:8},{label:"350",value:18},{label:"400",value:34},
  {label:"450",value:52},{label:"500",value:65},{label:"550",value:60},{label:"600",value:46},
  {label:"650",value:30},{label:"700",value:18},{label:"750",value:10},{label:"800",value:5},
  {label:"900",value:2},{label:"1000",value:1},
];
const ABOUT = {
  what: "The aim trainer measures pointing speed — the time from a target appearing to a successful click. It combines visual reaction time with fine motor control and spatial accuracy.",
  average: "~535 ms per target",
  facts: [
    "Fitts's Law predicts pointing time based on target distance and size: T = a + b \u00d7 log\u2082(2D/W).",
    "FPS gamers typically score 20\u201340% faster than non-gamers on aim tasks.",
    "Lower mouse DPI with wider arm movements generally produces more accurate clicks.",
    "Professional esports players average 200\u2013350 ms on standardised aim tasks.",
  ],
};
import { useState, useRef, useCallback } from "react";

const TARGETS = 30;
const RADIUS = 32;

function randPos(w, h) {
  return { x: RADIUS + Math.random() * (w - RADIUS * 2), y: RADIUS + Math.random() * (h - RADIUS * 2) };
}

export default function AimTrainer({ onComplete, beep }) {
  const [state, setState] = useState("idle");
  const [pos, setPos] = useState({ x: 200, y: 200 });
  const [count, setCount] = useState(0);
  const [times, setTimes] = useState([]);
  const [showTime, setShowTime] = useState(null);
  const containerRef = useRef(null);

  const spawnTarget = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect() ?? { width: 600, height: 400 };
    setPos(randPos(rect.width, rect.height));
    setShowTime(Date.now());
  }, []);

  const handleStart = () => { setState("playing"); setTimeout(spawnTarget, 100); };

  const handleContainerClick = useCallback((e) => {
    if (state !== "playing" || !showTime) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const dx = cx - pos.x, dy = cy - pos.y;
    if (Math.sqrt(dx*dx + dy*dy) > RADIUS) return;
    beep?.correct();
    const ms = Date.now() - showTime;
    const next = [...times, ms];
    setTimes(next);
    const nc = count + 1;
    setCount(nc);
    if (nc >= TARGETS) { setState("done"); return; }
    spawnTarget();
  }, [state, showTime, pos, times, count, spawnTarget, beep]);

  const avg = times.length ? Math.round(times.reduce((a,b)=>a+b,0)/times.length) : 0;

  return (
    <div className="space-y-4">
      {state === "idle" && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-12 text-center space-y-4">
          <div className="text-5xl">🎯</div>
          <p className="text-sm text-[var(--secondary-foreground)]">Click {TARGETS} targets as fast as possible. Score = average ms per click.</p>
          <button onClick={handleStart} className="rounded-xl bg-[var(--primary)] px-8 py-3 font-black text-[var(--primary-foreground)]">Start</button>
        </div>
      )}
      {state === "playing" && (
        <>
          <div className="flex justify-between text-sm font-bold text-[var(--foreground)]">
            <span>{count}/{TARGETS} targets</span>
            {times.length > 0 && <span>{Math.round(times[times.length-1])} ms last</span>}
          </div>
          <div ref={containerRef} onClick={handleContainerClick} style={{ height:420, position:"relative", cursor:"crosshair" }}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden select-none">
            <div style={{ position:"absolute", left:pos.x-RADIUS, top:pos.y-RADIUS, width:RADIUS*2, height:RADIUS*2,
              borderRadius:"50%", background:"var(--primary)", boxShadow:"0 0 20px var(--primary)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"white" }} />
            </div>
            <div className="absolute top-3 right-3 text-[10px] font-mono text-[var(--muted-foreground)]">
              {TARGETS - count} remaining
            </div>
          </div>
        </>
      )}
      {state === "done" && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center space-y-4">
          <div className="text-4xl font-black font-mono text-[var(--primary)]">{avg} ms</div>
          <p className="text-sm text-[var(--secondary-foreground)]">Average time per target across {TARGETS} clicks</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => onComplete(avg)} className="rounded-xl bg-[var(--primary)] px-6 py-3 font-black text-[var(--primary-foreground)]">Save Score</button>
            <button onClick={() => { setCount(0); setTimes([]); setState("idle"); }}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-6 py-3 font-bold text-[var(--secondary-foreground)]">Retry</button>
          </div>
        </div>
      )}
      <StatsChart data={DIST} xLabel="Avg time per target (ms)" title="Population Score Distribution" subtitle="Illustrative example distribution, not measured from real users" />
      <AboutCard {...ABOUT} />
    </div>
  );
}

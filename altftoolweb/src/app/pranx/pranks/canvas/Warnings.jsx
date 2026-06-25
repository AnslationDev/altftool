
"use client";

import { useRef, useState } from "react";
import { Bug, Play, Power } from "lucide-react";
import { useInterval } from "../../hooks/useInterval";
import { openFullscreen } from "../../lib/fullscreen";
import { panelClass, primaryButton, secondaryButton } from "../../components/uiClasses";

export function BlueScreen() {
  const [progress, setProgress] = useState(0);
  const screenRef = useRef(null);
  useInterval(() => setProgress((value) => (value >= 100 ? 100 : value + 1)), 900, progress < 100);
  return (
    <section ref={screenRef} className="min-h-[640px] rounded-[2rem] bg-[#0078d7] p-8 font-sans text-white shadow-2xl shadow-blue-950/50 sm:p-14">
      <div className="max-w-5xl">
        <p className="text-7xl font-light">:(</p>
        <h2 className="mt-8 text-3xl font-light leading-tight sm:text-5xl">Your PC ran into a theatrical problem and needs a dramatic restart.</h2>
        <p className="mt-8 max-w-3xl text-lg leading-8">We are collecting imaginary error info, then we will restart this prank for you.</p>
        <p className="mt-8 text-2xl">{progress}% complete</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-[9rem_1fr]">
          <div className="grid h-32 w-32 place-items-center bg-white text-sm font-black text-[#0078d7]">QR</div>
          <p className="text-sm leading-7">For more information, search online later for this error: SAFE_PRANK_NOT_A_REAL_CRASH</p>
        </div>
        <button onClick={() => openFullscreen(screenRef)} className="mt-8 rounded-xl bg-white px-5 py-3 font-black text-[#0078d7]">Fullscreen</button>
      </div>
    </section>
  );
}

export function FakeVirus() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [alerts, setAlerts] = useState(["Ready to run safe fake scan."]);
  useInterval(() => {
    setProgress((value) => {
      const next = Math.min(100, value + Math.floor(Math.random() * 8) + 2);
      setAlerts((current) => [`${next}% scanned · ${["cookies", "cache", "funny_files", "desktop.ini"][Math.floor(Math.random() * 4)]}`, ...current].slice(0, 8));
      if (next >= 100) setRunning(false);
      return next;
    });
  }, 700, running);
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_24rem]">
      <section className={`${panelClass} border-red-500/20`}>
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-red-500/20 text-red-300"><Bug /></span>
          <div>
            <h2 className="text-3xl font-black text-red-200">Threat scan simulation</h2>
            <p className="mt-2 text-slate-300">Safe prank only. This never scans files or changes the device.</p>
          </div>
        </div>
        <div className="mt-8 h-5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-gradient-to-r from-red-500 to-amber-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-4 text-5xl font-black text-red-200">{progress}%</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={() => { setRunning(true); setProgress(0); setAlerts(["Scan started..."]); }} className={primaryButton}><Play className="h-4 w-4" />Start prank scan</button>
          <button onClick={() => { setRunning(false); setProgress(0); setAlerts(["Panic button pressed. Everything is clean."]); }} className={secondaryButton}><Power className="h-4 w-4" />Panic clean</button>
        </div>
      </section>
      <aside className={panelClass}>
        <h3 className="text-xl font-black">Alert feed</h3>
        <div className="mt-4 grid gap-2">
          {alerts.map((alert, index) => (
            <p key={`${alert}-${index}`} className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm font-bold text-red-100">{alert}</p>
          ))}
        </div>
      </aside>
    </div>
  );
}

export function FbiWarning() {
  const ref = useRef(null);
  return (
    <section ref={ref} className="grid min-h-[650px] place-items-center overflow-hidden rounded-[2rem] border-8 border-red-700 bg-black p-6 text-center text-white shadow-2xl shadow-red-950/50">
      <div className="max-w-4xl">
        <div className="mx-auto grid h-32 w-32 animate-pulse place-items-center rounded-full border-8 border-red-600 bg-red-950 text-4xl font-black">!</div>
        <h2 className="mt-8 text-5xl font-black uppercase tracking-tight text-red-500 sm:text-7xl">Warning</h2>
        <p className="mt-5 text-xl font-black uppercase leading-8">This is a fictional prank display for entertainment. No agency is involved.</p>
        <p className="mt-5 text-slate-300">Use fullscreen for a cinematic warning board. Exit anytime with Esc.</p>
        <button onClick={() => openFullscreen(ref)} className="mt-8 rounded-xl bg-red-600 px-6 py-3 font-black text-white">Launch fullscreen</button>
      </div>
    </section>
  );
}

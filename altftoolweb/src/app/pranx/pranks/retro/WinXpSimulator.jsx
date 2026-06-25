
"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { openFullscreen } from "../../lib/fullscreen";

export function WinXpSimulator() {
  const [start, setStart] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTetris, setShowTetris] = useState(true);
  const [showWinamp, setShowWinamp] = useState(true);
  const desktopRef = useRef(null);
  const icons = [
    ["Internet Explorer", "🌐"],
    ["My Computer", "🖥️"],
    ["My Documents", "📁"],
    ["Recycle Bin", "♻️"],
    ["My Network Places", "🌍"],
  ];
  const shortcuts = ["Hacker", "ScreenShot", "Virus", "FBI Lock", "iOS", "Windows XP", "Windows 7", "Windows 10", "Prank 4 Pets", "Bios", "3D Pipes", "Matrix Rain", "TV Noise", "Cracked Screen", "Jurassic Park"];
  return (
    <main ref={desktopRef} className="relative h-screen min-h-[720px] overflow-hidden bg-[linear-gradient(#54a8ff_0%,#8fd3ff_38%,#72b94b_39%,#2f8b25_100%)] font-sans text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_0%,rgba(255,255,255,0.9),transparent_18rem),radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.35),transparent_15rem)]" />
      <div className="absolute left-5 top-5 grid w-28 gap-5 text-center text-sm font-semibold text-white drop-shadow">
        {icons.map(([label, icon]) => (
          <button key={label} className="grid justify-items-center gap-1 rounded p-1 hover:bg-blue-700/40">
            <span className="text-4xl">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className="xp-main-window absolute left-[12vw] top-[7vh] h-[74vh] w-[64vw] min-w-[720px] max-w-[1220px] overflow-hidden border-4 border-[#0055e8] bg-white shadow-2xl">
        <div className="flex h-8 items-center justify-between bg-gradient-to-b from-[#2d8bff] to-[#0055e8] px-2 text-sm font-bold text-white">
          <span>Internet Explorer - IE7</span>
          <span className="flex gap-1"><b className="bg-blue-400 px-2">_</b><b className="bg-blue-400 px-2">□</b><b className="bg-red-500 px-2">×</b></span>
        </div>
        <div className="border-b bg-[#ece9d8] px-2 py-1 text-sm">File&nbsp;&nbsp;&nbsp; Edit&nbsp;&nbsp;&nbsp; View&nbsp;&nbsp;&nbsp; Favorites&nbsp;&nbsp;&nbsp; Tools&nbsp;&nbsp;&nbsp; Help</div>
        <div className="grid h-[calc(100%-3.75rem)] grid-cols-[16rem_1fr]">
          <aside className="bg-gradient-to-b from-[#dce8ff] to-[#5d86df] p-4 text-blue-700">
            <h2 className="rounded-t bg-white p-2 text-lg font-black">Prank Your Friends!</h2>
            {["Wait for your friend to leave", "Open this website...", "on his computer...", "or mobile phone.", "Go fullscreen (F11 key).", "Close this intro window.", "And wait... :)"].map((item) => (
              <p key={item} className="mt-2 font-semibold">⌛ {item}</p>
            ))}
          </aside>
          <section className="overflow-hidden p-6">
            <h1 className="text-3xl font-black text-slate-700">Online Windows XP Simulator</h1>
            <p className="mt-4 font-semibold">Online Windows XP simulator that runs in your web browser. Activate full screen and play with fake windows.</p>
            <div className="mt-8 flex items-center gap-5">
              <span className="text-6xl font-black text-blue-500">1.</span>
              <h2 className="text-2xl font-black text-blue-500">Open a prank on your victim's computer</h2>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-4 lg:grid-cols-8">
              {shortcuts.map((item) => <button key={item} className="grid justify-items-center gap-1 text-center text-sm font-bold"><span className="grid h-12 w-12 place-items-center rounded bg-slate-100 text-2xl">▣</span>{item}</button>)}
            </div>
            <div className="mt-8 flex items-center gap-5"><span className="text-6xl font-black text-blue-500">2.</span><b className="text-2xl text-blue-500">Activate full screen with F11</b></div>
            <div className="mt-8 flex items-center gap-5"><span className="text-6xl font-black text-blue-500">3.</span><b className="text-2xl text-blue-500">Watch their reaction 😉</b></div>
          </section>
        </div>
      </div>
      {showWelcome ? (
        <div className="absolute left-[17vw] top-[16vh] w-[min(58rem,58vw)] overflow-hidden border-4 border-[#0055e8] bg-white shadow-2xl">
          <div className="flex h-8 items-center justify-between bg-gradient-to-b from-[#2d8bff] to-[#0055e8] px-2 text-sm font-bold text-white">
            <span>Welcome to Pranx!</span>
            <button onClick={() => setShowWelcome(false)} className="bg-red-500 px-2">×</button>
          </div>
          <div className="p-5 text-lg font-semibold">Click icons, open windows, and use the Start menu. This simulator is safe and browser-only.</div>
        </div>
      ) : null}
      {showTetris ? (
        <div className="absolute right-[7vw] top-[14vh] w-72 border-4 border-[#0055e8] bg-[#222] text-white shadow-2xl">
          <div className="flex h-8 items-center justify-between bg-gradient-to-b from-[#2d8bff] to-[#0055e8] px-2 font-bold"><span>Tetris</span><button onClick={() => setShowTetris(false)}>×</button></div>
          <div className="grid h-64 place-items-center bg-black/80 text-2xl font-black">Click Here to Continue</div>
        </div>
      ) : null}
      {showWinamp ? (
        <div className="absolute bottom-[10vh] right-[8vw] w-80 border-4 border-slate-800 bg-black text-lime-400 shadow-2xl">
          <div className="bg-slate-800 px-2 text-xs font-black text-white">WINAMP</div>
          <div className="p-3 font-mono text-sm"><b>0:00</b><br />4. Sorry Ms Jackson<br />192 kbps 44 kHz stereo</div>
          <button onClick={() => setShowWinamp(false)} className="absolute right-1 top-1 text-white">×</button>
        </div>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 z-20 flex h-11 items-center bg-gradient-to-b from-[#3d9bff] to-[#0055d5] text-white">
        <button onClick={() => setStart((value) => !value)} className="h-full rounded-r-2xl bg-gradient-to-b from-[#69d848] to-[#168817] px-8 text-xl font-black">start</button>
        <span className="ml-5 rounded bg-blue-700 px-5 py-1 font-bold">Welcome</span>
        <span className="ml-auto px-5 font-bold">17:25</span>
      </div>
      {start ? (
        <div className="absolute bottom-11 left-0 z-30 w-80 overflow-hidden rounded-tr-xl border-2 border-blue-800 bg-white shadow-2xl">
          <div className="bg-blue-700 p-4 text-xl font-black text-white">Pranx User</div>
          {["Internet", "My Computer", "Games", "Control Panel", "Shut Down..."].map((item) => <button key={item} className="block w-full px-5 py-3 text-left font-bold hover:bg-blue-100">{item}</button>)}
        </div>
      ) : null}
      <button onClick={() => openFullscreen(desktopRef)} className="absolute right-4 top-4 rounded bg-yellow-100 px-4 py-2 font-black shadow">Start the Prank F11</button>
      <style>{`
        @media (max-width: 1000px) {
          .xp-main-window { left: 7rem; width: calc(100vw - 9rem); min-width: 0; }
        }
      `}</style>
    </main>
  );
}

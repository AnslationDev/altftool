"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { openFullscreen } from "../../lib/fullscreen";
import { playPranxSound } from "../../lib/audio";

const perimeterPoints =
  "36,132 72,92 134,54 218,38 324,40 424,72 502,126 548,206 532,322 458,424 342,486 228,472 118,410 54,316";

const paddocks = [
  "qp 81 Gallimimus Paddock",
  "qp 82 Reserve Paddock",
  "qp 83 Raptor Paddock",
  "qp 84 Brachiosaurus Paddock",
  "qp 85 Dilophosaurus Paddock",
  "qp 86 T-Rex Paddock",
];

const desktopLines = [
  "Jurassic Park, System Security Interface",
  "Version 4.0.5, Alpha E",
  "Ready...",
  "> access security",
  "permission denied",
  "> access main program",
  "security protocols overridden",
  "fence grid unstable",
  "perimeter status: shutdown",
];

function playAccessSound(seed = 0) {
  playPranxSound(seed % 2 ? "glitch" : "joke", seed * 53);
}

function playJurassicAlarm(seed = 0) {
  playPranxSound("jurassic-alert", seed);
  window.setTimeout(() => playPranxSound("glitch", seed + 42), 240);
}

function FullscreenButton({ targetRef, className = "" }) {
  return (
    <button
      type="button"
      onClick={() => {
        playAccessSound(7);
        openFullscreen(targetRef);
      }}
      className={`jp-control-button ${className}`}
    >
      Full Screen F11
    </button>
  );
}

function TitleBar({ title, onClose, onMinimize }) {
  return (
    <div className="flex h-8 items-center justify-between border-b-2 border-black bg-gradient-to-b from-zinc-400 to-zinc-600 px-3 font-mono text-sm font-black italic text-black shadow-inner">
      <span>{title}</span>
      <div className="flex gap-1">
        <button type="button" onClick={onMinimize} className="jp-window-button">
          -
        </button>
        <button type="button" onClick={() => playAccessSound(2)} className="jp-window-button">
          []
        </button>
        <button type="button" onClick={onClose} className="jp-window-button">
          x
        </button>
      </div>
    </div>
  );
}

function JurassicMap({ alertMode, setAlertMode, sound }) {
  const markers = [
    { left: "67%", top: "29%", label: "4" },
    { left: "58%", top: "34%", label: "5" },
    { left: "72%", top: "37%", label: "" },
  ];

  return (
    <div className="relative isolate flex min-h-[540px] overflow-hidden rounded-sm border-4 border-neutral-800 bg-neutral-700 p-3 shadow-[inset_0_0_0_4px_#b8b8b8] max-lg:min-h-[420px] max-sm:min-h-[360px]">
      <div className="z-10 flex w-16 shrink-0 flex-col gap-3 bg-black p-1 text-center font-mono text-[11px] font-black text-white max-sm:w-12 max-sm:text-[9px]">
        {["location", "main:", "x = 90", "y = 73", "z = 12", "security", "power", "fence", "area", "entry"].map((item, index) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setAlertMode(index % 2 === 0 ? "failure" : "normal");
              sound(index);
            }}
            className={`${index === 0 || index === 5 || index === 6 || index === 7 || index === 8 ? "bg-white text-black" : ""} px-1 py-1`}
          >
            {item}
          </button>
        ))}
        <div className="mt-auto leading-4">
          t099
          <br />
          t098
          <br />
          z00h
          <br />
          z06h
        </div>
      </div>

      <div className="relative z-0 flex-1 overflow-hidden border-4 border-black bg-[#1d746c]">
        <div className="absolute inset-0 opacity-80 [background:radial-gradient(circle_at_30%_35%,rgba(244,255,206,.18),transparent_22%),radial-gradient(circle_at_72%_18%,rgba(59,177,255,.75),transparent_24%),linear-gradient(135deg,#225e52,#4e8c72_48%,#237dc9_83%)]" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 520" preserveAspectRatio="none">
          <path d="M54 110 C150 82 180 150 245 132 S375 80 512 156" fill="none" stroke="#d6e4d3" strokeWidth="5" opacity=".58" />
          <path d="M72 256 C190 202 245 246 334 208 S492 214 550 292" fill="none" stroke="#d6e4d3" strokeWidth="5" opacity=".46" />
          <path d="M155 470 C220 344 198 274 316 256 C402 242 456 354 526 388" fill="none" stroke="#d6e4d3" strokeWidth="5" opacity=".42" />
          <path d={perimeterPoints} fill="none" stroke="#fff05c" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
          {[["80", "118"], ["542", "134"], ["552", "276"], ["470", "468"], ["158", "468"], ["54", "292"], ["210", "58"]].map(([cx, cy], index) => (
            <g key={`${cx}-${cy}`}>
              <circle cx={cx} cy={cy} r="23" fill="#fff05c" />
              <path d="M-8 -10 L13 0 L-8 10 Z" transform={`translate(${cx} ${cy}) rotate(${index * 48})`} fill="#5b7d83" />
            </g>
          ))}
        </svg>

        {markers.map((marker, index) => (
          <div key={`${marker.left}-${marker.top}`} className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: marker.left, top: marker.top }}>
            <div className={`${marker.label ? "h-9 w-14 rounded-t-xl" : "h-8 w-8 rounded-full"} bg-[#ef3329] shadow-[0_2px_0_#a21b15]`}>
              {marker.label && <span className="grid h-full place-items-center font-mono text-lg font-black text-black">{marker.label}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="z-10 flex w-16 shrink-0 flex-col bg-black p-1 text-center font-mono text-[11px] text-white max-sm:w-12 max-sm:text-[9px]">
        <div className="bg-white py-1 font-black text-black">keys</div>
        {Array.from({ length: 10 }).map((_, index) => (
          <span key={index}>cx y{String(index + 1).padStart(2, "0")}</span>
        ))}
        <div className="mt-auto bg-white py-1 font-black text-black">level</div>
        <span>L</span>
        <span>H</span>
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>LL</span>
        <span>HH2</span>
      </div>

      {alertMode === "failure" && (
        <button
          type="button"
          onClick={() => {
            setAlertMode("normal");
            sound(14);
          }}
          className="absolute inset-3 z-40 grid place-items-center overflow-hidden border-0 bg-[#ef3329] p-0 font-black italic text-white"
          aria-label="Restore failed fence perimeter"
        >
          <div className="absolute inset-[8%_14%] bg-[#1d746c] opacity-70 [background:radial-gradient(circle_at_72%_18%,rgba(59,177,255,.75),transparent_25%),linear-gradient(135deg,#225e52,#4e8c72_48%,#237dc9_83%)]" />
          <div className="absolute left-0 top-[4%] w-full bg-[#ef3329] px-4 py-2 text-center text-3xl max-sm:text-lg">FENCE FAILURE !</div>
          <div className="absolute bottom-[13%] left-0 w-full bg-[#ef3329] px-4 py-2 text-center text-2xl max-sm:text-base">FENCE FAILURE !</div>
          <div className="absolute left-[2%] top-1/2 -translate-y-1/2 -rotate-90 bg-[#ef3329] px-4 py-2 text-5xl max-md:text-3xl max-sm:text-xl">FENCE FAILURE !</div>
          <div className="absolute right-[2%] top-1/2 -translate-y-1/2 rotate-90 bg-[#ef3329] px-4 py-2 text-5xl max-md:text-3xl max-sm:text-xl">FENCE FAILURE !</div>
          <div className="relative z-10 bg-[#ef3329] px-8 py-2 text-2xl max-sm:text-base">MAJOR MALFUNCTION !</div>
          <div className="absolute inset-x-0 bottom-0 bg-yellow-300 p-3 text-black">
            <div className="grid grid-cols-[3rem_1fr_3rem] items-center gap-3 max-sm:grid-cols-[2rem_1fr_2rem]">
              <span className="text-center text-5xl font-black italic text-[#d3312b] max-sm:text-3xl">!</span>
              <div className="bg-black py-2 text-center text-3xl font-black italic text-white max-md:text-2xl max-sm:text-lg">PERIMETER SHUTDOWN</div>
              <span className="text-center text-5xl font-black italic text-[#d3312b] max-sm:text-3xl">!</span>
            </div>
            <div className="mx-auto mt-2 w-[min(540px,100%)] bg-black py-1 text-center text-sm font-black italic text-white">Quadrant / Animal Perimeter</div>
          </div>
        </button>
      )}
    </div>
  );
}

function VehiclePanel({ alertMode, setAlertMode, sound }) {
  return (
    <div className="rounded-sm border-4 border-neutral-700 bg-[#8f908a] p-3 shadow-[inset_0_0_0_3px_#d8d8d8]">
      <div className="mb-2 flex gap-1 font-mono text-sm font-black text-white">
        {["VEHICLE", "TOUR", "POWER", "TIME"].map((tab) => (
          <button key={tab} type="button" onClick={() => sound(tab.length)} className="rounded-sm border border-neutral-500 bg-gradient-to-b from-zinc-500 to-zinc-700 px-2 py-1 shadow-inner">
            {tab}
          </button>
        ))}
      </div>

      <div className="border-4 border-neutral-700 bg-black p-2 text-white shadow-inner">
        <div className="mb-2 grid grid-cols-[1fr_1fr] gap-2 font-mono text-lg font-black italic">
          <div className="bg-black px-4 py-1 text-center">vehicle status</div>
          <div className="bg-neutral-700 px-4 py-1 text-center">headlights on</div>
        </div>
        <div className="relative h-52 overflow-hidden bg-[#646763] max-sm:h-44">
          <div className="absolute left-0 top-[42%] h-10 w-full bg-[#ecea97]" />
          <div className="absolute left-0 top-[22%] h-28 w-44 bg-white [clip-path:polygon(0_20%,100%_50%,0_80%)]" />
          <div className="absolute right-20 top-14 h-24 w-48 rounded-lg border-4 border-white bg-neutral-200 shadow-xl max-sm:right-8 max-sm:w-36">
            <div className="mx-auto mt-4 h-16 w-28 border-4 border-neutral-600 bg-white max-sm:w-20" />
          </div>
          <div className="absolute bottom-4 left-8 rounded-full bg-black px-5 py-2 font-mono text-2xl font-black">0 <span className="text-base">mph</span></div>
          <div className="absolute bottom-3 right-5 flex gap-5">
            <div className="h-14 w-20 border-4 border-white" />
            <div className="h-14 w-28 rounded-full border-4 border-white" />
          </div>
        </div>
        <div className="mt-2 grid grid-cols-[7rem_1fr] gap-2 text-sm max-sm:grid-cols-1">
          <div className="space-y-1">
            {["EXP 4", "EXP 5", "EXP 6", "EXP 7"].map((exp, index) => (
              <button
                key={exp}
                type="button"
                onClick={() => {
                  setAlertMode(index > 1 ? "failure" : "normal");
                  sound(index + 12);
                }}
                className={`flex w-full items-center gap-2 bg-black px-2 py-1 font-mono font-black ${index > 1 ? "text-sky-200" : "text-white"}`}
              >
                <span className={`h-3 w-3 rounded-full ${index > 1 ? "bg-orange-600" : "bg-green-500"}`} />
                {exp}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1 font-mono text-xs font-black text-neutral-900">
            {["Hold", "Quit", "New", "Next", "<<", ">>", "Map", "Stop"].map((label) => (
              <button key={label} type="button" onClick={() => sound(label.length)} className="bg-[#b7bab0] py-1 shadow-inner">
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1 font-mono text-xs font-black text-white">
        {["GLITCHES", "MAPS", "SYSTEM", "EMERG."].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              const nextMode = alertMode === "failure" ? "normal" : "failure";
              setAlertMode(nextMode);
              if (nextMode === "failure") playJurassicAlarm(item.length);
              else sound(item.length);
            }}
            className="rounded-sm border border-neutral-600 bg-gradient-to-b from-zinc-500 to-zinc-700 px-3 py-1"
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-sm border-4 border-neutral-700 bg-white p-3 font-mono text-sm text-black shadow-inner">
        {paddocks.map((row) => (
          <div key={row} className="mb-1 grid grid-cols-[5rem_1fr] items-center gap-2">
            <span className="bg-[#ef3329] px-1 py-0.5 text-center font-black italic text-white">FAILED</span>
            <span className="font-black italic">{row}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-[auto_1fr] items-center gap-3 rounded-sm bg-white p-2 font-mono text-xs text-black">
        <span className="bg-black px-3 py-1 text-base font-black italic text-white">SYS ICONS</span>
        <div className="grid grid-cols-4 gap-2 text-center">
          {["Macintosh HD", "MiniArray 1 G", "MiniArray 1 G", "Trash"].map((item, index) => (
            <button key={`${item}-${index}`} type="button" onClick={() => sound(item.length)} className="min-w-0">
              <span className="mx-auto block h-7 w-10 rounded-sm border-2 border-neutral-500 bg-neutral-300" />
              <span className="block truncate">{item}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function JurassicDashboard() {
  const shellRef = useRef(null);
  const [alertMode, setAlertMode] = useState("normal");
  const [soundOn, setSoundOn] = useState(true);

  const sound = (seed) => {
    if (soundOn) playAccessSound(seed);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (alertMode === "failure" && soundOn) playJurassicAlarm(Date.now() % 500);
    }, 3800);
    return () => window.clearInterval(timer);
  }, [alertMode, soundOn]);

  return (
    <main ref={shellRef} className="relative min-h-screen overflow-auto bg-[#969a9d] p-3 text-black sm:p-6">
      <div className="fixed right-3 top-3 z-50 flex flex-wrap justify-end gap-2 font-mono text-xs font-black max-sm:left-3">
        <Link href="/pranx" className="jp-control-button">
          Home
        </Link>
        <button
          type="button"
          onClick={() => {
            setSoundOn((value) => !value);
            playPranxSound(soundOn ? "toggle-off" : "toggle-on");
          }}
          className="jp-control-button"
        >
          Sound {soundOn ? "ON" : "OFF"}
        </button>
        <button
          type="button"
          onClick={() => {
            const nextMode = alertMode === "failure" ? "normal" : "failure";
            setAlertMode(nextMode);
            if (soundOn) {
              if (nextMode === "failure") playJurassicAlarm(3);
              else playAccessSound(5);
            }
          }}
          className="jp-control-button"
        >
          {alertMode === "failure" ? "Restore" : "Failure"}
        </button>
        <FullscreenButton targetRef={shellRef} />
      </div>

      <div className="mx-auto flex min-h-screen w-full items-center justify-center py-12 max-sm:pt-24">
        <div className="w-[min(1280px,96vw)] rounded-lg border-4 border-neutral-700 bg-gradient-to-b from-neutral-500 to-neutral-700 p-3 shadow-[0_10px_25px_rgba(0,0,0,.35),inset_0_0_0_5px_#c8c8c8]">
          <div className="grid gap-3 lg:grid-cols-[1.28fr_.92fr]">
            <JurassicMap alertMode={alertMode} setAlertMode={setAlertMode} sound={sound} />
            <VehiclePanel alertMode={alertMode} setAlertMode={setAlertMode} sound={sound} />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-[1.25fr_.75fr]">
            <div className="rounded-sm border-4 border-neutral-700 bg-yellow-300 p-3">
              <div className="grid grid-cols-[4rem_1fr_4rem] items-center gap-3">
                <span className="text-center text-5xl font-black italic text-[#d3312b]">!</span>
                <div className="bg-black py-2 text-center text-3xl font-black italic text-white max-sm:text-lg">PERIMETER SHUTDOWN</div>
                <span className="text-center text-5xl font-black italic text-[#d3312b]">!</span>
              </div>
              <div className="mx-auto mt-2 w-[min(540px,100%)] bg-black py-1 text-center font-black italic text-white">Quadrant / Animal Perimeter</div>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono font-black max-sm:grid-cols-1">
              <Link href="/pranx/jurassic-park/console" onClick={() => sound(9)} className="jp-control-button text-center">
                Open Console
              </Link>
              <button
                type="button"
                onClick={() => {
                  setAlertMode("normal");
                  sound(5);
                }}
                className="jp-control-button"
              >
                Reset Systems
              </button>
            </div>
          </div>

          <Link href="/pranx/jurassic-park/console" className="fixed bottom-4 right-4 hidden rounded border-4 border-white bg-neutral-300 p-1 shadow-2xl md:block" aria-label="Open Jurassic console">
            <div className="h-20 w-32 overflow-hidden rounded bg-[#969a9d] p-2">
              <div className="h-full rounded border-2 border-neutral-700 bg-[#2d8172]" />
            </div>
          </Link>
        </div>
      </div>
      <JurassicStyles />
    </main>
  );
}

function JurassicStyles() {
  return (
    <style>{`
      .jp-control-button {
        border: 2px solid #222;
        border-radius: 6px;
        background: linear-gradient(#f8f8f8, #bfc5bf);
        padding: .55rem .9rem;
        box-shadow: inset 0 1px 0 #fff, 0 2px 0 #555;
        font-weight: 900;
        color: #111;
      }
      .jp-control-button:hover {
        filter: brightness(.95);
      }
      .jp-window-button {
        display: grid;
        width: 1.5rem;
        height: 1.5rem;
        place-items: center;
        border-radius: 3px;
        background: #111;
        color: #76ff63;
        font-weight: 900;
        line-height: 1;
      }
      .jp-scanline {
        background-image: linear-gradient(rgba(255,255,255,.04) 50%, rgba(0,0,0,.08) 50%);
        background-size: 100% 4px;
      }
      @keyframes jpBlink {
        0%, 48% { opacity: 1; }
        49%, 100% { opacity: 0; }
      }
      @keyframes jpNoise {
        0% { background-position: 0 0; }
        100% { background-position: 130px 90px; }
      }
      .jp-cursor {
        display: inline-block;
        width: .65em;
        height: 1em;
        background: #65ff48;
        vertical-align: -0.15em;
        animation: jpBlink .8s steps(1) infinite;
      }
      .jp-static {
        background:
          radial-gradient(circle at 10% 20%, rgba(255,255,255,.25), transparent 1px),
          radial-gradient(circle at 80% 30%, rgba(0,0,0,.28), transparent 1px),
          radial-gradient(circle at 40% 70%, rgba(255,255,255,.18), transparent 1px),
          repeating-linear-gradient(45deg, #b6beba 0 1px, #6d7773 1px 2px);
        background-size: 8px 8px, 11px 11px, 9px 9px, 4px 4px;
        animation: jpNoise .35s steps(3) infinite;
      }
    `}</style>
  );
}

export function JurassicConsole() {
  const shellRef = useRef(null);
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState(desktopLines.slice(0, 4));
  const [unlocked, setUnlocked] = useState(false);

  const bars = useMemo(() => [92, 76, 64, 88, 57, 79, 70, 94], []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHistory((current) => {
        if (current.length >= desktopLines.length) return current;
        return [...current, desktopLines[current.length]];
      });
    }, 850);
    return () => window.clearInterval(timer);
  }, []);

  const submitCommand = () => {
    const clean = command.trim();
    if (!clean) return;
    playAccessSound(clean.length);
    setHistory((current) => [
      ...current,
      `> ${clean}`,
      clean.toLowerCase().includes("access") || clean.toLowerCase().includes("restore")
        ? "access granted: central park grid online"
        : "command accepted: parsing security layer",
    ]);
    if (clean.toLowerCase().includes("access") || clean.toLowerCase().includes("restore")) {
      setUnlocked(true);
    }
    setCommand("");
  };

  return (
    <main ref={shellRef} className="jp-static relative min-h-screen overflow-hidden bg-[#a8b0ad] p-4 font-mono text-white sm:p-6">
      <div className="absolute left-5 top-5 z-10 space-y-1 text-black">
        {["CMOS", "Dos C:\\", "Matrix", "System", "Upgrade"].map((item) => (
          <Link key={item} href={item === "CMOS" ? "/pranx/jurassic-park" : "#"} className="block w-28 border-2 border-neutral-700 bg-neutral-300 px-3 py-1 text-sm font-black italic shadow">
            {item}
          </Link>
        ))}
        <div className="mt-4 grid h-24 w-24 place-items-center border-2 border-neutral-700 bg-white text-5xl font-black text-indigo-500">JP</div>
      </div>

      <div className="absolute bottom-4 right-4 z-20 hidden rounded border-4 border-white bg-neutral-300 p-1 shadow-2xl md:block">
        <Link href="/pranx/jurassic-park" className="block h-20 w-32 rounded bg-[#788071] p-2">
          <div className="h-full rounded border-2 border-neutral-700 bg-[#2d8172]" />
        </Link>
      </div>

      <div className="relative z-10 mx-auto mt-16 w-[min(1120px,92vw)] border-4 border-black bg-[#2e429f] shadow-2xl max-sm:mt-40">
        <TitleBar
          title="Central Park Control Console"
          onClose={() => {
            playAccessSound(4);
            window.location.href = "/pranx/jurassic-park";
          }}
          onMinimize={() => playAccessSound(1)}
        />
        <div className="min-h-[560px] p-4 text-xl leading-snug text-white max-md:min-h-[460px] max-sm:text-base">
          {history.map((line, index) => (
            <div key={`${line}-${index}`} className={index === 0 ? "text-sky-100" : ""}>
              {line}
            </div>
          ))}
          <div className="mt-2 flex items-center">
            <span>&gt;&nbsp;</span>
            <input
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submitCommand();
                else playPranxSound("scroll", event.key.length * 11);
              }}
              autoFocus
              className="min-w-0 flex-1 bg-transparent text-white outline-none"
              aria-label="Jurassic console command"
            />
            <span className="jp-cursor" />
          </div>
          {unlocked && (
            <div className="mt-6 rounded border-2 border-lime-300 bg-black/40 p-3 text-lime-200">
              ACCESS GRANTED. PERIMETER REBOOT QUEUED. SECURITY GRID STILL UNSTABLE.
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 z-20 flex w-full flex-wrap items-center gap-3 bg-[#08d2c1] px-4 py-3 text-xl font-black text-black max-sm:text-sm">
        <Link href="/pranx/jurassic-park">ESC Back to Map</Link>
        <span>Enter Select / Sub-Menu</span>
        <button type="button" onClick={() => setHistory(desktopLines.slice(0, 4))}>
          F9 Reboot
        </button>
        <FullscreenButton targetRef={shellRef} className="ml-auto" />
      </div>

      <div className="absolute left-16 top-[36%] hidden w-64 border-2 border-black bg-neutral-300 text-black shadow-xl lg:block">
        <TitleBar title="gr_osview" onClose={() => playAccessSound(6)} onMinimize={() => playAccessSound(2)} />
        <div className="space-y-3 p-3 text-sm font-black italic">
          {bars.slice(0, 6).map((bar, index) => (
            <div key={index}>
              CPU{index + 1} Usage: <span className="text-blue-600">user</span> <span className="text-red-500">sys</span>
              <div className="mt-1 h-5 border-2 border-black bg-cyan-100">
                <div className="h-full bg-lime-400" style={{ width: `${bar}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-16 left-12 hidden w-80 border-2 border-black bg-black shadow-xl lg:block">
        <TitleBar title="Chess" onClose={() => playAccessSound(8)} onMinimize={() => playAccessSound(1)} />
        <pre className="p-3 text-sm leading-5 text-white">
{`Step  Move  AI response
1     Nf3   Nf6
2     c4    g6
3     Nc3   Bg7
4     d4    O-O
5     Bf4   d5
What is your next move?
Enter the code: _`}
        </pre>
      </div>

      <JurassicStyles />
    </main>
  );
}

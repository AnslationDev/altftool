"use client";

import { useEffect, useRef, useState } from "react";
import { CanvasTool, Range } from "./CanvasShell";
import { panelClass } from "../../components/uiClasses";

export function StaticTv() {
  const canvasRef = useRef(null);
  const [noise, setNoise] = useState(80);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    const draw = () => {
      const width = canvas.clientWidth * devicePixelRatio;
      const height = canvas.clientHeight * devicePixelRatio;
      if (canvas.width !== width) {
        canvas.width = width;
        canvas.height = height;
      }
      const image = ctx.createImageData(width, height);
      for (let i = 0; i < image.data.length; i += 4) {
        const value = Math.random() * 255 * (noise / 100);
        image.data[i] = value;
        image.data[i + 1] = value;
        image.data[i + 2] = value;
        image.data[i + 3] = 255;
      }
      ctx.putImageData(image, 0, 0);
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      for (let y = 0; y < height; y += 8) ctx.fillRect(0, y, width, 2);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [noise]);
  return (
    <CanvasTool canvasRef={canvasRef} title="Analog static generator">
      <Range label="Noise intensity" value={noise} setValue={setNoise} min={10} max={100} />
    </CanvasTool>
  );
}

export function TrollFace() {
  const [mouse, setMouse] = useState({ x: 0, y: 0, width: 1, height: 1 });
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isLaughing, setIsLaughing] = useState(false);

  const quotes = [
    "Problem?",
    "U mad bro?",
    "Trololoolololo!",
    "System Error: Brain not found.",
    "Click me again, see what happens.",
    "You can't catch me!",
    "Is your mouse lagging? Hahaha!",
  ];

  const eyeOffset = (cx, cy) => {
    const pointerX = (mouse.x / mouse.width) * 600;
    const pointerY = (mouse.y / mouse.height) * 520;
    const dx = pointerX - cx;
    const dy = pointerY - cy;
    const len = Math.max(1, Math.hypot(dx, dy));
    return { x: (dx / len) * 12, y: (dy / len) * 8 };
  };

  const dist = Math.hypot(mouse.x - mouse.width / 2, mouse.y - mouse.height / 2);
  const isClose = dist < 200;

  const left = eyeOffset(230, 220);
  const right = eyeOffset(370, 220);

  const playLaugh = () => {
    setIsLaughing(true);
    setQuoteIndex((prev) => (prev + 1) % quotes.length);

    // Audio synthesizer creep laugh
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      const t = ctx.currentTime;
      for (let i = 0; i < 7; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(120 + i * 35, t + i * 0.08);
        osc.frequency.exponentialRampToValueAtTime(320 + i * 45, t + i * 0.08 + 0.12);
        gain.gain.setValueAtTime(0.12, t + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + i * 0.08);
        osc.stop(t + i * 0.08 + 0.16);
      }
    }

    setTimeout(() => {
      setIsLaughing(false);
    }, 600);
  };

  return (
    <section
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setMouse({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          width: Math.max(1, rect.width),
          height: Math.max(1, rect.height),
        });
      }}
      onClick={playLaugh}
      className={`${panelClass} flex flex-col items-center justify-center min-h-[650px] relative bg-slate-950 select-none overflow-hidden cursor-crosshair`}
    >
      {/* Troll laser tracker */}
      {isClose && (
        <div
          className="absolute rounded-full bg-red-500 shadow-[0_0_12px_#ef4444] animate-ping pointer-events-none"
          style={{
            left: `${mouse.x - 8}px`,
            top: `${mouse.y - 8}px`,
            width: "16px",
            height: "16px",
          }}
        />
      )}

      {/* Main face SVG with conditional shakiness */}
      <div
        className={`w-full max-w-2xl transition-transform ${
          isLaughing ? "animate-bounce" : isClose ? "animate-pulse" : ""
        }`}
        style={{
          transform: isClose
            ? `translate(${(Math.random() - 0.5) * 8}px, ${(Math.random() - 0.5) * 8}px)`
            : "none",
        }}
      >
        <svg viewBox="0 0 600 520" className="w-full h-auto drop-shadow-[0_10px_20px_rgba(255,255,255,0.05)]">
          {/* Main Face outline */}
          <path
            d="M80 245C75 120 185 45 310 55c120 10 210 95 210 210 0 125-95 205-220 205S85 370 80 245Z"
            fill="#1e293b"
            stroke="#6366f1"
            strokeWidth="12"
          />
          {/* Eyebrows */}
          <path
            d="M160 165c55-55 115-45 150 5M325 170c45-60 105-55 135-5"
            fill="none"
            stroke="#6366f1"
            strokeWidth="13"
            strokeLinecap="round"
          />
          {/* Eyes */}
          <ellipse cx="230" cy="220" rx="55" ry="38" fill="#0f172a" stroke="#6366f1" strokeWidth="10" />
          <ellipse cx="370" cy="220" rx="55" ry="38" fill="#0f172a" stroke="#6366f1" strokeWidth="10" />
          {/* Pupils */}
          <circle cx={230 + left.x} cy={220 + left.y} r="13" fill="#38bdf8" />
          <circle cx={370 + right.x} cy={220 + right.y} r="13" fill="#38bdf8" />
          {/* Mouth */}
          <path
            d="M155 315c100 85 270 85 360-8-45 118-270 150-360 8Z"
            fill="#0f172a"
            stroke="#6366f1"
            strokeWidth="12"
          />
          {/* Inner mouth detail */}
          <path d="M190 330c75 32 195 35 280-5" fill="none" stroke="#4f46e5" strokeWidth="8" />
        </svg>
      </div>

      {/* Floating text bubbles for dialogue */}
      <div className="absolute top-12 bg-indigo-600/90 text-white font-black text-xl px-6 py-3 rounded-2xl border-2 border-indigo-400 shadow-xl transition-all scale-105 duration-300">
        {quotes[quoteIndex]}
      </div>

      <p className="mt-8 text-center text-sm font-bold text-slate-400 tracking-wider">
        {isClose ? "HE IS WATCHING YOU!" : "Move your cursor close to summon the Troll."}
      </p>
    </section>
  );
}


"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { openFullscreen } from "../../lib/fullscreen";

export function PipesScreensaver() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [showIntro, setShowIntro] = useState(true);
  const [mouseControls, setMouseControls] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let width = 0;
    let height = 0;
    let hue = 248;
    let pipes = Array.from({ length: 12 }, (_, index) => ({
      x: 120 + index * 90,
      y: 160 + (index % 4) * 70,
      dir: index % 4,
      size: 46 + (index % 3) * 10,
    }));
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      width = canvas.clientWidth * ratio;
      height = canvas.clientHeight * ratio;
      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);
    };
    resize();
    window.addEventListener("resize", resize);
    const drawSegment = (pipe) => {
      const ratio = window.devicePixelRatio || 1;
      const step = pipe.size * ratio;
      const old = { ...pipe };
      if (Math.random() > 0.82) pipe.dir = Math.floor(Math.random() * 4);
      if (pipe.dir === 0) pipe.x += step;
      if (pipe.dir === 1) pipe.y += step;
      if (pipe.dir === 2) pipe.x -= step;
      if (pipe.dir === 3) pipe.y -= step;
      if (pipe.x < -80 || pipe.x > width + 80 || pipe.y < -80 || pipe.y > height + 80) {
        pipe.x = Math.random() * width;
        pipe.y = Math.random() * height;
        pipe.dir = Math.floor(Math.random() * 4);
      }
      const gradient = ctx.createLinearGradient(old.x, old.y, pipe.x, pipe.y);
      gradient.addColorStop(0, `hsl(${hue} 95% 40%)`);
      gradient.addColorStop(0.45, `hsl(${(hue + 25) % 360} 100% 55%)`);
      gradient.addColorStop(1, `hsl(${(hue + 65) % 360} 95% 44%)`);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 30 * ratio;
      ctx.strokeStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(old.x, old.y);
      ctx.lineTo(pipe.x, pipe.y);
      ctx.stroke();
      ctx.lineWidth = 9 * ratio;
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(pipe.x, pipe.y, 7 * ratio, 0, Math.PI * 2);
      ctx.fill();
    };
    const loop = () => {
      hue = (hue + 0.55) % 360;
      for (let i = 0; i < 4; i += 1) pipes.forEach(drawSegment);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main ref={wrapRef} className="relative h-screen min-h-[620px] overflow-hidden bg-black font-sans text-slate-950">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {showIntro ? (
        <section className="absolute inset-0 z-10 grid place-items-center px-4">
          <div className="relative w-full max-w-3xl rounded-[1.35rem] border-2 border-sky-500 bg-white p-4 text-center shadow-2xl shadow-black/50 sm:p-6">
            <button
              onClick={() => setShowIntro(false)}
              className="absolute -right-4 -top-4 grid h-11 w-11 place-items-center rounded-full border-4 border-sky-300 bg-white text-2xl font-black text-black shadow-lg"
              aria-label="Close intro"
            >
              ×
            </button>
            <h1 className="text-2xl font-black sm:text-3xl">3D Pipes Screensaver</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base font-bold leading-6">
              A golden oldie, the 3D Pipes screensaver draws tangled colored pipes on a dark background.
              Click the background to change the pipe flow, or go full screen for the classic prank look.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/pranx" className="rounded-xl border-2 border-black bg-sky-200 px-4 py-2 font-black shadow-[3px_3px_0_#111]">Back to Home</Link>
              <button onClick={() => setMouseControls((value) => !value)} className="rounded-xl border-2 border-black bg-sky-200 px-4 py-2 font-black shadow-[3px_3px_0_#111]">
                Mouse Controls <span className="rounded bg-slate-200 px-2">{mouseControls ? "ON" : "OFF"}</span>
              </button>
              <button onClick={() => openFullscreen(wrapRef)} className="rounded-xl border-2 border-black bg-sky-200 px-4 py-2 font-black shadow-[3px_3px_0_#111]">
                Full Screen F11
              </button>
            </div>
            <h2 className="mt-6 text-xl font-black">Controls</h2>
            <p className="mt-2 font-semibold leading-6">
              Activate full screen to close this welcome window. Exit full screen with F11 or Esc. The canvas keeps drawing
              responsive pipes across the whole browser window.
            </p>
          </div>
        </section>
      ) : (
        <button onClick={() => setShowIntro(true)} className="absolute right-4 top-4 z-10 rounded-full border-2 border-sky-300 bg-white px-4 py-2 text-sm font-black text-slate-950">Info</button>
      )}
    </main>
  );
}

export function DvdBounce() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [showInfo, setShowInfo] = useState(true);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let raf = 0;
    let logo = { x: 360, y: 270, vx: 3.1, vy: 2.25, hue: 216 };
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      width = canvas.clientWidth * ratio;
      height = canvas.clientHeight * ratio;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      const ratio = window.devicePixelRatio || 1;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);
      const w = Math.min(440 * ratio, width * 0.28);
      const h = w * 0.42;
      logo.x += logo.vx * ratio;
      logo.y += logo.vy * ratio;
      if (logo.x <= 0 || logo.x + w >= width) { logo.vx *= -1; logo.hue = (logo.hue + 70) % 360; }
      if (logo.y <= 0 || logo.y + h >= height) { logo.vy *= -1; logo.hue = (logo.hue + 70) % 360; }
      ctx.fillStyle = `hsl(${logo.hue} 100% 50%)`;
      ctx.font = `900 ${w * 0.34}px Arial Black, Impact, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.save();
      ctx.scale(1.25, 0.72);
      ctx.fillText("DVD", (logo.x + w / 2) / 1.25, (logo.y + h * 0.42) / 0.72);
      ctx.restore();
      ctx.beginPath();
      ctx.ellipse(logo.x + w / 2, logo.y + h * 0.82, w * 0.42, h * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.ellipse(logo.x + w / 2, logo.y + h * 0.82, w * 0.1, h * 0.055, 0, 0, Math.PI * 2);
      ctx.fill();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main ref={wrapRef} className="relative h-screen min-h-[620px] overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {showInfo ? (
        <section className="absolute inset-x-3 bottom-5 z-10 mx-auto max-w-[82rem] rounded-xl border-4 border-slate-500 bg-slate-200 p-3 text-center text-slate-900 shadow-2xl sm:bottom-8">
          <button onClick={() => setShowInfo(false)} className="absolute -right-4 -top-5 grid h-9 w-9 place-items-center rounded-full bg-red-500 text-2xl font-black text-black" aria-label="Close DVD info">×</button>
          <h1 className="text-xl font-black">Bouncing DVD Logo ScreenSaver</h1>
          <p className="mx-auto max-w-5xl text-base font-semibold">
            The DVD logo bounces around your screen and changes color. Can you spot it hitting the corner?
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link href="/pranx" className="rounded-full bg-[#2f7080] px-5 py-2 font-black text-white">« Pranx Home</Link>
            <button onClick={() => setShowInfo(false)} className="rounded-full bg-[#2f7080] px-5 py-2 font-black text-white">Close Esc</button>
            <button onClick={() => openFullscreen(wrapRef)} className="rounded-full bg-[#2f7080] px-5 py-2 font-black text-white">Full Screen F11</button>
          </div>
        </section>
      ) : (
        <button onClick={() => setShowInfo(true)} className="absolute bottom-5 right-5 rounded-full bg-slate-200 px-4 py-2 font-black text-slate-950">Info</button>
      )}
    </main>
  );
}

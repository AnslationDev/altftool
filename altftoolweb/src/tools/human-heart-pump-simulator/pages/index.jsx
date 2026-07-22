"use client";

import React, { useState, useEffect, useRef } from "react";
import { HeartPulse, RotateCcw, Play, Pause, Sliders, Info, Activity } from "lucide-react";

export default function HumanHeartPumpSimulator() {
  const [bpm, setBpm] = useState(72); // Beats per minute
  const [isPlaying, setIsPlaying] = useState(true);
  const [strokeVolume, setStrokeVolume] = useState(70); // mL per beat

  const canvasRef = useRef(null);
  const phaseRef = useRef(0);
  const animRef = useRef(null);

  const handleReset = () => {
    setBpm(72);
    setStrokeVolume(70);
    setIsPlaying(true);
  };

  const cardiacOutput = ((bpm * strokeVolume) / 1000).toFixed(2); // L/min

  // Cardiac Cycle Animation Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      if (isPlaying) {
        // Frequency of beat in rad/s
        const freq = (bpm / 60) * Math.PI * 2;
        phaseRef.current += 0.05 * (bpm / 60);
      }

      // Heart contraction pulse factor (Systole vs Diastole)
      const pulse = Math.sin(phaseRef.current);
      const isSystole = pulse > 0;
      const scale = 1 + pulse * 0.06;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      // 1. Right Side (Deoxygenated Blood - Blue)
      ctx.fillStyle = "#1E3A8A"; // RA & RV background
      ctx.beginPath();
      ctx.arc(-45, -30, 45, 0, Math.PI * 2);
      ctx.arc(-40, 40, 55, 0, Math.PI * 2);
      ctx.fill();

      // 2. Left Side (Oxygenated Blood - Red)
      ctx.fillStyle = "#991B1B"; // LA & LV background
      ctx.beginPath();
      ctx.arc(45, -30, 45, 0, Math.PI * 2);
      ctx.arc(40, 40, 60, 0, Math.PI * 2);
      ctx.fill();

      // Outer Myocardium Wall
      ctx.strokeStyle = "#F43F5E";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(-45, -30, 48, 0, Math.PI * 2);
      ctx.arc(-40, 40, 58, 0, Math.PI * 2);
      ctx.arc(45, -30, 48, 0, Math.PI * 2);
      ctx.arc(40, 40, 63, 0, Math.PI * 2);
      ctx.stroke();

      // Septum Division (Central Wall)
      ctx.fillStyle = "#E11D48";
      ctx.fillRect(-10, -70, 20, 160);

      // 3. Chamber Labels
      ctx.fillStyle = "#38BDF8";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Right Atrium", -50, -30);
      ctx.fillText("Right Ventricle", -45, 45);

      ctx.fillStyle = "#FCA5A5";
      ctx.fillText("Left Atrium", 50, -30);
      ctx.fillText("Left Ventricle", 45, 45);

      // 4. Valves (Opening & Closing dynamically)
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      const valveOpen = isSystole ? 15 : 2;

      // Tricuspid (Right)
      ctx.beginPath();
      ctx.moveTo(-60, 5);
      ctx.lineTo(-60 + valveOpen, 5);
      ctx.stroke();

      // Mitral/Bicuspid (Left)
      ctx.beginPath();
      ctx.moveTo(60, 5);
      ctx.lineTo(60 - valveOpen, 5);
      ctx.stroke();

      ctx.restore();

      // Flow Arrows Legend
      ctx.fillStyle = "#38BDF8";
      ctx.fillText("➔ Deoxygenated Blood (To Lungs)", 30, h - 35);
      ctx.fillStyle = "#FCA5A5";
      ctx.fillText("➔ Oxygenated Blood (To Body)", 30, h - 18);

      animRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, bpm]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Section */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Science / Human Biology
              </span>
              <span className="text-xs text-muted-foreground">Cardiology & Physiology</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              Human Heart Pump Simulator
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Simulate cardiac cycle contractions, 4-chamber blood flow, valve mechanisms, and stroke volume cardiac output.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-md"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "Pause Beat" : "Start Beat"}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold border border-border bg-card hover:bg-surface-soft transition"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Controls Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Cardiac Controls
              </h2>

              {/* Heart Rate Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Heart Rate (BPM)</span>
                  <span className="text-primary font-mono text-base font-bold">{bpm} BPM</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="180"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Stroke Volume Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Stroke Volume ($SV$)</span>
                  <span className="text-primary font-mono">{strokeVolume} mL</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="120"
                  value={strokeVolume}
                  onChange={(e) => setStrokeVolume(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            {/* Cardiac Telemetry Card */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <HeartPulse className="w-4 h-4" /> Hemodynamic Metrics
              </h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Cardiac Output</div>
                  <div className="text-base font-bold font-mono text-foreground mt-0.5">
                    {cardiacOutput} L/min
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Cycle Time</div>
                  <div className="text-base font-bold font-mono text-foreground mt-0.5">
                    {(60 / bpm).toFixed(2)} sec
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Heart Canvas (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex-1 min-h-[440px]">
              <canvas ref={canvasRef} className="w-full h-full block" />
              <div className="absolute top-3 left-4 text-xs font-mono bg-card/80 backdrop-blur border border-border px-3 py-1 rounded-lg text-primary font-bold">
                Systole Contraction & Diastole Relaxation Cycle
              </div>
            </div>

            {/* Educational Notes */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Educational Principles: Double Circulation
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Deoxygenated blood enters the Right Atrium, moves to the Right Ventricle, and is pumped to the lungs (Pulmonary Circuit). Oxygenated blood returns to the Left Atrium, enters the Left Ventricle, and is pumped under high pressure through the Aorta to the rest of the body (Systemic Circuit).
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

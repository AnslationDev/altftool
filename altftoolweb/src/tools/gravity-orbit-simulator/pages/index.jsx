"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Sliders, Info, Compass } from "lucide-react";

export default function GravityOrbitSimulator() {
  const [starMass, setStarMass] = useState(5000);
  const [initDist, setInitDist] = useState(140);
  const [initSpeed, setInitSpeed] = useState(5.5);
  const [isPlaying, setIsPlaying] = useState(true);
  const [telemetry, setTelemetry] = useState({ radius: 140, speed: 5.5 });

  const canvasRef = useRef(null);
  const stateRef = useRef({ x: 0, y: 140, vx: 5.5, vy: 0 });
  const trailRef = useRef([]);
  const frameRef = useRef(0);
  const animRef = useRef(null);

  // Calculate circular & escape velocities
  const G = 1;
  const vCircular = Math.sqrt((G * starMass) / initDist);
  const vEscape = Math.sqrt((2 * G * starMass) / initDist);

  const handleReset = useCallback(() => {
    stateRef.current = { x: 0, y: initDist, vx: initSpeed, vy: 0 };
    trailRef.current = [];
    frameRef.current = 0;
    setTelemetry({ radius: initDist, speed: initSpeed });
    setIsPlaying(true);
  }, [initDist, initSpeed]);

  useEffect(() => {
    handleReset();
  }, [starMass, initDist, initSpeed, handleReset]);

  // Apply Orbit Preset
  const applyPreset = (preset) => {
    if (preset === "circular") setInitSpeed(Number(vCircular.toFixed(2)));
    if (preset === "elliptical") setInitSpeed(Number((vCircular * 0.75).toFixed(2)));
    if (preset === "escape") setInitSpeed(Number((vEscape * 1.1).toFixed(2)));
    if (preset === "crash") setInitSpeed(Number((vCircular * 0.25).toFixed(2)));
  };

  // Canvas Render & Physics Integration Loop
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

      // Draw Central Star
      const starR = Math.max(12, Math.min(starMass / 200, 30));
      const grad = ctx.createRadialGradient(cx, cy, 3, cx, cy, starR * 2.5);
      grad.addColorStop(0, "#FDE047");
      grad.addColorStop(0.5, "#F59E0B");
      grad.addColorStop(1, "rgba(245, 158, 11, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, starR * 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#FEF08A";
      ctx.beginPath();
      ctx.arc(cx, cy, starR, 0, Math.PI * 2);
      ctx.fill();

      // Physics Step (Gravitational Accel: a = -G M r_vec / r^3)
      if (isPlaying) {
        const dt = 0.4;
        let { x, y, vx, vy } = stateRef.current;
        const r2 = x * x + y * y;
        const r = Math.sqrt(r2);

        // Check collision
        if (r > starR + 5 && r < 800) {
          const ax = -(G * starMass * x) / (r2 * r);
          const ay = -(G * starMass * y) / (r2 * r);

          vx += ax * dt;
          vy += ay * dt;
          x += vx * dt;
          y += vy * dt;

          stateRef.current = { x, y, vx, vy };

          const nextTrail = [...trailRef.current, { x, y }];
          if (nextTrail.length > 300) nextTrail.shift();
          trailRef.current = nextTrail;
        }
      }

      const curr = stateRef.current;
      const currR = Math.sqrt(curr.x * curr.x + curr.y * curr.y);
      const currV = Math.sqrt(curr.vx * curr.vx + curr.vy * curr.vy);
      frameRef.current += 1;
      if (frameRef.current % 6 === 0) {
        setTelemetry((previous) =>
          previous.radius === currR && previous.speed === currV
            ? previous
            : { radius: currR, speed: currV },
        );
      }

      // Draw Trajectory Trail
      const trail = trailRef.current;
      if (trail.length > 1) {
        ctx.strokeStyle = "rgba(20, 184, 166, 0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        trail.forEach((pt, i) => {
          const px = cx + pt.x;
          const py = cy + pt.y;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }

      // Draw Orbiting Satellite
      const satX = cx + curr.x;
      const satY = cy + curr.y;

      ctx.fillStyle = "#22D3EE";
      ctx.shadowColor = "#22D3EE";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(satX, satY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Velocity Vector Arrow
      ctx.strokeStyle = "#F43F5E";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(satX, satY);
      ctx.lineTo(satX + curr.vx * 6, satY + curr.vy * 6);
      ctx.stroke();

      animRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, starMass]);

  const currR = telemetry.radius;
  const currV = telemetry.speed;

  let orbitType = "Elliptical Orbit";
  if (currR < 20) orbitType = "Collision (Crashed)";
  else if (currV >= vEscape) orbitType = "Hyperbolic Escape";
  else if (Math.abs(currV - vCircular) < 0.2) orbitType = "Stable Circular Orbit";

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Section */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Science / Astrophysics
              </span>
              <span className="text-xs text-muted-foreground">Orbital Mechanics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              Gravity Orbit Simulator
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Simulate gravitational 2-body trajectories, circular vs elliptical orbits, escape velocity, and decay crashes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-md"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "Pause Orbit" : "Resume Orbit"}
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
                <Sliders className="w-4 h-4 text-primary" /> Orbital Controls
              </h2>

              {/* Orbit Presets */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Orbit Presets</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button onClick={() => applyPreset("circular")} className="px-2.5 py-1.5 rounded border border-border hover:bg-surface-soft">Circular Orbit</button>
                  <button onClick={() => applyPreset("elliptical")} className="px-2.5 py-1.5 rounded border border-border hover:bg-surface-soft">Elliptical Orbit</button>
                  <button onClick={() => applyPreset("escape")} className="px-2.5 py-1.5 rounded border border-border hover:bg-surface-soft">Escape Velocity</button>
                  <button onClick={() => applyPreset("crash")} className="px-2.5 py-1.5 rounded border border-border hover:bg-surface-soft">Spiral Crash</button>
                </div>
              </div>

              {/* Central Star Mass */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Central Star Mass ($M$)</span>
                  <span className="text-primary font-mono">{starMass}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="15000"
                  step="500"
                  value={starMass}
                  onChange={(e) => setStarMass(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Initial Distance */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Initial Radius ($r_0$)</span>
                  <span className="text-primary font-mono">{initDist} km</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="240"
                  value={initDist}
                  onChange={(e) => setInitDist(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Tangential Speed */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Initial Speed ($v_0$)</span>
                  <span className="text-primary font-mono">{initSpeed} km/s</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.1"
                  value={initSpeed}
                  onChange={(e) => setInitSpeed(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            {/* Orbit Classification Telemetry */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-base font-bold text-foreground">{orbitType}</h2>
                <span className="text-xs font-mono text-primary">v_esc = {vEscape.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Current Speed</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                    {currV.toFixed(2)} km/s
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Distance ($r$)</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                    {Math.round(currR)} km
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orbit Canvas (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex-1 min-h-[440px]">
              <canvas ref={canvasRef} className="w-full h-full block" />
            </div>

            {/* Educational Notes */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Educational Principles: Gravitational Trajectories
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If orbital speed v = √(GM/r), the orbit is circular. If v &lt; √(2GM/r), the orbit is bound and elliptical. If v ≥ √(2GM/r), the body reaches escape velocity and follows an open parabolic or hyperbolic trajectory.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Compass, ArrowUpRight, Gauge, Activity, Info, Sparkles } from "lucide-react";

const PLANETS = [
  { name: "Earth", g: 9.81 },
  { name: "Moon", g: 1.62 },
  { name: "Mars", g: 3.71 },
  { name: "Jupiter", g: 24.79 },
];

export default function ProjectileMotionSimulator() {
  const [angle, setAngle] = useState(45); // degrees
  const [velocity, setVelocity] = useState(40); // m/s
  const [gravity, setGravity] = useState(9.81);
  const [planetName, setPlanetName] = useState("Earth");
  const [airResistance, setAirResistance] = useState(false);
  const [dragCoeff, setDragCoeff] = useState(0.1);
  const [mass, setMass] = useState(1.0); // kg

  const [isRunning, setIsRunning] = useState(false);
  const [simTime, setSimTime] = useState(0);
  const [trajectoryHistory, setTrajectoryHistory] = useState([]);

  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Theoretical calculations without air resistance
  const rad = (angle * Math.PI) / 180;
  const v0x = velocity * Math.cos(rad);
  const v0y = velocity * Math.sin(rad);
  const tFlightTheoretical = (2 * v0y) / gravity;
  const maxHeightTheoretical = (v0y * v0y) / (2 * gravity);
  const rangeTheoretical = (velocity * velocity * Math.sin(2 * rad)) / gravity;

  // Reset simulation state
  const handleReset = useCallback(() => {
    setIsRunning(false);
    setSimTime(0);
    setTrajectoryHistory([]);
    if (animRef.current) cancelAnimationFrame(animRef.current);
  }, []);

  const handlePlanetChange = (p) => {
    setPlanetName(p.name);
    setGravity(p.g);
    handleReset();
  };

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // Margin & Scale calculation
    const padding = 50;
    const maxWorldX = Math.max(rangeTheoretical * 1.25, 50);
    const maxWorldY = Math.max(maxHeightTheoretical * 1.4, 25);

    const scaleX = (w - padding * 2) / maxWorldX;
    const scaleY = (h - padding * 2) / maxWorldY;
    const scale = Math.min(scaleX, scaleY);

    const originX = padding;
    const originY = h - padding;

    const toCanvasX = (x) => originX + x * scale;
    const toCanvasY = (y) => originY - y * scale;

    // Clear background
    ctx.clearRect(0, 0, w, h);

    // Draw grid
    ctx.strokeStyle = "rgba(150, 150, 150, 0.15)";
    ctx.lineWidth = 1;
    const gridStepWorld = Math.pow(10, Math.floor(Math.log10(maxWorldX / 5)));
    for (let x = 0; x <= maxWorldX; x += gridStepWorld) {
      const cx = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(cx, padding);
      ctx.lineTo(cx, originY);
      ctx.stroke();
      ctx.fillStyle = "rgba(150, 150, 150, 0.6)";
      ctx.font = "10px sans-serif";
      ctx.fillText(`${Math.round(x)}m`, cx - 10, originY + 15);
    }
    for (let y = 0; y <= maxWorldY; y += gridStepWorld) {
      const cy = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(originX, cy);
      ctx.lineTo(w - padding, cy);
      ctx.stroke();
      if (y > 0) {
        ctx.fillStyle = "rgba(150, 150, 150, 0.6)";
        ctx.fillText(`${Math.round(y)}m`, originX - 30, cy + 4);
      }
    }

    // Draw Ground & Axes
    ctx.strokeStyle = "rgba(20, 184, 166, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(w - padding, originY);
    ctx.moveTo(originX, padding);
    ctx.lineTo(originX, originY);
    ctx.stroke();

    // Draw Theoretical Ideal Path (Dashed)
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(34, 211, 238, 0.35)";
    ctx.beginPath();
    for (let px = 0; px <= rangeTheoretical; px += rangeTheoretical / 100) {
      const py = px * Math.tan(rad) - (gravity * px * px) / (2 * velocity * velocity * Math.cos(rad) * Math.cos(rad));
      if (py < 0) break;
      const cx = toCanvasX(px);
      const cy = toCanvasY(py);
      if (px === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Actual Trajectory Trail
    if (trajectoryHistory.length > 1) {
      ctx.strokeStyle = "#14B8A6";
      ctx.lineWidth = 3;
      ctx.beginPath();
      trajectoryHistory.forEach((pt, i) => {
        const cx = toCanvasX(pt.x);
        const cy = toCanvasY(pt.y);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.stroke();
    }

    // Peak & Range Markers
    if (maxHeightTheoretical > 0) {
      const peakX = rangeTheoretical / 2;
      const peakY = maxHeightTheoretical;
      const cPeakX = toCanvasX(peakX);
      const cPeakY = toCanvasY(peakY);

      ctx.fillStyle = "#22D3EE";
      ctx.beginPath();
      ctx.arc(cPeakX, cPeakY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(`Max H: ${maxHeightTheoretical.toFixed(1)}m`, cPeakX - 30, cPeakY - 10);
    }

    const cLandX = toCanvasX(rangeTheoretical);
    ctx.fillStyle = "#14B8A6";
    ctx.beginPath();
    ctx.arc(cLandX, originY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(`Range: ${rangeTheoretical.toFixed(1)}m`, cLandX - 30, originY + 25);

    // Current Projectile Position & Velocity Vectors
    if (trajectoryHistory.length > 0) {
      const curr = trajectoryHistory[trajectoryHistory.length - 1];
      const cx = toCanvasX(curr.x);
      const cy = toCanvasY(curr.y);

      // Ball
      ctx.fillStyle = "#22D3EE";
      ctx.shadowColor = "#22D3EE";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Velocity Vector Arrows
      ctx.strokeStyle = "#F43F5E"; // Vx (red)
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + curr.vx * 0.8, cy);
      ctx.stroke();

      ctx.strokeStyle = "#10B981"; // Vy (green)
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, cy - curr.vy * 0.8);
      ctx.stroke();

      ctx.strokeStyle = "#F59E0B"; // Total V (yellow)
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + curr.vx * 0.8, cy - curr.vy * 0.8);
      ctx.stroke();
    }
  }, [trajectoryHistory, rangeTheoretical, maxHeightTheoretical, rad, gravity, velocity]);

  // Animation Loop Step
  useEffect(() => {
    if (!isRunning) return;

    let dt = 0.03; // seconds per frame
    const step = () => {
      setSimTime((prevTime) => {
        const nextTime = prevTime + dt;
        let x, y, vx, vy;

        if (!airResistance) {
          x = v0x * nextTime;
          y = v0y * nextTime - 0.5 * gravity * nextTime * nextTime;
          vx = v0x;
          vy = v0y - gravity * nextTime;
        } else {
          // Numerical Euler Integration with Drag (F_d = 0.5 * Cd * rho * v^2)
          const last = trajectoryHistory.length > 0 ? trajectoryHistory[trajectoryHistory.length - 1] : { x: 0, y: 0, vx: v0x, vy: v0y };
          const speed = Math.sqrt(last.vx * last.vx + last.vy * last.vy);
          const dragForce = 0.5 * dragCoeff * speed * speed;
          const ax = -(dragForce * (last.vx / speed)) / mass;
          const ay = -gravity - (dragForce * (last.vy / speed)) / mass;

          vx = last.vx + ax * dt;
          vy = last.vy + ay * dt;
          x = last.x + last.vx * dt;
          y = last.y + last.vy * dt;
        }

        if (y < 0) {
          setIsRunning(false);
          return prevTime;
        }

        setTrajectoryHistory((h) => [...h, { x, y, vx, vy }]);
        return nextTime;
      });

      animRef.current = requestAnimationFrame(step);
    };

    if (trajectoryHistory.length === 0) {
      setTrajectoryHistory([{ x: 0, y: 0, vx: v0x, vy: v0y }]);
    }

    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [isRunning, airResistance, v0x, v0y, gravity, dragCoeff, mass, trajectoryHistory]);

  const currPos = trajectoryHistory.length > 0 ? trajectoryHistory[trajectoryHistory.length - 1] : { x: 0, y: 0, vx: v0x, vy: v0y };
  const currentSpeed = Math.sqrt(currPos.vx * currPos.vx + currPos.vy * currPos.vy);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Section */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Science / Physics
              </span>
              <span className="text-xs text-muted-foreground">Interactive Mechanics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              Projectile Motion Simulator
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Simulate classical 2D kinematics under variable gravity, launch angle, velocity, and air resistance drag.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-md"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? "Pause" : "Launch"}
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
                <Compass className="w-4 h-4" /> Launch Parameters
              </h2>

              {/* Angle */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Launch Angle</span>
                  <span className="text-primary font-mono">{angle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={angle}
                  onChange={(e) => { setAngle(Number(e.target.value)); handleReset(); }}
                  className="w-full accent-primary"
                />
              </div>

              {/* Initial Velocity */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Initial Velocity ($v_0$)</span>
                  <span className="text-primary font-mono">{velocity} m/s</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={velocity}
                  onChange={(e) => { setVelocity(Number(e.target.value)); handleReset(); }}
                  className="w-full accent-primary"
                />
              </div>

              {/* Gravity Presets */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Environment Gravity</label>
                <div className="grid grid-cols-2 gap-2">
                  {PLANETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => handlePlanetChange(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        planetName === p.name ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                      }`}
                    >
                      {p.name} ({p.g}m/s²)
                    </button>
                  ))}
                </div>
              </div>

              {/* Air Resistance Toggle */}
              <div className="pt-2 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Air Resistance Drag</span>
                  <input
                    type="checkbox"
                    checked={airResistance}
                    onChange={(e) => { setAirResistance(e.target.checked); handleReset(); }}
                    className="h-4 w-4 accent-primary rounded cursor-pointer"
                  />
                </div>

                {airResistance && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Drag Coefficient ($C_d$)</span>
                      <span className="font-mono text-primary">{dragCoeff}</span>
                    </div>
                    <input
                      type="range"
                      min="0.01"
                      max="0.5"
                      step="0.01"
                      value={dragCoeff}
                      onChange={(e) => { setDragCoeff(Number(e.target.value)); handleReset(); }}
                      className="w-full accent-primary"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Current Metrics Card */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Gauge className="w-4 h-4" /> Telemetry & Real-Time Stats
              </h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Max Height ($H$)</div>
                  <div className="text-base font-bold font-mono text-foreground mt-0.5">
                    {maxHeightTheoretical.toFixed(2)} m
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Total Range ($R$)</div>
                  <div className="text-base font-bold font-mono text-foreground mt-0.5">
                    {rangeTheoretical.toFixed(2)} m
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Flight Time ($T$)</div>
                  <div className="text-base font-bold font-mono text-foreground mt-0.5">
                    {tFlightTheoretical.toFixed(2)} s
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Current Speed</div>
                  <div className="text-base font-bold font-mono text-foreground mt-0.5">
                    {currentSpeed.toFixed(1)} m/s
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Simulation Canvas (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex-1 min-h-[400px]">
              <canvas ref={canvasRef} className="w-full h-full block" />
              <div className="absolute bottom-3 left-4 flex items-center gap-4 text-[11px] font-mono bg-card/80 backdrop-blur border border-border px-3 py-1.5 rounded-lg">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Vx Vector</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Vy Vector</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Resultant V</span>
              </div>
            </div>

            {/* Educational Explanation Box */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Educational Principles: Projectile Motion
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A projectile moves in two independent dimensions under uniform gravity ($g$). Horizontal velocity ($v_x = v_0 \cos\theta$) remains constant in a vacuum, while vertical velocity ($v_y = v_0 \sin\theta - gt$) decelerates to zero at peak height before accelerating downward.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px] text-muted-foreground font-mono">
                <div className="p-2 rounded bg-surface-soft">Range: R = (v₀² sin 2θ) / g</div>
                <div className="p-2 rounded bg-surface-soft">Height: H = (v₀ sin θ)² / 2g</div>
                <div className="p-2 rounded bg-surface-soft">Time: T = 2v₀ sin θ / g</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

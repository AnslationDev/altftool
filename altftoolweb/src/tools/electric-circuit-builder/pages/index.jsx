"use client";

import React, { useState, useEffect, useRef } from "react";
import { Zap, RotateCcw, Sliders, Info, Lightbulb, ShieldAlert, Activity } from "lucide-react";

export default function ElectricCircuitBuilder() {
  const [voltage, setVoltage] = useState(12); // Volts
  const [r1, setR1] = useState(10); // Ohms
  const [r2, setR2] = useState(20); // Ohms (Bulb Resistance)
  const [isSwitchClosed, setIsSwitchClosed] = useState(true);
  const [circuitType, setCircuitType] = useState("series"); // 'series' | 'parallel'

  const canvasRef = useRef(null);
  const electronOffsetRef = useRef(0);
  const animRef = useRef(null);

  const handleReset = () => {
    setVoltage(12);
    setR1(10);
    setR2(20);
    setIsSwitchClosed(true);
    setCircuitType("series");
  };

  // Ohm's law calculations
  let totalR = 0;
  let totalI = 0; // Amperes
  let power = 0; // Watts

  if (isSwitchClosed) {
    if (circuitType === "series") {
      totalR = r1 + r2;
    } else {
      totalR = (r1 * r2) / (r1 + r2);
    }
    totalI = totalR > 0 ? voltage / totalR : 0;
    power = voltage * totalI;
  }

  // Bulb brightness scaling (0 to 1)
  const maxNormalPower = (24 * 24) / 10;
  const bulbBrightness = isSwitchClosed ? Math.min(power / maxNormalPower, 1) : 0;

  // Circuit Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    const marginX = 80;
    const marginY = 60;
    const left = marginX;
    const right = w - marginX;
    const top = marginY;
    const bottom = h - marginY;

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      // Draw Main Circuit Wire Loop
      ctx.strokeStyle = "#14B8A6";
      ctx.lineWidth = 4;

      ctx.beginPath();
      ctx.moveTo(left, top);
      ctx.lineTo(right, top);
      ctx.lineTo(right, bottom);
      ctx.lineTo(left, bottom);
      ctx.closePath();
      ctx.stroke();

      // Parallel branch if active
      if (circuitType === "parallel") {
        const midY = (top + bottom) / 2;
        ctx.beginPath();
        ctx.moveTo(left + (right - left) * 0.3, midY);
        ctx.lineTo(right - (right - left) * 0.3, midY);
        ctx.stroke();
      }

      // 1. Draw Battery (Left Side)
      const batY = (top + bottom) / 2;
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(left - 20, batY - 30, 40, 60);

      ctx.fillStyle = "#EF4444"; // Positive pole (+)
      ctx.fillRect(left - 15, batY - 25, 30, 15);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("+", left - 4, batY - 14);

      ctx.fillStyle = "#3B82F6"; // Negative pole (-)
      ctx.fillRect(left - 15, batY + 10, 30, 15);
      ctx.fillText("-", left - 3, batY + 22);

      ctx.fillStyle = "#14B8A6";
      ctx.fillText(`${voltage}V`, left - 50, batY + 4);

      // 2. Draw Switch (Top Side)
      const swX = (left + right) / 2;
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(swX - 30, top - 15, 60, 30);

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(swX - 18, top, 4, 0, Math.PI * 2);
      ctx.arc(swX + 18, top, 4, 0, Math.PI * 2);
      ctx.fill();

      if (isSwitchClosed) {
        ctx.beginPath();
        ctx.moveTo(swX - 18, top);
        ctx.lineTo(swX + 18, top);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(swX - 18, top);
        ctx.lineTo(swX + 10, top - 18);
        ctx.stroke();
      }

      ctx.fillStyle = isSwitchClosed ? "#10B981" : "#EF4444";
      ctx.fillText(isSwitchClosed ? "CLOSED" : "OPEN (BROKEN)", swX - 25, top - 22);

      // 3. Draw Resistor R1 (Right Side)
      const r1Y = (top + bottom) / 2;
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(right - 25, r1Y - 40, 50, 80);
      ctx.strokeStyle = "#F59E0B";
      ctx.strokeRect(right - 25, r1Y - 40, 50, 80);
      ctx.fillStyle = "#F59E0B";
      ctx.fillText(`R₁: ${r1}Ω`, right + 32, r1Y + 4);

      // 4. Draw Light Bulb R2 (Bottom Side)
      const bulbX = (left + right) / 2;

      // Glow halo
      if (isSwitchClosed && totalI > 0) {
        const glowRadius = 25 + bulbBrightness * 35;
        const grad = ctx.createRadialGradient(bulbX, bottom, 5, bulbX, bottom, glowRadius);
        grad.addColorStop(0, "rgba(245, 158, 11, 0.9)");
        grad.addColorStop(1, "rgba(245, 158, 11, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bulbX, bottom, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = isSwitchClosed && totalI > 0 ? "#F59E0B" : "#475569";
      ctx.beginPath();
      ctx.arc(bulbX, bottom, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`Bulb: ${r2}Ω`, bulbX - 28, bottom + 35);

      // 5. Animated Electron Flow (Moving dots along wire)
      if (isSwitchClosed && totalI > 0) {
        electronOffsetRef.current = (electronOffsetRef.current + totalI * 1.5) % 30;
        const offset = electronOffsetRef.current;

        ctx.fillStyle = "#22D3EE";

        // Top Wire (Right to Left for electrons)
        for (let x = right; x >= left; x -= 25) {
          const px = x - offset;
          if (px >= left && px <= right) {
            ctx.beginPath();
            ctx.arc(px, top, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        // Left Wire (Top to Bottom)
        for (let y = top; y <= bottom; y += 25) {
          const py = y + offset;
          if (py >= top && py <= bottom) {
            ctx.beginPath();
            ctx.arc(left, py, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        // Bottom Wire (Left to Right)
        for (let x = left; x <= right; x += 25) {
          const px = x + offset;
          if (px >= left && px <= right) {
            ctx.beginPath();
            ctx.arc(px, bottom, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        // Right Wire (Bottom to Top)
        for (let y = bottom; y >= top; y -= 25) {
          const py = y - offset;
          if (py >= top && py <= bottom) {
            ctx.beginPath();
            ctx.arc(right, py, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animRef.current);
  }, [voltage, r1, r2, isSwitchClosed, circuitType, totalI, power, bulbBrightness]);

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
              <span className="text-xs text-muted-foreground">Electricity & Circuits</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              Electric Circuit Builder
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Build DC circuits, toggle switches, adjust voltage and load resistance, and visualize live electron current flow.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSwitchClosed(!isSwitchClosed)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition shadow-md ${
                isSwitchClosed ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              <Zap className="w-4 h-4" />
              {isSwitchClosed ? "Open Switch" : "Close Switch"}
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
                <Sliders className="w-4 h-4" /> Circuit Components
              </h2>

              {/* Circuit Type */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Circuit Configuration</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCircuitType("series")}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition ${
                      circuitType === "series" ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                    }`}
                  >
                    Series Circuit
                  </button>
                  <button
                    onClick={() => setCircuitType("parallel")}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition ${
                      circuitType === "parallel" ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                    }`}
                  >
                    Parallel Circuit
                  </button>
                </div>
              </div>

              {/* DC Battery Voltage */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Battery Voltage ($V$)</span>
                  <span className="text-primary font-mono">{voltage} Volts</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="48"
                  value={voltage}
                  onChange={(e) => setVoltage(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Resistor 1 */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Resistor $R_1$</span>
                  <span className="text-primary font-mono">{r1} $\Omega$</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={r1}
                  onChange={(e) => setR1(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Bulb Resistance R2 */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Bulb Resistance $R_2$</span>
                  <span className="text-primary font-mono">{r2} $\Omega$</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={r2}
                  onChange={(e) => setR2(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            {/* Circuit Telemetry & Multimeter */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Activity className="w-4 h-4" /> Live Multimeter Readout
              </h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Total Resistance</div>
                  <div className="text-base font-bold font-mono text-foreground mt-0.5">
                    {totalR.toFixed(1)} $\Omega$
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Current ($I$)</div>
                  <div className="text-base font-bold font-mono text-foreground mt-0.5">
                    {totalI.toFixed(2)} A
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Power ($P$)</div>
                  <div className="text-base font-bold font-mono text-foreground mt-0.5">
                    {power.toFixed(1)} W
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Circuit Status</div>
                  <div className={`text-xs font-bold mt-1 ${isSwitchClosed ? "text-emerald-500" : "text-rose-500"}`}>
                    {isSwitchClosed ? "Closed (Flowing)" : "Open (Broken)"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Circuit Canvas (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex-1 min-h-[420px]">
              <canvas ref={canvasRef} className="w-full h-full block" />
            </div>

            {/* Educational Notes */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Educational Principles: Ohm's Law
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Current ($I$) is directly proportional to voltage ($V$) and inversely proportional to total resistance ($R$). In series circuits, resistances add ($R_eq = R_1 + R_2$). In parallel circuits, equivalent resistance drops ($1/R_eq = 1/R_1 + 1/R_2$).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] text-muted-foreground font-mono">
                <div className="p-2 rounded bg-surface-soft">Ohm's Law: V = I × R</div>
                <div className="p-2 rounded bg-surface-soft">Electric Power: P = V × I = I²R</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

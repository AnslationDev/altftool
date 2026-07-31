"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sun, RotateCcw, Sliders, Info } from "lucide-react";

const MATERIALS = [
  { name: "Air", n: 1.0003, color: "rgba(255, 255, 255, 0.05)" },
  { name: "Water", n: 1.333, color: "rgba(14, 165, 233, 0.2)" },
  { name: "Glass", n: 1.52, color: "rgba(20, 184, 166, 0.25)" },
  { name: "Diamond", n: 2.417, color: "rgba(168, 85, 247, 0.3)" },
];

export default function LightRefractionSimulator() {
  const [theta1, setTheta1] = useState(45); // degrees
  const [mat1, setMat1] = useState(MATERIALS[0]); // Air
  const [mat2, setMat2] = useState(MATERIALS[1]); // Water
  const [themeTick, setThemeTick] = useState(0);

  const canvasRef = useRef(null);

  const handleReset = () => {
    setTheta1(45);
    setMat1(MATERIALS[0]);
    setMat2(MATERIALS[1]);
  };

  const n1 = mat1.n;
  const n2 = mat2.n;
  const rad1 = (theta1 * Math.PI) / 180;

  const sinTheta2 = (n1 / n2) * Math.sin(rad1);
  const isTIR = sinTheta2 > 1.0;
  const rad2 = isTIR ? 0 : Math.asin(sinTheta2);
  const theta2 = isTIR ? 0 : (rad2 * 180) / Math.PI;

  // Critical angle if n1 > n2
  const criticalAngleRad = n1 > n2 ? Math.asin(n2 / n1) : null;
  const criticalAngleDeg = criticalAngleRad ? (criticalAngleRad * 180) / Math.PI : null;

  // Render optics on canvas. Extracted so it can be re-triggered both by
  // parameter changes and by layout/theme changes (see effects below).
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const midY = h / 2;
    const midX = w / 2;

    // Theme-aware text/line color (reads the live --foreground token so
    // labels stay legible in both light and dark themes).
    const styles = getComputedStyle(canvas);
    const textColor = styles.getPropertyValue("--foreground").trim() || "#111827";

    ctx.clearRect(0, 0, w, h);

    // 1. Medium 1 (Top) & Medium 2 (Bottom) Backgrounds
    ctx.fillStyle = mat1.color;
    ctx.fillRect(0, 0, w, midY);

    ctx.fillStyle = mat2.color;
    ctx.fillRect(0, midY, w, midY);

    // Boundary Line
    ctx.strokeStyle = "#14B8A6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();

    // Labels
    ctx.fillStyle = textColor;
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(`Medium 1: ${mat1.name} (n₁ = ${mat1.n})`, 20, 30);
    ctx.fillText(`Medium 2: ${mat2.name} (n₂ = ${mat2.n})`, 20, midY + 30);

    // 2. Normal Line (Dashed vertical)
    ctx.save();
    ctx.strokeStyle = textColor;
    ctx.globalAlpha = 0.4;
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(midX, 20);
    ctx.lineTo(midX, h - 20);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = textColor;
    ctx.fillText("Normal Line", midX + 8, 30);

    // 3. Incident Ray (Top Left -> Center)
    const rayLength = Math.min(w, h) * 0.45;
    const incX = midX - rayLength * Math.sin(rad1);
    const incY = midY - rayLength * Math.cos(rad1);

    ctx.strokeStyle = "#F59E0B"; // Laser Yellow/Orange
    ctx.lineWidth = 3;
    ctx.shadowColor = "#F59E0B";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(incX, incY);
    ctx.lineTo(midX, midY);
    ctx.stroke();

    // 4. Reflected Ray (Top Right)
    const refX = midX + rayLength * Math.sin(rad1);
    const refY = midY - rayLength * Math.cos(rad1);

    ctx.strokeStyle = isTIR ? "#F59E0B" : "rgba(245, 158, 11, 0.35)";
    ctx.lineWidth = isTIR ? 3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(refX, refY);
    ctx.stroke();

    // 5. Refracted Ray (Bottom Right)
    if (!isTIR) {
      const refrX = midX + rayLength * Math.sin(rad2);
      const refrY = midY + rayLength * Math.cos(rad2);

      ctx.strokeStyle = "#10B981"; // Emerald Green
      ctx.lineWidth = 3;
      ctx.shadowColor = "#10B981";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(refrX, refrY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Refraction Angle Arc
      ctx.strokeStyle = "#10B981";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(midX, midY, 40, Math.PI / 2 - rad2, Math.PI / 2);
      ctx.stroke();
      ctx.fillStyle = "#10B981";
      ctx.fillText(`θ₂ = ${theta2.toFixed(1)}°`, midX + 45, midY + 45);
    } else {
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#EF4444";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("⚡ Total Internal Reflection!", midX + 30, midY + 40);
    }

    // Incident Angle Arc — swept toward the incident ray's side (up-left,
    // matching incX/incY), not the reflected ray's side (up-right).
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(midX, midY, 45, -Math.PI / 2 - rad1, -Math.PI / 2);
    ctx.stroke();
    ctx.fillStyle = "#F59E0B";
    ctx.fillText(`θ₁ = ${theta1}°`, midX - 70, midY - 30);
  }, [theta1, mat1, mat2, rad1, rad2, isTIR, theta2]);

  // Redraw whenever the physics parameters change or the theme toggles.
  useEffect(() => {
    draw();
  }, [draw, themeTick]);

  // Watch for theme toggles (data-theme/class changes on <html>) so the
  // canvas re-reads --foreground and redraws with the correct colors.
  useEffect(() => {
    if (typeof MutationObserver === "undefined") return undefined;
    const observer = new MutationObserver(() => setThemeTick((tick) => tick + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });
    return () => observer.disconnect();
  }, []);

  // Resync the canvas backing-store size (and redraw) whenever the canvas's
  // own box changes size, e.g. on a breakpoint-driven layout shift.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(() => {
      draw();
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [draw]);

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
              <span className="text-xs text-muted-foreground">Optics & Wave Physics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              Light Refraction Simulator
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Simulate light refraction across media interfaces, calculate Snell's law angles, and observe Total Internal Reflection.
            </p>
          </div>
          <div className="flex items-center gap-3">
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
                <Sliders className="w-4 h-4" /> Media & Light Parameters
              </h2>

              {/* Medium 1 Select */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Incident Medium 1 (n₁)</label>
                <div className="grid grid-cols-2 gap-2">
                  {MATERIALS.map((m) => (
                    <button
                      key={`m1-${m.name}`}
                      onClick={() => setMat1(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        mat1.name === m.name ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                      }`}
                    >
                      {m.name} ({m.n})
                    </button>
                  ))}
                </div>
              </div>

              {/* Medium 2 Select */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Refracting Medium 2 (n₂)</label>
                <div className="grid grid-cols-2 gap-2">
                  {MATERIALS.map((m) => (
                    <button
                      key={`m2-${m.name}`}
                      onClick={() => setMat2(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        mat2.name === m.name ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                      }`}
                    >
                      {m.name} ({m.n})
                    </button>
                  ))}
                </div>
              </div>

              {/* Incident Angle Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <label htmlFor="lrs-theta1">Incident Angle (θ₁)</label>
                  <span className="text-primary font-mono">{theta1}°</span>
                </div>
                <input
                  id="lrs-theta1"
                  type="range"
                  min="0"
                  max="89"
                  value={theta1}
                  onChange={(e) => setTheta1(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            {/* Metrics & Snell's Telemetry */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Sun className="w-4 h-4" /> Optical Telemetry
              </h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Incident Angle (θ₁)</div>
                  <div className="text-base font-bold font-mono text-foreground mt-0.5">
                    {theta1}°
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Refraction Angle (θ₂)</div>
                  <div className="text-base font-bold font-mono text-foreground mt-0.5">
                    {isTIR ? "TIR" : `${theta2.toFixed(2)}°`}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Critical Angle (θc)</div>
                  <div className="text-base font-bold font-mono text-foreground mt-0.5">
                    {criticalAngleDeg ? `${criticalAngleDeg.toFixed(2)}°` : "N/A"}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Relative Ratio (n₁/n₂)</div>
                  <div className="text-base font-bold font-mono text-foreground mt-0.5">
                    {(n1 / n2).toFixed(3)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Refraction Canvas (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex-1 min-h-[420px]">
              <canvas ref={canvasRef} className="w-full h-full block" />
            </div>

            {/* Educational Notes */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Educational Principles: Snell's Law
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When light passes into a denser medium (n₂ &gt; n₁), it bends towards the normal line. When traveling from a denser to a rarer medium (n₁ &gt; n₂), light bends away from normal, causing Total Internal Reflection if θ₁ &gt; θc.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] text-muted-foreground font-mono">
                <div className="p-2 rounded bg-surface-soft">Snell's Law: n₁ sin θ₁ = n₂ sin θ₂</div>
                <div className="p-2 rounded bg-surface-soft">Critical Angle: sin θc = n₂ / n₁</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

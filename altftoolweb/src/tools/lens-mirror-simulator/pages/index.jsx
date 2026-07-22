"use client";

import React, { useState, useEffect, useRef } from "react";
import { Eye, RotateCcw, Sliders, Info, Sparkles } from "lucide-react";

export default function LensMirrorSimulator() {
  const [opticsType, setOpticsType] = useState("convex-lens"); // 'convex-lens' | 'concave-lens' | 'convex-mirror' | 'concave-mirror'
  const [objectDist, setObjectDist] = useState(150); // mm
  const [focalLength, setFocalLength] = useState(80); // mm
  const [objectHeight, setObjectHeight] = useState(50); // mm

  const canvasRef = useRef(null);

  const handleReset = () => {
    setOpticsType("convex-lens");
    setObjectDist(150);
    setFocalLength(80);
    setObjectHeight(50);
  };

  // Sign convention calculations
  const isLens = opticsType.includes("lens");
  const isConvex = opticsType.startsWith("convex");

  // Cartesian sign conventions:
  // u is always negative (object on left) = -objectDist
  // f is positive for Convex Lens / Concave Mirror, negative for Concave Lens / Convex Mirror
  const u = -Math.abs(objectDist);
  let f = Math.abs(focalLength);
  if (opticsType === "concave-lens" || opticsType === "convex-mirror") {
    f = -Math.abs(focalLength);
  }

  let v = 0;
  let m = 0;
  let isReal = false;
  let isInverted = false;

  if (isLens) {
    // 1/f = 1/v - 1/u => 1/v = 1/f + 1/u
    const invV = 1 / f + 1 / u;
    if (Math.abs(invV) > 0.00001) {
      v = 1 / invV;
      m = v / u;
    }
    isReal = v > 0;
    isInverted = m < 0;
  } else {
    // Mirror formula: 1/f = 1/v + 1/u => 1/v = 1/f - 1/u
    const invV = 1 / f - 1 / u;
    if (Math.abs(invV) > 0.00001) {
      v = 1 / invV;
      m = -v / u;
    }
    isReal = v < 0;
    isInverted = m < 0;
  }

  const imageHeight = objectHeight * m;

  // Draw Ray Diagram on Canvas
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
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Principal Axis
    ctx.strokeStyle = "rgba(150, 150, 150, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.stroke();

    // 2. Draw Lens or Mirror Interface at Center (cx, cy)
    ctx.strokeStyle = "#14B8A6";
    ctx.lineWidth = 3;
    ctx.fillStyle = "rgba(20, 184, 166, 0.1)";

    if (isLens) {
      ctx.beginPath();
      if (isConvex) {
        ctx.ellipse(cx, cy, 14, h * 0.4, 0, 0, Math.PI * 2);
      } else {
        // Concave lens curve
        ctx.moveTo(cx - 15, cy - h * 0.4);
        ctx.quadraticCurveTo(cx - 3, cy, cx - 15, cy + h * 0.4);
        ctx.lineTo(cx + 15, cy + h * 0.4);
        ctx.quadraticCurveTo(cx + 3, cy, cx + 15, cy - h * 0.4);
        ctx.closePath();
      }
      ctx.fill();
      ctx.stroke();
    } else {
      // Mirror Arc
      ctx.beginPath();
      ctx.arc(cx + (isConvex ? -150 : 150), cy, 160, Math.PI - 0.7, Math.PI + 0.7, !isConvex);
      ctx.stroke();
    }

    // Focal Points F & 2F
    const fPx = Math.abs(f);
    ctx.fillStyle = "#22D3EE";
    ctx.font = "bold 11px sans-serif";

    // F1, F2, 2F1, 2F2
    [ -fPx * 2, -fPx, fPx, fPx * 2 ].forEach((offset, idx) => {
      const fx = cx + offset;
      if (fx > 10 && fx < w - 10) {
        ctx.beginPath();
        ctx.arc(fx, cy, 3.5, 0, Math.PI * 2);
        ctx.fill();
        const labels = ["2F₁", "F₁", "F₂", "2F₂"];
        ctx.fillText(labels[idx], fx - 8, cy + 18);
      }
    });

    // 3. Draw Object Arrow (Left side: cx + u)
    const objX = cx + u;
    const objTopY = cy - objectHeight;

    ctx.strokeStyle = "#F59E0B"; // Orange for Object
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(objX, cy);
    ctx.lineTo(objX, objTopY);
    ctx.stroke();

    // Arrow head
    ctx.fillStyle = "#F59E0B";
    ctx.beginPath();
    ctx.moveTo(objX, objTopY);
    ctx.lineTo(objX - 5, objTopY + 10);
    ctx.lineTo(objX + 5, objTopY + 10);
    ctx.fill();
    ctx.fillText("Object", objX - 16, objTopY - 8);

    // 4. Draw Image Arrow (at cx + v)
    const imgX = cx + v;
    const imgTopY = cy - imageHeight;

    if (Math.abs(v) < w * 2 && Math.abs(v) > 5) {
      ctx.strokeStyle = isReal ? "#14B8A6" : "#A855F7"; // Teal for Real, Purple for Virtual
      ctx.lineWidth = 3;
      if (!isReal) ctx.setLineDash([5, 5]);

      ctx.beginPath();
      ctx.moveTo(imgX, cy);
      ctx.lineTo(imgX, imgTopY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = isReal ? "#14B8A6" : "#A855F7";
      ctx.beginPath();
      ctx.moveTo(imgX, imgTopY);
      const dir = isInverted ? 1 : -1;
      ctx.lineTo(imgX - 5, imgTopY - 10 * dir);
      ctx.lineTo(imgX + 5, imgTopY - 10 * dir);
      ctx.fill();
      ctx.fillText(`Image (${isReal ? "Real" : "Virtual"})`, imgX - 30, imgTopY + (isInverted ? 20 : -10));
    }

    // 5. Draw Light Rays from Object Tip
    ctx.lineWidth = 1.5;

    // Ray 1: Parallel to Axis -> through Focal point
    ctx.strokeStyle = "rgba(239, 68, 68, 0.7)"; // Red ray
    ctx.beginPath();
    ctx.moveTo(objX, objTopY);
    ctx.lineTo(cx, objTopY);

    if (isLens) {
      if (isConvex) {
        ctx.lineTo(cx + fPx * 2, cy + (objTopY - cy) * -1);
      } else {
        ctx.lineTo(w, objTopY + (objTopY - cy) * 0.8);
      }
    } else {
      ctx.lineTo(imgX, imgTopY);
    }
    ctx.stroke();

    // Ray 2: Passing through Optical Center / Pole
    ctx.strokeStyle = "rgba(16, 185, 129, 0.7)"; // Green ray
    ctx.beginPath();
    ctx.moveTo(objX, objTopY);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + (cx - objX), cy + (cy - objTopY));
    ctx.stroke();

  }, [opticsType, u, f, v, m, isLens, isConvex, isReal, isInverted, objectHeight, imageHeight]);

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
              <span className="text-xs text-muted-foreground">Geometric Optics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              Lens & Mirror Simulator
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Simulate principal ray tracing, real vs virtual images, magnification, and focal points for spherical lenses and mirrors.
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
                <Sliders className="w-4 h-4" /> Optical Element Setup
              </h2>

              {/* Optics Type Selector */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Optics System</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "convex-lens", label: "Convex Lens" },
                    { id: "concave-lens", label: "Concave Lens" },
                    { id: "concave-mirror", label: "Concave Mirror" },
                    { id: "convex-mirror", label: "Convex Mirror" },
                  ].map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setOpticsType(o.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition ${
                        opticsType === o.id ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Object Distance */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Object Distance ($u$)</span>
                  <span className="text-primary font-mono">{objectDist} mm</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="300"
                  value={objectDist}
                  onChange={(e) => setObjectDist(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Focal Length */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Focal Length ($f$)</span>
                  <span className="text-primary font-mono">{focalLength} mm</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="150"
                  value={focalLength}
                  onChange={(e) => setFocalLength(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Object Height */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Object Height ($h_o$)</span>
                  <span className="text-primary font-mono">{objectHeight} mm</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={objectHeight}
                  onChange={(e) => setObjectHeight(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            {/* Calculations & Image Properties Card */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Eye className="w-4 h-4" /> Image Character & Metrics
              </h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Image Distance ($v$)</div>
                  <div className="text-base font-bold font-mono text-foreground mt-0.5">
                    {v.toFixed(1)} mm
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Magnification ($m$)</div>
                  <div className="text-base font-bold font-mono text-foreground mt-0.5">
                    {m.toFixed(2)}x
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Image Type</div>
                  <div className="text-sm font-bold text-foreground mt-0.5">
                    {isReal ? "Real Image" : "Virtual Image"}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Orientation</div>
                  <div className="text-sm font-bold text-foreground mt-0.5">
                    {isInverted ? "Inverted" : "Upright"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ray Tracing Canvas (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex-1 min-h-[420px]">
              <canvas ref={canvasRef} className="w-full h-full block" />
            </div>

            {/* Educational Notes */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Educational Principles: Geometric Ray Optics
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Images are formed where light rays intersect. Real images can be projected on a screen (v &gt; 0 for lenses), whereas Virtual images appear behind the optical element and cannot be projected (v &lt; 0).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] text-muted-foreground font-mono">
                <div className="p-2 rounded bg-surface-soft">Lens Equation: 1/f = 1/v - 1/u</div>
                <div className="p-2 rounded bg-surface-soft">Mirror Equation: 1/f = 1/v + 1/u</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

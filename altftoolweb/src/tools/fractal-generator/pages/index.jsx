"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, RotateCcw, Sliders, Info, ZoomIn, ZoomOut } from "lucide-react";

const FRACTALS = [
  { id: "mandelbrot", name: "Mandelbrot Set", formula: "zₙ₊₁ = zₙ² + c", desc: "The boundary of complex numbers c for which z₀=0 does not escape to infinity." },
  { id: "julia", name: "Julia Set", formula: "zₙ₊₁ = zₙ² + C (constant C = -0.7 + 0.27i)", desc: "Fractal boundary formed by iterating a fixed complex constant C." },
  { id: "sierpinski", name: "Sierpinski Triangle", formula: "Self-Similar Recursive Subdivision", desc: "A recursive geometric pattern formed by repeatedly subdividing equilateral triangles." },
  { id: "koch", name: "Koch Snowflake", formula: "Infinite Boundary, Finite Area", desc: "Constructed by replacing the middle third of line segments with equilateral points." },
  { id: "fern", name: "Barnsley Fern", formula: "Iterated Function System (IFS)", desc: "Biological fern leaf shape produced by four affine matrix transformations." },
];

export default function FractalGenerator() {
  // The Mandelbrot/Julia zoom center. (-0.745, 0.113) sits in the "seahorse
  // valley" on the fractal boundary rather than deep in the interior cardioid
  // (unlike the old (-0.5, 0) default, which becomes a single flat interior
  // color by ~10x zoom with nothing left to see) so Zoom In keeps revealing
  // fresh self-similar detail.
  const DEFAULT_PAN_X = -0.745;
  const DEFAULT_PAN_Y = 0.113;

  const [fractal, setFractal] = useState(FRACTALS[0]);
  const [maxIter, setMaxIter] = useState(60);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(DEFAULT_PAN_X);
  const [panY, setPanY] = useState(DEFAULT_PAN_Y);
  const [palette, setPalette] = useState("teal");

  const canvasRef = useRef(null);

  const handleReset = () => {
    setFractal(FRACTALS[0]);
    setMaxIter(60);
    setZoom(1);
    setPanX(DEFAULT_PAN_X);
    setPanY(DEFAULT_PAN_Y);
    setPalette("teal");
  };

  // Color Mapping Helper
  const getColor = (iter, max) => {
    if (iter === max) return [15, 23, 42]; // Interior dark slate

    const t = iter / max;
    if (palette === "teal") {
      return [
        Math.floor(20 * (1 - t) + 34 * t),
        Math.floor(184 * t + 50 * (1 - t)),
        Math.floor(166 * t + 220 * (1 - t)),
      ];
    } else if (palette === "fire") {
      // Classic "hot" ramp: black -> red -> orange -> yellow -> white, so the
      // slowest-escaping pixels near the fractal boundary (t -> 1) render
      // white-hot instead of the green the previous sin()-based formula
      // produced there.
      if (t < 1 / 3) {
        return [Math.floor(255 * (t / (1 / 3))), 0, 0];
      } else if (t < 2 / 3) {
        return [255, Math.floor(255 * ((t - 1 / 3) / (1 / 3))), 0];
      }
      return [255, 255, Math.floor(255 * ((t - 2 / 3) / (1 / 3)))];
    } else {
      // Neon Rainbow
      const h = t * 360;
      return [
        Math.floor(128 + 127 * Math.sin((h * Math.PI) / 180)),
        Math.floor(128 + 127 * Math.sin(((h + 120) * Math.PI) / 180)),
        Math.floor(128 + 127 * Math.sin(((h + 240) * Math.PI) / 180)),
      ];
    }
  };

  // Render Fractals on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const w = 480;
    const h = 360;
    canvas.width = w;
    canvas.height = h;

    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;

    const fId = fractal.id;

    if (fId === "mandelbrot" || fId === "julia") {
      const scale = 3.0 / (zoom * Math.min(w, h));

      for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
          let x0 = (px - w / 2) * scale + panX;
          let y0 = (py - h / 2) * scale + panY;

          let x = fId === "julia" ? x0 : 0;
          let y = fId === "julia" ? y0 : 0;

          let cx = fId === "julia" ? -0.7 : x0;
          let cy = fId === "julia" ? 0.27015 : y0;

          let iter = 0;
          while (x * x + y * y <= 4 && iter < maxIter) {
            let xtemp = x * x - y * y + cx;
            y = 2 * x * y + cy;
            x = xtemp;
            iter++;
          }

          const [r, g, b] = getColor(iter, maxIter);
          const pixelIdx = (py * w + px) * 4;
          data[pixelIdx] = r;
          data[pixelIdx + 1] = g;
          data[pixelIdx + 2] = b;
          data[pixelIdx + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);

    } else if (fId === "sierpinski") {
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, 0, w, h);

      // Zoom/pan is applied as a canvas transform centered on the canvas so the
      // Zoom In/Out controls actually magnify this render (they previously did
      // nothing for chaos-game / IFS fractals, which never read zoom/panX/panY).
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-w / 2, -h / 2);

      // Chaos game Sierpinski
      let px = w / 2;
      let py = 20;
      const v = [{ x: w / 2, y: 20 }, { x: 40, y: h - 30 }, { x: w - 40, y: h - 30 }];

      ctx.fillStyle = "#14B8A6";
      const totalPoints = maxIter * 150;
      for (let i = 0; i < totalPoints; i++) {
        const target = v[Math.floor(Math.random() * 3)];
        px = (px + target.x) / 2;
        py = (py + target.y) / 2;
        ctx.fillRect(px, py, 1.5, 1.5);
      }
      ctx.restore();

    } else if (fId === "fern") {
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-w / 2, -h / 2);

      let x = 0;
      let y = 0;
      ctx.fillStyle = "#10B981";

      const points = maxIter * 200;
      for (let i = 0; i < points; i++) {
        const r = Math.random();
        let nextX, nextY;

        if (r < 0.01) {
          nextX = 0;
          nextY = 0.16 * y;
        } else if (r < 0.86) {
          nextX = 0.85 * x + 0.04 * y;
          nextY = -0.04 * x + 0.85 * y + 1.6;
        } else if (r < 0.93) {
          nextX = 0.2 * x - 0.26 * y;
          nextY = 0.23 * x + 0.22 * y + 1.6;
        } else {
          nextX = -0.15 * x + 0.28 * y;
          nextY = 0.26 * x + 0.24 * y + 0.44;
        }

        x = nextX;
        y = nextY;

        const cx = w / 2 + x * 45;
        const cy = h - y * 32 - 10;
        ctx.fillRect(cx, cy, 1.2, 1.2);
      }
      ctx.restore();
    } else if (fId === "koch") {
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-w / 2, -h / 2);

      ctx.strokeStyle = "#22D3EE";
      ctx.lineWidth = 1.5 / zoom;

      const drawKochLine = (p1, p2, depth) => {
        if (depth === 0) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          return;
        }

        const dx = (p2.x - p1.x) / 3;
        const dy = (p2.y - p1.y) / 3;

        const a = { x: p1.x + dx, y: p1.y + dy };
        const c = { x: p1.x + 2 * dx, y: p1.y + 2 * dy };

        const b = {
          x: a.x + dx * Math.cos(-Math.PI / 3) - dy * Math.sin(-Math.PI / 3),
          y: a.y + dx * Math.sin(-Math.PI / 3) + dy * Math.cos(-Math.PI / 3),
        };

        drawKochLine(p1, a, depth - 1);
        drawKochLine(a, b, depth - 1);
        drawKochLine(b, c, depth - 1);
        drawKochLine(c, p2, depth - 1);
      };

      const p1 = { x: 100, y: h - 90 };
      const p2 = { x: w - 100, y: h - 90 };
      const p3 = { x: w / 2, y: 50 };

      const kDepth = Math.min(Math.floor(maxIter / 15), 4);
      drawKochLine(p1, p2, kDepth);
      drawKochLine(p2, p3, kDepth);
      drawKochLine(p3, p1, kDepth);
      ctx.restore();
    }
  }, [fractal, maxIter, zoom, panX, panY, palette]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Section */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Science / Chaos Theory
              </span>
              <span className="text-xs text-muted-foreground">Fractal Geometry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              Fractal Generator
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Render famous complex fractals, adjust iteration depth, explore self-similarity, and zoom into infinite details.
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
                <Sliders className="w-4 h-4" /> Fractal Parameters
              </h2>

              {/* Fractal Selector */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Fractal Type</label>
                <div className="space-y-1.5">
                  {FRACTALS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFractal(f)}
                      aria-pressed={fractal.id === f.id}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-medium border text-left flex items-center justify-between transition ${
                        fractal.id === f.id ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                      }`}
                    >
                      <span>{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Iterations Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <label htmlFor="fractal-iteration-depth">Iteration Depth</label>
                  <span className="text-primary font-mono" aria-hidden="true">{maxIter}</span>
                </div>
                <input
                  id="fractal-iteration-depth"
                  type="range"
                  min="20"
                  max="150"
                  value={maxIter}
                  onChange={(e) => setMaxIter(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Color Palette Selector */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Color Palette</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "teal", label: "Teal" },
                    { id: "fire", label: "Fire" },
                    { id: "rainbow", label: "Neon" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPalette(p.id)}
                      aria-pressed={palette === p.id}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                        palette === p.id ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zoom Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setZoom((z) => Math.min(z * 1.8, 100))}
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface-soft hover:bg-primary/20 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <ZoomIn className="w-3.5 h-3.5" /> Zoom In
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(z / 1.8, 0.5))}
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface-soft hover:bg-primary/20 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <ZoomOut className="w-3.5 h-3.5" /> Zoom Out
                </button>
              </div>
            </div>

            {/* Fractal Telemetry Card */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
              <div className="border-b border-border pb-2">
                <h2 className="text-base font-bold text-foreground">{fractal.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{fractal.desc}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Zoom Depth</div>
                  <div
                    className="text-sm font-bold font-mono text-foreground mt-0.5"
                    role="status"
                    aria-live="polite"
                  >
                    {zoom.toFixed(1)}x
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Formula</div>
                  <div className="text-xs font-bold font-mono text-primary mt-0.5">
                    {fractal.formula}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Render Canvas (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex-1 min-h-[440px] flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="w-full h-full block"
                role="img"
                aria-label={`${fractal.name} rendered at ${zoom.toFixed(1)}x zoom with the ${palette} color palette and iteration depth ${maxIter}.`}
              />
            </div>

            {/* Educational Notes */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Educational Principles: Fractal Self-Similarity
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Coined by Benoît Mandelbrot in 1975, fractals are infinitely complex patterns that are self-similar across different scales. They model natural phenomena like coastlines, snowflakes, trees, and Romanesco broccoli.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

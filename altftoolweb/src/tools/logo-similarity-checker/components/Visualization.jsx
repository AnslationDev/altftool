"use client";

import { useState, useRef, useEffect } from "react";
import { Columns, Layers, Eye, SlidersHorizontal, ZoomIn, ZoomOut, Maximize2, Minimize2, SplitSquareHorizontal } from "lucide-react";

export default function Visualization({ imgA, imgB, results }) {
  const [mode, setMode] = useState("side-by-side");
  const [opacity, setOpacity] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (mode === "difference" && canvasRef.current && imgA && imgB) {
      renderDifference();
    }
  }, [mode, imgA, imgB, opacity, zoom]);

  const renderDifference = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cA = document.createElement("canvas");
    const cB = document.createElement("canvas");

    const draw = (img, cvs) => {
      cvs.width = 300; cvs.height = 300;
      const ct = cvs.getContext("2d");
      ct.drawImage(img, 0, 0, 300, 300);
    };
    draw(imgA, cA);
    draw(imgB, cB);

    const dA = cA.getContext("2d").getImageData(0, 0, 300, 300);
    const dB = cB.getContext("2d").getImageData(0, 0, 300, 300);
    canvas.width = 300; canvas.height = 300;

    const out = ctx.createImageData(300, 300);
    for (let i = 0; i < dA.data.length; i += 4) {
      const dr = Math.abs(dA.data[i] - dB.data[i]) * (opacity / 50);
      const dg = Math.abs(dA.data[i + 1] - dB.data[i + 1]) * (opacity / 50);
      const db = Math.abs(dA.data[i + 2] - dB.data[i + 2]) * (opacity / 50);
      const diff = Math.max(dr, dg, db);
      out.data[i] = diff > 30 ? 255 : 0;
      out.data[i + 1] = 0;
      out.data[i + 2] = 0;
      out.data[i + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  };

  const modes = [
    { id: "side-by-side", label: "Side by Side", icon: Columns },
    { id: "overlay", label: "Overlay", icon: Layers },
    { id: "difference", label: "Difference", icon: Eye },
    { id: "split", label: "Split View", icon: SplitSquareHorizontal },
  ];

  return (
    <div className={`space-y-3 ${fullscreen ? "fixed inset-0 z-50 bg-[--page] p-4" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {modes.map((m) => {
            const Icon = m.icon;
            return (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${mode === m.id ? "bg-primary text-white" : "bg-[--surface-soft] text-[--muted] hover:text-[--foreground]"}`}>
                <Icon className="h-3.5 w-3.5" />{m.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1.5">
          {mode === "overlay" && (
            <div className="flex items-center gap-2 rounded-lg bg-[--surface-soft] px-2.5 py-1">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[--muted]" />
              <input type="range" min="10" max="90" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="h-1 w-20 accent-primary" />
              <span className="text-xs text-[--muted] w-8">{opacity}%</span>
            </div>
          )}
          <button onClick={() => setZoom(Math.min(3, zoom + 0.25))} className="rounded-lg p-1.5 text-[--muted] hover:bg-[--surface-soft]"><ZoomIn className="h-4 w-4" /></button>
          <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="rounded-lg p-1.5 text-[--muted] hover:bg-[--surface-soft]"><ZoomOut className="h-4 w-4" /></button>
          <span className="text-xs text-[--muted] w-10">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setFullscreen(!fullscreen)} className="rounded-lg p-1.5 text-[--muted] hover:bg-[--surface-soft]">
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div ref={containerRef} className="relative overflow-hidden rounded-xl border border-[--border] bg-[--page]" style={{ height: fullscreen ? "calc(100vh - 160px)" : "400px" }}>
        <div className="flex h-full items-center justify-center" style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}>
          {mode === "side-by-side" && (
            <div className="flex h-full w-full">
              <div className="flex flex-1 items-center justify-center border-r border-[--border] p-2">
                {imgA ? <img src={imgA.src} alt="Logo A" className="max-h-full max-w-full object-contain" /> : <p className="text-xs text-[--muted]">Logo A</p>}
              </div>
              <div className="flex flex-1 items-center justify-center p-2">
                {imgB ? <img src={imgB.src} alt="Logo B" className="max-h-full max-w-full object-contain" /> : <p className="text-xs text-[--muted]">Logo B</p>}
              </div>
            </div>
          )}

          {mode === "overlay" && (
            <div className="relative flex h-full w-full items-center justify-center p-4">
              {imgA && <img src={imgA.src} alt="Logo A" className="absolute max-h-[90%] max-w-[90%] object-contain" style={{ opacity: 1 }} />}
              {imgB && <img src={imgB.src} alt="Logo B" className="absolute max-h-[90%] max-w-[90%] object-contain" style={{ opacity: opacity / 100 }} />}
            </div>
          )}

          {mode === "difference" && (
            <div className="flex h-full w-full items-center justify-center">
              {imgA && imgB ? <canvas ref={canvasRef} className="max-h-full max-w-full" /> : <p className="text-xs text-[--muted]">Upload both logos to see difference</p>}
            </div>
          )}

          {mode === "split" && (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
              {imgA && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ clipPath: `inset(0 ${100 - opacity}% 0 0)` }}>
                  <img src={imgA.src} alt="Logo A" className="max-h-full max-w-full object-contain" />
                </div>
              )}
              {imgB && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ clipPath: `inset(0 0 0 ${opacity}%)` }}>
                  <img src={imgB.src} alt="Logo B" className="max-h-full max-w-full object-contain" />
                </div>
              )}
              <div className="absolute top-0 bottom-0" style={{ left: `${opacity}%`, width: "2px", background: "var(--primary)", boxShadow: "0 0 8px rgba(20,184,166,.5)" }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

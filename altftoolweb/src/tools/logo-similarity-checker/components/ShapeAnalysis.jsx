"use client";

import { Triangle, Circle, Square, Minus } from "lucide-react";

const SHAPE_ICONS = { "Squares/Rectangles": Square, "Circles/Curves": Circle, "Triangles/Diagonals": Triangle, "Horizontal Lines": Minus, "Vertical Lines": Minus };

export default function ShapeAnalysis({ geoA, geoB, shapeComparison }) {
  if (!geoA && !geoB) return null;

  const GeometryCard = ({ geo, label }) => (
    <div>
      <h4 className="mb-2 text-xs font-semibold text-[--foreground]">{label}</h4>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-[--surface-soft] p-2 text-center">
            <p className="text-xs text-[--muted]">Coverage</p>
            <p className="text-sm font-bold text-[--foreground]">{geo.coverage}%</p>
          </div>
          <div className="rounded-lg bg-[--surface-soft] p-2 text-center">
            <p className="text-xs text-[--muted]">Edge Density</p>
            <p className="text-sm font-bold text-[--foreground]">{geo.edgeDensity}%</p>
          </div>
          <div className="rounded-lg bg-[--surface-soft] p-2 text-center">
            <p className="text-xs text-[--muted]">Roundness</p>
            <p className="text-sm font-bold text-[--foreground]">{geo.roundness}%</p>
          </div>
          <div className="rounded-lg bg-[--surface-soft] p-2 text-center">
            <p className="text-xs text-[--muted]">Aspect Ratio</p>
            <p className="text-sm font-bold text-[--foreground]">{geo.aspectRatio}</p>
          </div>
        </div>
        <div className="rounded-lg bg-[--surface-soft] p-2 text-center">
          <p className="text-xs text-[--muted]">Complexity</p>
          <p className="text-sm font-bold text-[--foreground]">{geo.complexity}</p>
        </div>
        {geo.shapes?.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-[--muted]">Detected Shapes</p>
            {geo.shapes.map((s, i) => {
              const Icon = SHAPE_ICONS[s.name] || Square;
              return (
                <div key={i} className="flex items-center justify-between rounded-lg bg-[--surface-soft] px-2 py-1">
                  <span className="flex items-center gap-1.5 text-xs text-[--foreground]"><Icon className="h-3.5 w-3.5 text-primary" />{s.name}</span>
                  <span className="text-xs text-[--muted]">{s.confidence}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {shapeComparison && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Coverage", value: shapeComparison.coverage },
            { label: "Edge Density", value: shapeComparison.edgeDensity },
            { label: "Roundness", value: shapeComparison.roundness },
            { label: "Aspect Ratio", value: shapeComparison.aspectRatio },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-[--border] bg-[--surface] p-3 text-center">
              <p className="text-xs text-[--muted]">{m.label}</p>
              <div className="mt-1 relative h-16 w-16 mx-auto">
                <svg className="h-16 w-16 -rotate-90" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="26" fill="none" stroke="var(--border)" strokeWidth="4" />
                  <circle cx="30" cy="30" r="26" fill="none" stroke="#14B8A6" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${(m.value / 100) * 163.36} 163.36`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-[--foreground]">{m.value}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {geoA && <GeometryCard geo={geoA} label="Logo A — Shape Analysis" />}
        {geoB && <GeometryCard geo={geoB} label="Logo B — Shape Analysis" />}
      </div>
    </div>
  );
}

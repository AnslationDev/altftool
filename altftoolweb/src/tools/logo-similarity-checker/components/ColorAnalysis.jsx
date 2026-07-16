"use client";

import { useMemo } from "react";
import { Palette, Droplets, Eye, Layers } from "lucide-react";

export default function ColorAnalysis({ paletteA, paletteB, colorComparison }) {
  if (!paletteA?.length && !paletteB?.length) return null;

  const ColorPalette = ({ colors, label }) => (
    <div>
      <h4 className="mb-2 text-xs font-semibold text-[--foreground]">{label}</h4>
      <div className="space-y-2">
        {colors.map((c, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-[--border] p-2">
            <div className="h-8 w-8 shrink-0 rounded-lg border border-[--border]" style={{ backgroundColor: c.hex }} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-[--foreground]">{c.hex}</span>
                <span className="text-xs text-[--muted]">{Math.round(c.percentage)}%</span>
              </div>
              <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-[--surface-soft]">
                <div className="h-full rounded-full bg-primary" style={{ width: `${c.percentage}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {colorComparison && (
        <div className="rounded-xl border border-[--border] bg-[--surface] p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Palette className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-[--foreground]">{colorComparison.similarity}%</span>
            <span className="text-xs text-[--muted]">Color Palette Match</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[--surface-soft]">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${colorComparison.similarity}%`, backgroundColor: colorComparison.similarity >= 70 ? "#EF4444" : colorComparison.similarity >= 50 ? "#F97316" : "#22C55E" }} />
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {paletteA?.length > 0 && <ColorPalette colors={paletteA} label="Logo A — Dominant Colors" />}
        {paletteB?.length > 0 && <ColorPalette colors={paletteB} label="Logo B — Dominant Colors" />}
      </div>

      {colorComparison?.matches?.length > 0 && (
        <div className="rounded-xl border border-[--border] bg-[--surface] p-4">
          <div className="flex items-center gap-2 mb-3"><Layers className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold text-[--foreground]">Color Matching</h3></div>
          <div className="space-y-2">
            {colorComparison.matches.map((m, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-[--surface-soft] p-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-6 w-6 rounded border border-[--border]" style={{ backgroundColor: m.from.hex }} title={m.from.hex} />
                  <span className="text-xs text-[--muted]">→</span>
                  <div className="h-6 w-6 rounded border border-[--border]" style={{ backgroundColor: m.to?.hex || "#fff" }} title={m.to?.hex} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[--foreground]">{m.from.hex} → {m.to?.hex || "N/A"}</span>
                    <span className="text-[--muted]">{m.from.percentage.toFixed(0)}% → {m.to?.percentage.toFixed(0) || 0}%</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px]">
                    <span className="text-[--muted]">ΔE = {m.distance}</span>
                    <span className={m.similarity >= 70 ? "text-red-500" : "text-orange-500"}>{m.similarity}% match</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

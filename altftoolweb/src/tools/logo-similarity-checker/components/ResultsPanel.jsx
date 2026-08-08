"use client";

import { Shield, AlertTriangle } from "lucide-react";

export default function ResultsPanel({ results, onViewChange }) {
  if (!results) return null;

  const { overall } = results;

  const severity = overall >= 80 ? "High" : overall >= 60 ? "Moderate" : overall >= 40 ? "Low" : "Very Low";
  const severityColor = overall >= 80 ? "text-red-500" : overall >= 60 ? "text-orange-500" : overall >= 40 ? "text-yellow-500" : "text-green-500";

  const metrics = [
    { label: "Shape Similarity", value: results.shape, icon: "◇" },
    { label: "Color Similarity", value: results.color, icon: "●" },
    { label: "Icon Similarity", value: results.icon, icon: "◆" },
    { label: "Text/Typography", value: results.text, icon: "T" },
    { label: "Layout Similarity", value: results.layout, icon: "▣" },
    { label: "Edge Similarity", value: results.edge, icon: "⚡" },
    { label: "Geometry", value: results.geometry, icon: "△" },
    { label: "Symmetry", value: results.symmetry, icon: "⇔" },
    { label: "Brightness", value: results.brightness, icon: "☀" },
    { label: "Contrast", value: results.contrast, icon: "◐" },
  ];

  const getColor = (v) => v >= 80 ? "#EF4444" : v >= 60 ? "#F97316" : v >= 40 ? "#F59E0B" : "#22C55E";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p>This tool estimates visual similarity between two uploaded logos. It is intended for design comparison only and should not be used as legal or trademark advice.</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-xl border border-[--border] bg-[--surface] p-6" aria-live="polite" role="status">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle cx="60" cy="60" r="54" fill="none" stroke={getColor(overall)} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${(overall / 100) * 339.292} 339.292`} style={{ transition: "stroke-dasharray 1s ease-out" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color: getColor(overall) }}>{overall}%</span>
            <span className={`text-xs font-medium ${severityColor}`}>{severity}</span>
          </div>
        </div>
        <p className="text-xs text-[--muted]">Overall Visual Similarity</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center gap-3 rounded-lg border border-[--border] bg-[--surface] p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[--surface-soft] text-lg text-primary">{m.icon}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[--foreground]">{m.label}</span>
                <span className="text-xs font-bold" style={{ color: getColor(m.value) }}>{m.value}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-[--surface-soft]">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${m.value}%`, backgroundColor: getColor(m.value) }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[--border] bg-[--surface] p-4">
        <div className="flex items-center gap-2 mb-3"><Shield className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold text-[--foreground]">Design Style Classification</h3></div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs text-[--muted]">Logo A Style</p>
            <p className="text-sm font-bold text-[--foreground]">{results.styleA || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-[--muted]">Logo B Style</p>
            <p className="text-sm font-bold text-[--foreground]">{results.styleB || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

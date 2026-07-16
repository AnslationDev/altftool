"use client";

import { FileImage, Maximize2, Grid, Hash, Clock, Palette, Activity } from "lucide-react";

export default function Stats({ statsA, statsB, processingTime }) {
  if (!statsA && !statsB) return null;

  const metricRow = (label, valA, valB, icon, unit = "") => {
    const Icon = icon;
    return (
      <div className="flex items-center justify-between rounded-lg bg-[--surface-soft] px-3 py-2 text-xs">
        <span className="flex items-center gap-1.5 text-[--muted]"><Icon className="h-3.5 w-3.5 text-primary" />{label}</span>
        <div className="flex gap-4">
          <span className="font-medium text-[--foreground]">A: {valA}{unit}</span>
          <span className="text-[--border-strong]">|</span>
          <span className="font-medium text-[--foreground]">B: {valB}{unit}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-[--foreground]"><Activity className="h-4 w-4 text-primary" />Image Statistics</h3>
      <div className="space-y-1.5">
        {statsA && statsB && metricRow("File Size", statsA.fileSize || "N/A", statsB.fileSize || "N/A", FileImage)}
        {statsA && statsB && metricRow("Dimensions", `${statsA.width}×${statsA.height}`, `${statsB.width}×${statsB.height}`, Maximize2)}
        {statsA && statsB && metricRow("Resolution", `${statsA.width * statsA.height}px`, `${statsB.width * statsB.height}px`, Grid)}
        {statsA && statsB && metricRow("Aspect Ratio", statsA.aspectRatio, statsB.aspectRatio, Hash)}
        {statsA && statsB && metricRow("Transparency", `${(statsA.transparency * 100).toFixed(0)}%`, `${(statsB.transparency * 100).toFixed(0)}%`, Palette)}
        {statsA && statsB && metricRow("Sharpness", `${(statsA.sharpness * 100).toFixed(0)}%`, `${(statsB.sharpness * 100).toFixed(0)}%`, Activity)}
        {processingTime !== undefined && (
          <div className="flex items-center justify-end gap-1.5 rounded-lg px-3 py-1.5 text-xs text-[--muted]">
            <Clock className="h-3.5 w-3.5" />Processing time: {processingTime}ms
          </div>
        )}
      </div>
    </div>
  );
}

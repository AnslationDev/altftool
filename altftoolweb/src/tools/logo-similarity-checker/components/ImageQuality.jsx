"use client";

import { Maximize2, Droplets, Sun, Waves, FileDown } from "lucide-react";

export default function ImageQuality({ statsA, statsB }) {
  if (!statsA && !statsB) return null;

  const QualityCard = ({ stats, label }) => (
    <div>
      <h4 className="mb-2 text-xs font-semibold text-[--foreground]">{label}</h4>
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: Maximize2, label: "Dimensions", value: `${stats.width}×${stats.height}` },
          { icon: Maximize2, label: "Resolution", value: `${stats.width * stats.height}px` },
          { icon: Droplets, label: "Transparency", value: `${(stats.transparency * 100).toFixed(1)}%` },
          { icon: Sun, label: "Sharpness", value: `${(stats.sharpness * 100).toFixed(0)}%` },
          { icon: Waves, label: "Noise", value: `${(stats.noise * 100).toFixed(0)}%` },
          { icon: FileDown, label: "File Size", value: stats.fileSize || "N/A" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-lg bg-[--surface-soft] p-2">
              <div className="flex items-center gap-1 text-[10px] text-[--muted] mb-0.5"><Icon className="h-3 w-3" />{item.label}</div>
              <p className="text-xs font-bold text-[--foreground]">{item.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-[--foreground]"><Maximize2 className="h-4 w-4 text-primary" />Image Quality</h3>
      <div className="grid gap-6 lg:grid-cols-2">
        {statsA && <QualityCard stats={statsA} label="Logo A" />}
        {statsB && <QualityCard stats={statsB} label="Logo B" />}
      </div>
    </div>
  );
}

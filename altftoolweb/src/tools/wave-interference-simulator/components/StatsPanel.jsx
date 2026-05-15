import { useState, useEffect } from "react";

const modeColors = {
  single: "#00e5ff",
  interference: "#ffe066",
  standing: "#ff44aa",
  ripple: "#4d88ff",
};

export default function StatsPanel({ waves, mode }) {
  const [fps, setFps] = useState(60);
  const [resultAmp, setResultAmp] = useState(0);

  useEffect(() => { /* ...same fps and amp derived state... */ }, [waves, mode]);

  const fpsColor = fps >= 55 ? "#4dff4d" : fps >= 30 ? "#ffd93d" : "#ff4d4d";
  const ampIntensity = Math.min(1, resultAmp / 3);
  const ampColor = `rgb(${Math.floor(180 * ampIntensity + 40)}, ${Math.floor(40 * ampIntensity + 10)}, ${Math.floor(255 - 155 * ampIntensity)})`;

  const stats = [
    { label: "FPS", value: fps, color: fpsColor },
    { label: "Resultant Amp", value: resultAmp.toFixed(2), color: ampColor },
    { label: "Mode", value: mode, color: modeColors[mode] || "var(--foreground)" },
    { label: "Waves", value: waves.length, color: "var(--foreground)" },
  ];

  return (
    <div className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
      <h2 className="subheading text-[var(--primary)] mb-3">Live Stats</h2>
      <div className="flex flex-wrap gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex min-w-[120px] flex-1 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2"
          >
            <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
              {stat.label}
            </span>
            <span
              className="text-sm font-mono font-semibold"
              style={{ color: stat.color }}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

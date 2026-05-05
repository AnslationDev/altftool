import { useState } from "react";

export default function LatencyEstimator({ method }) {
  const [latency, setLatency] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const getEstimate = () => {
    const base = {
      get:    { min: 40,  max: 120 },
      post:   { min: 80,  max: 200 },
      put:    { min: 70,  max: 180 },
      patch:  { min: 60,  max: 160 },
      delete: { min: 50,  max: 130 },
    }[method] || { min: 50, max: 150 };
    return Math.floor(Math.random() * (base.max - base.min + 1)) + base.min;
  };

  const getLabel = (ms) => {
    if (ms < 80)  return { text: "Fast",     color: "text-green-500",  bg: "bg-green-100 dark:bg-green-900",   icon: "⚡" };
    if (ms < 150) return { text: "Moderate", color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900", icon: "🟡" };
    return               { text: "Slow",     color: "text-red-500",    bg: "bg-red-100 dark:bg-red-900",       icon: "🔴" };
  };

  const simulate = () => {
    setSimulating(true);
    setLatency(null);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (count >= 3) {
        clearInterval(interval);
        setLatency(getEstimate());
        setSimulating(false);
      }
    }, 300);
  };

  const label = latency ? getLabel(latency) : null;

  return (
    <div className="border border-[var(--border)] rounded-lg p-3 bg-[var(--muted)]">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase">
          Latency Estimator
        </p>
        <button
          onClick={simulate}
          disabled={simulating}
          className="px-3 py-1 text-xs bg-[var(--primary)] text-[var(--primary-foreground)] 
          rounded-lg font-medium hover:opacity-90 transition-opacity 
          disabled:opacity-50 cursor-pointer"
        >
          {simulating ? "Simulating..." : "Simulate"}
        </button>
      </div>

      {latency && label && (
        <div className={`mt-3 flex items-center gap-3 px-3 py-2 rounded-lg ${label.bg}`}>
          <span className="text-lg">{label.icon}</span>
          <div>
            <p className={`text-lg font-bold ${label.color}`}>{latency}ms</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              Estimated Response Time — {label.text}
            </p>
          </div>
        </div>
      )}

      {simulating && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "300ms" }} />
          <p className="text-xs text-[var(--muted-foreground)] ml-1">Measuring latency...</p>
        </div>
      )}
    </div>
  );
}
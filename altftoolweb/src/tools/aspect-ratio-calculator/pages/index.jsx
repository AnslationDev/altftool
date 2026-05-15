"use client";

import { useMemo, useState } from "react";
import { Crop, RotateCcw } from "lucide-react";

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

function Stat({ label, value }) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-2 break-words text-xl font-semibold">{value}</p>
    </div>
  );
}

export default function ToolHome() {
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [targetWidth, setTargetWidth] = useState(1280);

  const result = useMemo(() => {
    const safeWidth = Math.max(1, Number(width) || 1);
    const safeHeight = Math.max(1, Number(height) || 1);
    const divisor = gcd(safeWidth, safeHeight);
    const ratioWidth = safeWidth / divisor;
    const ratioHeight = safeHeight / divisor;
    const nextHeight = Math.round((Number(targetWidth) || 0) * (safeHeight / safeWidth));
    return { ratio: `${ratioWidth}:${ratioHeight}`, decimal: safeWidth / safeHeight, nextHeight };
  }, [height, targetWidth, width]);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Crop className="h-4 w-4" />
            Responsive sizing
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Aspect Ratio Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Calculate simplified ratios and proportional dimensions for thumbnails, banners, and layouts.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[360px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            {[
              ["Original width", width, setWidth],
              ["Original height", height, setHeight],
              ["Target width", targetWidth, setTargetWidth],
            ].map(([label, value, setter]) => (
              <label key={label} className="mb-5 block">
                <span className="text-sm font-semibold">{label}</span>
                <input type="number" min="1" value={value} onChange={(event) => setter(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)]" />
              </label>
            ))}
            <button type="button" onClick={() => { setWidth(1920); setHeight(1080); setTargetWidth(1280); }} className="btn-secondary w-full">
              <RotateCcw className="h-4 w-4" />
              Reset 16:9
            </button>
          </div>

          <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="tool-compact-grid">
              <Stat label="Simplified ratio" value={result.ratio} />
              <Stat label="Decimal" value={result.decimal.toFixed(4)} />
              <Stat label="Target height" value={`${result.nextHeight}px`} />
            </div>
            <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--background)] p-5">
              <div className="mx-auto max-w-full rounded-lg bg-[var(--primary)] shadow-lg" style={{ aspectRatio: `${width} / ${height}`, width: "min(100%, 640px)" }} />
              <p className="mt-4 break-words text-center text-sm font-semibold text-[var(--muted-foreground)]">
                {width} x {height} preview
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

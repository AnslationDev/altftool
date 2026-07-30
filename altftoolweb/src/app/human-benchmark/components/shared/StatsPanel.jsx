"use client";

// ── Smooth bezier path through points ────────────────────────────────────────
function curvePath(pts) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const cx = (pts[i].x + pts[i + 1].x) / 2;
    d += ` C ${cx},${pts[i].y} ${cx},${pts[i + 1].y} ${pts[i + 1].x},${pts[i + 1].y}`;
  }
  return d;
}

// ── Histogram + smooth mountain curve ────────────────────────────────────────
export function StatsChart({ data, xLabel, title, subtitle }) {
  const max = Math.max(...data.map(d => d.value));
  const VW = 560, VH = 148;
  const PAD = { top: 10, right: 14, bottom: 28, left: 14 };
  const W = VW - PAD.left - PAD.right;
  const H = VH - PAD.top - PAD.bottom;
  const n = data.length;
  const barW = W / n;

  const pts = data.map((d, i) => ({
    x: PAD.left + i * barW + barW / 2,
    y: PAD.top + H - (d.value / max) * H,
    label: d.label,
  }));

  const linePath = curvePath(pts);
  const areaPath = pts.length
    ? `${linePath} L ${pts[pts.length - 1].x},${PAD.top + H} L ${pts[0].x},${PAD.top + H} Z`
    : "";

  const step = Math.max(1, Math.ceil(n / 9));

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-3">
      <div>
        <h4 className="text-sm font-black text-[var(--foreground)]">{title || "Population Score Distribution"}</h4>
        {subtitle && <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{subtitle}</p>}
      </div>
      <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full" style={{ height: 160 }} aria-hidden="true">
        <defs>
          <linearGradient id="hb-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {/* Subtle grid */}
        {[0.25, 0.5, 0.75, 1].map(f => (
          <line key={f} x1={PAD.left} y1={PAD.top + H * (1 - f)}
            x2={VW - PAD.right} y2={PAD.top + H * (1 - f)}
            stroke="var(--card-border)" strokeWidth="0.6" strokeDasharray="4 4" />
        ))}
        {/* Bars */}
        {data.map((d, i) => {
          const bh = (d.value / max) * H;
          return (
            <rect key={i} x={PAD.left + i * barW + 1.5} y={PAD.top + H - bh}
              width={Math.max(barW - 3, 2)} height={bh}
              fill="var(--primary)" opacity="0.15" rx="2" />
          );
        })}
        {/* Area under curve */}
        <path d={areaPath} fill="url(#hb-grad)" />
        {/* Smooth curve */}
        <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="2.2" strokeLinejoin="round" />
        {/* Dots on curve */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.8" fill="var(--primary)" />
        ))}
        {/* X axis line */}
        <line x1={PAD.left} y1={PAD.top + H} x2={VW - PAD.right} y2={PAD.top + H}
          stroke="var(--card-border)" strokeWidth="1" />
        {/* X labels */}
        {pts.map((p, i) => i % step === 0 && (
          <text key={i} x={p.x} y={VH - 4} textAnchor="middle"
            fontSize="8.5" fill="var(--muted-foreground)" fontFamily="monospace">
            {p.label}
          </text>
        ))}
      </svg>
      <p className="text-[10px] text-[var(--muted-foreground)]">
        X-axis: {xLabel} &nbsp;·&nbsp; Example distribution curve, not aggregated user data
      </p>
    </div>
  );
}

// ── About this test card ──────────────────────────────────────────────────────
export function AboutCard({ what, average, facts }) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-4">
      <h4 className="text-sm font-black text-[var(--foreground)]">About This Test</h4>
      <p className="text-sm text-[var(--secondary-foreground)] leading-relaxed">{what}</p>
      <div className="rounded-xl border border-[var(--primary)]/25 bg-[var(--primary)]/5 px-4 py-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
          Population Average
        </div>
        <div className="text-sm font-black text-[var(--primary)]">{average}</div>
      </div>
      <ul className="space-y-2">
        {facts.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-[var(--secondary-foreground)] leading-relaxed">
            <span className="shrink-0 mt-0.5 flex h-4 w-4 items-center justify-center rounded bg-[var(--primary)]/10 text-[9px] font-black text-[var(--primary)]">
              {i + 1}
            </span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

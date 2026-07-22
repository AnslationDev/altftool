"use client";

export default function AreaModelViz({ numerator, denominator, color = "var(--primary)", label }) {
  if (denominator <= 0) return null;

  const cols = Math.ceil(Math.sqrt(denominator));
  const rows = Math.ceil(denominator / cols);
  const cellSize = 48;
  const gap = 4;
  const totalWidth = cols * (cellSize + gap) - gap;
  const totalHeight = rows * (cellSize + gap) - gap;

  const cells = [];
  for (let i = 0; i < denominator; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * (cellSize + gap);
    const y = row * (cellSize + gap);
    const filled = i < Math.abs(numerator);

    cells.push(
      <rect
        key={i}
        x={x}
        y={y}
        width={cellSize}
        height={cellSize}
        rx={6}
        fill={filled ? color : "var(--section-highlight)"}
        stroke="var(--card)"
        strokeWidth="2"
        opacity={filled ? 1 : 0.4}
        style={{ transition: "all 0.3s ease" }}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {label && <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>}
      <svg width={totalWidth} height={totalHeight} viewBox={`0 0 ${totalWidth} ${totalHeight}`}>
        {cells}
      </svg>
      <p className="text-lg font-extrabold text-[var(--primary)]">
        {numerator}/{denominator} = {(Math.abs(numerator) / denominator * 100).toFixed(1)}%
      </p>
    </div>
  );
}

"use client";

export default function NumberLineViz({ numerator, denominator, max = 2, color = "var(--primary)", label }) {
  if (denominator <= 0) return null;

  const value = numerator / denominator;
  const width = 500;
  const height = 80;
  const padding = 40;
  const lineY = 40;
  const lineWidth = width - padding * 2;

  const fraction = Math.min(Math.abs(value), max);
  const position = padding + (fraction / max) * lineWidth;

  const ticks = [];
  const totalTicks = denominator * Math.ceil(max);
  for (let i = 0; i <= totalTicks; i++) {
    const x = padding + (i / totalTicks) * lineWidth * (max / (totalTicks / denominator));
    const isWhole = i % denominator === 0;
    const tickHeight = isWhole ? 16 : 8;
    ticks.push(
      <g key={i}>
        <line
          x1={x}
          y1={lineY - tickHeight / 2}
          x2={x}
          y2={lineY + tickHeight / 2}
          stroke="var(--muted-foreground)"
          strokeWidth={isWhole ? 2 : 1}
          opacity={isWhole ? 0.8 : 0.3}
        />
        {isWhole && (
          <text
            x={x}
            y={lineY + 28}
            textAnchor="middle"
            fontSize="10"
            fill="var(--muted-foreground)"
            fontWeight="bold"
          >
            {i / denominator}
          </text>
        )}
      </g>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>}
      <svg width={width} height={height + 20} viewBox={`0 0 ${width} ${height + 20}`} className="max-w-full">
        {/* Line */}
        <line
          x1={padding}
          y1={lineY}
          x2={width - padding}
          y2={lineY}
          stroke="var(--border)"
          strokeWidth="2"
        />

        {/* Ticks */}
        {ticks}

        {/* Fraction marker */}
        <circle
          cx={Math.min(position, width - padding)}
          cy={lineY}
          r={8}
          fill={color}
          stroke="white"
          strokeWidth="3"
          style={{ transition: "cx 0.3s ease" }}
        />

        {/* Label */}
        <text
          x={Math.min(position, width - padding)}
          y={lineY - 16}
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill={color}
        >
          {numerator}/{denominator}
        </text>
      </svg>
    </div>
  );
}

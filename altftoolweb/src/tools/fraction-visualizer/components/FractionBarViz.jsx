"use client";

export default function FractionBarViz({ numerator, denominator, width = 400, height = 48, color = "var(--primary)", label }) {
  if (denominator <= 0) return null;

  const fraction = Math.min(Math.abs(numerator) / denominator, 1);
  const segWidth = width / denominator;
  const filledCount = Math.abs(numerator);

  return (
    <div className="flex flex-col gap-2">
      {label && <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>}
      <svg width={width} height={height + 20} viewBox={`0 0 ${width} ${height + 20}`} className="max-w-full">
        {Array.from({ length: denominator }, (_, i) => {
          const x = i * segWidth;
          const filled = i < filledCount;
          return (
            <g key={i}>
              <rect
                x={x}
                y={5}
                width={segWidth - 1}
                height={height}
                rx={i === 0 ? 6 : i === denominator - 1 ? 6 : 0}
                fill={filled ? color : "var(--section-highlight)"}
                stroke="var(--card)"
                strokeWidth="2"
                opacity={filled ? 1 : 0.4}
                style={{ transition: "all 0.3s ease" }}
              />
              {segWidth > 20 && (
                <text
                  x={x + segWidth / 2}
                  y={height / 2 + 12}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill={filled ? "white" : "var(--muted-foreground)"}
                >
                  {i + 1}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <p className="text-center text-lg font-extrabold text-[var(--primary)]">
        {numerator}/{denominator} = {(fraction * 100).toFixed(1)}%
      </p>
    </div>
  );
}

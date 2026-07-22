"use client";

export default function FractionBarViz({ numerator, denominator, width = 300, height = 36, color = "var(--primary)" }) {
  if (!denominator || denominator <= 0) return null;

  const fraction = Math.min(Math.abs(numerator) / denominator, 1);
  const segWidth = width / denominator;
  const filledCount = Math.min(Math.abs(numerator), denominator);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={width} height={height + 4} viewBox={`0 0 ${width} ${height + 4}`} className="max-w-full">
        {Array.from({ length: denominator }, (_, i) => {
          const x = i * segWidth;
          const filled = i < filledCount;
          const isFirst = i === 0;
          const isLast = i === denominator - 1;
          const radius = isFirst && isLast ? 6 : isFirst ? "6 0 0 6" : isLast ? "0 6 6 0" : 0;
          return (
            <rect
              key={i}
              x={x}
              y={2}
              width={Math.max(segWidth - 1, 1)}
              height={height}
              rx={typeof radius === "string" ? 0 : radius}
              fill={filled ? color : "var(--section-highlight)"}
              stroke="var(--card)"
              strokeWidth="1.5"
              opacity={filled ? 1 : 0.35}
              style={{ transition: "all 0.3s ease" }}
            />
          );
        })}
      </svg>
      <p className="text-sm font-bold text-[var(--primary)]">
        {numerator}/{denominator} = {(fraction * 100).toFixed(1)}%
      </p>
    </div>
  );
}

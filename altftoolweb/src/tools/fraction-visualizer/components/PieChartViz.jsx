"use client";

export default function PieChartViz({ numerator, denominator, size = 200, color = "var(--primary)", label }) {
  if (denominator <= 0) return null;

  const radius = (size - 20) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const fraction = Math.min(Math.abs(numerator) / denominator, 1);
  const angle = fraction * 2 * Math.PI;
  const isNegative = numerator < 0;

  const slices = [];
  const sliceAngle = (2 * Math.PI) / denominator;

  for (let i = 0; i < denominator; i++) {
    const startAngle = i * sliceAngle - Math.PI / 2;
    const endAngle = (i + 1) * sliceAngle - Math.PI / 2;
    const midAngle = (startAngle + endAngle) / 2;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const filled = i < Math.abs(numerator);

    slices.push(
      <path
        key={i}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
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
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices}
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="var(--border)" strokeWidth="1" />
      </svg>
      {label && (
        <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>
      )}
      <p className="text-lg font-extrabold text-[var(--primary)]">
        {numerator}/{denominator}
      </p>
    </div>
  );
}

import { SIGNALS, computeAos, tierOf } from "@altftool/core/ideas";

/*
 * The brand device. Six arc segments around a circle, one per signal, each
 * filled in proportion to that signal's score, with the composite AOS in the
 * centre. Two ideas with different signal shapes are visibly different before
 * you read a single word.
 *
 * Rendered as plain SVG with no client JS: it appears in grids of 24+ cards,
 * so it has to be free.
 */

const SPEC = {
  sm: { size: 46, stroke: 3, gap: 7, value: "0.9375rem" },
  md: { size: 72, stroke: 5, gap: 6, value: "1.375rem" },
  lg: { size: 168, stroke: 10, gap: 5, value: "3rem" },
};

export default function ScoreRing({ scores, size = "md", aos, showLabel }) {
  const spec = SPEC[size] ?? SPEC.md;
  const value = aos ?? computeAos(scores);
  const tier = tierOf(value);

  const radius = (spec.size - spec.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const slotDegrees = 360 / SIGNALS.length - spec.gap;
  const slotLength = circumference * (slotDegrees / 360);
  const centre = spec.size / 2;

  const withLabel = showLabel ?? size !== "sm";

  return (
    <div
      className="afi-ring"
      style={{ width: spec.size, height: spec.size }}
      role="img"
      aria-label={`Opportunity score ${value} out of 100, tier ${tier.name}. ${SIGNALS.map(
        (s) => `${s.label} ${scores?.[s.key] ?? 0}`,
      ).join(", ")}.`}
    >
      <svg width={spec.size} height={spec.size} viewBox={`0 0 ${spec.size} ${spec.size}`} aria-hidden="true">
        {SIGNALS.map((signal, i) => {
          const pct = Math.max(0, Math.min(100, scores?.[signal.key] ?? 0)) / 100;
          const rotation = i * (360 / SIGNALS.length) + spec.gap / 2;
          return (
            <g key={signal.key} transform={`rotate(${rotation} ${centre} ${centre})`}>
              <circle
                className="afi-ring__track"
                cx={centre}
                cy={centre}
                r={radius}
                fill="none"
                strokeWidth={spec.stroke}
                strokeLinecap="round"
                strokeDasharray={`${slotLength} ${circumference - slotLength}`}
              />
              <circle
                cx={centre}
                cy={centre}
                r={radius}
                fill="none"
                stroke={`var(${signal.cssVar})`}
                strokeWidth={spec.stroke}
                strokeLinecap="round"
                strokeDasharray={`${slotLength * pct} ${circumference}`}
              />
            </g>
          );
        })}
      </svg>
      <span className="afi-ring__inner">
        <span className="afi-ring__value" style={{ fontSize: spec.value, color: `var(${tier.cssVar})` }}>
          {value}
        </span>
        {withLabel ? <span className="afi-ring__label">AOS</span> : null}
      </span>
    </div>
  );
}

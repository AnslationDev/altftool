import { impactTier } from "@altftool/core/backlinks";

const TIER_VAR = { s: "--bl-tier-s", a: "--bl-tier-a", b: "--bl-tier-b", c: "--bl-tier-c" };

/**
 * Impact 0-100 as a number inside a short arc.
 *
 * Pure SVG with no client JS: this renders 30 times per listing page, and an
 * animated or measured component at that count is a real cost for no gain.
 * The number is always present, so the score is never carried by colour alone.
 */
export default function ImpactBadge({ impact, size = 48 }) {
  const tier = impactTier(impact);
  const hue = `var(${TIER_VAR[tier.id]})`;
  const stroke = size >= 44 ? 3.5 : 3;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const filled = (Math.max(0, Math.min(100, impact)) / 100) * circumference;

  return (
    <span
      className="bl-impact"
      style={{ width: size, height: size }}
      title={`${tier.label} — impact ${impact} of 100`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          className="bl-impact__track"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={hue}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
        />
      </svg>
      <span className="bl-impact__value" style={{ color: hue }}>
        {impact}
      </span>
      <span className="sr-only">
        {tier.label}, impact score {impact} out of 100
      </span>
    </span>
  );
}

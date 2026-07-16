import { useEffect, useState } from "react";

function ScoreRing({ score, label, size = 120, stroke = 6 }) {
  const [anim, setAnim] = useState(0);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (anim / 100) * circ;

  useEffect(() => {
    setAnim(0);
    const id = requestAnimationFrame(() => setAnim(score));
  }, [score]);

  const color = score >= 80 ? "#14B8A6" : score >= 60 ? "#22D3EE" : score >= 40 ? "#FBBF24" : "#EF4444";

  return (
    <div className="ircp-score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="ircp-score-value">{Math.round(anim)}</div>
      <div className="ircp-score-label">{label}</div>
    </div>
  );
}

export default function QualityScore({ qualityA, qualityB }) {
  if (!qualityA && !qualityB) return null;

  const renderScore = (title, q) => (
    <div className="ircp-score-group">
      <h4 className="ircp-score-title">{title}</h4>
      <div className="ircp-score-rings">
        <ScoreRing score={q.overall} label="Overall" size={140} />
        <ScoreRing score={q.resolution} label="Resolution" />
        <ScoreRing score={q.sharpness} label="Sharpness" />
        <ScoreRing score={q.compression} label="Compression" />
        <ScoreRing score={q.noise} label="Noise" />
        <ScoreRing score={q.colorQuality} label="Color" />
        <ScoreRing score={q.brightness} label="Brightness" />
        <ScoreRing score={q.contrast} label="Contrast" />
        <ScoreRing score={q.dynamicRange} label="Dynamic Range" />
      </div>
    </div>
  );

  return (
    <div className="ircp-card">
      <h3 className="ircp-card-title">Quality Score</h3>
      {qualityA && renderScore("Image A", qualityA)}
      {qualityB && renderScore("Image B", qualityB)}
      {qualityA && qualityB && (
        <div className="ircp-score-comparison">
          <span className={`ircp-winner ${qualityA.overall >= qualityB.overall ? "ircp-winner-yes" : ""}`}>
            Image A leads by {Math.abs(qualityA.overall - qualityB.overall)} pts
          </span>
          <span className={`ircp-winner ${qualityB.overall >= qualityA.overall ? "ircp-winner-yes" : ""}`}>
            Image B leads by {Math.abs(qualityB.overall - qualityA.overall)} pts
          </span>
        </div>
      )}
    </div>
  );
}

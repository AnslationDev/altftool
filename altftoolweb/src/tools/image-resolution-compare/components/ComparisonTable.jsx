const METRICS = [
  { key: "width", label: "Width", fmt: (v) => `${v} px` },
  { key: "height", label: "Height", fmt: (v) => `${v} px` },
  { key: "megapixels", label: "Resolution", fmt: (v) => `${v} MP` },
  { key: "aspectRatio", label: "Aspect Ratio", fmt: (v) => v },
  { key: "orientation", label: "Orientation", fmt: (v) => v },
  { key: "fileSize", label: "File Size", fmt: (v) => v ? `${(v / 1024).toFixed(0)} KB` : "N/A" },
  { key: "compressionRatio", label: "Compression Ratio", fmt: (v) => `${v}:1` },
  { key: "bitDepth", label: "Bit Depth", fmt: (v) => `${v}-bit` },
  { key: "colorSpace", label: "Color Space", fmt: (v) => v },
  { key: "colorProfile", label: "Color Profile", fmt: (v) => v },
  { key: "dpi", label: "DPI", fmt: (v) => v },
  { key: "ppi", label: "PPI", fmt: (v) => v },
  { key: "transparency", label: "Transparency", fmt: (v) => `${v.toFixed(1)}%` },
  { key: "sharpness", label: "Sharpness", fmt: (v) => `${v.toFixed(1)}%` },
  { key: "noise", label: "Noise Level", fmt: (v) => `${v.toFixed(1)}%` },
  { key: "brightness", label: "Brightness", fmt: (v) => `${v.toFixed(1)}%` },
  { key: "contrast", label: "Contrast", fmt: (v) => `${v.toFixed(1)}%` },
  { key: "saturation", label: "Saturation", fmt: (v) => `${v.toFixed(1)}%` },
  { key: "dynamicRange", label: "Dynamic Range", fmt: (v) => `${v.toFixed(1)}%` },
  { key: "edgeDensity", label: "Edge Density", fmt: (v) => `${v.toFixed(1)}%` },
  { key: "blurScore", label: "Blur Score", fmt: (v) => `${v.toFixed(1)}%` },
];

function diffCell(a, b) {
  if (a == null || b == null || typeof a !== "number") return null;
  if (a === 0) return null;
  const pct = ((b - a) / a) * 100;
  return (
    <span className={`ircp-diff ${pct >= 0 ? "ircp-diff-up" : "ircp-diff-down"}`}>
      {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
    </span>
  );
}

export default function ComparisonTable({ analysisA, analysisB }) {
  if (!analysisA || !analysisB) return null;
  return (
    <div className="ircp-card">
      <h3 className="ircp-card-title">Comparison Table</h3>
      <div className="ircp-table-wrap">
        <table className="ircp-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Image A</th>
              <th>Image B</th>
              <th>Δ</th>
            </tr>
          </thead>
          <tbody>
            {METRICS.map((m) => (
              <tr key={m.key}>
                <td className="ircp-table-label">{m.label}</td>
                <td>{analysisA[m.key] != null ? m.fmt(analysisA[m.key]) : "—"}</td>
                <td>{analysisB[m.key] != null ? m.fmt(analysisB[m.key]) : "—"}</td>
                <td>{diffCell(analysisA[m.key], analysisB[m.key])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

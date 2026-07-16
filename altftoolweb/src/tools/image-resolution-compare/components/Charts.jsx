function Bar({ value, max, color, index }) {
  const pct = (value / max) * 100;
  return (
    <div className="ircp-chart-bar-col">
      <div className="ircp-chart-bar-track">
        <div
          className="ircp-chart-bar-fill"
          style={{ height: `${pct}%`, backgroundColor: color, transitionDelay: `${index * 60}ms` }}
        />
      </div>
      <div className="ircp-chart-bar-label">{value.toFixed(1)}</div>
    </div>
  );
}

function BarChart({ title, a, b, metric, colorA = "#14B8A6", colorB = "#22D3EE" }) {
  const max = Math.max(a?.[metric] || 0, b?.[metric] || 0, 1);
  return (
    <div className="ircp-chart-item">
      <div className="ircp-chart-title">{title}</div>
      <div className="ircp-chart-bars">
        <div className="ircp-chart-bar-set">
          <span className="ircp-chart-bar-label-top">A</span>
          <Bar value={a?.[metric] || 0} max={max} color={colorA} index={0} />
          <Bar value={b?.[metric] || 0} max={max} color={colorB} index={1} />
          <span className="ircp-chart-bar-label-top">B</span>
        </div>
      </div>
    </div>
  );
}

function HistogramSVG({ hist, color, width = 256, height = 80 }) {
  if (!hist) return null;
  const channels = [
    { data: hist.r, color: "#EF4444" },
    { data: hist.g, dataKey: "g", color: "#22C55E" },
    { data: hist.b, color: "#3B82F6" },
  ];

  return (
    <div className="ircp-chart-hist">
      {channels.map((ch) => (
        <svg key={ch.color} width={width} height={height} className="ircp-chart-hist-svg">
          {ch.data.map((v, i) => (
            <rect key={i} x={i} y={height - v * height} width={1} height={v * height} fill={ch.color} opacity={0.6} />
          ))}
        </svg>
      ))}
    </div>
  );
}

export default function Charts({ analysisA, analysisB }) {
  if (!analysisA || !analysisB) return null;

  const metrics = [
    { key: "sharpness", title: "Sharpness", unit: "%" },
    { key: "brightness", title: "Brightness", unit: "%" },
    { key: "contrast", title: "Contrast", unit: "%" },
    { key: "saturation", title: "Saturation", unit: "%" },
    { key: "noise", title: "Noise Level", unit: "%" },
    { key: "dynamicRange", title: "Dynamic Range", unit: "%" },
    { key: "megapixels", title: "Resolution", unit: "MP" },
    { key: "edgeDensity", title: "Edge Density", unit: "%" },
  ];

  return (
    <div className="ircp-card">
      <h3 className="ircp-card-title">Charts</h3>
      <div className="ircp-charts-grid">
        {metrics.map((m) => (
          <BarChart key={m.key} title={m.title} a={analysisA} b={analysisB} metric={m.key} />
        ))}
      </div>
      <div className="ircp-chart-histograms">
        <div className="ircp-chart-item">
          <div className="ircp-chart-title">Histogram — Image A</div>
          <HistogramSVG hist={analysisA.histogram} color="#14B8A6" />
        </div>
        <div className="ircp-chart-item">
          <div className="ircp-chart-title">Histogram — Image B</div>
          <HistogramSVG hist={analysisB.histogram} color="#22D3EE" />
        </div>
      </div>
    </div>
  );
}

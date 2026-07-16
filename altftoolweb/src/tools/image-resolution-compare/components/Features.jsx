const FEATURES = [
  {
    icon: "scan",
    title: "Image Analysis",
    desc: "Dimensions, resolution, megapixels, aspect ratio, orientation, DPI, PPI, bit depth, color space, compression ratio, transparency, and EXIF metadata.",
  },
  {
    icon: "activity",
    title: "Quality Analysis",
    desc: "Sharpness, noise level, brightness, contrast, saturation, dynamic range, edge density, and blur detection — computed pixel-by-pixel.",
  },
  {
    icon: "columns",
    title: "Side-by-Side Comparison",
    desc: "21-point comparison table with metrics, deltas (%), and color-coded differences.",
  },
  {
    icon: "eye",
    title: "Visual Comparison",
    desc: "Side-by-side, split view, overlay (50% opacity), pixel zoom (1–20x with pan), and difference heatmap.",
  },
  {
    icon: "award",
    title: "Quality Score (0–100)",
    desc: "Weighted quality score computed from resolution, sharpness, compression, noise, color, brightness, contrast, and dynamic range.",
  },
  {
    icon: "bar-chart",
    title: "Charts & Histograms",
    desc: "Bar charts for all metrics plus per-channel RGB histograms for both images.",
  },
  {
    icon: "share-2",
    title: "Social Media Check",
    desc: "Check compatibility with 12 social media platforms including Instagram, Facebook, YouTube, LinkedIn, Twitter/X, and more.",
  },
  {
    icon: "file-text",
    title: "Export Reports",
    desc: "Export to PDF, CSV, JSON, or PNG preview. Shareable comparison reports.",
  },
  {
    icon: "refresh-cw",
    title: "Live Analysis",
    desc: "All analysis runs in real-time in your browser. Nothing is uploaded — 100% private.",
  },
  {
    icon: "settings",
    title: "Customizable Settings",
    desc: "Adjust DPI target, precision level, histogram bins, and toggle EXIF display.",
  },
  {
    icon: "thumbs-up",
    title: "Smart Recommendations",
    desc: "Actionable recommendations for sharpening, exposure, noise reduction, and best use cases.",
  },
  {
    icon: "image",
    title: "Broad Format Support",
    desc: "PNG, JPG, WEBP, GIF, BMP, TIFF, HEIC, AVIF, and SVG.",
  },
];

const ICONS = {
  scan: <><path d="M3 7V5a2 2 0 0 1 2-2h2M3 17v2a2 2 0 0 0 2 2h2M17 3h2a2 2 0 0 1 2 2v2M17 21h2a2 2 0 0 0 2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="12" y1="7" x2="12" y2="17"/></>,
  activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
  columns: <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18"/>,
  eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  award: <><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></>,
  "bar-chart": <><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></>,
  "share-2": <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
  "file-text": <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
  "refresh-cw": <><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  "thumbs-up": <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>,
};

export default function Features() {
  return (
    <div className="ircp-card">
      <h3 className="ircp-card-title">Features</h3>
      <div className="ircp-features-grid">
        {FEATURES.map((f) => (
          <div key={f.title} className="ircp-feature-card">
            <div className="ircp-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {ICONS[f.icon]}
              </svg>
            </div>
            <div>
              <div className="ircp-feature-title">{f.title}</div>
              <div className="ircp-feature-desc">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { exportPDF, exportCSV, exportJSON } from "../utils/exporter";

export default function ReportGenerator({ analysisA, analysisB, qualityA, qualityB, recommendationsA, recommendationsB, imgAUrl, imgBUrl }) {
  const hasData = analysisA && analysisB;

  if (!hasData) return null;

  return (
    <div className="ircp-card">
      <h3 className="ircp-card-title">Export Report</h3>
      <div className="ircp-export-grid">
        <button className="ircp-btn-export" onClick={() => exportPDF(analysisA, analysisB, qualityA, qualityB, recommendationsA, recommendationsB)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Export PDF
        </button>
        <button className="ircp-btn-export" onClick={() => exportCSV(analysisA, analysisB)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export CSV
        </button>
        <button className="ircp-btn-export" onClick={() => exportJSON(analysisA, analysisB, qualityA, qualityB)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
          </svg>
          Export JSON
        </button>
        <button className="ircp-btn-export" onClick={() => {
          const canvas = document.createElement("canvas");
          canvas.width = 1200; canvas.height = 630;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#0F172A"; ctx.fillRect(0, 0, 1200, 630);
          ctx.fillStyle = "#14B8A6"; ctx.font = "bold 48px monospace";
          ctx.fillText("Image Comparison", 60, 80);
          ctx.fillStyle = "#fff"; ctx.font = "24px monospace";
          ctx.fillText(`A: ${analysisA.width}×${analysisA.height} | B: ${analysisB.width}×${analysisB.height}`, 60, 140);
          ctx.fillText(`Quality: A=${qualityA?.overall || "?"} | B=${qualityB?.overall || "?"}`, 60, 180);
          const stats = [
            `Sharp: A=${analysisA.sharpness.toFixed(0)}% B=${analysisB.sharpness.toFixed(0)}%`,
            `Noise: A=${analysisA.noise.toFixed(0)}% B=${analysisB.noise.toFixed(0)}%`,
            `Bright: A=${analysisA.brightness.toFixed(0)}% B=${analysisB.brightness.toFixed(0)}%`,
            `Contrast: A=${analysisA.contrast.toFixed(0)}% B=${analysisB.contrast.toFixed(0)}%`,
          ];
          ctx.font = "18px monospace";
          stats.forEach((s, i) => ctx.fillText(s, 60, 230 + i * 30));
          ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = "14px monospace";
          const d = new Date();
          ctx.fillText(`Generated: ${d.toLocaleDateString()}`, 60, 560);
          const link = document.createElement("a");
          link.download = "image-comparison-preview.png";
          link.href = canvas.toDataURL();
          link.click();
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
          </svg>
          Export PNG Preview
        </button>
      </div>
    </div>
  );
}

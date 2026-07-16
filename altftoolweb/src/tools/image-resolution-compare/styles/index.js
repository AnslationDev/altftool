export const toolStyles = `import { useState, useCallback } from "react";
import UploadZone from "../components/UploadZone";
import ComparisonTable from "../components/ComparisonTable";
import Visualization from "../components/Visualization";
import QualityScore from "../components/QualityScore";
import Recommendations from "../components/Recommendations";
import Charts from "../components/Charts";
import SocialMediaCheck from "../components/SocialMediaCheck";
import ReportGenerator from "../components/ReportGenerator";
import Settings from "../components/Settings";
import Features from "../components/Features";
import { loadImage, analyzeImageData, computeQualityScore } from "../utils/imageAnalysis";
import "../styles/index.css";

const TABS = [
  { id: "compare", label: "Compare", icon: "columns" },
  { id: "visual", label: "Visual", icon: "eye" },
  { id: "charts", label: "Charts", icon: "bar-chart" },
  { id: "social", label: "Social", icon: "share-2" },
  { id: "recommend", label: "Recommend", icon: "thumbs-up" },
  { id: "export", label: "Export", icon: "file-text" },
  { id: "features", label: "Features", icon: "info" },
];

const TAB_ICONS = {
  columns: <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18"/>,
  eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  "bar-chart": <><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1
              )}
              {activeTab === "social" && (
                <SocialMediaCheck analysisA={analysisA} analysisB={analysisB} />
              )}
              {activeTab === "recommend" && (
                <Recommendations analysisA={analysisA} analysisB={analysisB} />
              )}
              {activeTab === "export" && (
                <ReportGenerator analysisA={analysisA} analysisB={analysisB} qualityA={qualityA} qualityB={qualityB}
                  imgAUrl={imgA?.url} imgBUrl={imgB?.url} />
              )}
              {activeTab === "features" && <Features />}
            </div>

            <Settings onSettings={setSettings} />
          </>
        )}

        {!hasBoth && !loading.a && !loading.b && (
          <div className="ircp-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <h2>Upload two images to compare</h2>
            <p>Supports PNG, JPG, WEBP, GIF, BMP, TIFF, HEIC, AVIF, SVG — all analysis is done locally in your browser</p>
          </div>
        )}

        <div className="ircp-privacy-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Privacy-first — all image analysis runs locally in your browser. Nothing is uploaded.
        </div>
      </div>
  );
}
`;

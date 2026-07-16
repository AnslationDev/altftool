import { useState, useCallback } from "react";
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
import { Sparkles, ArrowRightLeft } from "lucide-react";

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
  columns: <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18" />,
  eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
  "bar-chart": <><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></>,
  "share-2": <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></>,
  "thumbs-up": <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />,
  "file-text": <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>,
  info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
};

export default function ImageResolutionComparePro() {
  const [imgA, setImgA] = useState(null);
  const [imgB, setImgB] = useState(null);
  const [analysisA, setAnalysisA] = useState(null);
  const [analysisB, setAnalysisB] = useState(null);
  const [qualityA, setQualityA] = useState(null);
  const [qualityB, setQualityB] = useState(null);
  const [loading, setLoading] = useState({ a: false, b: false });
  const [activeTab, setActiveTab] = useState("compare");
  const [settings, setSettings] = useState({ dpi: 72, highPrecision: true, showExif: true, autoCompare: true, maxHistogramBins: 256 });

  const handleUpload = useCallback(async (id, file) => {
    if (!file) return;
    setLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const { img, url } = await loadImage(file);
      const analysis = analyzeImageData(img, file);
      const quality = computeQualityScore(analysis);
      if (id === "a") {
        if (imgA?.url) URL.revokeObjectURL(imgA.url);
        setImgA({ img, url, file });
        setAnalysisA(analysis);
        setQualityA(quality);
      } else {
        if (imgB?.url) URL.revokeObjectURL(imgB.url);
        setImgB({ img, url, file });
        setAnalysisB(analysis);
        setQualityB(quality);
      }
    } catch { }
    setLoading((prev) => ({ ...prev, [id]: false }));
  }, [imgA, imgB]);

  const handleClear = useCallback((id) => {
    if (id === "a") {
      if (imgA?.url) URL.revokeObjectURL(imgA.url);
      setImgA(null); setAnalysisA(null); setQualityA(null);
    } else {
      if (imgB?.url) URL.revokeObjectURL(imgB.url);
      setImgB(null); setAnalysisB(null); setQualityB(null);
    }
  }, [imgA, imgB]);

  const hasBoth = imgA && imgB;

  return (
    <div className="min-h-screen bg-(--page) py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Core Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-(--border) pb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-500 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4" /> Image Analysis Suite
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-400">
              Image Resolution Compare
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Compare image resolution, quality, sharpness, DPI, and compression like a professional
            </p>
          </div>
        </div>

        {/* Upload Section - Side by Side Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          
          <div className="bg-(--surface) border border-(--border) p-6 rounded-2xl shadow-lg relative overflow-hidden backdrop-blur-md bg-opacity-80">
            {loading.a && <div className="absolute inset-0 z-10 bg-(--surface)/80 backdrop-blur-sm flex items-center justify-center font-bold text-teal-500">Analyzing Image A...</div>}
            <UploadZone id="a" label="Image A" imageData={imgA} onUpload={(f) => handleUpload("a", f)} onClear={() => handleClear("a")} />
          </div>

          <div className="hidden md:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white dark:bg-slate-900 rounded-full border-4 border-slate-100 dark:border-slate-800 shadow-xl items-center justify-center">
            <span className="font-extrabold text-teal-500 text-sm italic">VS</span>
          </div>

          <div className="bg-(--surface) border border-(--border) p-6 rounded-2xl shadow-lg relative overflow-hidden backdrop-blur-md bg-opacity-80">
            {loading.b && <div className="absolute inset-0 z-10 bg-(--surface)/80 backdrop-blur-sm flex items-center justify-center font-bold text-cyan-500">Analyzing Image B...</div>}
            <UploadZone id="b" label="Image B" imageData={imgB} onUpload={(f) => handleUpload("b", f)} onClear={() => handleClear("b")} />
          </div>

        </div>

        {hasBoth && (
          <div className="space-y-6 animate-fade-in">
            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-(--border) hide-scrollbar">
              {TABS.map((t) => (
                <button 
                  key={t.id} 
                  className={`whitespace-nowrap flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 cursor-pointer ${
                    activeTab === t.id
                      ? "border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-900/10"
                      : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                  onClick={() => setActiveTab(t.id)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {TAB_ICONS[t.icon]}
                  </svg>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-(--surface) border border-(--border) p-6 rounded-2xl shadow-sm min-h-[400px]">
              {activeTab === "compare" && (
                <div className="space-y-8">
                  <ComparisonTable analysisA={analysisA} analysisB={analysisB} />
                  <QualityScore qualityA={qualityA} qualityB={qualityB} />
                </div>
              )}
              {activeTab === "visual" && (
                <Visualization imgA={imgA?.img} imgB={imgB?.img} analysisA={analysisA} analysisB={analysisB} />
              )}
              {activeTab === "charts" && (
                <Charts analysisA={analysisA} analysisB={analysisB} />
              )}
              {activeTab === "social" && (
                <SocialMediaCheck analysisA={analysisA} analysisB={analysisB} />
              )}
              {activeTab === "recommend" && (
                <Recommendations analysisA={analysisA} analysisB={analysisB} />
              )}
              {activeTab === "export" && (
                <ReportGenerator analysisA={analysisA} analysisB={analysisB} qualityA={qualityA} qualityB={qualityB} imgAUrl={imgA?.url} imgBUrl={imgB?.url} />
              )}
              {activeTab === "features" && <Features />}
            </div>

            {/* Settings block can be below */}
            <div className="mt-8">
              <Settings onSettings={setSettings} />
            </div>
          </div>
        )}

        {!hasBoth && !loading.a && !loading.b && (
          <div className="bg-(--surface) border border-dashed border-(--border) rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/20 text-teal-500 rounded-full flex items-center justify-center mb-4">
              <ArrowRightLeft className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-(--foreground) mb-2">Upload two images to compare</h2>
            <p className="text-sm text-slate-500 max-w-md">Supports PNG, JPG, WEBP, GIF, BMP, TIFF, HEIC, AVIF, SVG — all analysis is done locally in your browser.</p>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 mt-8 opacity-70 hover:opacity-100 transition-opacity">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Privacy-first — all image analysis runs locally in your browser. Nothing is uploaded.
        </div>
      </div>
    </div>
  );
}

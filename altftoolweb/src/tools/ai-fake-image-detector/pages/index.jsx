"use client";

import { ShieldCheck, AlertTriangle, Loader2, ShieldOff } from "lucide-react";
import { useImageDetection } from "../hooks/useImageDetection";
import ImageUploader from "../components/ImageUploader";
import ImagePreview from "../components/ImagePreview";
import ConfidenceMeter from "../components/ConfidenceMeter";
import DetailedReport from "../components/DetailedReport";
import TechnicalDetails from "../components/TechnicalDetails";
import ExportPanel from "../components/ExportPanel";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";

const TABS = [
  { id: "report", label: "Report" },
  { id: "technical", label: "Technical Details" },
  { id: "export", label: "Export" },
];

export default function AIFakeImageDetector() {
  const {
    file,
    preview,
    analysis,
    isAnalyzing,
    error,
    progress,
    activeTab,
    setActiveTab,
    analyzeImage,
    removeImage,
    getReportData,
  } = useImageDetection();

  const reportData = getReportData();

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <ShieldCheck className="h-4 w-4" />
            AI Detection
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
            AI Fake Image Detector
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Analyze images to detect AI-generated content, deepfakes, and manipulation artifacts. All processing runs entirely in your browser for complete privacy.
          </p>
        </section>

        {/* Main Two-Column Layout */}
        <section className="grid gap-6 2xl:grid-cols-[420px_1fr]">
          {/* Left Column: Upload + Preview */}
          <div className="space-y-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <ImageUploader
                onFileUpload={analyzeImage}
                onRemoveImage={removeImage}
                hasImage={!!file}
              />
            </div>

            {preview && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                <ImagePreview file={file} preview={preview} />
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="min-w-0 space-y-4">
            {/* Empty State */}
            {!file && !isAnalyzing && !error && (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center">
                <ShieldOff className="mb-4 h-12 w-12 text-[var(--muted-foreground)]/40" />
                <p className="text-base font-semibold text-[var(--foreground)]">
                  Upload an image to begin analysis
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  The analysis runs entirely in your browser — no data is uploaded.
                </p>
              </div>
            )}

            {/* Loading State */}
            {isAnalyzing && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--primary)]" />
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    Analyzing image...
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                  <div
                    className="h-full rounded-full bg-[var(--primary)] transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  Running forensic checks across noise, compression, metadata, lighting, and more...
                </p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
                      Analysis Error
                    </p>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-500">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {analysis && !isAnalyzing && (
              <>
                {/* Confidence Meter */}
                <ConfidenceMeter
                  score={analysis.summary.overallScore}
                  riskLevel={analysis.summary.riskLevel}
                  confidence={analysis.summary.confidence}
                />

                {/* Tabs */}
                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[var(--anslation-ds-shadow-sm)]">
                  <div className="flex border-b border-[var(--border)]">
                    {TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex-1 px-4 py-3 text-sm font-semibold transition ${
                          activeTab === tab.id
                            ? "text-[var(--primary)]"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        {tab.label}
                        {activeTab === tab.id && (
                          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--primary)]" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="p-5">
                    {activeTab === "report" && (
                      <DetailedReport detailedAnalysis={analysis} />
                    )}
                    {activeTab === "technical" && (
                      <TechnicalDetails technicalInfo={analysis.technicalInfo} />
                    )}
                    {activeTab === "export" && (
                      <ExportPanel report={reportData} />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* How It Works + Features */}
        <div className="border-t border-[var(--border)] pt-8">
          <HowItWorks />
          <div className="border-t border-[var(--border)] pt-8">
            <Features />
          </div>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Button, EmptyState } from "@altftool/ui";
import { ArrowLeft, Download, Settings, History, ImagePlus, Sparkles, Camera, Info, ChevronRight } from "lucide-react";
import usePassportMaker from "../hooks/usePassportMaker";
import HeroSection from "../components/HeroSection";
import UploadPanel from "../components/UploadPanel";
import CameraCapture from "../components/CameraCapture";
import LoadingOverlay from "../components/LoadingOverlay";
import FeatureCards from "../components/FeatureCards";
import TemplateSelector from "../components/TemplateSelector";
import PhotoEditor from "../components/PhotoEditor";
import BackgroundEditor from "../components/BackgroundEditor";
import PreviewPanel from "../components/PreviewPanel";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
import FaceGuideOverlay from "../components/FaceGuideOverlay";
import ComplianceChecker from "../components/ComplianceChecker";
import PrintSheetGenerator from "../components/PrintSheetGenerator";
import ExportDialog from "../components/ExportDialog";
import HistoryPanel from "../components/HistoryPanel";
import SettingsModal from "../components/SettingsModal";

const STEPS = [
  { key: "upload", label: "Upload" },
  { key: "crop", label: "Crop & Adjust" },
  { key: "edit", label: "Edit" },
  { key: "preview", label: "Preview" },
  { key: "export", label: "Export" },
];

export default function PassportMakerMain() {
  const pt = usePassportMaker();
  const [showCamera, setShowCamera] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleUploadClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) pt.handleUpload(file);
    };
    input.click();
  }, [pt.handleUpload]);

  const handleCameraCapture = useCallback((dataUrl) => {
    fetch(dataUrl)
      .then((r) => r.blob())
      .then((blob) => {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        pt.handleUpload(file);
        setShowCamera(false);
      });
  }, [pt.handleUpload]);

  const handleExportSuccess = useCallback(async () => {
    await pt.handleExport();
    if (pt.processedImage) {
      pt.addToHistory({ exportFormat: pt.exportFormat, complianceScore: pt.compliance?.overallScore });
    }
  }, [pt]);

  const handleHistorySelect = useCallback((item) => {
    if (item.template) pt.setTemplate(item.template);
    if (item.background) pt.setBackground(item.background);
    if (item.adjustments) {
      Object.entries(item.adjustments).forEach(([k, v]) => pt.updateAdjustment(k, v));
    }
    pt.setEditorStep("preview");
  }, [pt]);

  const getStepIndex = () => {
    const idx = STEPS.findIndex((s) => s.key === pt.editorStep);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="min-h-screen bg-(--background)">
      <LoadingOverlay visible={pt.processing} message={pt.loadingMessage} />

      <AnimatePresence mode="wait">
        {pt.editorStep === "upload" ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HeroSection onUpload={handleUploadClick} />
            <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">
              <UploadPanel
                onUpload={pt.handleUpload}
                loading={pt.processing}
                error={pt.error}
                onCameraCapture={() => setShowCamera(true)}
              />
            </div>
            <div className="max-w-6xl mx-auto px-4 py-12">
              <FeatureCards />
            </div>
            <div className="max-w-6xl mx-auto px-4 pb-12">
              <HistoryPanel
                history={pt.history}
                onSelect={handleHistorySelect}
                onDelete={pt.removeHistoryItem}
                onToggleFavorite={pt.toggleFavorite}
                favorites={pt.favorites}
              />
            </div>
            <div className="max-w-4xl mx-auto px-4 pb-16">
              <Card className="p-6">
                <h2 className="text-lg font-bold text-(--foreground) mb-4">How It Works</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: ImagePlus, title: "1. Upload", desc: "Upload your photo or capture with camera" },
                    { icon: Sparkles, title: "2. Auto-Process", desc: "Face detection, background removal, and crop" },
                    { icon: Download, title: "3. Export", desc: "Download print-ready passport photos" },
                  ].map((s) => (
                    <div key={s.title} className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-(--muted)">
                      <div className="w-10 h-10 rounded-full bg-(--primary-soft) flex items-center justify-center">
                        <s.icon size="20" className="text-(--primary)" />
                      </div>
                      <p className="text-sm font-semibold text-(--foreground)">{s.title}</p>
                      <p className="text-xs text-(--muted-foreground)">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-4 py-6 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={pt.handleReset}
                  className="p-2 rounded-lg bg-(--card) border border-(--border) text-(--muted-foreground) hover:border-(--border-strong) transition"
                  title="Back to home"
                >
                  <ArrowLeft size="18" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-(--foreground)">Passport Photo Maker</h1>
                  <p className="text-xs text-(--muted-foreground)">{pt.template?.name || "Select a template"}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setShowSettings(true)} className="p-2 rounded-lg bg-(--card) border border-(--border) text-(--muted-foreground) hover:border-(--border-strong) transition" title="Settings">
                  <Settings size="18" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-(--muted-foreground) overflow-x-auto pb-1">
              {STEPS.map((s, i) => (
                <div key={s.key} className="flex items-center gap-1 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                    i <= getStepIndex() ? "bg-(--primary-soft) text-(--primary)" : "bg-(--muted) text-(--muted-foreground)"
                  }`}>
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && <ChevronRight size="14" className="text-(--border)" />}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7 space-y-4">
                <Card className="relative overflow-hidden p-3">
                  {pt.faceBounds && pt.editorStep === "crop" && (
                    <FaceGuideOverlay
                      faceBounds={pt.faceBounds}
                      imageWidth={pt.image?.width || 1}
                      imageHeight={pt.image?.height || 1}
                      template={pt.template}
                      visible={pt.gridVisible}
                    />
                  )}
                  {(pt.editorStep === "crop" || pt.editorStep === "edit") && pt.image ? (
                    <PhotoEditor
                      adjustments={pt.adjustments}
                      onAdjustmentChange={pt.updateAdjustment}
                      onReset={pt.resetAdjustments}
                      image={pt.image}
                      crop={pt.crop}
                      zoom={pt.zoom}
                      onCropChange={pt.onCropChange}
                      onZoomChange={pt.onZoomChange}
                      onCropComplete={pt.onCropComplete}
                    />
                  ) : (
                    <PreviewPanel
                      originalImage={pt.image?.dataUrl || null}
                      resultImage={pt.processedImage}
                      template={pt.template}
                      viewMode={pt.viewMode}
                      onViewModeChange={pt.setViewMode}
                      gridVisible={pt.gridVisible}
                      onGridToggle={() => pt.setGridVisible(!pt.gridVisible)}
                    />
                  )}
                </Card>

                {pt.processedImage && (
                  <Card className="p-4">
                    <h3 className="text-xs font-semibold text-(--foreground) uppercase tracking-wider mb-3">Before & After</h3>
                    <BeforeAfterSlider before={pt.image?.dataUrl} after={pt.processedImage} />
                  </Card>
                )}
              </div>

              <div className="lg:col-span-5 space-y-4">
                <TemplateSelector
                  templates={pt.templates}
                  selected={pt.template?.id}
                  onSelect={pt.setTemplate}
                  favorites={pt.favorites.map((f) => f.templateId || f.template?.id).filter(Boolean)}
                  onToggleFavorite={(t) => pt.toggleFavorite({ id: t.id, templateId: t.id, template: { id: t.id, name: t.name } })}
                />

                <BackgroundEditor
                  background={pt.background}
                  onChange={pt.setBackground}
                  image={pt.image}
                  onRemoveBackground={() => {}}
                  removingBg={false}
                  bgRemovalSupported={false}
                />

                {pt.compliance && (
                  <ComplianceChecker compliance={pt.compliance} template={pt.template} />
                )}

                <Card className="p-4">
                  <h3 className="text-xs font-semibold text-(--foreground) uppercase tracking-wider mb-3">Print Sheet</h3>
                  <PrintSheetGenerator
                    template={pt.template}
                    resultImage={pt.processedImage}
                    sheetOption={pt.sheetOption}
                    onSheetChange={pt.setSheetOption}
                    paperSize={pt.paperSize}
                    onPaperSizeChange={pt.setPaperSize}
                  />
                </Card>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="primary"
                    className="w-full justify-center"
                    onClick={async () => {
                      if (!pt.processedImage) {
                        await pt.generateResult();
                      }
                      setShowExport(true);
                    }}
                    disabled={!pt.image}
                  >
                    <Download size="16" /> Export Photo
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full justify-center"
                    onClick={() => {
                      if (pt.processedImage) {
                        pt.setViewMode(pt.viewMode === "original" ? "result" : "original");
                      } else {
                        pt.generateResult();
                      }
                    }}
                    disabled={!pt.image}
                  >
                    {pt.processedImage ? (pt.viewMode === "original" ? "Show Result" : "Show Original") : "Generate Preview"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <HistoryPanel
                history={pt.history}
                onSelect={handleHistorySelect}
                onDelete={pt.removeHistoryItem}
                onToggleFavorite={pt.toggleFavorite}
                favorites={pt.favorites}
              />
              <div className="space-y-4">
                <Card className="p-5">
                  <h2 className="text-lg font-bold text-(--foreground) mb-2">Privacy Notice</h2>
                  <p className="text-sm text-(--muted-foreground)">
                    All image processing happens locally in your browser. Your photos are never uploaded to any server.
                    Face detection runs entirely on your device.
                  </p>
                </Card>
                <Card className="p-5">
                  <h2 className="text-lg font-bold text-(--foreground) mb-4">FAQ</h2>
                  <div className="space-y-3">
                    {[
                      { q: "What photo formats are supported?", a: "JPG, PNG, WebP, and HEIC (where browser supports). Maximum file size is 20MB." },
                      { q: "Is background removal available?", a: "Background replacement is available using solid colors. AI-powered background removal will be added in a future update." },
                      { q: "Are my photos uploaded to a server?", a: "No. All processing happens entirely in your browser. Your photos never leave your device." },
                      { q: "What are the recommended photo guidelines?", a: "Use a well-lit, front-facing photo with a neutral expression. Ensure your face is clearly visible and centered." },
                    ].map((faq) => (
                      <details key={faq.q} className="group">
                        <summary className="text-sm font-semibold text-(--foreground) cursor-pointer list-none flex items-center justify-between py-1">
                          {faq.q}
                          <ChevronRight size="14" className="text-(--muted-foreground) group-open:rotate-90 transition" />
                        </summary>
                        <p className="text-sm text-(--muted-foreground) pt-1 pb-2">{faq.a}</p>
                      </details>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCamera && (
          <CameraCapture
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
          />
        )}
      </AnimatePresence>

      <ExportDialog
        open={showExport}
        onClose={() => setShowExport(false)}
        template={pt.template}
        resultImage={pt.processedImage}
        exportFormat={pt.exportFormat}
        onFormatChange={pt.setExportFormat}
        exportQuality={pt.exportQuality}
        onQualityChange={pt.setExportQuality}
        onExport={handleExportSuccess}
        exporting={pt.exporting}
      />

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={pt.settings}
        onUpdate={pt.updateSetting}
        onClearAll={pt.clearHistory}
      />
    </div>
  );
}

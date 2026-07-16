"use client";
import { useWatermarkRemover } from "../hooks/useWatermarkRemover";
import UploadZone from "../components/UploadZone";
import SelectionTools from "../components/SelectionTools";
import CanvasEditor from "../components/CanvasEditor";
import RemovalControls from "../components/RemovalControls";
import EnhancementPanel from "../components/EnhancementPanel";
import EditingTools from "../components/EditingTools";
import ExportPanel from "../components/ExportPanel";
import PreviewPanel from "../components/PreviewPanel";
import InfoPanel from "../components/InfoPanel";

export default function WatermarkRemover() {
  const {
    originalImage, processedCanvas, isProcessing, progress, error,
    zoom, viewMode, removalMode, selectionType, brushSize, brushHardness, brushOpacity,
    brushPoints, selectionRect, historyIndex, featherRadius,
    enhancementSettings, exportFormat, exportQuality, keepExif,
    canvasRef, fileInputRef,
    setZoom, setViewMode, setRemovalMode, setSelectionType,
    setBrushSize, setBrushHardness, setBrushOpacity,
    setFeatherRadius, setEnhancementSettings, setExportFormat, setExportQuality, setKeepExif,
    setIsDrawing, setBrushPoints, setSelectionRect,
    handleFile, handlePaste, undo, redo, reset,
    computeRemoval, applyAIAutoDetect, applyEnhancements,
    downloadImage, clearAll, formatFileSize,
  } = useWatermarkRemover();

  const hasImage = !!processedCanvas;
  const hasBoth = !!originalImage && !!processedCanvas;

  const outputSummary = [
    "Watermark Removal Result",
    originalImage ? `Original: ${originalImage.file?.name || "—"} (${originalImage.width}x${originalImage.height})` : "No image loaded",
    processedCanvas ? `Output: ${processedCanvas.width}x${processedCanvas.height}` : "",
    processedCanvas && originalImage ? `Mode: ${removalMode}` : "",
    processedCanvas && originalImage ? `Selection: ${selectionType}` : "",
  ].filter(Boolean).join("\n");

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="container py-12 px-4 md:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-4 mb-12 animate-fade-in">
          <div className="inline-block">
            <h1 className="heading text-center animate-fade-up pt-5 mt-[-40]">Watermark Remover</h1>
            <div className="h-1 bg-gradient-primary rounded-full" />
          </div>
          <p className="text-lg text-(--muted-foreground) max-w-2xl mx-auto">
            Remove watermarks from images using AI-powered detection and smart inpainting while preserving quality.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-(--border) bg-(--card) shadow-md p-6">
            <UploadZone
              onFile={handleFile}
              onPaste={handlePaste}
              hasImage={hasImage}
            />
          </div>

          {error && (
            <div className="rounded-lg p-4 border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {isProcessing && (
            <div className="rounded-xl border border-(--border) bg-(--card) p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-(--foreground)">Processing...</span>
                <span className="text-sm text-(--muted-foreground)">{progress}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-(--border) overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-(--primary) to-cyan-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {hasImage && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                <div className="rounded-xl border border-(--border) bg-(--card) shadow-md p-5">
                  <CanvasEditor
                    processedCanvas={processedCanvas}
                    zoom={zoom}
                    setZoom={setZoom}
                    viewMode={viewMode}
                    originalImage={originalImage}
                    selectionType={selectionType}
                    brushSize={brushSize}
                    brushHardness={brushHardness}
                    brushOpacity={brushOpacity}
                    brushPoints={brushPoints}
                    setBrushPoints={setBrushPoints}
                    selectionRect={selectionRect}
                    setSelectionRect={setSelectionRect}
                    isDrawing={false}
                    setIsDrawing={setIsDrawing}
                    canvasRef={canvasRef}
                  />
                </div>

                <div className="rounded-xl border border-(--border) bg-(--card) shadow-md p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h3 className="text-sm font-semibold text-(--foreground)">Editing Tools</h3>
                    <EditingTools
                      onUndo={undo} onRedo={redo} onReset={reset}
                      canUndo={historyIndex > 0} canRedo={false} hasImage={hasImage}
                    />
                  </div>

                  <div className="space-y-5">
                    <SelectionTools
                      active={selectionType}
                      onChange={setSelectionType}
                      brushSize={brushSize} setBrushSize={setBrushSize}
                      brushHardness={brushHardness} setBrushHardness={setBrushHardness}
                      brushOpacity={brushOpacity} setBrushOpacity={setBrushOpacity}
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="rounded-xl border border-(--border) bg-(--card) shadow-md p-5">
                  <RemovalControls
                    removalMode={removalMode} setRemovalMode={setRemovalMode}
                    selectionType={selectionType}
                    onCompute={computeRemoval}
                    onAIDetect={applyAIAutoDetect}
                    isProcessing={isProcessing}
                    featherRadius={featherRadius} setFeatherRadius={setFeatherRadius}
                  />
                </div>

                <div className="rounded-xl border border-(--border) bg-(--card) shadow-md p-5">
                  <EnhancementPanel
                    settings={enhancementSettings}
                    setSettings={setEnhancementSettings}
                    onApply={applyEnhancements}
                    isProcessing={isProcessing}
                  />
                </div>

                <div className="rounded-xl border border-(--border) bg-(--card) shadow-md p-5">
                  <ExportPanel
                    format={exportFormat} setFormat={setExportFormat}
                    quality={exportQuality} setQuality={setExportQuality}
                    keepExif={keepExif} setKeepExif={setKeepExif}
                    onDownload={downloadImage}
                    hasImage={hasImage} isProcessing={isProcessing}
                  />
                </div>

                <div className="rounded-xl border border-(--border) bg-(--card) shadow-md p-5">
                  <button
                    onClick={clearAll}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition text-sm cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear All & Start Over
                  </button>
                </div>
              </div>
            </div>
          )}

          {hasBoth && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <div className="rounded-xl border border-(--border) bg-(--card) shadow-md p-5">
                  <PreviewPanel
                    processedCanvas={processedCanvas}
                    originalImage={originalImage}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                  />
                </div>
              </div>
              <div className="lg:col-span-4">
                <div className="rounded-xl border border-(--border) bg-(--card) shadow-md p-5">
                  <InfoPanel />
                </div>
              </div>
            </div>
          )}

          <section className="rounded-xl border border-(--border) bg-(--card) p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-(--foreground)">Output Summary</h2>
              <span className="rounded-lg border border-(--border) bg-(--background) px-2.5 py-1 text-xs font-semibold text-(--muted-foreground)">Browser-side</span>
            </div>
            <pre data-testid="tool-output" className="min-h-[80px] whitespace-pre-wrap rounded-lg border border-(--border) bg-(--background) p-3 text-sm leading-6 text-(--foreground)">
              {outputSummary}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}

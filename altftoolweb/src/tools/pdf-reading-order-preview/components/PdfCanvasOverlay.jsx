"use client";

import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Map } from "lucide-react";
import MiniMap from "./MiniMap";

const TAG_COLOR_MAP = {
  h1: { stroke: "#10b981", bg: "rgba(16, 185, 129, 0.15)", text: "#047857", label: "H1 Heading" },
  h2: { stroke: "#10b981", bg: "rgba(16, 185, 129, 0.15)", text: "#047857", label: "H2 Heading" },
  h3: { stroke: "#059669", bg: "rgba(5, 150, 105, 0.15)", text: "#047857", label: "H3 Heading" },
  paragraph: { stroke: "#3b82f6", bg: "rgba(59, 130, 246, 0.12)", text: "#1d4ed8", label: "Text Block" },
  image: { stroke: "#a855f7", bg: "rgba(168, 85, 247, 0.15)", text: "#7e22ce", label: "Image / Figure" },
  figure: { stroke: "#a855f7", bg: "rgba(168, 85, 247, 0.15)", text: "#7e22ce", label: "Figure" },
  table: { stroke: "#f97316", bg: "rgba(249, 115, 22, 0.15)", text: "#c2410c", label: "Table / Cell" },
  caption: { stroke: "#06b6d4", bg: "rgba(6, 182, 212, 0.15)", text: "#0e7490", label: "Caption" },
  list: { stroke: "#6366f1", bg: "rgba(99, 102, 241, 0.15)", text: "#4338ca", label: "List Item" },
  form: { stroke: "#ec4899", bg: "rgba(236, 72, 153, 0.15)", text: "#be185d", label: "Form Label" },
  artifact: { stroke: "#64748b", bg: "rgba(100, 116, 139, 0.12)", text: "#334155", label: "Artifact (Header/Footer)" },
  error: { stroke: "#ef4444", bg: "rgba(239, 68, 68, 0.2)", text: "#b91c1c", label: "Issue / Defect" },
};

export default function PdfCanvasOverlay({
  pdfFile,
  activePageNumber,
  pageCount,
  onPageChange,
  activePageData,
  selectedBlockId,
  onSelectBlock,
  overlayMode = "all",
  zoomLevel = 1.0,
  onZoomChange,
  isPlaying = false,
  onTogglePlay,
  animationIndex = -1,
  animationSpeed = 1.0,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [renderState, setRenderState] = useState({ rendering: false, error: "" });
  const [pageSize, setPageSize] = useState({ width: 595, height: 842 });
  const [showMiniMap, setShowMiniMap] = useState(true);

  // Render PDF Page onto canvas
  useEffect(() => {
    let cancelled = false;

    async function renderPdfPage() {
      if (!pdfFile || !canvasRef.current) return;
      setRenderState({ rendering: true, error: "" });

      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/altflovepdf/pdf.worker.min.mjs";

        const buffer = await pdfFile.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
        const page = await doc.getPage(activePageNumber);

        const viewport = page.getViewport({ scale: zoomLevel * 1.5 });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        setPageSize({ width: viewport.width / (zoomLevel * 1.5), height: viewport.height / (zoomLevel * 1.5) });

        const renderContext = {
          canvasContext: context,
          viewport,
        };

        await page.render(renderContext).promise;
        if (!cancelled) {
          setRenderState({ rendering: false, error: "" });
        }
      } catch (err) {
        if (!cancelled) {
          setRenderState({
            rendering: false,
            error: "Failed to render PDF page on canvas. " + (err.message || ""),
          });
        }
      }
    }

    renderPdfPage();
    return () => {
      cancelled = true;
    };
  }, [pdfFile, activePageNumber, zoomLevel]);

  const items = activePageData?.estimate?.estimatedItems || [];
  const issues = activePageData?.estimate?.accessibilityIssues || [];

  const handleZoomSelect = (val) => {
    if (val === "fit-width") {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 48;
        onZoomChange(Math.max(0.3, Math.min(2.5, containerWidth / pageSize.width)));
      }
    } else if (val === "fit-page") {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight - 48;
        onZoomChange(Math.max(0.3, Math.min(2.5, containerHeight / pageSize.height)));
      }
    } else {
      onZoomChange(parseFloat(val));
    }
  };

  const getStyleForItem = (item, index) => {
    const hasIssue = issues.some((iss) => iss.blockId === item.id);
    if (overlayMode === "heatmap" && hasIssue) {
      return TAG_COLOR_MAP.error;
    }
    if (overlayMode === "tags") {
      return TAG_COLOR_MAP[item.tagType] || TAG_COLOR_MAP.paragraph;
    }
    if (hasIssue) {
      return TAG_COLOR_MAP.error;
    }
    return TAG_COLOR_MAP[item.tagType] || TAG_COLOR_MAP.paragraph;
  };

  return (
    <div className="relative flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
      {/* Top Floating Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 z-20">
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={activePageNumber <= 1}
            onClick={() => onPageChange(activePageNumber - 1)}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 transition"
            title="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-2 font-bold text-slate-900 dark:text-slate-200">
            Page {activePageNumber} of {pageCount}
          </span>
          <button
            type="button"
            disabled={activePageNumber >= pageCount}
            onClick={() => onPageChange(activePageNumber + 1)}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 transition"
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Animation Control */}
        <div className="flex items-center gap-2 border-x border-slate-200 dark:border-slate-800 px-3">
          <button
            type="button"
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition shadow-md ${
              isPlaying
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
            }`}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            {isPlaying ? "Pause Flow" : "Play Sequence"}
          </button>
          {animationIndex >= 0 && (
            <span className="text-indigo-600 dark:text-indigo-400 font-mono font-extrabold">
              #{animationIndex + 1} / {items.length}
            </span>
          )}
        </div>

        {/* Zoom Controls & Presets */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(0.25, zoomLevel - 0.15))}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <select
            value={zoomLevel}
            onChange={(e) => handleZoomSelect(e.target.value)}
            className="px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="0.25">25%</option>
            <option value="0.5">50%</option>
            <option value="0.75">75%</option>
            <option value="1">100%</option>
            <option value="1.5">150%</option>
            <option value="2">200%</option>
            <option value="fit-width">Fit Width</option>
            <option value="fit-page">Fit Page</option>
          </select>

          <button
            type="button"
            onClick={() => onZoomChange(Math.min(2.5, zoomLevel + 0.15))}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowMiniMap(!showMiniMap)}
            className={`p-1.5 rounded-lg transition ${
              showMiniMap
                ? "bg-indigo-600 text-white font-bold"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
            title="Toggle Mini Map"
          >
            <Map className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas & SVG Overlay Viewport */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-auto p-6 flex justify-center items-start bg-slate-950/80 custom-scrollbar"
      >
        {renderState.rendering && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-30">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 shadow-xl">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold">Rendering PDF page...</span>
            </div>
          </div>
        )}

        {renderState.error && (
          <div className="absolute top-10 inset-x-10 p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-sm z-30 text-center">
            {renderState.error}
          </div>
        )}

        {/* Outer Container scaled according to zoom */}
        <div
          className="relative shadow-2xl rounded-sm overflow-hidden transition-all duration-150 border border-slate-800 bg-white"
          style={{
            width: `${pageSize.width * zoomLevel}px`,
            height: `${pageSize.height * zoomLevel}px`,
          }}
        >
          {/* Rendered PDF Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {/* SVG Overlay Layer for Boxes, Badges, & Direction Arrows */}
          <svg
            className="absolute inset-0 w-full h-full z-10 pointer-events-none"
            viewBox={`0 0 ${pageSize.width} ${pageSize.height}`}
            preserveAspectRatio="none"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#10b981" />
              </marker>
              <marker
                id="arrowhead-issue"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
              </marker>
            </defs>

            {/* Direction Arrows connecting consecutive reading blocks */}
            {(overlayMode === "all" || overlayMode === "arrows" || overlayMode === "heatmap") &&
              items.map((item, idx) => {
                if (idx === items.length - 1) return null;
                const nextItem = items[idx + 1];
                if (!item.hasCoordinates || !nextItem.hasCoordinates) return null;

                const startX = item.x + item.width / 2;
                const startY = item.y + item.height / 2;
                const endX = nextItem.x + nextItem.width / 2;
                const endY = nextItem.y + nextItem.height / 2;

                const hasIssue = issues.some((i) => i.blockId === item.id || i.blockId === nextItem.id);
                const isCurrentActive = animationIndex === idx;

                return (
                  <g key={`arrow-${item.id}-${nextItem.id}`}>
                    <line
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke={hasIssue ? "#ef4444" : isCurrentActive ? "#10b981" : "#0284c7"}
                      strokeWidth={isCurrentActive ? "3.5" : "2"}
                      strokeDasharray={hasIssue ? "4 3" : isCurrentActive ? "none" : "6 4"}
                      opacity={isCurrentActive ? 1 : 0.75}
                      markerEnd={hasIssue ? "url(#arrowhead-issue)" : "url(#arrowhead)"}
                    />
                  </g>
                );
              })}
          </svg>

          {/* Interactive Block Boxes & Number Badges Layer */}
          <div className="absolute inset-0 z-20">
            {items.map((item, index) => {
              if (!item.hasCoordinates) return null;

              const style = getStyleForItem(item, index);
              const isSelected = selectedBlockId === item.id;
              const isAnimated = animationIndex === index;
              const hasIssue = issues.some((iss) => iss.blockId === item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectBlock(item)}
                  title={`[${index + 1}] ${style.label}: "${item.text.slice(0, 50)}"`}
                  className={`absolute rounded cursor-pointer transition-all duration-150 group ${
                    isSelected ? "ring-2 ring-emerald-400 ring-offset-1 z-30" : ""
                  } ${isAnimated ? "scale-[1.02] ring-4 ring-emerald-500 z-40 animate-pulse" : ""}`}
                  style={{
                    left: `${(item.x / pageSize.width) * 100}%`,
                    top: `${(item.y / pageSize.height) * 100}%`,
                    width: `${(Math.max(item.width, 24) / pageSize.width) * 100}%`,
                    height: `${(Math.max(item.height, 16) / pageSize.height) * 100}%`,
                    borderColor: style.stroke,
                    borderWidth: overlayMode === "numbers" ? "0px" : isSelected ? "2px" : "1.5px",
                    backgroundColor: overlayMode === "numbers" ? "transparent" : style.bg,
                  }}
                >
                  {/* Number Badge */}
                  {(overlayMode === "all" || overlayMode === "numbers" || overlayMode === "tags" || overlayMode === "heatmap") && (
                    <span
                      className={`absolute -top-3 -left-3 min-w-6 h-6 px-1.5 flex items-center justify-center rounded-full text-xs font-black shadow-md border transition ${
                        hasIssue
                          ? "bg-rose-500 text-white border-rose-300"
                          : isAnimated
                            ? "bg-emerald-400 text-slate-950 border-emerald-200 scale-125"
                            : isSelected
                              ? "bg-emerald-500 text-white border-white scale-110"
                              : "bg-slate-900 text-white border-slate-700"
                      }`}
                    >
                      {index + 1}
                    </span>
                  )}

                  {/* Tag Type Pill on hover */}
                  <span className="absolute hidden group-hover:flex bottom-full mb-1 left-0 px-2 py-0.5 rounded bg-slate-900 text-[10px] font-bold text-white whitespace-nowrap shadow-lg z-50">
                    #{index + 1} · {style.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating MiniMap Overlay */}
        {showMiniMap && (
          <div className="absolute bottom-4 right-4 z-40">
            <MiniMap
              pageSize={pageSize}
              items={items}
              issues={issues}
              selectedBlockId={selectedBlockId}
              onSelectBlock={onSelectBlock}
              animationIndex={animationIndex}
            />
          </div>
        )}
      </div>
    </div>
  );
}

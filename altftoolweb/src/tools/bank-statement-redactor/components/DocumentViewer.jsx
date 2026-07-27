"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Move,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export default function DocumentViewer({
  activePage,
  activePageIndex,
  totalPages,
  onSelectPage,
  selectedRectangleId,
  onSelectRectangle,
  onStartDrawing,
  onStartMoving,
  onContinueInteraction,
  onFinishInteraction,
  draftRectangle,
  onRectangleKeyDown,
  searchMatches = [],
}) {
  const previewRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => setZoom((z) => Math.min(300, z + 25));
  const handleZoomOut = () => setZoom((z) => Math.max(50, z - 25));
  const handleResetZoom = () => setZoom(100);
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFSChange);
    return () => document.removeEventListener("fullscreenchange", handleFSChange);
  }, []);

  return (
    <section
      ref={containerRef}
      className="flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6"
    >
      {/* Studio Viewport Control Dock */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectPage(Math.max(0, activePageIndex - 1))}
            disabled={activePageIndex === 0}
            className="inline-flex size-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-xs font-bold text-[var(--foreground)]">
            Page {activePage?.pageNumber || 1} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onSelectPage(Math.min(totalPages - 1, activePageIndex + 1))}
            disabled={activePageIndex === totalPages - 1}
            className="inline-flex size-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Zoom & Rotation Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="inline-flex size-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
          >
            <ZoomOut className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="h-9 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs font-extrabold text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
          >
            {zoom}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="inline-flex size-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
          >
            <ZoomIn className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleRotate}
            title="Rotate 90°"
            className="inline-flex size-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
          >
            <RotateCw className="size-4" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="inline-flex size-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Studio Viewport */}
      <div className="relative mt-4 min-h-[60vh] max-h-[75vh] overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--canvas)] p-6">
        {activePage && (
          <div
            ref={previewRef}
            role="group"
            aria-label={`Interactive preview for page ${activePage.pageNumber}`}
            onPointerDown={onStartDrawing}
            onPointerMove={onContinueInteraction}
            onPointerUp={onFinishInteraction}
            onPointerCancel={onFinishInteraction}
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: "top center",
              transition: "transform 0.15s ease-out",
            }}
            className="relative mx-auto w-fit max-w-full touch-none select-none overflow-hidden rounded-xl bg-[var(--surface)] shadow-lg"
          >
            <img
              src={activePage.previewUrl}
              alt={`Statement page ${activePage.pageNumber}`}
              draggable="false"
              className="block max-h-[70vh] w-auto max-w-full"
            />

            {/* Search Match Overlay Highlights */}
            {searchMatches
              .filter((m) => m.pageNumber === activePage.pageNumber)
              .map((match, idx) => (
                <div
                  key={`search-match-${idx}`}
                  className="pointer-events-none absolute border-2 border-[var(--warning)] bg-[var(--warning-soft)] animate-pulse z-10"
                  style={{
                    left: `${match.x * 100}%`,
                    top: `${match.y * 100}%`,
                    width: `${match.width * 100}%`,
                    height: `${match.height * 100}%`,
                  }}
                />
              ))}

            {/* Applied Mask Layers */}
            {activePage.rectangles.map((rectangle) => {
              const isSelected = rectangle.id === selectedRectangleId;
              const mode = rectangle.mode || "black";

              return (
                <button
                  key={rectangle.id}
                  type="button"
                  aria-label={`${rectangle.label}. Drag to move; arrow keys nudge; Delete removes.`}
                  aria-pressed={isSelected}
                  onPointerDown={(e) => onStartMoving(e, rectangle)}
                  onKeyDown={(e) => onRectangleKeyDown(e, rectangle)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRectangle(rectangle.id);
                  }}
                  className={`absolute overflow-hidden rounded-xs transition-all outline-none ${
                    isSelected
                      ? "border-2 border-[var(--primary)] ring-4 ring-[var(--focus-ring)] z-20"
                      : "border border-[var(--foreground)]/60 hover:border-[var(--primary)] z-10"
                  }`}
                  style={{
                    left: `${rectangle.x * 100}%`,
                    top: `${rectangle.y * 100}%`,
                    width: `${rectangle.width * 100}%`,
                    height: `${rectangle.height * 100}%`,
                  }}
                >
                  {/* Mode-based visual styling overlay using semantic tokens */}
                  {mode === "white" ? (
                    <div className="h-full w-full bg-[var(--surface)] border border-[var(--border-strong)]" />
                  ) : mode === "blur" ? (
                    <div className="h-full w-full backdrop-blur-md bg-[var(--foreground)]/40" />
                  ) : mode === "pixelate" ? (
                    <div className="h-full w-full bg-[var(--foreground)] opacity-90" />
                  ) : mode === "mask_x" ? (
                    <div className="flex h-full w-full items-center justify-center bg-[var(--foreground)] font-mono text-xs font-extrabold text-[var(--surface)]">
                      XXXXXXXX
                    </div>
                  ) : mode === "redacted_text" ? (
                    <div className="flex h-full w-full items-center justify-center bg-[var(--foreground)] font-sans text-[11px] font-extrabold text-[var(--danger)]">
                      [REDACTED]
                    </div>
                  ) : mode === "custom" ? (
                    <div className="flex h-full w-full items-center justify-center bg-[var(--primary)] font-sans text-[11px] font-extrabold text-[var(--primary-foreground)]">
                      {rectangle.customText || "[CONFIDENTIAL]"}
                    </div>
                  ) : (
                    /* Default: Permanent Solid Foreground Box */
                    <div className="h-full w-full bg-[var(--foreground)]" />
                  )}

                  {/* Selected Indicator Icon */}
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Move className="size-4 text-[var(--primary-foreground)] drop-shadow-md" />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Draft Drawing Rectangle */}
            {draftRectangle && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute rounded-xs border-2 border-dashed border-[var(--primary)] bg-[var(--primary-soft)] z-30"
                style={{
                  left: `${draftRectangle.x * 100}%`,
                  top: `${draftRectangle.y * 100}%`,
                  width: `${draftRectangle.width * 100}%`,
                  height: `${draftRectangle.height * 100}%`,
                }}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

"use client";
import { useRef, useCallback, useEffect, useState } from "react";

const ZOOM_STEPS = [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8];

export default function CanvasEditor({
  processedCanvas, zoom, setZoom, viewMode, originalImage,
  selectionType, brushSize, brushHardness, brushOpacity,
  brushPoints, setBrushPoints, selectionRect, setSelectionRect,
  isDrawing, setIsDrawing, canvasRef,
}) {
  const [containerSize, setContainerSize] = useState({ w: 800, h: 500 });
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const rectStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ w: rect.width, h: rect.height });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const fitZoom = useCallback(() => {
    if (!processedCanvas || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pad = 40;
    const zx = (rect.width - pad) / processedCanvas.width;
    const zy = (rect.height - pad) / processedCanvas.height;
    setZoom(Math.min(zx, zy, 1));
  }, [processedCanvas, setZoom]);

  useEffect(() => {
    fitZoom();
    window.addEventListener("resize", fitZoom);
    return () => window.removeEventListener("resize", fitZoom);
  }, [processedCanvas, fitZoom]);

  const cycleZoom = useCallback(() => {
    let next = ZOOM_STEPS.find(z => z > zoom) || ZOOM_STEPS[0];
    setZoom(next);
  }, [zoom, setZoom]);

  const scaledW = processedCanvas ? Math.round(processedCanvas.width * zoom) : 0;
  const scaledH = processedCanvas ? Math.round(processedCanvas.height * zoom) : 0;

  const getCanvasCoords = useCallback((clientX, clientY) => {
    if (!containerRef.current || !processedCanvas) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = (rect.width - scaledW) / 2;
    const offsetY = (rect.height - scaledH) / 2;
    const x = (clientX - rect.left - offsetX) / zoom;
    const y = (clientY - rect.top - offsetY) / zoom;
    return { x: Math.max(0, Math.min(processedCanvas.width, x)), y: Math.max(0, Math.min(processedCanvas.height, y)) };
  }, [processedCanvas, zoom, scaledW, scaledH]);

  const handleMouseDown = useCallback((e) => {
    if (!processedCanvas) return;
    const coords = getCanvasCoords(e.clientX, e.clientY);

    if (selectionType === "brush") {
      setIsDrawing(true);
      isDragging.current = true;
      setBrushPoints(prev => [...prev, { ...coords, size: brushSize, hardness: brushHardness, opacity: brushOpacity }]);
    } else if (selectionType === "rect") {
      setIsDrawing(true);
      rectStart.current = coords;
      setSelectionRect({ x: coords.x, y: coords.y, width: 0, height: 0 });
    }
  }, [processedCanvas, selectionType, brushSize, brushHardness, brushOpacity, getCanvasCoords, setBrushPoints, setSelectionRect, setIsDrawing]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current || !processedCanvas) return;
    const coords = getCanvasCoords(e.clientX, e.clientY);

    if (selectionType === "brush") {
      setBrushPoints(prev => [...prev, { ...coords, size: brushSize, hardness: brushHardness, opacity: brushOpacity }]);
    } else if (selectionType === "rect" && rectStart.current) {
      const x = Math.min(rectStart.current.x, coords.x);
      const y = Math.min(rectStart.current.y, coords.y);
      const w = Math.abs(coords.x - rectStart.current.x);
      const h = Math.abs(coords.y - rectStart.current.y);
      setSelectionRect({ x, y, width: w, height: h });
    }
  }, [processedCanvas, selectionType, brushSize, brushHardness, brushOpacity, getCanvasCoords, setBrushPoints, setSelectionRect]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    setIsDrawing(false);
  }, [setIsDrawing]);

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseUp]);

  const renderBrushPreview = () => {
    if (!processedCanvas || selectionType !== "brush") return null;
    return (
      <div
        className="absolute pointer-events-none rounded-full border-2 border-white/70 shadow-md"
        style={{
          width: brushSize * zoom * 2,
          height: brushSize * zoom * 2,
          opacity: brushOpacity / 100,
        }}
      />
    );
  };

  const renderSelectionRect = () => {
    if (!selectionRect || selectionType !== "rect") return null;
    return (
      <div
        className="absolute border-2 border-(--primary) bg-(--primary)/10 pointer-events-none"
        style={{
          left: (selectionRect.x * zoom + (containerSize.w - scaledW) / 2) || 0,
          top: (selectionRect.y * zoom + (containerSize.h - scaledH) / 2) || 0,
          width: selectionRect.width * zoom,
          height: selectionRect.height * zoom,
        }}
      />
    );
  };

  if (!processedCanvas) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-(--muted-foreground)">Zoom:</span>
          <div className="flex items-center gap-1">
            {[0.5, 1, 2, 4].map(z => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={`px-2 py-0.5 text-xs rounded cursor-pointer transition ${
                  zoom === z ? "bg-(--primary) text-(--primary-foreground)" : "border border-(--border) text-(--foreground) hover:bg-(--muted)"
                }`}
              >{z === 1 ? "100%" : z === 0.5 ? "50%" : z === 2 ? "200%" : "400%"}</button>
            ))}
            <button onClick={fitZoom} className="px-2 py-0.5 text-xs rounded border border-(--border) text-(--foreground) hover:bg-(--muted) cursor-pointer">Fit</button>
            <button onClick={cycleZoom} className="px-2 py-0.5 text-xs rounded border border-(--border) text-(--foreground) hover:bg-(--muted) cursor-pointer">{Math.round(zoom * 100)}%</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("before")}
            className={`px-3 py-1 text-xs rounded cursor-pointer transition ${
              viewMode === "before" ? "bg-(--primary) text-(--primary-foreground)" : "border border-(--border) text-(--foreground) hover:bg-(--muted)"
            }`}
          >Before</button>
          <button
            onClick={() => setViewMode("after")}
            className={`px-3 py-1 text-xs rounded cursor-pointer transition ${
              viewMode === "after" ? "bg-(--primary) text-(--primary-foreground)" : "border border-(--border) text-(--foreground) hover:bg-(--muted)"
            }`}
          >After</button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full rounded-xl border border-(--border) bg-(--muted)/30 overflow-hidden cursor-crosshair"
        style={{ minHeight: 400, maxHeight: "70vh" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <div
          className="absolute"
          style={{
            left: `calc(50% - ${scaledW / 2}px)`,
            top: `calc(50% - ${scaledH / 2}px)`,
          }}
        >
          <canvas
            ref={canvasRef}
            width={processedCanvas.width}
            height={processedCanvas.height}
            style={{ width: scaledW, height: scaledH, imageRendering: "auto" }}
          />
          {viewMode === "before" && originalImage?.canvas && (
            <canvas
              ref={(el) => {
                if (el && originalImage.canvas) {
                  el.getContext("2d").drawImage(originalImage.canvas, 0, 0);
                }
              }}
              width={processedCanvas.width}
              height={processedCanvas.height}
              className="absolute inset-0"
              style={{ width: scaledW, height: scaledH, imageRendering: "auto" }}
            />
          )}
          {viewMode === "after" && (
            <canvas
              ref={(el) => {
                if (el && processedCanvas) {
                  el.getContext("2d").drawImage(processedCanvas, 0, 0);
                }
              }}
              width={processedCanvas.width}
              height={processedCanvas.height}
              className="absolute inset-0"
              style={{ width: scaledW, height: scaledH, imageRendering: "auto" }}
            />
          )}
        </div>
        {renderSelectionRect()}
      </div>
    </div>
  );
}

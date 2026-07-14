import { useCallback, useRef, useState } from "react";

const MIN_SCALE = 0.4;
const MAX_SCALE = 2.5;
const SCALE_STEP = 0.2;

// Manages zoom (scale) and pan (offset) for the tree canvas.
export function usePanZoom() {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const clampScale = (value) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

  const zoomIn = useCallback(() => setScale((s) => clampScale(s + SCALE_STEP)), []);
  const zoomOut = useCallback(() => setScale((s) => clampScale(s - SCALE_STEP)), []);
  const reset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const onPointerDown = useCallback((event) => {
    dragging.current = true;
    last.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, []);

  const onPointerMove = useCallback((event) => {
    if (!dragging.current) return;
    const dx = event.clientX - last.current.x;
    const dy = event.clientY - last.current.y;
    last.current = { x: event.clientX, y: event.clientY };
    setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const onPointerUp = useCallback((event) => {
    dragging.current = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }, []);

  const onWheel = useCallback((event) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const delta = event.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
    setScale((s) => clampScale(s + delta));
  }, []);

  return {
    scale,
    offset,
    zoomIn,
    zoomOut,
    reset,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onWheel },
    isDragging: dragging,
  };
}

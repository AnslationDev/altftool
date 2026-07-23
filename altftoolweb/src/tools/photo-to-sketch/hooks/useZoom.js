"use client";

import { useCallback, useState } from "react";

// Simple zoom controller for the preview surface.
export function useZoom({ step = 0.2, min = 0.5, max = 3 } = {}) {
  const [scale, setScale] = useState(1);

  const zoomIn = useCallback(
    () => setScale((s) => Math.min(max, Math.round((s + step) * 100) / 100)),
    [step, max],
  );
  const zoomOut = useCallback(
    () => setScale((s) => Math.max(min, Math.round((s - step) * 100) / 100)),
    [step, min],
  );
  const reset = useCallback(() => setScale(1), []);

  return { scale, zoomIn, zoomOut, reset };
}

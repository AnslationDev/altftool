"use client";

import { useMemo } from "react";

export const DEVICES = {
  desktop: { label: "Desktop", width: 100, height: 100, unit: "%" },
  tablet: { label: "Tablet", width: 768, height: 1024, unit: "px" },
  tabletLandscape: { label: "Tablet (L)", width: 1024, height: 768, unit: "px" },
  mobile: { label: "Mobile", width: 390, height: 844, unit: "px" },
  mobileLandscape: { label: "Mobile (L)", width: 844, height: 390, unit: "px" },
};

export default function PreviewPane({
  srcDoc,
  reloadKey,
  device = "desktop",
  zoom = 1,
  onConsole,
}) {
  const cfg = DEVICES[device] || DEVICES.desktop;

  const frameStyle = useMemo(() => {
    if (cfg.unit === "%") {
      return { width: "100%", height: "100%" };
    }
    return {
      width: cfg.width,
      height: cfg.height,
      maxWidth: "100%",
      maxHeight: "100%",
    };
  }, [cfg]);

  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto bg-(--muted) p-3">
      <div
        className="origin-center transition-transform duration-200"
        style={{ transform: `scale(${zoom})` }}
      >
        <div
          className="overflow-hidden rounded-xl border border-(--border) bg-white shadow-sm"
          style={frameStyle}
        >
          <iframe
            key={reloadKey}
            title="preview"
            srcDoc={srcDoc}
            sandbox="allow-scripts allow-modals allow-popups allow-presentation"
            className="h-full w-full border-0 bg-white"
            onLoad={() => onConsole?.({ type: "system", level: "info", text: "Preview loaded", time: Date.now() })}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";
import ControlPanel from "../components/ControlPanel";
import GeometryCanvas from "../components/GeometryCanvas";
import PatternInfo from "../components/PatternInfo";
import { PALETTES, PATTERNS } from "../utils/patterns";

const DEFAULT_SETTINGS = {
  pattern: "flower",
  palette: "solar",
  complexity: 4,
  strokeWidth: 2.5,
  rotation: 0,
  scale: 95,
  opacity: 92,
};

const patternKeys = Object.keys(PATTERNS);
const paletteKeys = Object.keys(PALETTES);

export default function ToolHome() {
  const svgRef = useRef(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const activePattern = PATTERNS[settings.pattern];
  const activePalette = PALETTES[settings.palette];

  const metrics = useMemo(
    () => [
      { label: "Pattern", value: activePattern.label },
      { label: "Palette", value: activePalette.label },
      { label: "Complexity", value: `${settings.complexity}/6` },
      { label: "Rotation", value: `${settings.rotation}deg` },
    ],
    [activePalette.label, activePattern.label, settings.complexity, settings.rotation]
  );

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const reset = () => setSettings(DEFAULT_SETTINGS);

  const randomize = () => {
    setSettings({
      pattern: patternKeys[randomInt(0, patternKeys.length - 1)],
      palette: paletteKeys[randomInt(0, paletteKeys.length - 1)],
      complexity: randomInt(2, 6),
      strokeWidth: Number((Math.random() * 5 + 1.5).toFixed(1)),
      rotation: randomInt(0, 360),
      scale: randomInt(76, 118),
      opacity: randomInt(62, 100),
    });
  };

  const downloadSvg = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    downloadBlob(blob, `${settings.pattern}-sacred-geometry.svg`);
  };

  const downloadPng = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const source = new XMLSerializer().serializeToString(svg);
    const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" }));
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 1600;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, `${settings.pattern}-sacred-geometry.png`);
      }, "image/png");
    };
    image.src = url;
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 text-[var(--foreground)] transition-none md:p-8 font-secondary [&_*]:transition-none">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 pt-6 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-1.5 text-xs font-semibold text-[var(--primary)]">
            <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
            Sacred Mathematical Patterns
          </div>
          <h1 className="section-title text-[var(--primary)]">
            Sacred Geometry Generator
          </h1>
          <p className="description mx-auto mt-3 max-w-3xl text-[var(--secondary-foreground)]">
            Generate, customize, and export balanced geometric designs like the Flower of Life, Sri Yantra, and Metatron Cube.
          </p>
        </div>

        <ControlPanel
          settings={settings}
          onChange={updateSetting}
          onRandomize={randomize}
          onReset={reset}
          onDownloadSvg={downloadSvg}
          onDownloadPng={downloadPng}
        />

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="h-[68vh] min-h-[420px] max-h-[760px] overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--background)] shadow-lg">
            <GeometryCanvas ref={svgRef} settings={settings} />
          </div>

          <aside className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)]/80 p-5 shadow-lg backdrop-blur-xl">
            <h2 className="subheading text-[var(--primary)]">{activePattern.label}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--secondary-foreground)]">
              {activePattern.helper} Use controls to tune density, line weight, rotation, and export-ready artwork.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-[var(--card-border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--secondary-foreground)]">{metric.label}</p>
                  <p className="mt-1 break-words text-sm font-bold text-[var(--foreground)]">{metric.value}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="mt-4">
          <PatternInfo pattern={settings.pattern} />
        </div>
      </div>
    </div>
  );
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function downloadBlob(blob, filename) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

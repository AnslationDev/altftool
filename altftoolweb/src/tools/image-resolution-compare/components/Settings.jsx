"use client";

import { useState } from "react";

export default function Settings({ onSettings }) {
  const [settings, setSettings] = useState({
    dpi: 72,
    highPrecision: true,
    maxHistogramBins: 256,
    showExif: true,
    autoCompare: true,
  });

  const update = (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    onSettings?.(next);
  };

  return (
    <div className="ircp-card ircp-card-settings">
      <h3 className="ircp-card-title">Settings</h3>
      <div className="ircp-settings-grid">
        <div className="ircp-setting">
          <label>Target DPI</label>
          <select value={settings.dpi} onChange={(e) => update("dpi", Number(e.target.value))}>
            <option value={72}>72 (Web/Screen)</option>
            <option value={150}>150 (Print Draft)</option>
            <option value={300}>300 (Print Quality)</option>
            <option value={600}>600 (High Quality Print)</option>
          </select>
        </div>
        <div className="ircp-setting">
          <label>High Precision Analysis</label>
          <label className="ircp-toggle">
            <input type="checkbox" checked={settings.highPrecision} onChange={(e) => update("highPrecision", e.target.checked)} />
            <span className="ircp-toggle-slider" />
          </label>
        </div>
        <div className="ircp-setting">
          <label>Show EXIF Data</label>
          <label className="ircp-toggle">
            <input type="checkbox" checked={settings.showExif} onChange={(e) => update("showExif", e.target.checked)} />
            <span className="ircp-toggle-slider" />
          </label>
        </div>
        <div className="ircp-setting">
          <label>Auto-Compare on Upload</label>
          <label className="ircp-toggle">
            <input type="checkbox" checked={settings.autoCompare} onChange={(e) => update("autoCompare", e.target.checked)} />
            <span className="ircp-toggle-slider" />
          </label>
        </div>
        <div className="ircp-setting">
          <label>Histogram Bins</label>
          <select value={settings.maxHistogramBins} onChange={(e) => update("maxHistogramBins", Number(e.target.value))}>
            <option value={64}>64</option>
            <option value={128}>128</option>
            <option value={256}>256</option>
          </select>
        </div>
      </div>
    </div>
  );
}

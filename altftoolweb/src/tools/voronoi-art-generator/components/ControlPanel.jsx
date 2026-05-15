import React, { useState } from "react";

function ChevronIcon({ open }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" className={`voronoi-chevron ${open ? "voronoi-chevron-open" : ""}`} aria-hidden="true">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function ControlPanel({
    pointCount, setPointCount, colorScheme, setColorScheme, cellBorder, setCellBorder, borderColor, setBorderColor,
    borderWidth, setBorderWidth, animationSpeed, setAnimationSpeed, useGradient, setUseGradient, cellOpacity,
    setCellOpacity, pixelSize, setPixelSize, onApplyPreset, showAnimationSpeed = true, showSeedPoints,
    setShowSeedPoints, borderSensitivity, setBorderSensitivity, borderLimit, setBorderLimit, symmetryMode,
    setSymmetryMode, gradientColorStart, setGradientColorStart, gradientColorEnd, setGradientColorEnd,
    seedPointColor, setSeedPointColor, seedPointSize, setSeedPointSize, symmetryAxis, setSymmetryAxis,
    showSymmetryAxisLine, setShowSymmetryAxisLine,
}) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showPresets, setShowPresets] = useState(false);

    const colorSchemeOptions = ["rainbow", "pastel", "dark", "neon", "sunset", "ocean", "forest", "candy", "arctic", "volcano", "cyberpunk", "vintage"];
    const presets = [
        { name: "Minimalist", points: 20, colors: "dark", border: false, borderColor: "#000000" },
        { name: "Vibrant", points: 60, colors: "neon", border: true, borderColor: "#ffffff" },
        { name: "Serene", points: 40, colors: "ocean", border: true, borderColor: "#ffffff" },
        { name: "Dreamy", points: 50, colors: "pastel", border: false, borderColor: "#cccccc" },
    ];

    return (
        <div className="voronoi-controls-panel">
            <h2 className="voronoi-controls-title">Design Controls</h2>

            <div className="voronoi-control-group">
                <label className="voronoi-label">Featured Presets</label>
                <button onClick={() => setShowPresets((v) => !v)} className="voronoi-dropdown-btn">
                    <span>Load Preset</span>
                    <ChevronIcon open={showPresets} />
                </button>
                {showPresets && (
                    <div className="voronoi-preset-list">
                        {presets.map((preset) => (
                            <button key={preset.name} onClick={() => { onApplyPreset(preset); setShowPresets(false); }} className="voronoi-preset-item">
                                {preset.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="voronoi-control-group">
                <label className="voronoi-label">Points: {pointCount}</label>
                <input type="range" min="5" max="200" value={pointCount} onChange={(e) => setPointCount(parseInt(e.target.value, 10))} className="voronoi-range" />
                <p className="voronoi-help">More points = more detail</p>
            </div>

            <div className="voronoi-control-group">
                <label className="voronoi-label">Color Scheme</label>
                <select value={colorScheme} onChange={(e) => setColorScheme(e.target.value)} className="voronoi-select">
                    {colorSchemeOptions.map((option) => <option key={option} value={option}>{option[0].toUpperCase() + option.slice(1)}</option>)}
                </select>
            </div>

            <label className="voronoi-check"><input type="checkbox" checked={cellBorder} onChange={(e) => setCellBorder(e.target.checked)} className="voronoi-check-input" /> Show Cell Borders</label>
            {cellBorder && (
                <>
                    <div className="voronoi-control-group">
                        <label className="voronoi-label">Border Color</label>
                        <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="voronoi-color-input" />
                    </div>
                    <div className="voronoi-control-group">
                        <label className="voronoi-label">Border Width: {borderWidth}</label>
                        <input type="range" min="1" max="5" value={borderWidth} onChange={(e) => setBorderWidth(parseInt(e.target.value, 10))} className="voronoi-range" />
                    </div>
                </>
            )}

            <label className="voronoi-check"><input type="checkbox" checked={useGradient} onChange={(e) => setUseGradient(e.target.checked)} className="voronoi-check-input" /> Gradient Background</label>
            {useGradient && (
                <div className="voronoi-grid-two">
                    <div><label className="voronoi-label-sm">Gradient Start</label><input type="color" value={gradientColorStart} onChange={(e) => setGradientColorStart(e.target.value)} className="voronoi-color-input" /></div>
                    <div><label className="voronoi-label-sm">Gradient End</label><input type="color" value={gradientColorEnd} onChange={(e) => setGradientColorEnd(e.target.value)} className="voronoi-color-input" /></div>
                </div>
            )}

            <label className="voronoi-check"><input type="checkbox" checked={showSeedPoints} onChange={(e) => setShowSeedPoints(e.target.checked)} className="voronoi-check-input" /> Show Seed Points</label>
            {showSeedPoints && (
                <div className="voronoi-grid-two">
                    <div><label className="voronoi-label-sm">Seed Point Color</label><input type="color" value={seedPointColor} onChange={(e) => setSeedPointColor(e.target.value)} className="voronoi-color-input" /></div>
                    <div><label className="voronoi-label-sm">Seed Point Size</label><input type="range" min="2" max="10" step="1" value={seedPointSize} onChange={(e) => setSeedPointSize(parseInt(e.target.value, 10))} className="voronoi-range" /></div>
                </div>
            )}

            <label className="voronoi-check"><input type="checkbox" checked={symmetryMode} onChange={(e) => setSymmetryMode(e.target.checked)} className="voronoi-check-input" /> Symmetry Mode</label>
            {symmetryMode && (
                <div className="voronoi-advanced-panel">
                    <div>
                        <label className="voronoi-label-sm">Symmetry Axis</label>
                        <select value={symmetryAxis} onChange={(e) => setSymmetryAxis(e.target.value)} className="voronoi-select">
                            <option value="vertical">Vertical</option>
                            <option value="horizontal">Horizontal</option>
                        </select>
                    </div>
                    <label className="voronoi-check"><input type="checkbox" checked={showSymmetryAxisLine} onChange={(e) => setShowSymmetryAxisLine(e.target.checked)} className="voronoi-check-input" /> Show Axis Line</label>
                </div>
            )}

            <div className="voronoi-advanced-wrap">
                <button onClick={() => setShowAdvanced((v) => !v)} className="voronoi-dropdown-btn voronoi-dropdown-btn-sm">
                    <span>Advanced Features</span>
                    <ChevronIcon open={showAdvanced} />
                </button>
                {showAdvanced && (
                    <div className="voronoi-advanced-panel">
                        <div><label className="voronoi-label">Pixel Size: {pixelSize}</label><input type="range" min="1" max="4" value={pixelSize} onChange={(e) => setPixelSize(parseInt(e.target.value, 10))} className="voronoi-range" /></div>
                        <div><label className="voronoi-label">Cell Opacity: {(cellOpacity * 100).toFixed(0)}%</label><input type="range" min="0.3" max="1" step="0.05" value={cellOpacity} onChange={(e) => setCellOpacity(parseFloat(e.target.value))} className="voronoi-range" /></div>
                        <div><label className="voronoi-label">Border Sensitivity: {borderSensitivity.toFixed(1)}</label><input type="range" min="0.5" max="4" step="0.1" value={borderSensitivity} onChange={(e) => setBorderSensitivity(parseFloat(e.target.value))} className="voronoi-range" /></div>
                        <div><label className="voronoi-label">Border Limit: {borderLimit.toFixed(0)}</label><input type="range" min="2" max="20" step="1" value={borderLimit} onChange={(e) => setBorderLimit(parseFloat(e.target.value))} className="voronoi-range" /></div>
                    </div>
                )}
            </div>

            {showAnimationSpeed && (
                <div className="voronoi-control-group">
                    <label className="voronoi-label">Animation Speed: {animationSpeed.toFixed(1)}</label>
                    <input type="range" min="0" max="5" step="0.1" value={animationSpeed} onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))} className="voronoi-range" />
                    <p className="voronoi-help">0 = static, higher = animated</p>
                </div>
            )}
        </div>
    );
}

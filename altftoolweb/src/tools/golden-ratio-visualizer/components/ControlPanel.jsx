import React, { useMemo, useState } from "react";

function ChevronIcon({ open }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" className={`golden-chevron ${open ? "golden-chevron-open" : ""}`} aria-hidden="true">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function ControlPanel({ state, setters, onApplyPreset }) {
    const [showPresets, setShowPresets] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const presets = useMemo(
        () => [
            { name: "Classic Spiral", showGoldenSpiral: true, showFibonacciGrid: true, showPhiGrid: false, tileCount: 10, strokeColor: "#f59e0b" },
            { name: "Photo Composition", showGoldenSpiral: false, showFibonacciGrid: false, showPhiGrid: true, showRuleOfThirds: true, showDiagonalGuides: true, strokeColor: "#60a5fa" },
            { name: "Blueprint", useGradientBackground: false, backgroundColor: "#111827", strokeColor: "#34d399", lineStyle: "dashed", fillOpacity: 0.05 },
            { name: "Editorial Warm", useGradientBackground: true, gradientStart: "#fef3c7", gradientEnd: "#fed7aa", strokeColor: "#7c2d12", rotateDeg: -8 },
        ],
        []
    );

    return (
        <div className="golden-controls-panel">
            <h2 className="golden-controls-title">Design Controls</h2>

            <div className="golden-control-group">
                <label className="golden-label">Preset Library</label>
                <button onClick={() => setShowPresets((v) => !v)} className="golden-dropdown-btn">
                    <span>Load Preset</span>
                    <ChevronIcon open={showPresets} />
                </button>
                {showPresets && (
                    <div className="golden-preset-list">
                        {presets.map((preset) => (
                            <button key={preset.name} onClick={() => { onApplyPreset(preset); setShowPresets(false); }} className="golden-preset-item">
                                {preset.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="golden-control-group">
                <label className="golden-label">Canvas Size: {state.canvasSize}px</label>
                <input type="range" min="480" max="1400" step="20" value={state.canvasSize} onChange={(e) => setters.setCanvasSize(parseInt(e.target.value, 10))} className="golden-range" />
            </div>

            <div className="golden-control-group">
                <label className="golden-label">Tiles: {state.tileCount}</label>
                <input type="range" min="4" max="16" step="1" value={state.tileCount} onChange={(e) => setters.setTileCount(parseInt(e.target.value, 10))} className="golden-range" />
            </div>

            <div className="golden-color-grid">
                <div>
                    <label className="golden-label-sm">Stroke Color</label>
                    <input type="color" value={state.strokeColor} onChange={(e) => setters.setStrokeColor(e.target.value)} className="golden-color-input" />
                </div>
                <div>
                    <label className="golden-label-sm">Background</label>
                    <input type="color" value={state.backgroundColor} onChange={(e) => setters.setBackgroundColor(e.target.value)} className="golden-color-input" />
                </div>
            </div>

            <div className="golden-control-group">
                <label className="golden-check"><input type="checkbox" checked={state.useGradientBackground} onChange={(e) => setters.setUseGradientBackground(e.target.checked)} className="golden-check-input" /> Gradient Background</label>
            </div>

            {state.useGradientBackground && (
                <div className="golden-color-grid">
                    <div>
                        <label className="golden-label-sm">Gradient Start</label>
                        <input type="color" value={state.gradientStart} onChange={(e) => setters.setGradientStart(e.target.value)} className="golden-color-input" />
                    </div>
                    <div>
                        <label className="golden-label-sm">Gradient End</label>
                        <input type="color" value={state.gradientEnd} onChange={(e) => setters.setGradientEnd(e.target.value)} className="golden-color-input" />
                    </div>
                </div>
            )}

            <div className="golden-overlays-grid">
                <label className="golden-check"><input type="checkbox" checked={state.showGoldenSpiral} onChange={(e) => setters.setShowGoldenSpiral(e.target.checked)} className="golden-check-input" /> Golden Spiral</label>
                <label className="golden-check"><input type="checkbox" checked={state.showFibonacciGrid} onChange={(e) => setters.setShowFibonacciGrid(e.target.checked)} className="golden-check-input" /> Fibonacci Grid</label>
                <label className="golden-check"><input type="checkbox" checked={state.showPhiGrid} onChange={(e) => setters.setShowPhiGrid(e.target.checked)} className="golden-check-input" /> Phi Grid</label>
                <label className="golden-check"><input type="checkbox" checked={state.showRuleOfThirds} onChange={(e) => setters.setShowRuleOfThirds(e.target.checked)} className="golden-check-input" /> Rule of Thirds</label>
                <label className="golden-check golden-overlays-span-2"><input type="checkbox" checked={state.showDiagonalGuides} onChange={(e) => setters.setShowDiagonalGuides(e.target.checked)} className="golden-check-input" /> Diagonal Guides</label>
            </div>

            <div className="golden-advanced-wrap">
                <button onClick={() => setShowAdvanced((v) => !v)} className="golden-dropdown-btn golden-dropdown-btn-sm">
                    <span>Advanced Features</span>
                    <ChevronIcon open={showAdvanced} />
                </button>

                {showAdvanced && (
                    <div className="golden-advanced-panel">
                        <div>
                            <label className="golden-label">Stroke Width: {state.strokeWidth.toFixed(1)}</label>
                            <input type="range" min="0.5" max="8" step="0.1" value={state.strokeWidth} onChange={(e) => setters.setStrokeWidth(parseFloat(e.target.value))} className="golden-range" />
                        </div>
                        <div>
                            <label className="golden-label">Fill Opacity: {state.fillOpacity.toFixed(2)}</label>
                            <input type="range" min="0" max="0.8" step="0.01" value={state.fillOpacity} onChange={(e) => setters.setFillOpacity(parseFloat(e.target.value))} className="golden-range" />
                        </div>
                        <div>
                            <label className="golden-label">Rotation: {state.rotateDeg.toFixed(0)}deg</label>
                            <input type="range" min="-180" max="180" step="1" value={state.rotateDeg} onChange={(e) => setters.setRotateDeg(parseFloat(e.target.value))} className="golden-range" />
                        </div>
                        <div>
                            <label className="golden-label">Line Style</label>
                            <select value={state.lineStyle} onChange={(e) => setters.setLineStyle(e.target.value)} className="golden-select">
                                <option value="solid">Solid</option>
                                <option value="dashed">Dashed</option>
                                <option value="dotted">Dotted</option>
                            </select>
                        </div>
                        <div>
                            <label className="golden-label">Spiral Direction</label>
                            <select value={state.spiralDirection} onChange={(e) => setters.setSpiralDirection(e.target.value)} className="golden-select">
                                <option value="clockwise">Clockwise</option>
                                <option value="counterclockwise">Counterclockwise</option>
                            </select>
                        </div>
                        <label className="golden-check"><input type="checkbox" checked={state.animateRotation} onChange={(e) => setters.setAnimateRotation(e.target.checked)} className="golden-check-input" /> Animate Rotation</label>
                        <div>
                            <label className="golden-label">Animation Speed: {state.animationSpeed.toFixed(1)}</label>
                            <input type="range" min="0" max="5" step="0.1" value={state.animationSpeed} onChange={(e) => setters.setAnimationSpeed(parseFloat(e.target.value))} className="golden-range" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import React, { useMemo, useState } from "react";

function ChevronIcon({ open }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" className={`fractal-chevron ${open ? "fractal-chevron-open" : ""}`} aria-hidden="true">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function ControlPanel({
    state,
    setters,
    onApplyPreset,
}) {
    const [showPresets, setShowPresets] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const presets = useMemo(
        () => [
            { name: "Deep Mandelbrot", fractalType: "mandelbrot", centerX: -0.7435, centerY: 0.1314, zoom: 220, maxIterations: 900 },
            { name: "Classic Julia", fractalType: "julia", juliaReal: -0.8, juliaImag: 0.156, zoom: 1.6, maxIterations: 700 },
            { name: "Burning Ship Harbor", fractalType: "burning_ship", centerX: -1.76, centerY: -0.04, zoom: 250, maxIterations: 950 },
            { name: "Tricorn Spiral", fractalType: "tricorn", centerX: -0.1, centerY: 0.0, zoom: 2.4, maxIterations: 650 },
        ],
        []
    );

    return (
        <div className="fractal-controls-panel">
            <h2 className="fractal-controls-title">Design Controls</h2>

            <div className="fractal-control-group">
                <label className="fractal-label">Fractal Presets</label>
                <button
                    onClick={() => setShowPresets((v) => !v)}
                    className="fractal-dropdown-btn"
                >
                    <span>Load Preset</span>
                    <ChevronIcon open={showPresets} />
                </button>
                {showPresets && (
                    <div className="fractal-preset-list">
                        {presets.map((preset) => (
                            <button
                                key={preset.name}
                                onClick={() => {
                                    onApplyPreset(preset);
                                    setShowPresets(false);
                                }}
                                className="fractal-preset-item"
                            >
                                {preset.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="fractal-control-group">
                <label className="fractal-label">Fractal Type</label>
                <select value={state.fractalType} onChange={(e) => setters.setFractalType(e.target.value)} className="fractal-select">
                    <option value="mandelbrot">Mandelbrot</option>
                    <option value="julia">Julia</option>
                    <option value="burning_ship">Burning Ship</option>
                    <option value="tricorn">Tricorn</option>
                </select>
            </div>

            <div className="fractal-grid-two">
                <div>
                    <label className="fractal-label-sm">Center X</label>
                    <input type="number" step="0.0001" value={state.centerX} onChange={(e) => setters.setCenterX(parseFloat(e.target.value || 0))} className="fractal-input" />
                </div>
                <div>
                    <label className="fractal-label-sm">Center Y</label>
                    <input type="number" step="0.0001" value={state.centerY} onChange={(e) => setters.setCenterY(parseFloat(e.target.value || 0))} className="fractal-input" />
                </div>
            </div>

            <div className="fractal-control-group">
                <label className="fractal-label">Zoom: {state.zoom.toFixed(2)}</label>
                <input type="range" min="0.25" max="500" step="0.25" value={state.zoom} onChange={(e) => setters.setZoom(parseFloat(e.target.value))} className="fractal-range" />
            </div>

            <div className="fractal-control-group">
                <label className="fractal-label">Max Iterations: {state.maxIterations}</label>
                <input type="range" min="50" max="2000" step="10" value={state.maxIterations} onChange={(e) => setters.setMaxIterations(parseInt(e.target.value, 10))} className="fractal-range" />
            </div>

            <div className="fractal-control-group">
                <label className="fractal-label">Escape Radius: {state.escapeRadius.toFixed(1)}</label>
                <input type="range" min="2" max="20" step="0.5" value={state.escapeRadius} onChange={(e) => setters.setEscapeRadius(parseFloat(e.target.value))} className="fractal-range" />
            </div>

            {state.fractalType === "julia" && (
                <div className="fractal-grid-two">
                    <div>
                        <label className="fractal-label-sm">Julia Real (c.re)</label>
                        <input type="number" step="0.001" value={state.juliaReal} onChange={(e) => setters.setJuliaReal(parseFloat(e.target.value || 0))} className="fractal-input" />
                    </div>
                    <div>
                        <label className="fractal-label-sm">Julia Imag (c.im)</label>
                        <input type="number" step="0.001" value={state.juliaImag} onChange={(e) => setters.setJuliaImag(parseFloat(e.target.value || 0))} className="fractal-input" />
                    </div>
                </div>
            )}

            <div className="fractal-control-group">
                <label className="fractal-check">
                    <input type="checkbox" checked={state.useGradient} onChange={(e) => setters.setUseGradient(e.target.checked)} className="fractal-check-input" />
                    Use Gradient Palette
                </label>
            </div>

            {state.useGradient && (
                <div className="fractal-grid-two">
                    <div>
                        <label className="fractal-label-sm">Gradient Start</label>
                        <input type="color" value={state.gradientColorStart} onChange={(e) => setters.setGradientColorStart(e.target.value)} className="fractal-color-input" />
                    </div>
                    <div>
                        <label className="fractal-label-sm">Gradient End</label>
                        <input type="color" value={state.gradientColorEnd} onChange={(e) => setters.setGradientColorEnd(e.target.value)} className="fractal-color-input" />
                    </div>
                </div>
            )}

            <div className="fractal-advanced-wrap">
                <button
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="fractal-dropdown-btn fractal-dropdown-btn-sm"
                >
                    <span>Advanced Features</span>
                    <ChevronIcon open={showAdvanced} />
                </button>

                {showAdvanced && (
                    <div className="fractal-advanced-panel">
                        <div>
                            <label className="fractal-label">Color Power: {state.colorPower.toFixed(2)}</label>
                            <input type="range" min="0.2" max="2.5" step="0.05" value={state.colorPower} onChange={(e) => setters.setColorPower(parseFloat(e.target.value))} className="fractal-range" />
                        </div>

                        <div>
                            <label className="fractal-label">Hue Shift: {state.hueShift.toFixed(2)}</label>
                            <input type="range" min="0" max="1" step="0.01" value={state.hueShift} onChange={(e) => setters.setHueShift(parseFloat(e.target.value))} className="fractal-range" />
                        </div>

                        <div>
                            <label className="fractal-label">Supersample: {state.supersample}x</label>
                            <input type="range" min="1" max="3" step="1" value={state.supersample} onChange={(e) => setters.setSupersample(parseInt(e.target.value, 10))} className="fractal-range" />
                        </div>

                        <div>
                            <label className="fractal-check">
                                <input type="checkbox" checked={state.smoothColoring} onChange={(e) => setters.setSmoothColoring(e.target.checked)} className="fractal-check-input" />
                                Smooth Coloring
                            </label>
                        </div>

                        <div>
                            <label className="fractal-label">Animation Speed: {state.animationSpeed.toFixed(1)}</label>
                            <input type="range" min="0" max="3" step="0.1" value={state.animationSpeed} onChange={(e) => setters.setAnimationSpeed(parseFloat(e.target.value))} className="fractal-range" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

export default function SpirographControls({
    patternMode, onPatternModeChange, patternModes,
    outerRadius, onOuterRadiusChange,
    innerRadius, onInnerRadiusChange,
    distance, onDistanceChange,
    step, onStepChange,
    lineWidth, onLineWidthChange,
    outerLoop, onOuterLoopChange,
    innerLoop, onInnerLoopChange,
    strokeColor, onStrokeColorChange,
    background, onBackgroundChange,
    secondaryColor, onSecondaryColorChange,
    multiLine, onMultiLineChange,
    lineCount, onLineCountChange,
    colors = [], outerRadiusMax
}) {
    const setNum = (setter, fallback = 0) => (e) => {
        const v = Number(e.target.value);
        if (Number.isFinite(v)) setter(v);
        else setter(fallback);
    };

    return (
        <>
            <div className="spiro-card">
                <div className="spiro-card-header">
                    <span className="card-icon">*</span> Pattern Type
                </div>
                <div className="spiro-card-body">
                    <div className="pattern-tabs">
                        {(patternModes || []).map((mode) => (
                            <button
                                key={mode.id}
                                className={`pattern-tab ${patternMode === mode.id ? "active" : ""}`}
                                onClick={() => onPatternModeChange(mode.id)}
                                title={mode.desc}
                            >
                                {mode.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="spiro-card">
                <div className="spiro-card-header">
                    <span className="card-icon">*</span> Parameters
                </div>
                <div className="spiro-card-body">
                    <div className="param-list">
                        <div className="param-item">
                            <div className="param-label-row">
                                <span className="param-label">Outer Radius</span>
                                <span className="param-current-value">{outerRadius}</span>
                            </div>
                            <input className="param-input" type="number" value={outerRadius} onChange={setNum(onOuterRadiusChange, 0)} />
                            <small className="param-help">Base size of the full pattern.</small>
                        </div>

                        <div className="param-item">
                            <div className="param-label-row">
                                <span className="param-label">Inner Radius</span>
                                <span className="param-current-value">{innerRadius}</span>
                            </div>
                            <input className="param-input" type="number" value={innerRadius} onChange={setNum(onInnerRadiusChange, 0)} />
                            <small className="param-help">Size of the rotating inner wheel.</small>
                        </div>

                        <div className="param-item">
                            <div className="param-label-row">
                                <span className="param-label">Pen Distance</span>
                                <span className="param-current-value">{distance}</span>
                            </div>
                            <input className="param-input" type="number" value={distance} onChange={setNum(onDistanceChange, 0)} />
                            <small className="param-help">Distance of pen from the inner wheel center.</small>
                        </div>

                        <div className="param-item">
                            <div className="param-label-row">
                                <span className="param-label">Outer Loop</span>
                                <span className="param-current-value">{outerLoop}</span>
                            </div>
                            <input className="param-input" type="number" step="1" value={outerLoop} onChange={setNum(onOuterLoopChange, 1)} />
                            <small className="param-help">Main repeat count of the shape.</small>
                        </div>

                        <div className="param-item">
                            <div className="param-label-row">
                                <span className="param-label">Inner Loop</span>
                                <span className="param-current-value">{innerLoop}</span>
                            </div>
                            <input className="param-input" type="number" step="1" value={innerLoop} onChange={setNum(onInnerLoopChange, 1)} />
                            <small className="param-help">Secondary repeat count for detail density.</small>
                        </div>

                        <div className="param-item">
                            <div className="param-label-row">
                                <span className="param-label">Drawing Step</span>
                                <span className="param-current-value">{step}</span>
                            </div>
                            <input className="param-input" type="number" step="0.001" value={step} onChange={setNum(onStepChange, 0.001)} />
                            <small className="param-help">Lower step = smoother, higher step = rough and fast.</small>
                        </div>

                        <div className="param-item">
                            <div className="param-label-row">
                                <span className="param-label">Line Width</span>
                                <span className="param-current-value">{lineWidth}px</span>
                            </div>
                            <input className="param-input" type="number" step="0.1" value={lineWidth} onChange={setNum(onLineWidthChange, 0.1)} />
                            <small className="param-help">Stroke thickness of the line.</small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="spiro-card">
                <div className="spiro-card-header">
                    <span className="card-icon">*</span> Colors
                </div>
                <div className="spiro-card-body">
                    <div className="param-list">
                        <div className="param-item">
                            <span className="param-label">Stroke Color</span>
                            <input className="param-input-color" type="color" value={strokeColor} onChange={(e) => onStrokeColorChange(e.target.value)} />
                        </div>

                        <div className="param-item">
                            <span className="param-label">Quick Picks</span>
                            <div className="color-swatches">
                                {colors.slice(0, 10).map((color, i) => (
                                    <div key={i} className={`color-dot ${strokeColor === color ? "active-dot" : ""}`} style={{ backgroundColor: color }} onClick={() => onStrokeColorChange(color)} title={color} />
                                ))}
                            </div>
                        </div>

                        <div className="param-item">
                            <span className="param-label">Background</span>
                            <input className="param-input-color" type="color" value={background} onChange={(e) => onBackgroundChange(e.target.value)} />
                        </div>

                        <div className="toggle-row">
                            <span className="toggle-label">Multi-line Pattern</span>
                            <div className={`toggle-track ${multiLine ? "on" : ""}`} onClick={() => onMultiLineChange(!multiLine)}>
                                <div className="toggle-thumb" />
                            </div>
                        </div>

                        {multiLine && (
                            <>
                                <div className="param-item">
                                    <div className="param-label-row">
                                        <span className="param-label">Line Count</span>
                                        <span className="param-current-value">{lineCount}</span>
                                    </div>
                                    <input className="param-input" type="number" value={lineCount} onChange={setNum(onLineCountChange, 1)} />
                                </div>
                                <div className="param-item">
                                    <span className="param-label">Secondary Color</span>
                                    <input className="param-input-color" type="color" value={secondaryColor} onChange={(e) => onSecondaryColorChange(e.target.value)} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}


"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const CANVAS_SIZE = 640;

function getPoint(patternMode, R, r, d, theta, outerLoop = 1, innerLoop = 1) {
    if (patternMode === "harmonic") {
        return {
            x: (R - r) * Math.cos(theta * outerLoop) + d * Math.cos(theta * innerLoop),
            y: (R - r) * Math.sin(theta * outerLoop) - d * Math.sin(theta * innerLoop),
        };
    }
    if (patternMode === "epitrochoid") {
        return {
            x: (R + r) * Math.cos(theta * outerLoop) - d * Math.cos(((R + r) / r) * theta * innerLoop),
            y: (R + r) * Math.sin(theta * outerLoop) - d * Math.sin(((R + r) / r) * theta * innerLoop),
        };
    }
    return {
        x: (R - r) * Math.cos(theta * outerLoop) + d * Math.cos(((R - r) / r) * theta * innerLoop),
        y: (R - r) * Math.sin(theta * outerLoop) - d * Math.sin(((R - r) / r) * theta * innerLoop),
    };
}

function drawPattern(ctx, p) {
    const { patternMode, outerRadius, innerRadius, distance, step, lineWidth, strokeColor, background, secondaryColor, multiLine, lineCount, outerLoop = 1, innerLoop = 1, zoom = 1, drawProgress = 1, symmetryCount = 1, useGradient = false, gradientStart = "#6366f1", gradientEnd = "#06b6d4", performanceMode = false } = p;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.fillStyle = background || "#ffffff";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;
    const R = Number.isFinite(outerRadius) ? outerRadius : 150;
    const rRaw = Number.isFinite(innerRadius) ? innerRadius : 105;
    const d = Number.isFinite(distance) ? distance : 120;
    const r = Math.abs(rRaw) < 0.0001 ? 0.0001 : rRaw;
    const scale = 1.1 * zoom;
    const qualityFactor = performanceMode ? 0.55 : 1;
    const maxTheta = Math.PI * 2 * 40 * qualityFactor * Math.max(0, Math.min(1, drawProgress));
    const safeStep = (Math.abs(step || 0.001) < 0.0001 ? 0.0001 : Math.abs(step || 0.001)) / qualityFactor;

    const drawSingle = (offset = 0, color = strokeColor, symmetryAngle = 0) => {
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        if (useGradient) {
            const g = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            g.addColorStop(0, gradientStart);
            g.addColorStop(1, gradientEnd);
            ctx.strokeStyle = g;
        } else {
            ctx.strokeStyle = color;
        }
        let started = false;

        for (let t = 0; t <= maxTheta; t += safeStep) {
            const theta = t + offset;
            const point = getPoint(patternMode, R, r, d, theta, outerLoop, innerLoop);
            const baseX = point.x * scale;
            const baseY = point.y * scale;
            const rotX = (baseX * Math.cos(symmetryAngle)) - (baseY * Math.sin(symmetryAngle));
            const rotY = (baseX * Math.sin(symmetryAngle)) + (baseY * Math.cos(symmetryAngle));
            const px = cx + rotX;
            const py = cy + rotY;

            if (!started) {
                ctx.moveTo(px, py);
                started = true;
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();
    };

    const symmetry = Math.max(1, Math.floor(Math.abs(symmetryCount || 1)));
    const drawWithSymmetry = (offset, color) => {
        for (let s = 0; s < symmetry; s += 1) {
            drawSingle(offset, color, (Math.PI * 2 * s) / symmetry);
        }
    };

    if (multiLine) {
        const count = Math.max(1, Math.floor(Math.abs(lineCount || 1)));
        for (let i = 0; i < count; i += 1) {
            const ratio = count === 1 ? 0 : i / (count - 1);
            const color = ratio > 0.5 ? (secondaryColor || strokeColor) : strokeColor;
            drawWithSymmetry((Math.PI * 2 * i) / count, color);
        }
    } else {
        drawWithSymmetry(0, strokeColor);
    }
}

function buildSvg(p) {
    const { patternMode, outerRadius, innerRadius, distance, step, lineWidth, strokeColor, background, secondaryColor, multiLine, lineCount, outerLoop = 1, innerLoop = 1, zoom = 1 } = p;
    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;
    const R = Number.isFinite(outerRadius) ? outerRadius : 150;
    const rRaw = Number.isFinite(innerRadius) ? innerRadius : 105;
    const d = Number.isFinite(distance) ? distance : 120;
    const r = Math.abs(rRaw) < 0.0001 ? 0.0001 : rRaw;
    const scale = 1.1 * zoom;
    const maxTheta = Math.PI * 2 * 40;
    const safeStep = Math.abs(step || 0.001) < 0.0001 ? 0.0001 : Math.abs(step || 0.001);

    const makePath = (offset = 0) => {
        let path = "";
        let started = false;
        for (let t = 0; t <= maxTheta; t += safeStep) {
            const theta = t + offset;
            const point = getPoint(patternMode, R, r, d, theta, outerLoop, innerLoop);
            const px = (cx + point.x * scale).toFixed(2);
            const py = (cy + point.y * scale).toFixed(2);
            path += `${started ? "L" : "M"}${px} ${py} `;
            started = true;
        }
        return path.trim();
    };

    const paths = [];
    if (multiLine) {
        const count = Math.max(1, Math.floor(Math.abs(lineCount || 1)));
        for (let i = 0; i < count; i += 1) {
            const ratio = count === 1 ? 0 : i / (count - 1);
            const color = ratio > 0.5 ? (secondaryColor || strokeColor) : strokeColor;
            paths.push(`<path d="${makePath((Math.PI * 2 * i) / count)}" stroke="${color}" stroke-width="${lineWidth}" fill="none"/>`);
        }
    } else {
        paths.push(`<path d="${makePath()}" stroke="${strokeColor}" stroke-width="${lineWidth}" fill="none"/>`);
    }

    return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" viewBox="0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}"><rect width="100%" height="100%" fill="${background || "#ffffff"}"/>${paths.join("")}</svg>`;
}

export default function SpirographCanvas({ params, onAnimationToggle, onSpeedChange, onRandomize }) {
    const canvasRef = useRef(null);
    const pinchDistanceRef = useRef(null);
    const lastFrameTimeRef = useRef(null);
    const [zoom, setZoom] = useState(1);
    const [drawProgress, setDrawProgress] = useState(1);
    const [exportType, setExportType] = useState("png");
    const [isRecording, setIsRecording] = useState(false);
    const SPEED_OPTIONS = [
        { label: "Slow", value: 0.6 },
        { label: "Medium", value: 1.2 },
        { label: "Fast", value: 2.2 },
        { label: "Turbo", value: 3.5 },
    ];

    const renderParams = useMemo(() => ({ ...params, zoom, drawProgress }), [params, zoom, drawProgress]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        drawPattern(ctx, renderParams);
    }, [renderParams]);

  useEffect(() => {
    if (!params.isAnimating) return;
    let raf;
    const tick = (now) => {
      const last = lastFrameTimeRef.current ?? now;
      const deltaMs = now - last;
      lastFrameTimeRef.current = now;
      setDrawProgress((prev) => {
        const speed = Math.max(0.1, Math.abs(Number(params.animationSpeed) || 1));
        const cycleIncrement = Math.max(deltaMs * 0.00014 * speed, 0.002 * speed);
        let next = prev + cycleIncrement;
        while (next >= 1) next -= 1;
        return next;
      });
      raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(raf);
            lastFrameTimeRef.current = null;
        };
    }, [params.isAnimating, params.animationSpeed]);

    const onTouchStart = (e) => {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            pinchDistanceRef.current = Math.hypot(dx, dy);
        }
    };

    const onTouchMove = (e) => {
        if (e.touches.length !== 2 || !pinchDistanceRef.current) return;
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distanceNow = Math.hypot(dx, dy);
        const ratio = distanceNow / pinchDistanceRef.current;
        pinchDistanceRef.current = distanceNow;
        setZoom((z) => Math.max(0.4, Math.min(3, Number((z * ratio).toFixed(2)))));
    };

    const onTouchEnd = () => {
        pinchDistanceRef.current = null;
    };

    const exportFile = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (exportType === "svg") {
            const svg = buildSvg({ ...params, zoom });
            const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `spirograph-${Date.now()}.svg`;
            a.click();
            URL.revokeObjectURL(url);
            return;
        }

        const mime = exportType === "jpg" ? "image/jpeg" : "image/png";
        const ext = exportType === "jpg" ? "jpg" : "png";
        const a = document.createElement("a");
        a.href = canvas.toDataURL(mime, 0.95);
        a.download = `spirograph-${Date.now()}.${ext}`;
        a.click();
    };

    const handlePlayPause = () => {
        if (!params.isAnimating) {
            // instant visual response on play click
            setDrawProgress((prev) => (prev >= 0.999 ? 0.01 : Math.min(0.99, prev + 0.01)));
            lastFrameTimeRef.current = performance.now();
        }
        onAnimationToggle();
    };

    const exportVideo = async () => {
        const canvas = canvasRef.current;
        if (!canvas || isRecording) return;

        setIsRecording(true);
        const startProgress = drawProgress;

        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
        const chunks = [];

        recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: "video/webm" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `spirograph-${Date.now()}.webm`;
            a.click();
            URL.revokeObjectURL(url);
            setIsRecording(false);
        };

        recorder.start(200);
        let progress = startProgress;
        const speed = Math.max(0.2, params.animationSpeed || 1);
        const stepDelta = 0.004 * speed;
        const startedAt = performance.now();
        const recordForMs = 6000;

        const tick = () => {
            progress = progress + stepDelta;
            if (progress > 1) progress -= 1;
            setDrawProgress(progress);
            if (performance.now() - startedAt < recordForMs) {
                requestAnimationFrame(tick);
            } else {
                setTimeout(() => recorder.stop(), 250);
            }
        };
        requestAnimationFrame(tick);
    };

    return (
        <section className="spirograph-canvas-wrap">
            <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            />
            <div className="canvas-actions">
                <div className="canvas-actions-row">
                    <div className="canvas-action-group">
                        <button type="button" className="btn btn-primary" onClick={onRandomize}>Random</button>
            <button type="button" className="btn btn-primary" onClick={handlePlayPause}>{params.isAnimating ? "Pause" : "Play"}</button>
                    </div>
                    <div className="canvas-action-group">
                        <button type="button" className="btn btn-primary" onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}>-</button>
                        <button type="button" className="btn btn-primary" onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))}>+</button>
                        <button type="button" className="btn btn-primary" onClick={() => setZoom(1)}>Reset Zoom</button>
                    </div>
                </div>

                <div className="canvas-actions-row canvas-actions-meta">
                    <label className="canvas-speed">Zoom %
                        <input type="number" min="40" max="300" step="5" value={Math.round(zoom * 100)} onChange={(e) => {
                            const next = Number(e.target.value || 100) / 100;
                            setZoom(Math.max(0.4, Math.min(3, next)));
                        }} />
                    </label>

                    <label className="canvas-speed">Speed
                        <select
                            className="canvas-select"
                            value={String(params.animationSpeed || 1.2)}
                            onChange={(e) => onSpeedChange(Number(e.target.value))}
                        >
                            {SPEED_OPTIONS.map((opt) => (
                                <option key={opt.label} value={String(opt.value)}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="canvas-export-row">
                    <select className="canvas-select canvas-export-select" value={exportType} onChange={(e) => setExportType(e.target.value)}>
                        <option value="png">PNG</option>
                        <option value="jpg">JPG</option>
                        <option value="svg">SVG</option>
                        <option value="video">Video (WebM)</option>
                    </select>
                    <button
                        type="button"
                        className="btn btn-accent canvas-export-btn"
                        onClick={exportType === "video" ? exportVideo : exportFile}
                        disabled={isRecording}
                    >
                        {isRecording ? "Recording..." : "Export"}
                    </button>
                </div>
            </div>

        </section>
    );
}

"use client";

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";

const FRACTAL_TYPES = {
    mandelbrot: "mandelbrot",
    julia: "julia",
    burning_ship: "burning_ship",
    tricorn: "tricorn",
};

function hexToRgb(hex) {
    const cleaned = hex.replace("#", "");
    const full = cleaned.length === 3
        ? cleaned.split("").map((c) => c + c).join("")
        : cleaned;
    const int = Number.parseInt(full, 16);
    if (!Number.isFinite(int)) return [255, 255, 255];
    return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

const FractalCanvas = forwardRef(function FractalCanvas(
    {
        fractalType,
        centerX,
        centerY,
        zoom,
        maxIterations,
        escapeRadius,
        juliaReal,
        juliaImag,
        useGradient,
        gradientColorStart,
        gradientColorEnd,
        smoothColoring,
        colorPower,
        hueShift,
        animationSpeed,
        supersample,
        interactive,
    },
    ref
) {
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const phaseRef = useRef(0);
    const dragRef = useRef({ dragging: false, startX: 0, startY: 0, startCenterX: 0, startCenterY: 0 });
    const viewRef = useRef({ centerX, centerY, zoom });
    const onViewChangeRef = useRef(null);

    useEffect(() => {
        viewRef.current = { centerX, centerY, zoom };
    }, [centerX, centerY, zoom]);

    const renderFractal = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const width = canvas.width;
        const height = canvas.height;

        const img = ctx.createImageData(width, height);
        const data = img.data;

        const [r1, g1, b1] = hexToRgb(gradientColorStart);
        const [r2, g2, b2] = hexToRgb(gradientColorEnd);
        const currentView = viewRef.current;
        const radius2 = escapeRadius * escapeRadius;
        const effectiveHue = (hueShift + phaseRef.current) % 1;

        const ss = Math.max(1, supersample);
        const sampleCount = ss * ss;

        for (let py = 0; py < height; py++) {
            for (let px = 0; px < width; px++) {
                let accumR = 0;
                let accumG = 0;
                let accumB = 0;

                for (let sy = 0; sy < ss; sy++) {
                    for (let sx = 0; sx < ss; sx++) {
                        const ux = (px + (sx + 0.5) / ss) / width;
                        const uy = (py + (sy + 0.5) / ss) / height;

                        const x0 = (ux - 0.5) * 3.2 / currentView.zoom + currentView.centerX;
                        const y0 = (uy - 0.5) * 2.2 / currentView.zoom + currentView.centerY;

                        let x;
                        let y;
                        let cx;
                        let cy;

                        if (fractalType === FRACTAL_TYPES.julia) {
                            x = x0;
                            y = y0;
                            cx = juliaReal;
                            cy = juliaImag;
                        } else {
                            x = 0;
                            y = 0;
                            cx = x0;
                            cy = y0;
                        }

                        let iter = 0;
                        let xx = 0;
                        let yy = 0;

                        while (iter < maxIterations) {
                            if (fractalType === FRACTAL_TYPES.burning_ship) {
                                x = Math.abs(x);
                                y = Math.abs(y);
                                xx = x * x - y * y + cx;
                                yy = 2 * x * y + cy;
                            } else if (fractalType === FRACTAL_TYPES.tricorn) {
                                xx = x * x - y * y + cx;
                                yy = -2 * x * y + cy;
                            } else {
                                xx = x * x - y * y + cx;
                                yy = 2 * x * y + cy;
                            }

                            x = xx;
                            y = yy;

                            if (x * x + y * y > radius2) break;
                            iter++;
                        }

                        if (iter >= maxIterations) {
                            accumR += 8;
                            accumG += 12;
                            accumB += 20;
                        } else {
                            let t = iter / maxIterations;

                            if (smoothColoring) {
                                const mod = Math.sqrt(x * x + y * y);
                                if (mod > 1) {
                                    const mu = iter + 1 - Math.log2(Math.log2(mod));
                                    t = Math.max(0, Math.min(1, mu / maxIterations));
                                }
                            }

                            t = Math.pow(t, Math.max(0.1, colorPower));
                            const shifted = (t + effectiveHue) % 1;

                            if (useGradient) {
                                accumR += Math.round(lerp(r1, r2, shifted));
                                accumG += Math.round(lerp(g1, g2, shifted));
                                accumB += Math.round(lerp(b1, b2, shifted));
                            } else {
                                const h = shifted * 360;
                                const c = 0.85;
                                const xh = c * (1 - Math.abs(((h / 60) % 2) - 1));
                                let rr = 0;
                                let gg = 0;
                                let bb = 0;
                                if (h < 60) [rr, gg, bb] = [c, xh, 0];
                                else if (h < 120) [rr, gg, bb] = [xh, c, 0];
                                else if (h < 180) [rr, gg, bb] = [0, c, xh];
                                else if (h < 240) [rr, gg, bb] = [0, xh, c];
                                else if (h < 300) [rr, gg, bb] = [xh, 0, c];
                                else [rr, gg, bb] = [c, 0, xh];
                                const m = 0.1;
                                accumR += Math.round((rr + m) * 255);
                                accumG += Math.round((gg + m) * 255);
                                accumB += Math.round((bb + m) * 255);
                            }
                        }
                    }
                }

                const offset = (py * width + px) * 4;
                data[offset] = Math.round(accumR / sampleCount);
                data[offset + 1] = Math.round(accumG / sampleCount);
                data[offset + 2] = Math.round(accumB / sampleCount);
                data[offset + 3] = 255;
            }
        }

        ctx.putImageData(img, 0, 0);
    }, [
        fractalType,
        maxIterations,
        escapeRadius,
        juliaReal,
        juliaImag,
        useGradient,
        gradientColorStart,
        gradientColorEnd,
        smoothColoring,
        colorPower,
        hueShift,
        supersample,
    ]);

    useImperativeHandle(ref, () => ({
        toDataURL: (type = "image/png", quality) => {
            if (!canvasRef.current) return null;
            return canvasRef.current.toDataURL(type, quality);
        },
        getViewState: () => ({ ...viewRef.current }),
        setViewState: (view) => {
            if (!view) return;
            viewRef.current = {
                centerX: Number.isFinite(view.centerX) ? view.centerX : viewRef.current.centerX,
                centerY: Number.isFinite(view.centerY) ? view.centerY : viewRef.current.centerY,
                zoom: Number.isFinite(view.zoom) ? Math.max(0.1, view.zoom) : viewRef.current.zoom,
            };
            if (onViewChangeRef.current) {
                onViewChangeRef.current(viewRef.current);
            }
        },
        setOnViewChange: (fn) => {
            onViewChangeRef.current = fn;
        },
        renderNow: () => renderFractal(),
    }));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = Math.max(640, Math.floor(rect.width));
        canvas.height = 640;
        renderFractal();
    }, [renderFractal]);

    useEffect(() => {
        renderFractal();
    }, [centerX, centerY, zoom, renderFractal]);

    useEffect(() => {
        if (animationSpeed <= 0) {
            if (animRef.current) {
                cancelAnimationFrame(animRef.current);
                animRef.current = null;
            }
            return;
        }

        let frame;
        const tick = () => {
            phaseRef.current = (phaseRef.current + animationSpeed * 0.0025) % 1;
            renderFractal();
            frame = requestAnimationFrame(tick);
            animRef.current = frame;
        };

        tick();
        return () => {
            if (frame) cancelAnimationFrame(frame);
        };
    }, [animationSpeed, renderFractal]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !interactive) return undefined;

        const getWorldFromScreen = (clientX, clientY) => {
            const rect = canvas.getBoundingClientRect();
            const x = ((clientX - rect.left) / rect.width - 0.5) * 3.2 / viewRef.current.zoom + viewRef.current.centerX;
            const y = ((clientY - rect.top) / rect.height - 0.5) * 2.2 / viewRef.current.zoom + viewRef.current.centerY;
            return { x, y };
        };

        const pushView = (next) => {
            viewRef.current = next;
            renderFractal();
            if (onViewChangeRef.current) onViewChangeRef.current(next);
        };

        const onPointerDown = (e) => {
            dragRef.current.dragging = true;
            dragRef.current.startX = e.clientX;
            dragRef.current.startY = e.clientY;
            dragRef.current.startCenterX = viewRef.current.centerX;
            dragRef.current.startCenterY = viewRef.current.centerY;
            dragRef.current.moved = false;
            canvas.setPointerCapture?.(e.pointerId);
            canvas.style.cursor = "grabbing";
        };

        const onPointerMove = (e) => {
            if (!dragRef.current.dragging) return;
            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                dragRef.current.moved = true;
            }
            const next = {
                ...viewRef.current,
                centerX: dragRef.current.startCenterX - (dx / canvas.width) * 3.2 / viewRef.current.zoom,
                centerY: dragRef.current.startCenterY - (dy / canvas.height) * 2.2 / viewRef.current.zoom,
            };
            pushView(next);
        };

        const onPointerUp = (e) => {
            dragRef.current.dragging = false;
            canvas.releasePointerCapture?.(e.pointerId);
            canvas.style.cursor = "crosshair";
        };

        const onClick = (e) => {
            if (dragRef.current.dragging || dragRef.current.moved) return;
            if (e.button !== 0) return;
            const world = getWorldFromScreen(e.clientX, e.clientY);
            pushView({ centerX: world.x, centerY: world.y, zoom: viewRef.current.zoom * 1.8 });
        };

        const onContextMenu = (e) => {
            e.preventDefault();
            const world = getWorldFromScreen(e.clientX, e.clientY);
            pushView({ centerX: world.x, centerY: world.y, zoom: Math.max(0.25, viewRef.current.zoom / 1.8) });
        };

        const onWheel = (e) => {
            e.preventDefault();
            const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
            pushView({ ...viewRef.current, zoom: Math.max(0.1, viewRef.current.zoom * factor) });
        };

        canvas.style.cursor = "crosshair";
        canvas.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        canvas.addEventListener("click", onClick);
        canvas.addEventListener("contextmenu", onContextMenu);
        canvas.addEventListener("wheel", onWheel, { passive: false });

        return () => {
            canvas.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
            canvas.removeEventListener("click", onClick);
            canvas.removeEventListener("contextmenu", onContextMenu);
            canvas.removeEventListener("wheel", onWheel);
            canvas.style.cursor = "";
        };
    }, [interactive, renderFractal]);

    return (
        <div className="fractal-canvas-wrap">
            <canvas ref={canvasRef} className="fractal-canvas-el" />
        </div>
    );
});

export default FractalCanvas;

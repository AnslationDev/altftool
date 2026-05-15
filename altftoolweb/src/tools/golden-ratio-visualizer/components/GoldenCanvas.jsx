"use client";

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";

const PHI = (1 + Math.sqrt(5)) / 2;

function hexToRgba(hex, alpha = 1) {
    const clean = hex.replace("#", "");
    const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
    const n = Number.parseInt(full, 16);
    if (!Number.isFinite(n)) return `rgba(255,255,255,${alpha})`;
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${alpha})`;
}

const GoldenCanvas = forwardRef(function GoldenCanvas(
    {
        canvasSize,
        backgroundColor,
        useGradientBackground,
        gradientStart,
        gradientEnd,
        showFibonacciGrid,
        showGoldenSpiral,
        showPhiGrid,
        showRuleOfThirds,
        showDiagonalGuides,
        tileCount,
        strokeColor,
        fillOpacity,
        strokeWidth,
        rotateDeg,
        spiralDirection,
        animateRotation,
        animationSpeed,
        lineStyle,
    },
    ref
) {
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const phaseRef = useRef(0);

    const setupLineStyle = (ctx) => {
        if (lineStyle === "dashed") {
            ctx.setLineDash([8, 6]);
        } else if (lineStyle === "dotted") {
            ctx.setLineDash([2, 6]);
        } else {
            ctx.setLineDash([]);
        }
    };

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        if (useGradientBackground) {
            const bg = ctx.createLinearGradient(0, 0, w, h);
            bg.addColorStop(0, gradientStart);
            bg.addColorStop(1, gradientEnd);
            ctx.fillStyle = bg;
        } else {
            ctx.fillStyle = backgroundColor;
        }
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(((rotateDeg + phaseRef.current) * Math.PI) / 180);
        ctx.translate(-w / 2, -h / 2);

        const base = Math.min(w, h) * 0.84;
        const seq = [1, 1];
        while (seq.length < Math.max(3, tileCount)) {
            const n = seq[seq.length - 1] + seq[seq.length - 2];
            seq.push(n);
        }
        const maxFib = seq[seq.length - 1];
        const unit = base / maxFib;

        let x = (w - base) / 2;
        let y = (h - base / PHI) / 2;

        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeColor;
        setupLineStyle(ctx);

        const rects = [];
        let dir = 0;
        for (let i = seq.length - 1; i >= 1; i--) {
            const a = seq[i] * unit;
            const b = seq[i - 1] * unit;
            rects.push({ x, y, w: a, h: b, dir });
            if (dir === 0) {
                x += a - b;
            } else if (dir === 1) {
                y += b;
            } else if (dir === 2) {
                x -= b;
            } else {
                y -= a - b;
            }
            dir = (dir + (spiralDirection === "clockwise" ? 1 : 3)) % 4;
        }

        if (showFibonacciGrid) {
            rects.forEach((r, idx) => {
                ctx.fillStyle = hexToRgba(strokeColor, fillOpacity * (0.15 + (idx % 4) * 0.08));
                ctx.fillRect(r.x, r.y, r.w, r.h);
                ctx.strokeRect(r.x, r.y, r.w, r.h);
            });
        }

        if (showGoldenSpiral) {
            ctx.beginPath();
            rects.forEach((r, idx) => {
                const radius = Math.min(r.w, r.h);
                let cx = r.x;
                let cy = r.y;
                let start = 0;
                if (r.dir === 0) {
                    cx = r.x;
                    cy = r.y + r.h;
                    start = -Math.PI / 2;
                } else if (r.dir === 1) {
                    cx = r.x;
                    cy = r.y;
                    start = 0;
                } else if (r.dir === 2) {
                    cx = r.x + r.w;
                    cy = r.y;
                    start = Math.PI / 2;
                } else {
                    cx = r.x + r.w;
                    cy = r.y + r.h;
                    start = Math.PI;
                }
                const end = start + (spiralDirection === "clockwise" ? Math.PI / 2 : -Math.PI / 2);
                ctx.arc(cx, cy, radius, start, end, spiralDirection !== "clockwise");
                if (idx === 0) ctx.moveTo(cx, cy);
            });
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth * 1.6;
            ctx.stroke();
        }

        ctx.setLineDash([]);
        if (showPhiGrid) {
            const px = w / PHI;
            const py = h / PHI;
            ctx.strokeStyle = hexToRgba(strokeColor, 0.6);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px, 0);
            ctx.lineTo(px, h);
            ctx.moveTo(w - px, 0);
            ctx.lineTo(w - px, h);
            ctx.moveTo(0, py);
            ctx.lineTo(w, py);
            ctx.moveTo(0, h - py);
            ctx.lineTo(w, h - py);
            ctx.stroke();
        }

        if (showRuleOfThirds) {
            ctx.strokeStyle = hexToRgba(strokeColor, 0.35);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(w / 3, 0);
            ctx.lineTo(w / 3, h);
            ctx.moveTo((2 * w) / 3, 0);
            ctx.lineTo((2 * w) / 3, h);
            ctx.moveTo(0, h / 3);
            ctx.lineTo(w, h / 3);
            ctx.moveTo(0, (2 * h) / 3);
            ctx.lineTo(w, (2 * h) / 3);
            ctx.stroke();
        }

        if (showDiagonalGuides) {
            ctx.strokeStyle = hexToRgba(strokeColor, 0.28);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(w, h);
            ctx.moveTo(w, 0);
            ctx.lineTo(0, h);
            ctx.stroke();
        }

        ctx.restore();
    }, [
        backgroundColor,
        canvasSize,
        fillOpacity,
        gradientEnd,
        gradientStart,
        lineStyle,
        rotateDeg,
        showDiagonalGuides,
        showFibonacciGrid,
        showGoldenSpiral,
        showPhiGrid,
        showRuleOfThirds,
        spiralDirection,
        strokeColor,
        strokeWidth,
        tileCount,
        useGradientBackground,
    ]);

    useImperativeHandle(ref, () => ({
        toDataURL: (type = "image/png", quality) => {
            if (!canvasRef.current) return null;
            return canvasRef.current.toDataURL(type, quality);
        },
        renderNow: () => render(),
    }));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        render();
    }, [canvasSize, render]);

    useEffect(() => {
        if (!animateRotation || animationSpeed <= 0) {
            if (animRef.current) cancelAnimationFrame(animRef.current);
            animRef.current = null;
            phaseRef.current = 0;
            render();
            return;
        }

        let frame;
        const tick = () => {
            phaseRef.current = (phaseRef.current + animationSpeed * 0.35) % 360;
            render();
            frame = requestAnimationFrame(tick);
            animRef.current = frame;
        };

        tick();
        return () => {
            if (frame) cancelAnimationFrame(frame);
        };
    }, [animateRotation, animationSpeed, render]);

    return (
        <div className="golden-canvas-wrap">
            <canvas ref={canvasRef} className="golden-canvas-el" />
        </div>
    );
});

export default GoldenCanvas;

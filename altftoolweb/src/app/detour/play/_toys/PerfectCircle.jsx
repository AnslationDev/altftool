"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { scoreStroke, verdictFor } from "@altftool/core/detour/scoreCircle";

/*
 * Draw a circle in one stroke; get scored on how round it was.
 *
 * The scoring maths lives in @altftool/core/detour/scoreCircle so it can be
 * unit-tested without a browser — it is the only part of this page with a right
 * and a wrong answer. Everything here is pointer handling and canvas drawing.
 */

export default function PerfectCircle() {
  const canvasRef = useRef(null);
  const pointsRef = useRef([]);
  const drawingRef = useRef(false);

  const [result, setResult] = useState(null);
  const [best, setBest] = useState(null);
  const [message, setMessage] = useState("Draw a circle in one stroke.");

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== rect.width * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width: rect.width, height: rect.height };
  }, []);

  const clear = useCallback(() => {
    const setup = setupCanvas();
    if (!setup) return;
    setup.ctx.clearRect(0, 0, setup.width, setup.height);
  }, [setupCanvas]);

  const redraw = useCallback(
    (finished) => {
      const setup = setupCanvas();
      if (!setup) return;
      const { ctx, width, height } = setup;
      ctx.clearRect(0, 0, width, height);

      const points = pointsRef.current;
      if (points.length < 2) return;

      // Canvas does not resolve CSS custom properties, so both colours are read
      // off the element's computed style. That also keeps the stroke correct
      // when the platform theme toggle flips light/dark under us.
      const styles = getComputedStyle(canvasRef.current);
      const accent = styles.getPropertyValue("--dtr-accent").trim() || styles.color;
      const ink = styles.color;

      // The reference circle sits under the stroke so the gap is visible.
      if (finished) {
        ctx.beginPath();
        ctx.arc(finished.cx, finished.cy, finished.radius, 0, Math.PI * 2);
        ctx.strokeStyle = accent;
        ctx.setLineDash([5, 6]);
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = ink;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    },
    [setupCanvas],
  );

  const pointFrom = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const start = (event) => {
    event.preventDefault();
    drawingRef.current = true;
    pointsRef.current = [pointFrom(event)];
    setResult(null);
    setMessage("Keep going…");
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const move = (event) => {
    if (!drawingRef.current) return;
    event.preventDefault();
    pointsRef.current.push(pointFrom(event));
    redraw(null);
  };

  const end = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;

    const scored = scoreStroke(pointsRef.current);
    if (!scored) {
      setMessage("That needs to be one closed loop. Try again.");
      redraw(null);
      return;
    }

    redraw(scored);
    const rounded = Math.round(scored.score * 10) / 10;
    setResult(rounded);
    setMessage(verdictFor(rounded));
    setBest((current) => (current === null || rounded > current ? rounded : current));
  };

  const reset = () => {
    pointsRef.current = [];
    setResult(null);
    setMessage("Draw a circle in one stroke.");
    clear();
  };

  useEffect(() => {
    const onResize = () => redraw(null);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [redraw]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="dtr-toy-stage relative w-full max-w-xl aspect-square rounded-2xl border border-border bg-card">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none text-foreground"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          onPointerLeave={end}
          aria-label="Drawing area. Draw a circle with the mouse or your finger."
          role="img"
        />
        {result !== null ? (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
            <div
              className="font-mono text-5xl font-bold sm:text-7xl"
              style={{ color: "var(--dtr-accent)" }}
            >
              {result.toFixed(1)}%
            </div>
          </div>
        ) : null}
      </div>

      <p className="min-h-6 text-center text-sm text-muted-foreground" aria-live="polite">
        {message}
      </p>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
        {best !== null ? (
          <p className="font-mono text-sm text-muted-foreground">
            Best: <span className="font-semibold text-foreground">{best.toFixed(1)}%</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}

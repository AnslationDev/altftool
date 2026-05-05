"use client";
import { useEffect, useRef } from "react";
import { drawFrame } from "../utils/drawFrame";
import { resolveAnimation } from "../utils/motionBuilder";
import { applyEasing } from "../utils/easing";

export default function PreviewCanvas({
  slide,
  duration,
  easing,
  onFocusChange,
  splitConfig,
  hook,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  function handleClick(e) {
    if (!slide) return;

    const rect = canvasRef.current.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onFocusChange(slide.id, {
      focus: { x, y, zoom: slide.focus?.zoom ?? 1.2 },
    });
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width,
      H = canvas.height;
    if (!slide?.img) {
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, W, H);
      return;
    }
    const timing = {
      entryAnim: slide.entryAnim ?? "none",
      exitAnim: slide.exitAnim ?? "none",
      entryFrac: slide.entryFrac ?? 0.5,
      exitFrac: slide.exitFrac ?? 0.5,
      hook: hook?.enabled ? hook : null,
    };

    const animation = resolveAnimation(slide);
    const durationMs = (duration || 2.5) * 1000;
    let start = null;

    function loop(t) {
      if (!start) start = t;
      const raw = ((t - start) % durationMs) / durationMs;
      // Pass layers array so drawFrame renders all layers
      drawFrame(
        ctx,
        slide.img,
        animation,
        applyEasing(raw, easing),
        W,
        H,
        slide.layers,
        timing,
        splitConfig ?? null,
      );
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [slide, duration, easing, onFocusChange, splitConfig, hook]);

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <div
        className="relative rounded-xl overflow-hidden border border-(--border) bg-black "
        style={{
          width: splitConfig ? "min(320px, 80vw)" : "min(200px, 50vw)",
          aspectRatio: "9 / 16",
        }}
      >
        <canvas
          ref={canvasRef}
          width={360}
          height={640}
          onClick={handleClick}
          className="w-full h-full"
          style={{ display: "block" }}
        />
        {slide && (
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
            {splitConfig ? "Split preview" : "Live preview"}
          </span>
        )}
        {!slide && (
          <div className="absolute bg-(--card) inset-0 flex items-center justify-center text-(--muted-foreground) text-xs">
            No slide selected
          </div>
        )}
      </div>
    </div>
  );
}

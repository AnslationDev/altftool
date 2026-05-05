"use client";
import { useState, useCallback } from "react";
import { drawFrame } from "../utils/drawFrame";
import { resolveAnimation } from "../utils/motionBuilder";
import { applyEasing } from "../utils/easing";
import { buildLoopSequence } from "../utils/loopBuilder";

export function useVideoGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress]         = useState(0);
  const [videoUrl, setVideoUrl]         = useState(null);

  const generate = useCallback((slides, globalDuration, easing, loopType, splitConfig = null , hook = null, maskDuration = 0.4) => {
    const sequence = buildLoopSequence(slides, loopType);
    if (!slides.length) return;
    setIsGenerating(true);
    setProgress(0);
    setVideoUrl(null);

    const W = 720, H = 1280;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");

    const stream   = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks   = [];

    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    recorder.onstop = () => {
      setVideoUrl(URL.createObjectURL(new Blob(chunks, { type: "video/webm" })));
      setIsGenerating(false);
      setProgress(100);
    };

    let idx = 0, slideStart = null;
    recorder.start();

    function tick(t) {
      if (idx >=  sequence.length) { recorder.stop(); return; }
      if (!slideStart) slideStart = t;

      const slide    = sequence[idx];
      const nextSlide = sequence[idx + 1] ?? null;
      const duration = (slide.duration ?? globalDuration) * 1000;
      const raw      = Math.min((t - slideStart) / duration, 1);
      const p        = applyEasing(raw, easing);
      const anim     = resolveAnimation(slide);

         // Build timing descriptor from per-slide settings
      const timing = {
        entryAnim: slide.entryAnim  ?? "fadeIn",
        exitAnim:  slide.exitAnim   ?? "fadeOut",
        entryFrac: slide.entryFrac  ?? 0.2,
        exitFrac:  slide.exitFrac   ?? 0.2,
        focus: slide.focus,
       hook:      (idx === 0 && hook?.enabled) ? hook : null,   // only first slide gets hook
      };

        // ── Build transitionConfig if slide has mask + exit phase active ──
  const hasMask      = slide.maskTransition && slide.maskTransition !== "none";
  const inExitPhase  = raw > (1 - maskDuration);
  const maskProgress = inExitPhase
    ? (raw - (1 - maskDuration)) / maskDuration
    : 0;

  const transitionConfig = (hasMask && inExitPhase && nextSlide)
    ? {
        mask:        slide.maskTransition,
        currentImg:  slide.img,
        nextImg:     nextSlide.img,
        progress:    maskProgress,
      }
    : null;

      // Pass slide.layers so all text/shape overlays are baked into the video
      drawFrame(ctx, slide.img, anim, p, W, H,slide.layers ?? null, timing, splitConfig, transitionConfig );
      setProgress(Math.round(((idx + raw) / sequence.length) * 100));

      if (raw >= 1) { idx++; slideStart = null; }
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, []);

  return { generate, isGenerating, progress, videoUrl, setVideoUrl };
}

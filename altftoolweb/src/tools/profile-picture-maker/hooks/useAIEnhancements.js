"use client";

import { useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// FILE: useAIEnhancements.js  (lives in /hooks/ folder)
// ─────────────────────────────────────────────────────────────────────────────

export default function useAIEnhancements({
  brightness,
  contrast,
  saturation,
  setBrightness,
  setContrast,
  setSaturation,
  faceFocus,
  setFaceFocus,
  skinSmooth,
  setSkinSmooth,
  eyeSharpen,
  setEyeSharpen,
  setZoom,  // passed from MainComponent — needed for Face Focus
  setBlur,  // passed from MainComponent — needed for Skin Smooth
}) {

  // ─── Auto Enhance ───────────────────────────────────────────────────────────
  // Reads current values and nudges intelligently instead of hardcoding
  const autoEnhance = useCallback(() => {
    const targetBrightness = brightness < 90 ? 118 : brightness > 130 ? 105 : 110;
    const targetContrast   = contrast  < 95  ? 125 : contrast  > 140  ? 112 : 115;
    const targetSaturation = saturation < 90 ? 125 : saturation > 150 ? 105 : 115;
    setBrightness(targetBrightness);
    setContrast(targetContrast);
    setSaturation(targetSaturation);
    if (setBlur) setBlur(0); // reset blur on auto enhance
  }, [brightness, contrast, saturation, setBrightness, setContrast, setSaturation, setBlur]);

  // ─── Face Focus ─────────────────────────────────────────────────────────────
  // Accepts `next` boolean directly (JSX does onChange={() => ai.setFaceFocus(!ai.faceFocus))
  // Side effect: zooms canvas in/out so face fills the frame
  const handleFaceFocus = useCallback((next) => {
    setFaceFocus(next);
    if (setZoom) setZoom(next ? 1.28 : 1); // ← actual visual effect on canvas
  }, [setFaceFocus, setZoom]);

  // ─── Skin Smooth ────────────────────────────────────────────────────────────
  // Accepts `next` boolean directly
  // Side effect: sets blur on canvas — 1.5px softens skin tones visually
  const handleSkinSmooth = useCallback((next) => {
    setSkinSmooth(next);
    if (setBlur) setBlur(next ? 1.5 : 0); // ← actual visual effect on canvas
  }, [setSkinSmooth, setBlur]);

  // ─── Sharpen Eyes ───────────────────────────────────────────────────────────
  // Accepts `next` boolean directly
  // Side effect: bumps contrast — makes eyes pop against softened skin
  // Uses captured `contrast` value directly (NOT functional updater) because
  // setContrast is a plain useState setter — functional updater would set it to a function ref
  const handleEyeSharpen = useCallback((next) => {
    setEyeSharpen(next);
   setContrast(prev =>
  next ? Math.min(200, prev + 20) : Math.max(50, prev - 20)
);
  }, [setEyeSharpen, setContrast]);

  // ─── Lighting Presets ───────────────────────────────────────────────────────
  const applyPreset = useCallback((type) => {
    if (type === "studio") {
      setBrightness(122); setContrast(128); setSaturation(105);
      if (setBlur) setBlur(0);
    }
    if (type === "natural") {
      setBrightness(108); setContrast(102); setSaturation(118);
      if (setBlur) setBlur(0);
    }
    if (type === "night") {
      setBrightness(82); setContrast(148); setSaturation(88);
      if (setBlur) setBlur(0);
    }
  }, [setBrightness, setContrast, setSaturation, setBlur]);

  return {
    faceFocus,
    setFaceFocus:  handleFaceFocus,   // ✅ has zoom side-effect
    skinSmooth,
    setSkinSmooth: handleSkinSmooth,  // ✅ has blur side-effect
    eyeSharpen,
    setEyeSharpen: handleEyeSharpen,  // ✅ has contrast side-effect
    autoEnhance,
    applyPreset,
  };
}

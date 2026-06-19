/* ================================================================
   ALTF Love IMG — AI engine abstraction layer.

   These functions are intentionally provider-agnostic so a future
   hosted model can be swapped in WITHOUT touching the UI. The default
   implementations run 100% in the browser (no backend, no uploads):
     - background removal  → @imgly/background-removal (WASM, on-device)
     - upscaling           → high-quality canvas resample + unsharp mask

   To integrate a future remote/AI provider, replace the body of the
   relevant function (or branch on an `engine` argument) and keep the
   same { blob } resolution contract.
================================================================ */

import { loadImage, upscale as canvasUpscale } from "./imageProcessing";

/**
 * Remove an image background entirely on-device.
 * @returns {Promise<{ blob: Blob }>}
 */
export async function removeBackground(file, { onProgress } = {}) {
  // Dynamically imported so the (large) model code never bloats other pages.
  const mod = await import("@imgly/background-removal");
  const removeBg = mod.removeBackground || mod.default?.removeBackground || mod.default;
  const blob = await removeBg(file, {
    output: { format: "image/png" },
    progress: (key, current, total) => {
      if (onProgress && total) onProgress(Math.round((current / total) * 100), key);
    },
  });
  return { blob };
}

/**
 * Enhance + enlarge an image. Browser-based today; the signature is ready
 * for a future super-resolution model (same return contract).
 * @returns {Promise<{ blob: Blob, width: number, height: number }>}
 */
export async function enhanceImage(file, { factor = 2, sharpen = 25 } = {}) {
  const { img } = await loadImage(file);
  const { blob, width, height } = await canvasUpscale(img, { factor, sharpen, type: "image/png" });
  return { blob, width, height };
}

/** Whether the on-device background removal engine is available. */
export const BACKGROUND_ENGINE = "on-device (WASM)";
export const UPSCALE_ENGINE = "browser enhance";

import { applyEntry, applyExit, computeTransitionProgress } from "./transitions.js";
import { extractDominantColor, animatedGradientColors, toRgba } from "./colorExtractor.js";
import { getLayoutSlots, coverFit } from "./splitScreen.js";
import { drawHookText } from "./hookPresets.js";
import { drawMaskTransition } from "./maskTransitions.js";

export function drawFrame(ctx, img, animation, p, W, H, layers = null , timing={}, splitConfig = null, transitionConfig = null) {

  ctx.clearRect(0, 0, W, H);

if (img) {
  drawGradientBackground(ctx, img, p, W, H);
} else {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
}

  if (!img) return;

  if (splitConfig && splitConfig.layout !== "none") {
    drawSplitScreen(ctx, splitConfig, p, W, H);
    return;
  }

if (transitionConfig && transitionConfig.mask !== "none") {
  const handled = drawMaskTransition(
    ctx,
    transitionConfig.currentImg,
    transitionConfig.nextImg,
    transitionConfig.mask,
    transitionConfig.progress,
    W, H
  );
  if (handled) {

    if (timing?.hook)      drawHookText(ctx, timing.hook, p, W, H);
    if (timing?.narration) drawNarrationCard(ctx, timing.narration, p, W, H);
    return;
  }
}

    const {
    entryAnim = "none",
    exitAnim  = "none",
    entryFrac = 0.5,
    exitFrac  = 0.5,
  } = timing;

  function applyFocus(ctx, focus, W, H) {
  if (!focus) return;

  const { x = 50, y = 50, zoom = 1 } = focus;

  const cx = (x / 100) * W;
  const cy = (y / 100) * H;

  ctx.translate(cx, cy);
  ctx.scale(zoom, zoom);
  ctx.translate(-cx, -cy);
}

    const { entryProgress, exitProgress } = computeTransitionProgress(p, entryFrac, exitFrac);

  /* ── 1. Determine which layers to render ── */
  const effectiveLayers = layers && layers.length > 0
    ? layers
    : [{ id: "__base__", type: "image", visible: true, opacity: 1 }];

  /* ── 2. Draw each layer in order (index 0 = bottom) ── */
  for (const layer of effectiveLayers) {
    if (!layer.visible) continue;
    ctx.save();
    ctx.globalAlpha = layer.opacity ?? 1;

        // Apply entry / exit transforms before each layer
    applyEntry(ctx, entryAnim, entryProgress, W, H);
    applyExit(ctx, exitAnim, exitProgress, W, H);

    if (layer.type === "image") {
      applyFocus(ctx, layer.focus ?? null, W, H);
      drawImageLayer(ctx, img, animation, p, W, H, entryProgress , exitProgress);
    } else if (layer.type === "text") {
      drawTextLayer(ctx, layer, W, H);
    } else if (layer.type === "shape") {
      drawShapeLayer(ctx, layer, W, H);
    }

    ctx.restore();
  }

    // ── Hook text overlay — always on top of all layers ──
  if (timing?.hook) {
    drawHookText(ctx, timing.hook, p, W, H);
  }  

}

function drawGradientBackground(ctx, img, p, W, H) {
  const base   = extractDominantColor(img);
  const colors = animatedGradientColors(base, p);

  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0,    toRgba(colors.top,    1));
  gradient.addColorStop(0.5,  toRgba(base,          0.85));
  gradient.addColorStop(1,    toRgba(colors.bottom,  1));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
}

function drawSplitScreen(ctx, splitConfig, p, W, H) {
  const { layout, slots } = splitConfig;
  const rects = getLayoutSlots(layout, W, H);

  rects.forEach((rect, i) => {
    const img = slots[i];
    if (!img) {
      // empty slot — draw placeholder
      ctx.save();
      ctx.fillStyle = "#222";
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`Slot ${i + 1}`, rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.restore();
      return;
    }

    ctx.save();

    // Clip to this slot only
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();

    const iW = img.naturalWidth  || img.width;
    const iH = img.naturalHeight || img.height;

    // ✅ COVER-FIT — Math.max fills slot completely, no empty space
    const scale  = Math.max(rect.w / iW, rect.h / iH);
    const sw     = iW * scale;
    const sh     = iH * scale;

    // Ken Burns — each slot has different offset so they feel independent
    const slotP  = (p + i * 0.3) % 1;
    const kbZoom = 1 + 0.06 * slotP;

    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;

    ctx.translate(cx, cy);
    ctx.scale(kbZoom, kbZoom);
    ctx.translate(-cx, -cy);

    // Draw centered in slot
    const dx = rect.x + (rect.w - sw) / 2;
    const dy = rect.y + (rect.h - sh) / 2;
    ctx.drawImage(img, dx, dy, sw, sh);

    // Gap border
    ctx.restore();
    ctx.strokeStyle = "#000";
    ctx.lineWidth   = 4;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  });
}

function drawImageLayer(ctx, img, animation, p, W, H, entryProgress, exitProgress) {
  const { type = "kenBurns", direction = "in", startScale = 1, endScale = 1.15 } = animation ?? {};
  
const isEntryPhase = entryProgress < 1;
const isExitPhase  = exitProgress > 0;

if (isEntryPhase) {
  p = 0; // freeze at start
} else if (isExitPhase) {
  p = 1; // freeze at end
}
  const iW = img.naturalWidth  || img.width;
  const iH = img.naturalHeight || img.height;

    // Cover-fit base
 const baseScale = Math.min(W / iW, H / iH);
  
if (animation?.focus) {
  const { x, y, zoom = 2 } = animation.focus;

  const smoothZoom = 1 + (zoom - 1) * p;

  const focusX = (x / 100) * W;
  const focusY = (y / 100) * H;

  ctx.save();

  // Step 1: move origin to focus point
  ctx.translate(focusX, focusY);

  // Step 2: zoom
  ctx.scale(smoothZoom, smoothZoom);

  // Step 3: move back
  ctx.translate(-focusX, -focusY);

  // Step 4: draw image centered (NORMAL)
  const scale = Math.min(W / iW, H / iH);
  const offsetX = (W - iW * scale) / 2;
  const offsetY = (H - iH * scale) / 2;

  ctx.drawImage(img, offsetX, offsetY, iW * scale, iH * scale);

  ctx.restore();
  return;
}

  let scale   = baseScale;
  let offsetX = 0;
  let offsetY = 0;

  switch (type) {
    case "none": {
  scale = baseScale;
  offsetX = (W - iW * scale) / 2;
  offsetY = (H - iH * scale) / 2;
  break;
}
    case "kenBurns": {
      const zoomScale = startScale + (endScale - startScale) * p;
      scale = baseScale * zoomScale;
      // Diagonal pan
      offsetX = (W - iW * scale) / 2 + (direction === "in" ? -1 : 1) * W * 0.05 * p;
      offsetY = (H - iH * scale) / 2 + (direction === "in" ? -1 : 1) * H * 0.05 * p;
      break;
    }
    case "zoomIn": {
      scale = baseScale * (startScale + (endScale - startScale) * p);
      offsetX = (W - iW * scale) / 2;
      offsetY = (H - iH * scale) / 2;
      break;
    }
    case "zoomOut": {
      scale = baseScale * (startScale - (startScale - endScale) * p);
      offsetX = (W - iW * scale) / 2;
      offsetY = (H - iH * scale) / 2;
      break;
    }
    case "zoomFade": {
      const zf = startScale + (endScale - startScale) * p;
      scale = baseScale * zf;
      offsetX = (W - iW * scale) / 2;
      offsetY = (H - iH * scale) / 2;
      ctx.globalAlpha = (ctx.globalAlpha ?? 1) * Math.min(1, p * 3);
      break;
    }
    case "panLeft": {
      scale = baseScale * 1.1;
      offsetX = (W - iW * scale) / 2 - W * 0.1 * p;
      offsetY = (H - iH * scale) / 2;
      break;
    }
    case "panRight": {
      scale = baseScale * 1.1;
      offsetX = (W - iW * scale) / 2 + W * 0.1 * p;
      offsetY = (H - iH * scale) / 2;
      break;
    }
    case "panUp": {
      scale = baseScale * 1.1;
      offsetX = (W - iW * scale) / 2;
      offsetY = (H - iH * scale) / 2 - H * 0.08 * p;
      break;
    }
    case "panDown": {
      scale = baseScale * 1.1;
      offsetX = (W - iW * scale) / 2;
      offsetY = (H - iH * scale) / 2 + H * 0.08 * p;
      break;
    }
    case "fadeIn": {
      scale = baseScale;
      offsetX = (W - iW * scale) / 2;
      offsetY = (H - iH * scale) / 2;
      ctx.globalAlpha = (ctx.globalAlpha ?? 1) * p;
      break;
    }
    default: {
      scale = baseScale;
      offsetX = (W - iW * scale) / 2;
      offsetY = (H - iH * scale) / 2;
    }
  }

  ctx.drawImage(img, offsetX, offsetY, iW * scale, iH * scale);
}

function drawTextLayer(ctx, layer, W, H) {
  const {
    text        = "Text",
    fontSize    = 48,
    fontFamily  = "Arial",
    fontWeight  = "bold",
    color       = "#ffffff",
    textAlign   = "center",
    x           = 50,
    y           = 50,
    stroke      = false,
    strokeColor = "#000000",
  } = layer;

  const px = (x / 100) * W;
  const py = (y / 100) * H;

  ctx.font      = `${fontWeight} ${fontSize}px "${fontFamily}"`;
  ctx.textAlign = textAlign;
  ctx.textBaseline = "middle";

  // Word-wrap inside canvas width with 5% padding
  const maxWidth = W * 0.9;
  const lines    = wrapText(ctx, text, maxWidth);
  const lineH    = fontSize * 1.25;

  lines.forEach((line, i) => {
    const ly = py + (i - (lines.length - 1) / 2) * lineH;
    if (stroke) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth   = fontSize * 0.06;
      ctx.lineJoin    = "round";
      ctx.strokeText(line, px, ly);
    }
    ctx.fillStyle = color;
    ctx.fillText(line, px, ly);
  });
}

/** Naive word-wrap */
function wrapText(ctx, text, maxWidth) {
  const words  = text.split(" ");
  const lines  = [];
  let current  = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function drawShapeLayer(ctx, layer, W, H) {
  const {
    shapeType     = "rect",
    fillColor     = "#ff0000",
    borderEnabled = false,
    borderColor   = "#ffffff",
    borderWidth   = 2,
    x             = 50,
    y             = 50,
    w             = 50,
    h             = 20,
  } = layer;

  const cx = (x / 100) * W;
  const cy = (y / 100) * H;
  const sw = (w / 100) * W;
  const sh = (h / 100) * H;

  ctx.fillStyle   = fillColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth   = borderWidth;

  ctx.beginPath();

  switch (shapeType) {
    case "rect":
      ctx.roundRect
        ? ctx.roundRect(cx - sw / 2, cy - sh / 2, sw, sh, 8)
        : ctx.rect(cx - sw / 2, cy - sh / 2, sw, sh);
      break;

    case "circle":
      ctx.ellipse(cx, cy, sw / 2, sh / 2, 0, 0, Math.PI * 2);
      break;

    case "triangle":
      ctx.moveTo(cx, cy - sh / 2);
      ctx.lineTo(cx + sw / 2, cy + sh / 2);
      ctx.lineTo(cx - sw / 2, cy + sh / 2);
      ctx.closePath();
      break;

    case "line":
      ctx.moveTo(cx - sw / 2, cy);
      ctx.lineTo(cx + sw / 2, cy);
      ctx.lineWidth = sh;
      ctx.strokeStyle = fillColor;
      ctx.stroke();
      return; // skip fill

    default:
      ctx.rect(cx - sw / 2, cy - sh / 2, sw, sh);
  }

  ctx.fill();
  if (borderEnabled) ctx.stroke();
}
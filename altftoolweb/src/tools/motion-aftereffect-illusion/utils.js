// src/tools/motion-aftereffect-illusion/utils.js

// --- Motion Math Utils ---
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const lerp = (start, end, amount) => start + (end - start) * amount;

export const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

export const resizeCanvasToDisplaySize = (canvas, ctx) => {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(rect.width * dpr));
  const height = Math.max(1, Math.floor(rect.height * dpr));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  return {
    width: rect.width,
    height: rect.height,
    dpr,
    cx: rect.width / 2,
    cy: rect.height / 2,
    radius: Math.hypot(rect.width, rect.height) / 2,
  };
};

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

// --- Fullscreen Utils ---
export const isFullscreenAvailable = () =>
  typeof document !== "undefined" && Boolean(document.documentElement.requestFullscreen);

export const getFullscreenElement = () =>
  typeof document === "undefined" ? null : document.fullscreenElement;

export const requestFullscreen = async (element) => {
  if (!element?.requestFullscreen) return false;
  await element.requestFullscreen();
  return true;
};

export const exitFullscreen = async () => {
  if (!getFullscreenElement() || !document.exitFullscreen) return false;
  await document.exitFullscreen();
  return true;
};

export const toggleFullscreen = async (element) => {
  if (getFullscreenElement()) {
    return exitFullscreen();
  }
  return requestFullscreen(element);
};

// --- Audio Utils ---
let audioContext;
let oscillator;
let gainNode;

export const startAmbientAudio = () => {
  if (typeof window === "undefined") return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext || oscillator) return;

  audioContext = audioContext || new AudioContext();
  oscillator = audioContext.createOscillator();
  gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 96;
  gainNode.gain.value = 0.018;

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
};

export const stopAmbientAudio = () => {
  if (!oscillator) return;
  try {
    oscillator.stop();
    oscillator.disconnect();
    gainNode?.disconnect();
  } catch (e) {
    console.warn("Audio stop error:", e);
  }
  oscillator = null;
  gainNode = null;
};

// --- Illusion Modes ---
import {
  Waves,
  RotateCw,
  Radio,
  CircleDot,
  Activity,
  Disc3,
  Rows3,
  Orbit,
} from "lucide-react";

export const illusionModes = [
  {
    id: "waterfall-flow",
    name: "Waterfall Flow",
    shortName: "Waterfall",
    icon: Waves,
    description: "Vertical motion adaptation inspired by the classic waterfall illusion.",
    motionHint: "Downward flow",
  },
  {
    id: "spiral-rotation",
    name: "Spiral Rotation",
    shortName: "Spiral",
    icon: RotateCw,
    description: "Rotating arms bias motion-sensitive neurons around the fixation point.",
    motionHint: "Clockwise spin",
  },
  {
    id: "radial-zoom",
    name: "Radial Zoom",
    shortName: "Zoom",
    icon: Radio,
    description: "Expanding rings create a static contraction aftereffect.",
    motionHint: "Expansion",
  },
  {
    id: "moving-tunnel",
    name: "Moving Tunnel",
    shortName: "Tunnel",
    icon: CircleDot,
    description: "Depth cues and nested arcs create a forward motion field.",
    motionHint: "Forward tunnel",
  },
  {
    id: "wave-drift",
    name: "Wave Drift",
    shortName: "Waves",
    icon: Activity,
    description: "Layered sine waves drift laterally to adapt direction-selective vision.",
    motionHint: "Side drift",
  },
  {
    id: "hypnotic-rings",
    name: "Hypnotic Rings",
    shortName: "Rings",
    icon: Disc3,
    description: "Alternating ring bands pulse outward from the center target.",
    motionHint: "Pulsing rings",
  },
  {
    id: "infinite-scroll-lines",
    name: "Infinite Scroll Lines",
    shortName: "Lines",
    icon: Rows3,
    description: "High-contrast line fields slide continuously across the retina.",
    motionHint: "Line scroll",
  },
  {
    id: "vortex-motion",
    name: "Vortex Motion",
    shortName: "Vortex",
    icon: Orbit,
    description: "A twisting radial field creates a cinematic vortex aftereffect.",
    motionHint: "Twist field",
  },
];

export const getIllusionMode = (id) =>
  illusionModes.find((mode) => mode.id === id) ?? illusionModes[0];

// --- Animation Engine ---
const token = (name) => {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
};

const withAlpha = (color, alpha) => {
  if (!color) return "transparent";
  if (color.startsWith("#")) {
    const normalized = color.length === 4
      ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
      : color.slice(0, 7);
    const value = Number.parseInt(normalized.slice(1), 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return `rgb(${r} ${g} ${b} / ${alpha})`;
  }
  return color;
};

const clearScene = (ctx, size, contrast) => {
  const background = token("--background") || "#000000";
  const card = token("--card") || "#1a1a1a";
  const gradient = ctx.createRadialGradient(size.cx, size.cy, 10, size.cx, size.cy, size.radius);
  gradient.addColorStop(0, card);
  gradient.addColorStop(1, background);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size.width, size.height);

  ctx.globalAlpha = 0.16 + contrast * 0.04;
  ctx.fillStyle = token("--primary") || "#3b82f6";
  ctx.beginPath();
  ctx.arc(size.cx, size.cy, size.radius * 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
};

const lineColor = (alpha = 1) => {
  return withAlpha(token("--primary") || "#3b82f6", alpha);
};

const drawVignette = (ctx, size) => {
  const vignette = ctx.createRadialGradient(size.cx, size.cy, size.radius * 0.2, size.cx, size.cy, size.radius);
  const foreground = token("--foreground") || "#ffffff";
  vignette.addColorStop(0, "transparent");
  vignette.addColorStop(1, withAlpha(foreground, 0.22));
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, size.width, size.height);
};

const drawStaticLattice = (ctx, size, contrast) => {
  ctx.save();
  ctx.globalAlpha = 0.42 + contrast * 0.1;
  ctx.strokeStyle = lineColor(0.78);
  ctx.lineWidth = 1;
  const spacing = 28;
  for (let x = -spacing; x <= size.width + spacing; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + size.height * 0.16, size.height);
    ctx.stroke();
  }
  for (let y = -spacing; y <= size.height + spacing; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size.width, y - size.width * 0.08);
    ctx.stroke();
  }
  ctx.restore();
};

const drawWaterfall = (ctx, size, time, speed, intensity, contrast) => {
  const spacing = 34 / intensity;
  const offset = (time * speed * 120) % spacing;
  for (let y = -spacing; y < size.height + spacing; y += spacing) {
    const wave = Math.sin(y * 0.04 + time * 4) * 18;
    const gradient = ctx.createLinearGradient(0, y + offset, size.width, y + offset + spacing);
    gradient.addColorStop(0, lineColor(0.2));
    gradient.addColorStop(0.5, lineColor(0.9));
    gradient.addColorStop(1, withAlpha(token("--background") || "#000000", 0.04));
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.38 + contrast * 0.12;
    ctx.fillRect(wave, y + offset, size.width + 40, spacing * 0.45);
  }
};

const drawSpiral = (ctx, size, time, speed, intensity, contrast) => {
  ctx.save();
  ctx.translate(size.cx, size.cy);
  ctx.rotate(time * speed);
  ctx.strokeStyle = lineColor(0.86);
  ctx.lineWidth = 5 + intensity * 2;
  ctx.globalAlpha = 0.58 + contrast * 0.12;
  for (let arm = 0; arm < 8; arm += 1) {
    ctx.rotate((Math.PI * 2) / 8);
    ctx.beginPath();
    for (let r = 8; r < size.radius * 1.15; r += 7) {
      const angle = r * 0.035 * intensity;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (r === 8) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
};

const drawRadial = (ctx, size, time, speed, intensity, contrast) => {
  const spacing = 34 / intensity;
  const offset = (time * speed * 130) % spacing;
  ctx.strokeStyle = lineColor(0.86);
  ctx.lineWidth = 8;
  ctx.globalAlpha = 0.45 + contrast * 0.16;
  for (let r = offset; r < size.radius * 1.25; r += spacing) {
    ctx.beginPath();
    ctx.arc(size.cx, size.cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
};

const drawTunnel = (ctx, size, time, speed, intensity, contrast) => {
  ctx.save();
  ctx.translate(size.cx, size.cy);
  ctx.rotate(time * speed * 0.28);
  for (let i = 0; i < 18; i += 1) {
    const phase = ((i / 18 + time * speed * 0.16) % 1);
    const scale = phase * phase;
    const w = size.width * (0.18 + scale * 1.2);
    const h = size.height * (0.14 + scale * 1.2);
    ctx.strokeStyle = lineColor(0.22 + phase * 0.7);
    ctx.lineWidth = 2 + phase * 8 * intensity;
    ctx.globalAlpha = 0.35 + contrast * 0.12;
    ctx.strokeRect(-w / 2, -h / 2, w, h);
  }
  ctx.restore();
};

const drawWave = (ctx, size, time, speed, intensity, contrast) => {
  ctx.strokeStyle = lineColor(0.85);
  ctx.lineWidth = 3 + intensity * 2;
  ctx.globalAlpha = 0.44 + contrast * 0.15;
  for (let y = -40; y <= size.height + 40; y += 28) {
    ctx.beginPath();
    for (let x = -30; x <= size.width + 30; x += 8) {
      const drift = time * speed * 92;
      const yy = y + Math.sin((x + drift) * 0.025) * 26 * intensity;
      if (x === -30) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
};

const drawLines = (ctx, size, time, speed, intensity, contrast) => {
  const spacing = 24 / intensity;
  const offset = (time * speed * 150) % spacing;
  ctx.save();
  ctx.translate(size.cx, size.cy);
  ctx.rotate(-0.24);
  ctx.strokeStyle = lineColor(0.86);
  ctx.lineWidth = 8;
  ctx.globalAlpha = 0.45 + contrast * 0.18;
  for (let x = -size.width; x < size.width * 1.5; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x + offset, -size.height);
    ctx.lineTo(x + offset, size.height);
    ctx.stroke();
  }
  ctx.restore();
};

const drawVortex = (ctx, size, time, speed, intensity, contrast) => {
  ctx.save();
  ctx.translate(size.cx, size.cy);
  ctx.rotate(time * speed * 0.7);
  ctx.strokeStyle = lineColor(0.88);
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.5 + contrast * 0.14;
  for (let arm = 0; arm < 18; arm += 1) {
    ctx.rotate((Math.PI * 2) / 18);
    ctx.beginPath();
    for (let r = 12; r < size.radius * 1.18; r += 10) {
      const angle = Math.sin(r * 0.014 + time * speed) * 0.8 * intensity;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (r === 12) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
};

const drawMode = (ctx, size, mode, time, settings) => {
  const speed = settings.speed;
  const intensity = settings.intensity;
  const contrast = settings.contrast;

  if (mode === "waterfall-flow") drawWaterfall(ctx, size, time, speed, intensity, contrast);
  if (mode === "spiral-rotation") drawSpiral(ctx, size, time, speed, intensity, contrast);
  if (mode === "radial-zoom" || mode === "hypnotic-rings") drawRadial(ctx, size, time, speed, intensity, contrast);
  if (mode === "moving-tunnel") drawTunnel(ctx, size, time, speed, intensity, contrast);
  if (mode === "wave-drift") drawWave(ctx, size, time, speed, intensity, contrast);
  if (mode === "infinite-scroll-lines") drawLines(ctx, size, time, speed, intensity, contrast);
  if (mode === "vortex-motion") drawVortex(ctx, size, time, speed, intensity, contrast);
};

export const renderIllusionFrame = (canvas, options) => {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;
  const size = resizeCanvasToDisplaySize(canvas, ctx);
  clearScene(ctx, size, options.contrast);
  drawMode(ctx, size, options.mode, options.time, options);
  drawStaticLattice(ctx, size, options.contrast);
  drawVignette(ctx, size);
};

export const renderStaticRevealFrame = (canvas, options) => {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;
  const size = resizeCanvasToDisplaySize(canvas, ctx);
  clearScene(ctx, size, options.contrast);
  drawStaticLattice(ctx, size, options.contrast);
  drawRadial(ctx, size, 0, 0, 0.8, options.contrast);
  drawVignette(ctx, size);
};

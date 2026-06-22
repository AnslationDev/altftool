"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Info, Maximize2, Minimize2, Volume2, VolumeX, X } from "lucide-react";
import "./patatap.css";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const TOTAL_ASSETS = 26;

const PALETTE = [
  "#00b8ff",
  "#ff5f8f",
  "#ffcb3d",
  "#48f5a8",
  "#8d72ff",
  "#ff763b",
  "#25d7d1",
  "#f73d93",
  "#95f24b",
  "#ffffff",
  "#f78cff",
  "#4c7dff",
  "#ffef68",
  "#12e6a0",
  "#ef4444",
  "#a78bfa",
  "#22d3ee",
  "#fb7185",
  "#84cc16",
  "#f97316",
  "#60a5fa",
  "#facc15",
  "#34d399",
  "#e879f9",
  "#38bdf8",
  "#f8fafc",
];

const BACKGROUNDS = [
  "#b5b5b5",
  "#292f36",
  "#3f7cac",
  "#f08080",
  "#17bebb",
  "#ef476f",
  "#ffd166",
  "#06d6a0",
  "#118ab2",
  "#073b4c",
  "#8a5cf6",
  "#ff9f1c",
  "#2ec4b6",
  "#e71d36",
  "#011627",
  "#a7c957",
  "#3a86ff",
  "#ff006e",
  "#8338ec",
  "#fb5607",
  "#2a9d8f",
  "#264653",
  "#e76f51",
  "#457b9d",
  "#1d3557",
  "#f4a261",
];

const NOTE_FREQUENCIES = [
  174.61,
  196,
  220,
  246.94,
  261.63,
  293.66,
  329.63,
  349.23,
  392,
  440,
  493.88,
  523.25,
  587.33,
  659.25,
  698.46,
  783.99,
  880,
  987.77,
  1046.5,
  1174.66,
  1318.51,
  1396.91,
  1567.98,
  1760,
  1975.53,
  2093,
];

const WAVE_TYPES = ["sine", "triangle", "square", "sawtooth"];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const random = (min, max) => min + Math.random() * (max - min);

function getSoundProfile(index) {
  return {
    wave: WAVE_TYPES[index % WAVE_TYPES.length],
    secondWave: WAVE_TYPES[(index + 2) % WAVE_TYPES.length],
    attack: 0.006 + (index % 5) * 0.004,
    decay: 0.11 + (index % 7) * 0.018,
    sustain: 0.06 + (index % 4) * 0.025,
    release: 0.18 + (index % 6) * 0.04,
    filterType: index % 3 === 0 ? "lowpass" : index % 3 === 1 ? "bandpass" : "highpass",
    filterStart: 440 + index * 72,
    filterEnd: 1280 + index * 116,
    pitchBend: index % 2 === 0 ? 1.26 + (index % 4) * 0.04 : 0.68 + (index % 5) * 0.035,
    chord: index % 4 === 0 ? 1.5 : index % 5 === 0 ? 1.25 : index % 6 === 0 ? 2 : 0,
    noise: index % 7 === 0 || index % 11 === 0,
  };
}

function getCanvasMetrics(canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    dpr: canvas.width / Math.max(rect.width, 1),
    width: rect.width,
    height: rect.height,
  };
}

function drawStar(ctx, x, y, points, outerRadius, innerRadius) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = -Math.PI / 2 + (i * Math.PI) / points;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawPolygon(ctx, x, y, radius, sides, rotation = 0) {
  ctx.beginPath();
  for (let i = 0; i < sides; i += 1) {
    const angle = rotation + (Math.PI * 2 * i) / sides;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawTriangle(ctx, x, y, size, angle) {
  const points = [
    [size, 0],
    [-size * 0.6, -size * 0.7],
    [-size * 0.35, 0],
    [-size * 0.6, size * 0.7],
  ];
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  ctx.beginPath();
  points.forEach(([px, py], pointIndex) => {
    const rotatedX = x + px * cos - py * sin;
    const rotatedY = y + px * sin + py * cos;
    if (pointIndex === 0) ctx.moveTo(rotatedX, rotatedY);
    else ctx.lineTo(rotatedX, rotatedY);
  });
  ctx.closePath();
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2);
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
}

function createVisual(letter, point, width, height) {
  const index = LETTERS.indexOf(letter);
  const safeIndex = Math.max(index, 0);
  const center = point || {
    x: random(width * 0.2, width * 0.8),
    y: random(height * 0.2, height * 0.8),
  };

  return {
    id: `${letter}-${performance.now()}-${Math.random().toString(36).slice(2)}`,
    letter,
    index: safeIndex,
    createdAt: performance.now(),
    duration: 760 + (safeIndex % 8) * 105,
    x: clamp(center.x, 24, width - 24),
    y: clamp(center.y, 24, height - 24),
    color: PALETTE[safeIndex % PALETTE.length],
    altColor: PALETTE[(safeIndex + 8) % PALETTE.length],
    rotation: random(-Math.PI, Math.PI),
    velocity: random(0.7, 1.35),
    direction: random(-1, 1) > 0 ? 1 : -1,
    scale: random(0.82, 1.24),
    seed: Math.random(),
    particles: Array.from({ length: 9 + (safeIndex % 8) }, (_, particleIndex) => ({
      angle: (Math.PI * 2 * particleIndex) / (9 + (safeIndex % 8)) + random(-0.25, 0.25),
      distance: random(40, 190),
      size: random(5, 18),
      spin: random(-1.8, 1.8),
    })),
  };
}

function drawVisual(ctx, visual, width, height, now) {
  const age = now - visual.createdAt;
  const progress = clamp(age / visual.duration, 0, 1);
  const ease = 1 - Math.pow(1 - progress, 3);
  const fade = Math.max(0, 1 - progress);
  const pulse = 0.5 + Math.sin(progress * Math.PI) * 0.5;
  const mode = visual.index % 26;
  const sizeBase = Math.min(width, height);
  const travel = ease * sizeBase * 0.72;

  ctx.save();
  ctx.globalAlpha = clamp(fade * 0.95, 0, 1);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = visual.color;
  ctx.fillStyle = visual.color;
  ctx.lineWidth = Math.max(2, sizeBase * 0.008);

  if (mode === 0) {
    for (let i = 0; i < 5; i += 1) {
      ctx.globalAlpha = fade * (0.22 + i * 0.08);
      ctx.beginPath();
      ctx.arc(visual.x, visual.y, ease * (70 + i * 80), 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (mode === 1) {
    ctx.translate(visual.x, visual.y);
    ctx.rotate(visual.rotation + ease * Math.PI);
    ctx.globalAlpha = fade * 0.92;
    ctx.fillRect(-ease * 260, -ease * 26, ease * 520, ease * 52);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = visual.altColor;
    ctx.fillRect(-ease * 260, -ease * 20, ease * 520, ease * 40);
  } else if (mode === 2) {
    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8 + visual.rotation;
      const radius = ease * sizeBase * 0.55;
      ctx.beginPath();
      ctx.moveTo(visual.x, visual.y);
      ctx.lineTo(visual.x + Math.cos(angle) * radius, visual.y + Math.sin(angle) * radius);
      ctx.stroke();
    }
  } else if (mode === 3) {
    ctx.translate(visual.x, visual.y);
    ctx.rotate(visual.rotation + ease * 4);
    ctx.strokeStyle = visual.color;
    for (let i = 0; i < 7; i += 1) {
      ctx.strokeRect(-ease * 40 * i, -ease * 40 * i, ease * 80 * i, ease * 80 * i);
    }
  } else if (mode === 4) {
    visual.particles.forEach((particle) => {
      const dist = particle.distance * ease;
      const x = visual.x + Math.cos(particle.angle) * dist;
      const y = visual.y + Math.sin(particle.angle) * dist;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(visual.rotation + progress * particle.spin * Math.PI);
      ctx.fillStyle = particle.angle > Math.PI ? visual.altColor : visual.color;
      drawStar(ctx, 0, 0, 5, particle.size * (0.8 + pulse), particle.size * 0.42);
      ctx.fill();
      ctx.restore();
    });
  } else if (mode === 5) {
    ctx.globalAlpha = fade * 0.8;
    ctx.fillStyle = visual.color;
    for (let i = 0; i < 16; i += 1) {
      const x = (width / 16) * i + Math.sin(progress * 9 + i) * 24;
      const h = Math.sin(progress * Math.PI + i * 0.8) * height * 0.34;
      ctx.fillRect(x, height / 2 - h / 2, width / 28, h);
    }
  } else if (mode === 6) {
    ctx.translate(visual.x, visual.y);
    ctx.rotate(visual.rotation + progress * 2);
    for (let i = 0; i < 10; i += 1) {
      ctx.globalAlpha = fade * (0.18 + i * 0.05);
      ctx.strokeStyle = i % 2 ? visual.altColor : visual.color;
      drawPolygon(ctx, 0, 0, ease * (36 + i * 24), 6, i * 0.18);
      ctx.stroke();
    }
  } else if (mode === 7) {
    ctx.globalAlpha = fade * 0.86;
    ctx.strokeStyle = visual.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 90; i += 1) {
      const t = i / 89;
      const x = t * width;
      const y =
        visual.y +
        Math.sin(t * Math.PI * 8 + progress * 9 + visual.seed * 4) *
          (24 + ease * 96);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  } else if (mode === 8) {
    ctx.translate(visual.x, visual.y);
    ctx.rotate(visual.rotation + ease * Math.PI * 2);
    for (let i = 0; i < 4; i += 1) {
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = i % 2 ? visual.altColor : visual.color;
      drawTriangle(ctx, ease * 120, 0, 42 + pulse * 16, 0);
      ctx.fill();
    }
  } else if (mode === 9) {
    ctx.globalAlpha = fade * 0.85;
    ctx.fillStyle = visual.color;
    ctx.font = `900 ${clamp(sizeBase * (0.36 + ease * 0.28), 130, 520)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(visual.letter, width / 2, height / 2);
  } else if (mode === 10) {
    ctx.translate(width / 2, height / 2);
    ctx.rotate(visual.rotation);
    for (let i = 0; i < 11; i += 1) {
      ctx.globalAlpha = fade * (0.18 + i * 0.05);
      ctx.beginPath();
      ctx.ellipse(
        0,
        0,
        ease * (40 + i * 44),
        ease * (16 + i * 17),
        i * 0.35 + progress,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  } else if (mode === 11) {
    const stripeWidth = Math.max(16, width / 18);
    for (let i = -2; i < 22; i += 1) {
      ctx.fillStyle = i % 2 ? visual.color : visual.altColor;
      ctx.globalAlpha = fade * 0.5;
      ctx.save();
      ctx.translate(i * stripeWidth + progress * width * 0.6, height / 2);
      ctx.rotate(-0.35);
      ctx.fillRect(-stripeWidth / 2, -height, stripeWidth, height * 2);
      ctx.restore();
    }
  } else if (mode === 12) {
    const radius = ease * sizeBase * 0.42;
    ctx.globalAlpha = fade * 0.9;
    ctx.beginPath();
    ctx.moveTo(visual.x - radius, visual.y);
    ctx.bezierCurveTo(
      visual.x - radius * 0.5,
      visual.y - radius,
      visual.x + radius * 0.5,
      visual.y + radius,
      visual.x + radius,
      visual.y
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(visual.x, visual.y - radius);
    ctx.bezierCurveTo(
      visual.x + radius,
      visual.y - radius * 0.5,
      visual.x - radius,
      visual.y + radius * 0.5,
      visual.x,
      visual.y + radius
    );
    ctx.stroke();
  } else if (mode === 13) {
    const rings = 8;
    for (let i = 0; i < rings; i += 1) {
      const radius = ease * (40 + i * 44 * visual.scale);
      ctx.globalAlpha = fade * (0.12 + i * 0.055);
      ctx.fillStyle = i % 2 ? visual.altColor : visual.color;
      ctx.beginPath();
      ctx.arc(visual.x, visual.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (mode === 14) {
    const tile = Math.max(26, sizeBase * 0.075);
    const offset = ease * tile * 3;
    for (let y = -tile; y < height + tile; y += tile) {
      for (let x = -tile; x < width + tile; x += tile) {
        const active = (Math.floor((x + offset) / tile) + Math.floor((y - offset) / tile)) % 2 === 0;
        ctx.globalAlpha = fade * (active ? 0.5 : 0.16);
        ctx.fillStyle = active ? visual.color : visual.altColor;
        ctx.fillRect(x + offset * 0.35, y - offset * 0.2, tile * 0.74, tile * 0.74);
      }
    }
  } else if (mode === 15) {
    ctx.translate(visual.x, visual.y);
    ctx.rotate(visual.rotation + ease * visual.direction * Math.PI * 2);
    for (let i = 0; i < 120; i += 1) {
      const t = i / 119;
      const angle = t * Math.PI * 12 + progress * 6;
      const radius = t * travel;
      ctx.globalAlpha = fade * (1 - t) * 0.92;
      ctx.fillStyle = i % 3 ? visual.color : visual.altColor;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, 3 + t * 8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (mode === 16) {
    ctx.translate(width / 2, height / 2);
    for (let i = 0; i < 10; i += 1) {
      const radius = ease * (60 + i * 34);
      const start = visual.rotation + progress * visual.direction * 5 + i * 0.5;
      ctx.globalAlpha = fade * (0.2 + i * 0.055);
      ctx.strokeStyle = i % 2 ? visual.altColor : visual.color;
      ctx.lineWidth = Math.max(3, sizeBase * 0.006 + i);
      ctx.beginPath();
      ctx.arc(0, 0, radius, start, start + Math.PI * (0.35 + pulse * 0.85));
      ctx.stroke();
    }
  } else if (mode === 17) {
    ctx.translate(visual.x, visual.y);
    ctx.rotate(visual.rotation + progress * visual.direction * Math.PI);
    for (let i = 0; i < 9; i += 1) {
      const radius = ease * (34 + i * 34);
      ctx.globalAlpha = fade * (0.16 + i * 0.06);
      ctx.strokeStyle = i % 2 ? visual.color : visual.altColor;
      ctx.beginPath();
      ctx.moveTo(0, -radius);
      ctx.lineTo(radius, 0);
      ctx.lineTo(0, radius);
      ctx.lineTo(-radius, 0);
      ctx.closePath();
      ctx.stroke();
    }
  } else if (mode === 18) {
    const cornerX = visual.x < width / 2 ? 0 : width;
    const cornerY = visual.y < height / 2 ? 0 : height;
    for (let i = 0; i < 18; i += 1) {
      const angle = visual.rotation + (i / 17) * Math.PI * 1.3;
      ctx.globalAlpha = fade * (0.18 + i * 0.025);
      ctx.strokeStyle = i % 2 ? visual.altColor : visual.color;
      ctx.beginPath();
      ctx.moveTo(cornerX, cornerY);
      ctx.lineTo(cornerX + Math.cos(angle) * travel, cornerY + Math.sin(angle) * travel);
      ctx.stroke();
    }
  } else if (mode === 19) {
    const columns = 9 + (visual.index % 5);
    for (let i = 0; i < columns; i += 1) {
      const x = ((i + 0.5) / columns) * width;
      const y = (height + 180) * ease - i * 34 - 120;
      ctx.globalAlpha = fade * 0.75;
      ctx.fillStyle = i % 2 ? visual.altColor : visual.color;
      ctx.beginPath();
      drawRoundedRect(ctx, x - 16 - pulse * 10, y - 70, 32 + pulse * 20, 140, 999);
      ctx.fill();
    }
  } else if (mode === 20) {
    ctx.translate(visual.x, visual.y);
    ctx.rotate(visual.rotation + progress * visual.direction * 2);
    for (let i = 0; i < 16; i += 1) {
      ctx.rotate(Math.PI / 8);
      ctx.globalAlpha = fade * 0.6;
      ctx.fillStyle = i % 2 ? visual.altColor : visual.color;
      ctx.beginPath();
      ctx.ellipse(ease * 96, 0, 16 + pulse * 12, 58 + ease * 60, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (mode === 21) {
    const rows = 10;
    for (let i = 0; i < rows; i += 1) {
      const y = (height / rows) * i;
      const offset = (i % 2 ? -1 : 1) * ease * width * 0.45;
      ctx.globalAlpha = fade * 0.62;
      ctx.fillStyle = i % 2 ? visual.color : visual.altColor;
      ctx.fillRect(offset, y + 4, width * 0.82, height / rows - 8);
    }
  } else if (mode === 22) {
    visual.particles.forEach((particle, particleIndex) => {
      const dist = particle.distance * ease * 1.4;
      const x = visual.x + Math.cos(particle.angle) * dist;
      const y = visual.y + Math.sin(particle.angle) * dist + Math.sin(progress * 8 + particleIndex) * 30;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(visual.rotation + progress * particle.spin * 4);
      ctx.globalAlpha = fade * 0.88;
      ctx.fillStyle = particleIndex % 2 ? visual.altColor : visual.color;
      ctx.fillRect(-particle.size * 0.7, -particle.size * 0.45, particle.size * 1.4, particle.size * 0.9);
      ctx.restore();
    });
  } else if (mode === 23) {
    const radius = ease * sizeBase * 0.38;
    ctx.globalAlpha = fade * 0.82;
    ctx.fillStyle = visual.color;
    ctx.beginPath();
    ctx.arc(visual.x - radius * 0.28, visual.y, radius, Math.PI * 0.5, Math.PI * 1.5);
    ctx.fill();
    ctx.fillStyle = visual.altColor;
    ctx.beginPath();
    ctx.arc(visual.x + radius * 0.28, visual.y, radius, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.fill();
  } else if (mode === 24) {
    ctx.translate(width / 2, height / 2);
    ctx.rotate(visual.rotation * 0.2);
    for (let i = 0; i < 18; i += 1) {
      const s = ease * (30 + i * 34);
      ctx.globalAlpha = fade * (0.08 + i * 0.035);
      ctx.strokeStyle = i % 2 ? visual.altColor : visual.color;
      ctx.strokeRect(-s * 1.25, -s * 0.72, s * 2.5, s * 1.44);
    }
  } else {
    for (let i = 0; i < 6; i += 1) {
      const offset = (i - 2.5) * 35;
      ctx.globalAlpha = fade * (0.24 + i * 0.08);
      ctx.strokeStyle = i % 2 ? visual.altColor : visual.color;
      ctx.beginPath();
      ctx.moveTo(-80, visual.y + offset);
      ctx.bezierCurveTo(
        width * 0.2,
        visual.y - travel * 0.55 + offset,
        width * 0.78,
        visual.y + travel * 0.55 - offset,
        width + 80,
        visual.y - offset
      );
      ctx.stroke();
    }
  }

  ctx.restore();
}

export default function PatatapClient() {
  const canvasRef = useRef(null);
  const shellRef = useRef(null);
  const audioContextRef = useRef(null);
  const masterGainRef = useRef(null);
  const visualsRef = useRef([]);
  const rafRef = useRef(0);
  const activeTimeoutRef = useRef(0);
  const backgroundRef = useRef("#b5b5b5");
  const mutedRef = useRef(false);
  const [loaded, setLoaded] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const [activeKey, setActiveKey] = useState("");
  const [muted, setMuted] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const letterGrid = useMemo(() => LETTERS, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(window.innerWidth, 320);
    const height = Math.max(window.innerHeight, 320);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  const ensureAudio = useCallback(() => {
    if (typeof window === "undefined") return null;

    if (!audioContextRef.current) {
      const BrowserAudioContext = window.AudioContext || window.webkitAudioContext;
      if (!BrowserAudioContext) return null;
      const context = new BrowserAudioContext();
      const master = context.createGain();
      master.gain.value = mutedRef.current ? 0 : 0.28;
      master.connect(context.destination);
      audioContextRef.current = context;
      masterGainRef.current = master;
    }

    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }, []);

  const playTone = useCallback(
    (letter) => {
      if (mutedRef.current) return;
      const context = ensureAudio();
      const master = masterGainRef.current;
      if (!context || !master) return;

      const index = Math.max(LETTERS.indexOf(letter), 0);
      const now = context.currentTime;
      const profile = getSoundProfile(index);
      const duration = profile.attack + profile.decay + profile.sustain + profile.release;
      const frequency = NOTE_FREQUENCIES[index % NOTE_FREQUENCIES.length];

      const filter = context.createBiquadFilter();
      filter.type = profile.filterType;
      filter.frequency.setValueAtTime(profile.filterStart, now);
      filter.frequency.exponentialRampToValueAtTime(profile.filterEnd, now + profile.attack + profile.decay);
      filter.frequency.exponentialRampToValueAtTime(
        Math.max(160, profile.filterStart * 0.62),
        now + duration
      );
      filter.Q.setValueAtTime(1.1 + (index % 7) * 0.32, now);

      const gain = context.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.22, now + profile.attack);
      gain.gain.exponentialRampToValueAtTime(0.075, now + profile.attack + profile.decay);
      gain.gain.setValueAtTime(0.075, now + profile.attack + profile.decay + profile.sustain);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      const pan = context.createStereoPanner ? context.createStereoPanner() : context.createGain();
      if (pan.pan) {
        pan.pan.setValueAtTime(((index % 9) - 4) / 7, now);
      }

      const oscillator = context.createOscillator();
      oscillator.type = profile.wave;
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * profile.pitchBend, now + duration * 0.82);
      oscillator.detune.setValueAtTime((index % 9 - 4) * 6, now);
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(pan);
      pan.connect(master);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.04);

      if (profile.chord) {
        const second = context.createOscillator();
        const secondGain = context.createGain();
        second.type = profile.secondWave;
        second.frequency.setValueAtTime(frequency * profile.chord, now);
        second.frequency.exponentialRampToValueAtTime(
          frequency * profile.chord * (profile.pitchBend > 1 ? 0.92 : 1.08),
          now + duration * 0.72
        );
        secondGain.gain.setValueAtTime(0.0001, now);
        secondGain.gain.exponentialRampToValueAtTime(0.07, now + profile.attack);
        secondGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.82);
        second.connect(secondGain);
        secondGain.connect(master);
        second.start(now);
        second.stop(now + duration);
      }

      if (profile.noise) {
        const noiseLength = Math.floor(context.sampleRate * 0.13);
        const noiseBuffer = context.createBuffer(1, noiseLength, context.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseLength; i += 1) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / noiseLength);
        }
        const noise = context.createBufferSource();
        const noiseFilter = context.createBiquadFilter();
        const noiseGain = context.createGain();
        noise.buffer = noiseBuffer;
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(900 + index * 75, now);
        noiseGain.gain.setValueAtTime(0.0001, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.045, now + 0.01);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(master);
        noise.start(now);
        noise.stop(now + 0.14);
      }
    },
    [ensureAudio]
  );

  const triggerLetter = useCallback(
    (letter, point) => {
      if (!LETTERS.includes(letter)) return;

      setHintVisible(false);
      setActiveKey(letter);
      window.clearTimeout(activeTimeoutRef.current);
      activeTimeoutRef.current = window.setTimeout(() => setActiveKey(""), 420);

      const canvas = canvasRef.current;
      if (canvas) {
        const { width, height } = getCanvasMetrics(canvas);
        const index = LETTERS.indexOf(letter);
        backgroundRef.current = BACKGROUNDS[index % BACKGROUNDS.length];
        visualsRef.current.push(createVisual(letter, point, width, height));
        if (width > 520 && visualsRef.current.length < 44) {
          const pairedLetter = LETTERS[(index + 13) % LETTERS.length];
          visualsRef.current.push(createVisual(pairedLetter, null, width, height));
        }
        if (visualsRef.current.length > 42) {
          visualsRef.current = visualsRef.current.slice(-42);
        }
      }

      playTone(letter);
    },
    [playTone]
  );

  const handlePointerDown = useCallback(
    (event) => {
      if (event.target.closest("[data-patatap-control]")) return;
      ensureAudio();
      const width = Math.max(window.innerWidth, 1);
      const height = Math.max(window.innerHeight, 1);
      const letterIndex =
        (Math.floor((event.clientX / width) * 13) + Math.floor((event.clientY / height) * 13)) %
        LETTERS.length;
      triggerLetter(LETTERS[letterIndex], { x: event.clientX, y: event.clientY });
    },
    [ensureAudio, triggerLetter]
  );

  const toggleMute = useCallback(() => {
    setMuted((value) => {
      const next = !value;
      mutedRef.current = next;
      if (masterGainRef.current) {
        masterGainRef.current.gain.setTargetAtTime(
          next ? 0 : 0.28,
          audioContextRef.current?.currentTime || 0,
          0.02
        );
      }
      return next;
    });
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await shellRef.current?.requestFullscreen();
      }
    } catch (error) {
      console.warn("Fullscreen is unavailable", error);
    }
  }, []);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    let count = 0;
    const loader = window.setInterval(() => {
      count += 1;
      setLoaded(count);
      if (count >= TOTAL_ASSETS) {
        window.clearInterval(loader);
        window.setTimeout(() => setIsReady(true), 220);
      }
    }, 24);

    return () => window.clearInterval(loader);
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    let lastTime = performance.now();

    const drawFrame = (now) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        rafRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      const ctx = canvas.getContext("2d");
      const { dpr, width, height } = getCanvasMetrics(canvas);
      const delta = Math.min((now - lastTime) / 16.67, 2.5);
      lastTime = now;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = backgroundRef.current;
      ctx.fillRect(0, 0, width, height);

      const fadeToGrey = backgroundRef.current === "#b5b5b5" ? 0 : 0.008 * delta;
      if (fadeToGrey > 0) {
        ctx.fillStyle = `rgba(181, 181, 181, ${fadeToGrey})`;
        ctx.fillRect(0, 0, width, height);
      }

      const activeVisuals = [];
      visualsRef.current.forEach((visual) => {
        const progress = (now - visual.createdAt) / visual.duration;
        if (progress < 1) {
          drawVisual(ctx, visual, width, height, now);
          activeVisuals.push(visual);
        }
      });
      visualsRef.current = activeVisuals;

      rafRef.current = requestAnimationFrame(drawFrame);
    };

    rafRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const key = event.key.toUpperCase();
      if (LETTERS.includes(key)) {
        event.preventDefault();
        ensureAudio();
        triggerLetter(key);
        return;
      }

      if (event.key === "Escape") {
        setCreditsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [ensureAudio, triggerLetter]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    return () => window.clearTimeout(activeTimeoutRef.current);
  }, []);

  return (
    <main ref={shellRef} className="patatap-shell" onPointerDown={handlePointerDown}>
      <canvas ref={canvasRef} className="patatap-stage" aria-label="Patatap animation canvas" />

      {!isReady && (
        <div className="patatap-loader" role="status" aria-live="polite">
          <div className="patatap-loader-mark">Patatap</div>
          <div className="patatap-loader-count">
            <span>{loaded}</span> / <span>{TOTAL_ASSETS}</span>
          </div>
        </div>
      )}

      <div className={`patatap-hint ${isReady && hintVisible ? "is-visible" : ""}`} aria-hidden={!hintVisible}>
        <strong>Press any key A-Z</strong>
        <span>or tap the stage</span>
      </div>

      <div className={`patatap-active-key ${activeKey ? "is-visible" : ""}`} aria-hidden={!activeKey}>
        {activeKey}
      </div>

      <div className="patatap-brand" data-patatap-control>
        <span>Patatap</span>
        <small>portable animation + sound kit</small>
      </div>

      <div className="patatap-controls" data-patatap-control>
        <button type="button" className="patatap-control" onClick={() => setCreditsOpen(true)} title="Info">
          <Info size={18} />
        </button>
        <button type="button" className="patatap-control" onClick={toggleMute} title={muted ? "Unmute" : "Mute"}>
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <button
          type="button"
          className="patatap-control"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      <div className="patatap-keyboard" data-patatap-control aria-label="Keyboard shortcuts">
        {letterGrid.map((letter) => (
          <button
            key={letter}
            type="button"
            className={`patatap-key ${activeKey === letter ? "is-active" : ""}`}
            onClick={() => {
              ensureAudio();
              triggerLetter(letter);
            }}
            title={`Play ${letter}`}
          >
            {letter}
          </button>
        ))}
      </div>

      <aside className={`patatap-credits ${creditsOpen ? "is-open" : ""}`} data-patatap-control>
        <button type="button" className="patatap-close" onClick={() => setCreditsOpen(false)} title="Close">
          <X size={18} />
        </button>
        <div>
          <h2>Patatap-style keyboard</h2>
          <p>
            A local portable animation and sound kit inspired by the Patatap interaction model.
            Sounds are generated with Web Audio and every letter triggers a unique visual.
          </p>
          <p className="patatap-warning">
            Warning: contains flashing colors and rapid movement. Use mute or pause your interaction if
            visuals feel uncomfortable.
          </p>
        </div>
      </aside>
    </main>
  );
}

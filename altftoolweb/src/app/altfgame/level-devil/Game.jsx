"use client";

import { useEffect, useRef, useState } from "react";
import { playSound } from "@/app/altfgame/_lib/sounds";

/* ============================================================
   LEVEL DEVIL — a trap platformer.
   Original concept/level design. Canvas + rAF, no dependencies.
   ============================================================ */

const CANVAS_W = 960;
const CANVAS_H = 540;

const GRAVITY = 1500;      // px/s^2
const MOVE_SPEED = 300;    // px/s
const JUMP_VELOCITY = -560; // px/s
const MAX_FALL = 900;      // px/s
const PLAYER_W = 26;
const PLAYER_H = 38;
const CRUMBLE_MS = 400;    // time a crumble platform survives after being landed on

/* ---------------- level data ---------------- */

const LEVELS = [
  {
    title: "Baby Steps",
    tip: "Move with A/D or arrows. Jump with W / Up / Space. Try not to fall in the obvious hole.",
    start: { x: 40, y: 442 },
    platforms: [
      { x: 0, y: 480, w: 260, h: 60 },
      { x: 400, y: 480, w: 560, h: 60 },
    ],
    spikes: [],
    reverseZones: [],
    goal: { x: 900, y: 420, w: 40, h: 60 },
  },
  {
    title: "Floor Is Lying",
    tip: "That platform is not your friend. It leaves without warning — don't linger.",
    start: { x: 40, y: 442 },
    platforms: [
      { x: 0, y: 480, w: 200, h: 60 },
      { x: 260, y: 480, w: 140, h: 20, crumble: true },
      { x: 460, y: 480, w: 140, h: 20, crumble: true },
      { x: 660, y: 480, w: 300, h: 60 },
    ],
    spikes: [],
    reverseZones: [],
    goal: { x: 900, y: 420, w: 40, h: 60 },
  },
  {
    title: "Ambush Alley",
    tip: "Something is waiting off-screen. Keep moving, keep your reflexes ready.",
    start: { x: 40, y: 442 },
    platforms: [{ x: 0, y: 480, w: 960, h: 60 }],
    spikes: [{ x: 550, y: 450, w: 36, h: 30, hidden: true, triggerX: 380 }],
    reverseZones: [],
    goal: { x: 900, y: 420, w: 40, h: 60 },
  },
  {
    title: "Backwards Day",
    tip: "Inside the purple zone, left is right and right is left. Deal with it.",
    start: { x: 40, y: 442 },
    platforms: [
      { x: 0, y: 480, w: 400, h: 60 },
      { x: 520, y: 480, w: 440, h: 60 },
    ],
    spikes: [],
    reverseZones: [{ x: 300, y: 0, w: 260, h: CANVAS_H }],
    goal: { x: 900, y: 420, w: 40, h: 60 },
  },
  {
    title: "The Devil's Bargain",
    tip: "The safe-looking path never is. Don't stop on it — jump straight through.",
    start: { x: 40, y: 442 },
    platforms: [
      { x: 0, y: 480, w: 480, h: 60 },
      { x: 560, y: 480, w: 120, h: 20, crumble: true },
      { x: 760, y: 480, w: 200, h: 60 },
    ],
    spikes: [],
    reverseZones: [],
    goal: { x: 850, y: 420, w: 40, h: 60, triggerX: 800, shiftX: 60, shiftY: 0 },
  },
  {
    title: "Everything, Everywhere, At Once",
    tip: "Every trick we taught you. All at once. This is the finale.",
    start: { x: 40, y: 442 },
    platforms: [
      { x: 0, y: 480, w: 260, h: 60 },
      { x: 320, y: 480, w: 200, h: 60 },
      { x: 580, y: 480, w: 120, h: 20, crumble: true },
      { x: 780, y: 480, w: 180, h: 60 },
    ],
    spikes: [{ x: 460, y: 450, w: 32, h: 30, hidden: true, triggerX: 360 }],
    reverseZones: [{ x: 300, y: 0, w: 220, h: CANVAS_H }],
    goal: { x: 900, y: 420, w: 40, h: 60 },
  },
];

/* ---------------- helpers ---------------- */

function rectOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function cloneLevel(def) {
  return {
    platforms: def.platforms.map((p) => ({
      ...p,
      crumbleState: p.crumble ? "idle" : undefined,
      timer: 0,
      fade: 1,
    })),
    spikes: (def.spikes || []).map((s) => ({
      ...s,
      revealed: !s.hidden,
      slide: s.hidden ? 0 : 1,
    })),
    reverseZones: def.reverseZones || [],
    goal: {
      ...def.goal,
      curX: def.goal.x,
      curY: def.goal.y,
      triggered: false,
      progress: 0,
    },
  };
}

// Cosmetic-only dust puffs spawned on jump/land. Never read by physics/collision.
function spawnParticles(g, x, y, count, kind) {
  if (!g.particles) g.particles = [];
  const spread = kind === "jump" ? 40 : 70;
  for (let i = 0; i < count; i++) {
    const life = 0.28 + Math.random() * 0.22;
    g.particles.push({
      x: x + (Math.random() - 0.5) * 10,
      y,
      vx: (Math.random() - 0.5) * spread * 2,
      vy: -(40 + Math.random() * (kind === "jump" ? 60 : 90)),
      life,
      maxLife: life,
    });
  }
  if (g.particles.length > 80) g.particles.splice(0, g.particles.length - 80);
}

function formatTime(ms) {
  const totalSec = Math.max(0, ms) / 1000;
  const m = Math.floor(totalSec / 60);
  const s = (totalSec % 60).toFixed(1).padStart(4, "0");
  return `${m}:${s}`;
}

/* ---------------- styles ---------------- */

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap');`;

const CSS = `
${FONTS}

.ld-root, .ld-root *, .ld-root *::before, .ld-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

.ld-root {
  --bg-top: #74c6f4;
  --bg-bottom: #fff3c4;
  --surface: #ffffff;
  --surface2: #fff8ec;
  --surface3: #ffedc2;
  --border: rgba(120,80,40,0.14);
  --border2: rgba(120,80,40,0.22);
  --text: #4a3728;
  --muted: #a3856a;
  --accent: #ff5e3a;
  --accent2: #ffb347;
  --good: #43a047;
  --font-display: 'Fredoka', 'Baloo 2', sans-serif;
  --font-body: 'Nunito', sans-serif;
  --font-mono: 'Nunito', sans-serif;

  font-family: var(--font-body);
  background: linear-gradient(180deg, var(--bg-top) 0%, #bfe3f7 45%, var(--bg-bottom) 100%);
  background-attachment: fixed;
  color: var(--text);
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow-x: hidden;
  padding: 1.5rem 1rem 2.5rem;
  gap: 1.25rem;
}

.ld-bg-glow {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(circle 90px at 88% 8%, rgba(255,244,196,0.9) 0%, rgba(255,244,196,0) 70%),
    radial-gradient(ellipse 55% 35% at 12% 12%, rgba(255,255,255,0.55) 0%, transparent 65%),
    radial-gradient(ellipse 45% 30% at 85% 85%, rgba(255,255,255,0.35) 0%, transparent 65%);
}

/* ---- MENU SCREEN ---- */
.ld-menu {
  position: relative; z-index: 1;
  width: 100%; max-width: 720px;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  gap: 1.5rem;
  padding: 3rem 1.5rem;
  margin-top: 2rem;
}

.ld-menu-badge {
  font-family: var(--font-body); font-size: 0.72rem; letter-spacing: 0.2em; font-weight: 800;
  color: #fff; text-transform: uppercase;
  padding: 0.4rem 1.1rem;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent2), var(--accent));
  box-shadow: 0 4px 14px rgba(255,94,58,0.35);
}

.ld-menu-title {
  font-family: var(--font-display); font-weight: 700;
  font-size: clamp(3.2rem, 11vw, 6.5rem);
  letter-spacing: 0.01em; line-height: 0.95;
  color: var(--text);
  text-shadow: 3px 4px 0 rgba(255,255,255,0.6);
}
.ld-menu-title span { color: var(--accent); }

.ld-menu-flavor {
  font-size: clamp(0.95rem, 2vw, 1.15rem);
  color: var(--text);
  opacity: 0.85;
  max-width: 480px; line-height: 1.6; font-weight: 600;
}
.ld-menu-flavor b { color: var(--accent); font-weight: 800; }

.ld-start-btn {
  margin-top: 0.5rem;
  padding: 1rem 3.2rem;
  background: linear-gradient(135deg, var(--accent2), var(--accent));
  border: none; cursor: pointer;
  border-radius: 999px;
  font-family: var(--font-display); font-weight: 700; font-size: 1.5rem; letter-spacing: 0.04em;
  color: #fff; text-transform: uppercase;
  box-shadow: 0 8px 0 #c23b1c, 0 14px 24px rgba(255,94,58,0.35);
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ld-start-btn:hover { transform: translateY(-3px) scale(1.04); box-shadow: 0 11px 0 #c23b1c, 0 18px 28px rgba(255,94,58,0.4); }
.ld-start-btn:active { transform: translateY(3px) scale(0.96); box-shadow: 0 4px 0 #c23b1c, 0 8px 16px rgba(255,94,58,0.35); transition-duration: 0.12s; }

.ld-menu-levels {
  display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; margin-top: 1rem;
}
.ld-menu-level-chip {
  font-family: var(--font-body); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.02em;
  color: var(--muted); padding: 0.35rem 0.8rem;
  background: var(--surface); border: 1px solid var(--border2);
  border-radius: 999px;
  box-shadow: 0 1px 2px rgba(120,80,40,0.06), 0 2px 6px rgba(120,80,40,0.1);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
}
.ld-menu-level-chip:hover { transform: translateY(-2px); box-shadow: 0 1px 2px rgba(120,80,40,0.08), 0 6px 14px rgba(120,80,40,0.16); }

.ld-menu-icon {
  font-size: clamp(2.4rem, 6vw, 3.4rem);
  line-height: 1;
  filter: drop-shadow(0 6px 10px rgba(120,80,40,0.25));
  animation: ldIdleBob 2.8s ease-in-out infinite;
  transform-origin: 50% 85%;
}
@keyframes ldIdleBob {
  0%, 100% { transform: translateY(0) rotate(-5deg) scale(1); }
  50% { transform: translateY(-9px) rotate(5deg) scale(1.05); }
}

/* ---- GAME SHELL ---- */
.ld-shell {
  position: relative; z-index: 1;
  width: 100%; max-width: 960px;
  display: flex; flex-direction: column; gap: 0.85rem;
}

/* HUD */
.ld-hud {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;
  gap: 0.6rem;
  padding: 0.7rem 1.2rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(120,80,40,0.06), 0 6px 18px rgba(120,80,40,0.12), 0 16px 32px rgba(120,80,40,0.06);
}

.ld-hud-brand {
  display: flex; align-items: center; gap: 0.5rem;
  font-family: var(--font-display); font-weight: 700; font-size: 1.3rem; letter-spacing: 0.02em;
  color: var(--accent);
}
.ld-hud-dot {
  width: 8px; height: 8px; border-radius: 50%; background: var(--accent2);
  animation: ldPulse 1.3s ease-in-out infinite;
}
@keyframes ldPulse { 0%,100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.6); opacity: 1; } }

.ld-hud-stats { display: flex; gap: 0.5rem; flex-wrap: wrap; }

.ld-pill {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.3rem 0.85rem;
  background: var(--surface2); border: 1px solid var(--border2);
  font-family: var(--font-body); font-size: 0.72rem;
  border-radius: 999px;
}
.ld-pill .lbl { color: var(--muted); letter-spacing: 0.04em; text-transform: uppercase; font-weight: 700; }
.ld-pill .val { font-weight: 800; color: var(--text); font-size: 0.88rem; }

.ld-hud-btn {
  padding: 0.4rem 1rem;
  background: var(--surface3); border: 1px solid var(--border2);
  color: var(--text); font-family: var(--font-body);
  font-size: 0.75rem; font-weight: 800; cursor: pointer;
  transition: background 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease;
  letter-spacing: 0.02em; text-transform: uppercase;
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(120,80,40,0.08);
}
.ld-hud-btn:hover { background: var(--accent2); color: #fff; transform: translateY(-1px) scale(1.03); box-shadow: 0 6px 14px rgba(120,80,40,0.18); }
.ld-hud-btn:active { transform: translateY(1px) scale(0.96); transition-duration: 0.1s; }

.ld-hud-tip {
  width: 100%;
  font-family: var(--font-body); font-size: 0.75rem; letter-spacing: 0.01em; font-weight: 600;
  color: var(--muted); padding-top: 0.2rem;
}
.ld-hud-tip b { color: var(--accent); }

/* CANVAS AREA */
.ld-stage-wrap {
  position: relative;
  width: 100%;
  border: 4px solid #fff;
  background: linear-gradient(180deg, #74c6f4 0%, #fff3c4 100%);
  padding: 6px;
  border-radius: 22px;
  box-shadow: 0 2px 4px rgba(120,80,40,0.1), 0 10px 28px rgba(120,80,40,0.18), 0 24px 48px rgba(120,80,40,0.1);
  overflow: hidden;
}

.ld-canvas {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: ${CANVAS_W} / ${CANVAS_H};
  background: #bfe3f7;
  border-radius: 16px;
}

/* TOAST */
.ld-toast {
  position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
  padding: 0.55rem 1.2rem;
  background: #eafcef;
  border: 1px solid rgba(67,160,71,0.45);
  color: #2e7d32;
  font-family: var(--font-body); font-size: 0.78rem; font-weight: 800; letter-spacing: 0.02em;
  text-transform: uppercase; white-space: nowrap;
  border-radius: 999px;
  box-shadow: 0 2px 4px rgba(46,125,50,0.12), 0 6px 16px rgba(46,125,50,0.2);
  animation: ldToastIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  z-index: 20; pointer-events: none;
}
@keyframes ldToastIn {
  0% { opacity: 0; transform: translate(-50%, -18px) scale(0.7); }
  55% { opacity: 1; transform: translate(-50%, 3px) scale(1.06); }
  100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
}

/* TOUCH CONTROLS */
.ld-touch-layer {
  position: absolute; left: 0; right: 0; bottom: 0; top: 0;
  display: flex; align-items: flex-end; justify-content: space-between;
  padding: 0 0.75rem 0.75rem;
  pointer-events: none;
  z-index: 15;
}
.ld-touch-side { display: flex; gap: 0.6rem; pointer-events: auto; }
.ld-touch-btn {
  width: 58px; height: 58px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.75);
  border: 2px solid var(--accent);
  color: var(--accent); font-size: 1.4rem; font-weight: 800;
  border-radius: 50%;
  touch-action: none; -webkit-user-select: none; user-select: none;
  backdrop-filter: blur(2px);
  box-shadow: 0 1px 2px rgba(120,80,40,0.1), 0 4px 10px rgba(120,80,40,0.18);
  transition: background 0.15s ease-out, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s ease-out;
}
.ld-touch-btn:active, .ld-touch-btn.pressed {
  background: var(--accent); color: #fff; transform: scale(0.9);
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.25), 0 2px 4px rgba(120,80,40,0.15);
  transition-duration: 0.08s;
}
.ld-touch-btn.jump { width: 68px; height: 68px; border-color: var(--accent2); font-size: 1.6rem; }

/* ---- RESULT / VICTORY OVERLAY ---- */
.ld-overlay {
  position: fixed; inset: 0; z-index: 500;
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
  background: linear-gradient(160deg, rgba(116,198,244,0.92) 0%, rgba(191,227,247,0.92) 45%, rgba(255,243,196,0.95) 100%);
  backdrop-filter: blur(6px);
  animation: ldFadeIn 0.35s ease-out;
}
@keyframes ldFadeIn { from { opacity: 0; } to { opacity: 1; } }

.ld-card {
  max-width: 520px; width: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  overflow: hidden;
  border-radius: 24px;
  box-shadow: 0 2px 6px rgba(120,80,40,0.14), 0 20px 50px rgba(120,80,40,0.28), 0 40px 80px rgba(120,80,40,0.14);
  animation: ldPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both;
}
@keyframes ldPop {
  from { opacity: 0; transform: scale(0.8) translateY(40px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.ld-card-header {
  padding: 2.5rem 2rem 1.5rem; text-align: center;
  background: linear-gradient(135deg, rgba(255,94,58,0.18), rgba(255,179,71,0.14));
}

.ld-card-big {
  font-family: var(--font-display); font-weight: 700;
  font-size: clamp(3.2rem, 9vw, 6rem);
  letter-spacing: 0.01em; line-height: 1;
  color: var(--accent);
  text-shadow: 3px 4px 0 rgba(255,255,255,0.6);
  margin-bottom: 0.5rem;
}

.ld-card-tagline {
  font-family: var(--font-body); font-weight: 700; font-size: 0.78rem;
  letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted);
}

.ld-card-body { padding: 1.5rem 2rem 2rem; }

.ld-stats-row {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; margin-bottom: 1.5rem;
}
.ld-stat { padding: 1rem; text-align: center; background: var(--surface2); border: 1px solid var(--border); border-radius: 16px; }
.ld-stat-val { font-family: var(--font-display); font-weight: 700; font-size: 2.1rem; line-height: 1; letter-spacing: 0.01em; color: var(--text); }
.ld-stat-lbl { font-family: var(--font-body); font-weight: 700; font-size: 0.62rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-top: 0.3rem; }

.ld-card-msg {
  font-size: 0.92rem; font-weight: 600; color: var(--text); opacity: 0.8;
  text-align: center; margin-bottom: 1.5rem; line-height: 1.6; font-style: italic;
}

.ld-card-btn-row { display: flex; gap: 0.75rem; }
.ld-card-btn {
  flex: 1; padding: 0.9rem;
  font-family: var(--font-display); font-weight: 700; font-size: 1.05rem; letter-spacing: 0.02em;
  cursor: pointer; border: none;
  border-radius: 999px;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.25s ease, box-shadow 0.25s ease;
  text-transform: uppercase;
}
.ld-card-btn.primary {
  background: linear-gradient(135deg, var(--accent2), var(--accent));
  color: #fff;
  box-shadow: 0 6px 0 #c23b1c, 0 10px 20px rgba(255,94,58,0.35);
}
.ld-card-btn.secondary { background: var(--surface3); color: var(--text); box-shadow: 0 6px 0 var(--border2); }
.ld-card-btn:hover { transform: translateY(-2px) scale(1.03); filter: brightness(1.05); }
.ld-card-btn:active { transform: translateY(3px) scale(0.97); transition-duration: 0.12s; }

/* confetti */
.ld-confetti-bit {
  position: fixed; top: -10px; pointer-events: none; z-index: 600;
  animation: ldConfettiFall linear forwards;
}
@keyframes ldConfettiFall { to { top: 110vh; transform: rotate(720deg); } }

@media (max-width: 640px) {
  .ld-hud { padding: 0.5rem 0.7rem; }
  .ld-hud-brand { font-size: 1.05rem; }
  .ld-pill { font-size: 0.64rem; padding: 0.22rem 0.6rem; }
  .ld-touch-btn { width: 50px; height: 50px; font-size: 1.15rem; }
  .ld-touch-btn.jump { width: 58px; height: 58px; }
}
`;

/* ---------------- confetti ---------------- */

function Confetti({ active }) {
  if (!active) return null;
  const colors = ["#ff5e3a", "#ffb347", "#ffd166", "#4ecdc4", "#ff6b9d", "#ffffff"];
  return Array.from({ length: 50 }, (_, i) => (
    <div
      key={i}
      className="ld-confetti-bit"
      style={{
        left: `${Math.random() * 100}vw`,
        background: colors[i % colors.length],
        width: `${5 + Math.random() * 8}px`,
        height: `${8 + Math.random() * 12}px`,
        animationDelay: `${Math.random() * 0.6}s`,
        animationDuration: `${1.2 + Math.random() * 1.5}s`,
        borderRadius: Math.random() > 0.5 ? "50%" : "0",
        opacity: 0.85,
      }}
    />
  ));
}

/* ---------------- main component ---------------- */

export default function LevelDevil() {
  const canvasRef = useRef(null);
  const keysRef = useRef({ left: false, right: false, jump: false });
  const gameRef = useRef(null);
  const startTimeRef = useRef(0);
  const toastTimeoutRef = useRef(null);

  const [phase, setPhase] = useState("menu"); // menu | playing | victory
  const [levelIndex, setLevelIndex] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [toast, setToast] = useState(null);
  const [pressedTouch, setPressedTouch] = useState({ left: false, right: false, jump: false });

  /* ---- level lifecycle helpers ---- */

  function setupRuntimeLevel(idx) {
    const g = gameRef.current;
    const def = LEVELS[idx];
    g.level = cloneLevel(def);
    g.player.x = def.start.x;
    g.player.y = def.start.y;
    g.player.vx = 0;
    g.player.vy = 0;
    g.player.grounded = false;
    g.player.jumpLock = false;
    g.player.squashX = 1;
    g.player.squashY = 1;
  }

  function respawn(resetRuntime) {
    const g = gameRef.current;
    if (!g) return;
    if (resetRuntime) {
      setupRuntimeLevel(g.levelIndex);
    } else {
      const def = LEVELS[g.levelIndex];
      g.player.x = def.start.x;
      g.player.y = def.start.y;
      g.player.vx = 0;
      g.player.vy = 0;
      g.player.grounded = false;
      g.player.squashX = 1;
      g.player.squashY = 1;
    }
  }

  function triggerDeath() {
    const g = gameRef.current;
    if (!g) return;
    g.deaths += 1;
    setDeaths(g.deaths);
    g.flashTimer = 300;
    g.shakeTimer = 260;
    respawn(true);
    playSound("hit");
  }

  function triggerAdvance() {
    const g = gameRef.current;
    if (!g) return;
    if (g.levelIndex >= LEVELS.length - 1) {
      const total = performance.now() - startTimeRef.current;
      setElapsedMs(total);
      setPhase("victory");
      playSound("win");
      return;
    }
    const clearedTitle = LEVELS[g.levelIndex].title;
    g.levelIndex += 1;
    setupRuntimeLevel(g.levelIndex);
    setLevelIndex(g.levelIndex);
    setToast(`Door Cleared — "${clearedTitle}" beaten`);
    playSound("level");
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 1400);
  }

  function beginRun() {
    gameRef.current = {
      levelIndex: 0,
      level: cloneLevel(LEVELS[0]),
      player: {
        x: LEVELS[0].start.x,
        y: LEVELS[0].start.y,
        vx: 0,
        vy: 0,
        w: PLAYER_W,
        h: PLAYER_H,
        grounded: false,
        jumpLock: false,
        facing: 1,
        squashX: 1,
        squashY: 1,
      },
      deaths: 0,
      flashTimer: 0,
      shakeTimer: 0,
      particles: [],
    };
    startTimeRef.current = performance.now();
    setLevelIndex(0);
    setDeaths(0);
    setElapsedMs(0);
    setToast(null);
    setPhase("playing");
    playSound("start");
  }

  function restartLevelBtn() {
    if (phase !== "playing") return;
    respawn(true);
  }

  /* ---- physics update ---- */

  function update(dt) {
    const g = gameRef.current;
    if (!g) return;
    const p = g.player;
    const lvl = g.level;
    const keys = keysRef.current;
    const wasGrounded = p.grounded; // for landing-squash detection only (visual)

    let moveDir = 0;
    if (keys.left) moveDir -= 1;
    if (keys.right) moveDir += 1;

    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    let reversed = false;
    for (const z of lvl.reverseZones) {
      if (cx >= z.x && cx <= z.x + z.w && cy >= z.y && cy <= z.y + z.h) {
        reversed = true;
        break;
      }
    }
    g.inReverseZone = reversed;
    if (reversed) moveDir = -moveDir;

    p.vx = moveDir * MOVE_SPEED;
    if (moveDir !== 0) p.facing = moveDir;

    if (keys.jump && p.grounded && !p.jumpLock) {
      p.vy = JUMP_VELOCITY;
      p.grounded = false;
      p.jumpLock = true;
      // visual-only stretch + puff on jump start (no effect on physics)
      p.squashX = 0.78;
      p.squashY = 1.28;
      spawnParticles(g, p.x + p.w / 2, p.y + p.h, 5, "jump");
    }
    if (!keys.jump) p.jumpLock = false;

    p.vy += GRAVITY * dt;
    if (p.vy > MAX_FALL) p.vy = MAX_FALL;

    const active = lvl.platforms.filter((pl) => pl.crumbleState !== "gone");

    // horizontal
    p.x += p.vx * dt;
    if (p.x < 0) p.x = 0;
    if (p.x > CANVAS_W - p.w) p.x = CANVAS_W - p.w;
    for (const pl of active) {
      if (rectOverlap(p, pl)) {
        if (p.vx > 0) p.x = pl.x - p.w;
        else if (p.vx < 0) p.x = pl.x + pl.w;
      }
    }

    // vertical
    p.y += p.vy * dt;
    p.grounded = false;
    let landedOn = null;
    for (const pl of active) {
      if (rectOverlap(p, pl)) {
        if (p.vy > 0) {
          p.y = pl.y - p.h;
          p.vy = 0;
          p.grounded = true;
          landedOn = pl;
        } else if (p.vy < 0) {
          p.y = pl.y + pl.h;
          p.vy = 0;
        }
      }
    }

    if (landedOn && !wasGrounded) {
      // visual-only squash + dust puff on landing (no effect on physics)
      p.squashX = 1.32;
      p.squashY = 0.72;
      spawnParticles(g, p.x + p.w / 2, p.y + p.h, 7, "land");
    }

    if (landedOn && landedOn.crumble && landedOn.crumbleState === "idle") {
      landedOn.crumbleState = "active";
      landedOn.timer = 0;
    }
    for (const pl of lvl.platforms) {
      if (pl.crumble && pl.crumbleState === "active") {
        pl.timer += dt * 1000;
        if (pl.timer >= CRUMBLE_MS) {
          pl.crumbleState = "gone";
          pl.fade = 1;
        }
      }
      if (pl.crumbleState === "gone" && pl.fade > 0) {
        pl.fade -= dt * 4;
        if (pl.fade < 0) pl.fade = 0;
      }
    }

    for (const s of lvl.spikes) {
      if (!s.revealed && s.triggerX !== undefined && p.x + p.w / 2 > s.triggerX) {
        s.revealed = true;
        s.slide = 0;
      }
      if (s.revealed && s.slide < 1) {
        s.slide = Math.min(1, s.slide + dt * 6);
      }
    }

    // ease squash back to neutral + advance dust particles (visual only, always runs)
    p.squashX += (1 - p.squashX) * Math.min(1, dt * 10);
    p.squashY += (1 - p.squashY) * Math.min(1, dt * 10);
    if (g.particles && g.particles.length) {
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const pt = g.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.vy += 480 * dt;
        pt.life -= dt;
        if (pt.life <= 0) g.particles.splice(i, 1);
      }
    }

    let died = false;
    if (p.y > CANVAS_H + 150) died = true;
    for (const s of lvl.spikes) {
      if (s.revealed && s.slide > 0.55 && rectOverlap(p, s)) died = true;
    }
    if (died) {
      triggerDeath();
      return;
    }

    const goal = lvl.goal;
    if (goal.triggerX !== undefined && !goal.triggered && p.x > goal.triggerX) {
      goal.triggered = true;
      goal.progress = 0;
    }
    if (goal.triggered && goal.progress < 1) {
      goal.progress = Math.min(1, goal.progress + dt / 0.5);
    }
    const ease = goal.progress > 0 ? easeOutCubic(goal.progress) : 0;
    goal.curX = goal.x + (goal.shiftX || 0) * ease;
    goal.curY = goal.y + (goal.shiftY || 0) * ease;

    if (rectOverlap(p, { x: goal.curX, y: goal.curY, w: goal.w, h: goal.h })) {
      triggerAdvance();
      return;
    }

    if (g.flashTimer > 0) g.flashTimer -= dt * 1000;
    if (g.shakeTimer > 0) g.shakeTimer -= dt * 1000;
  }

  /* ---- draw ---- */

  function draw(ctx) {
    const g = gameRef.current;
    if (!g) return;
    const { player: p, level: lvl } = g;

    ctx.save();
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    if (g.shakeTimer > 0) {
      const shakeT = g.shakeTimer / 260;
      const mag = 7 * shakeT * shakeT;
      ctx.translate((Math.random() - 0.5) * mag * 2, (Math.random() - 0.5) * mag * 2);
    }

    // sunny sky gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    bgGrad.addColorStop(0, "#74c6f4");
    bgGrad.addColorStop(0.6, "#bfe3f7");
    bgGrad.addColorStop(1, "#fff3c4");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(-20, -20, CANVAS_W + 40, CANVAS_H + 40);

    // sun
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.arc(CANVAS_W - 100, 85, 62, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff4c4";
    ctx.beginPath();
    ctx.arc(CANVAS_W - 100, 85, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // fluffy clouds
    const drawCloud = (cx, cy, scale) => {
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath();
      ctx.arc(cx, cy, 16 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 18 * scale, cy - 7 * scale, 20 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 38 * scale, cy, 16 * scale, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    drawCloud(110, 70, 1);
    drawCloud(320, 48, 0.7);
    drawCloud(600, 105, 0.85);

    for (const z of lvl.reverseZones) {
      ctx.fillStyle = "rgba(178,120,240,0.18)";
      ctx.fillRect(z.x, z.y, z.w, z.h);
      ctx.strokeStyle = "rgba(150,90,220,0.55)";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(z.x + 3, z.y + 3, z.w - 6, z.h - 6);
      ctx.setLineDash([]);
    }

    for (const pl of lvl.platforms) {
      let opacity = 1;
      let offX = 0;
      let offY = 0;
      let shakeT = 0;
      if (pl.crumble) {
        if (pl.crumbleState === "gone") {
          opacity = pl.fade;
          if (opacity <= 0) continue;
        } else if (pl.crumbleState === "active") {
          const t = pl.timer / CRUMBLE_MS;
          shakeT = t;
          const mag = 2 + t * 5;
          offX = (Math.random() - 0.5) * mag;
          offY = (Math.random() - 0.5) * mag;
          opacity = 1 - t * 0.15;
        }
      }
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(offX, offY);

      // ambient soft shadow (layer 1 — wide, blurred, shape-only via shadow)
      ctx.save();
      ctx.shadowColor = "rgba(70,45,20,0.28)";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = "rgba(70,45,20,0.001)";
      ctx.beginPath();
      ctx.roundRect(pl.x, pl.y, pl.w, pl.h, 8);
      ctx.fill();
      ctx.restore();

      // contact shadow (layer 2 — tight, crisp)
      ctx.fillStyle = "rgba(70,45,20,0.22)";
      ctx.beginPath();
      ctx.roundRect(pl.x + 3, pl.y + 6, pl.w, pl.h, 8);
      ctx.fill();

      // dirt body
      ctx.fillStyle = pl.crumble ? "#b9835a" : "#8a5a34";
      ctx.beginPath();
      ctx.roundRect(pl.x, pl.y, pl.w, pl.h, 8);
      ctx.fill();

      // grass top strip
      const grassH = Math.min(10, Math.max(4, pl.h * 0.35));
      ctx.fillStyle = pl.crumble ? "#d7e88a" : "#7bc043";
      ctx.beginPath();
      ctx.roundRect(pl.x, pl.y, pl.w, grassH, [8, 8, 0, 0]);
      ctx.fill();

      if (pl.crumble && pl.crumbleState === "active") {
        // crack lines
        ctx.strokeStyle = "rgba(70,40,15,0.65)";
        ctx.lineWidth = 1.5;
        const midX = pl.x + pl.w / 2;
        ctx.beginPath();
        ctx.moveTo(midX - 10, pl.y + 3);
        ctx.lineTo(midX - 2, pl.y + pl.h * 0.5);
        ctx.lineTo(midX - 8, pl.y + pl.h - 2);
        ctx.moveTo(midX - 2, pl.y + pl.h * 0.5);
        ctx.lineTo(midX + 12, pl.y + pl.h - 3);
        ctx.stroke();

        // dust puffs
        for (let i = 0; i < 4; i++) {
          const dustX = pl.x + pl.w / 2 + (Math.random() - 0.5) * pl.w * 0.8;
          const dustY = pl.y + pl.h + Math.random() * 8;
          ctx.fillStyle = `rgba(160,120,80,${0.35 * (1 - shakeT * 0.3)})`;
          ctx.beginPath();
          ctx.arc(dustX, dustY, 2 + Math.random() * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }

    for (const s of lvl.spikes) {
      if (!s.revealed) continue;
      const slideOff = (1 - s.slide) * -50;
      ctx.save();
      ctx.translate(0, slideOff);
      ctx.shadowColor = "rgba(120,20,10,0.35)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 3;
      const teeth = Math.max(1, Math.round(s.w / 14));
      const tw = s.w / teeth;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#a52a1a";
      for (let i = 0; i < teeth; i++) {
        const bx = s.x + i * tw;
        const grad = ctx.createLinearGradient(bx, s.y, bx, s.y + s.h);
        grad.addColorStop(0, "#ff8a5c");
        grad.addColorStop(1, "#ff5e3a");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(bx + 1, s.y + s.h);
        ctx.lineTo(bx + tw / 2, s.y);
        ctx.lineTo(bx + tw - 1, s.y + s.h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // goal — cartoon door
    const goal = lvl.goal;
    ctx.save();
    const bob = Math.sin(performance.now() / 300) * 2;
    ctx.translate(0, bob);
    const doorX = goal.curX;
    const doorY = goal.curY;
    const doorW = goal.w;
    const doorH = goal.h;
    const archR = doorW / 2;

    // ambient soft shadow (blurred, shape-only via shadow)
    ctx.save();
    ctx.shadowColor = "rgba(70,45,20,0.3)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "rgba(70,45,20,0.001)";
    ctx.beginPath();
    ctx.roundRect(doorX, doorY, doorW, doorH, [archR, archR, 4, 4]);
    ctx.fill();
    ctx.restore();

    // shadow
    ctx.fillStyle = "rgba(70,45,20,0.2)";
    ctx.beginPath();
    ctx.roundRect(doorX + 2, doorY + 4, doorW, doorH, [archR, archR, 4, 4]);
    ctx.fill();

    // frame
    ctx.fillStyle = "#8a5a2f";
    ctx.beginPath();
    ctx.roundRect(doorX, doorY, doorW, doorH, [archR, archR, 4, 4]);
    ctx.fill();
    ctx.strokeStyle = "#5c3a1c";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // inner panel
    ctx.fillStyle = "#a9744a";
    ctx.beginPath();
    ctx.roundRect(doorX + 5, doorY + 6, doorW - 10, doorH - 10, [Math.max(0, archR - 5), Math.max(0, archR - 5), 3, 3]);
    ctx.fill();

    // doorknob
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.arc(doorX + doorW - 9, doorY + doorH * 0.6, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#c98a1f";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // player — cute rounded devil
    ctx.save();
    ctx.translate(p.x, p.y);

    // ground shadow (kept outside the squash transform so it never distorts)
    ctx.save();
    ctx.shadowColor = "rgba(70,45,20,0.25)";
    ctx.shadowBlur = 5;
    ctx.fillStyle = "rgba(70,45,20,0.22)";
    ctx.beginPath();
    ctx.ellipse(p.w / 2, p.h + 2, p.w / 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // squash & stretch — visual-only transform anchored at the feet, applied at render time.
    // Physics/collision above never read squashX/squashY.
    const sqx = p.squashX ?? 1;
    const sqy = p.squashY ?? 1;
    ctx.translate(p.w / 2, p.h);
    ctx.scale(sqx, sqy);
    ctx.translate(-p.w / 2, -p.h);

    // body
    const bodyGrad = ctx.createLinearGradient(0, 0, 0, p.h);
    bodyGrad.addColorStop(0, "#ff8a5c");
    bodyGrad.addColorStop(1, "#ff5e3a");
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(0, 5, p.w, p.h - 5, 10);
    ctx.fill();
    ctx.strokeStyle = "#c23b1c";
    ctx.lineWidth = 2;
    ctx.stroke();

    // little horns
    ctx.fillStyle = "#ffb347";
    ctx.beginPath();
    ctx.moveTo(3, 8);
    ctx.lineTo(7, -5);
    ctx.lineTo(11, 8);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(p.w - 3, 8);
    ctx.lineTo(p.w - 7, -5);
    ctx.lineTo(p.w - 11, 8);
    ctx.closePath();
    ctx.fill();

    // eyes
    const eyeDir = p.facing >= 0 ? 1 : -1;
    const eyeBaseX = p.w / 2 + eyeDir * 2;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(eyeBaseX - 5, 16, 4.5, 5.5, 0, 0, Math.PI * 2);
    ctx.ellipse(eyeBaseX + 5, 16, 4.5, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2b1a12";
    ctx.beginPath();
    ctx.arc(eyeBaseX - 5 + eyeDir * 1.4, 17, 2.2, 0, Math.PI * 2);
    ctx.arc(eyeBaseX + 5 + eyeDir * 1.4, 17, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // smile
    ctx.strokeStyle = "#7a2a12";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(p.w / 2, 23, 5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    ctx.restore();

    // ambient dust particles (jump/land puffs) — purely cosmetic, world-space
    if (g.particles && g.particles.length) {
      for (const pt of g.particles) {
        const a = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = `rgba(255,205,150,${0.55 * a})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1.4 + 2.2 * a, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (g.flashTimer > 0) {
      const flashT = g.flashTimer / 300;
      ctx.fillStyle = `rgba(255,70,60,${Math.min(0.4, flashT * 0.4)})`;
      ctx.fillRect(-30, -30, CANVAS_W + 60, CANVAS_H + 60);

      // punchy white pulse radiating from the player for extra impact
      const pulseR = 30 + (1 - flashT) * 260;
      const pulse = ctx.createRadialGradient(
        p.x + p.w / 2, p.y + p.h / 2, 0,
        p.x + p.w / 2, p.y + p.h / 2, pulseR
      );
      pulse.addColorStop(0, `rgba(255,255,255,${0.45 * flashT})`);
      pulse.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = pulse;
      ctx.fillRect(-30, -30, CANVAS_W + 60, CANVAS_H + 60);
    }

    ctx.restore();
  }

  /* ---- main loop ---- */

  useEffect(() => {
    if (phase !== "playing") return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    let raf = null;
    let last = performance.now();
    let hudAccum = 0;

    function frame(now) {
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 1 / 30) dt = 1 / 30;
      update(dt);
      draw(ctx);
      hudAccum += dt;
      if (hudAccum > 0.1) {
        hudAccum = 0;
        setElapsedMs(performance.now() - startTimeRef.current);
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ---- keyboard ---- */

  useEffect(() => {
    function onKeyDown(e) {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          keysRef.current.left = true;
          break;
        case "ArrowRight":
        case "d":
        case "D":
          keysRef.current.right = true;
          break;
        case "ArrowUp":
        case "w":
        case "W":
        case " ":
          keysRef.current.jump = true;
          if (e.key === " ") e.preventDefault();
          break;
        case "r":
        case "R":
          respawn(true);
          break;
        default:
          break;
      }
    }
    function onKeyUp(e) {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          keysRef.current.left = false;
          break;
        case "ArrowRight":
        case "d":
        case "D":
          keysRef.current.right = false;
          break;
        case "ArrowUp":
        case "w":
        case "W":
        case " ":
          keysRef.current.jump = false;
          break;
        default:
          break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ---- cleanup pending timeouts on unmount ---- */

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  /* ---- touch controls ---- */

  function touchDown(key) {
    keysRef.current[key] = true;
    setPressedTouch((prev) => ({ ...prev, [key]: true }));
  }
  function touchUp(key) {
    keysRef.current[key] = false;
    setPressedTouch((prev) => ({ ...prev, [key]: false }));
  }

  const currentDef = LEVELS[levelIndex];
  const totalLevels = LEVELS.length;

  return (
    <div className="ld-root">
      <style>{CSS}</style>
      <div className="ld-bg-glow" />

      {phase === "menu" && (
        <div className="ld-menu">
          <div className="ld-menu-badge">★ Trap Platformer ★</div>
          <div className="ld-menu-icon" aria-hidden="true">
            😈
          </div>
          <div className="ld-menu-title">
            LEVEL <span>DEVIL</span>
          </div>
          <div className="ld-menu-flavor">
            Run. Jump. Get betrayed by the floor. <b>You will die a lot.</b> That's the design —
            every death is instant, every respawn is free, and the level is actively trying to
            ruin your day. Six hand-built rooms of pure trickery await.
          </div>
          <button className="ld-start-btn" onClick={beginRun}>
            Start
          </button>
          <div className="ld-menu-levels">
            {LEVELS.map((l, i) => (
              <div key={i} className="ld-menu-level-chip">
                {String(i + 1).padStart(2, "0")} — {l.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === "victory" && (
        <div className="ld-overlay">
          <Confetti active />
          <div className="ld-card">
            <div className="ld-card-header">
              <div className="ld-card-big">ESCAPED</div>
              <div className="ld-card-tagline">You outsmarted every trap the devil built!</div>
            </div>
            <div className="ld-card-body">
              <div className="ld-stats-row">
                <div className="ld-stat">
                  <div className="ld-stat-val" style={{ color: "#ff5e3a" }}>
                    {deaths}
                  </div>
                  <div className="ld-stat-lbl">Total Deaths</div>
                </div>
                <div className="ld-stat">
                  <div className="ld-stat-val" style={{ color: "#ffb347" }}>
                    {formatTime(elapsedMs)}
                  </div>
                  <div className="ld-stat-lbl">Total Time</div>
                </div>
                <div className="ld-stat">
                  <div className="ld-stat-val" style={{ color: "#43a047" }}>
                    {totalLevels}/{totalLevels}
                  </div>
                  <div className="ld-stat-lbl">Doors Cleared</div>
                </div>
              </div>
              <div className="ld-card-msg">
                {deaths === 0
                  ? "Zero deaths? Either you cheated or you ARE the devil."
                  : deaths < 15
                  ? "Surprisingly clean run. The devil is mildly annoyed."
                  : "A glorious, chaotic mess of a run. The devil respects the effort."}
              </div>
              <div className="ld-card-btn-row">
                <button className="ld-card-btn primary" onClick={beginRun}>
                  Play Again
                </button>
                <button className="ld-card-btn secondary" onClick={() => setPhase("menu")}>
                  Main Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === "playing" && (
        <div className="ld-shell">
          <div className="ld-hud">
            <div className="ld-hud-brand">
              <span className="ld-hud-dot" />
              LEVEL DEVIL
            </div>
            <div className="ld-hud-stats">
              <div className="ld-pill">
                <span className="lbl">Level</span>
                <span className="val">
                  {levelIndex + 1}/{totalLevels}
                </span>
              </div>
              <div className="ld-pill">
                <span className="lbl">Deaths</span>
                <span className="val" style={{ color: "#ff5e3a" }}>
                  {deaths}
                </span>
              </div>
              <div className="ld-pill">
                <span className="lbl">Time</span>
                <span className="val">{formatTime(elapsedMs)}</span>
              </div>
            </div>
            <button className="ld-hud-btn" onClick={restartLevelBtn}>
              Restart (R)
            </button>
            <div className="ld-hud-tip">
              <b>{currentDef.title}:</b> {currentDef.tip}
            </div>
          </div>

          <div className="ld-stage-wrap">
            {toast && <div className="ld-toast">{toast}</div>}
            <canvas ref={canvasRef} className="ld-canvas" width={CANVAS_W} height={CANVAS_H} />

            <div className="ld-touch-layer">
              <div className="ld-touch-side">
                <div
                  className={`ld-touch-btn ${pressedTouch.left ? "pressed" : ""}`}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    touchDown("left");
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault();
                    touchUp("left");
                  }}
                  onPointerLeave={() => touchUp("left")}
                  onPointerCancel={() => touchUp("left")}
                >
                  ◀
                </div>
                <div
                  className={`ld-touch-btn ${pressedTouch.right ? "pressed" : ""}`}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    touchDown("right");
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault();
                    touchUp("right");
                  }}
                  onPointerLeave={() => touchUp("right")}
                  onPointerCancel={() => touchUp("right")}
                >
                  ▶
                </div>
              </div>
              <div className="ld-touch-side">
                <div
                  className={`ld-touch-btn jump ${pressedTouch.jump ? "pressed" : ""}`}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    touchDown("jump");
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault();
                    touchUp("jump");
                  }}
                  onPointerLeave={() => touchUp("jump")}
                  onPointerCancel={() => touchUp("jump")}
                >
                  ▲
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

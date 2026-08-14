'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { useGameSounds } from "@/app/altfgame/_lib/sounds";

const CW = 820, CH = 520;
const ARCHER = { x: 72, y: 430 };
const TAU = Math.PI * 2;

const BALLOON_COLORS = [
  { fill: "#FF4444", shine: "#FF8A80", pts: 10 },
  { fill: "#FFD700", shine: "#FFF9C4", pts: 10 },
  { fill: "#3B82F6", shine: "#93C5FD", pts: 15 },
  { fill: "#22C55E", shine: "#86EFAC", pts: 15 },
  { fill: "#A855F7", shine: "#D8B4FE", pts: 20 },
  { fill: "#F97316", shine: "#FED7AA", pts: 20 },
  { fill: "#06B6D4", shine: "#A5F3FC", pts: 25 },
];

const LEVELS = [
  { name: "FOREST", emoji: "🌲", gravity: 0.10, spawnRate: 85, balloonSpeed: [0.8, 1.6], balloonSize: [22, 36], bgTop: "#0d2010", bgBot: "#1a3a1a", accent: "#22C55E" },
  { name: "VALLEY", emoji: "🌊", gravity: 0.12, spawnRate: 68, balloonSpeed: [1.0, 2.2], balloonSize: [19, 32], bgTop: "#0a1a2e", bgBot: "#0d2b3e", accent: "#3B82F6" },
  { name: "MOUNTAIN", emoji: "⛰️", gravity: 0.14, spawnRate: 54, balloonSpeed: [1.3, 2.8], balloonSize: [17, 28], bgTop: "#14062a", bgBot: "#1e0a3e", accent: "#A855F7" },
  { name: "STORM", emoji: "⚡", gravity: 0.16, spawnRate: 42, balloonSpeed: [1.7, 3.4], balloonSize: [15, 26], bgTop: "#060608", bgBot: "#0f0f1e", accent: "#F97316" },
  { name: "CHAOS", emoji: "🔥", gravity: 0.19, spawnRate: 30, balloonSpeed: [2.2, 4.5], balloonSize: [13, 24], bgTop: "#1a0000", bgBot: "#2e0000", accent: "#EF4444" },
];

// ── Canvas draw functions ──────────────────────────────────────────────────
function drawScene(ctx, level, time, stars, cloudX) {
  const lv = LEVELS[level];
  const sky = ctx.createLinearGradient(0, 0, 0, CH);
  sky.addColorStop(0, lv.bgTop); sky.addColorStop(0.75, lv.bgBot); sky.addColorStop(1, "#050505");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, CW, CH);

  if (level >= 1) {
    stars.forEach(({ x, y, r, b }) => {
      ctx.globalAlpha = b * Math.min(1, level * 0.45 + 0.15);
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  if (level === 0) {
    ctx.save(); ctx.shadowColor = "#ffe06688"; ctx.shadowBlur = 50;
    ctx.fillStyle = "#FFE568"; ctx.beginPath(); ctx.arc(700, 65, 42, 0, TAU); ctx.fill(); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = "#fff";
    [80, 110, 140].forEach(cy => {
      const cx = ((cloudX * (cy === 80 ? 1 : cy === 110 ? 0.55 : 0.35) + (cy === 80 ? 0 : cy === 110 ? 350 : 180)) % (CW + 250)) - 120;
      [35, 26, 20].forEach((r, i) => { ctx.beginPath(); ctx.arc(cx + i * r * 0.75, cy, r, 0, TAU); ctx.fill(); });
    }); ctx.restore();
  }
  if (level === 1) {
    ctx.save(); ctx.shadowColor = "#8ab4ff66"; ctx.shadowBlur = 35;
    ctx.fillStyle = "#c8dcff"; ctx.beginPath(); ctx.arc(700, 60, 28, 0, TAU); ctx.fill();
    ctx.fillStyle = lv.bgTop; ctx.beginPath(); ctx.arc(713, 54, 24, 0, TAU); ctx.fill(); ctx.restore();
  }
  if (level >= 3 && Math.random() < 0.004) {
    ctx.strokeStyle = `rgba(${level === 4 ? "255,80,80" : "160,160,255"},0.85)`; ctx.lineWidth = 2;
    const lx = 200 + Math.random() * 500;
    ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx + 18, 70); ctx.lineTo(lx - 10, 120); ctx.lineTo(lx + 12, 190); ctx.stroke();
  }

  // Mountains silhouette
  ctx.fillStyle = level === 0 ? "#0a1a08" : level === 1 ? "#060f1a" : "#080412";
  ctx.beginPath();
  [[0, 420], [60, 280], [160, 330], [270, 210], [390, 280], [490, 225], [590, 290], [680, 230], [760, 270], [820, 305], [820, CH], [0, CH]].forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
  ctx.closePath(); ctx.fill();

  // Snow
  ctx.fillStyle = "rgba(210,230,255,0.25)";
  [[60, 280, 26], [270, 210, 40], [490, 225, 34], [680, 230, 28]].forEach(([px, py, sz]) => {
    ctx.beginPath(); ctx.moveTo(px - sz, py + sz * 0.5); ctx.lineTo(px, py - 4); ctx.lineTo(px + sz, py + sz * 0.5); ctx.closePath(); ctx.fill();
  });

  // Ground
  const gnd = ctx.createLinearGradient(0, CH - 95, 0, CH);
  gnd.addColorStop(0, level === 0 ? "#1e4018" : level === 1 ? "#0e2236" : "#0d0620");
  gnd.addColorStop(1, "#020203");
  ctx.fillStyle = gnd; ctx.fillRect(0, CH - 95, CW, 95);

  if (level === 0) {
    ctx.strokeStyle = "#254d1c"; ctx.lineWidth = 2; ctx.lineCap = "round";
    for (let i = 8; i < CW; i += 14) {
      const h = 3 + Math.sin(i * 0.85) * 3;
      ctx.beginPath(); ctx.moveTo(i, CH - 95); ctx.quadraticCurveTo(i + 4, CH - 95 - h, i + 8, CH - 95); ctx.stroke();
    }
    [[680, CH - 95], [728, CH - 95], [762, CH - 95]].forEach(([tx, ty]) => {
      ctx.fillStyle = "#1e0e05"; ctx.fillRect(tx - 5, ty - 38, 10, 38);
      ctx.fillStyle = "#122e0c"; ctx.beginPath(); ctx.arc(tx, ty - 48, 26, 0, TAU); ctx.fill();
      ctx.fillStyle = "#1a4014"; ctx.beginPath(); ctx.arc(tx - 5, ty - 53, 18, 0, TAU); ctx.fill();
    });
  }
}

function drawBalloon(ctx, b, time) {
  const sw = Math.sin(time / 580 + b.phase) * 1.3, bx = b.x + sw, by = b.y;
  ctx.save();
  ctx.strokeStyle = "rgba(200,200,200,0.4)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(bx, by + b.r); ctx.quadraticCurveTo(bx + 4, by + b.r + 14, bx, by + b.r + 26); ctx.stroke();
  const g = ctx.createRadialGradient(bx - b.r * 0.32, by - b.r * 0.28, b.r * 0.04, bx, by, b.r);
  g.addColorStop(0, b.col.shine); g.addColorStop(0.5, b.col.fill); g.addColorStop(1, b.col.fill + "88");
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(bx, by, b.r * 0.72, b.r, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = b.col.fill; ctx.beginPath(); ctx.arc(bx, by + b.r, 4, 0, TAU); ctx.fill();
  ctx.globalAlpha = 0.42; ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.ellipse(bx - b.r * 0.27, by - b.r * 0.3, b.r * 0.17, b.r * 0.24, -0.45, 0, TAU); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.font = `bold ${Math.max(9, b.r * 0.42)}px monospace`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(`+${b.col.pts}`, bx, by);
  ctx.restore();
}

function drawArrow(ctx, a) {
  const ang = Math.atan2(a.vy, a.vx); ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(ang);
  const tr = ctx.createLinearGradient(-48, 0, 0, 0); tr.addColorStop(0, "rgba(255,210,60,0)"); tr.addColorStop(1, "rgba(255,210,60,0.28)");
  ctx.strokeStyle = tr; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-48, 0); ctx.lineTo(0, 0); ctx.stroke();
  ctx.strokeStyle = "#c8a030"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(12, 0); ctx.stroke();
  ctx.fillStyle = "#b0b0b0"; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(17, -3); ctx.lineTo(22, 0); ctx.lineTo(17, 3); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#cc1010";
  ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-30, -7); ctx.lineTo(-16, 0); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-30, 7); ctx.lineTo(-16, 0); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawParticles(ctx, ps) {
  ps.forEach(p => {
    ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.life, 0, TAU); ctx.fill();
  }); ctx.globalAlpha = 1;
}

function drawArcher(ctx, angle, power, charging) {
  const ax = ARCHER.x, ay = ARCHER.y;
  ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = "#000";
  ctx.beginPath(); ctx.ellipse(ax + 5, ay + 2, 25, 7, 0, 0, TAU); ctx.fill(); ctx.restore();

  [[-14, 4], [10, 3]].forEach(([ox, oy]) => {
    ctx.fillStyle = "#080300"; ctx.beginPath(); ctx.ellipse(ax + ox + 4, ay + oy + 3, 12, 6, 0, 0, TAU); ctx.fill();
  });
  ctx.strokeStyle = "#120700"; ctx.lineWidth = 8; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(ax + 2, ay - 4); ctx.lineTo(ax - 12, ay + 4); ctx.moveTo(ax + 2, ay - 4); ctx.lineTo(ax + 14, ay + 3); ctx.stroke();

  ctx.fillStyle = "#14234e"; ctx.beginPath();
  ctx.moveTo(ax - 14, ay - 28); ctx.quadraticCurveTo(ax - 22, ay - 8, ax - 18, ay + 3); ctx.lineTo(ax + 2, ay - 5); ctx.lineTo(ax - 4, ay - 30); ctx.closePath(); ctx.fill();

  const tg = ctx.createLinearGradient(ax - 12, ay - 34, ax + 14, ay - 4);
  tg.addColorStop(0, "#1e3a7e"); tg.addColorStop(1, "#0e2050");
  ctx.fillStyle = tg; ctx.beginPath(); ctx.roundRect(ax - 12, ay - 34, 26, 32, 5); ctx.fill();
  ctx.fillStyle = "#2a1e0a"; ctx.fillRect(ax - 12, ay - 7, 26, 6);
  ctx.fillStyle = "#c8a030"; ctx.beginPath(); ctx.roundRect(ax - 3, ay - 7, 6, 6, 1); ctx.fill();

  ctx.fillStyle = "#3e1e06"; ctx.beginPath(); ctx.roundRect(ax + 12, ay - 30, 9, 26, 3); ctx.fill();
  ctx.strokeStyle = "#c8a030"; ctx.lineWidth = 1.5;
  [ax + 14, ax + 17].forEach(qx => { ctx.beginPath(); ctx.moveTo(qx, ay - 34); ctx.lineTo(qx, ay - 15); ctx.stroke(); });

  const hg = ctx.createRadialGradient(ax - 2, ay - 46, 2, ax, ay - 44, 16);
  hg.addColorStop(0, "#d09060"); hg.addColorStop(1, "#904e28");
  ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(ax, ay - 44, 15, 0, TAU); ctx.fill();
  ctx.fillStyle = "#12121e"; ctx.beginPath(); ctx.ellipse(ax, ay - 53, 15, 9, 0, Math.PI, TAU); ctx.fill();
  ctx.strokeStyle = "#1e2e7e"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(ax, ay - 44, 16, Math.PI * 0.85, Math.PI * 2.15); ctx.stroke();
  ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(ax + 7, ay - 45, 2.5, 0, TAU); ctx.fill();
  ctx.fillStyle = "#3aacff"; ctx.beginPath(); ctx.arc(ax + 7, ay - 45, 1.2, 0, TAU); ctx.fill();

  ctx.strokeStyle = "#904e28"; ctx.lineWidth = 6; ctx.lineCap = "round";
  const bcx = ax + 26, bcy = ay - 18, br = 42, pull = charging ? (power / 100) * 26 : 0;
  ctx.beginPath(); ctx.moveTo(ax + 8, ay - 22); ctx.lineTo(bcx - 5, bcy); ctx.stroke();

  const bowHue = charging ? 120 - power : 38;
  ctx.save(); ctx.translate(bcx, bcy); ctx.rotate(angle);
  ctx.strokeStyle = `hsl(${bowHue},80%,46%)`; ctx.lineWidth = 5; ctx.lineCap = "butt";
  ctx.beginPath(); ctx.arc(0, 0, br, -0.65 * Math.PI, 0.65 * Math.PI); ctx.stroke();

  const tx = br * Math.cos(-0.65 * Math.PI), ty2 = br * Math.sin(-0.65 * Math.PI);
  const bx2 = br * Math.cos(0.65 * Math.PI), by2 = br * Math.sin(0.65 * Math.PI);
  ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 1.5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(tx, ty2); ctx.lineTo(-pull, 0); ctx.lineTo(bx2, by2); ctx.stroke();

  if (charging && power > 3) {
    ctx.strokeStyle = "#c8a030"; ctx.lineWidth = 3; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-pull, 0); ctx.lineTo(br + 14, 0); ctx.stroke();
    ctx.fillStyle = "#aaa"; ctx.beginPath(); ctx.moveTo(br + 14, 0); ctx.lineTo(br + 18, -3); ctx.lineTo(br + 24, 0); ctx.lineTo(br + 18, 3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#cc1010";
    ctx.beginPath(); ctx.moveTo(-pull + 2, 0); ctx.lineTo(-pull - 8, -7); ctx.lineTo(-pull - 2, 0); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-pull + 2, 0); ctx.lineTo(-pull - 8, 7); ctx.lineTo(-pull - 2, 0); ctx.closePath(); ctx.fill();
  }
  if (charging && power > 8) {
    ctx.globalAlpha = power / 100 * 0.5; ctx.strokeStyle = `hsl(${bowHue},90%,60%)`; ctx.lineWidth = 3;
    ctx.shadowColor = `hsl(${bowHue},90%,60%)`; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(0, 0, br + 10, 0, TAU); ctx.stroke();
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  }
  ctx.restore();
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function BalloonArchery() {
  const canvasRef = useRef(null);
  const gs = useRef({
    mouse: { x: 400, y: 300 }, isCharging: false, power: 0, angle: 0,
    arrows: [], balloons: [], particles: [], popups: [],
    spawnTimer: 0, cloudX: 0, score: 0, popped: 0, lives: 5,
    level: 0, combo: 0, comboTimer: 0, gameOver: false,
  });

  const [ui, setUi] = useState({
    score: 0, popped: 0, lives: 5, level: 0, combo: 0,
    gameOver: false, power: 0, charging: false, highScore: 0,
  });
  const [prevLevel, setPrevLevel] = useState(0);
  useGameSounds({ lost: ui.gameOver, score: ui.popped, level: ui.level, sounds: { point: 'pop' } });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const highScoreRef = useRef(0);

  const stars = useRef(Array.from({ length: 130 }, () => ({
    x: Math.random() * CW, y: Math.random() * CH * 0.58, r: Math.random() * 1.4 + 0.2, b: Math.random() * 0.8 + 0.2,
  })));

  const rafRef = useRef(null);
  const tsRef = useRef(0);

  useEffect(() => {
    const loop = (ts) => {
      const dt = ts - tsRef.current; tsRef.current = ts;
      const g = gs.current;
      const lv = LEVELS[g.level];

      g.cloudX += 0.35;
      if (g.isCharging && !g.gameOver) g.power = Math.min(g.power + 2, 100);
      if (g.comboTimer > 0) { g.comboTimer -= dt; if (g.comboTimer <= 0) g.combo = 0; }

      g.spawnTimer++;
      if (g.spawnTimer >= lv.spawnRate) {
        g.spawnTimer = 0;
        const col = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
        const [sMin, sMax] = lv.balloonSpeed, [rMin, rMax] = lv.balloonSize;
        g.balloons.push({ x: 220 + Math.random() * (CW - 290), y: CH + 50, r: rMin + Math.random() * (rMax - rMin), col, speed: sMin + Math.random() * (sMax - sMin), phase: Math.random() * TAU });
      }

      g.balloons = g.balloons.filter(b => {
        b.y -= b.speed;
        if (b.y < -55) { g.lives = Math.max(0, g.lives - 1); if (g.lives <= 0) { g.gameOver = true; highScoreRef.current = Math.max(highScoreRef.current, g.score); } return false; }
        return true;
      });

      const alive = [];
      for (const a of g.arrows) {
        a.x += a.vx; a.y += a.vy; a.vy += lv.gravity; a.vx *= 0.999;
        let hit = false; const sb = [];
        for (const b of g.balloons) {
          if (!hit && Math.hypot(a.x - b.x, a.y - b.y) < b.r * 0.82) {
            hit = true;
            const pts = b.col.pts * (1 + Math.floor(g.combo / 2));
            g.score += pts; g.popped++; g.combo++; g.comboTimer = 2200;
            for (let i = 0; i < 22; i++) { const ang = Math.random() * TAU, spd = 2 + Math.random() * 6; g.particles.push({ x: b.x, y: b.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: 3 + Math.random() * 4, life: 1, color: b.col.fill }); }
            g.popups.push({ x: b.x, y: b.y, text: `+${pts}`, life: 1, color: b.col.fill });
          } else sb.push(b);
        }
        g.balloons = sb;
        if (!hit && a.x < CW + 60 && a.x > -60 && a.y < CH + 60) alive.push(a);
      }
      g.arrows = alive;

      const newLevel = Math.min(LEVELS.length - 1, Math.floor(g.score / 300));
      if (newLevel > g.level) { g.level = newLevel; }

      g.particles = g.particles.map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.18, vx: p.vx * 0.91, life: p.life * 0.87 })).filter(p => p.life > 0.02);
      g.popups = g.popups.map(p => ({ ...p, y: p.y - 1.6, life: p.life - 0.022 })).filter(p => p.life > 0);

      g.angle = Math.atan2(g.mouse.y - (ARCHER.y - 18), g.mouse.x - (ARCHER.x + 26));

      // Render
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        drawScene(ctx, g.level, ts, stars.current, g.cloudX);
        g.balloons.forEach(b => drawBalloon(ctx, b, ts));

        if (g.isCharging && !g.gameOver) {
          const v = (g.power / 100) * 18 + 5, vx = Math.cos(g.angle) * v, vy = Math.sin(g.angle) * v;
          let tx = ARCHER.x + 26 + Math.cos(g.angle) * 52, ty = ARCHER.y - 18 + Math.sin(g.angle) * 52, tvx = vx, tvy = vy;
          for (let j = 0; j < 22; j++) {
            ctx.globalAlpha = (1 - j / 22) * 0.55; ctx.fillStyle = "#fff";
            ctx.beginPath(); ctx.arc(tx, ty, 2.5, 0, TAU); ctx.fill();
            tx += tvx; ty += tvy; tvy += lv.gravity;
          }
          ctx.globalAlpha = 1;
        }

        g.arrows.forEach(a => drawArrow(ctx, a));
        drawArcher(ctx, g.angle, g.power, g.isCharging);
        drawParticles(ctx, g.particles);

        g.popups.forEach(p => {
          ctx.save(); ctx.globalAlpha = p.life;
          ctx.font = `bold 22px 'Segoe UI',sans-serif`;
          ctx.fillStyle = p.color; ctx.strokeStyle = "rgba(0,0,0,0.8)"; ctx.lineWidth = 3;
          ctx.textAlign = "center"; ctx.strokeText(p.text, p.x, p.y); ctx.fillText(p.text, p.x, p.y); ctx.restore();
        });

        if (g.combo >= 2) {
          ctx.save(); ctx.globalAlpha = 0.92;
          ctx.font = `bold ${17 + Math.min(g.combo, 6)}px 'Segoe UI',sans-serif`;
          ctx.fillStyle = "#FF6D00"; ctx.strokeStyle = "rgba(0,0,0,0.9)"; ctx.lineWidth = 3; ctx.textAlign = "left";
          ctx.strokeText(`🔥 ×${g.combo} COMBO`, ARCHER.x + 55, ARCHER.y - 55);
          ctx.fillText(`🔥 ×${g.combo} COMBO`, ARCHER.x + 55, ARCHER.y - 55); ctx.restore();
        }
      }

      setUi(u => ({ ...u, score: g.score, popped: g.popped, lives: g.lives, level: g.level, combo: g.combo, gameOver: g.gameOver, power: Math.round(g.power), charging: g.isCharging, highScore: highScoreRef.current }));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Level up notification
  useEffect(() => {
    if (ui.level > prevLevel) {
      setPrevLevel(ui.level);
      setShowLevelUp(true);
      const t = setTimeout(() => setShowLevelUp(false), 2200);
      return () => clearTimeout(t);
    }
  }, [ui.level, prevLevel]);

  // Helper function to get canvas coordinates from touch/mouse event
  const getCanvasCoordinates = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches?.[0]?.clientX ?? 0);
    const clientY = e.clientY ?? (e.touches?.[0]?.clientY ?? 0);

    // Scale coordinates to canvas dimensions
    const scaleX = CW / rect.width;
    const scaleY = CH / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }, []);

  const handleMouseMove = useCallback((e) => {
    e.preventDefault?.();
    const coords = getCanvasCoordinates(e);
    gs.current.mouse = coords;
  }, [getCanvasCoordinates]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    const coords = getCanvasCoordinates(e);
    gs.current.mouse = coords;
  }, [getCanvasCoordinates]);

  const handleStartCharging = useCallback((e) => {
    e.preventDefault();
    if (!gs.current.gameOver) {
      gs.current.isCharging = true;
      // Update mouse position on touch start as well
      if (e.touches) {
        const coords = getCanvasCoordinates(e);
        gs.current.mouse = coords;
      }
    }
  }, [getCanvasCoordinates]);

  const handleStopCharging = useCallback((e) => {
    e.preventDefault();
    const g = gs.current;
    if (!g.isCharging) return;

    g.isCharging = false;

    if (g.power < 2 || g.gameOver) {
      g.power = 0;
      return;
    }

    const v = (g.power / 100) * 18 + 5;
    g.arrows.push({
      x: ARCHER.x + 26 + Math.cos(g.angle) * 52,
      y: ARCHER.y - 18 + Math.sin(g.angle) * 52,
      vx: Math.cos(g.angle) * v,
      vy: Math.sin(g.angle) * v
    });
    g.power = 0;
  }, []);

  const handleReset = useCallback(() => {
    const g = gs.current;
    Object.assign(g, {
      isCharging: false,
      power: 0,
      arrows: [],
      balloons: [],
      particles: [],
      popups: [],
      spawnTimer: 0,
      score: 0,
      popped: 0,
      lives: 5,
      level: 0,
      combo: 0,
      comboTimer: 0,
      gameOver: false,
      cloudX: 0
    });
    setPrevLevel(0);
    setUi(u => ({
      ...u,
      score: 0,
      popped: 0,
      lives: 5,
      level: 0,
      combo: 0,
      gameOver: false,
      power: 0,
      charging: false
    }));
  }, []);

  // Keyboard controls
  useEffect(() => {
    const kd = (e) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        if (!gs.current.gameOver) gs.current.isCharging = true;
      }
    };
    const ku = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleStopCharging(e);
      }
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, [handleStopCharging]);

  const lv = LEVELS[ui.level];
  const pColor = ui.power < 40 ? "#22c55e" : ui.power < 75 ? "#f59e0b" : "#ef4444";
  const pGlow = ui.power < 40 ? "#22c55e44" : ui.power < 75 ? "#f59e0b44" : "#ef444444";
  const levelPct = Math.min(100, (ui.score % 300) / 3);

  return (
    <div style={{
      minHeight: "100%",
      background: "linear-gradient(160deg, #04060e 0%, #080c18 40%, #060410 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI','system-ui',sans-serif",
      padding: "12px 10px", userSelect: "none",
      position: "relative", overflow: "hidden",
    }}>

      {/* CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;600;700&display=swap');
        :root {
          --accent: ${lv.accent};
          --accent-dim: ${lv.accent}44;
          --accent-glow: ${lv.accent}22;
        }
        * { box-sizing: border-box; }

        /* Animated noise overlay */
        .noise::before {
          content:''; position:absolute; inset:0; pointer-events:none; z-index:0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          opacity:0.4;
        }

        @keyframes shimmer { 0%,100%{background-position:0% 50%}50%{background-position:100% 50%} }
        @keyframes pulseRing { 0%,100%{box-shadow:0 0 0 0 var(--accent-dim)} 50%{box-shadow:0 0 0 6px transparent} }
        @keyframes heartbeat { 0%,100%{transform:scale(1)}30%{transform:scale(1.18)}60%{transform:scale(1)} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:none} }
        @keyframes levelPop { 0%{opacity:0;transform:translate(-50%,-50%) scale(0.3)} 45%{opacity:1;transform:translate(-50%,-50%) scale(1.12)} 75%{transform:translate(-50%,-50%) scale(0.97)} 100%{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        @keyframes scanline { 0%{transform:translateY(-100%)}100%{transform:translateY(100%)} }
        @keyframes borderGlow { 0%,100%{border-color:var(--accent-dim)}50%{border-color:var(--accent)} }
        @keyframes powerPulse { 0%,100%{opacity:1}50%{opacity:0.65} }
        @keyframes floatBg { 0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)} }

        .game-title {
          font-family:'Orbitron',monospace; font-weight:900;
          font-size:clamp(1.5rem,3.5vw,2.4rem); letter-spacing:0.22em;
          background:linear-gradient(90deg,#6a3800,#FFD700,#fff8dc,var(--accent),#FFD700,#6a3800);
          background-size:300% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          animation:shimmer 4s ease infinite; margin:0;
        }
        .subtitle {
          font-family:'Exo 2',sans-serif; font-weight:300;
          color:rgba(255,215,0,0.32); font-size:0.62rem;
          letter-spacing:0.45em; margin:3px 0 0; text-transform:uppercase;
        }

        /* HUD Panel */
        .hud-panel {
          background:linear-gradient(145deg,rgba(255,255,255,0.055),rgba(255,255,255,0.015));
          border:1px solid rgba(255,255,255,0.08);
          border-radius:16px; backdrop-filter:blur(18px);
          position:relative; overflow:hidden;
          transition:border-color 0.4s;
        }
        .hud-panel::after {
          content:''; position:absolute; inset:0; border-radius:16px;
          background:linear-gradient(135deg,rgba(255,255,255,0.04) 0%,transparent 60%);
          pointer-events:none;
        }

        /* Stat card */
        .stat-card {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding:10px 18px; min-width:82px;
          background:linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015));
          border:1px solid rgba(255,255,255,0.07); border-radius:14px;
          backdrop-filter:blur(16px); position:relative; overflow:hidden;
          transition:all 0.3s;
        }
        .stat-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);
        }
        .stat-label {
          font-family:'Exo 2',sans-serif; font-weight:600;
          color:rgba(255,255,255,0.28); font-size:0.53rem;
          letter-spacing:0.25em; text-transform:uppercase; margin-bottom:3px;
        }
        .stat-value {
          font-family:'Orbitron',monospace; font-weight:700;
          line-height:1.1;
        }

        /* Lives hearts */
        .heart-alive { animation:heartbeat 1.6s ease infinite; display:inline-block; }
        .heart-dead { opacity:0.15; display:inline-block; filter:grayscale(1); }

        /* Level badge */
        .level-badge {
          display:inline-flex; align-items:center; gap:6px;
          padding:4px 12px; border-radius:20px;
          background:var(--accent-dim); border:1px solid var(--accent);
          animation:borderGlow 2s ease infinite;
          font-family:'Orbitron',monospace; font-weight:700;
          font-size:0.72rem; letter-spacing:0.1em;
          color:var(--accent); text-shadow:0 0 12px var(--accent);
          box-shadow:0 0 16px var(--accent-glow), inset 0 0 8px var(--accent-glow);
        }

        /* Power bar */
        .power-track {
          flex:1; height:18px; border-radius:999px; overflow:hidden;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.09);
          position:relative;
        }
        .power-fill {
          height:100%; border-radius:999px; transition:background 0.25s;
          position:relative; overflow:hidden;
        }
        .power-fill::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(180deg,rgba(255,255,255,0.22) 0%,transparent 100%);
        }
        .power-tick { position:absolute; top:3px; bottom:3px; width:1px; background:rgba(255,255,255,0.15); }

        /* Level progress */
        .level-track {
          height:6px; border-radius:999px; overflow:hidden;
          background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.07);
          position:relative;
        }
        .level-fill {
          height:100%; border-radius:999px; transition:width 0.35s ease;
          background:linear-gradient(90deg,#1a5aff,var(--accent));
          box-shadow:0 0 12px var(--accent-dim);
          position:relative; overflow:hidden;
        }
        .level-fill::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(180deg,rgba(255,255,255,0.25) 0%,transparent 100%);
        }

        /* Canvas border glow */
        .canvas-wrap {
          position:relative; border-radius:20px; overflow:hidden;
          border:2px solid; border-color:var(--accent-dim);
          animation:borderGlow 3s ease infinite;
          box-shadow:0 0 60px var(--accent-glow), 0 0 120px rgba(0,0,0,0.7), inset 0 0 30px rgba(0,0,0,0.4);
          transition:box-shadow 0.5s;
          touch-action: none; /* Prevents page scrolling when touching canvas */
        }
        /* Scanline on canvas */
        .canvas-wrap::after {
          content:''; position:absolute; inset:0; pointer-events:none; z-index:5;
          background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px);
        }

        /* Play button */
        .play-btn {
          font-family:'Orbitron',monospace; font-weight:700;
          font-size:1rem; letter-spacing:0.18em; cursor:pointer;
          border:none; border-radius:50px; padding:15px 44px; color:#060404;
          background:linear-gradient(135deg,#8a5000,#FFD700,#FF8800,#8a5000);
          background-size:260% 260%; animation:shimmer 2.2s ease infinite;
          box-shadow:0 0 40px rgba(255,165,0,0.55), 0 4px 20px rgba(0,0,0,0.4);
          transition:transform 0.1s, box-shadow 0.1s;
          -webkit-tap-highlight-color: transparent;
        }
        .play-btn:hover { transform:scale(1.06); box-shadow:0 0 60px rgba(255,200,0,0.7); }
        .play-btn:active { transform:scale(0.96); }

        /* Level up toast */
        .levelup-toast {
          position:absolute; top:50%; left:50%; z-index:30; text-align:center; pointer-events:none;
          animation:levelPop 2.2s cubic-bezier(.34,1.56,.64,1) forwards;
        }

        /* Gameover overlay on canvas */
        .gameover-overlay {
          position:absolute; inset:0; z-index:20;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          background:rgba(0,0,0,0.8); backdrop-filter:blur(10px);
          animation:fadeSlideIn 0.5s ease;
        }

        /* Corner decorators */
        .corner { position:absolute; width:18px; height:18px; border-color:var(--accent); opacity:0.5; }
        .corner-tl { top:8px; left:8px; border-top:2px solid; border-left:2px solid; border-radius:3px 0 0 0; }
        .corner-tr { top:8px; right:8px; border-top:2px solid; border-right:2px solid; border-radius:0 3px 0 0; }
        .corner-bl { bottom:8px; left:8px; border-bottom:2px solid; border-left:2px solid; border-radius:0 0 0 3px; }
        .corner-br { bottom:8px; right:8px; border-bottom:2px solid; border-right:2px solid; border-radius:0 0 3px 0; }

        /* Mobile optimizations */
        @media (max-width: 600px) {
          .stat-card {
            padding: 6px 10px;
            min-width: 60px;
          }
          .stat-value {
            font-size: 0.9rem;
          }
          .level-badge {
            font-size: 0.6rem;
            padding: 2px 8px;
          }
        }
      `}</style>

      {/* ── Title ─────────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: 14, position: "relative", zIndex: 1 }}>
        <h2 className="game-title">🎈 BALLOON ARCHERY</h2>
        <p className="subtitle">Aim · Charge · Release — Don't let them escape</p>
      </div>

      {/* ── Top HUD ───────────────────────────── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", justifyContent: "center", position: "relative", zIndex: 1 }}>

        {/* Score */}
        <div className="stat-card" style={{ minWidth: 110, borderColor: ui.score > 0 ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.07)" }}>
          <div className="stat-label">Score</div>
          <div className="stat-value" style={{ fontSize: "2rem", color: "#FFD700", textShadow: "0 0 20px #FFD70066" }}>{ui.score}</div>
        </div>

        {/* Lives */}
        <div className="stat-card" style={{ minWidth: 130 }}>
          <div className="stat-label">Lives</div>
          <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < ui.lives ? "heart-alive" : "heart-dead"}
                style={{ fontSize: "1.3rem", animationDelay: `${i * 0.18}s` }}>❤️</span>
            ))}
          </div>
        </div>

        {/* Popped */}
        <div className="stat-card">
          <div className="stat-label">Popped</div>
          <div className="stat-value" style={{ fontSize: "1.4rem", color: "#22c55e", textShadow: "0 0 14px #22c55e55" }}>
            🎈 {ui.popped}
          </div>
        </div>

        {/* Level badge */}
        <div className="stat-card" style={{ justifyContent: "space-between", gap: 6 }}>
          <div className="stat-label">Level</div>
          <div className="level-badge">{lv.emoji} {lv.name}</div>
        </div>

        {/* High score */}
        <div className="stat-card">
          <div className="stat-label">Best</div>
          <div className="stat-value" style={{ fontSize: "1.15rem", color: "rgba(255,215,0,0.55)" }}>
            {ui.highScore || "—"}
          </div>
        </div>

        {/* Combo (shown when active) */}
        {ui.combo >= 2 && (
          <div className="stat-card" style={{
            border: "1px solid rgba(249,115,22,0.5)", minWidth: 92,
            background: "linear-gradient(145deg,rgba(249,115,22,0.1),rgba(249,115,22,0.03))",
            boxShadow: "0 0 20px rgba(249,115,22,0.2)", animation: "fadeSlideIn 0.3s ease",
          }}>
            <div className="stat-label" style={{ color: "rgba(249,115,22,0.7)" }}>Combo</div>
            <div className="stat-value" style={{ fontSize: "1.4rem", color: "#F97316", textShadow: "0 0 18px #F9731688" }}>
              🔥 ×{ui.combo}
            </div>
          </div>
        )}
      </div>

      {/* ── Canvas ────────────────────────────── */}
      <div className="canvas-wrap" style={{ cursor: ui.gameOver ? "default" : "crosshair", maxWidth: "100%", zIndex: 1 }}>
        {/* Corner decorators */}
        <div className="corner corner-tl" /><div className="corner corner-tr" />
        <div className="corner corner-bl" /><div className="corner corner-br" />

        <canvas ref={canvasRef} width={CW} height={CH}
          role="application"
          aria-label="Air Shot game canvas. Aim with the mouse, then click or hold to shoot. Pop as many targets as possible before you run out of shots."
          // Mouse events
          onMouseMove={handleMouseMove}
          onMouseDown={handleStartCharging}
          onMouseUp={handleStopCharging}
          onMouseLeave={handleStopCharging}
          // Touch events
          onTouchMove={handleTouchMove}
          onTouchStart={handleStartCharging}
          onTouchEnd={handleStopCharging}
          onTouchCancel={handleStopCharging}
          style={{ display: "block", maxWidth: "100%", height: "auto", touchAction: "none" }}
        />

        {/* Level-up toast */}
        {showLevelUp && (
          <div className="levelup-toast">
            <div style={{ fontSize: "3.5rem", marginBottom: 4 }}>{lv.emoji}</div>
            <div style={{
              fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: "2.2rem",
              color: lv.accent, textShadow: `0 0 40px ${lv.accent}`, letterSpacing: "0.12em",
            }}>LEVEL UP!</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", letterSpacing: "0.2em", marginTop: 4, fontFamily: "'Exo 2',sans-serif" }}>
              {lv.name}
            </div>
          </div>
        )}

        {/* Game over overlay */}
        {ui.gameOver && (
          <div className="gameover-overlay">
            {/* Corner decorators inside overlay */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, border: "2px solid rgba(255,215,0,0.15)", borderRadius: 18, pointerEvents: "none" }} />

            <div style={{ fontFamily: "'Exo 2',sans-serif", color: "rgba(255,215,0,0.4)", fontSize: "0.7rem", letterSpacing: "0.5em", marginBottom: 8 }}>
              SESSION COMPLETE
            </div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: "clamp(2.5rem,7vw,5rem)", color: "#FFD700", textShadow: "0 0 60px #FFD70066", lineHeight: 1 }}>
              {ui.score}
            </div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.68rem", letterSpacing: "0.25em", fontFamily: "'Exo 2',sans-serif", marginBottom: 20, marginTop: 4 }}>
              FINAL SCORE
            </div>

            {/* Stats grid */}
            <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap", justifyContent: "center" }}>
              {[
                { label: "POPPED", val: `🎈 ${ui.popped}` },
                { label: "LEVEL", val: `${lv.emoji} ${lv.name}` },
                { label: "BEST", val: ui.highScore },
              ].map(({ label, val }) => (
                <div key={label} style={{ textAlign: "center", padding: "8px 16px", background: "rgba(255,255,255,0.05)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.55rem", letterSpacing: "0.2em", fontFamily: "'Exo 2',sans-serif" }}>{label}</div>
                  <div style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 700, fontFamily: "'Orbitron',monospace", marginTop: 2 }}>{val}</div>
                </div>
              ))}
            </div>

            <button className="play-btn" onClick={(e) => { e.stopPropagation(); handleReset(); }}>↺ PLAY AGAIN</button>
            <div style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.6rem", letterSpacing: "0.15em", marginTop: 16, fontFamily: "'Exo 2',sans-serif" }}>
              {ui.score >= 500 ? "LEGENDARY ARCHER 🏆" : ui.score >= 300 ? "MASTER MARKSMAN 🥇" : ui.score >= 150 ? "SKILLED HUNTER 🎯" : "KEEP PRACTICING 🏹"}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Controls HUD ───────────────── */}
      <div style={{ width: "100%", maxWidth: CW, marginTop: 12, display: "flex", flexDirection: "column", gap: 8, zIndex: 1 }}>

        {/* Power bar row */}
        <div className="hud-panel" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 52 }}>
              <span style={{ fontFamily: "'Exo 2',sans-serif", color: "rgba(255,255,255,0.3)", fontSize: "0.52rem", letterSpacing: "0.22em" }}>POWER</span>
              <span style={{ fontFamily: "'Orbitron',monospace", color: pColor, fontSize: "0.92rem", fontWeight: 700, textShadow: `0 0 12px ${pColor}88`, lineHeight: 1.2 }}>
                {ui.power}<span style={{ fontSize: "0.55rem", opacity: 0.6 }}>%</span>
              </span>
            </div>

            <div className="power-track">
              <div className="power-fill" style={{
                width: `${ui.power}%`,
                background: `linear-gradient(90deg,#14532d,${pColor})`,
                boxShadow: ui.power > 0 ? `0 0 18px ${pGlow}` : "none",
                animation: ui.power >= 97 ? "powerPulse 0.25s ease infinite" : "none",
              }} />
              {[25, 50, 75].map(t => <div key={t} className="power-tick" style={{ left: `${t}%` }} />)}
            </div>

            {/* Charge indicator dot */}
            <div style={{
              width: 12, height: 12, borderRadius: "50%", flexShrink: 0,
              background: ui.charging ? pColor : "rgba(255,255,255,0.1)",
              boxShadow: ui.charging ? `0 0 12px ${pColor}` : "none",
              transition: "all 0.15s",
            }} />
          </div>

          {/* Status text - mobile friendly */}
          <div style={{
            fontFamily: "'Exo 2',sans-serif",
            color: ui.gameOver ? "rgba(255,255,255,0.2)" : ui.charging ? "#22c55e" : "rgba(255,255,255,0.18)",
            fontSize: "clamp(0.5rem, 2vw, 0.6rem)",
            textAlign: "center",
            marginTop: 8,
            letterSpacing: "0.2em",
            textShadow: ui.charging ? "0 0 14px #22c55e44" : "none",
            transition: "color 0.2s",
            lineHeight: 1.4,
            padding: "0 8px"
          }}>
            {ui.gameOver
              ? "▸ GAME COMPLETE — TAP PLAY AGAIN"
              : ui.charging
                ? "⚡  DRAWING BOW — RELEASE TO FIRE  ⚡"
                : "TOUCH AND HOLD TO AIM · RELEASE TO SHOOT"}
          </div>
        </div>

        {/* Level progress row */}
        <div className="hud-panel" style={{ padding: "10px 16px" }}>
          {/* Level names - scrollable on mobile */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
            overflowX: "auto",
            paddingBottom: 4,
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            gap: 8
          }}>
            {LEVELS.map((l, i) => (
              <div key={l.name} style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                minWidth: "fit-content"
              }}>
                <span style={{ fontSize: "clamp(0.7rem, 3vw, 0.85rem)" }}>{l.emoji}</span>
                <span style={{
                  fontFamily: "'Exo 2',sans-serif",
                  fontSize: "clamp(0.45rem, 2vw, 0.5rem)",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: i === ui.level ? l.accent : i < ui.level ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.18)",
                  textShadow: i === ui.level ? `0 0 10px ${l.accent}` : "none",
                  transition: "all 0.4s",
                  whiteSpace: "nowrap"
                }}>{l.name}</span>
                {i === ui.level && <div style={{ width: 4, height: 4, borderRadius: "50%", background: l.accent, boxShadow: `0 0 6px ${l.accent}` }} />}
              </div>
            ))}
          </div>

          <div className="level-track">
            <div className="level-fill" style={{ width: `${levelPct}%` }} />
            {/* Segment dividers */}
            {[20, 40, 60, 80].map(t => (
              <div key={t} style={{ position: "absolute", top: 0, bottom: 0, left: `${t}%`, width: 1, background: "rgba(255,255,255,0.12)" }} />
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, flexWrap: "wrap", gap: 4 }}>
            <span style={{ fontFamily: "'Exo 2',sans-serif", color: "rgba(255,255,255,0.18)", fontSize: "clamp(0.45rem, 2vw, 0.52rem)", letterSpacing: "0.12em" }}>
              {ui.level < LEVELS.length - 1 ? `${ui.score % 300} / 300 XP TO NEXT` : "MAX LEVEL REACHED"}
            </span>
            <span style={{ fontFamily: "'Exo 2',sans-serif", color: "rgba(255,215,0,0.3)", fontSize: "clamp(0.45rem, 2vw, 0.52rem)", letterSpacing: "0.1em" }}>
              TOTAL: {ui.score} PTS
            </span>
          </div>
        </div>
      </div>

      {/* Mobile tip */}
      <div style={{
        fontFamily: "'Exo 2',sans-serif",
        color: "rgba(255,255,255,0.1)",
        fontSize: "clamp(0.5rem, 2vw, 0.56rem)",
        letterSpacing: "0.12em",
        marginTop: 10,
        zIndex: 1,
        textAlign: "center",
        padding: "0 16px"
      }}>
        💡 Touch and hold anywhere on canvas to aim · Release to shoot · Combo chain = bonus multiplier
      </div>
    </div>
  )
}

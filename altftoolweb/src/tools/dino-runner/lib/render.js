// Canvas renderer. All art is original, simple geometry (rounded rects,
// circles). The play area paints its own sky/ground, so it stays legible in
// both light and dark page themes. Colors here are fixed game art, permitted
// inside the play area only.

import { PLAYER, WORLD, playerBox } from "./engine";

const DAY = {
  skyTop: "#87d7f4",
  skyBottom: "#e9f8ff",
  ground: "#e7c883",
  groundEdge: "#bd9550",
  block: "#0f766e",
  blockCore: "#134e4a",
  flyer: "#7c3aed",
  flyerWing: "#c4b5fd",
  player: "#f59e0b",
  playerDark: "#92400e",
  eye: "#ffffff",
  pupil: "#1f2937",
  cloud: "#ffffff",
};

const NIGHT = {
  skyTop: "#0b1226",
  skyBottom: "#273764",
  ground: "#2d3b60",
  groundEdge: "#54678f",
  block: "#5eead4",
  blockCore: "#0f766e",
  flyer: "#c4b5fd",
  flyerWing: "#ede9fe",
  player: "#fbbf24",
  playerDark: "#b45309",
  eye: "#ffffff",
  pupil: "#111827",
  cloud: "#42527e",
};

const STARS = [
  [40, 40, 1.6],
  [120, 84, 1.2],
  [210, 30, 1.8],
  [300, 70, 1.2],
  [370, 42, 1.5],
  [450, 96, 1.2],
  [520, 26, 1.7],
  [590, 66, 1.3],
  [700, 92, 1.2],
  [90, 140, 1.1],
  [260, 120, 1.3],
  [480, 140, 1.1],
  [700, 150, 1.3],
];

const CLOUDS = [
  { x: 90, y: 62, s: 1 },
  { x: 340, y: 104, s: 0.8 },
  { x: 590, y: 46, s: 1.15 },
];

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mixHex(a, b, t) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const r = Math.round(ca[0] + (cb[0] - ca[0]) * t);
  const g = Math.round(ca[1] + (cb[1] - ca[1]) * t);
  const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
  return `rgb(${r} ${g} ${bl})`;
}

function buildPalette(mix) {
  if (mix <= 0) return DAY;
  if (mix >= 1) return NIGHT;
  const out = {};
  for (const key of Object.keys(DAY)) out[key] = mixHex(DAY[key], NIGHT[key], mix);
  return out;
}

function pathRoundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, radius);
    return;
  }
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawCloud(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  pathRoundRect(ctx, x, y, 74 * s, 18 * s, 9 * s);
  ctx.fill();
  pathRoundRect(ctx, x + 14 * s, y - 10 * s, 40 * s, 16 * s, 8 * s);
  ctx.fill();
}

function drawSky(ctx, run, P, mix, reducedMotion) {
  const sky = ctx.createLinearGradient(0, 0, 0, WORLD.height);
  sky.addColorStop(0, P.skyTop);
  sky.addColorStop(1, P.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  if (mix < 0.98) {
    ctx.globalAlpha = 1 - mix;
    ctx.fillStyle = "#fcd34d";
    ctx.beginPath();
    ctx.arc(636, 64, 26, 0, Math.PI * 2);
    ctx.fill();
  }
  if (mix > 0.02) {
    ctx.globalAlpha = mix;
    ctx.fillStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.arc(636, 64, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = P.skyTop;
    ctx.beginPath();
    ctx.arc(645, 58, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f8fafc";
    for (const [sx, sy, sr] of STARS) {
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // Parallax clouds; frozen under prefers-reduced-motion.
  const span = WORLD.width + 180;
  const shift = reducedMotion ? 0 : run.distance * 0.25;
  for (const cloud of CLOUDS) {
    const cx = ((((cloud.x - shift) % span) + span) % span) - 90;
    drawCloud(ctx, cx, cloud.y, cloud.s, P.cloud);
  }
}

function drawGround(ctx, run, P) {
  ctx.fillStyle = P.ground;
  ctx.fillRect(0, WORLD.groundY, WORLD.width, WORLD.height - WORLD.groundY);
  ctx.fillStyle = P.groundEdge;
  ctx.fillRect(0, WORLD.groundY, WORLD.width, 3);
  const dashShift = run.distance % 44;
  ctx.globalAlpha = 0.75;
  for (let x = -dashShift; x < WORLD.width; x += 44) {
    ctx.fillRect(x, WORLD.groundY + 16, 18, 3);
  }
  ctx.globalAlpha = 1;
}

function drawObstacles(ctx, run, P, reducedMotion) {
  for (const ob of run.obstacles) {
    if (ob.kind === "block") {
      for (let i = 0; i < ob.pillars; i += 1) {
        const px = ob.x + i * (ob.pillarWidth + ob.pillarGap);
        const drop = i % 2 === 1 ? 8 : 0;
        ctx.fillStyle = P.block;
        pathRoundRect(ctx, px, ob.y + drop, ob.pillarWidth, ob.height - drop, 7);
        ctx.fill();
        ctx.fillStyle = P.blockCore;
        pathRoundRect(ctx, px + 7, ob.y + drop + 8, 6, ob.height - drop - 16, 3);
        ctx.fill();
      }
    } else {
      const wingLift = reducedMotion ? 0 : Math.sin(ob.flap) * 6;
      ctx.fillStyle = P.flyerWing;
      pathRoundRect(ctx, ob.x + 10, ob.y - 7 + wingLift, ob.width - 20, 8, 4);
      ctx.fill();
      ctx.fillStyle = P.flyer;
      pathRoundRect(ctx, ob.x, ob.y, ob.width, ob.height, 12);
      ctx.fill();
      ctx.fillStyle = P.eye;
      ctx.beginPath();
      ctx.arc(ob.x + 10, ob.y + ob.height / 2 - 2, 3.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawPlayer(ctx, run, P, reducedMotion, dead) {
  const p = run.player;
  const box = playerBox(p);
  const { x, y, width: w, height: h } = box;
  const duck = p.ducking && p.onGround;

  ctx.fillStyle = P.player;
  // tail nub
  pathRoundRect(ctx, x - 9, y + (duck ? h * 0.25 : 12), 12, 9, 4);
  ctx.fill();
  // body capsule
  pathRoundRect(ctx, x, y, w, h, duck ? 14 : 12);
  ctx.fill();
  // ear
  pathRoundRect(ctx, x + w - 20, y - 8, 7, 12, 3);
  ctx.fill();

  // feet (simple two-frame stride, static under reduced motion / when airborne)
  ctx.fillStyle = P.playerDark;
  if (duck) {
    pathRoundRect(ctx, x + 10, y + h - 7, 12, 7, 3);
    ctx.fill();
    pathRoundRect(ctx, x + w - 24, y + h - 7, 12, 7, 3);
    ctx.fill();
  } else {
    const stride =
      !reducedMotion && !dead && p.onGround ? Math.floor(run.distance / 26) % 2 : 0;
    const leftUp = stride === 1;
    pathRoundRect(ctx, x + 7, y + h - (leftUp ? 6 : 9), 12, leftUp ? 6 : 9, 3);
    ctx.fill();
    pathRoundRect(ctx, x + w - 19, y + h - (leftUp ? 9 : 6), 12, leftUp ? 9 : 6, 3);
    ctx.fill();
  }

  // eye
  const eyeX = x + w - 13;
  const eyeY = y + (duck ? 9 : 13);
  ctx.fillStyle = P.eye;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, 6, 0, Math.PI * 2);
  ctx.fill();
  if (dead) {
    ctx.strokeStyle = P.pupil;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(eyeX - 3, eyeY - 3);
    ctx.lineTo(eyeX + 3, eyeY + 3);
    ctx.moveTo(eyeX + 3, eyeY - 3);
    ctx.lineTo(eyeX - 3, eyeY + 3);
    ctx.stroke();
  } else {
    ctx.fillStyle = P.pupil;
    ctx.beginPath();
    ctx.arc(eyeX + 1.5, eyeY, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draw one frame. Caller sets the canvas transform so logical WORLD
 * coordinates fill the backing store.
 */
export function drawScene(ctx, run, { mix, reducedMotion, dead }) {
  const P = buildPalette(mix);
  drawSky(ctx, run, P, mix, reducedMotion);
  drawGround(ctx, run, P);
  drawObstacles(ctx, run, P, reducedMotion);
  drawPlayer(ctx, run, P, reducedMotion, dead);
}

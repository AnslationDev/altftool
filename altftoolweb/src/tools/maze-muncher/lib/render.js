// Canvas renderer for Maze Muncher. All art is geometric shapes drawn in a
// fixed vivid palette; the board paints its own dark background so it stays
// legible on both light and dark page themes.

import { COLS, ROWS, T_DOOR, T_WALL, WALLS } from "./maze";
import { posOf } from "./engine";

export const TILE = 32;
export const BOARD_W = COLS * TILE;
export const BOARD_H = ROWS * TILE;

const PAL = {
  bg: "#0c1226",
  wall: "#25316e",
  wallEdge: "#4457b8",
  wallFlash: "#facc15",
  door: "#94a3b8",
  pellet: "#fbbf24",
  power: "#fde047",
  player: "#facc15",
  fright: "#4338ca",
  frightFlash: "#e2e8f0",
  frightWarn: "#818cf8",
  eyeWhite: "#f8fafc",
  eyeDark: "#1e1b4b",
  pupil: "#1e2a4a",
  text: "#fde047",
  popup: "#f8fafc",
};

function drawWalls(c, g, now, reduced) {
  const flashing = g.state === "levelclear";
  const edge = flashing
    ? reduced || Math.floor(now * 6) % 2 === 0
      ? PAL.wallFlash
      : PAL.wallEdge
    : PAL.wallEdge;
  c.lineWidth = 1.5;
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const t = WALLS[y][x];
      if (t === T_WALL) {
        const px = x * TILE + 2.5;
        const py = y * TILE + 2.5;
        const s = TILE - 5;
        c.beginPath();
        if (c.roundRect) c.roundRect(px, py, s, s, 6);
        else c.rect(px, py, s, s);
        c.fillStyle = PAL.wall;
        c.fill();
        c.strokeStyle = edge;
        c.stroke();
      } else if (t === T_DOOR) {
        c.fillStyle = PAL.door;
        c.fillRect(x * TILE + 4, y * TILE + TILE / 2 - 2, TILE - 8, 4);
      }
    }
  }
}

function drawPellets(c, g, now, reduced) {
  for (const idx of g.pellets) {
    const x = idx % COLS;
    const y = Math.floor(idx / COLS);
    const cx = (x + 0.5) * TILE;
    const cy = (y + 0.5) * TILE;
    c.beginPath();
    if (g.powers.has(idx)) {
      const r = reduced ? TILE * 0.21 : TILE * 0.18 + Math.sin(now * 5) * TILE * 0.045;
      c.arc(cx, cy, r, 0, Math.PI * 2);
      c.fillStyle = PAL.power;
    } else {
      c.arc(cx, cy, TILE * 0.1, 0, Math.PI * 2);
      c.fillStyle = PAL.pellet;
    }
    c.fill();
  }
}

function drawGhost(c, px, py, r, body, eyeDir, frightened, lightBody) {
  // Body: dome top, straight sides, zig-zag skirt.
  c.beginPath();
  c.moveTo(px - r, py + r * 0.85);
  c.lineTo(px - r, py);
  c.arc(px, py, r, Math.PI, 0);
  c.lineTo(px + r, py + r * 0.85);
  const waves = 3;
  const w = (2 * r) / (waves * 2);
  let x = px + r;
  for (let i = 0; i < waves; i += 1) {
    c.lineTo(x - w, py + r * 0.55);
    c.lineTo(x - 2 * w, py + r * 0.85);
    x -= 2 * w;
  }
  c.closePath();
  c.fillStyle = body;
  c.fill();

  if (frightened) {
    // Simple worried face: two flat eyes and a wavy mouth.
    const fc = lightBody ? PAL.eyeDark : PAL.frightFlash;
    c.fillStyle = fc;
    c.beginPath();
    c.arc(px - r * 0.35, py - r * 0.15, r * 0.14, 0, Math.PI * 2);
    c.arc(px + r * 0.35, py - r * 0.15, r * 0.14, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = fc;
    c.lineWidth = Math.max(1.5, r * 0.1);
    c.beginPath();
    const mw = r * 0.24;
    c.moveTo(px - mw * 2, py + r * 0.35);
    for (let i = -1; i < 2; i += 1) {
      c.quadraticCurveTo(
        px + mw * i + mw / 2,
        py + r * (i % 2 === 0 ? 0.2 : 0.5),
        px + mw * (i + 1),
        py + r * 0.35,
      );
    }
    c.stroke();
    return;
  }

  const ox = eyeDir.x * r * 0.12;
  const oy = eyeDir.y * r * 0.12;
  c.fillStyle = PAL.eyeWhite;
  c.beginPath();
  c.arc(px - r * 0.38 + ox, py - r * 0.1 + oy, r * 0.28, 0, Math.PI * 2);
  c.arc(px + r * 0.38 + ox, py - r * 0.1 + oy, r * 0.28, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = PAL.pupil;
  c.beginPath();
  c.arc(px - r * 0.38 + ox * 2, py - r * 0.1 + oy * 2, r * 0.13, 0, Math.PI * 2);
  c.arc(px + r * 0.38 + ox * 2, py - r * 0.1 + oy * 2, r * 0.13, 0, Math.PI * 2);
  c.fill();
}

function ghostBodyColor(g, gh, now, reduced) {
  if (!gh.frightened) return { body: gh.color, light: false };
  const remain = g.frightUntil - g.t;
  if (remain < 2) {
    if (reduced) return { body: PAL.frightWarn, light: false };
    const flash = Math.floor(now * 6) % 2 === 0;
    return { body: flash ? PAL.frightFlash : PAL.fright, light: flash };
  }
  return { body: PAL.fright, light: false };
}

function drawPlayer(c, g, now, reduced) {
  const pl = g.player;
  const pos = posOf(pl);
  const px = (pos.x + 0.5) * TILE;
  const py = (pos.y + 0.5) * TILE;
  let r = TILE * 0.42;
  let alpha = 1;

  if (g.state === "dying") {
    const frac = Math.max(0, (g.stateUntil - g.t) / 1.3);
    if (reduced) alpha = 0.35 + 0.5 * frac;
    else r *= Math.max(0.05, frac);
  }

  const moving = pl.dir.x !== 0 || pl.dir.y !== 0;
  const open =
    moving && !reduced ? 0.12 + 0.3 * Math.abs(Math.sin(now * 11)) : 0.24;
  const ang = Math.atan2(pl.face.y, pl.face.x);

  c.save();
  c.globalAlpha = alpha;
  c.fillStyle = PAL.player;
  c.beginPath();
  c.moveTo(px, py);
  c.arc(px, py, r, ang + open, ang - open + Math.PI * 2);
  c.closePath();
  c.fill();
  c.restore();
}

function drawPopups(c, g) {
  c.font = `bold ${Math.round(TILE * 0.45)}px ui-sans-serif, system-ui, sans-serif`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  for (const p of g.popups) {
    const life = Math.max(0, Math.min(1, (p.until - g.t) / 0.9));
    c.save();
    c.globalAlpha = 0.3 + 0.7 * life;
    c.fillStyle = PAL.popup;
    c.fillText(p.text, (p.x + 0.5) * TILE, (p.y + 0.5) * TILE - (1 - life) * TILE * 0.4);
    c.restore();
  }
}

function drawBanner(c, text) {
  c.font = `bold ${Math.round(TILE * 0.72)}px ui-sans-serif, system-ui, sans-serif`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.save();
  c.lineWidth = 5;
  c.strokeStyle = PAL.bg;
  c.strokeText(text, BOARD_W / 2, 11.5 * TILE);
  c.fillStyle = PAL.text;
  c.fillText(text, BOARD_W / 2, 11.5 * TILE);
  c.restore();
}

/** Paint one frame. `now` is seconds (performance.now()/1000). */
export function drawGame(c, g, now, reduced) {
  c.fillStyle = PAL.bg;
  c.fillRect(0, 0, BOARD_W, BOARD_H);

  drawWalls(c, g, now, reduced);
  drawPellets(c, g, now, reduced);
  drawPopups(c, g);

  for (const gh of g.ghosts) {
    const pos = gh.state === "home" ? { x: gh.tx, y: gh.ty } : posOf(gh);
    const bob =
      gh.state === "home" && !reduced ? Math.sin(now * 4 + gh.homeIx * 2.1) * TILE * 0.07 : 0;
    const { body, light } = ghostBodyColor(g, gh, now, reduced);
    drawGhost(
      c,
      (pos.x + 0.5) * TILE,
      (pos.y + 0.5) * TILE + bob,
      TILE * 0.42,
      body,
      gh.dir,
      gh.frightened,
      light,
    );
  }

  drawPlayer(c, g, now, reduced);

  if (g.state === "respawn") drawBanner(c, "GET READY!");
  else if (g.state === "levelclear") drawBanner(c, `LEVEL ${g.level} CLEARED!`);
}

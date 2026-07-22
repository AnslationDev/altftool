// Canvas rendering for Tap Glider. The play area paints its own fixed vivid
// palette (game art), so it stays identical and legible in light and dark
// page themes. All coordinates are in WORLD logical units; the caller sets
// the transform for device pixels.

import { WORLD, GLIDER, PILLARS } from "./engine";

const ART = {
  skyTop: "#3FB9E6",
  skyBottom: "#C3ECF8",
  sun: "#FFE9A8",
  cloud: "rgba(255, 255, 255, 0.85)",
  hillFar: "#8FE3CF",
  hillNear: "#4FCDB4",
  pillarLight: "#54DCA4",
  pillarMid: "#18B074",
  pillarDark: "#0E8C5C",
  pillarEdge: "#0B6B47",
  grassLip: "#8FE08A",
  grass: "#57B45C",
  grassEdge: "#3F9A4A",
  soil: "#DDA15E",
  soilStripe: "#C98D4B",
  body: "#FFC53D",
  belly: "#FFE29A",
  wing: "#F59F0A",
  beak: "#F97316",
  outline: "#C77D0A",
  eyeWhite: "#FFFFFF",
  pupil: "#222B38",
};

const CLOUDS = [
  { x: 60, y: 74, s: 1 },
  { x: 210, y: 128, s: 0.75 },
  { x: 340, y: 62, s: 1.15 },
];

function roundedRect(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function drawSky(ctx) {
  const grad = ctx.createLinearGradient(0, 0, 0, WORLD.height);
  grad.addColorStop(0, ART.skyTop);
  grad.addColorStop(1, ART.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = ART.sun;
  ctx.beginPath();
  ctx.arc(WORLD.width - 70, 66, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(WORLD.width - 70, 66, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCloud(ctx, x, y, s) {
  ctx.beginPath();
  ctx.arc(x, y, 18 * s, 0, Math.PI * 2);
  ctx.arc(x + 20 * s, y - 8 * s, 15 * s, 0, Math.PI * 2);
  ctx.arc(x + 40 * s, y, 13 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawClouds(ctx, parallax) {
  const span = WORLD.width + 140;
  const off = (parallax * 0.22) % span;
  ctx.fillStyle = ART.cloud;
  for (const cloud of CLOUDS) {
    let x = cloud.x - off;
    if (x < -80) x += span;
    drawCloud(ctx, x, cloud.y, cloud.s);
  }
}

function drawHillRow(ctx, parallax, factor, radius, period, baseline, color) {
  const off = (parallax * factor) % period;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let x = -off - period; x < WORLD.width + period; x += period) {
    ctx.moveTo(x + radius, baseline);
    ctx.arc(x, baseline, radius, Math.PI, 0);
  }
  ctx.fill();
}

function drawPillarPiece(ctx, x, y, w, h, radius) {
  const grad = ctx.createLinearGradient(x, 0, x + w, 0);
  grad.addColorStop(0, ART.pillarMid);
  grad.addColorStop(0.45, ART.pillarLight);
  grad.addColorStop(1, ART.pillarDark);
  ctx.fillStyle = grad;
  ctx.strokeStyle = ART.pillarEdge;
  ctx.lineWidth = 2;
  roundedRect(ctx, x, y, w, h, radius);
  ctx.fill();
  ctx.stroke();
}

function drawPillars(ctx, world, groundY) {
  const { width: w, capHeight: cap } = PILLARS;
  for (const pillar of world.pillars) {
    // Top pillar: shaft runs off the top edge, cap faces the gap.
    drawPillarPiece(ctx, pillar.x + 3, -14, w - 6, pillar.gapTop - cap + 16, 8);
    drawPillarPiece(ctx, pillar.x - 3, pillar.gapTop - cap, w + 6, cap, 9);
    // Bottom pillar: cap faces the gap, shaft runs into the ground.
    drawPillarPiece(ctx, pillar.x - 3, pillar.gapBottom, w + 6, cap, 9);
    drawPillarPiece(ctx, pillar.x + 3, pillar.gapBottom + cap - 2, w - 6, groundY - pillar.gapBottom - cap + 16, 8);
  }
}

function drawGround(ctx, world, groundY, reduceMotion) {
  ctx.fillStyle = ART.soil;
  ctx.fillRect(0, groundY, WORLD.width, WORLD.groundHeight);

  // Scrolling diagonal soil stripes (static under reduced motion).
  const off = reduceMotion ? 0 : world.distance % 48;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, groundY + 18, WORLD.width, WORLD.groundHeight - 18);
  ctx.clip();
  ctx.fillStyle = ART.soilStripe;
  for (let x = -off - 48; x < WORLD.width + 48; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, WORLD.height);
    ctx.lineTo(x + 22, groundY + 18);
    ctx.lineTo(x + 40, groundY + 18);
    ctx.lineTo(x + 18, WORLD.height);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  ctx.fillStyle = ART.grass;
  ctx.fillRect(0, groundY, WORLD.width, 16);
  ctx.fillStyle = ART.grassLip;
  ctx.fillRect(0, groundY, WORLD.width, 4);
  ctx.fillStyle = ART.grassEdge;
  ctx.fillRect(0, groundY + 14, WORLD.width, 4);
}

function drawGlider(ctx, world, phase, reduceMotion) {
  const inFlight = phase === "playing" || phase === "over";
  const angle = inFlight
    ? Math.max(-0.5, Math.min(1.3, world.gliderVy / 480))
    : 0;

  // Wing kicks up right after a flap, then settles into a gentle idle beat.
  let wing;
  if (world.wingTime < 0.28) {
    wing = Math.sin((world.wingTime / 0.28) * Math.PI) * -0.9;
  } else {
    wing = reduceMotion ? 0 : Math.sin(world.time * 5) * 0.18;
  }

  ctx.save();
  ctx.translate(GLIDER.x, world.gliderY);
  ctx.rotate(angle);
  ctx.lineWidth = 2;
  ctx.strokeStyle = ART.outline;

  // Tail feather.
  ctx.fillStyle = ART.wing;
  ctx.beginPath();
  ctx.moveTo(-13, -3);
  ctx.lineTo(-22, -7);
  ctx.lineTo(-12, 4);
  ctx.closePath();
  ctx.fill();

  // Body.
  ctx.fillStyle = ART.body;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 12.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Belly.
  ctx.fillStyle = ART.belly;
  ctx.beginPath();
  ctx.ellipse(-2, 5, 9, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wing.
  ctx.save();
  ctx.translate(-4, -1);
  ctx.rotate(wing);
  ctx.fillStyle = ART.wing;
  ctx.beginPath();
  ctx.ellipse(-2, 1, 9.5, 6, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Beak.
  ctx.fillStyle = ART.beak;
  ctx.beginPath();
  ctx.moveTo(13, -1);
  ctx.lineTo(22.5, 1.5);
  ctx.lineTo(13, 5);
  ctx.closePath();
  ctx.fill();

  // Eye.
  ctx.fillStyle = ART.eyeWhite;
  ctx.beginPath();
  ctx.arc(7, -4, 4.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = ART.pupil;
  ctx.beginPath();
  ctx.arc(8.4, -4, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Paint one full frame. `phase` is the game state, `reduceMotion` freezes decor. */
export function drawFrame(ctx, world, { phase, reduceMotion }) {
  const groundY = WORLD.height - WORLD.groundHeight;
  const parallax = reduceMotion ? 0 : world.distance;

  drawSky(ctx);
  drawClouds(ctx, parallax);
  drawHillRow(ctx, parallax, 0.35, 72, 132, groundY + 2, ART.hillFar);
  drawHillRow(ctx, parallax, 0.55, 46, 92, groundY + 8, ART.hillNear);
  drawPillars(ctx, world, groundY);
  drawGround(ctx, world, groundY, reduceMotion);
  drawGlider(ctx, world, phase, reduceMotion);
}

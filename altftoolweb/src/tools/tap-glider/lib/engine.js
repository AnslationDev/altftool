// Pure simulation logic for Tap Glider. No browser APIs, no React — every
// function here takes plain data in and returns plain data (or mutates the
// passed world object) so the game loop in pages/index.jsx stays thin.

export const WORLD = {
  width: 420,
  height: 560,
  groundHeight: 72,
};

export const GLIDER = {
  x: 118,
  radius: 14,
  gravity: 1500,
  flapVelocity: -430,
  maxFall: 640,
};

export const PILLARS = {
  width: 66,
  spacing: 216,
  capHeight: 26,
  baseGap: 174,
  minGap: 118,
  gapStep: 1.6, // how much the gap narrows per point scored
  margin: 46, // min distance between a gap edge and the ceiling / ground
};

export const SPEED = {
  base: 148,
  step: 2.4,
  maxBonus: 88,
};

// Ordered best-first so the first threshold met wins.
export const MEDALS = [
  { id: "gold", label: "Gold", min: 40 },
  { id: "silver", label: "Silver", min: 20 },
  { id: "bronze", label: "Bronze", min: 10 },
];

export function gapForScore(score) {
  return Math.max(PILLARS.minGap, PILLARS.baseGap - score * PILLARS.gapStep);
}

export function speedForScore(score) {
  return SPEED.base + Math.min(score * SPEED.step, SPEED.maxBonus);
}

export function medalForScore(score) {
  return MEDALS.find((medal) => score >= medal.min) || null;
}

export function makePillar(x, score, random = Math.random) {
  const gap = gapForScore(score);
  const gapTopMin = PILLARS.margin;
  const gapTopMax = WORLD.height - WORLD.groundHeight - PILLARS.margin - gap;
  const gapTop = gapTopMin + random() * Math.max(0, gapTopMax - gapTopMin);
  return { x, gapTop, gapBottom: gapTop + gap, scored: false };
}

export function makeWorld() {
  return {
    gliderY: (WORLD.height - WORLD.groundHeight) / 2,
    gliderVy: 0,
    pillars: [],
    distance: 0, // total scroll, drives parallax + ground stripes
    wingTime: 10, // seconds since last flap, drives the wing animation
    time: 0,
  };
}

export function circleRectHit(cx, cy, r, rx, ry, rw, rh) {
  const nearestX = Math.max(rx, Math.min(cx, rx + rw));
  const nearestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy <= r * r;
}

/**
 * Advance one frame of active play. Mutates `world`.
 * Returns { scored, dead } where `scored` is the number of gaps cleared this
 * frame (0 or 1 in practice) and `dead` is whether the glider crashed.
 */
export function stepWorld(world, dt, score) {
  const groundY = WORLD.height - WORLD.groundHeight;
  const speed = speedForScore(score);
  let scored = 0;
  let dead = false;

  world.time += dt;
  world.wingTime += dt;
  world.distance += speed * dt;

  // Glider physics: gravity with a terminal fall speed, soft ceiling clamp.
  world.gliderVy = Math.min(world.gliderVy + GLIDER.gravity * dt, GLIDER.maxFall);
  world.gliderY += world.gliderVy * dt;
  if (world.gliderY < GLIDER.radius) {
    world.gliderY = GLIDER.radius;
    world.gliderVy = Math.max(world.gliderVy, 0);
  }

  // Advance pillars, count the ones just cleared, drop off-screen ones.
  for (const pillar of world.pillars) {
    pillar.x -= speed * dt;
    if (!pillar.scored && pillar.x + PILLARS.width < GLIDER.x - GLIDER.radius) {
      pillar.scored = true;
      scored += 1;
    }
  }
  world.pillars = world.pillars.filter((pillar) => pillar.x + PILLARS.width > -60);

  // Keep the runway populated; new pillars use the up-to-date score so the
  // difficulty ramp (narrower gaps) kicks in immediately.
  const last = world.pillars[world.pillars.length - 1];
  if (!last) {
    world.pillars.push(makePillar(WORLD.width + 130, score + scored));
  } else if (last.x < WORLD.width + 130 - PILLARS.spacing) {
    world.pillars.push(makePillar(last.x + PILLARS.spacing, score + scored));
  }

  // Collisions: ground first, then pillar shafts near the glider.
  if (world.gliderY + GLIDER.radius >= groundY) {
    world.gliderY = groundY - GLIDER.radius;
    dead = true;
  } else {
    for (const pillar of world.pillars) {
      if (pillar.x > GLIDER.x + GLIDER.radius) continue;
      if (pillar.x + PILLARS.width < GLIDER.x - GLIDER.radius) continue;
      const hitTop = circleRectHit(
        GLIDER.x, world.gliderY, GLIDER.radius,
        pillar.x, -40, PILLARS.width, pillar.gapTop + 40,
      );
      const hitBottom = circleRectHit(
        GLIDER.x, world.gliderY, GLIDER.radius,
        pillar.x, pillar.gapBottom, PILLARS.width, groundY - pillar.gapBottom + 40,
      );
      if (hitTop || hitBottom) {
        dead = true;
        break;
      }
    }
  }

  return { scored, dead };
}

/** Ready-screen idle: gentle hover + slow scroll, both skipped for reduced motion. */
export function stepIdle(world, dt, reduceMotion) {
  world.time += dt;
  world.wingTime += dt;
  const restY = (WORLD.height - WORLD.groundHeight) / 2;
  if (reduceMotion) {
    world.gliderY = restY;
  } else {
    world.distance += SPEED.base * 0.4 * dt;
    world.gliderY = restY + Math.sin(world.time * 2.4) * 7;
  }
}

/** After a crash: let the glider settle onto the ground, nothing else moves. */
export function stepFall(world, dt) {
  const restY = WORLD.height - WORLD.groundHeight - GLIDER.radius;
  world.time += dt;
  if (world.gliderY < restY) {
    world.gliderVy = Math.min(world.gliderVy + GLIDER.gravity * dt, GLIDER.maxFall);
    world.gliderY = Math.min(world.gliderY + world.gliderVy * dt, restY);
  }
}

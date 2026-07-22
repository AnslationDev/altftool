// Pure game logic for the endless runner. World units are logical pixels;
// pages/index.jsx owns the React state machine, input, and render loop.

export const WORLD = { width: 760, height: 340, groundY: 296 };

export const PLAYER = {
  x: 84,
  runWidth: 46,
  runHeight: 60,
  duckWidth: 62,
  duckHeight: 32,
  hitInset: 7,
};

export const PHYSICS = {
  gravity: 2600,
  fastFallBoost: 2.2,
  jumpVelocity: -900,
  minSpeed: 330,
  maxSpeed: 800,
  rampScore: 3200,
};

export const PALETTE_CYCLE = 500;
const FLYER_MIN_SCORE = 350;
const FIRST_GAP = 520;

const randomBetween = (min, max) => min + Math.random() * (max - min);

export function createRun() {
  return {
    score: 0,
    distance: 0,
    speed: PHYSICS.minSpeed,
    spawnGap: FIRST_GAP,
    obstacles: [],
    player: {
      y: WORLD.groundY - PLAYER.runHeight,
      vy: 0,
      onGround: true,
      ducking: false,
    },
  };
}

export function playerBox(player) {
  const duck = player.ducking && player.onGround;
  return {
    x: PLAYER.x,
    y: player.y,
    width: duck ? PLAYER.duckWidth : PLAYER.runWidth,
    height: duck ? PLAYER.duckHeight : PLAYER.runHeight,
  };
}

export function tryJump(run) {
  const p = run.player;
  if (!p.onGround) return false;
  p.onGround = false;
  p.ducking = false;
  p.y = WORLD.groundY - PLAYER.runHeight;
  p.vy = PHYSICS.jumpVelocity;
  return true;
}

function spawnObstacle(run) {
  if (run.score >= FLYER_MIN_SCORE && Math.random() < 0.32) {
    // Hovering drone: the low one forces a duck (or a well-timed leap),
    // the high one can be run straight under.
    const low = Math.random() < 0.55;
    const height = 26;
    const bottom = WORLD.groundY - (low ? 44 : 96);
    run.obstacles.push({
      kind: "flyer",
      x: WORLD.width + 40,
      y: bottom - height,
      width: 48,
      height,
      flap: Math.random() * Math.PI * 2,
    });
  } else {
    // Cluster of 1-3 rounded pillars on the ground.
    const pillars = 1 + Math.floor(Math.random() * 3);
    const pillarWidth = 20;
    const pillarGap = 6;
    const height = randomBetween(42, 74);
    run.obstacles.push({
      kind: "block",
      x: WORLD.width + 40,
      y: WORLD.groundY - height,
      width: pillars * pillarWidth + (pillars - 1) * pillarGap,
      height,
      pillars,
      pillarWidth,
      pillarGap,
    });
  }
  const minGap = 250 + run.speed * 0.5;
  run.spawnGap = randomBetween(minGap, minGap + 300);
}

/**
 * Advance the world by dt seconds. input = { duck: boolean }.
 * Returns an array of event strings: "milestone" (every 100 points)
 * and/or "crash" (player hit an obstacle).
 */
export function updateRun(run, dt, input) {
  const events = [];

  run.speed =
    PHYSICS.minSpeed +
    (PHYSICS.maxSpeed - PHYSICS.minSpeed) * Math.min(1, run.score / PHYSICS.rampScore);
  const step = run.speed * dt;
  run.distance += step;

  const prevHundreds = Math.floor(run.score / 100);
  run.score += step / 10;
  if (Math.floor(run.score / 100) > prevHundreds) events.push("milestone");

  const p = run.player;
  if (p.onGround) {
    p.ducking = Boolean(input.duck);
    p.y = WORLD.groundY - (p.ducking ? PLAYER.duckHeight : PLAYER.runHeight);
  } else {
    p.ducking = false;
    const gravity = PHYSICS.gravity * (input.duck ? PHYSICS.fastFallBoost : 1);
    p.vy += gravity * dt;
    p.y += p.vy * dt;
    const restY = WORLD.groundY - PLAYER.runHeight;
    if (p.y >= restY) {
      p.y = restY;
      p.vy = 0;
      p.onGround = true;
    }
  }

  run.spawnGap -= step;
  if (run.spawnGap <= 0) spawnObstacle(run);

  for (const ob of run.obstacles) {
    ob.x -= step * (ob.kind === "flyer" ? 1.12 : 1);
    if (ob.kind === "flyer") ob.flap += dt * 9;
  }
  run.obstacles = run.obstacles.filter((ob) => ob.x + ob.width > -60);

  // Forgiving AABB collision: both boxes are inset a few pixels.
  const box = playerBox(p);
  const px = box.x + PLAYER.hitInset;
  const py = box.y + PLAYER.hitInset * 0.6;
  const pw = box.width - PLAYER.hitInset * 2;
  const ph = box.height - PLAYER.hitInset;
  for (const ob of run.obstacles) {
    const ox = ob.x + 4;
    const oy = ob.y + 4;
    const ow = ob.width - 8;
    const oh = ob.height - 8;
    if (px < ox + ow && px + pw > ox && py < oy + oh && py + ph > oy) {
      events.push("crash");
      break;
    }
  }

  return events;
}

/** 0 = day palette, 1 = night palette; flips every PALETTE_CYCLE points. */
export function getPaletteTarget(score) {
  return Math.floor(score / PALETTE_CYCLE) % 2;
}

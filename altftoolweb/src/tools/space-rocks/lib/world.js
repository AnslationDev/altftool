// Pure game-model helpers for Space Rocks. No browser APIs at module scope.

export const WORLD_W = 640;
export const WORLD_H = 480;
export const TAU = Math.PI * 2;

export const SHIP = {
  radius: 12,
  turnSpeed: 3.9, // rad/s
  thrust: 250, // px/s^2
  maxSpeed: 340, // px/s
  drag: 0.3, // exponential damping per second
  respawnDelay: 1.2, // s
  invulnTime: 2.6, // s
};

export const BULLET = {
  speed: 430,
  range: 400,
  maxAlive: 4,
  cooldown: 0.22,
};

// Tier 0 = large, 1 = medium, 2 = small.
export const ROCK_TIERS = [
  { radius: 42, points: 20, speedMin: 36, speedMax: 66 },
  { radius: 24, points: 50, speedMin: 58, speedMax: 98 },
  { radius: 13, points: 100, speedMin: 88, speedMax: 140 },
];

// Fixed game-art palette drawn on a deep-space dark playfield; legible in
// both light and dark page themes because the playfield paints its own bg.
export const COLORS = {
  bgTop: "#0b1026",
  bgBottom: "#1b1440",
  star: "#8ea3d8",
  ship: "#e8f6ff",
  flame: "#fcaa5d",
  bullet: "#7ff0e0",
  shield: "#67e8f9",
  banner: "#c4b5fd",
  rocks: ["#a78bfa", "#7dd3fc", "#f9a8d4"],
};

export const rand = (min, max) => min + Math.random() * (max - min);

export const waveSpeedMul = (wave) => Math.min(1 + (wave - 1) * 0.09, 1.7);

export const waveRockCount = (wave) => Math.min(3 + wave, 8);

export function makeShip() {
  return {
    x: WORLD_W / 2,
    y: WORLD_H / 2,
    a: -Math.PI / 2,
    vx: 0,
    vy: 0,
    dead: false,
    respawn: 0,
    invuln: SHIP.invulnTime,
    thrusting: false,
  };
}

function makeRockShape() {
  const count = 10 + Math.floor(Math.random() * 3);
  const shape = [];
  for (let i = 0; i < count; i += 1) {
    shape.push({
      a: (i / count) * TAU + rand(-0.12, 0.12),
      m: rand(0.72, 1.16),
    });
  }
  return shape;
}

export function makeRock(tier, x, y, speedMul) {
  const spec = ROCK_TIERS[tier];
  const dir = rand(0, TAU);
  const speed = rand(spec.speedMin, spec.speedMax) * speedMul;
  return {
    tier,
    x,
    y,
    vx: Math.cos(dir) * speed,
    vy: Math.sin(dir) * speed,
    radius: spec.radius,
    rot: rand(0, TAU),
    spin: rand(-1.2, 1.2),
    shape: makeRockShape(),
  };
}

/** Spawn a wave of large rocks, kept clear of the point (cx, cy). */
export function spawnWave(wave, cx, cy) {
  const rocks = [];
  const count = waveRockCount(wave);
  const speedMul = waveSpeedMul(wave);
  for (let i = 0; i < count; i += 1) {
    let x = 0;
    let y = 0;
    for (let attempt = 0; attempt < 24; attempt += 1) {
      x = rand(0, WORLD_W);
      y = rand(0, WORLD_H);
      if (Math.hypot(x - cx, y - cy) > 150) break;
    }
    rocks.push(makeRock(0, x, y, speedMul));
  }
  return rocks;
}

/** A destroyed rock splits 1 -> 2 into the next smaller tier (small rocks vanish). */
export function splitRock(rock, speedMul) {
  if (rock.tier >= ROCK_TIERS.length - 1) return [];
  return [
    makeRock(rock.tier + 1, rock.x, rock.y, speedMul),
    makeRock(rock.tier + 1, rock.x, rock.y, speedMul),
  ];
}

export function makeStars(count) {
  const stars = [];
  for (let i = 0; i < count; i += 1) {
    stars.push({
      x: rand(0, WORLD_W),
      y: rand(0, WORLD_H),
      size: Math.random() < 0.8 ? 1.5 : 2.5,
      bright: rand(0.35, 1),
      phase: rand(0, TAU),
    });
  }
  return stars;
}

/** Small square-particle burst used when things explode. */
export function burst(x, y, color, count, speed) {
  const particles = [];
  for (let i = 0; i < count; i += 1) {
    const dir = rand(0, TAU);
    const v = rand(speed * 0.25, speed);
    const life = rand(0.35, 0.85);
    particles.push({
      x,
      y,
      vx: Math.cos(dir) * v,
      vy: Math.sin(dir) * v,
      life,
      maxLife: life,
      size: rand(1.5, 3.2),
      color,
    });
  }
  return particles;
}

/** Toroidal wrap: a body fully exits one edge before re-entering the opposite one. */
export function wrapBody(body, margin) {
  if (body.x < -margin) body.x = WORLD_W + margin;
  else if (body.x > WORLD_W + margin) body.x = -margin;
  if (body.y < -margin) body.y = WORLD_H + margin;
  else if (body.y > WORLD_H + margin) body.y = -margin;
}

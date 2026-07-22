// Core simulation and canvas rendering for the brick breaker game.
// Pure logic: no React and no module-scope browser APIs. The page component
// owns the requestAnimationFrame loop and reacts to events emitted by
// stepGame through the `ev` callback bag.

import { COLS, LEVEL_COUNT, buildLevel } from "./levels";

export { LEVEL_COUNT };

export const GAME_W = 480;
export const GAME_H = 600;

const SIDE_MARGIN = 10;
const TOP_MARGIN = 46;
const BRICK_GAP = 3;
const BRICK_H = 20;
const BRICK_W = (GAME_W - SIDE_MARGIN * 2 - BRICK_GAP * (COLS - 1)) / COLS;

const PADDLE_W = 88;
const WIDE_PADDLE_W = 142;
const PADDLE_H = 14;
const PADDLE_Y = GAME_H - 42;
const PADDLE_KEY_SPEED = 540;

const BALL_R = 7;
const MAX_SUBSTEP = 6; // max px of ball travel per collision substep
const MAX_BALLS = 6;
const SLOW_FACTOR = 0.65;

const POWER_W = 38;
const POWER_H = 18;
const POWER_FALL_SPEED = 150;
const DROP_CHANCE = 0.14;

export const POWER_TYPES = {
  wide: { label: "W", name: "Wide paddle", color: "#22d3ee", ms: 12000 },
  slow: { label: "S", name: "Slow ball", color: "#a78bfa", ms: 9000 },
  multi: { label: "M", name: "Multiball", color: "#fb923c", ms: 0 },
};
const POWER_IDS = Object.keys(POWER_TYPES);

// Vivid arcade palette keyed by remaining hit points. This is game art inside
// the play area (not UI chrome), so fixed colors are intentional here.
const BRICK_COLORS = { 1: "#34d399", 2: "#fbbf24", 3: "#f87171" };

export function baseBallSpeed(level) {
  // Gentle ramp: each level is a little faster than the last.
  return 330 + (level - 1) * 26;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function createBricks(level) {
  const layout = buildLevel(level);
  const bricks = [];
  layout.forEach((row, r) => {
    row.forEach((tier, c) => {
      if (!tier) return;
      bricks.push({
        x: SIDE_MARGIN + c * (BRICK_W + BRICK_GAP),
        y: TOP_MARGIN + r * (BRICK_H + BRICK_GAP),
        w: BRICK_W,
        h: BRICK_H,
        tier,
        hp: tier,
      });
    });
  });
  return bricks;
}

export function resetBallOnPaddle(g) {
  g.balls = [
    { x: g.paddle.x, y: PADDLE_Y - BALL_R - 1, vx: 0, vy: 0, stuck: true, dead: false },
  ];
}

export function createGame() {
  const g = {
    status: "ready", // ready -> playing -> paused | cleared | gameover | won
    level: 1,
    lives: 3,
    score: 0,
    bricks: createBricks(1),
    balls: [],
    paddle: { x: GAME_W / 2, w: PADDLE_W },
    powerups: [],
    particles: [],
    effects: { wideMs: 0, slowMs: 0 },
    keys: { left: false, right: false },
    reduceMotion: false,
  };
  resetBallOnPaddle(g);
  return g;
}

export function startLevel(g, level) {
  g.level = level;
  g.bricks = createBricks(level);
  g.powerups = [];
  g.particles = [];
  g.effects = { wideMs: 0, slowMs: 0 };
  g.paddle = { x: GAME_W / 2, w: PADDLE_W };
  resetBallOnPaddle(g);
}

export function movePaddleTo(g, x) {
  g.paddle.x = clamp(x, g.paddle.w / 2, GAME_W - g.paddle.w / 2);
}

export function launchBalls(g) {
  const speed = baseBallSpeed(g.level);
  g.balls.forEach((ball) => {
    if (!ball.stuck) return;
    ball.stuck = false;
    const angle = (Math.random() - 0.5) * 0.7; // radians off vertical
    ball.vx = Math.sin(angle) * speed;
    ball.vy = -Math.cos(angle) * speed;
  });
}

function targetBallSpeed(g) {
  return baseBallSpeed(g.level) * (g.effects.slowMs > 0 ? SLOW_FACTOR : 1);
}

function spawnParticles(g, brick, color) {
  if (g.reduceMotion) return;
  for (let i = 0; i < 8; i += 1) {
    g.particles.push({
      x: brick.x + brick.w / 2,
      y: brick.y + brick.h / 2,
      vx: (Math.random() - 0.5) * 220,
      vy: (Math.random() - 0.7) * 220,
      life: 0.5,
      color,
    });
  }
}

function maybeDropPower(g, brick) {
  if (Math.random() > DROP_CHANCE) return;
  const type = POWER_IDS[Math.floor(Math.random() * POWER_IDS.length)];
  g.powerups.push({ x: brick.x + brick.w / 2, y: brick.y + brick.h / 2, type });
}

function applyPower(g, id) {
  if (id === "wide") {
    g.effects.wideMs = POWER_TYPES.wide.ms;
  } else if (id === "slow") {
    g.effects.slowMs = POWER_TYPES.slow.ms;
  } else if (id === "multi") {
    const source = g.balls.find((ball) => !ball.stuck) || g.balls[0];
    if (!source) return;
    const speed = Math.hypot(source.vx, source.vy) || targetBallSpeed(g);
    [-0.45, 0.45].forEach((offset) => {
      if (g.balls.length >= MAX_BALLS) return;
      const angle = Math.atan2(source.vx, -source.vy) + offset;
      g.balls.push({
        x: source.x,
        y: source.y,
        vx: Math.sin(angle) * speed,
        vy: -Math.cos(angle) * speed,
        stuck: false,
        dead: false,
      });
    });
  }
}

function circleHitsRect(ball, x, y, w, h) {
  const nx = clamp(ball.x, x, x + w);
  const ny = clamp(ball.y, y, y + h);
  const dx = ball.x - nx;
  const dy = ball.y - ny;
  return dx * dx + dy * dy <= BALL_R * BALL_R;
}

// AABB-style bounce: reflect along the axis of least penetration.
function bounceOffBrick(ball, brick) {
  const cx = brick.x + brick.w / 2;
  const cy = brick.y + brick.h / 2;
  const px = brick.w / 2 + BALL_R - Math.abs(ball.x - cx);
  const py = brick.h / 2 + BALL_R - Math.abs(ball.y - cy);
  if (px <= 0 || py <= 0) return false;
  if (px < py) {
    ball.vx = ball.x < cx ? -Math.abs(ball.vx) : Math.abs(ball.vx);
    ball.x += ball.x < cx ? -px : px;
  } else {
    ball.vy = ball.y < cy ? -Math.abs(ball.vy) : Math.abs(ball.vy);
    ball.y += ball.y < cy ? -py : py;
  }
  return true;
}

/**
 * Advance the simulation by dt seconds. Runs for both "ready" (paddle moves,
 * stuck ball follows) and "playing". Emits gameplay events via `ev`:
 * wall(), paddle(), brick(destroyed, tier), power(type), cleared(), ballsLost().
 */
export function stepGame(g, dt, ev) {
  // Keyboard paddle movement.
  const dir = (g.keys.right ? 1 : 0) - (g.keys.left ? 1 : 0);
  if (dir !== 0) movePaddleTo(g, g.paddle.x + dir * PADDLE_KEY_SPEED * dt);

  // Timed power-up effects and paddle width easing.
  g.effects.wideMs = Math.max(0, g.effects.wideMs - dt * 1000);
  g.effects.slowMs = Math.max(0, g.effects.slowMs - dt * 1000);
  const targetW = g.effects.wideMs > 0 ? WIDE_PADDLE_W : PADDLE_W;
  g.paddle.w = g.reduceMotion
    ? targetW
    : g.paddle.w + (targetW - g.paddle.w) * Math.min(1, dt * 10);
  movePaddleTo(g, g.paddle.x); // re-clamp after width change

  const speed = targetBallSpeed(g);

  for (const ball of g.balls) {
    if (ball.stuck) {
      ball.x = g.paddle.x;
      ball.y = PADDLE_Y - BALL_R - 1;
      continue;
    }

    // Pin speed to the level target and avoid endless near-horizontal loops.
    const mag = Math.hypot(ball.vx, ball.vy) || 1;
    ball.vx = (ball.vx / mag) * speed;
    ball.vy = (ball.vy / mag) * speed;
    if (Math.abs(ball.vy) < speed * 0.18) {
      const signY = ball.vy < 0 ? -1 : 1;
      const signX = ball.vx < 0 ? -1 : 1;
      ball.vy = signY * speed * 0.18;
      ball.vx = signX * Math.sqrt(speed * speed - ball.vy * ball.vy);
    }

    // Substep the movement so fast balls cannot tunnel through bricks.
    const steps = Math.max(1, Math.ceil((speed * dt) / MAX_SUBSTEP));
    const stepDt = dt / steps;
    for (let i = 0; i < steps && !ball.dead; i += 1) {
      ball.x += ball.vx * stepDt;
      ball.y += ball.vy * stepDt;

      // Walls.
      if (ball.x < BALL_R) {
        ball.x = BALL_R;
        ball.vx = Math.abs(ball.vx);
        ev.wall();
      } else if (ball.x > GAME_W - BALL_R) {
        ball.x = GAME_W - BALL_R;
        ball.vx = -Math.abs(ball.vx);
        ev.wall();
      }
      if (ball.y < BALL_R) {
        ball.y = BALL_R;
        ball.vy = Math.abs(ball.vy);
        ev.wall();
      }

      // Paddle: reflection angle depends on where the ball lands.
      if (
        ball.vy > 0 &&
        circleHitsRect(ball, g.paddle.x - g.paddle.w / 2, PADDLE_Y, g.paddle.w, PADDLE_H)
      ) {
        const rel = clamp((ball.x - g.paddle.x) / (g.paddle.w / 2), -1, 1);
        const angle = rel * 1.05; // up to ~60 degrees off vertical
        ball.vx = Math.sin(angle) * speed;
        ball.vy = -Math.cos(angle) * speed;
        ball.y = PADDLE_Y - BALL_R - 0.5;
        ev.paddle();
      }

      // Bricks: resolve at most one hit per substep.
      for (const brick of g.bricks) {
        if (brick.hp <= 0) continue;
        if (!bounceOffBrick(ball, brick)) continue;
        brick.hp -= 1;
        if (brick.hp <= 0) {
          g.score += 10 + brick.tier * 20;
          spawnParticles(g, brick, BRICK_COLORS[brick.tier]);
          maybeDropPower(g, brick);
          ev.brick(true, brick.tier);
        } else {
          g.score += 10;
          ev.brick(false, brick.tier);
        }
        break;
      }

      if (ball.y - BALL_R > GAME_H) ball.dead = true;
    }
  }

  g.balls = g.balls.filter((ball) => !ball.dead);
  g.bricks = g.bricks.filter((brick) => brick.hp > 0);

  // Falling power-up capsules.
  const paddleLeft = g.paddle.x - g.paddle.w / 2;
  g.powerups = g.powerups.filter((p) => {
    p.y += POWER_FALL_SPEED * dt;
    const caught =
      p.y + POWER_H / 2 >= PADDLE_Y &&
      p.y - POWER_H / 2 <= PADDLE_Y + PADDLE_H &&
      p.x + POWER_W / 2 >= paddleLeft &&
      p.x - POWER_W / 2 <= paddleLeft + g.paddle.w;
    if (caught) {
      applyPower(g, p.type);
      ev.power(p.type);
      return false;
    }
    return p.y - POWER_H <= GAME_H;
  });

  // Debris particles.
  g.particles = g.particles.filter((pt) => {
    pt.life -= dt;
    pt.vy += 500 * dt;
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    return pt.life > 0;
  });

  if (g.bricks.length === 0) {
    ev.cleared();
    return;
  }
  if (g.balls.length === 0) ev.ballsLost();
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function drawGame(ctx, g) {
  // The play area owns its own dark arcade backdrop so it reads identically
  // in light and dark page themes.
  const bg = ctx.createLinearGradient(0, 0, 0, GAME_H);
  bg.addColorStop(0, "#0b1226");
  bg.addColorStop(1, "#16213f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, GAME_W, GAME_H);

  // Bricks — color encodes remaining hit points; cracks show damage.
  for (const brick of g.bricks) {
    ctx.fillStyle = BRICK_COLORS[brick.hp] || BRICK_COLORS[1];
    roundRect(ctx, brick.x, brick.y, brick.w, brick.h, 4);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
    roundRect(ctx, brick.x + 2, brick.y + 2, brick.w - 4, 5, 2);
    ctx.fill();
    if (brick.hp < brick.tier) {
      ctx.strokeStyle = "rgba(11, 18, 38, 0.55)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(brick.x + brick.w * 0.3, brick.y + 3);
      ctx.lineTo(brick.x + brick.w * 0.45, brick.y + brick.h - 3);
      if (brick.tier - brick.hp > 1) {
        ctx.moveTo(brick.x + brick.w * 0.7, brick.y + 2);
        ctx.lineTo(brick.x + brick.w * 0.6, brick.y + brick.h - 4);
      }
      ctx.stroke();
    }
  }

  // Power-up capsules.
  for (const p of g.powerups) {
    const spec = POWER_TYPES[p.type];
    ctx.fillStyle = spec.color;
    roundRect(ctx, p.x - POWER_W / 2, p.y - POWER_H / 2, POWER_W, POWER_H, 9);
    ctx.fill();
    ctx.fillStyle = "#0b1226";
    ctx.font = "bold 12px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(spec.label, p.x, p.y + 0.5);
  }

  // Paddle.
  const paddleX = g.paddle.x - g.paddle.w / 2;
  const paddleGrad = ctx.createLinearGradient(paddleX, PADDLE_Y, paddleX, PADDLE_Y + PADDLE_H);
  paddleGrad.addColorStop(0, "#2dd4bf");
  paddleGrad.addColorStop(1, "#0d9488");
  ctx.fillStyle = paddleGrad;
  roundRect(ctx, paddleX, PADDLE_Y, g.paddle.w, PADDLE_H, 7);
  ctx.fill();
  if (g.effects.wideMs > 0) {
    ctx.strokeStyle = "rgba(34, 211, 238, 0.8)";
    ctx.lineWidth = 2;
    roundRect(ctx, paddleX - 1.5, PADDLE_Y - 1.5, g.paddle.w + 3, PADDLE_H + 3, 8);
    ctx.stroke();
  }

  // Balls — highlight dot tints purple while the slow effect is active.
  for (const ball of g.balls) {
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = g.effects.slowMs > 0 ? "rgba(167, 139, 250, 0.9)" : "rgba(34, 211, 238, 0.9)";
    ctx.beginPath();
    ctx.arc(ball.x - 2, ball.y - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Debris particles.
  for (const pt of g.particles) {
    ctx.globalAlpha = Math.max(0, pt.life * 2);
    ctx.fillStyle = pt.color;
    ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4);
  }
  ctx.globalAlpha = 1;
}

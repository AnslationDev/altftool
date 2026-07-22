// Pure game math for the paddle rally engine. No browser APIs in this module.

export const COURT_W = 800;
export const COURT_H = 500;
export const PADDLE_W = 14;
export const PADDLE_H = 96;
export const PADDLE_MARGIN = 30;
export const BALL_R = 9;
export const WIN_SCORE = 7;
export const BASE_BALL_SPEED = 380;
export const MAX_BALL_SPEED = 940;
export const RALLY_SPEEDUP = 1.045;
export const PLAYER_SPEED = 560;
export const MAX_BOUNCE_ANGLE = Math.PI / 3.4; // ~53 degrees off the horizontal
export const SERVE_DELAY = 1.1; // seconds of "get ready" pause before each serve

export const DIFFICULTIES = [
  { id: "easy", label: "Easy", aiSpeed: 250, aiError: 64 },
  { id: "medium", label: "Medium", aiSpeed: 345, aiError: 34 },
  { id: "hard", label: "Hard", aiSpeed: 465, aiError: 10 },
];

export function createBall() {
  return { x: COURT_W / 2, y: COURT_H / 2, vx: 0, vy: 0, speed: BASE_BALL_SPEED };
}

export function resetBall(ball) {
  ball.x = COURT_W / 2;
  ball.y = COURT_H / 2;
  ball.vx = 0;
  ball.vy = 0;
  ball.speed = BASE_BALL_SPEED;
}

/** Launch the ball toward `dir` (-1 left, 1 right) at a shallow random angle. */
export function launchBall(ball, dir, rng = Math.random) {
  const angle = (rng() * 2 - 1) * (Math.PI / 7);
  ball.speed = BASE_BALL_SPEED;
  ball.vx = Math.cos(angle) * ball.speed * dir;
  ball.vy = Math.sin(angle) * ball.speed;
}

export function clampPaddleY(y) {
  const half = PADDLE_H / 2;
  return Math.min(COURT_H - half, Math.max(half, y));
}

/** Advance the ball and bounce off the top/bottom walls. Returns true on a wall hit. */
export function stepBall(ball, dt) {
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  let wall = false;
  if (ball.y - BALL_R < 0) {
    ball.y = BALL_R;
    ball.vy = Math.abs(ball.vy);
    wall = true;
  } else if (ball.y + BALL_R > COURT_H) {
    ball.y = COURT_H - BALL_R;
    ball.vy = -Math.abs(ball.vy);
    wall = true;
  }
  return wall;
}

/**
 * Swept collision against one paddle (`side`: -1 left, 1 right). Uses the ball's
 * pre-step x so a fast ball cannot tunnel through the paddle face. On a hit the
 * rebound angle follows where the ball struck the paddle, and the rally speeds up.
 */
export function collidePaddle(ball, prevX, paddleY, side) {
  if (side === -1 ? ball.vx >= 0 : ball.vx <= 0) return false;
  const faceX = side === -1 ? PADDLE_MARGIN + PADDLE_W : COURT_W - PADDLE_MARGIN - PADDLE_W;
  const prevEdge = side === -1 ? prevX - BALL_R : prevX + BALL_R;
  const currEdge = side === -1 ? ball.x - BALL_R : ball.x + BALL_R;
  const crossed =
    side === -1 ? prevEdge >= faceX && currEdge <= faceX : prevEdge <= faceX && currEdge >= faceX;
  if (!crossed) return false;
  if (Math.abs(ball.y - paddleY) > PADDLE_H / 2 + BALL_R) return false;

  const offset = Math.max(-1, Math.min(1, (ball.y - paddleY) / (PADDLE_H / 2)));
  const angle = offset * MAX_BOUNCE_ANGLE;
  const dir = side === -1 ? 1 : -1;
  ball.speed = Math.min(MAX_BALL_SPEED, ball.speed * RALLY_SPEEDUP);
  ball.vx = Math.cos(angle) * ball.speed * dir;
  ball.vy = Math.sin(angle) * ball.speed;
  ball.x = faceX + dir * BALL_R;
  return true;
}

/**
 * Move the AI paddle one step. It chases the ball (plus a per-serve aim error)
 * only while the ball travels toward it, otherwise it drifts back to center.
 */
export function stepAI(currentY, ball, difficulty, aimOffset, dt) {
  const chasing = ball.vx > 0;
  const target = chasing ? ball.y + aimOffset : COURT_H / 2;
  const maxStep = difficulty.aiSpeed * (chasing ? 1 : 0.5) * dt;
  const delta = target - currentY;
  const step = Math.max(-maxStep, Math.min(maxStep, delta));
  return clampPaddleY(currentY + step);
}

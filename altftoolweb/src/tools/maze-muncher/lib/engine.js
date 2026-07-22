// Simulation core for Maze Muncher: grid movement, ghost AI, scoring and the
// game state machine. Pure logic — no browser APIs, so it is safe to import
// anywhere and easy to reason about. All time values are in seconds.

import {
  COLS,
  CORNERS,
  HOUSE,
  PLAYER_START,
  buildPellets,
  isOpenForGhost,
  isOpenForPlayer,
  wrapX,
} from "./maze";

export const DIRS = {
  up: Object.freeze({ x: 0, y: -1 }),
  down: Object.freeze({ x: 0, y: 1 }),
  left: Object.freeze({ x: -1, y: 0 }),
  right: Object.freeze({ x: 1, y: 0 }),
};
export const ZERO = Object.freeze({ x: 0, y: 0 });
const DIR_LIST = [DIRS.up, DIRS.left, DIRS.down, DIRS.right];

export function opposite(d) {
  return { x: -d.x, y: -d.y };
}
export function sameDir(a, b) {
  return a.x === b.x && a.y === b.y;
}

const SCATTER_TIME = 5;
const CHASE_TIME = 18;
export const FRIGHT_TIME = 8; // seconds enemies stay edible after a power pellet
const DEATH_TIME = 1.3;
const RESPAWN_TIME = 1.0;
const CLEAR_TIME = 1.6;
const GHOST_REVIVE_DELAY = 2.5;

const PELLET_POINTS = 10;
const POWER_POINTS = 50;
const GHOST_POINTS = 200;
const EAT_RADIUS_SQ = 0.33; // ~0.57 tiles between centers

const FRIGHT_SPEED = 3.1;
const LEAVE_SPEED = 3.2;

function playerSpeed(level) {
  return Math.min(5.5 + 0.2 * (level - 1), 6.7);
}
function ghostSpeed(level) {
  return Math.min(4.6 + 0.4 * (level - 1), 7.0);
}

// Enemy roster: four distinct personalities. `release` is seconds after the
// round starts before the ghost leaves the house; the chaser starts outside.
const GHOST_INIT = [
  { kind: "chaser", color: "#f43f5e", start: HOUSE.exit, state: "active", release: 0, homeIx: 0 },
  { kind: "ambusher", color: "#f472b6", start: HOUSE.cells[0], state: "home", release: 1.5, homeIx: 0 },
  { kind: "wanderer", color: "#38bdf8", start: HOUSE.cells[1], state: "home", release: 4.5, homeIx: 1 },
  { kind: "patrol", color: "#fb923c", start: HOUSE.cells[2], state: "home", release: 7.5, homeIx: 2 },
];

function makePlayer() {
  return {
    tx: PLAYER_START.x,
    ty: PLAYER_START.y,
    p: 0,
    dir: ZERO,
    face: DIRS.right,
  };
}

function makeGhost(init, tNow) {
  return {
    kind: init.kind,
    color: init.color,
    homeIx: init.homeIx,
    tx: init.start.x,
    ty: init.start.y,
    p: 0,
    dir: ZERO,
    state: init.state, // home | leaving | active
    releaseAt: tNow + init.release,
    frightened: false,
    pendingReverse: false,
    cornerIx: 2,
  };
}

/** Build a brand new game. `state` is "ready" (attract screen) or "respawn". */
export function freshGame(state) {
  const { pellets, powers } = buildPellets();
  return {
    state,
    stateUntil: RESPAWN_TIME,
    resumeState: "playing",
    t: 0,
    modeClock: 0,
    phase: "scatter",
    frightUntil: 0,
    frightWasActive: false,
    score: 0,
    lives: 3,
    level: 1,
    pellets,
    powers,
    player: makePlayer(),
    ghosts: GHOST_INIT.map((init) => makeGhost(init, 0)),
    nextDir: null,
    popups: [],
  };
}

function resetPositions(g) {
  g.player = makePlayer();
  g.nextDir = null;
  g.ghosts = GHOST_INIT.map((init) => makeGhost(init, g.t));
  g.frightUntil = 0;
  g.frightWasActive = false;
  g.popups = [];
}

/** Continuous position (in tile units) for rendering and collisions. */
export function posOf(actor) {
  return { x: actor.tx + actor.dir.x * actor.p, y: actor.ty + actor.dir.y * actor.p };
}

function reverseActor(actor) {
  if (actor.dir.x === 0 && actor.dir.y === 0) return;
  if (actor.p > 0) {
    actor.tx = wrapX(actor.tx + actor.dir.x);
    actor.ty += actor.dir.y;
    actor.p = 1 - actor.p;
  }
  actor.dir = opposite(actor.dir);
}

// Advances an actor along the grid. `decide` runs exactly at tile centers and
// may change actor.dir; movement stops if the chosen tile is blocked.
function stepActor(actor, dt, speed, canPass, decide) {
  let remaining = speed * dt;
  let guard = 10;
  while (remaining > 1e-9 && guard-- > 0) {
    if (actor.p === 0) {
      decide(actor);
      const d = actor.dir;
      if (d.x === 0 && d.y === 0) break;
      if (!canPass(actor, wrapX(actor.tx + d.x), actor.ty + d.y)) {
        actor.dir = ZERO;
        break;
      }
    }
    const step = Math.min(remaining, 1 - actor.p);
    actor.p += step;
    remaining -= step;
    if (actor.p >= 1 - 1e-9) {
      actor.tx = wrapX(actor.tx + actor.dir.x);
      actor.ty += actor.dir.y;
      actor.p = 0;
    }
  }
}

function passableDirs(actor, canPass) {
  return DIR_LIST.filter((d) => canPass(actor, wrapX(actor.tx + d.x), actor.ty + d.y));
}

function chooseGreedyDir(actor, target, canPass) {
  let cands = passableDirs(actor, canPass);
  if (actor.dir.x !== 0 || actor.dir.y !== 0) {
    const rev = opposite(actor.dir);
    const noRev = cands.filter((d) => !sameDir(d, rev));
    if (noRev.length > 0) cands = noRev;
  }
  if (cands.length === 0) return ZERO;
  let best = cands[0];
  let bestDist = Infinity;
  for (const d of cands) {
    const dx = actor.tx + d.x - target.x;
    const dy = actor.ty + d.y - target.y;
    const dist = dx * dx + dy * dy;
    if (dist < bestDist) {
      bestDist = dist;
      best = d;
    }
  }
  return best;
}

function chooseRandomDir(actor, canPass) {
  let cands = passableDirs(actor, canPass);
  if (actor.dir.x !== 0 || actor.dir.y !== 0) {
    const rev = opposite(actor.dir);
    const noRev = cands.filter((d) => !sameDir(d, rev));
    if (noRev.length > 0) cands = noRev;
  }
  if (cands.length === 0) return ZERO;
  return cands[Math.floor(Math.random() * cands.length)];
}

function ghostTarget(g, gh) {
  const pl = g.player;
  switch (gh.kind) {
    case "chaser":
      return g.phase === "scatter" ? CORNERS[1] : { x: pl.tx, y: pl.ty };
    case "ambusher": {
      if (g.phase === "scatter") return CORNERS[0];
      const f = pl.face || DIRS.right;
      return { x: pl.tx + f.x * 4, y: pl.ty + f.y * 4 };
    }
    case "patrol": {
      const c = CORNERS[gh.cornerIx];
      if (gh.tx === c.x && gh.ty === c.y) {
        gh.cornerIx = (gh.cornerIx + 1) % CORNERS.length;
        return CORNERS[gh.cornerIx];
      }
      return c;
    }
    default:
      return null; // wanderer roams randomly
  }
}

function decideGhost(g, gh) {
  const passLeaving = (a, x, y) => isOpenForGhost(x, y, true);
  const passActive = (a, x, y) => isOpenForGhost(x, y, false);

  if (gh.state === "leaving") {
    if (gh.tx === HOUSE.exit.x && gh.ty === HOUSE.exit.y) {
      gh.state = "active";
    } else {
      gh.dir = chooseGreedyDir(gh, HOUSE.exit, passLeaving);
      return;
    }
  }

  if (gh.pendingReverse) {
    gh.pendingReverse = false;
    if (gh.dir.x !== 0 || gh.dir.y !== 0) {
      const rev = opposite(gh.dir);
      if (passActive(gh, wrapX(gh.tx + rev.x), gh.ty + rev.y)) {
        gh.dir = rev;
        return;
      }
    }
  }

  if (gh.frightened || gh.kind === "wanderer") {
    gh.dir = chooseRandomDir(gh, passActive);
    return;
  }
  const target = ghostTarget(g, gh);
  gh.dir = target ? chooseGreedyDir(gh, target, passActive) : chooseRandomDir(gh, passActive);
}

function stepGhost(g, gh, dt) {
  if (gh.state === "home") {
    if (g.t >= gh.releaseAt) {
      gh.state = "leaving";
      gh.p = 0;
      gh.dir = ZERO;
    }
    return;
  }
  const speed =
    gh.state === "leaving" ? LEAVE_SPEED : gh.frightened ? FRIGHT_SPEED : ghostSpeed(g.level);
  stepActor(
    gh,
    dt,
    speed,
    (a, x, y) => isOpenForGhost(x, y, a.state === "leaving"),
    (a) => decideGhost(g, a),
  );
}

function frightenGhosts(g) {
  g.frightUntil = g.t + FRIGHT_TIME;
  g.frightWasActive = true;
  for (const gh of g.ghosts) {
    gh.frightened = true;
    if (gh.state === "active") gh.pendingReverse = true;
  }
}

function eatAt(g, tx, ty, fx) {
  const idx = ty * COLS + tx;
  if (!g.pellets.delete(idx)) return;
  const isPower = g.powers.delete(idx);
  g.score += isPower ? POWER_POINTS : PELLET_POINTS;
  if (isPower) {
    frightenGhosts(g);
    fx.audio?.power();
  } else {
    fx.audio?.chomp();
  }
  if (g.pellets.size === 0) {
    g.state = "levelclear";
    g.stateUntil = g.t + CLEAR_TIME;
    fx.audio?.levelUp();
    fx.submitBest(g.score);
  }
}

function stepPlayer(g, dt, fx) {
  const pl = g.player;
  stepActor(
    pl,
    dt,
    playerSpeed(g.level),
    (a, x, y) => isOpenForPlayer(x, y),
    (a) => {
      eatAt(g, a.tx, a.ty, fx);
      if (g.state !== "playing") {
        a.dir = ZERO;
        return;
      }
      const want = g.nextDir;
      if (want && !sameDir(want, a.dir) && isOpenForPlayer(a.tx + want.x, a.ty + want.y)) {
        a.dir = want;
        g.nextDir = null;
      }
    },
  );
  if (pl.dir.x !== 0 || pl.dir.y !== 0) pl.face = pl.dir;
}

function sendGhostHome(g, gh) {
  const cell = HOUSE.cells[gh.homeIx];
  gh.state = "home";
  gh.tx = cell.x;
  gh.ty = cell.y;
  gh.p = 0;
  gh.dir = ZERO;
  gh.frightened = false;
  gh.pendingReverse = false;
  gh.releaseAt = g.t + GHOST_REVIVE_DELAY;
}

function handleCollisions(g, fx) {
  const pp = posOf(g.player);
  for (const gh of g.ghosts) {
    if (gh.state === "home") continue;
    const gp = posOf(gh);
    const dx = gp.x - pp.x;
    const dy = gp.y - pp.y;
    if (dx * dx + dy * dy > EAT_RADIUS_SQ) continue;
    if (gh.frightened) {
      g.score += GHOST_POINTS;
      g.popups.push({ x: gp.x, y: gp.y, text: `+${GHOST_POINTS}`, until: g.t + 0.9 });
      fx.audio?.eatGhost();
      sendGhostHome(g, gh);
    } else {
      g.lives -= 1;
      g.state = "dying";
      g.stateUntil = g.t + DEATH_TIME;
      fx.audio?.death();
      return;
    }
  }
}

function nextLevel(g) {
  g.level += 1;
  const { pellets, powers } = buildPellets();
  g.pellets = pellets;
  g.powers = powers;
  g.modeClock = 0;
  g.phase = "scatter";
  resetPositions(g);
  g.state = "respawn";
  g.stateUntil = g.t + RESPAWN_TIME + 0.2;
}

/** Queue a turn; an exact reversal is applied immediately (feels responsive). */
export function queueDirection(g, dir) {
  if (g.state === "gameover") return;
  g.nextDir = dir;
  const pl = g.player;
  if ((pl.dir.x !== 0 || pl.dir.y !== 0) && sameDir(dir, opposite(pl.dir))) {
    reverseActor(pl);
    pl.face = pl.dir;
    g.nextDir = null;
  }
}

export function togglePause(g) {
  if (g.state === "paused") {
    g.state = g.resumeState;
  } else if (g.state === "playing" || g.state === "respawn") {
    g.resumeState = g.state;
    g.state = "paused";
  }
}

/**
 * Advance the simulation by dt seconds.
 * fx: { audio: synth-or-null, submitBest(score) }
 */
export function updateGame(g, dt, fx) {
  switch (g.state) {
    case "playing": {
      g.t += dt;
      const frightActive = g.t < g.frightUntil;
      if (!frightActive) {
        if (g.frightWasActive) {
          g.frightWasActive = false;
          for (const gh of g.ghosts) gh.frightened = false;
        }
        g.modeClock += dt;
        const phase =
          g.modeClock % (SCATTER_TIME + CHASE_TIME) < SCATTER_TIME ? "scatter" : "chase";
        if (phase !== g.phase) {
          g.phase = phase;
          for (const gh of g.ghosts) {
            if (gh.state === "active") gh.pendingReverse = true;
          }
        }
      }
      stepPlayer(g, dt, fx);
      if (g.state !== "playing") break; // level cleared mid-step
      for (const gh of g.ghosts) stepGhost(g, gh, dt);
      handleCollisions(g, fx);
      if (g.popups.length > 0) g.popups = g.popups.filter((p) => p.until > g.t);
      break;
    }
    case "dying": {
      g.t += dt;
      if (g.t >= g.stateUntil) {
        if (g.lives <= 0) {
          g.state = "gameover";
          fx.submitBest(g.score);
        } else {
          resetPositions(g);
          g.state = "respawn";
          g.stateUntil = g.t + RESPAWN_TIME;
        }
      }
      break;
    }
    case "levelclear": {
      g.t += dt;
      if (g.t >= g.stateUntil) nextLevel(g);
      break;
    }
    case "respawn": {
      g.t += dt;
      if (g.t >= g.stateUntil) g.state = "playing";
      break;
    }
    default:
      break; // ready, paused, gameover: simulation frozen
  }
}

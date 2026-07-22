"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell from "@/tools/_shared/game/GameShell";
import useBestScore from "@/tools/_shared/game/useBestScore";
import TouchControls from "../components/TouchControls";
import drawWorld from "../lib/render";
import createSoundEngine from "../lib/sounds";
import {
  BULLET,
  COLORS,
  ROCK_TIERS,
  SHIP,
  WORLD_H,
  WORLD_W,
  burst,
  makeShip,
  makeStars,
  spawnWave,
  splitRock,
  waveSpeedMul,
  wrapBody,
} from "../lib/world";

const CONSUMED_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "Space",
  "Enter",
  "KeyA",
  "KeyD",
  "KeyW",
  "KeyP",
]);

function makeReadyWorld() {
  return {
    status: "ready", // ready -> playing -> (paused via flag) -> gameover -> restart
    score: 0,
    lives: 3,
    wave: 1,
    speedMul: waveSpeedMul(1),
    ship: null,
    rocks: spawnWave(1, WORLD_W / 2, WORLD_H / 2),
    bullets: [],
    particles: [],
    stars: makeStars(90),
    banner: null,
    fireCooldown: 0,
    nextWave: 0,
    gameOverDelay: 0,
  };
}

function Overlay({ title, body, actionLabel, onAction, children }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div className="w-full max-w-xs rounded-lg border border-border bg-card/95 p-5 text-center shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {body ? <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p> : null}
        {children}
        {actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function SpaceRocksGame() {
  const canvasRef = useRef(null);
  const worldRef = useRef(null);
  const soundRef = useRef(null);
  const inputRef = useRef({ left: false, right: false, thrust: false, fire: false });
  const reducedMotionRef = useRef(false);
  const pausedRef = useRef(false);
  const soundOnRef = useRef(true);
  const bestRef = useRef(null);
  const submitBestRef = useRef(() => {});

  const [hud, setHud] = useState({ score: 0, lives: 3, wave: 1, status: "ready" });
  const [paused, setPaused] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [newBest, setNewBest] = useState(false);
  const [best, submitBest] = useBestScore("space-rocks");

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    bestRef.current = best;
  }, [best]);

  useEffect(() => {
    submitBestRef.current = submitBest;
  }, [submitBest]);

  const startGame = useCallback(() => {
    const world = worldRef.current;
    if (!world) return;
    soundRef.current?.unlock();
    world.status = "playing";
    world.score = 0;
    world.lives = 3;
    world.wave = 1;
    world.speedMul = waveSpeedMul(1);
    world.ship = makeShip();
    world.rocks = spawnWave(1, WORLD_W / 2, WORLD_H / 2);
    world.bullets = [];
    world.particles = [];
    world.banner = { text: "WAVE 1", t: 1.6 };
    world.fireCooldown = 0;
    world.nextWave = 0;
    world.gameOverDelay = 0;
    setNewBest(false);
    setPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    const world = worldRef.current;
    if (!world || world.status !== "playing") return;
    soundRef.current?.unlock();
    setPaused((value) => !value);
  }, []);

  const toggleSound = useCallback(() => {
    const next = !soundOnRef.current;
    soundOnRef.current = next;
    setSoundOn(next);
    soundRef.current?.setEnabled(next);
    if (next) soundRef.current?.unlock();
  }, []);

  const handleControl = useCallback((name, active) => {
    inputRef.current[name] = active;
    if (active) soundRef.current?.unlock();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = WORLD_W * dpr;
    canvas.height = WORLD_H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    worldRef.current = makeReadyWorld();
    const sound = createSoundEngine();
    sound.setEnabled(soundOnRef.current);
    soundRef.current = sound;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      reducedMotionRef.current = motionQuery.matches;
    };
    syncMotion();
    motionQuery.addEventListener?.("change", syncMotion);

    const clearInputs = () => {
      const input = inputRef.current;
      input.left = false;
      input.right = false;
      input.thrust = false;
      input.fire = false;
    };

    const onKeyDown = (event) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.tagName === "BUTTON" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (!CONSUMED_KEYS.has(event.code)) return;
      event.preventDefault();
      const world = worldRef.current;
      if (!world) return;
      if (!event.repeat) sound.unlock();
      const input = inputRef.current;
      if (event.code === "ArrowLeft" || event.code === "KeyA") input.left = true;
      else if (event.code === "ArrowRight" || event.code === "KeyD") input.right = true;
      else if (event.code === "ArrowUp" || event.code === "KeyW") input.thrust = true;
      else if (event.code === "KeyP") {
        if (!event.repeat && world.status === "playing") setPaused((value) => !value);
      } else if (event.code === "Space" || event.code === "Enter") {
        if (world.status === "ready" || world.status === "gameover") {
          if (!event.repeat) startGame();
        } else if (world.status === "playing") {
          if (pausedRef.current) {
            if (!event.repeat) setPaused(false);
          } else if (event.code === "Space") {
            input.fire = true;
          }
        }
      }
    };

    const onKeyUp = (event) => {
      const input = inputRef.current;
      if (event.code === "ArrowLeft" || event.code === "KeyA") input.left = false;
      else if (event.code === "ArrowRight" || event.code === "KeyD") input.right = false;
      else if (event.code === "ArrowUp" || event.code === "KeyW") input.thrust = false;
      else if (event.code === "Space") input.fire = false;
    };

    const onBlur = () => clearInputs();

    const onVisibility = () => {
      const world = worldRef.current;
      if (document.hidden && world && world.status === "playing" && !pausedRef.current) {
        clearInputs();
        setPaused(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);

    const updateDrift = (world, dt) => {
      for (const rock of world.rocks) {
        rock.x += rock.vx * dt;
        rock.y += rock.vy * dt;
        rock.rot += rock.spin * dt;
        wrapBody(rock, rock.radius);
      }
      for (let i = world.particles.length - 1; i >= 0; i -= 1) {
        const particle = world.particles[i];
        particle.life -= dt;
        if (particle.life <= 0) {
          world.particles.splice(i, 1);
          continue;
        }
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vx *= 0.99;
        particle.vy *= 0.99;
      }
    };

    const update = (dt) => {
      const world = worldRef.current;
      if (!world) return;
      const input = inputRef.current;
      const reduced = reducedMotionRef.current;
      const runningPlay = world.status === "playing" && !pausedRef.current;
      // Ready/game-over drift is decorative, so it freezes under reduced motion.
      const runningAmbient = world.status !== "playing" && !reduced;

      if (runningPlay || runningAmbient) updateDrift(world, dt);
      if (!runningPlay) return;

      if (world.banner && (world.banner.t -= dt) <= 0) world.banner = null;

      const ship = world.ship;
      if (ship) {
        if (ship.dead) {
          ship.respawn -= dt;
          if (ship.respawn <= 0 && world.lives > 0) world.ship = makeShip();
        } else {
          if (input.left) ship.a -= SHIP.turnSpeed * dt;
          if (input.right) ship.a += SHIP.turnSpeed * dt;
          ship.thrusting = input.thrust;
          if (input.thrust) {
            ship.vx += Math.cos(ship.a) * SHIP.thrust * dt;
            ship.vy += Math.sin(ship.a) * SHIP.thrust * dt;
          }
          const drag = Math.exp(-SHIP.drag * dt);
          ship.vx *= drag;
          ship.vy *= drag;
          const speed = Math.hypot(ship.vx, ship.vy);
          if (speed > SHIP.maxSpeed) {
            const scale = SHIP.maxSpeed / speed;
            ship.vx *= scale;
            ship.vy *= scale;
          }
          ship.x += ship.vx * dt;
          ship.y += ship.vy * dt;
          wrapBody(ship, SHIP.radius);
          if (ship.invuln > 0) ship.invuln -= dt;
        }
      }

      world.fireCooldown -= dt;
      const pilot = world.ship;
      if (
        input.fire &&
        pilot &&
        !pilot.dead &&
        world.fireCooldown <= 0 &&
        world.bullets.length < BULLET.maxAlive
      ) {
        const cos = Math.cos(pilot.a);
        const sin = Math.sin(pilot.a);
        world.bullets.push({
          x: pilot.x + cos * SHIP.radius,
          y: pilot.y + sin * SHIP.radius,
          vx: pilot.vx + cos * BULLET.speed,
          vy: pilot.vy + sin * BULLET.speed,
          traveled: 0,
        });
        world.fireCooldown = BULLET.cooldown;
        sound.fire();
      }

      for (let i = world.bullets.length - 1; i >= 0; i -= 1) {
        const bullet = world.bullets[i];
        bullet.x += bullet.vx * dt;
        bullet.y += bullet.vy * dt;
        bullet.traveled += Math.hypot(bullet.vx, bullet.vy) * dt;
        wrapBody(bullet, 3);
        if (bullet.traveled > BULLET.range) world.bullets.splice(i, 1);
      }

      for (let i = world.bullets.length - 1; i >= 0; i -= 1) {
        const bullet = world.bullets[i];
        for (let j = world.rocks.length - 1; j >= 0; j -= 1) {
          const rock = world.rocks[j];
          const hitRadius = rock.radius * 0.9;
          const dx = rock.x - bullet.x;
          const dy = rock.y - bullet.y;
          if (dx * dx + dy * dy > hitRadius * hitRadius) continue;
          world.bullets.splice(i, 1);
          world.rocks.splice(j, 1);
          world.rocks.push(...splitRock(rock, world.speedMul));
          world.score += ROCK_TIERS[rock.tier].points;
          if (!reduced) {
            world.particles.push(
              ...burst(rock.x, rock.y, COLORS.rocks[rock.tier], 12 - rock.tier * 3, 140),
            );
          }
          sound.explode(rock.tier);
          break;
        }
      }

      const flier = world.ship;
      if (flier && !flier.dead && flier.invuln <= 0) {
        for (const rock of world.rocks) {
          const hitRadius = rock.radius * 0.8 + SHIP.radius * 0.75;
          const dx = rock.x - flier.x;
          const dy = rock.y - flier.y;
          if (dx * dx + dy * dy > hitRadius * hitRadius) continue;
          world.lives -= 1;
          sound.shipHit();
          if (!reduced) {
            world.particles.push(...burst(flier.x, flier.y, COLORS.ship, 20, 170));
          }
          flier.dead = true;
          flier.respawn = SHIP.respawnDelay;
          flier.thrusting = false;
          if (world.lives <= 0) world.gameOverDelay = 1;
          break;
        }
      }

      if (world.gameOverDelay > 0) {
        world.gameOverDelay -= dt;
        if (world.gameOverDelay <= 0) world.status = "gameover";
      }

      if (world.rocks.length === 0 && world.status === "playing") {
        if (world.nextWave <= 0) {
          world.nextWave = 1.4;
          world.banner = { text: `WAVE ${world.wave} CLEAR`, t: 1.3 };
          sound.waveClear();
        } else {
          world.nextWave -= dt;
          if (world.nextWave <= 0) {
            world.wave += 1;
            world.speedMul = waveSpeedMul(world.wave);
            const cx = world.ship && !world.ship.dead ? world.ship.x : WORLD_W / 2;
            const cy = world.ship && !world.ship.dead ? world.ship.y : WORLD_H / 2;
            world.rocks = spawnWave(world.wave, cx, cy);
            world.banner = { text: `WAVE ${world.wave}`, t: 1.6 };
            world.nextWave = 0;
          }
        }
      }
    };

    const lastHud = { score: -1, lives: -1, wave: -1, status: "" };
    const syncHud = () => {
      const world = worldRef.current;
      if (!world) return;
      if (
        world.score === lastHud.score &&
        world.lives === lastHud.lives &&
        world.wave === lastHud.wave &&
        world.status === lastHud.status
      ) {
        return;
      }
      if (world.status === "gameover" && lastHud.status !== "gameover") {
        const previousBest = bestRef.current;
        if (world.score > 0 && (previousBest === null || world.score > previousBest)) {
          setNewBest(true);
        }
        submitBestRef.current(world.score);
      }
      lastHud.score = world.score;
      lastHud.lives = world.lives;
      lastHud.wave = world.wave;
      lastHud.status = world.status;
      setHud({
        score: world.score,
        lives: world.lives,
        wave: world.wave,
        status: world.status,
      });
    };

    let raf = 0;
    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      update(dt);
      drawWorld(ctx, worldRef.current, {
        reducedMotion: reducedMotionRef.current,
        now,
      });
      syncHud();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery.removeEventListener?.("change", syncMotion);
      sound.dispose();
      soundRef.current = null;
    };
  }, [startGame]);

  const bestShown = Math.max(best ?? 0, hud.score);

  return (
    <GameShell
      title="Space Rocks"
      stats={[
        { label: "Score", value: hud.score },
        { label: "Best", value: bestShown },
        { label: "Wave", value: hud.wave },
        { label: "Lives", value: hud.lives },
      ]}
      onRestart={startGame}
      paused={paused}
      onTogglePause={togglePause}
      soundOn={soundOn}
      onToggleSound={toggleSound}
      help="Rotate with Left/Right or A/D, thrust with Up or W, fire with Space. P pauses. On touch screens use the on-screen pads. Big rocks split into smaller, faster ones — clear every rock to advance the wave."
    >
      <div className="flex flex-col gap-3">
        <div className="relative overflow-hidden rounded-lg border border-border">
          <canvas
            ref={canvasRef}
            className="block h-auto w-full"
            role="img"
            aria-label="Space Rocks play area"
          />

          {hud.status === "ready" ? (
            <Overlay
              title="Space Rocks"
              body="Pilot your ship through a drifting rock field. Big rocks split when hit — clear the field to reach the next, faster wave."
              actionLabel="Start"
              onAction={startGame}
            />
          ) : null}

          {hud.status === "playing" && paused ? (
            <Overlay
              title="Paused"
              body="Take a breath. The rocks will wait."
              actionLabel="Resume"
              onAction={togglePause}
            />
          ) : null}

          {hud.status === "gameover" ? (
            <Overlay
              title="Game over"
              body={`You scored ${hud.score} and reached wave ${hud.wave}.`}
              actionLabel="Play again"
              onAction={startGame}
            >
              {newBest ? (
                <p className="mt-2 text-sm font-semibold text-primary">New best score!</p>
              ) : null}
            </Overlay>
          ) : null}
        </div>

        <TouchControls onControl={handleControl} />
      </div>
    </GameShell>
  );
}

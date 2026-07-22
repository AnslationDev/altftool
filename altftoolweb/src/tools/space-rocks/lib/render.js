// Canvas renderer for Space Rocks. All art is stroked geometric paths in the
// fixed game palette on a deep-space background painted by the game itself.

import { COLORS, SHIP, TAU, WORLD_H, WORLD_W } from "./world";

function drawShip(ctx, ship) {
  const r = SHIP.radius;
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.a);

  if (ship.thrusting) {
    ctx.strokeStyle = COLORS.flame;
    ctx.lineWidth = 1.8;
    const len = r * (1.1 + Math.random() * 0.5);
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, r * 0.35);
    ctx.lineTo(-len, 0);
    ctx.lineTo(-r * 0.55, -r * 0.35);
    ctx.stroke();
  }

  ctx.strokeStyle = COLORS.ship;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(-r * 0.8, r * 0.7);
  ctx.lineTo(-r * 0.4, 0);
  ctx.lineTo(-r * 0.8, -r * 0.7);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

export default function drawWorld(ctx, world, { reducedMotion, now }) {
  if (!world) return;

  const gradient = ctx.createLinearGradient(0, 0, 0, WORLD_H);
  gradient.addColorStop(0, COLORS.bgTop);
  gradient.addColorStop(1, COLORS.bgBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);

  ctx.fillStyle = COLORS.star;
  for (const star of world.stars) {
    const twinkle = reducedMotion ? 0.7 : 0.5 + 0.35 * Math.sin(now / 900 + star.phase);
    ctx.globalAlpha = Math.max(0.1, twinkle * star.bright);
    ctx.fillRect(star.x, star.y, star.size, star.size);
  }
  ctx.globalAlpha = 1;

  for (const rock of world.rocks) {
    ctx.save();
    ctx.translate(rock.x, rock.y);
    ctx.rotate(rock.rot);
    ctx.strokeStyle = COLORS.rocks[rock.tier];
    ctx.lineWidth = rock.tier === 2 ? 1.5 : 2;
    ctx.beginPath();
    for (let i = 0; i < rock.shape.length; i += 1) {
      const vertex = rock.shape[i];
      const px = Math.cos(vertex.a) * rock.radius * vertex.m;
      const py = Math.sin(vertex.a) * rock.radius * vertex.m;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = COLORS.bullet;
  for (const bullet of world.bullets) {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 2.4, 0, TAU);
    ctx.fill();
  }

  for (const particle of world.particles) {
    ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    ctx.fillStyle = particle.color;
    ctx.fillRect(
      particle.x - particle.size / 2,
      particle.y - particle.size / 2,
      particle.size,
      particle.size,
    );
  }
  ctx.globalAlpha = 1;

  const ship = world.ship;
  if (ship && !ship.dead && world.status === "playing") {
    // Spawn invulnerability: blink normally; show a steady shield ring instead
    // when the player prefers reduced motion (no flashing).
    const blinkOn =
      ship.invuln <= 0 || reducedMotion || Math.floor(now / 130) % 2 === 0;
    if (blinkOn) drawShip(ctx, ship);
    if (ship.invuln > 0 && reducedMotion) {
      ctx.strokeStyle = COLORS.shield;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(ship.x, ship.y, SHIP.radius * 1.9, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  if (world.banner) {
    ctx.fillStyle = COLORS.banner;
    ctx.globalAlpha = Math.min(1, world.banner.t / 0.35);
    ctx.font = "700 26px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(world.banner.text, WORLD_W / 2, WORLD_H / 2 - 90);
    ctx.globalAlpha = 1;
  }
}

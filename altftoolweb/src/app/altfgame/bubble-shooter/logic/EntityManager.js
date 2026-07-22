import {
    SHOOTER_SPEED,
    BUBBLE_RADIUS,
    GAME_WIDTH,
    GAME_HEIGHT,
    POINTS_PER_POP,
    POINTS_PER_DROP
} from "./constants";
import { GridSystem } from "./GridSystem";

export class EntityManager {
    constructor() {
        this.grid = new GridSystem();
        this.reset();
    }

    reset() {
        this.shooter = { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 40 };
        this.projectile = null;
        this.current = this.grid.randomColor();
        this.next = this.grid.randomColor();
    }

    shoot(angle) {
        if (this.projectile) return;
        this.projectile = {
            x: this.shooter.x,
            y: this.shooter.y,
            vx: Math.cos(angle) * SHOOTER_SPEED,
            vy: Math.sin(angle) * SHOOTER_SPEED,
            color: this.current
        };
        this.current = this.next;
        this.next = this.grid.randomColor();
    }

    update() {
        let points = 0, win = false, gameOver = false;
        const p = this.projectile;
        if (!p) return { points, win, gameOver };

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < BUBBLE_RADIUS || p.x > GAME_WIDTH - BUBBLE_RADIUS) {
            p.vx *= -1;
        }

        if (p.y < BUBBLE_RADIUS || this.grid.checkCollision(p)) {
            const slot = this.grid.snap(p.x, p.y);
            if (!slot) return { points, win, gameOver: true };

            this.grid.grid[slot.r][slot.c] = { color: p.color };
            this.grid.updatePositions();

            const matches = this.grid.flood(slot.r, slot.c, p.color);
            if (matches.length >= 3) {
                this.grid.remove(matches);
                points += matches.length * POINTS_PER_POP;
                const floating = this.grid.floating();
                this.grid.remove(floating);
                points += floating.length * POINTS_PER_DROP;
            }

            win = this.grid.win();
            gameOver = this.grid.lose();
            this.projectile = null;
        }

        return { points, win, gameOver };
    }
}

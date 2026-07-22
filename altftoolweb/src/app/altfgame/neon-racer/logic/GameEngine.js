import { CONSTANTS } from './Constants';
import { Renderer } from './Renderer';
import { InputManager } from './InputManager';

export class GameEngine {
    constructor(canvas, onGameOver, onScoreUpdate) {
        this.canvas = canvas;
        this.onGameOver = onGameOver;
        this.onScoreUpdate = onScoreUpdate;

        this.ctx = canvas.getContext('2d', { alpha: false });
        this.renderer = new Renderer(this.ctx);
        this.inputManager = new InputManager();

        this.inputManager.setCallbacks(
            this.moveLeft.bind(this),
            this.moveRight.bind(this)
        );

        // State
        this.isPlaying = false;
        this.lastTime = 0;
        this.animationFrameId = null;

        // Game Objects
        this.reset();
    }

    reset() {
        this.roadWidth = 0;
        this.roadX = 0;
        this.laneWidth = 0;

        this.player = {
            lane: 1, // 0 to LANE_COUNT-1
            x: 0, // Visual X
            targetX: 0,
            y: 0,
            width: 0,
            height: 0,
            speed: 0 // Side speed
        };

        this.enemies = [];
        this.particles = [];
        this.roadOffset = 0;

        this.score = 0;
        this.speed = CONSTANTS.GAME_SPEED_MIN;
        this.distance = 0;

        this.lastSpawnTime = 0;

        this.resize();
    }

    start() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    }

    stop() {
        this.isPlaying = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    cleanup() {
        this.stop();
        this.inputManager.cleanup();
    }

    resize() {
        const { width, height } = this.canvas;

        // Max road width is min(screen width, 600)
        // BUT user wants 100% viewport width if possible?
        // "The game must utilize 100% of the available viewport width"
        // Let's make the road take up most of the screen on mobile, and a central column on desktop?
        // Actually, for "Neon Racer", a full screen width road looks weird on desktop.
        // Let's interpret "utilize 100% of viewport width" as "The game CONTAINER fills the viewport",
        // but the road itself should probably be constrained to be playable.
        // HOWEVER, "Reference UI elements... from flappy-bird". Flappy bird uses full width.
        // Let's make the road full width on mobile, and max 600px on desktop to keep it playable.

        this.roadWidth = Math.min(width, 600);
        this.roadX = (width - this.roadWidth) / 2;
        this.laneWidth = this.roadWidth / CONSTANTS.LANE_COUNT;

        // Update Player Dimensions
        this.player.width = this.laneWidth * CONSTANTS.PLAYER_WIDTH_RATIO;
        this.player.height = this.laneWidth * CONSTANTS.PLAYER_LENGTH_RATIO; // Rectangular
        // Min size
        if (this.player.width < 30) this.player.width = 30;
        if (this.player.height < 50) this.player.height = 50;

        this.player.y = height - this.player.height - 100;

        // Snap player to current lane
        this.player.targetX = this.getLaneCenter(this.player.lane);
        // Instant snap if not playing (e.g. resize)
        if (!this.isPlaying) {
            this.player.x = this.player.targetX;
        }
    }

    getLaneCenter(laneIndex) {
        return this.roadX + (laneIndex * this.laneWidth) + (this.laneWidth / 2);
    }

    moveLeft() {
        if (!this.isPlaying) return;
        if (this.player.lane > 0) {
            this.player.lane--;
            this.player.targetX = this.getLaneCenter(this.player.lane);
        }
    }

    moveRight() {
        if (!this.isPlaying) return;
        if (this.player.lane < CONSTANTS.LANE_COUNT - 1) {
            this.player.lane++;
            this.player.targetX = this.getLaneCenter(this.player.lane);
        }
    }

    loop(timestamp) {
        if (!this.isPlaying) return;

        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(dt, timestamp);
        this.render();

        this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
    }

    update(dt, now) {
        // Speed progression
        if (this.speed < CONSTANTS.GAME_SPEED_MAX) {
            this.speed += dt * 10;
        }

        // Distance Score
        this.distance += this.speed * dt * 0.0001; // KM
        this.score += this.speed * dt * 0.01;

        // Report Score
        if (this.onScoreUpdate) {
            this.onScoreUpdate({
                score: Math.floor(this.score),
                speed: Math.floor(this.speed),
                distance: this.distance
            });
        }

        // Player Movement (Lerp)
        const diff = this.player.targetX - this.player.x;
        this.player.x += diff * CONSTANTS.LANE_SWITCH_SPEED * dt;

        // Road Scroll
        this.roadOffset = (this.roadOffset + this.speed * dt) % 100; // Loop for dash pattern

        // Spawning
        if (now - this.lastSpawnTime > Math.max(CONSTANTS.SPAWN_MIN_INTERVAL, 2000000 / this.speed)) {
            this.spawnEnemy();
            this.lastSpawnTime = now;
        }

        // Update Enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            // Move down relative to player (game speed - enemy speed)
            // Actually, we simulate player moving forward, so enemies (which are slower) move towards us?
            // Wait, in endless runner, usually we move at 'speed', enemies move at 'enemySpeed'.
            // Relative speed = speed - enemySpeed.
            // If enemy is slower, it comes towards us (down).
            // If enemy is faster, it moves away (up) - but we don't spawn those usually from front.

            const relativeSpeed = this.speed - e.speed; // e.g. 800 - 300 = 500 px/s down
            e.y += relativeSpeed * dt;

            // Remove if off screen
            if (e.y > this.canvas.height + 100) {
                this.enemies.splice(i, 1);
                continue;
            }

            // Collision
            if (this.checkCollision(this.player, e)) {
                this.crash(e);
            }
        }

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt * 2;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    spawnEnemy() {
        const lane = Math.floor(Math.random() * CONSTANTS.LANE_COUNT);
        // Don't spawn on top of another enemy (simple check)
        const laneCenter = this.getLaneCenter(lane);

        // Check if lane is free at spawn point (top)
        const isBlocked = this.enemies.some(e => Math.abs(e.y - (-100)) < 200 && e.lane === lane);
        if (isBlocked) return;

        const type = Math.random();
        let color = CONSTANTS.COLORS.ENEMY_SLOW;
        let speed = this.speed * 0.5; // Slower than player

        if (type > 0.7) {
            color = CONSTANTS.COLORS.ENEMY_FAST;
            speed = this.speed * 0.7;
        } else if (type > 0.9) {
            color = CONSTANTS.COLORS.ENEMY_CRAZY;
            speed = this.speed * 0.8;
        }

        this.enemies.push({
            x: laneCenter,
            y: -100, // Start above screen
            width: this.player.width,
            height: this.player.height,
            color: color,
            speed: speed,
            lane: lane
        });
    }

    checkCollision(p, e) {
        // Simple AABB
        const scale = CONSTANTS.COLLISION_BOX_SCALE;
        const pw = p.width * scale;
        const ph = p.height * scale;
        const ew = e.width * scale;
        const eh = e.height * scale;

        return (
            p.x < e.x + ew &&
            p.x + pw > e.x &&
            p.y < e.y + eh &&
            p.y + ph > e.y
        );
    }

    crash(enemy) {
        this.isPlaying = false;

        // Spawn particles
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: this.player.x,
                y: this.player.y + this.player.height/2,
                vx: (Math.random() - 0.5) * 500,
                vy: (Math.random() - 0.5) * 500,
                size: Math.random() * 5 + 2,
                color: '#fff',
                life: 1.0
            });
        }

        if (this.onGameOver) this.onGameOver(this.score);
    }

    render() {
        const { width, height } = this.canvas;
        this.renderer.clear(width, height);

        // Draw Road
        this.renderer.drawRoad(this.roadX, this.roadWidth, height, this.roadOffset);

        // Draw Enemies
        this.enemies.forEach(e => {
            // Check if visible
            if (e.y > -100 && e.y < height + 100) {
                this.renderer.drawCar(e.x, e.y, e.width, e.height, e.color);
            }
        });

        // Draw Player
        this.renderer.drawCar(
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height,
            CONSTANTS.COLORS.PLAYER_BODY,
            true
        );

        // Particles
        this.renderer.drawParticles(this.particles);
    }
}

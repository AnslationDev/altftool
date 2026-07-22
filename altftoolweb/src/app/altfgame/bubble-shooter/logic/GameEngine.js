import { GAME_WIDTH, GAME_HEIGHT } from './constants';
import { EntityManager } from './EntityManager';
import { Renderer } from './Renderer';

export class GameEngine {
    constructor(canvas, onEnd, onScore) {
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;

        this.manager = new EntityManager();
        this.renderer = new Renderer(canvas);

        this.onEnd = onEnd;
        this.onScore = onScore;
        this.score = 0;
        this.aim = null;
        this.running = false;

        canvas.onmousemove = e => this.aim = this.getPos(canvas, e);
        canvas.onclick = () => {
            if (!this.aim) return;
            const dx = this.aim.x - this.manager.shooter.x;
            const dy = this.aim.y - this.manager.shooter.y;
            let angle = Math.atan2(dy, dx);
            angle = Math.max(-Math.PI + 0.2, Math.min(-0.2, angle));
            this.manager.shoot(angle);
        };
    }

    start() {
        this.running = true;
        const loop = () => {
            if (!this.running) return;
            const res = this.manager.update();
            if (res.points) {
                this.score += res.points;
                this.onScore(this.score);
            }
            if (res.win || res.gameOver) {
                this.running = false;
                this.onEnd(this.score, res.win);
                return;
            }
            this.renderer.draw(this.manager, this.aim);
            requestAnimationFrame(loop);
        };
        loop();
    }

    stop() {
        this.running = false;
    }

    getPos(canvas, e) {
        const r = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - r.left) * (canvas.width / r.width),
            y: (e.clientY - r.top) * (canvas.height / r.height)
        };
    }
}

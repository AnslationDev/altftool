import { CONSTANTS } from './Constants';

export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
    }

    clear(width, height) {
        // Clear with background color
        this.ctx.fillStyle = CONSTANTS.COLORS.ROAD_BG;
        this.ctx.fillRect(0, 0, width, height);
    }

    drawRoad(x, width, height, offset) {
        // Road card is already cleared bg, but we can darken it if needed
        // Draw Lanes
        const laneWidth = width / CONSTANTS.LANE_COUNT;

        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = CONSTANTS.COLORS.LANE_LINE;
        this.ctx.setLineDash([40, 60]);
        this.ctx.lineDashOffset = -offset;

        for (let i = 1; i < CONSTANTS.LANE_COUNT; i++) {
            const lx = x + (i * laneWidth);
            this.ctx.beginPath();
            this.ctx.moveTo(lx, 0);
            this.ctx.lineTo(lx, height);
            this.ctx.stroke();
        }

        this.ctx.setLineDash([]);

        // Draw Borders
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = CONSTANTS.COLORS.PLAYER_GLOW; // Neon borders
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = CONSTANTS.COLORS.PLAYER_GLOW;

        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, height);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(x + width, 0);
        this.ctx.lineTo(x + width, height);
        this.ctx.stroke();

        this.ctx.shadowBlur = 0;
    }

    drawCar(x, y, w, h, color, isPlayer = false) {
        this.ctx.save();

        if (isPlayer) {
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = color;
        }

        // Body
        this.ctx.fillStyle = color;
        // Rounded rect for car
        this.ctx.beginPath();
        this.ctx.roundRect(x - w/2, y, w, h, 8);
        this.ctx.fill();

        // Roof / Windshield
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.beginPath();
        this.ctx.roundRect(x - w/2 + 4, y + h * 0.2, w - 8, h * 0.3, 4);
        this.ctx.fill();

        // Lights
        if (isPlayer) {
            // Headlights
            this.ctx.fillStyle = '#fff';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#fff';
            this.ctx.fillRect(x - w/2 + 2, y + 2, 4, 4);
            this.ctx.fillRect(x + w/2 - 6, y + 2, 4, 4);
        } else {
            // Taillights
            this.ctx.fillStyle = '#ff0000';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#ff0000';
            this.ctx.fillRect(x - w/2 + 2, y + h - 6, 4, 4);
            this.ctx.fillRect(x + w/2 - 6, y + h - 6, 4, 4);
        }

        this.ctx.restore();
    }

    drawParticles(particles) {
        particles.forEach(p => {
            this.ctx.save();
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
            this.ctx.restore();
        });
    }
}

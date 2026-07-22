import { GAME_WIDTH, GAME_HEIGHT, BUBBLE_RADIUS } from "./constants";

export class Renderer {
    constructor(canvas) {
        this.ctx = canvas.getContext("2d");
    }

    draw(manager, aim) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        manager.grid.grid.forEach(row =>
            row.forEach(b => b && this.circle(b.x, b.y, b.color))
        );

        if (manager.projectile) {
            this.circle(
                manager.projectile.x,
                manager.projectile.y,
                manager.projectile.color
            );
        } else {
            this.circle(
                manager.shooter.x,
                manager.shooter.y,
                manager.current
            );
        }

        if (aim && !manager.projectile) {
            this.guideline(manager.shooter, aim);
        }
    }

    circle(x, y, color) {
        const ctx = this.ctx;
        const r = BUBBLE_RADIUS - 1; // Slight gap for visual separation

        // Shadow/Glow
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);

        // 3D Gradient for Glassy/Neon look
        const grad = ctx.createRadialGradient(x - r / 3, y - r / 3, r / 5, x, y, r);
        grad.addColorStop(0, '#ffffff');       // Specular highlight
        grad.addColorStop(0.3, color);         // Main body
        grad.addColorStop(1, this.darken(color, 40)); // Darker edge

        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();

        // Inner shine reflection
        ctx.save();
        ctx.beginPath();
        ctx.arc(x - r / 3, y - r / 3, r / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
        ctx.restore();
    }

    guideline(start, end) {
        const ctx = this.ctx;
        ctx.save();

        // Laser effect
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 6]);

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Faint outer glow
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
        ctx.lineWidth = 4;
        ctx.setLineDash([]);
        ctx.stroke();

        ctx.restore();
    }

    // Helper for darker edges without external libs
    darken(color, amount) {
        let usePound = false;
        if (color[0] === "#") {
            color = color.slice(1);
            usePound = true;
        }
        let num = parseInt(color, 16);
        let r = (num >> 16) + amount * -1;
        let b = ((num >> 8) & 0x00FF) + amount * -1;
        let g = (num & 0x0000FF) + amount * -1;
        if (r > 255) r = 255; else if (r < 0) r = 0;
        if (b > 255) b = 255; else if (b < 0) b = 0;
        if (g > 255) g = 255; else if (g < 0) g = 0;
        return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
    }
}

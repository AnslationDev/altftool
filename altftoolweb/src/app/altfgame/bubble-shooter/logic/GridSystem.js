import {
    GRID_ROWS,
    GRID_COLS,
    BUBBLE_RADIUS,
    BUBBLE_COLORS
} from "./constants";

export class GridSystem {
    constructor() {
        this.rows = GRID_ROWS;
        this.cols = GRID_COLS;
        this.radius = BUBBLE_RADIUS;
        this.grid = [];
        this.init();
    }

    init() {
        this.grid = Array.from({ length: this.rows }, (_, r) =>
            Array.from({ length: this.cols }, () =>
                r < 5 ? { color: this.randomColor(), x: 0, y: 0 } : null
            )
        );
        this.updatePositions();
    }

    randomColor() {
        return BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
    }

    updatePositions() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const b = this.grid[r][c];
                if (!b) continue;
                const offset = r % 2 ? this.radius : 0;
                b.x = c * this.radius * 2 + this.radius + offset;
                b.y = r * this.radius * Math.sqrt(3) + this.radius;
            }
        }
    }

    checkCollision(p) {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const b = this.grid[r][c];
                if (!b) continue;
                if (Math.hypot(p.x - b.x, p.y - b.y) < this.radius * 2 - 2) {
                    return true;
                }
            }
        }
        return false;
    }

    snap(x, y) {
        let best = null;
        let min = Infinity;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c]) continue;
                const offset = r % 2 ? this.radius : 0;
                const cx = c * this.radius * 2 + this.radius + offset;
                const cy = r * this.radius * Math.sqrt(3) + this.radius;
                const d = Math.hypot(x - cx, y - cy);
                if (d < min) {
                    min = d;
                    best = { r, c };
                }
            }
        }
        return best;
    }

    neighbors(r, c) {
        const even = r % 2 === 0;
        const dirs = even
            ? [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]]
            : [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];
        return dirs
            .map(([dr, dc]) => ({ r: r + dr, c: c + dc }))
            .filter(n => n.r >= 0 && n.c >= 0 && n.r < this.rows && n.c < this.cols);
    }

    flood(r, c, color, visited = new Set()) {
        const key = `${r},${c}`;
        if (visited.has(key)) return [];
        visited.add(key);

        const b = this.grid[r][c];
        if (!b || b.color !== color) return [];

        let res = [{ r, c }];
        this.neighbors(r, c).forEach(n => {
            res = res.concat(this.flood(n.r, n.c, color, visited));
        });
        return res;
    }

    remove(list) {
        list.forEach(({ r, c }) => (this.grid[r][c] = null));
    }

    floating() {
        const visited = new Set();
        const stack = [];

        for (let c = 0; c < this.cols; c++) {
            if (this.grid[0][c]) stack.push({ r: 0, c });
        }

        while (stack.length) {
            const cur = stack.pop();
            const key = `${cur.r},${cur.c}`;
            if (visited.has(key)) continue;
            visited.add(key);
            this.neighbors(cur.r, cur.c)
                .filter(n => this.grid[n.r][n.c])
                .forEach(n => stack.push(n));
        }

        const floating = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] && !visited.has(`${r},${c}`)) {
                    floating.push({ r, c });
                }
            }
        }
        return floating;
    }

    win() {
        return this.grid.flat().every(b => !b);
    }

    lose() {
        return this.grid[this.rows - 1].some(b => b);
    }
}

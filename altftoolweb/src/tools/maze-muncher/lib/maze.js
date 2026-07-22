// Original hand-designed 19x21 maze for Maze Muncher.
// Legend: '#' wall, '.' pellet, 'o' power pellet, ' ' open path (no pellet),
// '-' ghost-house door (ghosts only), 'P' player start.
// Row 9 is the wrap-around tunnel row; the 3-cell ghost house sits at its center.

export const COLS = 19;
export const ROWS = 21;

const MAP = [
  "###################",
  "#........#........#",
  "#o##.###.#.###.##o#",
  "#.................#",
  "#.##.#.#####.#.##.#",
  "#....#...#...#....#",
  "####.###.#.###.####",
  "####.#.......#.####",
  "####.#.##-##.#.####",
  "    .#.#   #.#.    ",
  "####.#.#####.#.####",
  "####.#.......#.####",
  "####.#.#####.#.####",
  "#....#...#...#....#",
  "#.##.###.#.###.##.#",
  "#o.......P.......o#",
  "#.##.#.#####.#.##.#",
  "#....#...#...#....#",
  "#.######.#.######.#",
  "#.................#",
  "###################",
];

export const T_OPEN = 0;
export const T_WALL = 1;
export const T_DOOR = 2;

// Static wall grid, parsed once from the map strings (pure computation).
export const WALLS = MAP.map((row) =>
  Array.from({ length: COLS }, (_, x) => {
    const ch = row[x] ?? "#";
    if (ch === "#") return T_WALL;
    if (ch === "-") return T_DOOR;
    return T_OPEN;
  }),
);

export const PLAYER_START = (() => {
  for (let y = 0; y < ROWS; y += 1) {
    const x = MAP[y].indexOf("P");
    if (x !== -1) return { x, y };
  }
  return { x: 9, y: 15 };
})();

export const HOUSE = {
  exit: { x: 9, y: 7 },
  door: { x: 9, y: 8 },
  cells: [
    { x: 9, y: 9 },
    { x: 8, y: 9 },
    { x: 10, y: 9 },
  ],
};

// Patrol waypoints / scatter corners (all open path tiles).
export const CORNERS = [
  { x: 1, y: 1 },
  { x: 17, y: 1 },
  { x: 17, y: 19 },
  { x: 1, y: 19 },
];

export function wrapX(x) {
  return ((x % COLS) + COLS) % COLS;
}

/** Fresh pellet layout for a new game or level. */
export function buildPellets() {
  const pellets = new Set();
  const powers = new Set();
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const ch = MAP[y][x];
      if (ch === "." || ch === "o") {
        const idx = y * COLS + x;
        pellets.add(idx);
        if (ch === "o") powers.add(idx);
      }
    }
  }
  return { pellets, powers };
}

export function isOpenForPlayer(x, y) {
  if (y < 0 || y >= ROWS) return false;
  return WALLS[y][wrapX(x)] === T_OPEN;
}

export function isOpenForGhost(x, y, throughDoor) {
  if (y < 0 || y >= ROWS) return false;
  const t = WALLS[y][wrapX(x)];
  return t === T_OPEN || (throughDoor && t === T_DOOR);
}

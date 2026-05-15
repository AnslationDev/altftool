export const PRESETS = {
  zebra: {
    label: "Zebra Stripes",
    feed: 0.0367,
    kill: 0.0649,
    diffA: 1,
    diffB: 0.5,
    seed: "bands",
  },
  spots: {
    label: "Leopard Spots",
    feed: 0.055,
    kill: 0.062,
    diffA: 1,
    diffB: 0.5,
    seed: "spots",
  },
  coral: {
    label: "Coral Growth",
    feed: 0.0545,
    kill: 0.062,
    diffA: 1,
    diffB: 0.45,
    seed: "center",
  },
  maze: {
    label: "Maze",
    feed: 0.029,
    kill: 0.057,
    diffA: 1,
    diffB: 0.5,
    seed: "noise",
  },
};

export function createGrid(width, height, seed = "bands") {
  const size = width * height;
  const a = new Float32Array(size);
  const b = new Float32Array(size);
  a.fill(1);

  if (seed === "bands") seedBands(a, b, width, height);
  if (seed === "spots") seedSpots(a, b, width, height);
  if (seed === "center") seedCenter(a, b, width, height);
  if (seed === "noise") seedNoise(a, b, width, height);

  return { a, b };
}

export function stepReaction(grid, width, height, settings) {
  const nextA = new Float32Array(grid.a.length);
  const nextB = new Float32Array(grid.b.length);
  const { feed, kill, diffA, diffB } = settings;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const a = grid.a[i];
      const b = grid.b[i];
      const reaction = a * b * b;
      const updatedA = a + diffA * laplace(grid.a, x, y, width, height) - reaction + feed * (1 - a);
      const updatedB = b + diffB * laplace(grid.b, x, y, width, height) + reaction - (kill + feed) * b;

      nextA[i] = clamp(updatedA);
      nextB[i] = clamp(updatedB);
    }
  }

  grid.a = nextA;
  grid.b = nextB;
  return grid;
}

export function addChemical(grid, width, height, cx, cy, radius = 7) {
  const r2 = radius * radius;
  for (let y = Math.max(1, cy - radius); y < Math.min(height - 1, cy + radius); y++) {
    for (let x = Math.max(1, cx - radius); x < Math.min(width - 1, cx + radius); x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) {
        const i = y * width + x;
        grid.a[i] = 0.2;
        grid.b[i] = 1;
      }
    }
  }
}

export function getPatternStats(grid) {
  if (!grid) return { coverage: 0, intensity: 0 };
  let active = 0;
  let sum = 0;

  for (let i = 0; i < grid.b.length; i++) {
    const b = grid.b[i];
    sum += b;
    if (b > 0.18) active += 1;
  }

  return {
    coverage: Math.round((active / grid.b.length) * 100),
    intensity: Math.round((sum / grid.b.length) * 100),
  };
}

function laplace(field, x, y, width, height) {
  const xm = x > 0 ? x - 1 : x;
  const xp = x < width - 1 ? x + 1 : x;
  const ym = y > 0 ? y - 1 : y;
  const yp = y < height - 1 ? y + 1 : y;
  const i = y * width + x;

  return (
    field[i] * -1 +
    field[y * width + xm] * 0.2 +
    field[y * width + xp] * 0.2 +
    field[ym * width + x] * 0.2 +
    field[yp * width + x] * 0.2 +
    field[ym * width + xm] * 0.05 +
    field[ym * width + xp] * 0.05 +
    field[yp * width + xm] * 0.05 +
    field[yp * width + xp] * 0.05
  );
}

function seedBands(a, b, width, height) {
  const centerY = Math.floor(height / 2);
  for (let y = 10; y < height - 10; y += 12) {
    for (let x = 12; x < width - 12; x++) {
      if (Math.abs(y - centerY) < height * 0.36 && Math.sin(x * 0.22 + y * 0.18) > 0.15) {
        setSeed(a, b, width, height, x, y, 2);
      }
    }
  }
}

function seedSpots(a, b, width, height) {
  for (let y = 16; y < height - 16; y += 18) {
    for (let x = 16; x < width - 16; x += 18) {
      setSeed(a, b, width, height, x + Math.round(Math.random() * 6 - 3), y + Math.round(Math.random() * 6 - 3), 5);
    }
  }
}

function seedCenter(a, b, width, height) {
  setSeed(a, b, width, height, Math.floor(width / 2), Math.floor(height / 2), Math.min(width, height) * 0.11);
}

function seedNoise(a, b, width, height) {
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      if (Math.random() > 0.965) setSeed(a, b, width, height, x, y, 2);
    }
  }
}

function setSeed(a, b, width, height, cx, cy, radius) {
  const r = Math.max(1, Math.round(radius));
  const r2 = r * r;

  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) {
        const i = y * width + x;
        if (i >= 0 && i < a.length) {
          a[i] = 0.25;
          b[i] = 1;
        }
      }
    }
  }
}

function clamp(value) {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

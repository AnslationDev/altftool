export const PATTERNS = {
  flower: {
    label: "Flower of Life",
    helper: "Hexagonal circle lattice with shared-radius geometry.",
  },
  sriYantra: {
    label: "Sri Yantra",
    helper: "Interlocking upward and downward triangles around a bindu.",
  },
  metatron: {
    label: "Metatron Cube",
    helper: "Thirteen-circle fruit pattern connected by straight chords.",
  },
};

export const PALETTES = {
  solar: {
    label: "Solar Gold",
    background: "#fff7ed",
    primary: "#b45309",
    secondary: "#0891b2",
    accent: "#7c3aed",
  },
  temple: {
    label: "Temple Rose",
    background: "#fff1f2",
    primary: "#be123c",
    secondary: "#0f766e",
    accent: "#ca8a04",
  },
  cosmic: {
    label: "Cosmic Ink",
    background: "#09111f",
    primary: "#f59e0b",
    secondary: "#22d3ee",
    accent: "#f472b6",
  },
  lotus: {
    label: "Lotus Mist",
    background: "#f8fafc",
    primary: "#0f766e",
    secondary: "#c2410c",
    accent: "#4f46e5",
  },
};

export function createFlowerCircles(rings, spacing) {
  const circles = [];
  for (let q = -rings; q <= rings; q += 1) {
    for (let r = -rings; r <= rings; r += 1) {
      const s = -q - r;
      if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) <= rings) {
        circles.push({
          cx: spacing * (q + r / 2),
          cy: spacing * (Math.sqrt(3) / 2) * r,
          r: spacing,
        });
      }
    }
  }
  return circles;
}

export function createMetatronNodes(radius) {
  const inner = createRingPoints(6, radius, -90);
  const outer = createRingPoints(6, radius * 2, -90);
  return [{ x: 0, y: 0 }, ...inner, ...outer];
}

export function createRingPoints(count, radius, offset = 0) {
  return Array.from({ length: count }, (_, index) => {
    const angle = ((360 / count) * index + offset) * (Math.PI / 180);
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  });
}

export function createSriYantraTriangles(size) {
  return [
    trianglePoints(size * 0.88, true, 0, size * 0.03),
    trianglePoints(size * 0.68, true, 0, -size * 0.1),
    trianglePoints(size * 0.52, true, -size * 0.12, size * 0.02),
    trianglePoints(size * 0.48, true, size * 0.12, size * 0.02),
    trianglePoints(size * 0.82, false, 0, -size * 0.04),
    trianglePoints(size * 0.64, false, 0, size * 0.12),
    trianglePoints(size * 0.54, false, -size * 0.11, -size * 0.03),
    trianglePoints(size * 0.54, false, size * 0.11, -size * 0.03),
    trianglePoints(size * 0.38, false, 0, -size * 0.02),
  ];
}

function trianglePoints(size, upward, offsetX, offsetY) {
  const height = size * Math.sqrt(3);
  const topY = upward ? -height / 2 : height / 2;
  const baseY = upward ? height / 2 : -height / 2;
  return [
    [offsetX, topY + offsetY],
    [offsetX - size / 2, baseY + offsetY],
    [offsetX + size / 2, baseY + offsetY],
  ]
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
}

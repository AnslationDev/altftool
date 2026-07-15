export function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export function cls(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function getCellPosition(index) {
  const cellToCoord = {};
  const size = 15;
  let x = 0, y = 0, dx = 0, dy = 1;

  for (let i = 0; i < 52; i++) {
    cellToCoord[i] = { x, y };

    if (i === 5) { dx = 1; dy = 0; }
    else if (i === 11) { dx = 0; dy = -1; }
    else if (i === 16) { dx = 0; dy = 1; }
    else if (i === 18) { dx = -1; dy = 0; }
    else if (i === 23) { dx = 0; dy = -1; }
    else if (i === 28) { dx = 0; dy = 1; }
    else if (i === 34) { dx = -1; dy = 0; }
    else if (i === 39) { dx = 0; dy = 1; }
    else if (i === 44) { dx = 1; dy = 0; }
    else if (i === 46) { dx = 0; dy = -1; }
    else if (i === 50) { dx = -1; dy = 0; }

    x += dx;
    y += dy;
  }

  return cellToCoord[index] || { x: 0, y: 0 };
}

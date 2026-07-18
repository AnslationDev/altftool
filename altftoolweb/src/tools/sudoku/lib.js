export const CLUE_TARGETS = { easy: 40, medium: 32, hard: 26, expert: 22 };

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffled(list, rand) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function buildPeers() {
  const peers = [];
  for (let i = 0; i < 81; i += 1) {
    const set = new Set();
    const row = Math.floor(i / 9);
    const col = i % 9;
    for (let k = 0; k < 9; k += 1) {
      set.add(row * 9 + k);
      set.add(k * 9 + col);
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r += 1) {
      for (let c = boxCol; c < boxCol + 3; c += 1) {
        set.add(r * 9 + c);
      }
    }
    set.delete(i);
    peers.push(Array.from(set));
  }
  return peers;
}

export const PEERS = buildPeers();

function canPlace(grid, index, value) {
  const peers = PEERS[index];
  for (let k = 0; k < peers.length; k += 1) {
    if (grid[peers[k]] === value) return false;
  }
  return true;
}

export function generateSolvedGrid(rand) {
  const grid = new Array(81).fill(0);
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const fill = (index) => {
    if (index === 81) return true;
    const candidates = shuffled(digits, rand);
    for (let k = 0; k < 9; k += 1) {
      const value = candidates[k];
      if (canPlace(grid, index, value)) {
        grid[index] = value;
        if (fill(index + 1)) return true;
        grid[index] = 0;
      }
    }
    return false;
  };
  fill(0);
  return grid;
}

export function countSolutions(grid, limit = 2, nodeBudget = 20000) {
  const work = grid.slice();
  let count = 0;
  let nodes = 0;
  const solve = () => {
    if (count >= limit || nodes > nodeBudget) return;
    let bestIndex = -1;
    let bestCandidates = null;
    for (let i = 0; i < 81; i += 1) {
      if (work[i] !== 0) continue;
      const candidates = [];
      for (let v = 1; v <= 9; v += 1) {
        if (canPlace(work, i, v)) candidates.push(v);
      }
      if (candidates.length === 0) return;
      if (bestCandidates === null || candidates.length < bestCandidates.length) {
        bestIndex = i;
        bestCandidates = candidates;
        if (candidates.length === 1) break;
      }
    }
    if (bestIndex === -1) {
      count += 1;
      return;
    }
    for (let k = 0; k < bestCandidates.length; k += 1) {
      nodes += 1;
      if (nodes > nodeBudget) return;
      work[bestIndex] = bestCandidates[k];
      solve();
      work[bestIndex] = 0;
      if (count >= limit) return;
    }
  };
  solve();
  if (nodes > nodeBudget && count < limit) return limit;
  return count;
}

export function generatePuzzle(seed, difficulty) {
  const rand = mulberry32(seed);
  const solution = generateSolvedGrid(rand);
  const puzzle = solution.slice();
  const target = CLUE_TARGETS[difficulty] || CLUE_TARGETS.medium;
  let clues = 81;

  const pairIndices = shuffled(
    Array.from({ length: 41 }, (_, i) => i),
    rand
  );
  for (let k = 0; k < pairIndices.length; k += 1) {
    if (clues <= target) break;
    const i = pairIndices[k];
    const j = 80 - i;
    const valueI = puzzle[i];
    const valueJ = puzzle[j];
    if (valueI === 0 && valueJ === 0) continue;
    const removed = (valueI !== 0 ? 1 : 0) + (j !== i && valueJ !== 0 ? 1 : 0);
    if (clues - removed < target) continue;
    puzzle[i] = 0;
    puzzle[j] = 0;
    if (countSolutions(puzzle, 2) === 1) {
      clues -= removed;
    } else {
      puzzle[i] = valueI;
      puzzle[j] = valueJ;
    }
  }

  if (clues > target) {
    const singles = shuffled(
      Array.from({ length: 81 }, (_, i) => i),
      rand
    );
    for (let k = 0; k < singles.length; k += 1) {
      if (clues <= target) break;
      const i = singles[k];
      if (puzzle[i] === 0) continue;
      const value = puzzle[i];
      puzzle[i] = 0;
      if (countSolutions(puzzle, 2) === 1) {
        clues -= 1;
      } else {
        puzzle[i] = value;
      }
    }
  }

  return { puzzle, solution, clues };
}

export function dailySeed(date) {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

export function dateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function computeStreaks(completedMap, today) {
  let current = 0;
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!completedMap[dateKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
  while (completedMap[dateKey(cursor)]) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const keys = Object.keys(completedMap)
    .filter((key) => completedMap[key])
    .sort();
  let longest = 0;
  let run = 0;
  let previous = null;
  for (let k = 0; k < keys.length; k += 1) {
    const [y, m, d] = keys[k].split("-").map(Number);
    const day = new Date(y, m - 1, d);
    if (previous && Math.round((day - previous) / 86400000) === 1) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
    previous = day;
  }

  return { current, longest, total: keys.length };
}

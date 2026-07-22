"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Eraser,
  Lightbulb,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";

const PEERS = (() => {
  const peers = [];
  for (let i = 0; i < 81; i++) {
    const set = new Set();
    const row = Math.floor(i / 9);
    const col = i % 9;
    for (let k = 0; k < 9; k++) {
      set.add(row * 9 + k);
      set.add(k * 9 + col);
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++)
      for (let c = boxCol; c < boxCol + 3; c++) set.add(r * 9 + c);
    set.delete(i);
    peers.push(Array.from(set));
  }
  return peers;
})();

const DIFFICULTIES = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
  { id: "expert", label: "Expert" },
];

const CLUE_TARGETS = { easy: 40, medium: 32, hard: 26, expert: 22 };

const KEY_STATS = "altf:sudoku-solver:stats";
const STORAGE_KEY = "altf:sudoku-solver:state";

function getCandidates(grid, index) {
  const candidates = [];
  for (let v = 1; v <= 9; v++) {
    let valid = true;
    for (const peer of PEERS[index]) {
      if (grid[peer] === v) {
        valid = false;
        break;
      }
    }
    if (valid) candidates.push(v);
  }
  return candidates;
}

function backtrackSolve(grid) {
  const work = grid.slice();
  function solve() {
    let bestIndex = -1;
    let bestCandidates = null;
    for (let i = 0; i < 81; i++) {
      if (work[i] !== 0) continue;
      const candidates = getCandidates(work, i);
      if (candidates.length === 0) return false;
      if (!bestCandidates || candidates.length < bestCandidates.length) {
        bestIndex = i;
        bestCandidates = candidates;
        if (candidates.length === 1) break;
      }
    }
    if (bestIndex === -1) return true;
    for (const v of bestCandidates) {
      work[bestIndex] = v;
      if (solve()) return true;
      work[bestIndex] = 0;
    }
    return false;
  }
  return solve() ? work : null;
}

function countSolutions(grid, limit, nodeBudget) {
  limit = limit || 2;
  nodeBudget = nodeBudget || 20000;
  const work = grid.slice();
  let count = 0;
  let nodes = 0;
  function solve() {
    if (count >= limit || nodes > nodeBudget) return;
    let bestIndex = -1;
    let bestCandidates = null;
    for (let i = 0; i < 81; i++) {
      if (work[i] !== 0) continue;
      const candidates = getCandidates(work, i);
      if (candidates.length === 0) return;
      if (!bestCandidates || candidates.length < bestCandidates.length) {
        bestIndex = i;
        bestCandidates = candidates;
        if (candidates.length === 1) break;
      }
    }
    if (bestIndex === -1) {
      count++;
      return;
    }
    for (const v of bestCandidates) {
      nodes++;
      if (nodes > nodeBudget) return;
      work[bestIndex] = v;
      solve();
      work[bestIndex] = 0;
      if (count >= limit) return;
    }
  }
  solve();
  return count;
}

function findNextLogicalStep(grid) {
  const candidates = [];
  for (let i = 0; i < 81; i++)
    candidates.push(grid[i] !== 0 ? [] : getCandidates(grid, i));

  for (let i = 0; i < 81; i++) {
    if (grid[i] !== 0) continue;
    if (candidates[i].length === 1) {
      const value = candidates[i][0];
      return {
        index: i,
        value,
        technique: "Naked Single",
        explanation: `Cell R${Math.floor(i / 9) + 1}C${(i % 9) + 1} has only one possible candidate: ${value}.`,
      };
    }
  }

  for (let row = 0; row < 9; row++) {
    for (let v = 1; v <= 9; v++) {
      const positions = [];
      for (let col = 0; col < 9; col++) {
        const i = row * 9 + col;
        if (grid[i] === 0 && candidates[i].includes(v)) positions.push(i);
      }
      if (positions.length === 1) {
        return {
          index: positions[0],
          value: v,
          technique: "Hidden Single (Row)",
          explanation: `In row ${row + 1}, digit ${v} can only go in column ${(positions[0] % 9) + 1}.`,
        };
      }
    }
  }

  for (let col = 0; col < 9; col++) {
    for (let v = 1; v <= 9; v++) {
      const positions = [];
      for (let row = 0; row < 9; row++) {
        const i = row * 9 + col;
        if (grid[i] === 0 && candidates[i].includes(v)) positions.push(i);
      }
      if (positions.length === 1) {
        return {
          index: positions[0],
          value: v,
          technique: "Hidden Single (Column)",
          explanation: `In column ${col + 1}, digit ${v} can only go in row ${Math.floor(positions[0] / 9) + 1}.`,
        };
      }
    }
  }

  for (let box = 0; box < 9; box++) {
    const boxRow = Math.floor(box / 3) * 3;
    const boxCol = (box % 3) * 3;
    for (let v = 1; v <= 9; v++) {
      const positions = [];
      for (let r = boxRow; r < boxRow + 3; r++)
        for (let c = boxCol; c < boxCol + 3; c++) {
          const i = r * 9 + c;
          if (grid[i] === 0 && candidates[i].includes(v)) positions.push(i);
        }
      if (positions.length === 1) {
        return {
          index: positions[0],
          value: v,
          technique: "Hidden Single (Box)",
          explanation: `In the 3×3 box at row ${boxRow + 1}–${boxRow + 3}, digit ${v} can only go in R${Math.floor(positions[0] / 9) + 1}C${(positions[0] % 9) + 1}.`,
        };
      }
    }
  }

  return null;
}

function findAllLogicalSteps(grid) {
  const working = grid.slice();
  const steps = [];
  for (let iter = 0; iter < 200; iter++) {
    if (working.every((cell) => cell !== 0)) break;
    const step = findNextLogicalStep(working);
    if (!step) break;
    working[step.index] = step.value;
    steps.push(step);
  }
  return steps;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(list, rand) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function generatePuzzle(seed, difficulty) {
  const rand = seed != null ? mulberry32(seed) : mulberry32(Math.floor(Math.random() * 0x7fffffff));
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const solution = new Array(81).fill(0);
  function fill(index) {
    if (index === 81) return true;
    const candidates = shuffled(digits, rand);
    for (const v of candidates) {
      let valid = true;
      for (const peer of PEERS[index]) {
        if (solution[peer] === v) {
          valid = false;
          break;
        }
      }
      if (valid) {
        solution[index] = v;
        if (fill(index + 1)) return true;
        solution[index] = 0;
      }
    }
    return false;
  }
  fill(0);

  const puzzle = solution.slice();
  const target = CLUE_TARGETS[difficulty] || 32;
  let clues = 81;

  const pairIndices = shuffled(Array.from({ length: 40 }, (_, i) => i), rand);
  for (const k of pairIndices) {
    if (clues <= target) break;
    const i = k;
    const j = 80 - k;
    if (puzzle[i] === 0 && puzzle[j] === 0) continue;
    const removed = (puzzle[i] !== 0 ? 1 : 0) + (j !== i && puzzle[j] !== 0 ? 1 : 0);
    if (clues - removed < target) continue;
    const vi = puzzle[i];
    const vj = puzzle[j];
    puzzle[i] = 0;
    puzzle[j] = 0;
    if (countSolutions(puzzle, 2) === 1) clues -= removed;
    else {
      puzzle[i] = vi;
      puzzle[j] = vj;
    }
  }

  if (clues > target) {
    const singles = shuffled(Array.from({ length: 81 }, (_, i) => i), rand);
    for (const i of singles) {
      if (clues <= target) break;
      if (puzzle[i] === 0) continue;
      const v = puzzle[i];
      puzzle[i] = 0;
      if (countSolutions(puzzle, 2) === 1) clues--;
      else puzzle[i] = v;
    }
  }

  return { puzzle, solution, clues };
}

function findConflicts(grid) {
  const set = new Set();
  for (let i = 0; i < 81; i++) {
    const value = grid[i];
    if (!value) continue;
    for (const peer of PEERS[i]) {
      if (grid[peer] === value) {
        set.add(i);
        break;
      }
    }
  }
  return set;
}

function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds || 0));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function TechniqueBadge({ technique }) {
  const colorMap = {
    "Naked Single": "text-[var(--anslation-ds-success)]",
    "Hidden Single (Row)": "text-[var(--primary)]",
    "Hidden Single (Column)": "text-[var(--primary)]",
    "Hidden Single (Box)": "text-[var(--anslation-ds-info)]",
  };
  return (
    <span
      className={`inline-block rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-[11px] font-semibold leading-5 ${colorMap[technique] || "text-[var(--muted-foreground)]"}`}
    >
      {technique}
    </span>
  );
}

function NumberPad({ remaining, onDigit, onErase, disabled }) {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
        <button
          key={digit}
          type="button"
          disabled={disabled}
          onClick={() => onDigit(digit)}
          className="flex min-h-11 flex-col items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] py-1 text-lg font-semibold transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className={remaining[digit] <= 0 ? "text-[var(--muted-foreground)]" : ""}>
            {digit}
          </span>
          <span className="text-[10px] font-medium leading-none text-[var(--muted-foreground)]">
            {Math.max(0, remaining[digit])}
          </span>
        </button>
      ))}
      <button
        type="button"
        disabled={disabled}
        onClick={onErase}
        aria-label="Erase cell"
        className="flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Eraser className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function ToolHome() {
  const [hydrated, setHydrated] = useState(false);
  const [grid, setGrid] = useState(new Array(81).fill(0));
  const [puzzle, setPuzzle] = useState(null);
  const [solution, setSolution] = useState(null);
  const [selected, setSelected] = useState(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [elapsed, setElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [solving, setSolving] = useState(false);

  const [steps, setSteps] = useState(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(-1);
  const [stepGrid, setStepGrid] = useState(null);
  const [autoPlaying, setAutoPlaying] = useState(false);

  const [hintCell, setHintCell] = useState(null);
  const [solved, setSolved] = useState(false);
  const [stats, setStats] = useState(null);

  const flashTimerRef = useRef(null);
  const timerRef = useRef(null);
  const autoPlayRef = useRef(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  useEffect(() => {
    let savedStats = null;
    try {
      savedStats = JSON.parse(window.localStorage.getItem(KEY_STATS) || "null");
    } catch {}
    setStats(savedStats && typeof savedStats === "object" ? savedStats : {});
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || stats == null) return;
    try {
      window.localStorage.setItem(KEY_STATS, JSON.stringify(stats));
    } catch {}
  }, [hydrated, stats]);

  useEffect(() => {
    if (!hydrated || !timerRunning) return;
    timerRef.current = window.setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => window.clearInterval(timerRef.current);
  }, [hydrated, timerRunning]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) setTimerRunning(false);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!autoPlaying || steps == null || currentStepIdx >= steps.length - 1) {
      setAutoPlaying(false);
      return;
    }
    autoPlayRef.current = window.setTimeout(
      () => advanceStep(),
      800
    );
    return () => {
      if (autoPlayRef.current) window.clearTimeout(autoPlayRef.current);
    };
  }, [autoPlaying, currentStepIdx, steps]);

  useEffect(
    () => () => {
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    },
    []
  );

  useEffect(() => {
    if (solved) {
      const finishTime = elapsedRef.current;
      setStats((prev) => {
        const base = prev || {};
        const key = puzzle ? difficulty : "custom";
        const entry = base[key] || { solved: 0, best: null };
        return {
          ...base,
          [key]: {
            solved: entry.solved + 1,
            best: entry.best == null ? finishTime : Math.min(entry.best, finishTime),
          },
        };
      });
    }
  }, [solved]);

  const flash = useCallback((text) => {
    setMessage(text);
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(() => setMessage(""), 3200);
  }, []);

  const checkSolved = useCallback(
    (g) => {
      if (solution) {
        return g.every((cell, i) => cell !== 0 && cell === solution[i]);
      }
      return g.every((cell) => cell !== 0) && findConflicts(g).size === 0;
    },
    [solution]
  );

  const placeValue = useCallback(
    (index, value) => {
      if (solved) return;
      if (puzzle && puzzle[index] !== 0) return;
      if (steps != null) return;
      if (hintCell) setHintCell(null);

      setGrid((prev) => {
        const next = prev.slice();
        if (value === 0) next[index] = 0;
        else next[index] = value;
        if (!timerRunning && next.some((c) => c !== 0)) setTimerRunning(true);
        if (checkSolved(next)) {
          setSolved(true);
          setTimerRunning(false);
        }
        return next;
      });
    },
    [puzzle, steps, hintCell, timerRunning, checkSolved, solved]
  );

  const handleClear = useCallback(() => {
    if (puzzle) {
      setGrid(puzzle.slice());
    } else {
      setGrid(new Array(81).fill(0));
    }
    setSelected(null);
    setHintCell(null);
    setSteps(null);
    setCurrentStepIdx(-1);
    setStepGrid(null);
    setAutoPlaying(false);
    setSolved(false);
    setMessage("");
    setTimerRunning(false);
    setElapsed(0);
  }, [puzzle]);

  const handleReset = useCallback(() => {
    setGrid(new Array(81).fill(0));
    setPuzzle(null);
    setSolution(null);
    setSelected(null);
    setHintCell(null);
    setSteps(null);
    setCurrentStepIdx(-1);
    setStepGrid(null);
    setAutoPlaying(false);
    setSolved(false);
    setMessage("");
    setTimerRunning(false);
    setElapsed(0);
  }, []);

  const handleGenerate = useCallback(() => {
    setSolving(true);
    setMessage("Generating puzzle...");
    setHintCell(null);
    setSteps(null);
    setCurrentStepIdx(-1);
    setStepGrid(null);
    setAutoPlaying(false);
    setSolved(false);

    const seed = Math.floor(Math.random() * 0x7fffffff);
    const result = generatePuzzle(seed, difficulty);
    setGrid(result.puzzle.slice());
    setPuzzle(result.puzzle);
    setSolution(result.solution);
    setSelected(null);
    setElapsed(0);
    setTimerRunning(true);
    setSolving(false);
    setMessage(`Generated ${difficulty} puzzle with ${result.clues} clues.`);
  }, [difficulty]);

  const handleInstantSolve = useCallback(() => {
    if (solved) return;
    if (grid.every((cell) => cell === 0)) {
      flash("Enter a puzzle first or generate one.");
      return;
    }
    const conflicts = findConflicts(grid);
    if (conflicts.size > 0) {
      flash("Fix conflicting cells before solving.");
      return;
    }
    setSolving(true);
    setMessage("Solving...");
    setHintCell(null);
    setSteps(null);
    setCurrentStepIdx(-1);
    setStepGrid(null);
    setAutoPlaying(false);

    const result = backtrackSolve(grid);
    if (result) {
      setGrid(result);
      setSolved(true);
      setTimerRunning(false);
      setMessage("Solved!");
    } else {
      flash("No solution exists for this puzzle.");
    }
    setSolving(false);
  }, [grid, solved, flash]);

  const handleStepByStep = useCallback(() => {
    if (solved) return;
    if (grid.every((cell) => cell === 0)) {
      flash("Enter a puzzle first or generate one.");
      return;
    }
    const conflicts = findConflicts(grid);
    if (conflicts.size > 0) {
      flash("Fix conflicting cells before solving.");
      return;
    }

    const computed = findAllLogicalSteps(grid);
    if (computed.length === 0) {
      flash("No logical steps found. Try Instant Solve instead.");
      return;
    }
    setSteps(computed);
    setCurrentStepIdx(-1);
    setStepGrid(grid.slice());
    setHintCell(null);
    setSelected(null);
    setAutoPlaying(false);
    if (!timerRunning) setTimerRunning(true);
    setMessage(`Found ${computed.length} logical steps. Click Next to begin.`);
  }, [grid, solved, flash, timerRunning]);

  const advanceStep = useCallback(() => {
    if (!steps) return;
    const nextIdx = currentStepIdx + 1;
    if (nextIdx >= steps.length) {
      setAutoPlaying(false);
      return;
    }
    const step = steps[nextIdx];
    setStepGrid((prev) => {
      const next = prev.slice();
      next[step.index] = step.value;
      return next;
    });
    setCurrentStepIdx(nextIdx);
    setSelected(step.index);
    if (nextIdx === steps.length - 1) {
      setGrid(steps.reduce((acc, s, i) => {
        if (i <= nextIdx) acc[s.index] = s.value;
        return acc;
      }, grid.slice()));
      setSolved(true);
      setTimerRunning(false);
      setMessage("Puzzle solved!");
      if (autoPlayRef.current) window.clearTimeout(autoPlayRef.current);
      setAutoPlaying(false);
    }
  }, [steps, currentStepIdx, grid]);

  const prevStep = useCallback(() => {
    if (!steps || currentStepIdx < 0) return;
    const step = steps[currentStepIdx];
    setStepGrid((prev) => {
      const next = prev.slice();
      next[step.index] = 0;
      return next;
    });
    setCurrentStepIdx((v) => v - 1);
  }, [steps, currentStepIdx]);

  const applyAllSteps = useCallback(() => {
    if (!steps) return;
    const final = grid.slice();
    for (const s of steps) final[s.index] = s.value;
    setGrid(final);
    setStepGrid(final);
    setCurrentStepIdx(steps.length - 1);
    setSelected(steps[steps.length - 1]?.index || null);
    setSolved(true);
    setTimerRunning(false);
    setMessage("Puzzle solved!");
    setAutoPlaying(false);
    if (autoPlayRef.current) window.clearTimeout(autoPlayRef.current);
  }, [steps, grid]);

  const handleHint = useCallback(() => {
    if (solved) {
      flash("Puzzle already solved.");
      return;
    }
    if (steps != null) {
      flash("In step-by-step mode. Use Next Step or Instant Solve.");
      return;
    }
    if (grid.every((cell) => cell === 0)) {
      flash("Enter a puzzle first or generate one.");
      return;
    }
    const conflicts = findConflicts(grid);
    if (conflicts.size > 0) {
      flash("Fix conflicting cells first.");
      return;
    }
    const step = findNextLogicalStep(grid);
    if (!step) {
      flash("No hint available. Try Instant Solve.");
      return;
    }
    setHintCell(step.index);
    setSelected(step.index);
    flash(`Hint: ${step.explanation}`);
  }, [grid, solved, steps, flash]);

  const conflicts = useMemo(() => findConflicts(grid), [grid]);

  const remaining = useMemo(() => {
    const counts = new Array(10).fill(9);
    for (let i = 0; i < 81; i++) {
      const value = grid[i];
      if (value) counts[value] -= 1;
    }
    return counts;
  }, [grid]);

  const peerSet = useMemo(
    () => (selected == null ? null : new Set(PEERS[selected])),
    [selected]
  );

  const displayGrid = steps != null ? stepGrid : grid;

  const selectedValue = selected != null ? displayGrid[selected] : 0;

  const currentStep = steps && currentStepIdx >= 0 ? steps[currentStepIdx] : null;

  const onKeyDown = useCallback(
    (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      )
        return;
      if (solving) return;

      if (event.key.startsWith("Arrow")) {
        event.preventDefault();
        setSelected((prev) => {
          const current = prev == null ? 40 : prev;
          const row = Math.floor(current / 9);
          const col = current % 9;
          if (event.key === "ArrowUp") return Math.max(0, row - 1) * 9 + col;
          if (event.key === "ArrowDown") return Math.min(8, row + 1) * 9 + col;
          if (event.key === "ArrowLeft") return row * 9 + Math.max(0, col - 1);
          return row * 9 + Math.min(8, col + 1);
        });
        return;
      }

      if (selected == null) return;
      if (event.key >= "1" && event.key <= "9") {
        placeValue(selected, Number(event.key));
        return;
      }
      if (event.key === "0" || event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        placeValue(selected, 0);
      }
    },
    [selected, placeValue, solving]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  const renderCell = (index) => {
    const row = Math.floor(index / 9);
    const col = index % 9;
    const value = displayGrid[index];
    const isGiven = puzzle && puzzle[index] !== 0;
    const isSelected = selected === index;
    const inConflict = conflicts.has(index) && value !== 0;
    const isPeer = peerSet != null && peerSet.has(index);
    const isSameNumber = !isSelected && selectedValue !== 0 && value === selectedValue;
    const isHint = hintCell === index;
    const isStepCell = currentStep && currentStep.index === index;

    let background;
    if (isSelected) background = "color-mix(in srgb, var(--primary) 26%, transparent)";
    else if (inConflict) background = "color-mix(in srgb, var(--anslation-ds-danger) 16%, transparent)";
    else if (isStepCell) background = "color-mix(in srgb, var(--anslation-ds-success) 20%, transparent)";
    else if (isHint) background = "color-mix(in srgb, var(--anslation-ds-warning) 20%, transparent)";
    else if (isSameNumber) background = "color-mix(in srgb, var(--primary) 13%, transparent)";
    else if (isPeer) background = "color-mix(in srgb, var(--muted) 50%, transparent)";

    let textClass = isGiven
      ? "text-[var(--foreground)]"
      : "text-[var(--primary)]";
    if (inConflict) textClass = "text-[var(--anslation-ds-danger)]";
    if (isStepCell) textClass = "text-[var(--anslation-ds-success)]";

    const borders = `${col < 8
        ? col % 3 === 2
          ? "border-r-2 border-r-[var(--muted-foreground)]"
          : "border-r border-r-[var(--border)]"
        : ""
      } ${row < 8
        ? row % 3 === 2
          ? "border-b-2 border-b-[var(--muted-foreground)]"
          : "border-b border-b-[var(--border)]"
        : ""
      }`;

    return (
      <button
        key={index}
        type="button"
        tabIndex={isSelected ? 0 : -1}
        aria-label={`Row ${row + 1}, column ${col + 1}${value ? `, ${value}` : ", empty"}${isGiven ? ", given" : ""}`}
        onClick={() => {
          if (solving) return;
          if (steps != null && currentStepIdx < steps.length - 1) return;
          setSelected(index);
          if (hintCell) setHintCell(null);
        }}
        className={`relative flex touch-manipulation select-none items-center justify-center text-lg font-semibold outline-none sm:text-2xl ${borders} ${textClass} transition-colors`}
        style={background ? { background } : undefined}
      >
        {value !== 0 ? (
          <span className={isGiven ? "font-bold" : ""}>{value}</span>
        ) : null}
      </button>
    );
  };

  const boardPanel = (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
      <div className="relative mx-auto w-full max-w-[540px]">
        <div
          role="group"
          aria-label="Sudoku board"
          className="grid aspect-square w-full grid-cols-9 grid-rows-9 overflow-hidden rounded-md border-2 border-[var(--muted-foreground)] bg-[var(--card)]"
        >
          {Array.from({ length: 81 }, (_, i) => renderCell(i))}
        </div>
      </div>

      <p aria-live="polite" className="mt-3 min-h-5 text-center text-sm text-[var(--muted-foreground)]">
        {message}
      </p>
      <p className="hidden text-center text-xs text-[var(--muted-foreground)] sm:block">
        Arrows move · 1–9 place · 0 / Backspace erase
      </p>
    </div>
  );

  const stepInfoPanel = steps && currentStepIdx >= 0 && currentStep ? (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
      <p className="mb-2 text-sm font-semibold">
        Step {currentStepIdx + 1} of {steps.length}
      </p>
      <div className="mb-2 flex items-center gap-2">
        <TechniqueBadge technique={currentStep.technique} />
      </div>
      <p className="mb-1 text-sm font-semibold">
        R{Math.floor(currentStep.index / 9) + 1}C{(currentStep.index % 9) + 1} → {currentStep.value}
      </p>
      <p className="mb-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
        {currentStep.explanation}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={currentStepIdx <= 0}
          onClick={prevStep}
          className="inline-flex min-h-10 items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>
        <button
          type="button"
          disabled={currentStepIdx >= steps.length - 1}
          onClick={advanceStep}
          className="inline-flex min-h-10 items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={autoPlaying || currentStepIdx >= steps.length - 1}
          onClick={() => setAutoPlaying(true)}
          className="inline-flex min-h-10 items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Play className="h-4 w-4" />
          Auto
        </button>
        <button
          type="button"
          onClick={applyAllSteps}
          className="ml-auto inline-flex min-h-10 items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--primary)] transition hover:border-[var(--primary)]"
        >
          <Zap className="h-4 w-4" />
          Apply all
        </button>
      </div>
    </div>
  ) : null;

  const isLocked = steps != null && currentStepIdx < (steps?.length || 0) - 1;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <BrainCircuit className="h-4 w-4" />
            Puzzle solver
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Sudoku Solver</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Solve any Sudoku puzzle instantly with backtracking, or step-by-step with logical
            technique explanations. Generate new puzzles with unique solutions across four
            difficulty levels.
          </p>
        </section>

        {!hydrated ? (
          <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-10 text-center text-sm text-[var(--muted-foreground)] shadow-[var(--anslation-ds-shadow-sm)]">
            Loading solver...
          </section>
        ) : (
          <section className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="grid gap-4">
              {boardPanel}
              {stepInfoPanel}
            </div>

            <div className="grid content-start gap-4">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
                <p className="mb-3 text-sm font-semibold">Difficulty</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {DIFFICULTIES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDifficulty(item.id)}
                      aria-pressed={difficulty === item.id}
                      className={`rounded-md border px-2 py-2 text-xs font-semibold transition ${
                        difficulty === item.id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={solving}
                  className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate puzzle
                </button>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
                <p className="mb-2 text-sm font-semibold">Actions</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={handleInstantSolve}
                    disabled={solving || isLocked}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-3 text-sm font-semibold text-[var(--primary-foreground)] transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Zap className="h-4 w-4" />
                    Instant Solve
                  </button>
                  <button
                    type="button"
                    onClick={handleStepByStep}
                    disabled={solving || isLocked}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Play className="h-4 w-4" />
                    Step by Step
                  </button>
                  <button
                    type="button"
                    onClick={handleHint}
                    disabled={solving || isLocked}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Hint
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={solving}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Eraser className="h-4 w-4" />
                    Clear
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={solving}
                  className="mt-1.5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset all
                </button>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold">Timer</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums">
                    <Timer className="h-4 w-4 text-[var(--muted-foreground)]" />
                    {formatClock(elapsed)}
                  </span>
                </div>
                <p className="mb-2 text-sm font-semibold">Number pad</p>
                <NumberPad
                  remaining={remaining}
                  onDigit={(d) => {
                    if (selected == null) {
                      flash("Select a cell on the board first.");
                      return;
                    }
                    if (isLocked) {
                      flash("Complete or cancel step-by-step mode first.");
                      return;
                    }
                    placeValue(selected, d);
                  }}
                  onErase={() => {
                    if (selected == null) {
                      flash("Select a cell on the board first.");
                      return;
                    }
                    if (isLocked) {
                      flash("Complete or cancel step-by-step mode first.");
                      return;
                    }
                    placeValue(selected, 0);
                  }}
                  disabled={solving || isLocked}
                />
              </div>

              {solved && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-center shadow-[var(--anslation-ds-shadow-sm)]">
                  <span className="mx-auto mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--primary)]">
                    <Trophy className="h-5 w-5" />
                  </span>
                  <p className="font-semibold">Solved!</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Time: {formatClock(elapsed)}
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-2 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    New puzzle
                  </button>
                </div>
              )}

              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
                <p className="mb-3 text-sm font-semibold">Your stats</p>
                {stats ? (
                  <div className="grid gap-2">
                    {[...DIFFICULTIES, { id: "custom", label: "Custom" }].map((item) => {
                      const entry = stats[item.id];
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                        >
                          <span className="font-semibold">{item.label}</span>
                          <span className="text-[var(--muted-foreground)]">
                            {entry?.solved || 0} solved · best{" "}
                            {entry?.best != null ? formatClock(entry.best) : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--muted-foreground)]">No stats yet.</p>
                )}
              </div>

              <details className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
                <summary className="cursor-pointer text-sm font-semibold">How to use</summary>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  <li>1. Click cells and enter numbers 1–9 to input a puzzle.</li>
                  <li>2. Click <strong>Instant Solve</strong> for an immediate solution.</li>
                  <li>3. Click <strong>Step by Step</strong> to solve one cell at a time with technique explanations.</li>
                  <li>4. <strong>Hint</strong> suggests the next logical cell without filling it.</li>
                  <li>5. <strong>Generate puzzle</strong> creates a new puzzle with a unique solution.</li>
                  <li>6. Conflicting cells are highlighted in red automatically.</li>
                  <li className="rounded-md bg-[var(--muted)] p-3">
                    Techniques: Naked Single, Hidden Single (Row/Column/Box).
                  </li>
                </ul>
              </details>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

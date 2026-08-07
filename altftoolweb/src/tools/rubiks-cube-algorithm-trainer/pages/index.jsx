"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Brain, CheckCircle2, ChevronDown, ChevronRight, Clock, Layers, RotateCcw, Trophy, XCircle } from "lucide-react";

const STORAGE_KEY = "altf:rubiks:progress";
const FACES = ["U", "D", "F", "B", "L", "R"];
const SLICE_FACES = ["M", "S", "E"];
// Whole-cube rotations are composed from the equivalent face + slice turns (standard cubing
// identities): x = R M' L', y = U E' D', z = F S B'.
const ROTATION_MOVES = {
  x: { normal: ["R", "M'", "L'"], prime: ["R'", "M", "L"], double: ["R2", "M2", "L2"] },
  y: { normal: ["U", "E'", "D'"], prime: ["U'", "E", "D"], double: ["U2", "E2", "D2"] },
  z: { normal: ["F", "S", "B'"], prime: ["F'", "S'", "B"], double: ["F2", "S2", "B2"] },
};
const FACE_COLORS = { U: "#FFFFFF", D: "#FFFF00", F: "#00FF00", B: "#0000FF", L: "#FF8C00", R: "#FF0000" };
const FACE_LABELS = { U: "Top", D: "Bottom", F: "Front", B: "Back", L: "Left", R: "Right" };

const FACE_LAYOUT = { U: [1, 0], D: [3, 0], F: [2, 0], B: [0, 0], L: [2, -1], R: [2, 1] };
const FACE_ROTATION = { U: 0, D: 0, F: 0, B: 180, L: -90, R: 90 };

const algorithmData = {
  // Note: "White Cross" / "Yellow Cross" entries were removed here (wave-54 audit finding 6) -
  // the first-layer cross has no single memorized algorithm (it's solved intuitively piece by
  // piece), and the two entries had been assigned OLL 1's notation ("F R U R' U' F'") verbatim,
  // which misrepresents that OLL corner-orientation case as a cross-forming algorithm.
  "Beginner": [
    { name: "White Corners", notation: "R U R' U'", category: "Corners", description: "Insert white corner pieces" },
    { name: "Second Layer", notation: "U R U' R' U' F' U F", category: "F2L", description: "Insert edge into second layer (right)" },
    { name: "Second Layer Left", notation: "U' L' U L U F U' F'", category: "F2L", description: "Insert edge into second layer (left)" },
    { name: "Yellow Corners", notation: "R U R' U R U2 R'", category: "OLL", description: "Orient yellow corners (Sune)" },
    { name: "Corner Permutation", notation: "R' F R' B2 R F' R' B2 R2", category: "PLL", description: "Permute corners (A Perm)" },
    { name: "Edge Permutation", notation: "F2 U' L R' F2 L' R U' F2", category: "PLL", description: "Permute edges (H Perm)" },
  ],
  "PLL": [
    { name: "Aa Perm", notation: "x R' U R' D2 R U' R' D2 R2 x'", category: "PLL", description: "Swap corners (A Perm a)" },
    { name: "Ab Perm", notation: "x R2 D2 R U R' D2 R U' R x'", category: "PLL", description: "Swap corners (A Perm b)" },
    { name: "E Perm", notation: "x' R U' R' D R U R' D' R U R' D R U' R' D' x", category: "PLL", description: "Swap corners and edges" },
    { name: "H Perm", notation: "M2 U M2 U2 M2 U M2", category: "PLL", description: "Swap opposite edges" },
    { name: "Ua Perm", notation: "R U' R U R U R U' R' U' R2", category: "PLL", description: "Cycle edges (U Perm a)" },
    { name: "Ub Perm", notation: "R2 U R U R' U' R' U' R' U R'", category: "PLL", description: "Cycle edges (U Perm b)" },
    { name: "Z Perm", notation: "M2 U M2 U M' U2 M2 U2 M' U2", category: "PLL", description: "Swap adjacent edges" },
    { name: "T Perm", notation: "R U R' U' R' F R2 U' R' U' R U R' F'", category: "PLL", description: "Swap corners and edges (T Perm)" },
    { name: "Jb Perm", notation: "R U R' F' R U R' U' R' F R2 U' R'", category: "PLL", description: "Swap corners (J Perm b)" },
    { name: "Ja Perm", notation: "R' U L' U2 R U' R' U2 R L", category: "PLL", description: "Swap corners (J Perm a)" },
  ],
  "OLL": [
    { name: "Sune", notation: "R U R' U R U2 R'", category: "OLL", description: "Orient corners (Sune) - case 1" },
    { name: "Anti-Sune", notation: "R U2 R' U' R U' R'", category: "OLL", description: "Orient corners (Anti-Sune) - case 2" },
    { name: "Cross OLL 1", notation: "F R U R' U' F'", category: "OLL", description: "Cross to yellow face (OLL 1)" },
    { name: "Cross OLL 2", notation: "F U R U' R' F'", category: "OLL", description: "Cross to yellow face (OLL 2)" },
    { name: "Bowtie", notation: "R' F' L' F R F' L F", category: "OLL", description: "Orient corners (Bowtie) - case 3" },
    { name: "T Shape", notation: "F R U R' U' R U R' U' F'", category: "OLL", description: "T-shape orientation" },
    { name: "L Shape", notation: "F U R U' R' F' U F R U R' U' F'", category: "OLL", description: "L-shape orientation" },
    { name: "Kite", notation: "R U R' U' R' F R F'", category: "OLL", description: "Kite shape orientation" },
    { name: "Fish 1", notation: "R U R' U R U' R' U R U2 R'", category: "OLL", description: "Fish shape orientation 1" },
    { name: "Fish 2", notation: "R U2 R' U' R U R' U' R U' R'", category: "OLL", description: "Fish shape orientation 2" },
  ],
  "F2L": [
    { name: "Basic Insert", notation: "U R U' R'", category: "F2L", description: "Insert pair from top (right)" },
    { name: "Basic Insert Left", notation: "U' L' U L", category: "F2L", description: "Insert pair from top (left)" },
    { name: "Corner Up", notation: "R U' R' U2 F' U' F", category: "F2L", description: "Corner facing up edge in top" },
    { name: "Edge Up Right", notation: "U' R U R' U2 R U' R'", category: "F2L", description: "Edge in top, corner in slot (right)" },
    { name: "Edge Up Left", notation: "U L' U' L U2 L' U L", category: "F2L", description: "Edge in top, corner in slot (left)" },
    { name: "Corner Slot", notation: "R U R' U' R U R'", category: "F2L", description: "Both in top, easy case" },
    { name: "Split Pair", notation: "R U2 R' U' R U R'", category: "F2L", description: "Split pair insertion" },
    { name: "Corner Wrong", notation: "R' U R U' R' U R", category: "F2L", description: "Corner in wrong slot" },
  ],
};

function solvedCube() {
  const cube = {};
  for (const face of FACES) {
    cube[face] = [];
    for (let r = 0; r < 3; r++) {
      cube[face][r] = [];
      for (let c = 0; c < 3; c++) {
        cube[face][r][c] = face;
      }
    }
  }
  return cube;
}

function applyMove(cube, move) {
  const isPrime = move.includes("'");
  const isDouble = move.includes("2");
  const face = move[0];

  // Whole-cube rotations (x/y/z) are composed from the equivalent face + slice turns rather than
  // handled as a distinct sticker-cycle case, since they move all six faces at once.
  if (face === "x" || face === "y" || face === "z") {
    const seqs = ROTATION_MOVES[face];
    const seq = isDouble ? seqs.double : isPrime ? seqs.prime : seqs.normal;
    let result = cube;
    for (const m of seq) result = applyMove(result, m);
    return result;
  }

  const newCube = JSON.parse(JSON.stringify(cube));
  if (!FACES.includes(face) && !SLICE_FACES.includes(face)) return newCube;

  function rotateFace(f, times) {
    for (let t = 0; t < times; t++) {
      const rotated = [];
      for (let r = 0; r < 3; r++) {
        rotated[r] = [];
        for (let c = 0; c < 3; c++) {
          rotated[r][c] = newCube[f][2 - c][r];
        }
      }
      newCube[f] = rotated;
    }
  }

  const times = isDouble ? 2 : isPrime ? 3 : 1;
  // Slice moves (M/S/E) have no face grid of their own - only the surrounding sticker cycle applies.
  if (FACES.includes(face)) rotateFace(face, times);

  let affected;
  switch (face) {
    case "U":
      affected = [["F", 0, 0, "R", 0, 0, "B", 0, 0, "L", 0, 0],
                   ["F", 0, 1, "R", 0, 1, "B", 0, 1, "L", 0, 1],
                   ["F", 0, 2, "R", 0, 2, "B", 0, 2, "L", 0, 2]];
      break;
    case "D":
      affected = [["F", 2, 0, "L", 2, 0, "B", 2, 0, "R", 2, 0],
                   ["F", 2, 1, "L", 2, 1, "B", 2, 1, "R", 2, 1],
                   ["F", 2, 2, "L", 2, 2, "B", 2, 2, "R", 2, 2]];
      break;
    case "F":
      affected = [["U", 2, 0, "R", 0, 0, "D", 0, 2, "L", 2, 2],
                   ["U", 2, 1, "R", 1, 0, "D", 0, 1, "L", 1, 2],
                   ["U", 2, 2, "R", 2, 0, "D", 0, 0, "L", 0, 2]];
      break;
    case "B":
      affected = [["U", 0, 0, "L", 2, 0, "D", 2, 2, "R", 0, 2],
                   ["U", 0, 1, "L", 1, 0, "D", 2, 1, "R", 1, 2],
                   ["U", 0, 2, "L", 0, 0, "D", 2, 0, "R", 2, 2]];
      break;
    case "L":
      affected = [["U", 0, 0, "F", 0, 0, "D", 0, 0, "B", 2, 2],
                   ["U", 1, 0, "F", 1, 0, "D", 1, 0, "B", 1, 2],
                   ["U", 2, 0, "F", 2, 0, "D", 2, 0, "B", 0, 2]];
      break;
    case "R":
      affected = [["U", 0, 2, "B", 2, 0, "D", 0, 2, "F", 0, 2],
                   ["U", 1, 2, "B", 1, 0, "D", 1, 2, "F", 1, 2],
                   ["U", 2, 2, "B", 0, 0, "D", 2, 2, "F", 2, 2]];
      break;
    // Slice moves: M is the layer between L and R (moves with L's handedness), S is the layer
    // between F and B (moves with F's handedness), E is the layer between U and D (moves with
    // D's handedness) - all interpolated directly from the (already-correct) adjacent face cases
    // above, using the middle row/column instead of an outer one.
    case "M":
      affected = [["U", 0, 1, "F", 0, 1, "D", 0, 1, "B", 2, 1],
                   ["U", 1, 1, "F", 1, 1, "D", 1, 1, "B", 1, 1],
                   ["U", 2, 1, "F", 2, 1, "D", 2, 1, "B", 0, 1]];
      break;
    case "S":
      affected = [["U", 1, 0, "R", 0, 1, "D", 1, 2, "L", 2, 1],
                   ["U", 1, 1, "R", 1, 1, "D", 1, 1, "L", 1, 1],
                   ["U", 1, 2, "R", 2, 1, "D", 1, 0, "L", 0, 1]];
      break;
    case "E":
      affected = [["F", 1, 0, "L", 1, 0, "B", 1, 0, "R", 1, 0],
                   ["F", 1, 1, "L", 1, 1, "B", 1, 1, "R", 1, 1],
                   ["F", 1, 2, "L", 1, 2, "B", 1, 2, "R", 1, 2]];
      break;
    default:
      return newCube;
  }

  for (const cycle of affected) {
    const vals = [];
    for (let i = 0; i < 4; i++) {
      vals.push(newCube[cycle[i * 3]][cycle[i * 3 + 1]][cycle[i * 3 + 2]]);
    }
    for (let i = 0; i < 4; i++) {
      // A double turn (e.g. U2) must cycle stickers TWO steps around, not one - matching the
      // 180 degree face rotation above (wave-54 audit finding 1).
      const idx = isDouble ? (i + 2) % 4 : isPrime ? (i + 1) % 4 : (i + 3) % 4;
      newCube[cycle[i * 3]][cycle[i * 3 + 1]][cycle[i * 3 + 2]] = vals[idx];
    }
  }

  return newCube;
}

function applyNotation(cube, notation) {
  let current = JSON.parse(JSON.stringify(cube));
  const moves = notation.split(/\s+/).filter(Boolean);
  for (const move of moves) {
    current = applyMove(current, move);
  }
  return current;
}

function CubieGrid({ face, cube, size = 40 }) {
  const stickers = cube[face];
  const rot = FACE_ROTATION[face];
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-bold text-(--muted-foreground) uppercase tracking-wide">{FACE_LABELS[face]}</span>
      <div
        style={{ transform: `rotate(${rot}deg)` }}
        className="grid grid-cols-3 gap-[2px] rounded-md border border-(--border) bg-(--muted) p-[3px] shadow-sm"
      >
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => (
            <div
              key={`${r}-${c}`}
              className="rounded-sm border border-black/20"
              style={{ width: size, height: size, backgroundColor: FACE_COLORS[stickers[r][c]] || "#888", transition: "background-color 0.3s ease" }}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CubeNet({ cube }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex justify-center">
        <div style={{ gridColumn: 2 }}><CubieGrid face="U" cube={cube} size={36} /></div>
      </div>
      <div className="flex gap-2 items-center">
        <CubieGrid face="L" cube={cube} size={36} />
        <CubieGrid face="F" cube={cube} size={36} />
        <CubieGrid face="R" cube={cube} size={36} />
        <CubieGrid face="B" cube={cube} size={36} />
      </div>
      <div className="flex justify-center">
        <CubieGrid face="D" cube={cube} size={36} />
      </div>
    </div>
  );
}

function CategorySection({ category, algorithms, expanded, onToggle, onSelect, progress, activeNotation }) {
  const isActive = algorithms.some((a) => a.notation === activeNotation);
  return (
    <div className={`rounded-[8px] border border-(--border) bg-(--card) transition ${isActive ? "ring-2 ring-(--primary)/30" : ""}`}>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="h-4 w-4 text-(--muted-foreground)" /> : <ChevronRight className="h-4 w-4 text-(--muted-foreground)" />}
          <span className="text-sm font-bold text-(--foreground)">{category}</span>
          <span className="rounded-full bg-(--muted) px-2 py-0.5 text-[10px] font-semibold text-(--muted-foreground)">{algorithms.length}</span>
        </div>
        <Brain className="h-3.5 w-3.5 text-(--muted-foreground)" />
      </button>
      {expanded && (
        <div className="border-t border-(--border) px-2 pb-2 pt-1">
          {algorithms.map((alg) => {
            const p = progress[alg.name];
            const learned = p?.learned;
            return (
              <button
                key={alg.name}
                onClick={() => onSelect(alg)}
                className={`group flex w-full items-center gap-2 rounded-[6px] px-3 py-2 text-left text-xs transition hover:bg-(--muted) ${
                  alg.notation === activeNotation ? "bg-(--primary)/10 text-(--primary) font-semibold" : "text-(--foreground)"
                }`}
              >
                {learned ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" /> : <Clock className="h-3.5 w-3.5 shrink-0 text-(--muted-foreground)" />}
                <span className="flex-1 truncate">{alg.name}</span>
                <code className="hidden text-[10px] text-(--muted-foreground) sm:block truncate max-w-[120px]">{alg.notation}</code>
                {p?.reviewCount > 0 && <span className="shrink-0 rounded-full bg-(--muted) px-1.5 py-0.5 text-[9px] font-medium text-(--muted-foreground)">{p.reviewCount}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function parseNotation(notation) {
  return notation.split(/\s+/).filter(Boolean);
}

export default function ToolHome() {
  const [activeCategory, setActiveCategory] = useState("Beginner");
  const [expanded, setExpanded] = useState({});
  const [activeAlgo, setActiveAlgo] = useState(null);
  const [cube, setCube] = useState(() => solvedCube());
  const [progress, setProgress] = useState({});
  const [hydrated, setHydrated] = useState(false);
  const [practiceInput, setPracticeInput] = useState("");
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceResult, setPracticeResult] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [animatedMove, setAnimatedMove] = useState(null);
  const animRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed === "object") setProgress(parsed);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch {}
  }, [progress, hydrated]);

  useEffect(() => {
    return () => { if (animRef.current) clearTimeout(animRef.current); };
  }, []);

  const allAlgorithms = useMemo(() => Object.values(algorithmData).flat(), []);
  const categories = useMemo(() => Object.keys(algorithmData), []);

  const handleSelect = useCallback((alg) => {
    setActiveAlgo(alg);
    setShowSolution(false);
    setPracticeMode(false);
    setPracticeResult(null);
    setPracticeInput("");

    const solved = solvedCube();
    setCube(solved);

    const moves = parseNotation(alg.notation);
    let idx = 0;
    let current = solved;
    if (animRef.current) clearTimeout(animRef.current);
    const animate = () => {
      if (idx >= moves.length) { setAnimatedMove(null); return; }
      current = applyMove(current, moves[idx]);
      setCube(current);
      setAnimatedMove(moves[idx].replace(/[2']/g, ""));
      idx++;
      animRef.current = setTimeout(animate, 400);
    };
    animate();
  }, []);

  const handleReset = useCallback(() => {
    setCube(solvedCube());
    setActiveAlgo(null);
    setPracticeMode(false);
    setPracticeResult(null);
    setPracticeInput("");
    setShowSolution(false);
    if (animRef.current) clearTimeout(animRef.current);
  }, []);

  const handleToggleCategory = useCallback((cat) => {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }, []);

  const handleStartPractice = useCallback(() => {
    if (!activeAlgo) return;
    setPracticeMode(true);
    setPracticeResult(null);
    setPracticeInput("");
  }, [activeAlgo]);

  const handleCheckPractice = useCallback(() => {
    const normalized = practiceInput.trim().toUpperCase().replace(/\s+/g, " ").replace(/[^A-Z0-9' ]/g, "");
    const expected = activeAlgo.notation.toUpperCase().replace(/\s+/g, " ");
    const correct = normalized === expected;
    setPracticeResult(correct);

    setProgress((prev) => {
      const p = { ...(prev[activeAlgo.name] || { learned: false, reviewCount: 0, correctCount: 0, totalAttempts: 0 }) };
      return {
        ...prev,
        [activeAlgo.name]: {
          learned: correct ? true : p.learned,
          reviewCount: p.reviewCount + 1,
          correctCount: p.correctCount + (correct ? 1 : 0),
          totalAttempts: p.totalAttempts + 1,
        },
      };
    });
  }, [practiceInput, activeAlgo]);

  const handleViewSolution = useCallback(() => {
    setShowSolution(true);
  }, []);

  const totalLearned = useMemo(() => Object.values(progress).filter((p) => p.learned).length, [progress]);

  if (!hydrated) {
    return (
      <div className="mx-auto flex min-h-[300px] w-full max-w-4xl items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-(--primary) border-t-transparent" role="status"><span className="sr-only">Loading</span></div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-[8px] border border-(--border) bg-(--card) p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-(--foreground)">Rubik&apos;s Cube Algorithm Trainer</h1>
            <p className="mt-1 text-sm text-(--muted-foreground)">Learn and practice PLL, OLL, F2L, and beginner algorithms</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-[8px] border border-(--border) bg-(--background) px-3 py-1.5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">Learned</p>
              <p className="text-lg font-bold text-(--primary)">{totalLearned}/{allAlgorithms.length}</p>
            </div>
            <button onClick={handleReset} className="flex h-9 items-center gap-1.5 rounded-[7px] border border-(--border) bg-(--card) px-3 text-xs font-semibold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)" aria-label="Reset cube">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="rounded-[8px] border border-(--border) bg-(--card) p-4 sm:p-6">
            <h2 className="mb-3 text-sm font-bold text-(--foreground)">Cube Visualization</h2>
            <div className="flex justify-center overflow-x-auto">
              <CubeNet cube={cube} />
            </div>
            {activeAlgo && (
              <div className="mt-4 space-y-2">
                <div className="rounded-[6px] bg-(--background) p-3 text-center">
                  <p className="text-xs font-bold text-(--muted-foreground) uppercase tracking-wide">{activeAlgo.category}</p>
                  <p className="mt-0.5 text-base font-bold text-(--foreground)">{activeAlgo.name}</p>
                  <p className="text-xs text-(--muted-foreground)">{activeAlgo.description}</p>
                  <code className="mt-2 inline-block rounded-[4px] bg-(--muted) px-2 py-1 font-mono text-xs text-(--foreground)">{activeAlgo.notation}</code>
                </div>
                {animatedMove && (
                  <p className="text-center text-xs font-semibold text-(--primary) animate-pulse">Moving: {animatedMove}</p>
                )}
              </div>
            )}
            {!activeAlgo && (
              <div className="mt-4 rounded-[6px] bg-(--background) p-6 text-center">
                <Layers className="mx-auto h-8 w-8 text-(--muted-foreground)" />
                <p className="mt-2 text-sm text-(--muted-foreground)">Select an algorithm to see the cube state</p>
              </div>
            )}
          </div>

          {activeAlgo && (
            <div className="rounded-[8px] border border-(--border) bg-(--card) p-4 sm:p-6">
              <h2 className="mb-3 text-sm font-bold text-(--foreground)">Practice Mode</h2>
              {!practiceMode ? (
                <div className="flex gap-2">
                  <button onClick={handleStartPractice} className="flex h-9 items-center gap-1.5 rounded-[7px] bg-(--primary) px-4 text-xs font-bold text-white transition hover:opacity-90">
                    <Brain className="h-3.5 w-3.5" /> Start Practice
                  </button>
                  <button onClick={handleViewSolution} className="flex h-9 items-center gap-1.5 rounded-[7px] border border-(--border) bg-(--card) px-3 text-xs font-semibold text-(--foreground) transition hover:border-(--primary)">
                    <BookOpen className="h-3.5 w-3.5" /> Show Solution
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-[6px] bg-(--background) p-3 text-center">
                    <p className="text-xs font-bold text-(--muted-foreground) uppercase tracking-wide">Type the algorithm</p>
                    <p className="mt-1 text-sm text-(--foreground)">{activeAlgo.name}</p>
                  </div>
                  <input
                    type="text"
                    value={practiceInput}
                    onChange={(e) => setPracticeInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleCheckPractice(); }}
                    placeholder="e.g. R U R' U'"
                    className="w-full rounded-[7px] border border-(--border) bg-(--background) px-3 py-2 text-center font-mono text-sm text-(--foreground) outline-none ring-0 transition focus:border-(--primary) focus:ring-1 focus:ring-(--primary)/30"
                    aria-label="Type algorithm notation"
                    autoFocus
                  />
                  <div className="flex justify-center gap-2">
                    <button onClick={handleCheckPractice} className="flex h-9 items-center gap-1.5 rounded-[7px] bg-(--primary) px-4 text-xs font-bold text-white transition hover:opacity-90">
                      Check
                    </button>
                    <button onClick={() => { setPracticeMode(false); setPracticeResult(null); }} className="flex h-9 items-center rounded-[7px] border border-(--border) bg-(--card) px-3 text-xs font-semibold text-(--foreground) transition hover:border-(--primary)">
                      Cancel
                    </button>
                  </div>
                  <div aria-live="polite" role="status">
                    {practiceResult === true && (
                      <div className="flex items-center justify-center gap-2 rounded-[6px] bg-green-500/10 p-2 text-sm font-semibold text-green-600">
                        <CheckCircle2 className="h-4 w-4" /> Correct!
                      </div>
                    )}
                    {practiceResult === false && (
                      <div className="flex items-center justify-center gap-2 rounded-[6px] bg-red-500/10 p-2 text-sm font-semibold text-red-600">
                        <XCircle className="h-4 w-4" /> Incorrect. Expected: {activeAlgo.notation}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {showSolution && (
                <div className="mt-3 space-y-2 rounded-[6px] bg-(--background) p-3">
                  <p className="text-xs font-bold text-(--muted-foreground) uppercase tracking-wide">Solution Steps</p>
                  <div className="flex flex-wrap gap-1.5">
                    {parseNotation(activeAlgo.notation).map((move, i) => (
                      <code key={i} className="rounded-[4px] bg-(--muted) px-1.5 py-0.5 font-mono text-[11px] font-medium text-(--foreground)">{move}</code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setExpanded((prev) => ({ ...prev, [cat]: true })); }}
                className={`rounded-[7px] px-3 py-1.5 text-xs font-bold transition ${
                  activeCategory === cat
                    ? "bg-(--primary) text-white"
                    : "border border-(--border) bg-(--card) text-(--foreground) hover:border-(--primary) hover:text-(--primary)"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="max-h-[600px] space-y-2 overflow-y-auto overscroll-contain">
            {categories.map((cat) => (
              <CategorySection
                key={cat}
                category={cat}
                algorithms={algorithmData[cat]}
                expanded={expanded[cat] || activeCategory === cat}
                onToggle={() => handleToggleCategory(cat)}
                onSelect={handleSelect}
                progress={progress}
                activeNotation={activeAlgo?.notation}
              />
            ))}
          </div>
        </div>
      </div>

      {totalLearned > 0 && (
        <div className="rounded-[8px] border border-(--border) bg-(--card) p-4 sm:p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-(--foreground)">
            <Trophy className="h-4 w-4 text-amber-500" /> Your Progress
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-[6px] bg-(--background) p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">Learned</p>
              <p className="text-xl font-bold text-(--primary)">{totalLearned}</p>
            </div>
            <div className="rounded-[6px] bg-(--background) p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">Total</p>
              <p className="text-xl font-bold text-(--foreground)">{allAlgorithms.length}</p>
            </div>
            <div className="rounded-[6px] bg-(--background) p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">Progress</p>
              <p className="text-xl font-bold text-(--foreground)">{Math.round((totalLearned / allAlgorithms.length) * 100)}%</p>
            </div>
            <div className="rounded-[6px] bg-(--background) p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">Categories</p>
              <p className="text-xl font-bold text-(--foreground)">{categories.length}</p>
            </div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-(--muted)">
            <div className="h-full rounded-full bg-(--primary) transition-all duration-500" style={{ width: `${(totalLearned / allAlgorithms.length) * 100}%` }} role="progressbar" aria-valuenow={totalLearned} aria-valuemin={0} aria-valuemax={allAlgorithms.length} />
          </div>
        </div>
      )}
    </div>
  );
}

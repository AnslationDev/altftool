"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  Brain,
  ChessKnight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  Filter,
  Flame,
  HelpCircle,
  Lightbulb,
  Loader2,
  RotateCcw,
  Swords,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

const PIECE_GLYPH = {
  w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
};

const STORAGE_KEY = "altf:chess-puzzle:stats";

const CATEGORIES = [
  { id: "all", label: "All", icon: Swords },
  { id: "fork", label: "Forks", icon: ChessKnight },
  { id: "pin", label: "Pins", icon: Target },
  { id: "skewer", label: "Skewers", icon: Zap },
  { id: "discovered-attack", label: "Discovered", icon: Lightbulb },
  { id: "checkmate", label: "Checkmates", icon: Crown },
  { id: "endgame", label: "Endgames", icon: Brain },
];

const DIFFICULTIES = [
  { id: "all", label: "All" },
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

function parseFEN(fen) {
  const board = new Array(64).fill(null);
  const placement = fen.split(" ")[0];
  const ranks = placement.split("/");
  for (let r = 0; r < 8; r++) {
    let file = 0;
    const boardRank = 7 - r;
    for (const ch of ranks[r]) {
      if (ch >= "1" && ch <= "8") {
        file += parseInt(ch, 10);
      } else {
        const c = ch === ch.toUpperCase() ? "w" : "b";
        const t = ch.toLowerCase();
        board[boardRank * 8 + file] = { t, c };
        file++;
      }
    }
  }
  return board;
}

function cloneBoard(board) {
  return board.map((p) => (p ? { t: p.t, c: p.c } : null));
}

function applyMove(board, from, to) {
  const next = cloneBoard(board);
  next[to] = next[from];
  next[from] = null;
  return next;
}

function squareName(sq) {
  return FILES[sq % 8] + (Math.floor(sq / 8) + 1);
}

function uciToSquares(uci) {
  const from = FILES.indexOf(uci[0]) + (parseInt(uci[1], 10) - 1) * 8;
  const to = FILES.indexOf(uci[2]) + (parseInt(uci[3], 10) - 1) * 8;
  return [from, to];
}

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { solved: 0, attempts: 0, streak: 0, bestStreak: 0, totalScore: 0 };
}

function saveStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {}
}

const PUZZLES = [
  {
    id: 1,
    fen: "r3k3/8/8/3N4/1P6/8/8/4K3 w - - 0 1",
    solution: ["d5c7"],
    category: "fork",
    difficulty: "easy",
    description:
      "A knight fork attacks two pieces simultaneously. Here Nc7+ forks the king on e8 and the rook on a8. The b6 pawn defends the knight, making Kxc7 illegal.",
    hint: "Look for a knight that can reach c7.",
  },
  {
    id: 2,
    fen: "r1bq1rk1/pppp1ppp/2n5/6N1/2B5/8/PPPP1PPP/RNBQ1RK1 w - - 0 1",
    solution: ["g5f7"],
    category: "fork",
    difficulty: "medium",
    description:
      "Nxf7+ forks the queen on d8 and the rook on h8 while giving check. The bishop on c4 defends f7, preventing capture by the king.",
    hint: "The knight on g5 can leap to a powerful square.",
  },
  {
    id: 3,
    fen: "r1bqkb1r/ppp2ppp/3n4/8/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1",
    solution: ["e4e5"],
    category: "fork",
    difficulty: "hard",
    description:
      "Push the pawn to e5, forking the knight on d6 and the knight on f6. One of them must be lost.",
    hint: "A pawn advance can attack two pieces at once.",
  },
  {
    id: 4,
    fen: "4k3/8/2n5/1B6/8/8/8/4K3 w - - 0 1",
    solution: ["b5c6"],
    category: "pin",
    difficulty: "easy",
    description:
      "The knight on c6 is pinned to the king by the bishop on b5. Bxc6 wins the knight because it cannot move away.",
    hint: "Look for a piece that cannot move without exposing the king.",
  },
  {
    id: 5,
    fen: "4k3/8/3q4/8/8/8/8/3R2K1 w - - 0 1",
    solution: ["d1d6"],
    category: "pin",
    difficulty: "medium",
    description:
      "The queen on d6 is pinned to the king on e8. Rxd6 wins the queen — she cannot escape along the d-file.",
    hint: "A rook on the same file as the enemy king can pin the queen.",
  },
  {
    id: 6,
    fen: "4k3/2q5/8/1r6/B7/8/8/4K3 w - - 0 1",
    solution: ["a4b5"],
    category: "pin",
    difficulty: "hard",
    description:
      "The rook on b5 is pinned to the queen on c7 by the bishop on a4. Bxb5 wins the rook.",
    hint: "Trace the diagonal from the bishop through the rook to the queen.",
  },
  {
    id: 7,
    fen: "4q3/4k3/8/8/8/8/8/4R1K1 w - - 0 1",
    solution: ["e1e5"],
    category: "skewer",
    difficulty: "easy",
    description:
      "Re5+ skewers the king on e7 to the queen on e8. After the king moves, Rxe8 wins the queen.",
    hint: "Place the rook on the e-file between the king and the queen.",
  },
  {
    id: 8,
    fen: "6rk/8/4k3/8/8/1B6/8/4K3 w - - 0 1",
    solution: ["b3c4"],
    category: "skewer",
    difficulty: "medium",
    description:
      "Bc4+ skewers the king on e6 to the rook on h8. After the king moves, Bxg8 wins the rook.",
    hint: "Move the bishop along the diagonal toward the king.",
  },
  {
    id: 9,
    fen: "7r/8/8/4k3/8/8/8/Q5K1 w - - 0 1",
    solution: ["a1d4"],
    category: "skewer",
    difficulty: "hard",
    description:
      "Qd4+ skewers the king on e5 to the rook on h8. The king cannot capture because the white king on g1 defends d4.",
    hint: "A queen can skewer from afar when defended by the king.",
  },
  {
    id: 10,
    fen: "3qk3/8/8/8/8/8/N7/R5K1 w - - 0 1",
    solution: ["a2c3"],
    category: "discovered-attack",
    difficulty: "easy",
    description:
      "Move the knight from a2 to c3, discovering an attack by the rook on a1 against the queen on a8.",
    hint: "The knight is blocking the rook's line to the queen.",
  },
  {
    id: 11,
    fen: "4k3/8/8/4N3/8/8/8/4R1K1 w - - 0 1",
    solution: ["e5f7"],
    category: "discovered-attack",
    difficulty: "medium",
    description:
      "Nf7+ gives double check — the knight checks and discovers check from the rook. The king must move, and Nxd8 follows.",
    hint: "A knight move can unveil a rook check while also giving check itself.",
  },
  {
    id: 12,
    fen: "4k3/8/8/8/4r3/3N4/2B5/6K1 w - - 0 1",
    solution: ["d3e1"],
    category: "discovered-attack",
    difficulty: "hard",
    description:
      "Move the knight from d3 to e1, discovering an attack by the bishop on c2 against the rook on e4.",
    hint: "The knight is between the bishop and the enemy rook.",
  },
  {
    id: 13,
    fen: "k7/p7/2Q5/8/8/8/8/K7 w - - 0 1",
    solution: ["c6c8"],
    category: "checkmate",
    difficulty: "easy",
    description:
      "Qc8# delivers checkmate. The black pawn on a7 blocks the king's only escape, while the queen attacks both b7 and b8.",
    hint: "The black king is trapped on a8 by its own pawn.",
  },
  {
    id: 14,
    fen: "k7/8/1Q6/8/8/8/8/6BK w - - 0 1",
    solution: ["b6a7"],
    category: "checkmate",
    difficulty: "medium",
    description:
      "Qa7# is checkmate. The queen attacks a8 while the bishop on g1 defends the queen, preventing Kxa7.",
    hint: "The bishop on g1 defends the queen from capture.",
  },
  {
    id: 15,
    fen: "k7/p7/2K5/8/8/8/8/3R4 w - - 0 1",
    solution: ["d1d8"],
    category: "checkmate",
    difficulty: "hard",
    description:
      "Rd8# is checkmate. The black king is trapped by its own pawn on a7, and the white king on c6 prevents escape to b7.",
    hint: "The white king's proximity blocks the black king's only escape square.",
  },
  {
    id: 16,
    fen: "8/8/8/3k4/8/3K4/8/8 w - - 0 1",
    solution: ["d3e3"],
    category: "endgame",
    difficulty: "easy",
    description:
      "Take the opposition! Ke3 forces the black king to give ground. The kings face off, and since it's black's turn, white gains the advantage.",
    hint: "Place your king directly opposite the enemy king.",
  },
  {
    id: 17,
    fen: "4k3/8/8/8/8/8/1P6/4K3 w - - 0 1",
    solution: ["b2b4"],
    category: "endgame",
    difficulty: "medium",
    description:
      "Push the passed pawn! The black king is far enough that the pawn can advance. White promotes with check, winning the queen.",
    hint: "A passed pawn on the b-file has a clear path to promotion.",
  },
  {
    id: 18,
    fen: "8/8/8/8/8/5k2/6P1/6K1 w - - 0 1",
    solution: ["g2g4"],
    category: "endgame",
    difficulty: "hard",
    description:
      "Push the pawn two squares! The black king is just outside the square of the pawn. Accurate play leads to promotion.",
    hint: "Count the squares from the pawn to promotion versus the king's path.",
  },
];

function PuzzleBoard({
  board,
  selected,
  lastMove,
  showHint,
  hintSquare,
  puzzleSolved,
  puzzleFailed,
  onSquareClick,
}) {
  const checkSq = (() => {
    for (let sq = 0; sq < 64; sq++) {
      const p = board[sq];
      if (p && p.t === "k") return sq;
    }
    return -1;
  })();

  const order = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const file = col;
      const rank = 7 - row;
      order.push({ sq: rank * 8 + file, file, rank });
    }
  }

  return (
    <div className="mx-auto w-full max-w-[min(88vw,480px)]">
      <div className="overflow-hidden rounded-2xl border border-(--border) shadow-sm">
        <div className="grid grid-cols-8" role="grid" aria-label="Chess board">
          {order.map(({ sq, file, rank }) => {
            const piece = board[sq];
            const isLight = (file + rank) % 2 === 1;
            const isSelected = selected === sq;
            const isLast =
              lastMove && (lastMove.from === sq || lastMove.to === sq);
            const isCheck =
              checkSq >= 0 &&
              board[checkSq] &&
              board[checkSq].c === "b" &&
              sq === checkSq;

            const bg = isLight
              ? "bg-(--muted)/60"
              : "bg-(--primary)/15";
            const ring = isSelected
              ? "ring-3 ring-(--primary) ring-inset z-10"
              : isLast
              ? "ring-2 ring-(--secondary)/70 ring-inset"
              : "";
            const hintGlow =
              showHint && hintSquare === sq
                ? "animate-pulse ring-3 ring-yellow-400 ring-inset z-10"
                : "";
            const checkBg = isCheck ? "bg-red-500/30" : "";
            const disabled = puzzleSolved || puzzleFailed;

            return (
              <button
                key={sq}
                type="button"
                data-sq={sq}
                onClick={() => !disabled && onSquareClick(sq)}
                className={`relative flex aspect-square items-center justify-center outline-none transition-colors focus-visible:ring-3 focus-visible:ring-(--primary) ${bg} ${ring} ${hintGlow} ${checkBg}`}
                aria-label={`${piece ? `${piece.c === "w" ? "white" : "black"} ${pieceTypeName(piece.t)}` : "empty"} ${FILES[file]}${rank + 1}`}
                disabled={disabled}
              >
                {rank === 0 && file === 0 && (
                  <span
                    className={`absolute bottom-0.5 left-0.5 text-[9px] font-semibold leading-none ${
                      isLight
                        ? "text-(--muted-foreground)/70"
                        : "text-white/70"
                    }`}
                  >
                    a1
                  </span>
                )}
                {rank === 0 && file === 7 && (
                  <span
                    className={`absolute bottom-0.5 right-0.5 text-[9px] font-semibold leading-none ${
                      isLight
                        ? "text-(--muted-foreground)/70"
                        : "text-white/70"
                    }`}
                  >
                    h1
                  </span>
                )}

                {piece && (
                  <span
                    className={`pointer-events-none select-none text-center text-[clamp(20px,6.5vw,42px)] leading-none ${
                      piece.c === "w"
                        ? "text-(--background) [-webkit-text-stroke:1.5px_var(--foreground)] drop-shadow-sm"
                        : "text-(--foreground) drop-shadow-sm"
                    }`}
                    aria-hidden="true"
                  >
                    {PIECE_GLYPH[piece.c][piece.t]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function pieceTypeName(t) {
  return (
    { k: "king", q: "queen", r: "rook", b: "bishop", n: "knight", p: "pawn" }[
      t
    ] || ""
  );
}

export default function ChessPuzzleTrainer() {
  const [loading, setLoading] = useState(true);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [board, setBoard] = useState(null);
  const [selected, setSelected] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [step, setStep] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [puzzleStatus, setPuzzleStatus] = useState("playing");
  const [timer, setTimer] = useState(0);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [stats, setStats] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [animatingSolution, setAnimatingSolution] = useState(false);
  const [solutionBoard, setSolutionBoard] = useState(null);
  const [solutionStep, setSolutionStep] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);

  const timerRef = useRef(null);
  const solutionTimerRef = useRef(null);

  const puzzle = useMemo(() => {
    const filtered = PUZZLES.filter((p) => {
      if (filterCategory !== "all" && p.category !== filterCategory)
        return false;
      if (filterDifficulty !== "all" && p.difficulty !== filterDifficulty)
        return false;
      return true;
    });
    return filtered[puzzleIndex] || null;
  }, [puzzleIndex, filterCategory, filterDifficulty]);

  const filteredPuzzles = useMemo(() => {
    return PUZZLES.filter((p) => {
      if (filterCategory !== "all" && p.category !== filterCategory)
        return false;
      if (filterDifficulty !== "all" && p.difficulty !== filterDifficulty)
        return false;
      return true;
    });
  }, [filterCategory, filterDifficulty]);

  const hintSquare = useMemo(() => {
    if (!puzzle || step >= puzzle.solution.length) return null;
    const [from] = uciToSquares(puzzle.solution[step]);
    return from;
  }, [puzzle, step]);

  useEffect(() => {
    setStats(loadStats());
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (puzzle) {
      setBoard(parseFEN(puzzle.fen));
      setSelected(null);
      setLastMove(null);
      setStep(0);
      setWrongAttempts(0);
      setShowHint(false);
      setPuzzleStatus("playing");
      setTimer(0);
      setShowSolution(false);
      setAnimatingSolution(false);
      setSolutionBoard(null);
      setSolutionStep(0);
    }
  }, [puzzle]);

  useEffect(() => {
    if (puzzleStatus === "playing") {
      timerRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [puzzleStatus]);

  useEffect(() => {
    if (puzzleStatus === "solved" || puzzleStatus === "failed") {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [puzzleStatus]);

  useEffect(() => {
    if (showSolution && puzzle) {
      setAnimatingSolution(true);
      const b = parseFEN(puzzle.fen);
      setSolutionBoard(b);
      setSolutionStep(0);

      solutionTimerRef.current = setInterval(() => {
        setSolutionStep((prev) => {
          const next = prev + 1;
          if (next > puzzle.solution.length) {
            clearInterval(solutionTimerRef.current);
            setAnimatingSolution(false);
            return prev;
          }
          setSolutionBoard((cur) => {
            if (!cur) return cur;
            const [from, to] = uciToSquares(puzzle.solution[next - 1]);
            return applyMove(cur, from, to);
          });
          return next;
        });
      }, 1200);

      return () => {
        if (solutionTimerRef.current) clearInterval(solutionTimerRef.current);
      };
    }
  }, [showSolution, puzzle]);

  const handleSquareClick = useCallback(
    (sq) => {
      if (
        !board ||
        puzzleStatus !== "playing" ||
        animatingSolution ||
        showSolution
      )
        return;

      const piece = board[sq];

      if (selected === null) {
        if (piece && piece.c === "w") {
          setSelected(sq);
        }
        return;
      }

      if (sq === selected) {
        setSelected(null);
        return;
      }

      if (piece && piece.c === "w") {
        setSelected(sq);
        return;
      }

      const moveUci = squareName(selected) + squareName(sq);
      const expected = puzzle ? puzzle.solution[step] : null;

      if (moveUci === expected) {
        const nextBoard = applyMove(board, selected, sq);
        setBoard(nextBoard);
        setLastMove({ from: selected, to: sq });
        setSelected(null);

        const nextStep = step + 1;
        if (nextStep >= puzzle.solution.length) {
          setPuzzleStatus("solved");
          const pts = puzzle.difficulty === "easy" ? 10 : puzzle.difficulty === "medium" ? 20 : 30;
          setStats((prev) => {
            const next = {
              ...prev,
              solved: prev.solved + 1,
              attempts: prev.attempts + 1,
              streak: prev.streak + 1,
              bestStreak: Math.max(prev.bestStreak, prev.streak + 1),
              totalScore: prev.totalScore + pts,
            };
            saveStats(next);
            return next;
          });
        } else {
          setStep(nextStep);
          setWrongAttempts(0);
        }
      } else {
        const newWrong = wrongAttempts + 1;
        setWrongAttempts(newWrong);
        setSelected(null);

        if (newWrong >= 3) {
          setPuzzleStatus("failed");
          setStats((prev) => {
            const next = {
              ...prev,
              attempts: prev.attempts + 1,
              streak: 0,
            };
            saveStats(next);
            return next;
          });
        }
      }
    },
    [board, selected, step, wrongAttempts, puzzle, puzzleStatus, animatingSolution, showSolution]
  );

  const handleHint = useCallback(() => {
    setShowHint(true);
    setTimeout(() => setShowHint(false), 2000);
  }, []);

  const handleShowSolution = useCallback(() => {
    setShowSolution(true);
  }, []);

  const handleNext = useCallback(() => {
    if (puzzleIndex < filteredPuzzles.length - 1) {
      setPuzzleIndex((i) => i + 1);
    }
  }, [puzzleIndex, filteredPuzzles.length]);

  const handlePrev = useCallback(() => {
    if (puzzleIndex > 0) {
      setPuzzleIndex((i) => i - 1);
    }
  }, [puzzleIndex]);

  const handleSkip = useCallback(() => {
    setPuzzleStatus("skipped");
    handleShowSolution();
  }, [handleShowSolution]);

  const handleReset = useCallback(() => {
    if (puzzle) {
      setBoard(parseFEN(puzzle.fen));
      setSelected(null);
      setLastMove(null);
      setStep(0);
      setWrongAttempts(0);
      setShowHint(false);
      setPuzzleStatus("playing");
      setTimer(0);
      setShowSolution(false);
      setAnimatingSolution(false);
      setSolutionBoard(null);
      setSolutionStep(0);
    }
  }, [puzzle]);

  const displayBoard =
    animatingSolution || showSolution
      ? solutionBoard || board
      : board;

  const progressPercent = puzzle
    ? Math.round((step / puzzle.solution.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-(--background) p-4 text-(--foreground) md:p-8">
        <div className="mx-auto max-w-2xl py-20 text-center">
          <div className="flex items-center justify-center gap-2 text-(--muted-foreground)">
            <Loader2 className="animate-spin" size={20} /> Loading puzzles&hellip;
          </div>
        </div>
      </div>
    );
  }

  if (filteredPuzzles.length === 0) {
    return (
      <div className="min-h-screen bg-(--background) p-4 text-(--foreground) md:p-8">
        <div className="mx-auto max-w-2xl py-20 text-center">
          <div className="mb-3 inline-flex rounded-full border border-(--primary)/30 bg-(--primary)/10 px-4 py-1.5 text-xs font-semibold text-(--primary)">
            Puzzle · Trainer
          </div>
          <h1 className="section-title tool-heading-accent text-2xl font-bold">
            Chess Puzzle Trainer
          </h1>
          <p className="mt-3 text-(--muted-foreground)">
            No puzzles match the selected filters. Try adjusting your criteria.
          </p>
        </div>
      </div>
    );
  }

  if (!puzzle) return null;

  const categoryMeta = CATEGORIES.find(
    (c) => c.id === puzzle.category
  );

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground)">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
        <div className="mb-4 text-center md:mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-(--primary)/30 bg-(--primary)/10 px-4 py-1.5 text-xs font-semibold text-(--primary)">
            <ChessKnight size={14} /> Puzzle · Trainer
          </div>
          <h1 className="section-title tool-heading-accent text-2xl font-bold md:text-3xl">
            Chess Puzzle Trainer
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-(--muted-foreground)">
            Sharpen your tactical vision. Solve curated puzzles, track your
            progress, and master every motif.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-(--border) bg-(--card) px-3 py-2 text-xs">
            <Trophy size={14} className="text-yellow-500" />
            <span className="font-semibold">{stats?.solved ?? 0}</span>
            <span className="text-(--muted-foreground)">solved</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-(--border) bg-(--card) px-3 py-2 text-xs">
            <Flame size={14} className="text-orange-500" />
            <span className="font-semibold">{stats?.streak ?? 0}</span>
            <span className="text-(--muted-foreground)">streak</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-(--border) bg-(--card) px-3 py-2 text-xs">
            <Award size={14} className="text-(--primary)" />
            <span className="font-semibold">{stats?.totalScore ?? 0}</span>
            <span className="text-(--muted-foreground)">score</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-(--border) bg-(--card) px-3 py-2 text-xs">
            <Clock size={14} className="text-(--secondary)" />
            <span className="font-semibold">{formatTimer(timer)}</span>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          <div className="flex items-center gap-1 text-xs text-(--muted-foreground)">
            <Filter size={13} /> Filter:
          </div>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setFilterCategory(cat.id);
                  setPuzzleIndex(0);
                }}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filterCategory === cat.id
                    ? "bg-(--primary) text-white shadow-sm"
                    : "border border-(--border) bg-(--card) text-(--muted-foreground) hover:border-(--primary)/40 hover:text-(--foreground)"
                }`}
              >
                <Icon size={12} />
                {cat.label}
              </button>
            );
          })}
          <span className="mx-1 text-(--border)">|</span>
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                setFilterDifficulty(d.id);
                setPuzzleIndex(0);
              }}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filterDifficulty === d.id
                  ? "bg-(--primary) text-white shadow-sm"
                  : "border border-(--border) bg-(--card) text-(--muted-foreground) hover:border-(--primary)/40 hover:text-(--foreground)"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-full text-center">
              <span
                className={`inline-block rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                  puzzle.difficulty === "easy"
                    ? "bg-green-500/15 text-green-600"
                    : puzzle.difficulty === "medium"
                    ? "bg-yellow-500/15 text-yellow-600"
                    : "bg-red-500/15 text-red-600"
                }`}
              >
                {puzzle.difficulty}
              </span>
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-(--muted-foreground)">
                {categoryMeta && <categoryMeta.icon size={12} />}
                {categoryMeta?.label ?? puzzle.category}
              </span>
              <span className="ml-2 text-xs text-(--muted-foreground)">
                {puzzleIndex + 1} / {filteredPuzzles.length}
              </span>
            </div>

            <div className="mb-2 h-1.5 w-full max-w-[min(88vw,480px)] overflow-hidden rounded-full bg-(--border)">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  puzzleStatus === "solved"
                    ? "bg-green-500"
                    : puzzleStatus === "failed"
                    ? "bg-red-500"
                    : "bg-(--primary)"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <PuzzleBoard
              board={displayBoard}
              selected={selected}
              lastMove={lastMove}
              showHint={showHint}
              hintSquare={hintSquare}
              puzzleSolved={puzzleStatus === "solved"}
              puzzleFailed={puzzleStatus === "failed" || puzzleStatus === "skipped"}
              onSquareClick={handleSquareClick}
            />

            <div className="flex flex-wrap items-center justify-center gap-2">
              {puzzleStatus === "playing" && (
                <>
                  <button
                    onClick={handleHint}
                    disabled={showHint}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-(--border) bg-(--card) px-3 py-2 text-xs font-medium text-(--foreground) transition-colors hover:border-yellow-400/50 hover:text-yellow-500 disabled:opacity-50"
                  >
                    <Lightbulb size={14} /> Hint
                  </button>
                  <button
                    onClick={handleSkip}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-(--border) bg-(--card) px-3 py-2 text-xs font-medium text-(--muted-foreground) transition-colors hover:border-red-400/50 hover:text-red-500"
                  >
                    Give Up
                  </button>
                </>
              )}

              {(puzzleStatus === "solved" ||
                puzzleStatus === "failed" ||
                puzzleStatus === "skipped") && (
                <>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-(--border) bg-(--card) px-3 py-2 text-xs font-medium text-(--foreground) transition-colors hover:border-(--primary)/50 hover:text-(--primary)"
                  >
                    <RotateCcw size={14} /> Retry
                  </button>
                  {puzzleIndex < filteredPuzzles.length - 1 && (
                    <button
                      onClick={handleNext}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-(--primary) px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-(--primary)/90"
                    >
                      Next Puzzle <ChevronRight size={14} />
                    </button>
                  )}
                </>
              )}
            </div>

            {(puzzleStatus === "solved" ||
              puzzleStatus === "failed" ||
              puzzleStatus === "skipped") && (
              <div className="w-full max-w-[min(88vw,480px)] rounded-xl border border-(--border) bg-(--card) p-4">
                <div className="flex items-center gap-2">
                  {puzzleStatus === "solved" ? (
                    <Trophy size={18} className="text-yellow-500" />
                  ) : (
                    <Target size={18} className="text-red-500" />
                  )}
                  <span
                    className={`text-sm font-bold ${
                      puzzleStatus === "solved"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {puzzleStatus === "solved"
                      ? `Solved! +${puzzle.difficulty === "easy" ? 10 : puzzle.difficulty === "medium" ? 20 : 30} pts`
                      : puzzleStatus === "failed"
                      ? "Failed — 3 wrong attempts"
                      : "Skipped"}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-(--muted-foreground)">
                  {puzzle.description}
                </p>
              </div>
            )}

            {!showSolution && puzzleStatus === "failed" && (
              <button
                onClick={handleShowSolution}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-(--primary) transition-colors hover:text-(--primary)/80"
              >
                <HelpCircle size={14} /> Show Solution
              </button>
            )}
          </div>

          {showSidebar && (
            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-(--border) bg-(--card) p-4">
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                  <Swords size={14} className="text-(--primary)" />
                  Puzzle Library
                </h3>
                <div className="max-h-[400px] space-y-1 overflow-y-auto pr-1">
                  {filteredPuzzles.map((p, i) => {
                    const cat = CATEGORIES.find((c) => c.id === p.category);
                    const isActive = i === puzzleIndex;
                    const isSolved =
                      stats &&
                      p.id <=
                        filteredPuzzles.reduce(
                          (max, _, idx) =>
                            idx < puzzleIndex ? Math.max(max, p.id) : max,
                          0
                        );
                    return (
                      <button
                        key={p.id}
                        onClick={() => setPuzzleIndex(i)}
                        className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                          isActive
                            ? "bg-(--primary)/10 text-(--primary) font-semibold"
                            : "text-(--muted-foreground) hover:bg-(--card)/80 hover:text-(--foreground)"
                        }`}
                      >
                        {cat && <cat.icon size={12} />}
                        <span className="flex-1 truncate">
                          {cat?.label ?? p.category}
                        </span>
                        <span
                          className={`shrink-0 text-[10px] ${
                            p.difficulty === "easy"
                              ? "text-green-500"
                              : p.difficulty === "medium"
                              ? "text-yellow-500"
                              : "text-red-500"
                          }`}
                        >
                          {p.difficulty[0].toUpperCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-(--border) bg-(--card) p-4">
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                  <Brain size={14} className="text-(--primary)" />
                  Stats
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-(--background)/50 p-2">
                    <p className="text-(--muted-foreground)">Solved</p>
                    <p className="text-lg font-bold">{stats?.solved ?? 0}</p>
                  </div>
                  <div className="rounded-lg bg-(--background)/50 p-2">
                    <p className="text-(--muted-foreground)">Total Attempts</p>
                    <p className="text-lg font-bold">
                      {stats?.attempts ?? 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-(--background)/50 p-2">
                    <p className="text-(--muted-foreground)">Streak</p>
                    <p className="text-lg font-bold">{stats?.streak ?? 0}</p>
                  </div>
                  <div className="rounded-lg bg-(--background)/50 p-2">
                    <p className="text-(--muted-foreground)">Best Streak</p>
                    <p className="text-lg font-bold">
                      {stats?.bestStreak ?? 0}
                    </p>
                  </div>
                  <div className="col-span-2 rounded-lg bg-(--background)/50 p-2">
                    <p className="text-(--muted-foreground)">Total Score</p>
                    <p className="text-lg font-bold">
                      {stats?.totalScore ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  disabled={puzzleIndex === 0}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-(--border) bg-(--card) px-3 py-2 text-xs font-medium text-(--muted-foreground) transition-colors hover:border-(--primary)/30 hover:text-(--foreground) disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <button
                  onClick={handleNext}
                  disabled={puzzleIndex >= filteredPuzzles.length - 1}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-(--border) bg-(--card) px-3 py-2 text-xs font-medium text-(--muted-foreground) transition-colors hover:border-(--primary)/30 hover:text-(--foreground) disabled:opacity-40"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="mt-8 text-center text-xs text-(--muted-foreground)">
          <ChessKnight
            size={14}
            className="mx-auto mb-1 text-(--primary)"
          />
          ALTFTool Chess Puzzle Trainer — sharpen your tactics.
        </footer>
      </div>
    </div>
  );
}

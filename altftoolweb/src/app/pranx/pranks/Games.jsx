"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useInterval } from "../hooks/useInterval";
import { panelClass, secondaryButton, primaryButton } from "../components/uiClasses";
import { Trophy, Timer, Play, Pause, RefreshCw, Flag, Sparkles } from "lucide-react";

// Web Audio Helper for Game Sound Effects
const playSFX = (type) => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const t = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  if (type === "click") {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(1000, t + 0.05);
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + 0.06);
  } else if (type === "flag") {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.setValueAtTime(600, t + 0.04);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + 0.09);
  } else if (type === "explode") {
    // Noise + low frequency drop
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(40, t + 0.45);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
    noise.connect(filter);
    filter.connect(gain);
    noise.start(t);
    noise.stop(t + 0.5);
  } else if (type === "win") {
    // Upward arpeggio
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.08, t + idx * 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + 0.15);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t + idx * 0.1);
      osc.stop(t + idx * 0.1 + 0.16);
    });
  } else if (type === "move") {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, t);
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + 0.04);
  } else if (type === "clear") {
    // High double tone
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.16);
    });
  } else if (type === "thump") {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(80, t);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + 0.09);
  }
};

// PREMIUM MINESWEEPER REDESIGN
export function Minesweeper() {
  const [difficulty, setDifficulty] = useState("easy"); // "easy" (9x9, 10 mines) | "medium" (12x12, 22 mines)
  const size = difficulty === "easy" ? 9 : 12;
  const mines = difficulty === "easy" ? 10 : 22;

  const createBoard = useCallback(() => {
    const mineSet = new Set();
    while (mineSet.size < mines) {
      mineSet.add(Math.floor(Math.random() * size * size));
    }
    return Array.from({ length: size * size }, (_, index) => ({
      mine: mineSet.has(index),
      open: false,
      flag: false,
    }));
  }, [size, mines]);

  const [board, setBoard] = useState(createBoard);
  const [status, setStatus] = useState("playing"); // "playing" | "won" | "lost"
  const [time, setTime] = useState(0);
  const [isFaceSurprised, setIsFaceSurprised] = useState(false);

  // Time tracker
  useInterval(() => {
    if (status === "playing" && time < 999) {
      setTime((prev) => prev + 1);
    }
  }, 1000, status === "playing");

  const restartGame = () => {
    setBoard(createBoard());
    setStatus("playing");
    setTime(0);
  };

  useEffect(() => {
    restartGame();
  }, [difficulty, createBoard]);

  const around = (index) => {
    const x = index % size;
    const y = Math.floor(index / size);
    return [-1, 0, 1]
      .flatMap((dy) => [-1, 0, 1].map((dx) => ({ x: x + dx, y: y + dy })))
      .filter((p) => !(p.x === x && p.y === y) && p.x >= 0 && p.y >= 0 && p.x < size && p.y < size)
      .map((p) => p.y * size + p.x);
  };

  const count = (index, source = board) => around(index).filter((i) => source[i].mine).length;

  const open = (index) => {
    if (status !== "playing") return;
    playSFX("click");
    setBoard((current) => {
      if (current[index].flag || current[index].open) return current;
      const next = current.map((cell) => ({ ...cell }));

      if (next[index].mine) {
        next[index].open = true;
        setStatus("lost");
        playSFX("explode");
        // Reveal all mines
        next.forEach((cell) => {
          if (cell.mine) cell.open = true;
        });
        return next;
      }

      const queue = [index];
      while (queue.length) {
        const currentIndex = queue.pop();
        if (next[currentIndex].open || next[currentIndex].flag) continue;
        next[currentIndex].open = true;
        if (count(currentIndex, next) === 0) {
          around(currentIndex).forEach((i) => !next[i].open && queue.push(i));
        }
      }

      const openedSafeCount = next.filter((cell) => !cell.mine && cell.open).length;
      if (openedSafeCount === size * size - mines) {
        setStatus("won");
        playSFX("win");
      }
      return next;
    });
  };

  const handleRightClick = (e, index) => {
    e.preventDefault();
    if (status !== "playing") return;
    playSFX("flag");
    setBoard((current) =>
      current.map((item, i) => (i === index ? { ...item, flag: !item.flag } : item))
    );
  };

  const flagCount = board.filter((c) => c.flag).length;
  const remainingMines = Math.max(0, mines - flagCount);

  const getFaceEmoji = () => {
    if (status === "won") return "😎";
    if (status === "lost") return "💀";
    if (isFaceSurprised) return "😮";
    return "😊";
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[auto_1fr] bg-slate-900 p-6 rounded-3xl border border-white/10 shadow-2xl">
      <div className="flex flex-col items-center">
        {/* Difficulty controls */}
        <div className="flex gap-2 mb-4 w-full justify-between">
          <button
            onClick={() => setDifficulty("easy")}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition ${
              difficulty === "easy" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Easy (9x9)
          </button>
          <button
            onClick={() => setDifficulty("medium")}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition ${
              difficulty === "medium" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Medium (12x12)
          </button>
        </div>

        {/* Retro Header bar */}
        <div className="w-full bg-slate-950 p-4 border border-white/10 rounded-2xl flex items-center justify-between mb-4 shadow-inner">
          <div className="font-mono text-xl font-bold text-red-500 bg-red-950/20 px-3 py-1 rounded border border-red-900/30 w-16 text-center">
            {String(remainingMines).padStart(3, "0")}
          </div>

          <button
            onClick={restartGame}
            onMouseDown={() => setIsFaceSurprised(true)}
            onMouseUp={() => setIsFaceSurprised(false)}
            className="w-12 h-12 bg-slate-800 hover:bg-slate-700 border-2 border-white/10 active:border-white/20 rounded-xl grid place-items-center text-2xl shadow-md transition"
            aria-label="Restart Game"
          >
            {getFaceEmoji()}
          </button>

          <div className="font-mono text-xl font-bold text-red-500 bg-red-950/20 px-3 py-1 rounded border border-red-900/30 w-16 text-center">
            {String(time).padStart(3, "0")}
          </div>
        </div>

        {/* Minesweeper Grid board */}
        <div
          className="grid gap-1 bg-slate-950 p-3 rounded-2xl border border-white/5"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            width: difficulty === "easy" ? "min(90vw, 22rem)" : "min(90vw, 28rem)",
          }}
        >
          {board.map((cell, index) => {
            const numAround = count(index);
            const digitColors = ["", "text-blue-400", "text-emerald-400", "text-red-400", "text-violet-400", "text-amber-500", "text-cyan-400", "text-black", "text-slate-400"];
            return (
              <button
                key={index}
                onClick={() => open(index)}
                onContextMenu={(e) => handleRightClick(e, index)}
                onMouseDown={() => status === "playing" && setIsFaceSurprised(true)}
                onMouseUp={() => setIsFaceSurprised(false)}
                className={`aspect-square rounded-lg text-base font-black transition duration-150 flex items-center justify-center border ${
                  cell.open
                    ? "bg-slate-800 border-slate-700 text-slate-100"
                    : "bg-slate-700 border-slate-600 hover:bg-slate-600 text-white shadow-md"
                }`}
              >
                {cell.open ? (
                  cell.mine ? (
                    "💥"
                  ) : (
                    <span className={digitColors[numAround]}>{numAround || ""}</span>
                  )
                ) : cell.flag ? (
                  <span className="text-red-500">🚩</span>
                ) : (
                  ""
                )}
              </button>
            );
          })}
        </div>
      </div>

      <GameHelp
        title="Minesweeper Intel"
        lines={[
          "Left click reveals a square.",
          "Right click places a warning flag (🚩).",
          "Numbers indicate how many mines are adjacent.",
          "Open all safe blocks to achieve total victory.",
        ]}
      />
    </section>
  );
}

export function GameHelp({ title, lines }) {
  return (
    <aside className="bg-slate-950 p-6 rounded-2xl border border-white/5 h-fit shadow-lg flex flex-col justify-center">
      <h3 className="text-lg font-black text-indigo-400 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-indigo-400" /> {title}
      </h3>
      <div className="mt-4 grid gap-2.5">
        {lines.map((line) => (
          <p key={line} className="rounded-xl bg-white/[0.04] p-3 text-xs font-bold text-slate-300 leading-relaxed">
            {line}
          </p>
        ))}
      </div>
    </aside>
  );
}

// TETRIS GAME REDESIGN
const tetrominoes = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  L: [[1, 0], [1, 0], [1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
};

const blockColors = {
  I: "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)] border-cyan-400",
  O: "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.6)] border-yellow-400",
  T: "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)] border-purple-400",
  L: "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)] border-orange-400",
  S: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] border-emerald-400",
};

export function TetrisGame() {
  const width = 10;
  const height = 18;
  const empty = () => Array.from({ length: height }, () => Array(width).fill(0));

  const randomPiece = () => {
    const keys = Object.keys(tetrominoes);
    const key = keys[Math.floor(Math.random() * keys.length)];
    return { key, shape: tetrominoes[key], x: 3, y: 0 };
  };

  const [grid, setGrid] = useState(empty);
  const [piece, setPiece] = useState(randomPiece);
  const [nextPiece, setNextPiece] = useState(randomPiece);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [paused, setPaused] = useState(false);

  const collides = useCallback(
    (candidate, base = grid) =>
      candidate.shape.some((row, y) =>
        row.some(
          (value, x) =>
            value &&
            (candidate.y + y >= height ||
              candidate.x + x < 0 ||
              candidate.x + x >= width ||
              base[candidate.y + y]?.[candidate.x + x])
        )
      ),
    [grid]
  );

  const merge = useCallback(() => {
    setGrid((current) => {
      let next = current.map((row) => [...row]);
      piece.shape.forEach((row, y) =>
        row.forEach((value, x) => {
          if (value && next[piece.y + y]) {
            next[piece.y + y][piece.x + x] = piece.key;
          }
        })
      );
      const kept = next.filter((row) => row.some((cell) => !cell));
      const cleared = height - kept.length;
      if (cleared > 0) {
        setScore((value) => {
          const newScore = value + cleared * 100;
          if (newScore > highScore) setHighScore(newScore);
          return newScore;
        });
        playSFX("clear");
      }
      return [...Array.from({ length: cleared }, () => Array(width).fill(0)), ...kept];
    });
    setPiece(nextPiece);
    setNextPiece(randomPiece());
  }, [piece, nextPiece, highScore]);

  const move = useCallback(
    (dx, dy) => {
      if (paused) return;
      const next = { ...piece, x: piece.x + dx, y: piece.y + dy };
      if (collides(next)) {
        if (dy) {
          merge();
        }
      } else {
        setPiece(next);
        playSFX("move");
      }
    },
    [collides, merge, piece, paused]
  );

  const rotate = () => {
    if (paused) return;
    const shape = piece.shape[0].map((_, i) => piece.shape.map((row) => row[i]).reverse());
    const next = { ...piece, shape };
    if (!collides(next)) {
      setPiece(next);
      playSFX("move");
    } else {
      playSFX("thump");
    }
  };

  useInterval(() => move(0, 1), 650, !paused);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "ArrowLeft") move(-1, 0);
      if (event.key === "ArrowRight") move(1, 0);
      if (event.key === "ArrowDown") move(0, 1);
      if (event.key === "ArrowUp") rotate();
      if (event.key === " ") setPaused((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move, rotate]);

  const view = grid.map((row) => [...row]);
  piece.shape.forEach((row, y) =>
    row.forEach((value, x) => {
      if (value && view[piece.y + y]?.[piece.x + x] !== undefined) {
        view[piece.y + y][piece.x + x] = piece.key;
      }
    })
  );

  return (
    <div className="flex flex-col items-center w-full">
      <section className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-6">
        {/* Top Control Header */}
        <div className="flex w-full items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${paused ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
            <span className={`text-xs font-black tracking-widest uppercase ${paused ? "text-amber-400" : "text-emerald-400"}`}>
              {paused ? "Simulation Paused" : "Active Simulation"}
            </span>
          </div>
          <button
            onClick={() => {
              setGrid(empty());
              setPiece(randomPiece());
              setNextPiece(randomPiece());
              setScore(0);
              setPaused(false);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-black transition border border-white/5 text-slate-200"
          >
            <RefreshCw className="h-3 w-3" /> Reset Grid
          </button>
        </div>

        {/* Game Layout (Board + Sidebar panel) */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center w-full">
          {/* Tetris Board */}
          <div className="bg-slate-950 p-4 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-3xl blur opacity-25 group-hover:opacity-35 transition duration-1000" />
            <div className="relative bg-slate-950 p-1 rounded-2xl">
              <div className="grid w-[min(76vw,17rem)] grid-cols-10 gap-0.5 bg-black/90 p-1.5 rounded-xl border border-white/5">
                {view.flat().map((cell, index) => (
                  <div
                    key={index}
                    className={`aspect-square rounded-[3px] border ${
                      cell ? blockColors[cell] : "bg-neutral-900/50 border-neutral-950"
                    } transition-all duration-75`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Stats & Actions Panel */}
          <div className="flex flex-col justify-between w-full md:w-56 gap-5">
            {/* Score & High Score */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-white/5 space-y-4 shadow-lg">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-yellow-500" /> Score
                </p>
                <p className="text-3xl font-black text-white mt-1 font-mono tracking-tight">{score}</p>
              </div>
              <div className="border-t border-white/5 pt-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-indigo-400" /> High Score
                </p>
                <p className="text-xl font-black text-indigo-200 mt-1 font-mono tracking-tight">{highScore}</p>
              </div>
            </div>

            {/* Next Piece Box */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-white/5 flex flex-col items-center shadow-lg">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 self-start">Next Block</p>
              <div className="flex items-center justify-center p-3 bg-black/60 rounded-xl w-24 h-24 border border-white/5">
                <div className="grid grid-cols-4 gap-1 place-items-center">
                  {nextPiece.shape.map((row, y) =>
                    row.map((val, x) => (
                      <div
                        key={`${y}-${x}`}
                        className={`h-4 w-4 rounded-[3px] border ${
                          val ? blockColors[nextPiece.key] : "bg-transparent border-transparent"
                        }`}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Controls Button */}
            <button
              onClick={() => setPaused((v) => !v)}
              className="flex items-center justify-center gap-2 py-4 bg-indigo-650 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm transition transform active:scale-95 shadow-lg shadow-indigo-950/20"
            >
              {paused ? <Play className="h-4.5 w-4.5 fill-white" /> : <Pause className="h-4.5 w-4.5 fill-white" />}
              {paused ? "Resume Game" : "Pause Game"}
            </button>
          </div>
        </div>

        {/* Manual Section at the bottom */}
        <div className="w-full mt-2 border-t border-white/5 pt-4">
          <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> Tetris Manual
          </h3>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-2.5 flex items-center gap-2.5">
              <span className="bg-slate-800 text-white px-2 py-1 rounded font-mono font-bold">← →</span>
              <span className="font-bold text-slate-300">Move Left / Right</span>
            </div>
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-2.5 flex items-center gap-2.5">
              <span className="bg-slate-800 text-white px-2 py-1 rounded font-mono font-bold">↑</span>
              <span className="font-bold text-slate-300">Rotate Block</span>
            </div>
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-2.5 flex items-center gap-2.5">
              <span className="bg-slate-800 text-white px-2 py-1 rounded font-mono font-bold">↓</span>
              <span className="font-bold text-slate-300">Soft Drop Block</span>
            </div>
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-2.5 flex items-center gap-2.5">
              <span className="bg-slate-800 text-white px-2 py-1 rounded font-mono font-bold">Space</span>
              <span className="font-bold text-slate-300">Pause / Resume</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// PREMIUM MAZE RUNNER REDESIGN
export function MazeRunner() {
  const [difficulty, setDifficulty] = useState("easy"); // "easy" (11x11) | "medium" (15x15)
  const size = difficulty === "easy" ? 11 : 15;
  const [seed, setSeed] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(0);

  const walls = useMemo(() => {
    return Array.from({ length: size * size }, (_, index) => {
      const x = index % size;
      const y = Math.floor(index / size);
      if ((x === 0 && y === 0) || (x === size - 1 && y === size - 1)) return false;
      return ((x * 17 + y * 31 + seed * 7) % 5) === 0;
    });
  }, [seed, size]);

  const move = (dx, dy) => {
    setPos((current) => {
      const next = {
        x: Math.max(0, Math.min(size - 1, current.x + dx)),
        y: Math.max(0, Math.min(size - 1, current.y + dy)),
      };
      if (walls[next.y * size + next.x]) {
        playSFX("thump");
        return current;
      }
      playSFX("move");
      return next;
    });
  };

  const won = pos.x === size - 1 && pos.y === size - 1;

  useEffect(() => {
    if (won) {
      playSFX("win");
    }
  }, [won]);

  useInterval(() => {
    if (!won && time < 999) setTime((t) => t + 1);
  }, 1000, !won);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "ArrowLeft") move(-1, 0);
      if (event.key === "ArrowRight") move(1, 0);
      if (event.key === "ArrowUp") move(0, -1);
      if (event.key === "ArrowDown") move(0, 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [walls]);

  const handleRestart = () => {
    setSeed((v) => v + 1);
    setPos({ x: 0, y: 0 });
    setTime(0);
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[auto_1fr] bg-slate-900 p-6 rounded-3xl border border-white/10 shadow-2xl text-white">
      <div className="flex flex-col items-center">
        {/* Top Control Header */}
        <div className="flex flex-wrap items-center justify-between w-full gap-3 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setDifficulty("easy");
                setPos({ x: 0, y: 0 });
                setTime(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                difficulty === "easy" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              Easy
            </button>
            <button
              onClick={() => {
                setDifficulty("medium");
                setPos({ x: 0, y: 0 });
                setTime(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                difficulty === "medium" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              Medium
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5 font-mono text-sm text-indigo-400">
            <Timer className="h-4 w-4" /> {String(time).padStart(3, "0")}s
          </div>

          <button onClick={handleRestart} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-black transition">
            <RefreshCw className="h-3 w-3" /> New Maze
          </button>
        </div>

        {/* Maze Grid Display */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 mb-5 shadow-inner">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
              width: difficulty === "easy" ? "min(90vw, 24rem)" : "min(90vw, 28rem)",
            }}
          >
            {walls.map((wall, index) => {
              const x = index % size;
              const y = Math.floor(index / size);
              const isPlayer = pos.x === x && pos.y === y;
              const isExit = x === size - 1 && y === size - 1;
              return (
                <div
                  key={index}
                  className={`aspect-square rounded-md transition-all duration-300 ${
                    isPlayer
                      ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)] border border-amber-300 scale-95"
                      : isExit
                      ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] border border-emerald-300"
                      : wall
                      ? "bg-slate-950 border border-slate-900"
                      : "bg-slate-800/40 border border-slate-800/10"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Mobile touch controls */}
        <div className="grid w-40 grid-cols-3 gap-2">
          <span />
          <button
            onClick={() => move(0, -1)}
            className="h-11 bg-slate-800 hover:bg-slate-700 rounded-xl grid place-items-center font-black active:scale-95 transition border border-white/5"
          >
            ↑
          </button>
          <span />
          <button
            onClick={() => move(-1, 0)}
            className="h-11 bg-slate-800 hover:bg-slate-700 rounded-xl grid place-items-center font-black active:scale-95 transition border border-white/5"
          >
            ←
          </button>
          <button
            onClick={() => move(0, 1)}
            className="h-11 bg-slate-800 hover:bg-slate-700 rounded-xl grid place-items-center font-black active:scale-95 transition border border-white/5"
          >
            ↓
          </button>
          <button
            onClick={() => move(1, 0)}
            className="h-11 bg-slate-800 hover:bg-slate-700 rounded-xl grid place-items-center font-black active:scale-95 transition border border-white/5"
          >
            →
          </button>
        </div>
      </div>

      <GameHelp
        title="Labyrinth Protocol"
        lines={[
          "Solve the puzzle using arrow keys or buttons.",
          "Yellow represents your player node.",
          "Green signals the final escape exit.",
          "Reach the exit quickly to establish records.",
        ]}
      />
    </section>
  );
}

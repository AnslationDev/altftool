"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  RotateCcw, Shuffle, Undo2, Trophy, Star, Gem,
  Lock, Hammer, Target, ChevronRight, Sparkles,
} from "lucide-react";

/* ================= CONFIG ================= */
const COLS = 6;
const ROWS = 8;
const CELL = 44;
const GAP = 6;
const DROP_MS = 300;

const TILE_STYLES = {
  2:    { bg: "linear-gradient(145deg,#5eead4,#0891b2)", glow: "#22d3ee", text: "#04333a" },
  4:    { bg: "linear-gradient(145deg,#f9a8d4,#db2777)", glow: "#f472b6", text: "#3d0821" },
  8:    { bg: "linear-gradient(145deg,#fdba74,#ea580c)", glow: "#fb923c", text: "#3a1502" },
  16:   { bg: "linear-gradient(145deg,#bef264,#65a30d)", glow: "#a3e635", text: "#1a2b05" },
  32:   { bg: "linear-gradient(145deg,#7dd3fc,#0284c7)", glow: "#38bdf8", text: "#052236" },
  64:   { bg: "linear-gradient(145deg,#d8b4fe,#9333ea)", glow: "#c084fc", text: "#2c0a4d" },
  128:  { bg: "linear-gradient(145deg,#fde047,#ca8a04)", glow: "#facc15", text: "#3d2c02" },
  256:  { bg: "linear-gradient(145deg,#fca5a5,#dc2626)", glow: "#f87171", text: "#450a0a" },
  512:  { bg: "linear-gradient(145deg,#6ee7b7,#059669)", glow: "#34d399", text: "#022c22" },
  1024: { bg: "linear-gradient(145deg,#a5b4fc,#4338ca)", glow: "#818cf8", text: "#1e1b4b" },
  2048: { bg: "linear-gradient(145deg,#fef08a,#eab308)", glow: "#fde047", text: "#422006" },
  4096: { bg: "linear-gradient(145deg,#fda4af,#e11d48)", glow: "#fb7185", text: "#4c0519" },
  8192: { bg: "linear-gradient(145deg,#c4b5fd,#6d28d9)", glow: "#a78bfa", text: "#2e1065" },
};
const styleFor = (v) =>
  TILE_STYLES[v] || { bg: "linear-gradient(145deg,#f1f5f9,#94a3b8)", glow: "#e2e8f0", text: "#0f172a" };

const PARTICLE_COLORS = ["#fde047", "#f472b6", "#38bdf8", "#a3e635", "#fb923c", "#a78bfa"];
const LOCK = "LOCK";

/* ---- Level / difficulty curve ---- */
function levelConfig(level) {
  return {
    target: Math.pow(2, 4 + level),            // L1:32 L2:64 L3:128 ...
    moves: Math.max(10, 22 - level),             // gets tighter as you climb
    obstacleChance: level < 3 ? 0 : Math.min(0.18, 0.025 * (level - 2)),
    highTierChance: Math.min(0.5, level * 0.06),
  };
}
function randomValue(level) {
  const r = Math.random();
  const hi = levelConfig(level).highTierChance;
  if (level < 3) {
    if (r < 0.68) return 2;
    if (r < 0.93) return 4;
    return 8;
  }
  if (r < 0.5 - hi * 0.3) return 2;
  if (r < 0.8 - hi * 0.2) return 4;
  if (r < 0.96 - hi * 0.1) return 8;
  return 16;
}
const emptyBoard = () => Array.from({ length: COLS }, () => []);
const boardFull = (b) => b.every((c) => c.length >= ROWS);

/* ================= TILE ================= */
function Tile({ value, size = CELL }) {
  if (value === LOCK) {
    return (
      <div
        className="tile-pop"
        style={{
          width: size, height: size, borderRadius: size * 0.28,
          background: "linear-gradient(145deg,#475569,#1e293b)",
          boxShadow: "0 4px 0 rgba(0,0,0,.35), inset 0 2px 3px rgba(255,255,255,.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <Lock size={size * 0.42} color="#94a3b8" strokeWidth={2.4} />
      </div>
    );
  }
  const s = styleFor(value);
  const fontSize = value >= 1000 ? size * 0.28 : value >= 100 ? size * 0.33 : size * 0.4;
  return (
    <div
      className="tile-pop"
      style={{
        width: size, height: size, borderRadius: size * 0.28,
        background: s.bg,
        boxShadow: `0 4px 0 rgba(0,0,0,.28), 0 0 16px ${s.glow}99, inset 0 2px 3px rgba(255,255,255,.55), inset 0 -3px 4px rgba(0,0,0,.15)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: s.text, fontWeight: 800, fontSize,
        fontFamily: "'Fredoka', system-ui, sans-serif",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 2, left: "8%", width: "60%", height: "35%", borderRadius: "50%", background: "rgba(255,255,255,.35)", filter: "blur(1px)" }} />
      <span style={{ position: "relative", zIndex: 1 }}>{value}</span>
    </div>
  );
}

/* ================= MAIN ================= */
export default function MergeBlocksGame() {
  const [level, setLevel] = useState(1);
  const [board, setBoard] = useState(emptyBoard);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [maxVal, setMaxVal] = useState(2);
  const cfg = levelConfig(level);
  const [movesLeft, setMovesLeft] = useState(cfg.moves);
  const [current, setCurrent] = useState(() => randomValue(1));
  const [next, setNext] = useState(() => randomValue(1));
  const [falling, setFalling] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [levelResult, setLevelResult] = useState(null); // { win: bool, stars }
  const [history, setHistory] = useState([]);
  const [shuffles, setShuffles] = useState(3);
  const [undos, setUndos] = useState(3);
  const [hammers, setHammers] = useState(2);
  const [hammerMode, setHammerMode] = useState(false);
  const [combo, setCombo] = useState(0);
  const [toast, setToast] = useState(null);
  const [particles, setParticles] = useState([]);
  const [popups, setPopups] = useState([]);
  const [shake, setShake] = useState(false);
  const [hoverCol, setHoverCol] = useState(null);
  const idRef = useRef(0);
  const toastTimer = useRef(null);
  const timersRef = useRef([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  const trackedTimeout = (fn, ms) => {
    const id = setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    timersRef.current.push(id);
    return id;
  };

  const boardWidthPx = COLS * CELL + (COLS - 1) * GAP;
  const boardHeightPx = ROWS * CELL + (ROWS - 1) * GAP;

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = trackedTimeout(() => setToast(null), 1000);
  };

  const spawnEffects = (col, row, gained, chain) => {
    const x = col * (CELL + GAP) + CELL / 2;
    const y = row * (CELL + GAP) + CELL / 2;
    const burst = Array.from({ length: 10 + chain * 4 }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 50;
      return { id: ++idRef.current, x, y, dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist, color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)] };
    });
    setParticles((p) => [...p, ...burst]);
    trackedTimeout(() => setParticles((p) => p.filter((pt) => !burst.some((b) => b.id === pt.id))), 650);
    const popupId = ++idRef.current;
    setPopups((p) => [...p, { id: popupId, x, y, text: `+${gained}` }]);
    trackedTimeout(() => setPopups((p) => p.filter((pp) => pp.id !== popupId)), 850);
    if (chain > 1) {
      setShake(true);
      trackedTimeout(() => setShake(false), 300);
    }
  };

  const confettiBurst = () => {
    const burst = Array.from({ length: 60 }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 120;
      return {
        id: ++idRef.current,
        x: boardWidthPx / 2,
        y: boardHeightPx / 2,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      };
    });
    setParticles((p) => [...p, ...burst]);
    trackedTimeout(() => setParticles((p) => p.filter((pt) => !burst.some((b) => b.id === pt.id))), 1100);
  };

  const applyHammer = (col) => {
    setHammerMode(false);
    const idx = board[col].lastIndexOf(LOCK);
    if (idx === -1) {
      showToast("No locked block there");
      return;
    }
    setBoard((prev) => {
      const nb = prev.map((c) => [...c]);
      const targetIdx = nb[col].lastIndexOf(LOCK);
      if (targetIdx === -1) return prev;
      nb[col].splice(targetIdx, 1);
      return nb;
    });
    setHammers((h) => h - 1);
    showToast("Locked block smashed");
  };

  const dropInColumn = (col) => {
    if (gameOver || levelResult || falling) return;
    if (hammerMode) {
      applyHammer(col);
      return;
    }
    if (board[col].length >= ROWS) {
      showToast("Column full!");
      return;
    }
    setHistory((h) => [...h.slice(-6), { board: board.map((c) => [...c]), score, current, next, maxVal, movesLeft }]);

    const landingRow = board[col].length;
    const id = ++idRef.current;
    setFalling({ col, value: current, id, landingRow });

    trackedTimeout(() => {
      let didWin = false;
      setBoard((prev) => {
        const nb = prev.map((c) => [...c]);
        nb[col] = [...nb[col], current];
        let stack = nb[col];
        let gained = 0, chain = 0, merged = true, finalRow = stack.length - 1;
        while (merged && stack.length >= 2) {
          merged = false;
          const top = stack.length - 1;
          if (typeof stack[top] === "number" && stack[top] === stack[top - 1]) {
            const newVal = stack[top] * 2;
            stack.splice(top - 1, 2, newVal);
            gained += newVal; chain += 1; finalRow = top - 1; merged = true;
          }
        }
        nb[col] = stack;
        let newMax = maxVal;
        if (gained > 0) {
          spawnEffects(col, finalRow, gained, chain);
          const topVal = stack[stack.length - 1];
          newMax = Math.max(maxVal, typeof topVal === "number" ? topVal : maxVal);
          setMaxVal(newMax);
          setScore((s) => {
            const ns = s + gained;
            setBest((b) => Math.max(b, ns));
            return ns;
          });
          if (chain > 1) {
            setCombo(chain);
            showToast(`${chain}x CHAIN COMBO!`);
            trackedTimeout(() => setCombo(0), 750);
          }
        }
        // maybe drop in an obstacle block into a random open column
        if (cfg.obstacleChance > 0 && Math.random() < cfg.obstacleChance) {
          const openCols = nb.map((c, i) => (c.length < ROWS ? i : -1)).filter((i) => i >= 0);
          if (openCols.length) {
            const oc = openCols[Math.floor(Math.random() * openCols.length)];
            nb[oc] = [...nb[oc], LOCK];
          }
        }
        if (newMax >= cfg.target) didWin = true;
        else if (boardFull(nb)) setGameOver(true);
        return nb;
      });

      setFalling(null);
      setCurrent(next);
      setNext(randomValue(level));

      setMovesLeft((m) => {
        const nm = m - 1;
        if (didWin) {
          const ratio = nm / cfg.moves;
          const stars = ratio >= 0.5 ? 3 : ratio >= 0.2 ? 2 : 1;
          trackedTimeout(() => {
            confettiBurst();
            setLevelResult({ win: true, stars });
          }, 120);
        } else if (nm <= 0) {
          trackedTimeout(() => setLevelResult({ win: false, stars: 0 }), 120);
        }
        return nm;
      });
    }, DROP_MS);
  };

  const resetBoardState = (lvl) => {
    const c = levelConfig(lvl);
    setBoard(emptyBoard());
    setMovesLeft(c.moves);
    setCurrent(randomValue(lvl));
    setNext(randomValue(lvl));
    setFalling(null);
    setGameOver(false);
    setLevelResult(null);
    setHistory([]);
    setCombo(0);
    setHammerMode(false);
  };

  const restart = () => {
    if (
      !window.confirm(
        "Restart the game? This resets your level, score, and all remaining boosters back to the start and cannot be undone.",
      )
    ) {
      return;
    }
    setLevel(1);
    setScore(0);
    setMaxVal(2);
    setShuffles(3);
    setUndos(3);
    setHammers(2);
    resetBoardState(1);
  };

  const retryLevel = () => resetBoardState(level);

  const nextLevel = () => {
    const nl = level + 1;
    setLevel(nl);
    setMaxVal(2);
    setShuffles((s) => Math.min(5, s + 1));
    setHammers((h) => Math.min(4, h + 1));
    resetBoardState(nl);
  };

  const doUndo = () => {
    if (undos <= 0 || history.length === 0 || levelResult) return;
    const last = history[history.length - 1];
    setBoard(last.board);
    setScore(last.score);
    setCurrent(last.current);
    setNext(last.next);
    setMaxVal(last.maxVal);
    setMovesLeft(last.movesLeft);
    setHistory((h) => h.slice(0, -1));
    setUndos((u) => u - 1);
    setGameOver(false);
    showToast("Move undone");
  };

  const doShuffle = () => {
    if (shuffles <= 0 || levelResult || gameOver) return;
    setBoard((prev) => {
      const values = prev.flat();
      if (values.length === 0) return prev;
      for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
      }
      const heights = prev.map((c) => c.length);
      const nb = emptyBoard();
      let idx = 0;
      for (let c = 0; c < COLS; c++) for (let r = 0; r < heights[c]; r++) nb[c].push(values[idx++]);
      return nb;
    });
    setShuffles((s) => s - 1);
    showToast("Board shuffled");
  };

  const toggleHammer = () => {
    if (hammers <= 0 || levelResult) return;
    setHammerMode((m) => !m);
    showToast(hammerMode ? "Hammer cancelled" : "Tap a locked block's column");
  };

  const glow = styleFor(current === LOCK ? 2 : current).glow;
  const progressPct = Math.min(100, (Math.log2(Math.max(maxVal, 2)) / Math.log2(cfg.target)) * 100);

  return (
    <div style={{ width: "100%", minHeight: 760, display: "flex", alignItems: "center", justifyContent: "center", background: "#060613", padding: 24, position: "relative", overflow: "hidden", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Inter:wght@400;600;700;800&display=swap');
        @keyframes floatBlob { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(20px,-25px) scale(1.08); } 66% { transform: translate(-15px,15px) scale(0.95); } }
        @keyframes tilePop { 0% { transform: scale(0.55); opacity: .3; } 55% { transform: scale(1.14); } 100% { transform: scale(1); opacity: 1; } }
        .tile-pop { animation: tilePop 240ms cubic-bezier(.34,1.56,.64,1); }
        @keyframes particlePop { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; } }
        @keyframes popupFloat { 0% { opacity: 0; transform: translate(-50%,10px) scale(.7); } 20% { opacity: 1; transform: translate(-50%,-6px) scale(1.1); } 100% { opacity: 0; transform: translate(-50%,-46px) scale(1); } }
        @keyframes toastFloat { 0% { opacity: 0; transform: translate(-50%,8px); } 15% { opacity: 1; transform: translate(-50%,0); } 82% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%,-16px); } }
        @keyframes screenShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px) rotate(-.3deg); } 75% { transform: translateX(4px) rotate(.3deg); } }
        @keyframes launcherPulse { 0%,100% { box-shadow: 0 0 10px var(--glowc), inset 0 2px 3px rgba(255,255,255,.4); } 50% { box-shadow: 0 0 26px var(--glowc), inset 0 2px 3px rgba(255,255,255,.4); } }
        @keyframes gridShimmer { 0%,100% { opacity: .25; } 50% { opacity: .55; } }
        @keyframes popIn { 0% { transform: scale(.6); opacity: 0; } 60% { transform: scale(1.06); opacity: 1; } 100% { transform: scale(1); } }
        @keyframes starPop { 0% { transform: scale(0) rotate(-30deg); opacity: 0; } 60% { transform: scale(1.3) rotate(8deg); } 100% { transform: scale(1) rotate(0); opacity: 1; } }
        @keyframes barFill { from { width: 0; } }
        .col-zone:hover { background: rgba(255,255,255,0.04); }
        .col-zone:active { background: rgba(255,255,255,0.08); }
        .boost-btn:active, .icon-btn:active { transform: scale(0.9); }
        .boost-btn, .icon-btn { transition: transform 120ms ease; }
      `}</style>

      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <div style={{ ...blobStyle, width: 340, height: 340, background: "#7c3aed", top: -80, left: -60, animationDuration: "14s" }} />
        <div style={{ ...blobStyle, width: 300, height: 300, background: "#0891b2", bottom: -70, right: -60, animationDuration: "18s", animationDelay: "2s" }} />
        <div style={{ ...blobStyle, width: 260, height: 260, background: "#db2777", top: "40%", left: "60%", animationDuration: "16s", animationDelay: "4s" }} />
      </div>

      <div style={{ width: 372, borderRadius: 48, padding: "16px 14px 20px", background: "linear-gradient(160deg,#1a1a2e,#08080f)", boxShadow: "0 40px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.06), inset 0 0 0 6px #000", position: "relative", zIndex: 1, animation: shake ? "screenShake 300ms ease" : "none" }}>
        <div style={{ width: 100, height: 18, background: "#000", borderRadius: 10, margin: "0 auto 10px" }} />

        {/* TITLE */}
        <div style={{ textAlign: "center", marginBottom: 8, position: "relative" }}>
          <div style={{ fontFamily: "'Fredoka', system-ui, sans-serif", fontWeight: 700, fontSize: 24, letterSpacing: 0.5, background: "linear-gradient(90deg,#38bdf8,#a78bfa,#f472b6,#fde047)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-block" }}>
            MERGE FUSION
          </div>
          <button
            className="icon-btn"
            style={{ ...iconBtnStyle, position: "absolute", right: 0, top: 2 }}
            onClick={restart}
            aria-label="Restart game"
            title="Restart game"
          >
            <RotateCcw size={14} color="#cbd5e1" />
          </button>
        </div>

        {/* LEVEL BAR */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, padding: "8px 12px", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ background: "linear-gradient(145deg,#a78bfa,#7c3aed)", borderRadius: 8, padding: "2px 8px", fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 12, color: "#fff" }}>
                LV {level}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 3, color: "#94a3b8", fontSize: 10, fontWeight: 700 }}>
                <Target size={11} color="#fbbf24" /> {cfg.target}
              </div>
            </div>
            <div role="status" aria-live="polite" style={{ color: movesLeft <= 3 ? "#fb7171" : "#94a3b8", fontSize: 10, fontWeight: 700 }}>
              {movesLeft} moves left
            </div>
          </div>
          <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progressPct}%`, borderRadius: 4, background: "linear-gradient(90deg,#38bdf8,#a78bfa,#fbbf24)", animation: "barFill 400ms ease-out", transition: "width 300ms ease" }} />
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <StatPill icon={<Gem size={12} color="#38bdf8" />} label="SCORE" value={score} color="#7dd3fc" />
          <StatPill icon={<Trophy size={12} color="#fbbf24" />} label="BEST" value={best} color="#fde68a" />
        </div>

        {/* BOARD */}
        <div style={{ position: "relative", width: boardWidthPx, height: boardHeightPx, margin: "0 auto", background: "radial-gradient(circle at 50% 0%, #1e1b3a, #0a0a18 75%)", borderRadius: 20, boxShadow: "inset 0 3px 14px rgba(0,0,0,.7), inset 0 0 0 1px rgba(255,255,255,.05), 0 0 30px rgba(124,58,237,.15)", overflow: "hidden" }}>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${glow}, transparent)`, zIndex: 4, opacity: 0.8 }} />
          <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`, gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`, gap: GAP }}>
            {Array.from({ length: COLS * ROWS }).map((_, i) => (
              <div key={i} style={{ borderRadius: CELL * 0.28, background: "rgba(255,255,255,0.025)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.04)", animation: "gridShimmer 5s ease-in-out infinite", animationDelay: `${(i % COLS) * 0.15}s` }} />
            ))}
          </div>

          {hoverCol !== null && !gameOver && !levelResult && (
            <div style={{ position: "absolute", top: 0, bottom: 0, left: hoverCol * (CELL + GAP), width: CELL, background: hammerMode ? "linear-gradient(0deg, #f8717133, transparent)" : `linear-gradient(0deg, ${glow}33, transparent)`, borderRadius: CELL * 0.28, pointerEvents: "none" }} />
          )}

          {board.map((colArr, c) =>
            colArr.map((val, r) => (
              <div key={`${c}-${r}-${val}-${r === colArr.length - 1 ? "t" : "s"}`} style={{ position: "absolute", left: c * (CELL + GAP), top: r * (CELL + GAP) }}>
                <Tile value={val} />
              </div>
            ))
          )}

          {falling && (
            <div style={{ position: "absolute", left: falling.col * (CELL + GAP), top: falling.landingRow * (CELL + GAP), animation: `launchAnim-${falling.id} ${DROP_MS}ms cubic-bezier(.34,1.56,.64,1) forwards` }}>
              <style>{`@keyframes launchAnim-${falling.id} { from { transform: translateY(${boardHeightPx - falling.landingRow * (CELL + GAP) + CELL}px); } to { transform: translateY(0); } }`}</style>
              <Tile value={falling.value} />
            </div>
          )}

          {particles.map((p) => (
            <div key={p.id} style={{ position: "absolute", left: p.x - 3, top: p.y - 3, width: 6, height: 6, borderRadius: "50%", background: p.color, boxShadow: `0 0 6px ${p.color}`, "--dx": `${p.dx}px`, "--dy": `${-p.dy}px`, animation: "particlePop 600ms ease-out forwards", pointerEvents: "none" }} />
          ))}

          {popups.map((p) => (
            <div key={p.id} style={{ position: "absolute", left: p.x, top: p.y, transform: "translate(-50%,0)", color: "#fde047", fontWeight: 800, fontSize: 15, fontFamily: "'Fredoka', sans-serif", textShadow: "0 0 8px rgba(253,224,71,.8), 0 2px 3px rgba(0,0,0,.6)", animation: "popupFloat 850ms ease-out forwards", pointerEvents: "none" }}>
              {p.text}
            </div>
          ))}

          <div style={{ position: "absolute", inset: 0, display: "flex" }}>
            {Array.from({ length: COLS }).map((_, c) => (
              <button
                key={c}
                className="col-zone"
                onClick={() => dropInColumn(c)}
                onMouseEnter={() => setHoverCol(c)}
                onMouseLeave={() => setHoverCol(null)}
                disabled={gameOver || !!levelResult}
                aria-label={hammerMode ? `Smash locked block in column ${c + 1}` : `Drop block in column ${c + 1}`}
                style={{ flex: 1, background: "transparent", border: "none", cursor: gameOver || levelResult ? "default" : "pointer" }}
              />
            ))}
          </div>

          {combo > 0 && (
            <div role="status" aria-live="polite" style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg,#f59e0b,#ef4444)", color: "#fff", fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 12, padding: "4px 12px", borderRadius: 20, boxShadow: "0 0 16px rgba(239,68,68,.6)", animation: "tilePop 240ms cubic-bezier(.34,1.56,.64,1)", zIndex: 5 }}>
              ⚡ {combo}x CHAIN
            </div>
          )}

          {toast && (
            <div role="status" aria-live="polite" style={{ position: "absolute", left: "50%", top: "45%", background: "rgba(15,15,30,.92)", border: "1px solid rgba(255,255,255,.1)", color: "#fde047", fontWeight: 700, fontSize: 13, padding: "7px 16px", borderRadius: 12, animation: "toastFloat 1000ms ease-out forwards", zIndex: 6, whiteSpace: "nowrap", transform: "translateX(-50%)" }}>
              {toast}
            </div>
          )}

          {gameOver && (
            <div style={overlayStyle} role="status" aria-live="polite">
              <div style={{ fontFamily: "'Fredoka', sans-serif", color: "#fb7185", fontWeight: 700, fontSize: 22, textShadow: "0 0 20px rgba(251,113,133,.6)" }}>BOARD FULL</div>
              <div style={{ color: "#e2e8f0", fontSize: 13 }}>Score: <b style={{ color: "#fde047" }}>{score}</b></div>
              <button onClick={retryLevel} style={primaryBtn}>Retry Level</button>
            </div>
          )}

          {levelResult && (
            <div style={overlayStyle} role="status" aria-live="polite">
              {levelResult.win ? (
                <>
                  <Sparkles size={28} color="#fde047" style={{ animation: "popIn 400ms ease-out" }} />
                  <div style={{ fontFamily: "'Fredoka', sans-serif", color: "#fde047", fontWeight: 700, fontSize: 22, textShadow: "0 0 20px rgba(253,224,71,.6)" }}>LEVEL {level} COMPLETE!</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[1, 2, 3].map((s) => (
                      <Star key={s} size={26} color={s <= levelResult.stars ? "#fbbf24" : "#334155"} fill={s <= levelResult.stars ? "#fbbf24" : "none"} style={{ animation: `starPop 400ms ease-out ${s * 100}ms both` }} />
                    ))}
                  </div>
                  <div style={{ color: "#e2e8f0", fontSize: 12 }}>Score: <b style={{ color: "#7dd3fc" }}>{score}</b> · Next target: <b style={{ color: "#fbbf24" }}>{levelConfig(level + 1).target}</b></div>
                  <button onClick={nextLevel} style={primaryBtn}>
                    Next Level <ChevronRight size={15} style={{ display: "inline", verticalAlign: "-3px" }} />
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: "'Fredoka', sans-serif", color: "#fb7185", fontWeight: 700, fontSize: 22, textShadow: "0 0 20px rgba(251,113,133,.6)" }}>OUT OF MOVES</div>
                  <div style={{ color: "#e2e8f0", fontSize: 13 }}>Needed <b style={{ color: "#fbbf24" }}>{cfg.target}</b>, reached <b style={{ color: "#7dd3fc" }}>{maxVal}</b></div>
                  <button onClick={retryLevel} style={primaryBtn}>Retry Level</button>
                </>
              )}
            </div>
          )}
        </div>

        <div style={{ width: boardWidthPx, margin: "10px auto 0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: `1px solid ${glow}40`, boxShadow: `0 0 18px ${glow}22` }}>
          <span style={{ color: "#94a3b8", fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>▲ LAUNCH</span>
          <div style={{ "--glowc": `${glow}aa`, animation: "launcherPulse 1.8s ease-in-out infinite", borderRadius: 12 }}>
            <Tile value={current} size={36} />
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#94a3b8", fontSize: 8, fontWeight: 700, letterSpacing: 1 }}>NEXT</div>
            <Tile value={next} size={22} />
          </div>
        </div>
        <div style={{ textAlign: "center", color: hammerMode ? "#fb7185" : "#94a3b8", fontSize: 10, fontWeight: 700, letterSpacing: 1, margin: "8px 0 0" }}>
          {hammerMode ? "TAP A COLUMN WITH A LOCK" : "TAP A COLUMN TO LAUNCH"}
        </div>

        {/* BOOSTERS */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", padding: "10px 0 0" }}>
          <BoosterButton icon={<Undo2 size={15} />} label="Undo" count={undos} onClick={doUndo} colorFrom="#38bdf8" colorTo="#0284c7" />
          <BoosterButton icon={<Shuffle size={15} />} label="Shuffle" count={shuffles} onClick={doShuffle} colorFrom="#a78bfa" colorTo="#7c3aed" forceDisabled={gameOver} />
          <BoosterButton icon={<Hammer size={15} />} label="Hammer" count={hammers} onClick={toggleHammer} colorFrom="#fb7185" colorTo="#e11d48" active={hammerMode} />
        </div>
      </div>
    </div>
  );
}

/* ================= SUBCOMPONENTS ================= */
function StatPill({ icon, label, value, color }) {
  return (
    <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "7px 6px", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 2 }}>
        {icon}
        <span style={{ color: "#94a3b8", fontSize: 9, fontWeight: 700, letterSpacing: 0.6 }}>{label}</span>
      </div>
      <div style={{ color, fontWeight: 800, fontSize: 16, fontFamily: "'Fredoka', sans-serif" }}>{value}</div>
    </div>
  );
}

function BoosterButton({ icon, label, count, onClick, colorFrom, colorTo, active, forceDisabled }) {
  const disabled = forceDisabled || count <= 0;
  return (
    <button className="boost-btn" onClick={onClick} disabled={disabled} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: disabled ? "rgba(255,255,255,0.03)" : `linear-gradient(160deg, ${colorFrom}${active ? "44" : "22"}, ${colorTo}${active ? "44" : "22"})`, border: `1px solid ${disabled ? "rgba(255,255,255,0.06)" : colorFrom + (active ? "aa" : "55")}`, borderRadius: 16, padding: "8px 14px", color: disabled ? "#475569" : "#e2e8f0", cursor: disabled ? "default" : "pointer", minWidth: 72, boxShadow: disabled ? "none" : `0 0 14px ${colorFrom}${active ? "55" : "33"}` }}>
      <div style={{ color: disabled ? "#475569" : colorFrom }}>{icon}</div>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.4 }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 800, color: disabled ? "#475569" : "#fde047" }}>{count}</span>
    </button>
  );
}

const iconBtnStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };
const blobStyle = { position: "absolute", borderRadius: "50%", filter: "blur(70px)", opacity: 0.35, animation: "floatBlob 14s ease-in-out infinite" };
const overlayStyle = { position: "absolute", inset: 0, background: "rgba(6,6,19,.9)", backdropFilter: "blur(2px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, zIndex: 10, padding: 16, textAlign: "center" };
const primaryBtn = { marginTop: 6, background: "linear-gradient(145deg,#38bdf8,#7c3aed)", border: "none", color: "#fff", fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 14, padding: "9px 22px", borderRadius: 14, cursor: "pointer", boxShadow: "0 0 20px rgba(124,58,237,.5)" };

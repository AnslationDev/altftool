"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useGameSounds } from "@/app/altfgame/_lib/sounds";

const SIZE = 11;

const ANSWERS = [
  { id: "react-across", number: 1, answer: "REACT", clue: "JavaScript library used to build this component.", row: 0, col: 0, direction: "across" },
  { id: "state-across", number: 3, answer: "STATE", clue: "Data that changes while you play.", row: 2, col: 2, direction: "across" },
  { id: "puzzle-across", number: 5, answer: "PUZZLE", clue: "A playful problem waiting to be solved.", row: 4, col: 1, direction: "across" },
  { id: "browser-across", number: 7, answer: "BROWSER", clue: "Where this game runs.", row: 6, col: 0, direction: "across" },
  { id: "clue-across", number: 10, answer: "CLUE", clue: "Hint beside the grid.", row: 8, col: 5, direction: "across" },
  { id: "code-across", number: 11, answer: "CODE", clue: "Instructions written for a computer.", row: 10, col: 3, direction: "across" },
  { id: "responsive-down", number: 1, answer: "RESPONSIVE", clue: "Designed to work well on many screen sizes.", row: 0, col: 0, direction: "down" },
  { id: "click-down", number: 2, answer: "CLICK", clue: "Press a cell with a mouse or touchpad.", row: 0, col: 3, direction: "down" },
  { id: "input-down", number: 4, answer: "INPUT", clue: "What typed letters become.", row: 2, col: 5, direction: "down" },
  { id: "logic-down", number: 6, answer: "LOGIC", clue: "Rules that make the game behave.", row: 4, col: 6, direction: "down" },
  { id: "board-down", number: 8, answer: "BOARD", clue: "The crossword playing surface.", row: 6, col: 1, direction: "down" },
  { id: "cell-down", number: 9, answer: "CELL", clue: "One square in the crossword grid.", row: 7, col: 8, direction: "down" },
];

const GOOGLE_FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Mono:wght@400;500&display=swap');`;

const CSS = `
${GOOGLE_FONTS}

.cw-root, .cw-root *, .cw-root *::before, .cw-root *::after,
.loading-screen, .loading-screen *, .loading-screen *::before, .loading-screen *::after,
.win-overlay, .win-overlay *, .win-overlay *::before, .win-overlay *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --cream: #faf7f0;
  --cream2: #f3ede0;
  --cream3: #e8dfc9;
  --ink: #1a1208;
  --ink2: #3d2e1a;
  --ink3: #6b5640;
  --ink4: #9a7e62;
  --red: #c0392b;
  --red2: #e74c3c;
  --green: #1a6b3c;
  --green2: #27ae60;
  --gold: #d4a017;
  --gold2: #f0c030;
  --blue: #1a3a6b;
  --blue2: #2980b9;
  --border: rgba(26,18,8,0.12);
  --border2: rgba(26,18,8,0.22);
  --shadow: 0 4px 24px rgba(26,18,8,0.10);
  --shadow2: 0 8px 40px rgba(26,18,8,0.16);
  --shadow3: 0 20px 80px rgba(26,18,8,0.22);
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Lora', Georgia, serif;
  --font-mono: 'DM Mono', 'Courier New', monospace;
  --r: 12px;
  --r2: 20px;
  --r3: 28px;
}

.cw-root {
  font-family: var(--font-body);
  background: linear-gradient(155deg, #fdf7e7 0%, #f7ecd2 55%, #f2e3c2 100%);
  color: var(--ink);
  height: 100%;
  width: min(100%, 880px);
  margin: 0 auto;
  overflow-y: auto;
  display: grid;
  grid-template-rows: auto 1fr;
  position: relative;
  border-radius: 0.75rem;
  border: 1px solid rgba(26, 18, 8, 0.12);
  box-shadow: 0 10px 40px rgba(26, 18, 8, 0.12);
}

/* ---- TEXTURE ---- */
.cw-root::before {
  content: '';
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(26,18,8,0.028) 27px, rgba(26,18,8,0.028) 28px),
    repeating-linear-gradient(90deg, transparent, transparent 27px, rgba(26,18,8,0.018) 27px, rgba(26,18,8,0.018) 28px);
}

/* ---- LOADING ---- */
.loading-screen {
  position: absolute; inset: 0; z-index: 100;
  border-radius: 0.75rem;
  background: var(--cream);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0;
}

.loading-masthead {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  color: var(--ink);
  line-height: 1;
  text-align: center;
}
.loading-masthead em { font-style: italic; color: var(--red); }

.loading-rule { width: clamp(200px, 50vw, 500px); height: 3px; background: var(--ink); margin: 1.5rem 0 0.75rem; }
.loading-rule2 { width: clamp(200px, 50vw, 500px); height: 1px; background: var(--ink); margin-bottom: 1.5rem; }

.loading-sub {
  font-family: var(--font-body); font-style: italic; font-size: 1.05rem;
  color: var(--ink3); letter-spacing: 0.08em; text-align: center; margin-bottom: 2.5rem;
}

.loading-tiles {
  display: flex; gap: 6px; margin-bottom: 2rem;
}
.loading-tile {
  width: 52px; height: 52px; border: 2.5px solid var(--ink);
  display: grid; place-items: center;
  font-family: var(--font-display); font-size: 1.6rem; font-weight: 900;
  color: var(--ink); background: var(--cream);
  animation: tileReveal 0.5s ease-out both;
}
@keyframes tileReveal {
  from { opacity: 0; transform: rotateY(90deg) scale(0.8); }
  to { opacity: 1; transform: rotateY(0) scale(1); }
}

.loading-progress-track {
  width: clamp(200px, 40vw, 380px); height: 4px; background: var(--cream3);
  border: 1px solid var(--border2); position: relative; overflow: hidden;
}
.loading-progress-fill {
  height: 100%; background: var(--ink);
  animation: progressFill 1.1s ease-out forwards;
}
@keyframes progressFill { from { width: 0% } to { width: 100% } }

.loading-progress-label {
  font-family: var(--font-mono); font-size: 0.7rem; color: var(--ink4);
  margin-top: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase;
  animation: dotPulse 1s ease-in-out infinite;
}
@keyframes dotPulse { 0%,100% { opacity: 0.5 } 50% { opacity: 1 } }

/* ---- TOPBAR ---- */
.topbar {
  position: relative; z-index: 10;
  border-bottom: 3px solid var(--ink);
  background: var(--cream); padding: 0;
  flex-shrink: 0;
}

.topbar-masthead {
  display: none;
}

.masthead-brand {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 3vw, 2.2rem);
  font-weight: 900; letter-spacing: -0.02em;
  color: var(--ink); line-height: 1;
}
.masthead-brand em { font-style: italic; color: var(--red); }

.masthead-date {
  font-family: var(--font-body); font-style: italic;
  font-size: 0.78rem; color: var(--ink3); text-align: right; line-height: 1.5;
}

.topbar-stats-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.4rem 1.5rem;
  gap: 1rem;
}

.stats-group { display: flex; gap: 1rem; align-items: center; }

.stat-item {
  display: flex; align-items: baseline; gap: 0.4rem;
}
.stat-label {
  font-family: var(--font-body); font-style: italic; font-size: 0.75rem; color: var(--ink4);
  text-transform: uppercase; letter-spacing: 0.08em;
}
.stat-value {
  font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--ink);
}
.stat-value.done { color: var(--green); }

.progress-inline {
  flex: 1; max-width: 200px; height: 5px;
  background: var(--cream3); border: 1px solid var(--border);
  overflow: hidden;
}
.progress-inline-fill {
  height: 100%; background: var(--ink); transition: width 0.4s ease;
}

.topbar-actions { display: flex; gap: 0.5rem; }

.action-btn {
  padding: 0.4rem 1.05rem; border: 1.5px solid var(--border2);
  background: rgba(255, 255, 255, 0.55); color: var(--ink);
  font-family: var(--font-body); font-size: 0.75rem; font-weight: 700;
  cursor: pointer; transition: all 0.18s ease;
  letter-spacing: 0.04em; border-radius: 999px;
  box-shadow: 0 2px 6px rgba(26, 18, 8, 0.08);
}
.action-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(26, 18, 8, 0.16); }
.action-btn:hover { background: var(--ink); color: var(--cream); }
.action-btn.danger { border-color: var(--red); color: var(--red); }
.action-btn.danger:hover { background: var(--red); color: white; }

/* ---- GAME BODY ---- */
.game-body {
  display: grid;
  grid-template-columns: 1fr 300px;
  overflow: auto;
  min-height: 0;
  position: relative; z-index: 1;
}

@media (max-width: 860px) {
  .game-body { grid-template-columns: 1fr; }
  .clues-panel { display: none; }
}

/* ---- PUZZLE AREA ---- */
.puzzle-area {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 1rem 1.5rem; overflow: hidden; gap: 0.75rem;
  border-right: 1px solid var(--border2);
}

.grid-container {
  position: relative;
}

.cw-grid {
  display: grid;
  grid-template-columns: repeat(11, 1fr);
  border: 2.5px solid var(--ink);
  background: var(--ink);
  gap: 1.5px;
  outline: none;
  box-shadow: 6px 6px 0 var(--ink2), var(--shadow3);
}

.cw-cell {
  position: relative;
  border: none; padding: 0; cursor: pointer;
  background: var(--cream);
  display: grid; place-items: center;
  transition: background 0.12s ease;
  aspect-ratio: 1;
}

.cw-cell.blocked {
  background: var(--ink);
  cursor: default;
}

.cw-cell.highlighted { background: #dff0d8; }
.cw-cell.selected {
  background: var(--gold2);
  z-index: 2;
  box-shadow: 0 0 0 2.5px #d4a017, 0 0 16px rgba(212, 160, 23, 0.55);
}
.cw-cell.correct { background: #c8f5d0 !important; }
.cw-cell.incorrect { background: #fdd !important; }
.cw-cell.selected.correct { background: var(--gold2) !important; }

.cw-cell:not(.blocked):hover:not(.selected) { background: #eef6ff; }

.cell-number {
  position: absolute;
  top: 2px; left: 3px;
  font-family: var(--font-mono);
  font-size: clamp(0.4rem, 0.9vw, 0.62rem);
  font-weight: 500;
  color: var(--ink2);
  line-height: 1;
  pointer-events: none;
}

.cell-letter {
  font-family: var(--font-display);
  font-size: clamp(1rem, 2.5vw, 1.9rem);
  font-weight: 700;
  color: var(--ink);
  line-height: 1;
  pointer-events: none;
  transition: transform 0.1s ease;
}

.cell-letter.just-typed {
  animation: letterBounce 0.22s ease-out;
}
@keyframes letterBounce {
  0% { transform: scale(1.4); }
  60% { transform: scale(0.92); }
  100% { transform: scale(1); }
}

.cell-letter.wrong-shake {
  animation: wrongShake 0.35s ease;
  color: var(--red);
}
@keyframes wrongShake {
  0%,100% { transform: translateX(0); }
  20% { transform: translateX(-3px); }
  40% { transform: translateX(3px); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
}

/* ---- ACTIVE CLUE BAR ---- */
.active-clue-bar {
  width: 100%;
  max-width: 600px;
  display: flex; align-items: center; gap: 1rem;
  padding: 0.7rem 1rem;
  background: var(--cream2);
  border: 1.5px solid var(--border2);
  box-shadow: 2px 2px 0 var(--ink3);
}

.clue-tag {
  flex-shrink: 0;
  min-width: 52px; height: 40px;
  display: grid; place-items: center;
  background: var(--ink); color: var(--cream);
  font-family: var(--font-display); font-size: 1rem; font-weight: 700;
  border-radius: 2px;
}

.clue-text {
  font-family: var(--font-body); font-size: 1rem; font-weight: 500;
  color: var(--ink); line-height: 1.4; flex: 1;
}

.clue-letters {
  flex-shrink: 0;
  font-family: var(--font-mono); font-size: 0.78rem; color: var(--ink4);
  letter-spacing: 0.15em;
}

/* ---- BOTTOM CONTROLS ---- */
.bottom-controls {
  display: flex; gap: 0.5rem;
  flex-wrap: wrap; justify-content: center;
  width: 100%; max-width: 600px;
}

.ctrl-btn {
  padding: 0.5rem 1.2rem;
  border: 1.5px solid var(--border2);
  background: var(--cream);
  color: var(--ink);
  font-family: var(--font-body); font-size: 0.82rem; font-weight: 600;
  cursor: pointer; transition: all 0.18s;
  letter-spacing: 0.04em; border-radius: 4px;
  box-shadow: 2px 2px 0 var(--cream3);
}
.ctrl-btn:hover { background: var(--ink); color: var(--cream); box-shadow: none; transform: translate(2px,2px); }
.ctrl-btn.primary { background: var(--ink); color: var(--cream); border-color: var(--ink); }
.ctrl-btn.primary:hover { background: var(--ink2); }
.ctrl-btn.warn { border-color: var(--red); color: var(--red); }
.ctrl-btn.warn:hover { background: var(--red); color: white; }

/* ---- CLUES PANEL ---- */
.clues-panel {
  display: flex; flex-direction: column;
  overflow: hidden;
  border-left: 1.5px solid var(--border2);
  background: var(--cream);
}

.clues-tabs {
  display: flex; border-bottom: 2px solid var(--ink);
}
.clues-tab {
  flex: 1; padding: 0.65rem 1rem;
  font-family: var(--font-display); font-size: 0.9rem; font-weight: 700;
  cursor: pointer; border: none; background: transparent;
  color: var(--ink4); transition: all 0.18s;
  letter-spacing: 0.04em; border-bottom: 3px solid transparent;
  margin-bottom: -2px;
}
.clues-tab.active {
  color: var(--ink); border-bottom-color: var(--ink);
  background: var(--cream2);
}
.clues-tab:hover:not(.active) { color: var(--ink); }

.clues-list {
  flex: 1; overflow-y: auto; padding: 0.5rem;
}
.clues-list::-webkit-scrollbar { width: 3px; }
.clues-list::-webkit-scrollbar-thumb { background: var(--cream3); }

.clue-item {
  display: grid; grid-template-columns: 36px 1fr;
  gap: 0.5rem; padding: 0.6rem 0.5rem;
  cursor: pointer; border-radius: 6px;
  transition: background 0.15s;
  border-bottom: 1px solid transparent;
}
.clue-item:hover { background: var(--cream2); }
.clue-item.active {
  background: #fff9e0;
  border-left: 3px solid var(--gold);
  padding-left: calc(0.5rem - 3px);
}
.clue-item.solved .clue-item-num { color: var(--green); }
.clue-item.solved .clue-item-text { text-decoration: line-through; opacity: 0.55; }

.clue-item-num {
  font-family: var(--font-display); font-size: 0.9rem; font-weight: 700;
  color: var(--red); text-align: right; line-height: 1.5;
}
.clue-item-text {
  font-family: var(--font-body); font-size: 0.9rem; line-height: 1.5;
  color: var(--ink); font-weight: 400;
}

/* ---- WIN OVERLAY ---- */
.win-overlay {
  position: absolute; inset: 0; z-index: 200;
  border-radius: 0.75rem;
  background: rgba(250,247,240,0.96);
  display: flex; align-items: center; justify-content: center;
  animation: fadeIn 0.4s ease-out;
  backdrop-filter: blur(4px);
}
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

.win-card {
  max-width: 520px; width: 90%;
  background: var(--cream);
  border: 3px solid var(--ink);
  padding: 0;
  box-shadow: 12px 12px 0 var(--ink2);
  animation: winDrop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both;
  overflow: hidden;
}
@keyframes winDrop {
  from { opacity: 0; transform: translateY(-40px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.win-header {
  background: var(--ink);
  padding: 1.5rem 2rem;
  text-align: center;
}
.win-headline {
  font-family: var(--font-display); font-style: italic; font-size: 2.8rem;
  font-weight: 900; color: var(--cream); line-height: 1; margin-bottom: 0.25rem;
}
.win-sub {
  font-family: var(--font-body); font-size: 0.85rem;
  color: rgba(250,247,240,0.65); letter-spacing: 0.12em; text-transform: uppercase;
  font-style: italic;
}

.win-body { padding: 1.5rem 2rem; }

.win-stats-grid {
  display: grid; grid-template-columns: repeat(3,1fr); gap: 1px;
  border: 1.5px solid var(--border2); margin-bottom: 1.5rem;
}
.win-stat-cell {
  padding: 1rem; text-align: center; background: var(--cream2);
  border-right: 1px solid var(--border2);
}
.win-stat-cell:last-child { border-right: none; }
.win-stat-num {
  font-family: var(--font-display); font-size: 2rem; font-weight: 900; color: var(--ink);
  line-height: 1;
}
.win-stat-lbl {
  font-family: var(--font-body); font-style: italic; font-size: 0.72rem;
  color: var(--ink4); margin-top: 0.3rem; text-transform: uppercase; letter-spacing: 0.1em;
}

.win-stars { display: flex; justify-content: center; gap: 0.75rem; margin-bottom: 1.5rem; }
.win-star {
  font-size: 2rem; animation: starDrop 0.4s cubic-bezier(0.175,0.885,0.32,1.5) both;
}
.win-star:nth-child(1) { animation-delay: 0.3s; }
.win-star:nth-child(2) { animation-delay: 0.45s; }
.win-star:nth-child(3) { animation-delay: 0.6s; }
@keyframes starDrop {
  from { transform: scale(0) rotate(-30deg); opacity: 0; }
  to { transform: scale(1) rotate(0); opacity: 1; }
}

.win-msg {
  font-family: var(--font-body); font-style: italic; font-size: 1.05rem;
  color: var(--ink3); text-align: center; margin-bottom: 1.5rem; line-height: 1.6;
}

.win-btns { display: flex; gap: 0.75rem; }
.win-btn {
  flex: 1; padding: 0.8rem 1rem;
  font-family: var(--font-display); font-size: 0.95rem; font-weight: 700;
  cursor: pointer; border: 2px solid var(--ink); transition: all 0.18s;
  letter-spacing: 0.04em;
}
.win-btn.primary { background: var(--ink); color: var(--cream); }
.win-btn.primary:hover { background: var(--ink2); }
.win-btn.secondary { background: transparent; color: var(--ink); }
.win-btn.secondary:hover { background: var(--ink); color: var(--cream); }

/* confetti */
.confetti-piece {
  position: absolute; top: -20px; pointer-events: none; z-index: 201;
  animation: confettiFall linear forwards;
}
@keyframes confettiFall {
  to { top: 110vh; transform: rotate(720deg) translateX(60px); }
}

/* cell pop animation for correct word */
@keyframes cellPop {
  0% { transform: scale(1); }
  40% { transform: scale(1.12); background: #c8f5d0; }
  100% { transform: scale(1); }
}
.cell-pop { animation: cellPop 0.35s ease-out; }
`;

function buildPuzzle() {
  const cells = Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => ({ row, col, solution: "", number: null, answers: [] }))
  );
  ANSWERS.forEach((entry) => {
    [...entry.answer].forEach((letter, offset) => {
      const row = entry.row + (entry.direction === "down" ? offset : 0);
      const col = entry.col + (entry.direction === "across" ? offset : 0);
      cells[row][col].solution = letter;
      if (!cells[row][col].answers.includes(entry.id)) cells[row][col].answers.push(entry.id);
    });
    cells[entry.row][entry.col].number = entry.number;
  });
  return cells;
}

function createBlankGrid(cells) {
  return cells.map((row) => row.map((cell) => (cell.solution ? "" : null)));
}

function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;
}

function getStars(moves, seconds) {
  const totalCells = ANSWERS.reduce((a, e) => a + e.answer.length, 0) - 12;
  if (seconds < 90) return 3;
  if (seconds < 180) return 2;
  return 1;
}

function Confetti({ active }) {
  if (!active) return null;
  const colors = ["#c0392b","#d4a017","#1a6b3c","#1a3a6b","#8e44ad","#e67e22"];
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i, left: `${Math.random()*100}vw`,
    color: colors[i % colors.length],
    delay: `${Math.random()*0.8}s`,
    duration: `${1.5 + Math.random()*1.5}s`,
    width: `${6 + Math.random()*8}px`,
    height: `${10 + Math.random()*10}px`,
  }));
  return (
    <>
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece" style={{
          left: p.left, background: p.color,
          width: p.width, height: p.height,
          animationDelay: p.delay, animationDuration: p.duration,
        }} />
      ))}
    </>
  );
}

export default function CrosswordPuzzle() {
  const cells = useMemo(() => buildPuzzle(), []);
  const entryMap = useMemo(() => Object.fromEntries(ANSWERS.map(e => [e.id, e])), []);

  const [grid, setGrid] = useState(() => createBlankGrid(cells));
  const [selected, setSelected] = useState({ row: 0, col: 0 });
  const [direction, setDirection] = useState("across");
  const [checked, setChecked] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [clueTab, setClueTab] = useState("across");
  const [animCells, setAnimCells] = useState(new Set());
  const [wrongCells, setWrongCells] = useState(new Set());
  const [justTypedCell, setJustTypedCell] = useState(null);
  const gridRef = useRef(null);

  const selectedCell = cells[selected.row][selected.col];
  const activeEntryId =
    selectedCell.answers.find(id => entryMap[id].direction === direction) ||
    selectedCell.answers[0];
  const activeEntry = entryMap[activeEntryId];

  const solvedCount = useMemo(() =>
    cells.flat().filter(c => c.solution && grid[c.row][c.col] === c.solution).length,
    [cells, grid]
  );
  const totalCells = useMemo(() => cells.flat().filter(c => c.solution).length, [cells]);
  const progress = Math.round((solvedCount / totalCells) * 100);

  const solvedEntries = useMemo(() => {
    return new Set(ANSWERS.filter(entry => {
      return [...entry.answer].every((letter, offset) => {
        const r = entry.row + (entry.direction === "down" ? offset : 0);
        const c = entry.col + (entry.direction === "across" ? offset : 0);
        return grid[r][c] === letter;
      });
    }).map(e => e.id));
  }, [grid]);

  // Site-standard sound effects: start cue, word-solved blip, victory jingle
  useGameSounds({
    started: !loading,
    won: finished,
    score: solvedEntries.size,
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (finished || loading) return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [finished, loading]);

  useEffect(() => {
    if (!loading) setTimeout(() => gridRef.current?.focus(), 100);
  }, [loading, selected, direction]);

  useEffect(() => {
    if (solvedCount === totalCells && totalCells > 0) {
      setTimeout(() => setFinished(true), 600);
    }
  }, [solvedCount, totalCells]);

  function isHighlighted(cell) {
    return activeEntry ? [...activeEntry.answer].some((_, offset) => {
      const r = activeEntry.row + (activeEntry.direction === "down" ? offset : 0);
      const c = activeEntry.col + (activeEntry.direction === "across" ? offset : 0);
      return r === cell.row && c === cell.col;
    }) : false;
  }

  function selectCell(row, col) {
    if (!cells[row][col].solution) return;
    const ids = cells[row][col].answers;
    if (row === selected.row && col === selected.col) {
      const other = ids.find(id => entryMap[id].direction !== direction);
      if (other) setDirection(entryMap[other].direction);
    } else {
      const pref = ids.find(id => entryMap[id].direction === direction);
      setDirection(pref ? direction : entryMap[ids[0]].direction);
      setSelected({ row, col });
    }
  }

  function moveWithin(step) {
    if (!activeEntry) return;
    const positions = [...activeEntry.answer].map((_, offset) => ({
      row: activeEntry.row + (activeEntry.direction === "down" ? offset : 0),
      col: activeEntry.col + (activeEntry.direction === "across" ? offset : 0),
    }));
    const idx = positions.findIndex(p => p.row === selected.row && p.col === selected.col);
    const next = positions[idx + step];
    if (next) setSelected(next);
  }

  function moveSelection(row, col, dir = direction) {
    if (row >= 0 && row < SIZE && col >= 0 && col < SIZE && cells[row][col].solution) {
      setDirection(dir);
      setSelected({ row, col });
    }
  }

  function enterLetter(letter) {
    if (!selectedCell.solution) return;
    setChecked(false);
    const key = `${selected.row}-${selected.col}`;
    setJustTypedCell(key);
    setTimeout(() => setJustTypedCell(null), 300);
    setGrid(cur => {
      const next = cur.map(r => [...r]);
      next[selected.row][selected.col] = letter.toUpperCase();
      return next;
    });
    moveWithin(1);
  }

  function clearCell() {
    setChecked(false);
    if (grid[selected.row][selected.col]) {
      setGrid(cur => { const n = cur.map(r=>[...r]); n[selected.row][selected.col]=""; return n; });
    } else { moveWithin(-1); }
  }

  function handleKeyDown(e) {
    if (/^[a-zA-Z]$/.test(e.key)) { e.preventDefault(); enterLetter(e.key); return; }
    if (e.key === "Backspace" || e.key === "Delete") { e.preventDefault(); clearCell(); return; }
    const moves = { ArrowUp:[-1,0,"down"], ArrowDown:[1,0,"down"], ArrowLeft:[0,-1,"across"], ArrowRight:[0,1,"across"] };
    if (moves[e.key]) { e.preventDefault(); const [dr,dc,nd]=moves[e.key]; moveSelection(selected.row+dr,selected.col+dc,nd); }
  }

  function checkPuzzle() {
    setChecked(true);
    const wrong = new Set();
    cells.flat().forEach(cell => {
      if (cell.solution && grid[cell.row][cell.col] && grid[cell.row][cell.col] !== cell.solution) {
        wrong.add(`${cell.row}-${cell.col}`);
      }
    });
    setWrongCells(wrong);
    setTimeout(() => setWrongCells(new Set()), 1200);
  }

  function revealWord() {
    if (!activeEntry) return;
    setGrid(cur => {
      const next = cur.map(r=>[...r]);
      [...activeEntry.answer].forEach((letter, offset) => {
        const r = activeEntry.row + (activeEntry.direction === "down" ? offset : 0);
        const c = activeEntry.col + (activeEntry.direction === "across" ? offset : 0);
        next[r][c] = letter;
      });
      return next;
    });
  }

  function revealAll() {
    setGrid(cells.map(row => row.map(cell => cell.solution || null)));
    setChecked(true);
  }

  function resetPuzzle() {
    setGrid(createBlankGrid(cells));
    setSelected({ row:0, col:0 }); setDirection("across");
    setChecked(false); setFinished(false); setSeconds(0);
    setAnimCells(new Set()); setWrongCells(new Set());
  }

  const today = new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
  const stars = getStars(0, seconds);

  const LOADING_WORD = "CROSSWORD".split("");

  return (
    <>
      <style>{CSS}</style>
      <Confetti active={finished} />

      {loading && (
        <div className="loading-screen">
          <div style={{ fontFamily:"var(--font-body)", fontStyle:"italic", fontSize:"0.78rem", color:"var(--ink4)", letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:"1.5rem" }}>
            The Daily Mini
          </div>
          <div className="loading-masthead">The <em>Crossword</em></div>
          <div className="loading-rule" />
          <div className="loading-rule2" />
          <div className="loading-tiles">
            {LOADING_WORD.map((letter, i) => (
              <div key={i} className="loading-tile" style={{ animationDelay: `${i * 0.07}s` }}>{letter}</div>
            ))}
          </div>
          <div className="loading-sub">Setting the board just for you…</div>
          <div className="loading-progress-track">
            <div className="loading-progress-fill" />
          </div>
          <div className="loading-progress-label">Loading puzzle…</div>
        </div>
      )}

      {finished && (
        <div className="win-overlay">
          <div className="win-card">
            <div className="win-header">
              <div className="win-headline">Solved!</div>
              <div className="win-sub">The Daily Crossword • Mini Edition</div>
            </div>
            <div className="win-body">
              <div className="win-stars">
                {[1,2,3].map(s => <div key={s} className="win-star">{s <= stars ? "★" : "☆"}</div>)}
              </div>
              <div className="win-stats-grid">
                <div className="win-stat-cell">
                  <div className="win-stat-num">{formatTime(seconds)}</div>
                  <div className="win-stat-lbl">Time</div>
                </div>
                <div className="win-stat-cell">
                  <div className="win-stat-num">{ANSWERS.length}</div>
                  <div className="win-stat-lbl">Words</div>
                </div>
                <div className="win-stat-cell">
                  <div className="win-stat-num">{stars}/3</div>
                  <div className="win-stat-lbl">Rating</div>
                </div>
              </div>
              <div className="win-msg">
                {stars === 3 ? "Outstanding! Lightning-fast solving — you're a natural wordsmith." :
                 stars === 2 ? "Well done! Clean solve with great focus and vocabulary." :
                 "Puzzle complete! Every word found, every square filled. Bravo!"}
              </div>
              <div className="win-btns">
                <button className="win-btn primary" onClick={resetPuzzle}>Play Again</button>
                <button className="win-btn secondary" onClick={() => setFinished(false)}>View Board</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="cw-root">
        {/* TOPBAR */}
        <div className="topbar">
          <div className="topbar-masthead">
            <div>
              <div className="masthead-brand">The <em>Crossword</em></div>
            </div>
            <div className="masthead-date">
              <div style={{ fontWeight:700, fontSize:"0.8rem" }}>Mini Edition</div>
              <div style={{ fontStyle:"italic", opacity:0.7 }}>{today}</div>
            </div>
          </div>
          <div className="topbar-stats-row">
            <div className="stats-group">
              <div className="stat-item">
                <span className="stat-label">Time</span>
                <span className="stat-value">{formatTime(seconds)}</span>
              </div>
              <div style={{ width:1, height:20, background:"var(--border2)" }} />
              <div className="stat-item">
                <span className="stat-label">Progress</span>
                <span className={`stat-value ${progress===100?"done":""}`}>{progress}%</span>
              </div>
              <div className="progress-inline">
                <div className="progress-inline-fill" style={{ width:`${progress}%` }} />
              </div>
            </div>
            <div className="topbar-actions">
              <button className="action-btn" onClick={checkPuzzle}>Check</button>
              <button className="action-btn" onClick={revealWord}>Hint</button>
              <button className="action-btn" onClick={revealAll}>Reveal</button>
              <button className="action-btn danger" onClick={resetPuzzle}>Reset</button>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="game-body">
          {/* PUZZLE AREA */}
          <div className="puzzle-area">
            <div
              className="cw-grid"
              style={{
                width: `min(100%, 56vh, 440px)`,
              }}
              role="grid"
              tabIndex={0}
              ref={gridRef}
              onKeyDown={handleKeyDown}
              aria-label="Crossword puzzle grid"
            >
              {cells.flat().map(cell => {
                const val = grid[cell.row][cell.col];
                const isSelected = cell.row === selected.row && cell.col === selected.col;
                const isHigh = isHighlighted(cell);
                const isCorrect = checked && val && val === cell.solution;
                const isWrong = wrongCells.has(`${cell.row}-${cell.col}`);
                const cellKey = `${cell.row}-${cell.col}`;
                const isJustTyped = justTypedCell === cellKey;

                return (
                  <div
                    key={cellKey}
                    className={[
                      "cw-cell",
                      !cell.solution ? "blocked" : "",
                      cell.solution && isHigh && !isSelected ? "highlighted" : "",
                      cell.solution && isSelected ? "selected" : "",
                      isCorrect ? "correct" : "",
                      isWrong ? "incorrect" : "",
                    ].filter(Boolean).join(" ")}
                    onClick={() => selectCell(cell.row, cell.col)}
                    role={cell.solution ? "gridcell" : undefined}
                  >
                    {cell.number && <span className="cell-number">{cell.number}</span>}
                    {cell.solution && (
                      <span className={["cell-letter", isJustTyped?"just-typed":"", isWrong?"wrong-shake":""].filter(Boolean).join(" ")}>
                        {val}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ACTIVE CLUE */}
            {activeEntry && (
              <div className="active-clue-bar">
                <div className="clue-tag">{activeEntry.number}{activeEntry.direction === "across" ? "A" : "D"}</div>
                <span className="clue-text">{activeEntry.clue}</span>
                <span className="clue-letters">{activeEntry.answer.length} letters</span>
              </div>
            )}

          </div>

          {/* CLUES PANEL */}
          <div className="clues-panel">
            <div className="clues-tabs">
              {["across","down"].map(dir => (
                <button key={dir} className={`clues-tab ${clueTab===dir?"active":""}`} onClick={() => setClueTab(dir)}>
                  {dir === "across" ? "Across" : "Down"}
                </button>
              ))}
            </div>
            <div className="clues-list">
              {ANSWERS.filter(e => e.direction === clueTab).map(entry => (
                <div
                  key={entry.id}
                  className={["clue-item", entry.id === activeEntryId ? "active" : "", solvedEntries.has(entry.id) ? "solved" : ""].filter(Boolean).join(" ")}
                  onClick={() => { setSelected({ row:entry.row, col:entry.col }); setDirection(entry.direction); setClueTab(entry.direction); gridRef.current?.focus(); }}
                >
                  <div className="clue-item-num">{entry.number}</div>
                  <div className="clue-item-text">{entry.clue}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

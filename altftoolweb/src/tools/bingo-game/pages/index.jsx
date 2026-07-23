"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Info } from "lucide-react";
import BingoBoard from "../components/BingoBoard";
import GameControls from "../components/GameControls";
import GameStats from "../components/GameStats";
import LiveGamePanel from "../components/LiveGamePanel";
import NumberCaller from "../components/NumberCaller";
import GameHeader from "../components/GameHeader";
import VictoryModal from "../components/VictoryModal";
import MascotTrack from "../components/MascotTrack";
import { soundManager } from "../utils/soundEffects";

import {
  generateBoard,
  getAllPoolNumbers,
  checkWin,
  initMarkedCells,
  getWinPatternLabel,
} from "../utils/bingoLogic";

function fireConfetti() {
  if (typeof window === "undefined") return;
  import("canvas-confetti").then((mod) => {
    const confetti = mod.default;
    confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
    setTimeout(() => confetti({ particleCount: 70, angle: 60, spread: 55, origin: { x: 0 } }), 250);
    setTimeout(() => confetti({ particleCount: 70, angle: 120, spread: 55, origin: { x: 1 } }), 400);
  });
}

export default function ToolHome() {
  const [board, setBoard] = useState(() => generateBoard());
  const [markedCells, setMarkedCells] = useState(() => initMarkedCells(board));
  const [poolNumbers, setPoolNumbers] = useState(() => getAllPoolNumbers());
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winPatterns, setWinPatterns] = useState([]);
  const [winningCells, setWinningCells] = useState(new Set());
  const [autoMark, setAutoMark] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [autoCallActive, setAutoCallActive] = useState(false);
  const [autoCallSpeed, setAutoCallSpeed] = useState(3000);
  const [timer, setTimer] = useState(0);
  const [poolIndex, setPoolIndex] = useState(0);

  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    winPercentage: 0,
    fastestWin: null,
  });

  const autoCallRef = useRef(null);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  const calledLetters = useMemo(() => {
    const counts = { B: 0, I: 0, N: 0, G: 0, O: 0 };
    calledNumbers.forEach((num) => {
      if (num >= 1 && num <= 15) counts.B++;
      else if (num >= 16 && num <= 30) counts.I++;
      else if (num >= 31 && num <= 45) counts.N++;
      else if (num >= 46 && num <= 60) counts.G++;
      else if (num >= 61 && num <= 75) counts.O++;
    });
    return counts;
  }, [calledNumbers]);

  const statusMessage = useMemo(() => {
    if (gameOver && winPatterns.length > 0) {
      return `BINGO! ${getWinPatternLabel(winPatterns[0])}`;
    }
    if (gameOver) return "Game Over — No winner";
    if (!gameStarted) return "Ready to play?";
    if (currentNumber) return `Last called: ${currentNumber}`;
    return "Call a number to start";
  }, [currentNumber, gameOver, gameStarted, winPatterns]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [gameStarted, gameOver]);

  const callNextNumber = useCallback(() => {
    setPoolIndex((prev) => {
      if (prev >= poolNumbers.length) return prev;
      const num = poolNumbers[prev];
      setCurrentNumber(num);
      setCalledNumbers((c) => [...c, num]);
      setGameStarted(true);

      if (soundEnabled) {
        soundManager.playNumberDraw();
      }

      return prev + 1;
    });
  }, [poolNumbers, soundEnabled]);

  useEffect(() => {
    if (autoCallActive && !gameOver && poolIndex < poolNumbers.length) {
      autoCallRef.current = setTimeout(() => {
        callNextNumber();
      }, autoCallSpeed);
      return () => clearTimeout(autoCallRef.current);
    }
    if (poolIndex >= poolNumbers.length) {
      setAutoCallActive(false);
    }
  }, [autoCallActive, autoCallSpeed, poolIndex, poolNumbers.length, gameOver, callNextNumber]);

  useEffect(() => {
    if (!autoMark || gameOver) return;

    if (currentNumber !== null) {
      setBoard((prevBoard) => {
        let found = false;
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 5; c++) {
            if (prevBoard[r][c].number === currentNumber && !prevBoard[r][c].isFree) {
              setMarkedCells((prev) => {
                const next = new Set(prev);
                next.add(`${r}-${c}`);
                const patterns = checkWin(next);
                if (patterns.length > 0 && !gameOver) {
                  setGameOver(true);
                  setAutoCallActive(false);
                  setWinPatterns(patterns);
                  const cells = new Set();
                  patterns.forEach((p) => p.cells.forEach(([pr, pc]) => cells.add(`${pr}-${pc}`)));
                  setWinningCells(cells);
                  setStats((prevStats) => {
                    const played = prevStats.gamesPlayed + 1;
                    const won = prevStats.gamesWon + 1;
                    return {
                      gamesPlayed: played,
                      gamesWon: won,
                      winPercentage: played > 0 ? Math.round((won / played) * 100) : 0,
                      fastestWin: prevStats.fastestWin === null ? timer : Math.min(prevStats.fastestWin, timer),
                    };
                  });
                  if (soundEnabled) soundManager.playWin();
                  fireConfetti();
                }
                return next;
              });
              found = true;
              break;
            }
          }
          if (found) break;
        }
        return prevBoard;
      });
    }
  }, [currentNumber, autoMark, gameOver, timer, soundEnabled]);

  function handleCellClick(row, col) {
    if (gameOver || board[row][col].isFree || markedCells.has(`${row}-${col}`)) return;

    const newMarked = new Set(markedCells);
    newMarked.add(`${row}-${col}`);
    setMarkedCells(newMarked);

    const patterns = checkWin(newMarked);
    if (patterns.length > 0) {
      setGameOver(true);
      setAutoCallActive(false);
      setWinPatterns(patterns);
      const cells = new Set();
      patterns.forEach((p) => p.cells.forEach(([r, c]) => cells.add(`${r}-${c}`)));
      setWinningCells(cells);
      setStats((prevStats) => {
        const played = prevStats.gamesPlayed + 1;
        const won = prevStats.gamesWon + 1;
        return {
          gamesPlayed: played,
          gamesWon: won,
          winPercentage: played > 0 ? Math.round((won / played) * 100) : 0,
          fastestWin: prevStats.fastestWin === null ? timer : Math.min(prevStats.fastestWin, timer),
        };
      });
      if (soundEnabled) soundManager.playWin();
      fireConfetti();
    }
  }

  function handleNewGame() {
    const newBoard = generateBoard();
    setBoard(newBoard);
    setMarkedCells(initMarkedCells(newBoard));
    setPoolNumbers(getAllPoolNumbers());
    setPoolIndex(0);
    setCalledNumbers([]);
    setCurrentNumber(null);
    setGameStarted(false);
    setGameOver(false);
    setWinPatterns([]);
    setWinningCells(new Set());
    setAutoCallActive(false);
    setTimer(0);
    clearInterval(timerRef.current);
    clearTimeout(autoCallRef.current);
  }

  function handleRestartGame() {
    setPoolNumbers(getAllPoolNumbers());
    setPoolIndex(0);
    setCalledNumbers([]);
    setCurrentNumber(null);
    setGameStarted(false);
    setGameOver(false);
    setWinPatterns([]);
    setWinningCells(new Set());
    setAutoCallActive(false);
    setTimer(0);
    clearInterval(timerRef.current);
    clearTimeout(autoCallRef.current);
    setMarkedCells(initMarkedCells(board));
  }

  function handleResetBoard() {
    handleNewGame();
  }

  function handleToggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  }

  useEffect(() => {
    function onFsChange() {
      setFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  return (
    <main
      ref={containerRef}
      className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-pink-500 selection:text-white px-3 py-6 sm:px-6 lg:px-8 overflow-hidden font-sans transition-colors duration-200 dark:bg-gradient-to-b dark:from-[#3a1532] dark:via-[#220923] dark:to-[#120314]"
    >
      {/* Ambient Animated Sunset Glow Orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-pink-500/10 dark:bg-pink-600/30 blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-amber-500/10 dark:bg-yellow-500/20 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-purple-500/10 dark:bg-purple-600/30 blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-6">

        {/* Game Header Component */}
        <GameHeader
          gameStarted={gameStarted}
          gameOver={gameOver}
          winPatterns={winPatterns}
          stats={stats}
          soundEnabled={soundEnabled}
        />

        {/* 3-Column Dashboard Grid */}
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)_340px] items-start">

          {/* Left Column: Sidebar Controls & Player Stats */}
          <aside className="space-y-6">
            <GameControls
              gameStarted={gameStarted}
              gameOver={gameOver}
              autoMark={autoMark}
              onNewGame={handleNewGame}
              onRestartGame={handleRestartGame}
              onResetBoard={handleResetBoard}
              onToggleAutoMark={() => setAutoMark((a) => !a)}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled((s) => !s)}
              fullscreen={fullscreen}
              onToggleFullscreen={handleToggleFullscreen}
            />

            <GameStats stats={stats} />
          </aside>

          {/* Center Column: Bingo Board & Main Arena */}
          <section className="space-y-6">

            {/* Status Header Banner */}
            <div className="rounded-3xl border-4 border-pink-400/60 bg-[var(--card)] p-5 backdrop-blur-xl shadow-xl flex items-center justify-between text-[var(--foreground)] dark:bg-gradient-to-b dark:from-[#3d134d] dark:via-[#2a0e36] dark:to-[#180521] dark:border-pink-400/80 dark:shadow-[0_0_35px_rgba(236,72,153,0.3)]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-600 dark:text-pink-300">
                  Game Board
                </span>
                <h2 className="text-xl font-black text-[var(--foreground)] dark:text-white">{statusMessage}</h2>
              </div>

              {currentNumber && (
                <div className="inline-flex items-center gap-2 rounded-2xl border border-pink-400/40 bg-pink-500/20 px-3.5 py-1.5 shadow-inner">
                  <span className="text-xs font-black text-pink-700 dark:text-pink-200">Last Draw:</span>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-300 to-amber-500 text-xs font-black text-slate-950 shadow-md">
                    {currentNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Empty State Banner when game has not started */}
            {!gameStarted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border-4 border-pink-400/60 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-amber-500/10 p-6 text-center shadow-lg backdrop-blur-md text-[var(--foreground)] dark:border-pink-400/80"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-yellow-300 to-amber-500 text-3xl shadow-lg shadow-yellow-500/30 text-slate-950">
                  🎲
                </div>
                <h3 className="mt-3 text-xl font-black text-[var(--foreground)] dark:text-white">Ready for Bingo Blitz?</h3>
                <p className="mt-1 text-xs text-[var(--muted-foreground)] dark:text-pink-200 max-w-md mx-auto font-semibold">
                  Click &quot;Call Next Number&quot; or start &quot;Auto Call&quot; to draw balls and daub star badges on your 5x5 board!
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400 bg-amber-400/20 px-4 py-1.5 text-xs font-black text-amber-800 dark:text-yellow-300">
                  <Sparkles className="h-4 w-4" /> Good Luck Blitz Player!
                </div>
              </motion.div>
            )}

            {/* Main Interactive 5x5 Bingo Board */}
            <BingoBoard
              board={board}
              markedCells={markedCells}
              onCellClick={handleCellClick}
              disabled={gameOver}
              winningCells={winningCells}
              soundEnabled={soundEnabled}
            />

            {/* Mascot Progress Rope Track */}
            <MascotTrack />

            {/* How To Play Card */}
            <div className="rounded-3xl border-4 border-pink-400/60 bg-[var(--card)] p-5 backdrop-blur-md text-[var(--foreground)] dark:bg-gradient-to-b dark:from-[#3d134d] dark:via-[#2a0e36] dark:to-[#180521] dark:border-pink-400/80">
              <div className="flex items-center gap-2 text-xs font-black text-pink-600 dark:text-pink-300 uppercase tracking-wider">
                <Info className="h-4 w-4 text-amber-500 dark:text-yellow-300" />
                Blitz Game Rules
              </div>
              <ul className="mt-3 space-y-2 text-xs text-[var(--muted-foreground)] dark:text-pink-200 font-semibold leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-pink-500/20 text-[10px] font-black text-pink-700 dark:text-yellow-300">1</span>
                  <span>Draw numbers using <strong>Call Next Number</strong> or enable <strong>Auto Call</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-pink-500/20 text-[10px] font-black text-pink-700 dark:text-yellow-300">2</span>
                  <span>Numbers are automatically daubed with ⭐ star stamps and rewards.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-pink-500/20 text-[10px] font-black text-pink-700 dark:text-yellow-300">3</span>
                  <span>Complete horizontal rows, columns, diagonals, or full house to achieve BINGO!</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Right Column: Number Caller & Telemetry */}
          <aside className="space-y-6">
            <NumberCaller
              calledNumbers={calledNumbers}
              currentNumber={currentNumber}
              calledLetters={calledLetters}
              onManualCall={callNextNumber}
              onAutoCall={() => setAutoCallActive((a) => !a)}
              autoCallActive={autoCallActive}
              autoCallSpeed={autoCallSpeed}
              onSpeedChange={setAutoCallSpeed}
              gameOver={gameOver}
              soundEnabled={soundEnabled}
            />

            <LiveGamePanel
              gameStarted={gameStarted}
              currentNumber={currentNumber}
              calledNumbers={calledNumbers}
              timer={timer}
              markedCount={markedCells.size}
              nextNumber={currentNumber}
            />
          </aside>

        </div>
      </div>

      {/* Fullscreen Victory Celebration Modal */}
      <VictoryModal
        isOpen={gameOver && winPatterns.length > 0}
        winPatternLabel={winPatterns.length > 0 ? getWinPatternLabel(winPatterns[0]) : ""}
        timer={timer}
        calledCount={calledNumbers.length}
        onPlayAgain={handleNewGame}
        soundEnabled={soundEnabled}
      />
    </main>
  );
}

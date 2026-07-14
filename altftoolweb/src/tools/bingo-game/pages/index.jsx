"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Grid3X3, Trophy } from "lucide-react";
import BingoBoard from "../components/BingoBoard";
import GameControls from "../components/GameControls";
import GameStats from "../components/GameStats";
import LiveGamePanel from "../components/LiveGamePanel";
import NumberCaller from "../components/NumberCaller";
import ScoreCard from "../components/ScoreCard";
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
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } }), 250);
    setTimeout(() => confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } }), 400);
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
  const [soundEnabled, setSoundEnabled] = useState(false);
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
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 800;
          gain.gain.value = 0.1;
          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.stop(ctx.currentTime + 0.3);
        } catch {}
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
                  setStats((prev) => {
                    const played = prev.gamesPlayed + 1;
                    const won = prev.gamesWon + 1;
                    return {
                      gamesPlayed: played,
                      gamesWon: won,
                      winPercentage: played > 0 ? Math.round((won / played) * 100) : 0,
                      fastestWin: prev.fastestWin === null ? timer : Math.min(prev.fastestWin, timer),
                    };
                  });
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
  }, [currentNumber, autoMark, gameOver, timer]);

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
      setStats((prev) => {
        const played = prev.gamesPlayed + 1;
        const won = prev.gamesWon + 1;
        return {
          gamesPlayed: played,
          gamesWon: won,
          winPercentage: played > 0 ? Math.round((won / played) * 100) : 0,
          fastestWin: prev.fastestWin === null ? timer : Math.min(prev.fastestWin, timer),
        };
      });
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
      className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Grid3X3 className="h-4 w-4" />
            Classic game
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] xl:items-end">
            <div className="min-w-0">
              <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
                Bingo Game
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
                Play classic 5x5 Bingo with auto-generated boards, number calling, manual marking,
                win detection, and confetti celebrations.
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
              <ScoreCard label="Called" value={calledNumbers.length} />
              <ScoreCard label="Marked" value={markedCells.size} />
              <ScoreCard label="Won" value={stats.gamesWon} />
              <ScoreCard label="Played" value={stats.gamesPlayed} />
            </div>
          </div>
        </section>

        {winPatterns.length > 0 && (
          <section className="mt-6 rounded-lg border-2 border-[var(--primary)] bg-[var(--primary)]/10 p-6 text-center shadow-[var(--anslation-ds-shadow-md)]">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white">
              <Trophy className="h-5 w-5" />
              BINGO!
            </div>
            <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">
              {getWinPatternLabel(winPatterns[0])}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Completed in {timer} seconds with {calledNumbers.length} numbers called
            </p>
          </section>
        )}

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--primary)]">Game board</p>
                <h2 className="mt-1 text-xl font-semibold">{statusMessage}</h2>
              </div>
              {currentNumber && (
                <div className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold">
                  <span className="text-[var(--muted-foreground)]">Last</span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
                    {currentNumber}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6">
              <BingoBoard
                board={board}
                markedCells={markedCells}
                onCellClick={handleCellClick}
                disabled={gameOver}
                winningCells={winningCells}
              />
            </div>

            <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">How to play</p>
              <ul className="mt-2 space-y-1 text-sm leading-5 text-[var(--muted-foreground)]">
                <li className="flex items-start gap-2">
                  <span aria-hidden="true" className="mt-0.5 text-[var(--primary)]">1.</span>
                  Click &quot;Call Number&quot; or enable &quot;Auto Call&quot; to draw numbers
                </li>
                <li className="flex items-start gap-2">
                  <span aria-hidden="true" className="mt-0.5 text-[var(--primary)]">2.</span>
                  Numbers are auto-marked on your board (or mark manually)
                </li>
                <li className="flex items-start gap-2">
                  <span aria-hidden="true" className="mt-0.5 text-[var(--primary)]">3.</span>
                  Complete a row, column, diagonal, four corners, or full house to win
                </li>
              </ul>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
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
            />

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

            <LiveGamePanel
              gameStarted={gameStarted}
              currentNumber={currentNumber}
              calledNumbers={calledNumbers}
              timer={timer}
              markedCount={markedCells.size}
              nextNumber={currentNumber}
            />

            <GameStats stats={stats} />
          </aside>
        </section>
      </div>
    </main>
  );
}

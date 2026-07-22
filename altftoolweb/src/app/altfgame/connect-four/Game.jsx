
"use client";

import { useState, useEffect, useRef } from "react";
import { createBoard, findLowestEmptyRow, checkWinner, checkDraw, PLAYER_1, PLAYER_2, COLS } from "./logic/GameLogic";
import { Trophy, Play, RotateCcw, Maximize, Minimize, Volume2, VolumeX } from "lucide-react";
import confetti from 'canvas-confetti';

export default function ConnectFourGame({ isPreview = false }) {
  const [board, setBoard] = useState(createBoard());
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_1);
  const [winner, setWinner] = useState(null); // { winner, line }
  const [isDraw, setIsDraw] = useState(false);
  const [gameState, setGameState] = useState(isPreview ? "PLAYING" : "START"); // START, PLAYING, GAME_OVER
  const [soundEnabled, setSoundEnabled] = useState(true);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sound placeholders
  const playSound = (type) => {
    if (!soundEnabled) return;
    // Implement sound logic here if needed
  };

  const toggleFullscreen = () => {
    const elem = containerRef.current;
    if (!document.fullscreenElement) {
      if (elem?.requestFullscreen) elem.requestFullscreen();
      else if (elem?.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#eab308']
    });
  };

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  const handleColumnClick = (colIndex) => {
    if (gameState !== "PLAYING" || winner || isDraw) return;

    const rowIndex = findLowestEmptyRow(board, colIndex);
    if (rowIndex === -1) return; // Column full

    const newBoard = board.map(row => [...row]);
    newBoard[rowIndex][colIndex] = currentPlayer;
    setBoard(newBoard);
    playSound("drop");

    // Check Win/Draw immediately
    const win = checkWinner(newBoard);
    if (win) {
        setWinner(win);
        fireConfetti();
        setTimeout(() => setGameState("GAME_OVER"), 1500);
    } else if (checkDraw(newBoard)) {
        setIsDraw(true);
        setTimeout(() => setGameState("GAME_OVER"), 1500);
    } else {
        // Switch turn if game continues
        setCurrentPlayer(currentPlayer === PLAYER_1 ? PLAYER_2 : PLAYER_1);
    }
  };

  const startGame = () => {
    setBoard(createBoard());
    setCurrentPlayer(PLAYER_1);
    setWinner(null);
    setIsDraw(false);
    setGameState("PLAYING");
  };

  const renderCell = (row, col) => {
    const value = board[row][col];
    const isWinningCell = winner?.line?.some(([r, c]) => r === row && c === col);

    return (
      <div
        key={`${row}-${col}`}
        className="relative w-full aspect-square flex items-center justify-center"
      >
        <div
            className={`
                w-[85%] h-[85%] rounded-full shadow-inner transition-all duration-500 ease-bounce
                ${value === PLAYER_1 ? 'bg-red-500 shadow-[inset_0_4px_6px_rgba(0,0,0,0.4)]' :
                  value === PLAYER_2 ? 'bg-yellow-400 shadow-[inset_0_4px_6px_rgba(0,0,0,0.4)]' :
                  'bg-zinc-900/40 shadow-[inset_0_4px_6px_rgba(0,0,0,0.6)]'}
                ${isWinningCell ? 'ring-4 ring-white animate-pulse brightness-110' : ''}
            `}
        >
            {value && (
                <div className="absolute top-[20%] left-[20%] w-[25%] h-[25%] bg-white/20 rounded-full blur-[1px]" />
            )}
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[600px] bg-zinc-950 rounded-xl font-sans select-none border-4 border-zinc-800 shadow-2xl overflow-hidden flex flex-col">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-zinc-950 pointer-events-none" />

      {/* Header / HUD */}
      <div className="relative z-10 flex items-center justify-between p-4 bg-zinc-900/80 border-b border-zinc-800 backdrop-blur-md">
        <div className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${currentPlayer === PLAYER_1 ? 'bg-red-500/10 border-red-500 text-red-500' : 'border-zinc-700 text-zinc-500'}`}>
            <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm" />
            <span className="font-bold text-sm tracking-wide">PLAYER 1</span>
        </div>

        <div className="text-zinc-600 font-bold text-xs tracking-widest">VS</div>

        <div className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${currentPlayer === PLAYER_2 ? 'bg-yellow-500/10 border-yellow-400 text-yellow-400' : 'border-zinc-700 text-zinc-500'}`}>
            <span className="font-bold text-sm tracking-wide">PLAYER 2</span>
            <div className="w-4 h-4 rounded-full bg-yellow-400 shadow-sm" />
        </div>
      </div>

      {/* Game Area */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        {/* Board Container */}
        <div className="relative bg-blue-600 p-3 sm:p-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-4 border-blue-700 max-w-[600px] w-full mx-auto">
            {/* Column Click Targets (Invisible Overlay) */}
            <div className="absolute inset-0 z-20 flex w-full h-full">
                {Array.from({ length: COLS }).map((_, colIndex) => (
                    <div
                        key={colIndex}
                        onClick={() => handleColumnClick(colIndex)}
                        className="flex-1 h-full cursor-pointer hover:bg-white/5 transition-colors group"
                    >
                        {/* Hover Indicator Disc */}
                        {gameState === "PLAYING" && !winner && (
                            <div className={`
                                hidden group-hover:flex justify-center absolute -top-12 w-[14.28%]
                                transition-all duration-200 opacity-0 group-hover:opacity-100
                            `}
                            style={{ left: `${colIndex * 14.28}%` }}
                            >
                                <div className={`w-10 h-10 rounded-full shadow-lg ${currentPlayer === PLAYER_1 ? 'bg-red-500' : 'bg-yellow-400'}`} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 grid grid-rows-6 grid-cols-7 gap-1 sm:gap-2 bg-blue-600 rounded-lg">
                {board.map((row, r) => (
                    row.map((_, c) => renderCell(r, c))
                ))}
            </div>

            {/* Legs (Visual) */}
            <div className="absolute -bottom-8 -left-4 w-4 h-24 bg-zinc-800 rounded-full -rotate-12 -z-10" />
            <div className="absolute -bottom-8 -right-4 w-4 h-24 bg-zinc-800 rounded-full rotate-12 -z-10" />
        </div>
      </div>

      {/* Controls */}
      {!isPreview && (
        <div className="absolute top-4 right-4 z-50 flex gap-2">
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 bg-zinc-800/80 text-zinc-400 hover:text-white rounded-lg transition-colors">
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button onClick={toggleFullscreen} className="p-2 bg-zinc-800/80 text-zinc-400 hover:text-white rounded-lg transition-colors">
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
        </div>
      )}

      {/* START SCREEN */}
      {gameState === "START" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-md z-50">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tighter drop-shadow-xl">
                CONNECT <span className="text-blue-500">4</span>
            </h1>
            <p className="text-zinc-400 font-medium mb-8 tracking-widest uppercase text-sm">Classic Strategy Game</p>
            <button
                onClick={startGame}
                className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black tracking-widest uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] hover:-translate-y-1 active:translate-y-0"
            >
                Start Game
            </button>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {gameState === "GAME_OVER" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-lg z-50 animate-in fade-in duration-300">
            <Trophy className={`w-20 h-20 mb-6 ${winner?.winner === PLAYER_1 ? 'text-red-500' : winner?.winner === PLAYER_2 ? 'text-yellow-400' : 'text-zinc-400'} animate-bounce`} />

            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-2">
                {winner ? (winner.winner === PLAYER_1 ? "RED WINS!" : "YELLOW WINS!") : "DRAW!"}
            </h2>

            <p className="text-zinc-400 mb-8 font-mono text-sm">
                {winner ? "Great strategy!" : "No more moves left."}
            </p>

            <button
                onClick={startGame}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors"
            >
                <RotateCcw size={18} />
                Play Again
            </button>
        </div>
      )}
    </div>
  );
}

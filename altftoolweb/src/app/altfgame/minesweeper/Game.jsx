"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    createEmptyGrid,
    plantMines,
    revealCell,
    toggleFlag,
    chordCell,
} from "./logic/MinesweeperLogic";
import {
    Bomb,
    Flag,
    Trophy,
    RefreshCw,
    Timer,
    Smile,
    Frown,
    Meh,
    Play
} from "lucide-react";
import confetti from "canvas-confetti";
import { useGameSounds } from "@/app/altfgame/_lib/sounds";

const DIFFICULTY = {
    BEGINNER: { rows: 9, cols: 9, mines: 10, label: "BEGINNER" },
    INTERMEDIATE: { rows: 16, cols: 16, mines: 40, label: "INTERMEDIATE" },
    EXPERT: { rows: 16, cols: 30, mines: 99, label: "EXPERT" },
};

const CELL_COLORS = [
    'transparent',
    '#3b82f6', // 1: Blue
    '#22c55e', // 2: Green
    '#ef4444', // 3: Red
    '#8b5cf6', // 4: Purple
    '#f97316', // 5: Orange
    '#06b6d4', // 6: Cyan
    '#ec4899', // 7: Pink
    '#64748b'  // 8: Slate
];

export default function MinesweeperGame() {
    const [config, setConfig] = useState(DIFFICULTY.BEGINNER);
    const [grid, setGrid] = useState([]);
    const [gameState, setGameState] = useState("START"); // START | IDLE | PLAYING | WON | LOST
    useGameSounds({ started: gameState === "PLAYING", won: gameState === "WON", lost: gameState === "LOST", tick: grid, sounds: { lose: "boom" } });
    const [loseReason, setLoseReason] = useState(null); // "MINE"
    const [flagsUsed, setFlagsUsed] = useState(0);
    const [safeCellsLeft, setSafeCellsLeft] = useState(0);
    const [time, setTime] = useState(0);
    const [isMouseDown, setIsMouseDown] = useState(false);

    const timerRef = useRef(null);
    const containerRef = useRef(null);

    const startNewGame = useCallback((difficulty) => {
        setGrid(createEmptyGrid(difficulty.rows, difficulty.cols));
        setFlagsUsed(0);
        setSafeCellsLeft(difficulty.rows * difficulty.cols - difficulty.mines);
        setTime(0);
        setLoseReason(null);
        setGameState("IDLE");
    }, []);

    // INIT
    useEffect(() => {
        startNewGame(config);
    }, [config, startNewGame]);

    // TIMER
    useEffect(() => {
        if (gameState === "PLAYING") {
            timerRef.current = setInterval(() => setTime(t => Math.min(t + 1, 999)), 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [gameState]);

    const handleAction = (r, c, type) => {
        if (["WON", "LOST"].includes(gameState)) return;

        let currentGrid = grid;
        let revealedCount = 0;
        let hitMine = false;

        // First click logic
        if (gameState === "IDLE" || gameState === "START") {
            if (type === "REVEAL") {
                currentGrid = plantMines(
                    grid,
                    config.rows,
                    config.cols,
                    config.mines,
                    r,
                    c
                );
                setGameState("PLAYING");
            } else {
                // Can't flag before starting? Actually standard minesweeper allows it,
                // but for simplicity let's start game on reveal.
                if (type === "FLAG") return;
            }
        }

        if (type === "FLAG") {
            const res = toggleFlag(currentGrid, r, c);
            setFlagsUsed(f => f + res.delta);
            currentGrid = res.grid;
        }

        if (type === "REVEAL") {
            const res = revealCell(currentGrid, r, c);
            currentGrid = res.grid;
            revealedCount = res.revealed;
            hitMine = res.hitMine;
        }

        if (type === "CHORD") {
            const res = chordCell(currentGrid, r, c);
            currentGrid = res.grid;
            revealedCount = res.revealed;
            hitMine = res.hitMine;
        }

        setGrid(currentGrid);

        if (hitMine) {
            setGameState("LOST");
            setLoseReason("MINE");
            return;
        }

        if (revealedCount > 0) {
            const newSafeLeft = safeCellsLeft - revealedCount;
            setSafeCellsLeft(newSafeLeft);
            if (newSafeLeft === 0) {
                setGameState("WON");
                confetti({
                    particleCount: 200,
                    spread: 100,
                    origin: { y: 0.6 },
                    colors: ['#3b82f6', '#22c55e', '#ef4444', '#eab308']
                });
            }
        }
    };

    const getSmiley = () => {
        if (gameState === "WON") return <Trophy className="text-yellow-500" size={24} />;
        if (gameState === "LOST") return <Frown className="text-red-500" size={24} />;
        if (isMouseDown) return <Meh className="text-yellow-400" size={24} />;
        return <Smile className="text-yellow-400" size={24} />;
    };

    // Responsive sizing logic
    const sizeVars = config.cols < 10
        ? "md:[--cell-size:45px] md:[--text-size:24px] md:[--icon-size:28px] lg:[--cell-size:60px] lg:[--text-size:32px] lg:[--icon-size:36px] xl:[--cell-size:75px] xl:[--text-size:40px] xl:[--icon-size:48px]"
        : config.cols < 20
            ? "md:[--cell-size:32px] md:[--text-size:18px] md:[--icon-size:20px] lg:[--cell-size:40px] lg:[--text-size:22px] lg:[--icon-size:24px] xl:[--cell-size:48px] xl:[--text-size:26px] xl:[--icon-size:30px]"
            : "md:[--cell-size:26px] md:[--text-size:14px] md:[--icon-size:16px] lg:[--cell-size:30px] lg:[--text-size:16px] lg:[--icon-size:18px] xl:[--cell-size:35px] xl:[--text-size:20px] xl:[--icon-size:22px]";

    const defaultVars = "[--cell-size:28px] [--text-size:16px] [--icon-size:16px]";

    return (
        <div
            className="w-full min-h-full flex flex-col items-center justify-center p-4 select-none bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-sans"
            onMouseUp={() => setIsMouseDown(false)}
            onMouseLeave={() => setIsMouseDown(false)}
        >
            {/* GAME CONTAINER */}
            <div
                className={`bg-slate-200 p-1.5 rounded-lg shadow-2xl border-b-4 border-r-4 border-slate-400 border-t-4 border-l-4 border-slate-100 max-w-full transition-all duration-300 ${defaultVars} ${sizeVars}`}
            >

                {/* HEADER */}
                <div className="bg-slate-300 border-4 border-slate-400 border-b-slate-100 border-r-slate-100 p-3 mb-3 flex justify-between items-center inset-shadow min-w-min gap-4">
                    {/* MINE COUNTER */}
                    <div className="bg-black text-red-600 font-mono text-3xl font-bold px-2 py-0.5 rounded border-b-2 border-r-2 border-slate-600 border-t-2 border-l-2 border-slate-500 min-w-[80px] text-center shadow-inner">
                        {Math.max(0, config.mines - flagsUsed).toString().padStart(3, '0')}
                    </div>

                    {/* RESET BUTTON */}
                    <button
                        onClick={() => startNewGame(config)}
                        onMouseDown={() => setIsMouseDown(true)}
                        className="w-12 h-12 bg-slate-200 border-t-4 border-l-4 border-white border-b-4 border-r-4 border-slate-400 active:border-t-slate-400 active:border-l-slate-400 active:border-b-white active:border-r-white flex items-center justify-center transition-none shadow-sm active:shadow-inner shrink-0"
                    >
                        {getSmiley()}
                    </button>

                    {/* TIMER */}
                    <div className="bg-black text-red-600 font-mono text-3xl font-bold px-2 py-0.5 rounded border-b-2 border-r-2 border-slate-600 border-t-2 border-l-2 border-slate-500 min-w-[80px] text-center shadow-inner">
                        {time.toString().padStart(3, '0')}
                    </div>
                </div>

                {/* DIFFICULTY TABS */}
                <div className="flex gap-1 mb-3 justify-center flex-wrap">
                    {Object.entries(DIFFICULTY).map(([key, diff]) => (
                        <button
                            key={key}
                            onClick={() => setConfig(diff)}
                            className={`
                                px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all
                                ${config.label === diff.label
                                    ? "bg-blue-600 text-white shadow-inner"
                                    : "bg-slate-300 text-slate-600 hover:bg-slate-400 shadow-sm"
                                }
                                rounded-sm
                            `}
                        >
                            {diff.label}
                        </button>
                    ))}
                </div>

                {/* GRID CONTAINER */}
                <div
                    className="bg-slate-400 p-1 border-4 border-slate-500 border-b-slate-200 border-r-slate-200 shadow-inner overflow-auto max-h-[70vh] max-w-[95vw] relative scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-300"
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${config.cols}, var(--cell-size))`,
                            gridTemplateRows: `repeat(${config.rows}, var(--cell-size))`,
                            gap: '0px'
                        }}
                    >
                        {grid.map((row, r) => (
                            row.map((cell, c) => {
                                const isRevealed = cell.isOpen;
                                const isFlagged = cell.isFlagged;
                                const isMine = cell.isMine;

                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        onMouseDown={(e) => {
                                            if (e.button === 0) setIsMouseDown(true);
                                        }}
                                        onMouseUp={() => setIsMouseDown(false)}
                                        onClick={() => handleAction(r, c, "REVEAL")}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            handleAction(r, c, "FLAG");
                                        }}
                                        onDoubleClick={() => handleAction(r, c, "CHORD")}
                                        className={`
                                            flex items-center justify-center font-bold select-none
                                            ${isRevealed
                                                ? (isMine
                                                    ? "bg-red-600 border border-red-800"
                                                    : "bg-slate-200 border border-slate-300")
                                                : "bg-slate-300 border-t-2 border-l-2 border-white border-b-2 border-r-2 border-slate-500 hover:bg-slate-200"
                                            }
                                        `}
                                        style={{ width: 'var(--cell-size)', height: 'var(--cell-size)', fontSize: 'var(--text-size)' }}
                                    >
                                        {isRevealed && !isMine && cell.count > 0 && (
                                            <span style={{ color: CELL_COLORS[cell.count] }}>
                                                {cell.count}
                                            </span>
                                        )}
                                        {isRevealed && isMine && (
                                            <Bomb className="text-black fill-black" style={{ width: 'var(--icon-size)', height: 'var(--icon-size)' }} />
                                        )}
                                        {!isRevealed && isFlagged && (
                                            <Flag className="text-red-600 fill-red-600" style={{ width: 'var(--icon-size)', height: 'var(--icon-size)' }} />
                                        )}
                                    </div>
                                );
                            })
                        ))}
                    </div>

                    {/* REPLAY OVERLAY */}
                    {(gameState === "WON" || gameState === "LOST") && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10 animate-in fade-in duration-300">
                            <h2 className={`text-2xl font-black mb-4 tracking-wider drop-shadow-md ${gameState === "WON" ? "text-yellow-400" : "text-red-500"}`}>
                                {gameState === "WON" ? "CLEARED!" : "FAILED!"}
                            </h2>
                            <button
                                onClick={() => startNewGame(config)}
                                className="px-6 py-2 bg-slate-200 border-t-4 border-l-4 border-white border-b-4 border-r-4 border-slate-500 hover:bg-white active:border-t-slate-500 active:border-l-slate-500 active:border-b-white active:border-r-white text-black font-bold text-sm tracking-wide shadow-lg active:translate-y-0.5 active:shadow-none transition-all"
                            >
                                PLAY AGAIN
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* STATUS MESSAGE */}
            <div className="mt-6 text-white font-mono text-lg drop-shadow-md">
                {gameState === "WON" && "🎉 MISSION ACCOMPLISHED 🎉"}
                {gameState === "LOST" && "💥 MISSION FAILED 💥"}
                {gameState === "PLAYING" && "⚠️ MINES DETECTED ⚠️"}
            </div>
        </div>
    );
}

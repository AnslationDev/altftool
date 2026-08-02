"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { RotateCcw, Maximize, Minimize } from "lucide-react";
import { useGameSounds } from "@/app/altfgame/_lib/sounds";

/**
 * 2048 Game Implementation
 */

const GRID_SIZE = 4;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;

// Colors for tiles
const TILE_COLORS = {
    2: "bg-zinc-200 text-zinc-900 border-zinc-300",
    4: "bg-zinc-300 text-zinc-900 border-zinc-400",
    8: "bg-orange-200 text-orange-900 border-orange-300",
    16: "bg-orange-300 text-orange-900 border-orange-400",
    32: "bg-orange-400 text-white border-orange-500",
    64: "bg-orange-500 text-white border-orange-600",
    128: "bg-yellow-400 text-white border-yellow-500 shadow-[0_0_15px_rgba(250,204,21,0.4)]",
    256: "bg-yellow-500 text-white border-yellow-600 shadow-[0_0_20px_rgba(234,179,8,0.5)]",
    512: "bg-yellow-600 text-white border-yellow-700 shadow-[0_0_25px_rgba(202,138,4,0.6)]",
    1024: "bg-yellow-700 text-white border-yellow-800 shadow-[0_0_30px_rgba(161,98,7,0.7)]",
    2048: "bg-yellow-900 text-white border-black shadow-[0_0_50px_rgba(234,179,8,0.8)] animate-pulse",
};

export default function Game2048({ isPreview = false }) {
    const containerRef = useRef(null);
    const [board, setBoard] = useState(Array(CELL_COUNT).fill(null));
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    useGameSounds({ score, won, lost: gameOver });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const boardRef = useRef(board); // For event listeners to access current state

    const addNewTile = (currentBoard) => {
        const emptyIndices = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        if (emptyIndices.length === 0) return;

        const randIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        currentBoard[randIndex] = { value, id: Date.now() + Math.random(), isNew: true };
    };

    const startGame = useCallback(() => {
        // Mobile Fullscreen Auto-Trigger
        /*
        const isMobile = typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);
        if (isMobile && !document.fullscreenElement && containerRef.current) {
            containerRef.current.requestFullscreen().catch(err => console.log("Fullscreen request failed:", err));
        }
        */

        const newBoard = Array(CELL_COUNT).fill(null);
        addNewTile(newBoard);
        addNewTile(newBoard);
        setBoard(newBoard);
        setScore(0);
        setGameOver(false);
        setWon(false);
    }, []);

    const setupPreview = useCallback(() => {
        // Create a nice looking board for preview
        const newBoard = Array(CELL_COUNT).fill(null);
        [0, 1, 4, 5, 8, 9, 13].forEach(i => {
            const val = Math.pow(2, Math.floor(Math.random() * 6) + 1);
            newBoard[i] = { value: val, id: Math.random() };
        });
        setBoard(newBoard);

        // Auto play simulation for preview loop ??
        // Simplified: Just static nice board for now to avoid complexity in preview hook
    }, []);

    // Initialize Game
    useEffect(() => {
        let saved = null;
        try {
            saved = localStorage.getItem("2048-highscore");
        } catch (e) {
            /* localStorage unavailable — ignore */
        }
        // eslint-disable-next-line
        if (saved) setHighScore(parseInt(saved, 10));

        if (isPreview) {
            setupPreview();
        } else {
            startGame();
        }
    }, [isPreview, setupPreview, startGame]);

    // Keep ref in sync
    useEffect(() => {
        boardRef.current = board;
    }, [board]);



    // --- GAME LOGIC ---


    // Check Game Over
    const checkGameOver = (currentBoard) => {
        if (currentBoard.includes(null)) return false;
        // Check neighbors
        for (let i = 0; i < CELL_COUNT; i++) {
            const val = currentBoard[i].value;
            // Check right
            if ((i + 1) % GRID_SIZE !== 0 && currentBoard[i + 1].value === val) return false;
            // Check down
            if (i + GRID_SIZE < CELL_COUNT && currentBoard[i + GRID_SIZE].value === val) return false;
        }
        return true;
    };

    const move = useCallback((direction) => {
        if (gameOver || won) return;

        let newBoard = [...boardRef.current];
        let moved = false;
        let pointsAdded = 0;

        // Helper to process a single line (row/col)
        const processLine = (line) => {
            // Remove nulls
            let filtered = line.filter(t => t !== null);

            // Merge
            for (let i = 0; i < filtered.length - 1; i++) {
                if (!filtered[i]) continue; // Skip if this tile was already merged into the previous one

                if (filtered[i].value === filtered[i + 1].value) {
                    filtered[i].value *= 2;
                    filtered[i].merged = true; // For animation trigger
                    pointsAdded += filtered[i].value;
                    filtered[i + 1] = null;
                    if (filtered[i].value === 2048) setWon(true);
                }
            }

            // Remove nulls again after merge
            filtered = filtered.filter(t => t !== null);

            // Pad with nulls to original length
            while (filtered.length < GRID_SIZE) {
                filtered.push(null);
            }
            return filtered;
        };

        // Generic Matrix Transformation for processing
        // 0: Up, 1: Right, 2: Down, 3: Left

        // Strategy: Rotate board so we always process "Left" (0 to 3), then rotate back
        // Or just map indices.

        let lines = [];
        // Extract rows or cols
        const isRow = direction === 'Left' || direction === 'Right';

        for (let i = 0; i < GRID_SIZE; i++) {
            let line = [];
            for (let j = 0; j < GRID_SIZE; j++) {
                let idx = isRow ? i * GRID_SIZE + j : j * GRID_SIZE + i;
                line.push(newBoard[idx]);
            }

            if (direction === 'Right' || direction === 'Down') line.reverse();

            const processed = processLine(line);

            if (direction === 'Right' || direction === 'Down') processed.reverse();

            // Check if line changed
            for (let k = 0; k < GRID_SIZE; k++) {
                let valNow = processed[k];
                let idx = isRow ? i * GRID_SIZE + k : k * GRID_SIZE + i;
                // Id check isn't enough because merged tiles might technically be different objects?
                // But simply checking values + nulls
                if (newBoard[idx] !== valNow) { // Object reference check might fail if processLine creates new objects
                }
            }
            lines.push(processed);
        }

        // Reassemble
        let finalBoard = Array(CELL_COUNT).fill(null);
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                let idx = isRow ? i * GRID_SIZE + j : j * GRID_SIZE + i;
                finalBoard[idx] = lines[i][j];
            }
        }

        // Check format
        const boardChanged = JSON.stringify(newBoard) !== JSON.stringify(finalBoard);

        if (boardChanged) {
            // Clean merge flags from previous turn if any? processLine adds them new
            addNewTile(finalBoard);
            setBoard(finalBoard);
            setScore(s => s + pointsAdded);
            if (score + pointsAdded > highScore && !isPreview) {
                setHighScore(score + pointsAdded);
                try {
                    localStorage.setItem("2048-highscore", score + pointsAdded);
                } catch (e) {
                    /* localStorage unavailable — ignore */
                }
            }

            if (checkGameOver(finalBoard)) {
                setGameOver(true);
            }
        }
    }, [gameOver, won, highScore, isPreview, score]);
    // ^ Deps are tricky here due to closure, using boardRef fixes logic but effect deps need care.


    // Keyboard Input
    useEffect(() => {
        if (isPreview) return;

        const handleKeyDown = (e) => {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                e.preventDefault();
                const dir = e.key.replace("Arrow", "");
                move(dir);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [move, isPreview]);

    // Touch Handling
    const touchStartRef = useRef(null);

    const handleTouchStart = (e) => {
        touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    };

    const handleTouchEnd = (e) => {
        if (!touchStartRef.current) return;
        const touchEnd = {
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY
        };

        const dx = touchEnd.x - touchStartRef.current.x;
        const dy = touchEnd.y - touchStartRef.current.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal
            if (Math.abs(dx) > 30) { // Threshold
                move(dx > 0 ? "Right" : "Left");
            }
        } else {
            // Vertical
            if (Math.abs(dy) > 30) {
                move(dy > 0 ? "Down" : "Up");
            }
        }
        touchStartRef.current = null;
    };

    // Fullscreen
    const toggleFullscreen = () => {
        const elem = containerRef.current;
        const isFS = document.fullscreenElement || document.webkitFullscreenElement;

        if (!isFS) {
            if (elem?.requestFullscreen) elem.requestFullscreen().catch(err => console.log(err));
            else if (elem?.webkitRequestFullscreen) elem.webkitRequestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            setIsFullscreen(false);
        }
    };


    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-amber-50 rounded-xl overflow-hidden font-sans select-none border-4 border-yellow-600 shadow-2xl flex flex-col items-center justify-center p-4 touch-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >

            {/* Header / Score */}
            <div className={`w-full max-w-sm flex justify-between items-end mb-6 ${isPreview ? 'scale-75 origin-top' : ''}`}>
                <div>
                    <h2 className="text-4xl md:text-5xl font-black text-yellow-700 leading-none">2048</h2>
                    <p className="text-yellow-600 font-bold text-sm tracking-widest opacity-70">PUZZLE</p>
                </div>
                <div className="flex gap-2 text-center">
                    <div className="bg-amber-200/50 p-2 rounded-lg min-w-[70px]">
                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Score</p>
                        <p className="text-xl font-bold text-amber-900">{score}</p>
                    </div>
                    <div className="bg-amber-200/50 p-2 rounded-lg min-w-[70px]">
                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Best</p>
                        <p className="text-xl font-bold text-amber-900">{highScore}</p>
                    </div>
                </div>
            </div>

            {/* Controls Row */}
            {!isPreview && (
                <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={toggleFullscreen} className="p-2 bg-amber-200/50 hover:bg-amber-300 text-amber-800 rounded-lg">
                        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                    </button>
                    <button onClick={startGame} className="p-2 bg-amber-200/50 hover:bg-amber-300 text-amber-800 rounded-lg">
                        <RotateCcw size={18} />
                    </button>
                </div>
            )}

            {/* Game Board */}
            <div className="relative bg-amber-200 p-2 rounded-xl shadow-inner border border-amber-300">

                {/* Grid Background */}
                <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100/50 rounded-lg" />
                    ))}
                </div>

                {/* Tiles Layer */}
                <div className="absolute inset-0 p-2 grid grid-cols-4 gap-2 pointer-events-none">
                    {board.map((tile, i) => (
                        <div key={i} className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                            {tile && (
                                <div
                                    className={`
                                        w-full h-full flex items-center justify-center rounded-lg border-b-4
                                        font-black text-2xl sm:text-3xl transition-all duration-150 animate-in zoom-in-50
                                        ${TILE_COLORS[tile.value] || TILE_COLORS[2048]}
                                        ${tile.merged ? 'animate-bounce' : ''}
                                    `}
                                >
                                    {tile.value}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Overlays */}
                {(gameOver || won) && (
                    <div className="absolute inset-0 bg-amber-100/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-10 animate-in fade-in">
                        <h2 className="text-4xl font-black text-amber-800 mb-2">{won ? "YOU WIN!" : "GAME OVER"}</h2>
                        <button
                            onClick={startGame}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>

            {/* Instructions */}
            {!isPreview && (
                <p className="mt-6 text-amber-700/60 font-medium text-sm flex items-center gap-2">
                    use <span className="font-bold border border-amber-300 px-1 rounded bg-amber-100">arrow keys</span> to merge numbers
                </p>
            )}

        </div>
    );
}

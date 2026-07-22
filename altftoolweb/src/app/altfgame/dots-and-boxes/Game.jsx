'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { DotsAndBoxesLogic, GAME_CONFIG } from './logic/GameLogic';
import { RotateCcw, User, Cpu, Trophy, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DotsAndBoxesGame({ isPreview = false }) {
    // --- State ---
    const [logic, setLogic] = useState(() => new DotsAndBoxesLogic(3));
    const [gridSize, setGridSize] = useState(3); // 3x3 boxes
    const [gameMode, setGameMode] = useState('pvp'); // pvp, ai
    const [difficulty, setDifficulty] = useState(GAME_CONFIG.DIFFICULTY.MEDIUM);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [hoverLine, setHoverLine] = useState(null); // { type, r, c }
    const [triggerRender, setTriggerRender] = useState(0); // Force re-render for logic updates

    const containerRef = useRef(null);
    const aiTimeoutRef = useRef(null);

    // --- Sound Effects (Simple Oscillator) ---
    const playSound = useCallback((type) => {
        if (!soundEnabled) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            const now = ctx.currentTime;

            if (type === 'move') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
            } else if (type === 'box') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(500, now + 0.2);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
            } else if (type === 'win') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.setValueAtTime(600, now + 0.2);
                osc.frequency.setValueAtTime(800, now + 0.4);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 1.0);
                osc.start(now);
                osc.stop(now + 1.0);
            }
        } catch (e) {
            console.error("Audio failed", e);
        }
    }, [soundEnabled]);

    const fireConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const random = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } }));
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
      };

    // --- Game Actions ---
    const resetGame = useCallback(() => {
        const newLogic = new DotsAndBoxesLogic(gridSize);
        setLogic(newLogic);
        setTriggerRender(prev => prev + 1);
        if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    }, [gridSize]);

    const handleMove = useCallback((type, r, c) => {
        if (logic.winner || logic.isLineTaken(type, r, c)) return;

        // Player Move
        const result = logic.makeMove(type, r, c);
        if (result && result.success) {
            playSound(result.extraTurn ? 'box' : 'move');
            setTriggerRender(prev => prev + 1);

            if (logic.winner) {
                playSound('win');
                fireConfetti();
            }
        }
    }, [logic, playSound]);

    // --- AI Loop ---
    useEffect(() => {
        if (gameMode === 'ai' && logic.currentPlayer === 2 && !logic.winner) {
            aiTimeoutRef.current = setTimeout(() => {
                const move = logic.getAIMove(difficulty);
                if (move) {
                    const result = logic.makeMove(move.type, move.r, move.c);
                    if (result && result.success) {
                        playSound(result.extraTurn ? 'box' : 'move');
                        setTriggerRender(prev => prev + 1);
                        if (logic.winner) {
                            playSound('win');
                            fireConfetti();
                        }
                    }
                }
            }, 600); // Delay for realism
        }
        return () => {
            if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
        };
    }, [logic, logic.currentPlayer, gameMode, difficulty, playSound, triggerRender]);

    // --- Render Helpers ---
    const DOT_SPACING = 60;
    const DOT_RADIUS = 6;
    const LINE_THICKNESS = 8;
    const HIT_AREA = 20;

    // SVG Dimensions
    // Dots: (gridSize + 1)
    // Width = (gridSize) * DOT_SPACING + Padding
    const padding = 40;
    const svgWidth = (gridSize) * DOT_SPACING + (padding * 2);
    const svgHeight = (gridSize) * DOT_SPACING + (padding * 2);

    const getCoord = (idx) => padding + idx * DOT_SPACING;

    return (
        <div className="flex flex-col items-center justify-center min-h-[600px] bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 font-sans select-none rounded-xl">

            {/* Header / Scoreboard */}
            <div className="flex flex-col w-full max-w-md gap-4 mb-6">
                <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                    {/* Player 1 */}
                    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${logic.currentPlayer === 1 ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500' : ''}`}>
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            <User size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">YOU</span>
                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{logic.scores[1]}</span>
                        </div>
                    </div>

                    {/* VS / Turn Indicator */}
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-gray-400">VS</span>
                        {logic.winner ? (
                            <span className="text-xs font-bold text-green-500 animate-pulse">GAME OVER</span>
                        ) : (
                            <div className={`w-3 h-3 rounded-full mt-1 ${logic.currentPlayer === 1 ? 'bg-blue-500' : 'bg-red-500'} animate-bounce`} />
                        )}
                    </div>

                    {/* Player 2 / AI */}
                    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${logic.currentPlayer === 2 ? 'bg-red-100 dark:bg-red-900/30 ring-2 ring-red-500' : ''}`}>
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                                {gameMode === 'ai' ? 'CPU' : 'P2'}
                            </span>
                            <span className="text-2xl font-black text-red-600 dark:text-red-400">{logic.scores[2]}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                            {gameMode === 'ai' ? <Cpu size={20} /> : <User size={20} />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Game Board */}
            <div
                ref={containerRef}
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 transition-all duration-300"
                style={{ width: '100%', maxWidth: '500px', aspectRatio: '1/1' }}
            >
                <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-full touch-none"
                    style={{ cursor: logic.winner ? 'default' : 'pointer' }}
                >
                    <defs>
                        <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeOpacity="0.1"/>
                        </pattern>
                    </defs>

                    {/* Boxes (Filled) */}
                    {Array(gridSize).fill(0).map((_, r) =>
                        Array(gridSize).fill(0).map((_, c) => {
                            const owner = logic.boxes[r][c];
                            if (!owner) return null;
                            return (
                                <rect
                                    key={`box-${r}-${c}`}
                                    x={getCoord(c)}
                                    y={getCoord(r)}
                                    width={DOT_SPACING}
                                    height={DOT_SPACING}
                                    fill={owner === 1 ? GAME_CONFIG.COLORS.P1 : GAME_CONFIG.COLORS.P2}
                                    opacity="0.2"
                                    className="animate-fade-in"
                                />
                            );
                        })
                    )}

                    {/* Box Owner Icons (Optional) */}
                     {Array(gridSize).fill(0).map((_, r) =>
                        Array(gridSize).fill(0).map((_, c) => {
                            const owner = logic.boxes[r][c];
                            if (!owner) return null;
                            return (
                                <text
                                    key={`text-${r}-${c}`}
                                    x={getCoord(c) + DOT_SPACING/2}
                                    y={getCoord(r) + DOT_SPACING/2}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill={owner === 1 ? GAME_CONFIG.COLORS.P1 : GAME_CONFIG.COLORS.P2}
                                    fontSize="24"
                                    fontWeight="bold"
                                    opacity="0.8"
                                >
                                    {owner === 1 ? 'P1' : (gameMode === 'ai' ? 'AI' : 'P2')}
                                </text>
                            );
                        })
                    )}

                    {/* Horizontal Lines (Click Targets & Drawn Lines) */}
                    {Array(gridSize + 1).fill(0).map((_, r) =>
                        Array(gridSize).fill(0).map((_, c) => {
                            const isTaken = logic.hLines[r][c];
                            const isHover = hoverLine?.type === 'h' && hoverLine?.r === r && hoverLine?.c === c;

                            // Dynamic Tailwind classes for visibility
                            let strokeClass = "transition-all duration-200 ";
                            if (isTaken) {
                                strokeClass += "stroke-gray-800 dark:stroke-gray-100";
                            } else if (isHover) {
                                strokeClass += "stroke-blue-400 dark:stroke-blue-400 opacity-60";
                            } else {
                                strokeClass += "stroke-transparent";
                            }

                            return (
                                <g key={`h-${r}-${c}`}
                                   onClick={() => handleMove('h', r, c)}
                                   onMouseEnter={() => !logic.winner && !isTaken && setHoverLine({type: 'h', r, c})}
                                   onMouseLeave={() => setHoverLine(null)}
                                   className="cursor-pointer"
                                >
                                    {/* Invisible Hit Area */}
                                    <rect
                                        x={getCoord(c) + DOT_RADIUS}
                                        y={getCoord(r) - HIT_AREA/2}
                                        width={DOT_SPACING - DOT_RADIUS*2}
                                        height={HIT_AREA}
                                        fill="transparent"
                                    />
                                    {/* Visible Line */}
                                    <line
                                        x1={getCoord(c)}
                                        y1={getCoord(r)}
                                        x2={getCoord(c+1)}
                                        y2={getCoord(r)}
                                        strokeWidth={LINE_THICKNESS}
                                        strokeLinecap="round"
                                        className={strokeClass}
                                    />
                                </g>
                            );
                        })
                    )}

                    {/* Vertical Lines */}
                    {Array(gridSize).fill(0).map((_, r) =>
                        Array(gridSize + 1).fill(0).map((_, c) => {
                            const isTaken = logic.vLines[r][c];
                            const isHover = hoverLine?.type === 'v' && hoverLine?.r === r && hoverLine?.c === c;

                            // Dynamic Tailwind classes for visibility
                            let strokeClass = "transition-all duration-200 ";
                            if (isTaken) {
                                strokeClass += "stroke-gray-800 dark:stroke-gray-100";
                            } else if (isHover) {
                                strokeClass += "stroke-blue-400 dark:stroke-blue-400 opacity-60";
                            } else {
                                strokeClass += "stroke-transparent";
                            }

                            return (
                                <g key={`v-${r}-${c}`}
                                   onClick={() => handleMove('v', r, c)}
                                   onMouseEnter={() => !logic.winner && !isTaken && setHoverLine({type: 'v', r, c})}
                                   onMouseLeave={() => setHoverLine(null)}
                                   className="cursor-pointer"
                                >
                                    {/* Invisible Hit Area */}
                                    <rect
                                        x={getCoord(c) - HIT_AREA/2}
                                        y={getCoord(r) + DOT_RADIUS}
                                        width={HIT_AREA}
                                        height={DOT_SPACING - DOT_RADIUS*2}
                                        fill="transparent"
                                    />
                                    {/* Visible Line */}
                                    <line
                                        x1={getCoord(c)}
                                        y1={getCoord(r)}
                                        x2={getCoord(c)}
                                        y2={getCoord(r+1)}
                                        strokeWidth={LINE_THICKNESS}
                                        strokeLinecap="round"
                                        className={strokeClass}
                                    />
                                </g>
                            );
                        })
                    )}

                    {/* Dots (Render last to stay on top) */}
                    {Array(gridSize + 1).fill(0).map((_, r) =>
                        Array(gridSize + 1).fill(0).map((_, c) => (
                            <circle
                                key={`dot-${r}-${c}`}
                                cx={getCoord(c)}
                                cy={getCoord(r)}
                                r={DOT_RADIUS}
                                className="fill-gray-800 dark:fill-gray-200"
                            />
                        ))
                    )}
                </svg>

                {/* Game Over Overlay */}
                {logic.winner && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-10 animate-fade-in">
                        <Trophy size={64} className="text-yellow-500 mb-4 animate-bounce" />
                        <h2 className="text-4xl font-black mb-2 text-gray-800 dark:text-white">
                            {logic.winner === 'draw' ? "It's a Draw!" :
                             logic.winner === 1 ? "You Win!" :
                             (gameMode === 'ai' ? "CPU Wins!" : "Player 2 Wins!")}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Score: {logic.scores[1]} - {logic.scores[2]}
                        </p>
                        <button
                            onClick={resetGame}
                            className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
                        >
                            Play Again
                        </button>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="mt-6 flex flex-wrap justify-center gap-4">
                 {/* Mode Toggle */}
                 <button
                    onClick={() => {
                        const newMode = gameMode === 'pvp' ? 'ai' : 'pvp';
                        setGameMode(newMode);
                        resetGame(); // Reset on mode change
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    {gameMode === 'pvp' ? <User size={18}/> : <Cpu size={18}/>}
                    <span>{gameMode === 'pvp' ? 'PvP' : 'vs AI'}</span>
                </button>

                {/* Difficulty (Only for AI) */}
                {gameMode === 'ai' && (
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none"
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                )}

                {/* Grid Size */}
                <select
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none"
                >
                    <option value="3">3x3 Grid</option>
                    <option value="4">4x4 Grid</option>
                    <option value="5">5x5 Grid</option>
                    <option value="6">6x6 Grid</option>
                </select>

                {/* Restart */}
                <button
                    onClick={resetGame}
                    className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title="Restart"
                >
                    <RotateCcw size={20} />
                </button>

                {/* Sound */}
                <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title="Sound"
                >
                    {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
            </div>
        </div>
    );
}

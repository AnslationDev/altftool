'use client';

import { useState, useEffect, useRef } from 'react';
import {
    startGame,
    rollDice,
    getValidMoves,
    getTokenCoords,
    checkCapture,
    checkWin,
    isGameOver,
    getBestMove,
    calculateNextPosition,
    PLAYER_COLORS,
    SAFE_SPOTS,
    YARD_SPOTS,
    TOKEN_STATES
} from './Logic';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RotateCcw, User, Cpu, Play } from 'lucide-react';
import { useGameSounds } from "@/app/altfgame/_lib/sounds";

// --- CONSTANTS ---
const CANVAS_SIZE = 1500; // Internal resolution
const GRID_SIZE = 15;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;

const GAME_PHASES = {
    SETUP: 'SETUP',
    ROLL: 'ROLL',
    SELECT: 'SELECT',
    MOVING: 'MOVING',
    WIN: 'WIN'
};

const DiceIcon = ({ value, className }) => {
    const icons = [Dice1, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const Icon = icons[value] || Dice1;
    return <Icon className={className} />;
};

const LudoGame = () => {
    // --- STATE ---
    const [gameState, setGameState] = useState(() => startGame(4)); // Default 4 players
    const [animState, setAnimState] = useState({
        active: false,
        playerId: -1,
        tokenIdx: -1,
        path: [],
        currentStep: 0,
        t: 0
    });
    const [diceAnim, setDiceAnim] = useState({ rolling: false, value: 1 });
    const [message, setMessage] = useState('Welcome to Ludo!');
    useGameSounds({ won: (gameState?.winners?.length || 0) > 0, roll: diceAnim.rolling });
    const [showPlayerSelect, setShowPlayerSelect] = useState(true);

    // --- REFS ---
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const gameStateRef = useRef(gameState);
    const animStateRef = useRef(animState);

    // Sync refs
    useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
    useEffect(() => { animStateRef.current = animState; }, [animState]);

    // --- INITIALIZATION ---
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (canvas && container) {
                const size = Math.min(container.clientWidth, container.clientHeight) * 0.95;
                canvas.style.width = `${size}px`;
                canvas.style.height = `${size}px`;
            }
            draw();
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        // Native Event Listener for Canvas Input
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('pointerdown', handlePointerDown, { passive: false });
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            if (canvas) {
                canvas.removeEventListener('pointerdown', handlePointerDown);
            }
        };
    }, []);

    // --- GAME LOOP ---
    useEffect(() => {
        let animationFrameId;
        const loop = () => {
            updateAnimation();
            draw();
            animationFrameId = requestAnimationFrame(loop);
        };
        loop();
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    // --- AI TURN HANDLER ---
    useEffect(() => {
        if (gameState.phase === GAME_PHASES.WIN || showPlayerSelect) return;

        const currentPlayer = gameState.players[gameState.turn];
        if (!currentPlayer.active || !currentPlayer.isAI) return;

        let timeoutId;

        if (gameState.phase === GAME_PHASES.ROLL && !diceAnim.rolling) {
            timeoutId = setTimeout(() => {
                handleRollDice();
            }, 1000);
        } else if (gameState.phase === GAME_PHASES.SELECT && !animState.active) {
            timeoutId = setTimeout(() => {
                const bestTokenIdx = getBestMove(
                    gameState.turn,
                    currentPlayer.tokens,
                    gameState.dice,
                    gameState.players
                );

                if (bestTokenIdx !== null && bestTokenIdx !== undefined) {
                    performMove(bestTokenIdx);
                } else {
                     passTurn();
                }
            }, 1000);
        }
        return () => clearTimeout(timeoutId);
    }, [gameState, diceAnim.rolling, animState.active, showPlayerSelect]);

    // --- LOGIC ---
    const updateAnimation = () => {
        const anim = animStateRef.current;
        if (!anim.active) return;

        let { t, currentStep, path } = anim;
        t += 0.15; // Animation speed

        if (t >= 1) {
            t = 0;
            currentStep++;
            if (currentStep >= path.length - 1) {
                setAnimState({ active: false, playerId: -1, tokenIdx: -1, path: [], currentStep: 0, t: 0 });
                finalizeMove(anim.playerId, anim.tokenIdx);
                return;
            }
        }
        setAnimState(prev => ({ ...prev, t, currentStep }));
    };

    const handleRollDice = () => {
        if (gameState.phase !== GAME_PHASES.ROLL || diceAnim.rolling) return;

        setDiceAnim({ rolling: true, value: 1 });
        let rollCount = 0;
        const rollInterval = setInterval(() => {
            setDiceAnim(prev => ({ ...prev, value: Math.floor(Math.random() * 6) + 1 }));
            rollCount++;
            if (rollCount > 10) {
                clearInterval(rollInterval);
                const rollValue = rollDice();
                        setDiceAnim({ rolling: false, value: rollValue });

                        const currentState = gameStateRef.current;
                        const currentPlayer = currentState.players[currentState.turn];
                        const validMoves = getValidMoves(currentState.turn, currentPlayer.tokens, rollValue);

                        if (validMoves.length === 0) {
                            setGameState(prev => ({
                                ...prev,
                                dice: rollValue,
                                phase: GAME_PHASES.ROLL
                            }));
                            setTimeout(passTurn, 1000);
                        } else {
                            setGameState(prev => ({
                                ...prev,
                                dice: rollValue,
                                phase: GAME_PHASES.SELECT,
                                highlightedTokens: validMoves
                            }));
                        }
            }
        }, 50);
    };

    const performMove = (tokenIdx) => {
        const state = gameStateRef.current; // Always use current state from Ref
        const playerIdx = state.turn;
        const currentTokenPos = state.players[playerIdx].tokens[tokenIdx];
        const dice = state.dice;
        const nextPos = calculateNextPosition(playerIdx, currentTokenPos, dice);

        if (nextPos === null) return;

        const pathPoints = [];
        const startCoords = getCoordsForState(playerIdx, currentTokenPos, tokenIdx);
        pathPoints.push(startCoords);
        const endCoords = getCoordsForState(playerIdx, nextPos, tokenIdx);
        pathPoints.push(endCoords);

        setAnimState({
            active: true,
            playerId: playerIdx,
            tokenIdx: tokenIdx,
            path: pathPoints,
            currentStep: 0,
            t: 0
        });
    };

    const finalizeMove = (playerIdx, tokenIdx) => {
        const currentState = gameStateRef.current;
        const player = currentState.players[playerIdx];
        const currentPos = player.tokens[tokenIdx];
        const dice = currentState.dice;
        const nextPos = calculateNextPosition(playerIdx, currentPos, dice);

        let nextPlayers = JSON.parse(JSON.stringify(currentState.players));
        nextPlayers[playerIdx].tokens[tokenIdx] = nextPos;

        let captureHappened = false;
        if (nextPos <= 51) {
             const capture = checkCapture(nextPlayers, playerIdx, nextPos, tokenIdx);
             if (capture) {
                 captureHappened = true;
                 const oppIdx = capture.playerId;
                 const oppTokenIdx = capture.tokenIdx;
                 nextPlayers[oppIdx].tokens[oppTokenIdx] = TOKEN_STATES.YARD;
                 setMessage(`Captured ${nextPlayers[oppIdx].color}!`);
             }
        }

        if (checkWin(nextPlayers[playerIdx].tokens)) {
            nextPlayers[playerIdx].rank = currentState.winners.length + 1;
            const newWinners = [...currentState.winners, playerIdx];
            if (isGameOver(nextPlayers)) {
                setGameState(prev => ({ ...prev, players: nextPlayers, winners: newWinners, phase: GAME_PHASES.WIN }));
                return;
            }
        }

        const finished = nextPos === TOKEN_STATES.FINISHED;
        const rolledSix = dice === 6;
        let nextTurn = currentState.turn;

        if (rolledSix || captureHappened || finished) {
            setMessage(rolledSix ? "Rolled 6! Roll again." : captureHappened ? "Capture! Roll again." : "Home! Roll again.");
        } else {
            nextTurn = (currentState.turn + 1) % 4;
            let loopCount = 0;
            while ((!nextPlayers[nextTurn].active || nextPlayers[nextTurn].rank !== null) && loopCount < 4) {
                nextTurn = (nextTurn + 1) % 4;
                loopCount++;
            }
            setMessage(`Player ${nextPlayers[nextTurn].color}'s Turn`);
        }

        setGameState(prev => ({
            ...prev,
            players: nextPlayers,
            turn: nextTurn,
            phase: GAME_PHASES.ROLL,
            dice: 0,
            highlightedTokens: []
        }));
    };

    const passTurn = () => {
        const currentState = gameStateRef.current;
        let nextTurn = (currentState.turn + 1) % 4;
        const players = currentState.players;
        let loopCount = 0;
        while ((!players[nextTurn].active || players[nextTurn].rank !== null) && loopCount < 4) {
            nextTurn = (nextTurn + 1) % 4;
            loopCount++;
        }
        setGameState(prev => ({ ...prev, turn: nextTurn, phase: GAME_PHASES.ROLL, dice: 0, highlightedTokens: [] }));
        setMessage(`Player ${players[nextTurn].color}'s Turn`);
    };

    const handleReset = () => {
        setGameState(startGame(4));
        setAnimState({ active: false, playerId: -1, tokenIdx: -1, path: [], currentStep: 0, t: 0 });
        setDiceAnim({ rolling: false, value: 1 });
        setShowPlayerSelect(true);
        setMessage("Welcome to Ludo!");
    };

    // --- DRAWING ---
    const getCoordsForState = (playerIdx, tokenState, tokenIdx) => {
        if (tokenState === TOKEN_STATES.YARD) {
            const spot = YARD_SPOTS[playerIdx][tokenIdx];
            return { x: spot[0], y: spot[1] };
        }
        const coords = getTokenCoords(playerIdx, tokenState);
        if (coords) return { x: coords[0], y: coords[1] };
        return { x: 7, y: 7 };
    };

    const handlePointerDown = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const state = gameStateRef.current;
        if (state.phase !== GAME_PHASES.SELECT || animStateRef.current.active) return;

        const currentPlayer = state.players[state.turn];
        if (currentPlayer.isAI) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);

        let clickedTokenIdx = -1;

        for (const tokenIdx of state.highlightedTokens) {
            const tokenState = currentPlayer.tokens[tokenIdx];
            const coords = getCoordsForState(state.turn, tokenState, tokenIdx);

            const cx = coords.x * CELL_SIZE + CELL_SIZE / 2;
            const cy = coords.y * CELL_SIZE + CELL_SIZE / 2;

            const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
            if (dist < CELL_SIZE * 0.9) {
                clickedTokenIdx = tokenIdx;
                break;
            }
        }

        if (clickedTokenIdx !== -1) {
            performMove(clickedTokenIdx);
        }
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawBoard(ctx);
        drawTokens(ctx);
    };

    const drawBoard = (ctx) => {
        const drawYard = (pid, color, startX, startY) => {
            ctx.fillStyle = color;
            ctx.fillRect(startX * CELL_SIZE, startY * CELL_SIZE, 6 * CELL_SIZE, 6 * CELL_SIZE);
            ctx.fillStyle = 'white';
            ctx.fillRect((startX + 1) * CELL_SIZE, (startY + 1) * CELL_SIZE, 4 * CELL_SIZE, 4 * CELL_SIZE);
            ctx.fillStyle = color;
            YARD_SPOTS[pid].forEach(spot => {
                ctx.beginPath();
                ctx.arc(spot[0] * CELL_SIZE + CELL_SIZE/2, spot[1] * CELL_SIZE + CELL_SIZE/2, CELL_SIZE * 0.3, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        drawYard(0, PLAYER_COLORS[0], 0, 0);
        drawYard(1, PLAYER_COLORS[1], 9, 0);
        drawYard(3, PLAYER_COLORS[3], 0, 9);
        drawYard(2, PLAYER_COLORS[2], 9, 9);

        ctx.beginPath();
        ctx.moveTo(6 * CELL_SIZE, 6 * CELL_SIZE);
        ctx.lineTo(9 * CELL_SIZE, 6 * CELL_SIZE);
        ctx.lineTo(9 * CELL_SIZE, 9 * CELL_SIZE);
        ctx.lineTo(6 * CELL_SIZE, 9 * CELL_SIZE);
        ctx.fillStyle = 'white';
        ctx.fill();

        const drawCenterTri = (p1, p2, p3, color) => {
            ctx.beginPath();
            ctx.moveTo(p1[0] * CELL_SIZE, p1[1] * CELL_SIZE);
            ctx.lineTo(p2[0] * CELL_SIZE, p2[1] * CELL_SIZE);
            ctx.lineTo(p3[0] * CELL_SIZE, p3[1] * CELL_SIZE);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
        };

        drawCenterTri([6,6], [9,6], [7.5, 7.5], PLAYER_COLORS[1]);
        drawCenterTri([9,6], [9,9], [7.5, 7.5], PLAYER_COLORS[2]);
        drawCenterTri([9,9], [6,9], [7.5, 7.5], PLAYER_COLORS[3]);
        drawCenterTri([6,9], [6,6], [7.5, 7.5], PLAYER_COLORS[0]);

        const drawStrip = (startX, startY, w, h, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(startX * CELL_SIZE, startY * CELL_SIZE, w * CELL_SIZE, h * CELL_SIZE);
        };

        drawStrip(1, 7, 5, 1, PLAYER_COLORS[0]);
        drawStrip(7, 1, 1, 5, PLAYER_COLORS[1]);
        drawStrip(9, 7, 5, 1, PLAYER_COLORS[2]);
        drawStrip(7, 9, 1, 5, PLAYER_COLORS[3]);

        ctx.fillStyle = '#cbd5e1';
        SAFE_SPOTS.forEach(idx => {
             // Safe spot visualization could be added here
        });

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;

        ctx.fillStyle = PLAYER_COLORS[0]; ctx.fillRect(1 * CELL_SIZE, 6 * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = PLAYER_COLORS[1]; ctx.fillRect(8 * CELL_SIZE, 1 * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = PLAYER_COLORS[2]; ctx.fillRect(13 * CELL_SIZE, 8 * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = PLAYER_COLORS[3]; ctx.fillRect(6 * CELL_SIZE, 13 * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    };

    const drawTokens = (ctx) => {
        const state = gameStateRef.current;
        const anim = animStateRef.current;
        const cellGroups = {};

        state.players.forEach((player, pIdx) => {
            player.tokens.forEach((tokenPos, tIdx) => {
                if (anim.active && anim.playerId === pIdx && anim.tokenIdx === tIdx) return;

                let uniqueKey = '';
                if (tokenPos === TOKEN_STATES.YARD) uniqueKey = `YARD_${pIdx}_${tIdx}`;
                else if (tokenPos >= TOKEN_STATES.HOME_START) uniqueKey = `HOME_${pIdx}_${tokenPos}`;
                else uniqueKey = `MAIN_${tokenPos}`;

                if (!cellGroups[uniqueKey]) cellGroups[uniqueKey] = [];
                cellGroups[uniqueKey].push({ pIdx, tIdx, tokenPos });
            });
        });

        Object.values(cellGroups).forEach(group => {
            group.forEach((token, index) => {
                const count = group.length;
                const coords = getCoordsForState(token.pIdx, token.tokenPos, token.tIdx);
                let cx = coords.x * CELL_SIZE + CELL_SIZE / 2;
                let cy = coords.y * CELL_SIZE + CELL_SIZE / 2;

                if (count > 1) {
                    const offset = CELL_SIZE * 0.15;
                    cx += (index - (count - 1) / 2) * offset;
                    cy -= (index - (count - 1) / 2) * offset;
                }

                const isHighlighted = state.highlightedTokens.includes(token.tIdx) && state.turn === token.pIdx;
                drawTokenCircle(ctx, cx, cy, PLAYER_COLORS[token.pIdx], isHighlighted);
            });
        });

        if (anim.active) {
            const { path, currentStep, t } = anim;
            if (path && path.length > 0) {
                const start = path[currentStep];
                const end = path[currentStep + 1] || start;
                const curX = start.x + (end.x - start.x) * t;
                const curY = start.y + (end.y - start.y) * t;
                const cx = curX * CELL_SIZE + CELL_SIZE / 2;
                const cy = curY * CELL_SIZE + CELL_SIZE / 2;
                drawTokenCircle(ctx, cx, cy, PLAYER_COLORS[anim.playerId], false, 1.1);
            }
        }
    };

    const drawTokenCircle = (ctx, x, y, color, isHighlighted, scale = 1) => {
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 3;

        ctx.beginPath();
        ctx.arc(x, y, CELL_SIZE * 0.35 * scale, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, CELL_SIZE * 0.25 * scale, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        if (isHighlighted) {
            ctx.beginPath();
            ctx.arc(x, y, CELL_SIZE * 0.45 * scale, 0, 2 * Math.PI);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    };

    return (
        <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white relative overflow-hidden select-none">

            {/* SETUP OVERLAY */}
            {showPlayerSelect && (
                <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
                    <h2 className="text-4xl font-bold mb-8 text-yellow-400">LUDO MASTER</h2>
                    <div className="flex gap-4 mb-8">
                        {[2, 3, 4].map(num => (
                            <button
                                key={num}
                                onClick={() => {
                                    setGameState(startGame(num));
                                    setShowPlayerSelect(false);
                                }}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-xl font-bold transition-all"
                            >
                                {num} Players
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* HEADER */}
                    <div className="absolute top-4 w-full px-4 flex justify-between items-center z-10 max-w-[600px] pointer-events-none">
                        <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 shadow-lg backdrop-blur-sm">
                            {gameState.players[gameState.turn].isAI ? <Cpu size={20} /> : <User size={20} />}
                            <span className="font-bold" style={{ color: PLAYER_COLORS[gameState.turn] }}>
                                {gameState.players[gameState.turn].color}
                            </span>
                        </div>

                        <div className="text-sm font-medium opacity-80 bg-slate-800/60 px-3 py-1 rounded-full backdrop-blur-sm">{message}</div>

                        <button
                            onClick={handleReset}
                            className="p-2 bg-slate-800/80 rounded-full hover:bg-slate-700 transition-colors pointer-events-auto shadow-lg backdrop-blur-sm"
                        >
                            <RotateCcw size={20} />
                        </button>
                    </div>

            {/* CANVAS */}
            <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                style={{
                    touchAction: 'none', // Handle all touches in JS
                    width: '90vmin',
                    height: '90vmin',
                    maxWidth: '600px',
                    maxHeight: '600px'
                }}
                className="shadow-2xl rounded-lg bg-white cursor-pointer"
            />

            {/* CONTROLS */}
            <div className="absolute bottom-8 z-20">
                {!showPlayerSelect && gameState.phase !== GAME_PHASES.WIN && (
                    <button
                        onClick={handleRollDice}
                        disabled={diceAnim.rolling || gameState.phase !== GAME_PHASES.ROLL || gameState.players[gameState.turn].isAI}
                        className={`
                            relative w-20 h-20 rounded-2xl flex items-center justify-center
                            shadow-xl transition-transform active:scale-95
                            ${gameState.phase === GAME_PHASES.ROLL && !gameState.players[gameState.turn].isAI
                                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 scale-110 animate-pulse ring-4 ring-yellow-200/50'
                                : 'bg-slate-700 opacity-80'}
                        `}
                    >
                        <DiceIcon
                            value={diceAnim.value}
                            className={`w-10 h-10 text-white ${diceAnim.rolling ? 'animate-spin' : ''}`}
                        />
                    </button>
                )}
            </div>

            {/* WINNER OVERLAY */}
            {gameState.phase === GAME_PHASES.WIN && (
                <div className="absolute inset-0 bg-black/80 z-40 flex flex-col items-center justify-center animate-in fade-in">
                    <h2 className="text-5xl font-bold text-yellow-400 mb-4">GAME OVER</h2>
                    <div className="text-2xl text-white mb-8">
                        Winner: {gameState.players[gameState.winners[0]]?.color}
                    </div>
                    <button
                        onClick={handleReset}
                        className="px-8 py-4 bg-green-600 hover:bg-green-500 rounded-full text-xl font-bold shadow-lg"
                    >
                        Play Again
                    </button>
                </div>
            )}
        </div>
    );
};

export default LudoGame;

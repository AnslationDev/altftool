"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useGameSounds } from "@/app/altfgame/_lib/sounds";
import { ChessEngine } from "./logic/ChessEngine";
import { getBestMove } from "./logic/AI";
import { COLORS, PIECES } from "./logic/Constants";
import { Piece } from "./components/ChessPieces";
import {
    RotateCcw, Maximize, Minimize, Trophy,
    Swords, Shield, History, BrainCircuit, User
} from "lucide-react";

// --- THEME CONSTANTS ---
const THEME = {
    board: {
        light: "bg-[#ebecd0]",
        dark: "bg-[#779556]", // Classic Green
        highlight: "bg-yellow-200/60",
        lastMove: "bg-yellow-100/40",
        check: "bg-red-500/40"
    },
    ui: {
        bg: "bg-slate-950",
        panel: "bg-slate-900/50 border-slate-800",
        text: "text-slate-200",
        accent: "text-emerald-400"
    }
};

const DIFFICULTY_SETTINGS = {
    EASY: { label: "NOVICE", depth: 2, color: "text-emerald-400", border: "border-emerald-500/50" },
    MEDIUM: { label: "MASTER", depth: 3, color: "text-amber-400", border: "border-amber-500/50" },
    HARD: { label: "GRANDMASTER", depth: 4, color: "text-rose-500", border: "border-rose-500/50" }
};

// --- HELPER COMPONENTS ---

const CapturedPieces = ({ pieces, color }) => {
    // Sort pieces by value: P=1, N/B=3, R=5, Q=9
    const values = { [PIECES.PAWN]: 1, [PIECES.KNIGHT]: 3, [PIECES.BISHOP]: 3, [PIECES.ROOK]: 5, [PIECES.QUEEN]: 9 };
    const sorted = [...pieces].sort((a, b) => values[a.type] - values[b.type]);

    return (
        <div className="flex flex-wrap gap-1 h-6 items-center">
            {sorted.map((p, i) => (
                <div key={i} className="w-4 h-4 md:w-5 md:h-5 opacity-80 hover:opacity-100 transition-opacity transform hover:scale-125">
                    <Piece type={p.type} color={color} />
                </div>
            ))}
        </div>
    );
};

const PlayerCard = ({ name, isCpu, difficulty, turn, color, captured, isActive, isWinner, isThinking }) => {
    return (
        <div className={`
            relative flex items-center justify-between p-3 md:p-4 rounded-xl border transition-all duration-300
            ${isActive ? 'bg-slate-800/80 border-slate-600 shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'bg-slate-900/40 border-slate-800/50'}
            ${isWinner ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : ''}
        `}>
            {/* Active Indicator */}
            {isActive && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-12 bg-emerald-500 rounded-r-full shadow-[0_0_10px_#10b981]" />
            )}

            <div className="flex items-center gap-3 md:gap-4">
                {/* Avatar */}
                <div className={`
                    w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center border
                    ${isCpu
                        ? (isActive ? 'bg-rose-950/30 border-rose-500/30 text-rose-400' : 'bg-slate-800 border-slate-700 text-slate-500')
                        : (isActive ? 'bg-blue-950/30 border-blue-500/30 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-500')
                    }
                `}>
                    {isCpu ? <BrainCircuit className={`w-6 h-6 ${isThinking ? 'animate-pulse' : ''}`} /> : <User className="w-6 h-6" />}
                </div>

                {/* Info */}
                <div className="flex flex-col">
                    <span className={`text-xs md:text-sm font-bold tracking-wider ${isActive ? 'text-white' : 'text-slate-500'}`}>
                        {name}
                    </span>
                    {isCpu && (
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono ${DIFFICULTY_SETTINGS[difficulty].color}`}>
                                {DIFFICULTY_SETTINGS[difficulty].label}
                            </span>
                            {isThinking && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 rounded text-[10px] font-bold text-emerald-400 border border-emerald-500/20 animate-in fade-in zoom-in">
                                    <BrainCircuit className="w-3 h-3 animate-spin" />
                                    <span>CALC...</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Captured Pieces */}
            <div className="flex flex-col items-end gap-1">
                <CapturedPieces pieces={captured} color={color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE} />
            </div>
        </div>
    );
};

export default function ChessGame({ isPreview = false }) {
    // Refs
    const containerRef = useRef(null);

    // Game State
    const [engine, setEngine] = useState(() => new ChessEngine());
    const [board, setBoard] = useState(engine.getBoard());
    const [turn, setTurn] = useState(engine.getTurn());
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [validMoves, setValidMoves] = useState([]);
    const [winner, setWinner] = useState(null);
    const [inCheck, setInCheck] = useState(false);
    const [aiThinking, setAiThinking] = useState(false);
    const [lastMove, setLastMove] = useState(null);
    const [history, setHistory] = useState([]);

    // UI State
    const [gameState, setGameState] = useState(isPreview ? "PREVIEW" : "START");
    useGameSounds({ started: gameState === "PLAYING", won: Boolean(winner), tick: board });
    const [difficulty, setDifficulty] = useState("MEDIUM");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [capturedWhite, setCapturedWhite] = useState([]); // Pieces captured BY White (Black pieces)
    const [capturedBlack, setCapturedBlack] = useState([]); // Pieces captured BY Black (White pieces)

    // Fullscreen Logic
    const toggleFullscreen = () => {
        const elem = containerRef.current;
        if (!document.fullscreenElement) {
            elem?.requestFullscreen().catch(err => console.log(err));
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handleChange);
        return () => document.removeEventListener("fullscreenchange", handleChange);
    }, []);

    // Refresh state
    const updateState = useCallback(() => {
        setBoard([...engine.getBoard()]);
        setTurn(engine.getTurn());
        setWinner(engine.getWinner());
        setInCheck(engine.isInCheck());

        // Update History & Captured
        const engHistory = engine.history;
        setHistory(engHistory);

        const last = engHistory.length > 0 ? engHistory[engHistory.length - 1] : null;
        if (last) {
            setLastMove({ from: last.from, to: last.to });
        } else {
            setLastMove(null);
        }

        // Calculate captured pieces
        const wCaps = engHistory.filter(m => m.captured && m.captured.color === COLORS.BLACK).map(m => m.captured);
        const bCaps = engHistory.filter(m => m.captured && m.captured.color === COLORS.WHITE).map(m => m.captured);
        setCapturedWhite(wCaps);
        setCapturedBlack(bCaps);

        if (engine.getWinner()) {
            setGameState("GAME_OVER");
        }
    }, [engine]);

    // AI Move
    useEffect(() => {
        if (gameState === "PLAYING" && turn === COLORS.BLACK && !winner) {
            setAiThinking(true);
            // Delay for realism
            const timer = setTimeout(() => {
                const depth = DIFFICULTY_SETTINGS[difficulty].depth;
                const bestMove = getBestMove(engine, depth);
                if (bestMove) {
                    engine.move(bestMove.from, bestMove.to);
                    updateState();
                }
                setAiThinking(false);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [turn, gameState, winner, difficulty, engine, updateState]);

    const startGame = () => {
        const newEngine = new ChessEngine();
        setEngine(newEngine);
        setBoard(newEngine.getBoard());
        setTurn(newEngine.getTurn());
        setWinner(null);
        setInCheck(false);
        setSelectedSquare(null);
        setValidMoves([]);
        setLastMove(null);
        setHistory([]);
        setCapturedWhite([]);
        setCapturedBlack([]);
        setAiThinking(false);
        setGameState("PLAYING");
    };

    const handleSquareClick = (r, c) => {
        if (gameState !== "PLAYING" || winner || aiThinking) return;
        if (turn === COLORS.BLACK) return; // Player is White

        const clickedPiece = board[r][c];
        const isSameColor = clickedPiece && clickedPiece.color === turn;

        if (isSameColor) {
            setSelectedSquare({ r, c });
            const moves = engine.getValidMoves({ r, c });
            setValidMoves(moves);
            return;
        }

        if (selectedSquare) {
            const isMoveValid = validMoves.some(m => m.r === r && m.c === c);
            if (isMoveValid) {
                const success = engine.move(selectedSquare, { r, c });
                if (success) {
                    setSelectedSquare(null);
                    setValidMoves([]);
                    updateState();
                }
            } else {
                // Clicked empty square or enemy piece (invalid move) -> Deselect
                setSelectedSquare(null);
                setValidMoves([]);
            }
        }
    };

    // Preview Mode
    useEffect(() => {
        if (isPreview) setGameState("PLAYING");
    }, [isPreview]);

    return (
        <div ref={containerRef} className={`relative w-full h-full ${THEME.ui.bg} rounded-xl overflow-hidden font-sans select-none border border-slate-800 shadow-2xl flex flex-col`}>

            {/* Background Texture */}
            <div
                className="absolute inset-0 opacity-5 mix-blend-overlay pointer-events-none"
                style={{
                    backgroundImage:
                        "url('https://grainy-gradients.vercel.app/noise.svg')",
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-950/90 pointer-events-none" />

            {/* --- HEADER --- */}
            <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <Swords className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-100 tracking-tight">CHESS<span className="text-emerald-500">.MASTER</span></h2>
                        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Grandmaster Engine</div>
                    </div>
                </div>

                {!isPreview && (
                    <div className="flex gap-2">
                         <button
                            onClick={startGame}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Restart Game"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                        </button>
                    </div>
                )}
            </div>

            {/* --- MAIN GAME AREA --- */}
            <div className="flex-1 relative z-10 flex flex-col lg:flex-row items-center justify-center p-4 lg:p-8 gap-6 lg:gap-12 overflow-y-auto">

                {/* LEFT PANEL (Desktop) / TOP (Mobile) - Opponent */}
                <div className="w-full lg:w-[300px] flex flex-col gap-4 order-1 lg:order-1">
                    <PlayerCard
                        name="AI OPPONENT"
                        isCpu={true}
                        difficulty={difficulty}
                        turn={turn}
                        color={COLORS.BLACK}
                        captured={capturedBlack}
                        isActive={gameState === "PLAYING" && turn === COLORS.BLACK}
                        isWinner={winner === COLORS.BLACK}
                        isThinking={aiThinking}
                    />

                    {/* Status Banner (Mobile Only) */}
                    <div className="lg:hidden text-center">
                         {inCheck && !winner && <span className="text-rose-500 font-bold animate-pulse tracking-widest">CHECK!</span>}
                    </div>
                </div>

                {/* CENTER - BOARD */}
                <div className="relative order-2 lg:order-2">
                    {/* Board Container with Glow */}
                    <div className={`relative rounded-lg p-1 shadow-2xl ${inCheck ? 'shadow-[0_0_50px_rgba(244,63,94,0.2)]' : 'shadow-[0_0_50px_rgba(0,0,0,0.5)]'}`}>
                        <div className="relative aspect-square w-[90vw] md:w-[60vh] max-h-[70vh] bg-slate-800 rounded-lg overflow-hidden border-4 border-slate-700 touch-none">

                            {/* THE GRID */}
                            <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                                {board.map((row, r) => (
                                    row.map((piece, c) => {
                                        const isDark = (r + c) % 2 === 1;
                                        const isValid = validMoves.some(m => m.r === r && m.c === c);
                                        const isCapture = isValid && piece;
                                        const isSelected = selectedSquare?.r === r && selectedSquare?.c === c;
                                        const isLastMove = lastMove && ((lastMove.from.r === r && lastMove.from.c === c) || (lastMove.to.r === r && lastMove.to.c === c));
                                        const isKingInCheck = inCheck && piece?.type === PIECES.KING && piece?.color === turn;

                                        return (
                                            <div
                                                key={`${r}-${c}`}
                                                onClick={() => handleSquareClick(r, c)}
                                                className={`
                                                    relative flex items-center justify-center cursor-pointer
                                                    ${isDark ? THEME.board.dark : THEME.board.light}
                                                    ${isSelected ? THEME.board.highlight : ''}
                                                    ${!isSelected && isLastMove ? THEME.board.lastMove : ''}
                                                    transition-colors duration-200
                                                `}
                                            >
                                                {/* Coordinates */}
                                                {c === 0 && <span className={`absolute left-0.5 top-0 text-[0.5em] md:text-[0.65em] font-bold opacity-50 ${isDark ? 'text-white/70' : 'text-slate-800/70'}`}>{8 - r}</span>}
                                                {r === 7 && <span className={`absolute right-1 bottom-0 text-[0.5em] md:text-[0.65em] font-bold opacity-50 ${isDark ? 'text-white/70' : 'text-slate-800/70'}`}>{String.fromCharCode(97 + c)}</span>}

                                                {/* Check Highlight */}
                                                {isKingInCheck && <div className={`absolute inset-0 ${THEME.board.check} animate-pulse`} />}

                                                {/* Valid Move Markers */}
                                                {isValid && !isCapture && (
                                                    <div className="absolute w-3 h-3 bg-black/10 rounded-full" />
                                                )}
                                                {isCapture && (
                                                    <div className="absolute inset-0 border-[4px] border-black/10 rounded-full" />
                                                )}

                                                {/* The Piece */}
                                                <div className={`w-[85%] h-[85%] z-10 transition-transform duration-300 ${isSelected ? 'scale-110 -translate-y-1 drop-shadow-xl' : ''}`}>
                                                    <Piece type={piece?.type} color={piece?.color} />
                                                </div>
                                            </div>
                                        );
                                    })
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL (Desktop) / BOTTOM (Mobile) - Player */}
                <div className="w-full lg:w-[300px] flex flex-col gap-4 order-3 lg:order-3">
                    <PlayerCard
                        name="YOU"
                        isCpu={false}
                        difficulty={difficulty}
                        turn={turn}
                        color={COLORS.WHITE}
                        captured={capturedWhite}
                        isActive={gameState === "PLAYING" && turn === COLORS.WHITE}
                        isWinner={winner === COLORS.WHITE}
                    />

                    {/* Desktop Status / History Placeholder */}
                    <div className="hidden lg:block bg-slate-900/30 rounded-xl border border-slate-800/50 p-4 h-[200px] overflow-hidden relative">
                         <div className="flex items-center gap-2 text-slate-500 mb-2">
                             <History className="w-4 h-4" />
                             <span className="text-xs font-bold uppercase tracking-wider">Battle Log</span>
                         </div>
                         <div className="space-y-1 text-xs font-mono text-slate-400 h-full overflow-y-auto pb-6">
                             {history.map((move, i) => (
                                 <div key={i} className="flex justify-between border-b border-slate-800/50 pb-1 mb-1 last:border-0">
                                     <span className="text-slate-600">#{Math.ceil((i+1)/2)}</span>
                                     <span className={i % 2 === 0 ? 'text-white' : 'text-slate-400'}>
                                         {String.fromCharCode(97 + move.from.c)}{8 - move.from.r} → {String.fromCharCode(97 + move.to.c)}{8 - move.to.r}
                                     </span>
                                 </div>
                             ))}
                             {history.length === 0 && <span className="opacity-30 italic">Game initialized...</span>}
                         </div>
                    </div>
                </div>

            </div>

            {/* --- OVERLAYS --- */}

            {/* START SCREEN */}
            {gameState === "START" && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-300">

                    <h2 className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tighter drop-shadow-2xl">
                        CHESS
                    </h2>
                    <p className="text-slate-300 mb-8 text-lg font-medium drop-shadow-md">
                        Master the board. Defeat the AI.
                    </p>

                    {/* Difficulty Selection */}
                    <div className="flex flex-wrap justify-center gap-3 mb-8">
                        {Object.entries(DIFFICULTY_SETTINGS).map(([key, setting]) => (
                            <button
                                key={key}
                                onClick={() => setDifficulty(key)}
                                className={`
                                    px-4 py-2 rounded-xl font-bold text-sm transition-all border-2 backdrop-blur-md
                                    ${difficulty === key
                                        ? `${setting.border} bg-white/10 text-white shadow-lg scale-105`
                                        : 'border-slate-700/50 bg-black/20 text-slate-400 hover:bg-black/40 hover:border-slate-500'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${difficulty === key ? setting.color.replace('text-', 'bg-') : 'bg-slate-600'}`} />
                                    {setting.label}
                                </div>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={startGame}
                        className="group relative px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                    >
                        <Swords className="w-6 h-6 fill-current" />
                        START BATTLE
                    </button>
                </div>
            )}

            {/* GAME OVER SCREEN */}
            {gameState === "GAME_OVER" && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in zoom-in-95 duration-300 text-center">

                    <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center border-4 shadow-2xl ${winner === COLORS.WHITE ? 'border-emerald-500 bg-emerald-500/10 shadow-emerald-500/20' : (winner === 'draw' ? 'border-slate-500 bg-slate-500/10' : 'border-rose-500 bg-rose-500/10 shadow-rose-500/20')}`}>
                        <Trophy className={`w-12 h-12 ${winner === COLORS.WHITE ? 'text-emerald-500' : (winner === 'draw' ? 'text-slate-500' : 'text-rose-500')}`} />
                    </div>

                    <h2 className="text-5xl font-black text-white mb-2 tracking-tight drop-shadow-xl">
                        {winner === COLORS.WHITE ? "VICTORY!" : (winner === 'draw' ? "STALEMATE" : "DEFEAT")}
                    </h2>
                    <p className="text-slate-300 mb-8 text-lg font-medium max-w-xs mx-auto">
                        {winner === COLORS.WHITE ? "Excellent strategy, Grandmaster." : (winner === 'draw' ? "A well-fought draw." : "The AI outsmarted you this time.")}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
                            <button
                            onClick={startGame}
                            className="flex-1 py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-200 hover:scale-105 active:scale-95 transition-all shadow-xl"
                        >
                            REMATCH
                        </button>
                        <button
                            onClick={() => setGameState("START")}
                            className="flex-1 py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all border border-slate-700"
                        >
                            MENU
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Simple Play Icon for the start button
function PlayIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24">
            <path d="M5 3l14 9-14 9V3z" />
        </svg>
    )
}

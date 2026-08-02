"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { GameEngine } from "./logic/GameEngine";
import { Maximize, Minimize } from "lucide-react";
import { useGameSounds } from "@/app/altfgame/_lib/sounds";

export default function BubbleShooterGame({ isPreview = false }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const engineRef = useRef(null);

    // States
    const [gameState, setGameState] = useState(isPreview ? "PREVIEW" : "START"); // START, PLAYING, WIN, GAME_OVER
    const [score, setScore] = useState(0);
    useGameSounds({ started: gameState === "PLAYING", won: gameState === "WIN", lost: gameState === "GAME_OVER", score, sounds: { point: "pop" } });
    const [highScore, setHighScore] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Load High Score
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("bubble_shooter_highscore");
            // eslint-disable-next-line
            if (saved) setHighScore(parseInt(saved, 10));
        }
    }, []);

    // Fullscreen Logic
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

    useEffect(() => {
        const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handleChange);
        return () => document.removeEventListener("fullscreenchange", handleChange);
    }, []);

    const handleGameEnd = useCallback((finalScore, isWin) => {
        setScore(finalScore);
        setGameState(isWin ? "WIN" : "GAME_OVER");

        setHighScore(prev => {
            if (finalScore > prev) {
                localStorage.setItem("bubble_shooter_highscore", finalScore);
                return finalScore;
            }
            return prev;
        });
    }, []);

    const startGame = () => {
        // Mobile Fullscreen Auto-Trigger removed
        /*
        const isMobile = typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);
        if (isMobile && !document.fullscreenElement && containerRef.current) {
            containerRef.current.requestFullscreen().catch(err => console.log("Fullscreen request failed:", err));
        }
        */

        if (!canvasRef.current) return;

        // Clean up existing
        if (engineRef.current) {
            engineRef.current.stop();
            engineRef.current = null;
        }

        const engine = new GameEngine(
            canvasRef.current,
            handleGameEnd,
            setScore
        );

        engineRef.current = engine;
        engine.start();
        setScore(0);
        setGameState("PLAYING");
    };

    // Auto-start for preview? Or just let it sit?
    // Snake and Chess have previews. Let's just create the engine in background for visual if preview.
    useEffect(() => {
        if (isPreview && canvasRef.current) {
            const engine = new GameEngine(
                canvasRef.current,
                () => { }, // No-op for end
                () => { }  // No-op for score
            );
            engineRef.current = engine;
            engine.start();
            setGameState("PLAYING"); // Show game immediately
            return () => {
                engine.stop();
            };
        }
    }, [isPreview]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (engineRef.current) {
                engineRef.current.stop();
                engineRef.current = null;
            }
        };
    }, []);


    return (
        <div ref={containerRef} className="relative w-full h-full bg-zinc-950 rounded-xl overflow-hidden font-mono select-none border-4 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.3)] group/container">

            {/* Background / Ambient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950 pointer-events-none" />

            {/* CANVAS */}
            {/* Centered and contained */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="relative aspect-[3/4] h-full w-auto max-w-full bg-zinc-900/50 rounded-lg overflow-hidden border-2 border-indigo-500/30 shadow-2xl">
                    <canvas
                        ref={canvasRef}
                        // Use style width/height for CSS scaling, keep internal resolution high
                        width={600}
                        height={800}
                        className="block w-full h-full touch-none object-contain bg-transparent cursor-crosshair"
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
            </div>

            {/* UI OVERLAYS */}
            <div className="absolute inset-0 pointer-events-none">

                {/* Fullscreen Toggle */}
                {!isPreview && (
                    <button
                        onClick={toggleFullscreen}
                        className="absolute top-4 right-4 z-50 p-2 bg-zinc-900/50 hover:bg-zinc-800 text-indigo-400 rounded-lg border border-indigo-500/30 transition-all pointer-events-auto opacity-0 group-hover/container:opacity-100"
                    >
                        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </button>
                )}

                {/* HUD (Score) */}
                {gameState === "PLAYING" && (
                    <div className="absolute top-6 left-6 animate-in slide-in-from-top-10 fade-in duration-500">
                        <div className="flex flex-col">
                            <span className="text-indigo-400/70 text-xs font-bold tracking-[0.3em] mb-1">SCORE</span>
                            <span className="text-4xl md:text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                                {score}
                            </span>
                        </div>
                    </div>
                )}

                {/* HUD (High Score) */}
                {gameState === "PLAYING" && highScore > 0 && (
                    <div className="absolute top-6 right-16 text-right animate-in slide-in-from-top-10 fade-in duration-500 delay-100">
                        <span className="text-zinc-500/70 text-xs font-bold tracking-[0.3em] mb-1">BEST</span>
                        <div className="text-xl md:text-2xl font-bold text-zinc-400 opacity-80">{highScore}</div>
                    </div>
                )}

                {/* START SCREEN */}
                {gameState === "START" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md z-40 pointer-events-auto">
                        <div className="text-center animate-in zoom-in duration-300">
                            <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 mb-4 tracking-tighter drop-shadow-[0_0_25px_rgba(99,102,241,0.5)]">
                                BUBBLE<br /><span className="text-white">SHOOTER</span>
                            </h2>

                            <div className="flex gap-4 items-center justify-center mb-8">
                                <div className="px-4 py-2 border border-indigo-500/30 rounded bg-indigo-500/5 text-indigo-400 text-xs tracking-widest font-bold">
                                    V 2.0
                                </div>
                                <div className="px-4 py-2 border border-cyan-500/30 rounded bg-cyan-500/5 text-cyan-400 text-xs tracking-widest font-bold">
                                    SYSTEM READY
                                </div>
                            </div>

                            <button onClick={startGame} className="group relative px-12 py-5 bg-transparent border-2 border-indigo-500 hover:bg-indigo-500 hover:text-white text-indigo-500 text-xl font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.6)]">
                                INITIALIZE
                            </button>
                        </div>
                    </div>
                )}

                {/* GAME OVER / WIN SCREEN */}
                {(gameState === "GAME_OVER" || gameState === "WIN") && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md z-50 pointer-events-auto">
                        <h2 className={`text-4xl md:text-6xl font-black tracking-widest mb-2 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] animate-in slide-in-from-bottom-5 ${gameState === "WIN" ? 'text-green-500' : 'text-red-500'}`}>
                            {gameState === "WIN" ? 'MISSION COMPLETE' : 'SYSTEM FAILURE'}
                        </h2>

                        <div className={`mt-4 mb-10 px-6 py-2 rounded border ${gameState === "WIN" ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-red-500 text-red-500 bg-red-500/10'} text-xs md:text-sm tracking-[0.3em] font-bold`}>
                            {gameState === "WIN" ? 'ALL TARGETS ELIMINATED' : 'CRITICAL ERROR'}
                        </div>

                        <div className="flex flex-col items-center mb-10">
                            <span className="text-zinc-500 text-xs tracking-[0.4em] mb-2">FINAL SCORE</span>
                            <span className="text-5xl md:text-6xl text-white font-black">{score}</span>
                        </div>

                        <button onClick={startGame} className="px-10 py-4 bg-transparent border border-zinc-500 text-zinc-300 hover:border-white hover:text-white hover:bg-white/10 font-bold tracking-widest transition-all uppercase text-sm">
                            RETRY MISSION
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

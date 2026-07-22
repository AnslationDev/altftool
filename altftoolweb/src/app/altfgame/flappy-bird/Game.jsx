"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Play, RotateCcw } from "lucide-react";

// Game Constants
const GRAVITY = 0.4;
const JUMP_STRENGTH = -7;
const PIPE_SPEED = 3.5;
const PIPE_SPAWN_RATE = 160; // Increased from 110 for wider horizontal spacing
const PIPE_GAP = 180; // Increased from 160 for easier gameplay
const PIPE_WIDTH = 65;
const BIRD_SIZE = 34;

/**
 * Flappy Bird Game Component (Enhanced)
 *
 * Features:
 * - Physics-based gravity and impulse
 * - Procedural pipe generation
 * - Pixel-perfect collision detection
 * - Audio synthesis
 * - Visual "Juice": Screen shake, particles, flash, parallax
 */
const FlappyBirdGame = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // UI State
    const [gameState, setGameState] = useState("START"); // START, PLAYING, GAME_OVER
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    // Removed flashOpacity state in favor of ref for performance

    // Audio Context Ref
    const audioContextRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);

    // Game State Ref (Mutable for loop)
    const stateRef = useRef({
        bird: {
            x: 50,
            y: 300,
            velocity: 0,
            rotation: 0,
            frame: 0 // For animation
        },
        pipes: [],
        clouds: [],
        particles: [], // For explosions/puffs
        shake: 0, // Screen shake magnitude
        flash: 0, // Flash opacity
        backgroundOffset: 0,
        groundOffset: 0,
        frames: 0,
        score: 0,
        isGameOver: false
    });

    // Initialize Audio
    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        return () => {
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, []);

    // Load High Score on Mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem("flappy-bird-highscore");
            if (saved) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setHighScore(parseInt(saved, 10));
            }
        }
    }, []);

    // Sound Helper
    const playSound = useCallback((type) => {
        if (isMuted || !audioContextRef.current) return;

        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === "jump") {
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } else if (type === "score") {
            osc.type = "sine";
            osc.frequency.setValueAtTime(1200, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.cancelScheduledValues(ctx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } else if (type === "crash") {
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        }
    }, [isMuted]);

    // Helper: Reset Game State
    const resetGame = useCallback(() => {
        const height = canvasRef.current ? canvasRef.current.height : 600;
        const width = canvasRef.current ? canvasRef.current.width : 800;

        // Initialize Clouds
        const clouds = [];
        for (let i = 0; i < 5; i++) {
            clouds.push({
                x: Math.random() * width,
                y: Math.random() * (height / 2),
                size: 20 + Math.random() * 40,
                speed: 0.2 + Math.random() * 0.5
            });
        }

        stateRef.current = {
            bird: {
                x: width * 0.2,
                y: height / 2,
                velocity: 0,
                rotation: 0,
                frame: 0
            },
            pipes: [],
            clouds,
            particles: [],
            shake: 0,
            flash: 0,
            backgroundOffset: 0,
            groundOffset: 0,
            frames: 0,
            score: 0,
            isGameOver: false
        };
        setScore(0);
        setGameState("START");
    }, []);

    // Helper: Start Game
    const startGame = useCallback(() => {
        // Mobile Fullscreen Auto-Trigger removed
        /*
        const isMobile = typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);
        if (isMobile && !document.fullscreenElement && containerRef.current) {
            containerRef.current.requestFullscreen().catch(err => console.log("Fullscreen request failed:", err));
        }
        */

        if (gameState === "PLAYING") return; // Prevent starting if already playing

        // Reset Logic (integrated from resetGame for a clean start)
        const height = canvasRef.current ? canvasRef.current.height : 600;
        const width = canvasRef.current ? canvasRef.current.width : 800;

        const clouds = [];
        for (let i = 0; i < 5; i++) {
            clouds.push({
                x: Math.random() * width,
                y: Math.random() * (height / 2),
                size: 20 + Math.random() * 40,
                speed: 0.2 + Math.random() * 0.5
            });
        }

        stateRef.current = {
            bird: { x: width * 0.2, y: height / 2, velocity: 0, rotation: 0, frame: 0 },
            pipes: [],
            clouds,
            particles: [],
            shake: 0,
            flash: 0,
            backgroundOffset: 0,
            groundOffset: 0,
            frames: 0,
            score: 0,
            isGameOver: false
        };
        setScore(0);
        setGameState("PLAYING");
        playSound("jump");
        stateRef.current.bird.velocity = JUMP_STRENGTH;
    }, [gameState, playSound]);

    // Helper: Jump
    const actionJump = useCallback(() => {
        if (gameState !== "PLAYING") return;
        stateRef.current.bird.velocity = JUMP_STRENGTH;
        playSound("jump");

        // Add puff particles
        const bird = stateRef.current.bird;
        for (let i = 0; i < 5; i++) {
            stateRef.current.particles.push({
                x: bird.x - 10,
                y: bird.y + 10,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 2,
                life: 20,
                maxLife: 20,
                color: "#fff",
                size: Math.random() * 3 + 2
            });
        }
    }, [gameState, playSound]);

    // Helper: Create Explosion/Confetti
    const createExplosion = useCallback((x, y, color) => {
        for (let i = 0; i < 20; i++) {
            stateRef.current.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 40 + Math.random() * 20,
                maxLife: 60,
                color: color || `hsl(${Math.random() * 360}, 100%, 50%)`,
                size: Math.random() * 5 + 3,
                gravity: 0.2
            });
        }
    }, []);

    // Input Handling
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === "Space" || e.code === "ArrowUp") {
                if (gameState === "START" || gameState === "GAME_OVER") {
                    startGame();
                } else {
                    actionJump();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [gameState, startGame, actionJump]);


    // Game Loop
    useEffect(() => {
        // We run loop for "START" too to animate clouds/bird hovering? Optional.
        // For now, let's keep it simple and run only when PLAYING/GAME_OVER (for falling physics)
        if (gameState === "START") {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            // Just render static start screen background?
            // Lets actually run loop in START to show moving clouds/ground!
        }

        // Re-enable loop for all states to allow cohesive animation
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationFrameId;

        const resizeCanvas = () => {
            if (containerRef.current && canvas) {
                canvas.width = containerRef.current.clientWidth;
                canvas.height = containerRef.current.clientHeight;
                // If init, setup birdY
                if (gameState === "START" && stateRef.current.bird.y === 300) {
                    stateRef.current.bird.y = canvas.height / 2;
                }
            }
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        const render = () => {
            const { width, height } = canvas;
            const state = stateRef.current;

            // 1. UPDATE
            // Always update clouds
            state.clouds.forEach(c => {
                c.x -= c.speed;
                if (c.x + c.size < 0) c.x = width + c.size;
            });

            if (gameState === "PLAYING" || (gameState === "GAME_OVER" && !state.isGameOver)) {
                // Determine actual logic state vs UI state
                // If we died, we want physics to continue until ground hit
            }

            // Allow physics update if playing OR falling after death
            const physicsActive = gameState === "PLAYING" || (gameState === "GAME_OVER" && state.bird.y < height - BIRD_SIZE / 2 - 20);

            if (physicsActive) {
                state.frames++;
                // Physics
                state.bird.velocity += GRAVITY;
                state.bird.y += state.bird.velocity;
                state.bird.rotation = Math.min(Math.PI / 3, Math.max(-Math.PI / 3, (state.bird.velocity * 0.1)));
                state.bird.frame += 0.2; // Wing flap speed

                // Ground Scroll
                if (gameState === "PLAYING") {
                    state.groundOffset = (state.groundOffset + PIPE_SPEED) % 20; // 20 is stripe width
                }

                // Ceiling
                if (state.bird.y < 0) {
                    state.bird.y = 0;
                    state.bird.velocity = 0;
                }

                // Ground Collision
                if (state.bird.y + BIRD_SIZE / 2 >= height - 40) { // 40 is ground height
                    state.bird.y = height - 40 - BIRD_SIZE / 2;
                    if (gameState === "PLAYING") {
                        triggerGameOver();
                    }
                }

                // Pipes
                if (gameState === "PLAYING") {
                    // Spawn
                    if (state.frames % PIPE_SPAWN_RATE === 0) {
                        const minH = 80;
                        const maxH = height - 40 - PIPE_GAP - minH;
                        const h = Math.floor(Math.random() * (maxH - minH + 1) + minH);
                        state.pipes.push({
                            x: width,
                            topHeight: h,
                            bottomY: h + PIPE_GAP,
                            passed: false
                        });
                    }

                    // Move
                    for (let i = state.pipes.length - 1; i >= 0; i--) {
                        const p = state.pipes[i];
                        p.x -= PIPE_SPEED;

                        // Remove
                        if (p.x + PIPE_WIDTH < 0) {
                            state.pipes.splice(i, 1);
                            continue;
                        }

                        // Collision
                        const bx = state.bird.x - BIRD_SIZE / 2 + 8;
                        const by = state.bird.y - BIRD_SIZE / 2 + 8;
                        const bw = BIRD_SIZE - 16;
                        const bh = BIRD_SIZE - 16;

                        if (
                            bx < p.x + PIPE_WIDTH &&
                            bx + bw > p.x &&
                            (by < p.topHeight || by + bh > p.bottomY)
                        ) {
                            triggerGameOver();
                        }

                        // Score
                        if (!p.passed && state.bird.x > p.x + PIPE_WIDTH) {
                            p.passed = true;
                            state.score += 1;
                            setScore(state.score);
                            playSound("score");
                            state.flash = 0.6; // Flash effect
                            // Score particles
                            createExplosion(state.bird.x, state.bird.y - 30, "#ffd700");
                        }
                    }
                }
            } else if (gameState === "START") {
                // Hover effect
                state.frames++;
                state.bird.y = (height / 2) + Math.sin(state.frames * 0.05) * 10;
                state.backgroundOffset = (state.backgroundOffset + 0.5) % width;
                state.groundOffset = (state.groundOffset + PIPE_SPEED) % 20;
                // Continually spawn clouds if needed, or wrap them
            }

            // Particles Update
            for (let i = state.particles.length - 1; i >= 0; i--) {
                const p = state.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life--;
                if (p.gravity) p.vy += p.gravity;
                if (p.life <= 0) state.particles.splice(i, 1);
            }

            // Shake Decay
            if (state.shake > 0) state.shake *= 0.9;
            if (state.shake < 0.5) state.shake = 0;


            // 2. RENDER
            // Apply Shake
            ctx.save();
            if (state.shake > 0) {
                const dx = (Math.random() - 0.5) * state.shake;
                const dy = (Math.random() - 0.5) * state.shake;
                ctx.translate(dx, dy);
            }

            // Background (Gradient Sky)
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, "#4ec0ca"); // Day sky
            gradient.addColorStop(1, "#87ceeb");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Clouds
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            state.clouds.forEach(c => {
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
                ctx.arc(c.x + c.size * 0.5, c.y - c.size * 0.2, c.size * 0.8, 0, Math.PI * 2);
                ctx.arc(c.x - c.size * 0.5, c.y - c.size * 0.2, c.size * 0.8, 0, Math.PI * 2);
                ctx.fill();
            });

            // Cityscape / Hills (Bottom Layer)
            ctx.fillStyle = "#a3e4bf"; // Light green hills
            ctx.beginPath();
            ctx.moveTo(0, height - 40);
            for (let i = 0; i <= width; i += 50) {
                ctx.lineTo(i, height - 40 - Math.sin(i * 0.01 + state.backgroundOffset * 0.002) * 50);
            }
            ctx.lineTo(width, height - 40);
            ctx.lineTo(0, height - 40);
            ctx.fill();


            // Pipes
            state.pipes.forEach(p => {
                // Gradient for pipes
                const pipeGrad = ctx.createLinearGradient(p.x, 0, p.x + PIPE_WIDTH, 0);
                pipeGrad.addColorStop(0, "#55a049");
                pipeGrad.addColorStop(0.5, "#88e060"); // Highlight
                pipeGrad.addColorStop(1, "#55a049");

                ctx.fillStyle = pipeGrad;
                ctx.strokeStyle = "#2d5e25";
                ctx.lineWidth = 3;

                // Top
                ctx.fillRect(p.x, 0, PIPE_WIDTH, p.topHeight);
                ctx.strokeRect(p.x, -3, PIPE_WIDTH, p.topHeight + 3);
                // Top Cap
                ctx.fillRect(p.x - 4, p.topHeight - 24, PIPE_WIDTH + 8, 24);
                ctx.strokeRect(p.x - 4, p.topHeight - 24, PIPE_WIDTH + 8, 24);

                // Bottom
                ctx.fillRect(p.x, p.bottomY, PIPE_WIDTH, height - p.bottomY);
                ctx.strokeRect(p.x, p.bottomY, PIPE_WIDTH, height - p.bottomY);
                // Bottom Cap
                ctx.fillRect(p.x - 4, p.bottomY, PIPE_WIDTH + 8, 24);
                ctx.strokeRect(p.x - 4, p.bottomY, PIPE_WIDTH + 8, 24);
            });


            // Ground
            ctx.fillStyle = "#ded895";
            ctx.fillRect(0, height - 40, width, 40);

            // Moving Strips logic for ground
            ctx.fillStyle = "#cec075";
            ctx.beginPath();
            // Draw diagonal stripes
            for (let i = -20; i < width + 20; i += 20) {
                const x = i - state.groundOffset;
                ctx.moveTo(x, height - 40);
                ctx.lineTo(x + 10, height - 40);
                ctx.lineTo(x, height);
                ctx.lineTo(x - 10, height);
                ctx.fill();
            }

            ctx.strokeStyle = "#543615";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, height - 40);
            ctx.lineTo(width, height - 40);
            ctx.stroke();


            // Particles
            state.particles.forEach(p => {
                ctx.globalAlpha = p.life / p.maxLife;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1.0;


            // Bird
            ctx.save();
            ctx.translate(state.bird.x, state.bird.y);
            ctx.rotate(state.bird.rotation);

            // Bird Animation State
            const wingY = Math.sin(state.bird.frame) * 4;

            // Body
            ctx.fillStyle = "#f4d03f";
            ctx.beginPath();
            ctx.arc(0, 0, BIRD_SIZE / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Wing (Animated)
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.ellipse(-2, 2 + wingY * 0.5, 8, 5, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Eye (High contrast)
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(6, -6, 8, 0, Math.PI * 2); // Bigger eye
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#000";
            ctx.beginPath();
            ctx.arc(8, -6, 3, 0, Math.PI * 2);
            ctx.fill();

            // Beak
            ctx.fillStyle = "#f45821";
            ctx.beginPath();
            ctx.moveTo(8, 2);
            ctx.lineTo(18, 6);
            ctx.lineTo(8, 12);
            ctx.fill();
            ctx.stroke();

            ctx.restore();

            ctx.restore(); // Undo Shake

            // Flash effect
            if (state.flash > 0) {
                ctx.fillStyle = `rgba(255, 255, 255, ${state.flash})`;
                ctx.fillRect(0, 0, width, height);
                state.flash = Math.max(0, state.flash - 0.05);
            }

            animationFrameId = requestAnimationFrame(render);
        };

        const triggerGameOver = () => {
            if (stateRef.current.isGameOver) return; // Prevent double trigger

            stateRef.current.isGameOver = true;
            stateRef.current.shake = 20; // Massive shake
            setGameState("GAME_OVER");
            playSound("crash");

            // Explosion on bird
            createExplosion(stateRef.current.bird.x, stateRef.current.bird.y, "#f4d03f");
            createExplosion(stateRef.current.bird.x, stateRef.current.bird.y, "#fff");

            // High Score
            if (stateRef.current.score > highScore) {
                setHighScore(stateRef.current.score);
                if (typeof window !== 'undefined') {
                    localStorage.setItem("flappy-bird-highscore", stateRef.current.score.toString());
                }
            }
        };

        render();
        return () => {
            window.removeEventListener("resize", resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [gameState, highScore, playSound, createExplosion]);


    return (
        <div
            ref={containerRef}
            className="relative w-full h-full overflow-hidden select-none touch-none font-sans"
            onClick={actionJump}
        >
            <canvas ref={canvasRef} className="block w-full h-full bg-[#70c5ce]" />

            {/* Controls */}
            <button
                onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                className="absolute top-4 right-4 z-40 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all active:scale-95"
            >
                {isMuted ? "🔇" : "🔊"}
            </button>

            {/* Score HUD */}
            <div className="absolute top-24 left-0 right-0 flex justify-center pointer-events-none z-30">
                <span className="text-white text-5xl md:text-7xl font-black drop-shadow-[0_4px_0_rgba(0,0,0,0.2)] stroke-black tracking-wider number-font"
                    style={{
                        WebkitTextStroke: "2px black",
                        fontFamily: "Impact, sans-serif"
                    }}>
                    {score}
                </span>
            </div>

            {/* Start Screen */}
            {gameState === "START" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-40 pointer-events-none">
                    <div className="animate-bounce mb-8">
                        {/* Placeholder/Force layout */}
                        {/* We could render a bird graphic here or just text */}
                    </div>

                    <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex flex-col items-center text-center animate-in zoom-in duration-500 pointer-events-auto border-4 border-white">
                        <h1 className="text-5xl font-black text-[#55a049] mb-4 tracking-tight drop-shadow-sm" style={{ WebkitTextStroke: "1px white" }}>
                            FLAPPY BIRD
                        </h1>
                        <p className="text-gray-500 mb-8 font-bold text-lg">Tap, Click, or Space to Flap!</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); startGame(); }}
                            className="bg-[#55a049] hover:bg-[#4a8f40] text-white text-2xl font-black py-4 px-10 rounded-full shadow-[0_6px_0_#2d5e25] active:shadow-[0_2px_0_#2d5e25] active:translate-y-1 transition-all flex items-center gap-3 uppercase tracking-wider"
                        >
                            <Play fill="currentColor" size={24} /> Get Ready
                        </button>
                    </div>
                </div>
            )}

            {/* Game Over Screen */}
            {gameState === "GAME_OVER" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/40 backdrop-blur-[2px]">
                    <div className="bg-[#e4dc86] border-4 border-[#e67e22] p-6 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center max-w-sm w-[90%] animate-in slide-in-from-bottom-20 duration-500 relative">
                        <div className="absolute -top-12">
                            <h2 className="text-6xl font-black text-[#e67e22] drop-shadow-[0_4px_0_#fff] tracking-wide" style={{ WebkitTextStroke: "2px white" }}>
                                GAME OVER
                            </h2>
                        </div>

                        <div className="flex gap-4 w-full mt-8 mb-8">
                            <div className="flex-1 bg-[#d6cf7c] p-4 rounded-lg border-2 border-[#b8b05e] flex flex-col items-center justify-center shadow-inner">
                                <span className="text-[#e67e22] font-black text-xs uppercase tracking-widest mb-1">Score</span>
                                <span className="text-white text-4xl font-black drop-shadow-md">{score}</span>
                            </div>
                            <div className="flex-1 bg-[#d6cf7c] p-4 rounded-lg border-2 border-[#b8b05e] flex flex-col items-center justify-center relative shadow-inner">
                                {score >= highScore && score > 0 && (
                                    <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-bounce shadow-sm">
                                        NEW BEST!
                                    </div>
                                )}
                                <span className="text-[#e67e22] font-black text-xs uppercase tracking-widest mb-1">Best</span>
                                <span className="text-white text-4xl font-black drop-shadow-md">{highScore}</span>
                            </div>
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); startGame(); }}
                            className="bg-cyan-500 hover:bg-cyan-400 text-white text-xl font-bold py-4 px-8 rounded-full shadow-[0_5px_0_#0e7490] active:shadow-none active:translate-y-1 transition-all flex items-center gap-2 uppercase w-full justify-center"
                        >
                            <RotateCcw size={24} strokeWidth={3} /> Play Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlappyBirdGame;

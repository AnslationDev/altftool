"use client";

/* eslint-disable react-hooks/preserve-manual-memoization */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameSounds } from "@/app/altfgame/_lib/sounds";
import { Play, RotateCcw, Trophy, Activity, Target, Zap, Shield, Crown } from 'lucide-react';
import {
    BATSMAN_STANCE_SVG, BATSMAN_SHOT_SVG,
    BOWLER_RUNUP_SVG, BOWLER_DELIVERY_SVG,
    getSvgDataUri
} from './logic/CricketAssets';

const CricketGame = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // GAME STATE
    const [status, setStatus] = useState('menu'); // menu, playing, game_over
    const [difficulty, setDifficulty] = useState('easy'); // easy, medium, hard

    // SCOREBOARD
    const [score, setScore] = useState(0);
    const [wickets, setWickets] = useState(0);
    const [balls, setBalls] = useState(0);

    const [target, setTarget] = useState(0);

    // FEEDBACK STATE
    const [feedback, setFeedback] = useState(null);
    const [winner, setWinner] = useState(null); // 'user' or 'cpu'
    useGameSounds({ started: status === 'playing', won: winner === 'user', lost: winner === 'cpu', score, sounds: { point: 'bat' } });

    // ASSETS REF
    const spritesRef = useRef({
        batsmanStance: null,
        batsmanShot: null,
        bowlerRunup: null,
        bowlerDelivery: null,
        loaded: false
    });

    // LOAD ASSETS
    useEffect(() => {
        const loadImg = (uri) => {
            const img = new Image();
            img.src = uri;
            return img;
        };

        spritesRef.current.batsmanStance = loadImg(getSvgDataUri(BATSMAN_STANCE_SVG));
        spritesRef.current.batsmanShot = loadImg(getSvgDataUri(BATSMAN_SHOT_SVG));
        spritesRef.current.bowlerRunup = loadImg(getSvgDataUri(BOWLER_RUNUP_SVG));
        spritesRef.current.bowlerDelivery = loadImg(getSvgDataUri(BOWLER_DELIVERY_SVG));
        spritesRef.current.loaded = true;
    }, []);

    // Refs for heavy loop data
    const stateRef = useRef({
        ball: null,
        bowler: { phase: 'idle', timer: 0, x: 0, z: 100 },
        batsman: { state: 'stance', frame: 0 },
        particles: [],
        cameraShake: 0
    });
    const rafRef = useRef(null);

    // CONSTANTS
    const MAX_WICKETS = 10;
    const MAX_OVERS = 5;
    const MAX_BALLS = MAX_OVERS * 6;

    const HORIZON_Y = 250;
    const GROUND_Y = 600;

    // --- LOGIC: RESET ---
    const startMatch = (selectedDifficulty) => {
        // Mobile Fullscreen Auto-Trigger removed
        /*
        const isMobile = typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);
        if (isMobile && !document.fullscreenElement && containerRef.current) {
            containerRef.current.requestFullscreen().catch(err => console.log("Fullscreen request failed:", err));
        }
        */

        setDifficulty(selectedDifficulty);

        let targetScore = 30; // Easy
        if (selectedDifficulty === 'medium') targetScore = 60;
        else if (selectedDifficulty === 'hard') targetScore = 90;

        setTarget(targetScore);

        // Reset Game Stats
        setScore(0);
        setWickets(0);
        setBalls(0);
        setWinner(null);
        setFeedback(null);
        setStatus('playing');

        // Reset Engine
        resetTurn();
    };

    const startRunUp = useCallback(() => {
        stateRef.current.bowler.phase = 'runup';
        stateRef.current.bowler.timer = 0;
    }, []);

    const resetTurn = useCallback(() => {
        stateRef.current.ball = null;
        stateRef.current.bowler.phase = 'idle';
        stateRef.current.bowler.timer = 0;

        // Auto-start runup for Batting
        setTimeout(() => {
            startRunUp();
        }, 1500);
    }, [startRunUp]);

    // --- LOGIC: GAME PLAY ---
    const spawnBall = useCallback(() => {
        let speedMod = 1.0;
        if (difficulty === 'medium') speedMod = 1.2;
        if (difficulty === 'hard') speedMod = 1.4;

        stateRef.current.ball = {
            x: 0,
            y: HORIZON_Y + 40,
            z: 100,
            vx: (Math.random() - 0.5) * 4,
            vz: -(1.5 + Math.random() * 0.5) * speedMod, // Faster balls on hard
            vy: 0,
            gravity: 0.1,
            isHit: false,
            scale: 0.1
        };
        stateRef.current.bowler.phase = 'delivered';
        setTimeout(() => { stateRef.current.bowler.phase = 'idle'; }, 500);
    }, [difficulty]);

    // --- EFFECTS & LOOP ---
    const createExplosion = useCallback((x, y, color) => {
        for (let i = 0; i < 30; i++) {
            stateRef.current.particles.push({
                x, y, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, life: 60, color
            });
        }
    }, []);

    // Helper to update score safely
    const updateScore = useCallback((runs, type) => {
        setScore(s => s + runs);

        let feedbackData = {
            text: runs + " RUNS",
            type: 'runs',
            gradient: 'text-white',
            subText: '',
            id: Date.now()
        };

        if (runs === 6) {
            feedbackData.text = "SIX!";
            feedbackData.type = '6';
            feedbackData.gradient = 'bg-gradient-to-b from-yellow-300 to-orange-600 text-transparent bg-clip-text';
            feedbackData.subText = 'PERFECT!';
        }
        else if (runs === 4) {
            feedbackData.text = "FOUR!";
            feedbackData.type = '4';
            feedbackData.gradient = 'bg-gradient-to-b from-cyan-300 to-blue-600 text-transparent bg-clip-text';
            feedbackData.subText = 'SMASHED!';
        }
        else if (runs === 2) {
            feedbackData.text = "DOUBLE";
            feedbackData.type = '2';
            feedbackData.gradient = 'bg-gradient-to-b from-lime-300 to-green-600 text-transparent bg-clip-text';
        }
        else if (type === 'wicket') {
            feedbackData.text = "OUT!";
            feedbackData.type = 'out';
            feedbackData.gradient = 'bg-gradient-to-b from-red-500 to-red-900 text-transparent bg-clip-text';
            feedbackData.subText = 'BOWLED!';
        }

        setFeedback(feedbackData);

        if (runs === 6) {
            stateRef.current.cameraShake = 20;
            createExplosion(400, 300, '#FFD700');
        }
    }, [createExplosion]);

    // --- STATE UPDATES ---
    const handleWicket = useCallback(() => {
        updateScore(0, 'wicket');
        setBalls(b => b + 1);
        setWickets(w => w + 1);
        resetTurn();
    }, [updateScore, resetTurn]);

    const handleBallEnd = useCallback(() => {
        setBalls(b => b + 1);
        resetTurn();
    }, [resetTurn]);

    // Handle Input (Batting)
    const handleInput = useCallback((type) => {
        const state = stateRef.current;
        if (status !== 'playing') return;

        if (state.batsman.state === 'stance') {
            state.batsman.state = 'swing';
            state.batsman.frame = 0;
        }

        if (!state.ball || state.ball.isHit || state.ball.z < -10) return;

        // Hit Logic
        const distance = Math.abs(state.ball.z);
        let hitType = 'miss';
        let runs = 0;
        const rand = Math.random();

        let perfectZone = 15;
        let goodZone = 35;

        if (distance < perfectZone) { // PERFECT ZONE
            hitType = 'perfect';
            if (rand < 0.6) runs = 6;
            else if (rand < 0.9) runs = 4;
            else runs = 2;
        }
        else if (distance < goodZone) { // GOOD ZONE
            hitType = 'good';
            if (rand < 0.2) runs = 6;
            else if (rand < 0.7) runs = 4;
            else if (rand < 0.9) runs = 2;
            else runs = 1;
        }
        else if (distance < 80) { // EDGE / LATE ZONE
            hitType = 'ok';
            if (rand < 0.1) runs = 4;
            else if (rand < 0.5) runs = 2;
            else runs = 1;
        }

        if (hitType !== 'miss') {
            state.ball.isHit = true;
            // Physics driven by Run Outcome
            if (runs === 6) {
                state.ball.vz = 10 + Math.random() * 5;
                state.ball.vy = -14;
            } else if (runs === 4) {
                state.ball.vz = 12 + Math.random() * 3;
                state.ball.vy = -6;
            } else if (runs === 2) {
                state.ball.vz = 6 + Math.random() * 2;
                state.ball.vy = -8;
            } else {
                state.ball.vz = 4 + Math.random();
                state.ball.vy = -4;
            }

            // Direction
            if (type === 'left') state.ball.vx = -12;
            else if (type === 'right') state.ball.vx = 12;
            else state.ball.vx = (Math.random() - 0.5) * 6;

            updateScore(runs, hitType);
        } else {
            setFeedback({
                text: "MISS",
                type: 'miss',
                gradient: 'text-gray-500',
                subText: "TRY AGAIN",
                id: Date.now()
            });
        }
    }, [status, updateScore]);

    // --- FEEDBACK TIMER ---
    useEffect(() => {
        if (feedback) {
            const timer = setTimeout(() => {
                setFeedback(null);
            }, 2000); // Disappear after 2 seconds
            return () => clearTimeout(timer);
        }
    }, [feedback]);


    // Game Loop
    useEffect(() => {
        if (status !== 'playing') return;
        const ctx = canvasRef.current.getContext('2d');

        const loop = () => {
            if (!canvasRef.current) return;
            const width = canvasRef.current.width;
            const height = canvasRef.current.height;
            const cx = width / 2;
            const state = stateRef.current;
            const sprites = spritesRef.current;

            // --- ANIMATION UPDATES ---
            if (state.bowler.phase === 'runup') {
                state.bowler.timer++;
                if (state.bowler.timer > 45) {
                    spawnBall();
                }
            }

            // --- DRAWING ---
            ctx.clearRect(0, 0, width, height);

            // Sky
            const skyGrad = ctx.createLinearGradient(0, 0, 0, HORIZON_Y);
            skyGrad.addColorStop(0, '#0ea5e9'); skyGrad.addColorStop(1, '#bae6fd');
            ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, width, HORIZON_Y);

            // Clouds
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            const t = Date.now() / 5000;
            ctx.beginPath(); ctx.arc((width * 0.2 + t * 50) % width, 100, 30, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc((width * 0.7 + t * 30) % width, 80, 40, 0, Math.PI * 2); ctx.fill();

            // Sightscreen
            ctx.fillStyle = "#1e3a8a";
            ctx.fillRect(0, HORIZON_Y - 50, width, 50);

            // Grass
            const grassGrad = ctx.createLinearGradient(0, HORIZON_Y, 0, height);
            grassGrad.addColorStop(0, '#22c55e'); grassGrad.addColorStop(1, '#15803d');
            ctx.fillStyle = grassGrad; ctx.fillRect(0, HORIZON_Y, width, height);

            // Pitch
            ctx.fillStyle = "#eab308";
            ctx.beginPath();
            ctx.moveTo(cx - 50, HORIZON_Y + 20); ctx.lineTo(cx + 50, HORIZON_Y + 20);
            ctx.lineTo(cx + 250, GROUND_Y); ctx.lineTo(cx - 250, GROUND_Y);
            ctx.fill();

            // Crease
            ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 3;
            ctx.stroke();

            // Helper for Stumps
            const drawStumps = (x, y, scale = 1.0) => {
                const w = 6 * scale;
                const h = 50 * scale;
                const gap = 12 * scale; // spacing between stumps

                ctx.fillStyle = "#fff";
                ctx.strokeStyle = "#333";
                ctx.lineWidth = 1;

                // 3 Stumps
                for (let i = -1; i <= 1; i++) {
                    ctx.fillRect(x + (i * gap) - w / 2, y - h, w, h);
                    ctx.strokeRect(x + (i * gap) - w / 2, y - h, w, h);
                }

                // Bails
                ctx.fillStyle = "#9ca3af";
                ctx.fillRect(x - gap, y - h - (3 * scale), gap * 2, 3 * scale);
            };

            // 1. FAR STUMPS (Bowler End)
            drawStumps(cx, HORIZON_Y + 15, 0.4);

            // 2. NEAR STUMPS (Striker End)
            // MOVED TO DRAW BEFORE BATTER (so Batter overlaps them)
            // 2. NEAR STUMPS (behind batsman)
            drawStumps(cx, GROUND_Y - 20, 1.0);



            // --- DRAW CHARACTERS WITH REALISTIC SVGs ---
            // Render Order: Far Stumps -> Near Stumps -> Bowler -> Batsman

            // Bowler
            const by = HORIZON_Y - 30;
            let bx = 0;
            let bScale = 1;
            let bowlerImg = sprites.bowlerRunup;

            if (state.bowler.phase === 'runup') {
                const progress = state.bowler.timer / 45;
                bScale = 0.5 + (0.5 * progress);
                bx = (Math.sin(state.bowler.timer * 0.5) * 5);
                // Bobbing Up/Down while running
                bx += Math.sin(state.bowler.timer * 0.8) * 2;
            }
            else if (state.bowler.phase === 'delivered') {
                bowlerImg = sprites.bowlerDelivery;
                bScale = 1.0;
                bx = 0;
            }

            if (sprites.loaded && bowlerImg) {
                const bW = 60 * bScale;
                const bH = 90 * bScale;
                ctx.drawImage(bowlerImg, cx + bx - bW / 2, by - bH + 20, bW, bH);
            } else {
                // Fallback Shape
                ctx.fillStyle = "#ef4444";
                ctx.beginPath(); ctx.arc(cx + bx, by, 10 * bScale, 0, Math.PI * 2); ctx.fill();
            }

            // Batsman
            // Shifted Y up to be "further away" than the near stumps
            // Align X to center (cx - 15) so he GUARDS the stumps (covers them)
            const bodyX = cx - 20;
            const bodyY = GROUND_Y - 168;
            let batsmanImg = sprites.batsmanStance;

            // Determine Batsman Sprite based on State
            if (state.batsman.state === 'swing') {
                state.batsman.frame++;
                batsmanImg = sprites.batsmanShot;
                if (state.batsman.frame > 20) {
                    state.batsman.state = 'stance';
                }
            }

            ctx.save(); ctx.translate(bodyX, bodyY);

            if (sprites.loaded && batsmanImg) {
                ctx.drawImage(batsmanImg, -30, -20, 100, 150);
            } else {
                // Fallback
                ctx.fillStyle = "#3b82f6"; ctx.fillRect(0, 0, 35, 45);
            }
            ctx.restore();
            // 🔥 Draw near stumps AGAIN so they appear behind pads
            drawStumps(cx, GROUND_Y - 35, 1.0);

            // Ball Logic
            if (state.ball) {
                const b = state.ball;
                if (!b.isHit) {
                    b.z += b.vz;
                    const progress = Math.max(0, (100 - b.z) / 100);
                    b.y = (HORIZON_Y + 40) + (GROUND_Y - HORIZON_Y - 70) * progress;

                    if (b.z < -10) { // Wicket
                        state.ball = null;
                        handleWicket();
                    }
                } else {
                    b.z += b.vz; b.x += b.vx; b.vy += 0.5; b.y += b.vy;
                    if (b.y > GROUND_Y) { b.y = GROUND_Y; b.vy *= -0.6; } // Bounce
                    if (b.z > 300 || b.y > height + 50) { // Boundary/Gone
                        state.ball = null;
                        handleBallEnd();
                    }
                }

                // Draw Ball
                if (state.ball) {
                    const scale = 200 / (200 + state.ball.z);
                    const size = 12 * scale;
                    // Shadow
                    ctx.fillStyle = "rgba(0,0,0,0.2)";
                    ctx.beginPath(); ctx.ellipse(cx + state.ball.x, state.ball.y + size, size, size * 0.4, 0, 0, Math.PI * 2); ctx.fill();
                    // Ball
                    ctx.fillStyle = "#fff";
                    ctx.beginPath(); ctx.arc(cx + state.ball.x, state.ball.y, size, 0, Math.PI * 2); ctx.fill();
                    // Seam
                    ctx.strokeStyle = "#cc0000"; ctx.lineWidth = 2 * scale;
                    ctx.beginPath(); ctx.arc(cx + state.ball.x, state.ball.y, size, -0.5, 2.5); ctx.stroke();
                }
            }

            // Particles
            for (let i = state.particles.length - 1; i >= 0; i--) {
                const p = state.particles[i];
                p.x += p.vx; p.y += p.vy; p.life--;
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life / 60;
                ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
                if (p.life <= 0) state.particles.splice(i, 1);
            }
            ctx.globalAlpha = 1;

            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafRef.current);
    }, [status, difficulty, spawnBall, target, handleWicket, handleBallEnd]);

    // --- CONTROLS ---
    useEffect(() => {
        const handleKey = (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            if (e.key === 'ArrowLeft' || e.key === 'a') handleInput('left');
            else if (e.key === 'ArrowRight' || e.key === 'd') handleInput('right');
            else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') handleInput('straight');
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleInput]);

    // REACTIVE GAME STATE CHECK
    useEffect(() => {
        if (status !== 'playing') return;

        if (score >= target) {
            setTimeout(() => {
                setWinner('user');
                setStatus('game_over');
            }, 0);
        }
        else if (wickets >= MAX_WICKETS || balls >= MAX_BALLS) {
            setTimeout(() => {
                setWinner('cpu');
                setStatus('game_over');
            }, 0);
        }
    }, [score, wickets, balls, status, target, MAX_WICKETS, MAX_BALLS]);

    // --- RENDER UI ---
    return (
        <div ref={containerRef} className="w-full h-full relative bg-gray-900 border-4 border-gray-700 rounded-xl overflow-hidden font-sans select-none text-white shadow-2xl flex items-center justify-center">
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain"
                style={{ width: '100%', height: '100%' }}
            />

            {/* STYLIZED FEEDBACK POPUPS (LEFT SIDE) */}
            {status === 'playing' && feedback && (
                <div key={feedback.id} className="absolute top-1/2 left-10 -translate-y-1/2 pointer-events-none z-50 flex flex-col items-start animate-in slide-in-from-left duration-300">

                    {/* Main Text Effect */}
                    <div className={`relative ${feedback.type === '6' ? 'animate-bounce' : 'animate-pulse'}`}>
                        {/* Shadow Layer */}
                        <span className="absolute inset-0 translate-y-2 translate-x-2 text-black/50 blur-sm select-none font-black text-8xl italic tracking-tighter"
                            style={{ WebkitTextStroke: '12px black' }}>
                            {feedback.text}
                        </span>

                        {/* Foreground Layer */}
                        <span className={`relative font-black text-8xl italic tracking-tighter select-none ${feedback.gradient}`}
                            style={{
                                WebkitTextStroke: '3px white',
                                textShadow: '0 10px 20px rgba(0,0,0,0.5)'
                            }}>
                            {feedback.text}
                        </span>

                        {/* Decorator Icons */}
                        {feedback.type === '6' && <div className="absolute -top-12 -right-12 text-6xl animate-spin-slow">🔥</div>}
                        {feedback.type === '4' && <div className="absolute -bottom-8 -right-8 text-6xl rotate-12">🚀</div>}
                        {feedback.type === 'out' && <div className="absolute top-0 left-0 w-full h-1 bg-red-600 rotate-45" />}
                    </div>

                    {feedback.subText && (
                        <div className="mt-4 ml-2 bg-black/60 backdrop-blur px-6 py-2 rounded-full border border-white/20">
                            <span className="text-white font-bold tracking-[0.3em] uppercase">{feedback.subText}</span>
                        </div>
                    )}
                </div>
            )}

            {/* SCOREBOARD HUD */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-8 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-6 select-none z-10 transform skew-x-[-5deg]">
                <div className="transform skew-x-[5deg] flex items-center gap-8">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase">SCORE</span>
                        <div className="text-4xl font-black text-white leading-none tracking-tighter drop-shadow-lg">
                            {score}<span className="text-gray-500 text-3xl">/</span><span className="text-red-500">{wickets}</span>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="flex flex-col items-center min-w-[140px]">
                        <div className="flex items-center gap-2 mb-1">
                            <Target size={12} className="text-yellow-500" />
                            <span className="text-[10px] text-yellow-500 font-bold tracking-widest uppercase">TARGET: {target}</span>
                        </div>
                        <div className="text-lg font-bold text-gray-200 whitespace-nowrap">
                            <span className="text-white text-2xl">{Math.max(0, target - score)}</span> runs in <span className="text-white text-2xl">{Math.max(0, MAX_BALLS - balls)}</span> balls
                        </div>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase">OVERS</span>
                        <div className="text-4xl font-black text-blue-400 leading-none tracking-tighter drop-shadow-lg tabular-nums">
                            {Math.floor(balls / 6)}<span className="text-xl text-gray-600">.</span>{balls % 6}
                        </div>
                    </div>
                </div>
            </div>

            {/* MENUS */}
            {status === 'menu' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur z-20">
                    <Activity size={80} className="text-blue-500 mb-6 animate-pulse" />
                    <h2 className="text-6xl font-black italic mb-2 tracking-tighter">TURBO <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">CRICKET</span></h2>
                    <p className="text-gray-400 mb-8 font-medium tracking-widest">ARCADE EDITION</p>

                    <div className="flex gap-4 mb-12">
                        <button onClick={() => startMatch('easy')} className="bg-green-500 hover:bg-green-400 text-white w-32 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-transform">
                            <div className="flex flex-col items-center">
                                <Shield size={24} className="mb-1" />
                                <span>EASY</span>
                                <span className="text-[10px] opacity-70">Target: 30</span>
                            </div>
                        </button>
                        <button onClick={() => startMatch('medium')} className="bg-blue-500 hover:bg-blue-400 text-white w-32 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-transform">
                            <div className="flex flex-col items-center">
                                <Zap size={24} className="mb-1" />
                                <span>MEDIUM</span>
                                <span className="text-[10px] opacity-70">Target: 60</span>
                            </div>
                        </button>
                        <button onClick={() => startMatch('hard')} className="bg-red-500 hover:bg-red-400 text-white w-32 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-transform">
                            <div className="flex flex-col items-center">
                                <Crown size={24} className="mb-1" />
                                <span>HARD</span>
                                <span className="text-[10px] opacity-70">Target: 90</span>
                            </div>
                        </button>
                    </div>

                </div>
            )}

            {/* Mobile Controls Overlay */}
            {status === 'playing' && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-8 pointer-events-auto md:hidden opacity-80 z-40">
                    <button
                        className="w-20 h-20 bg-white/10 rounded-full border-2 border-white/30 flex items-center justify-center active:bg-white/30 transition-colors"
                        onTouchStart={(e) => { e.preventDefault(); handleInput('left'); }}
                    >
                        <Play className="rotate-180 w-10 h-10 text-white" />
                    </button>
                    <button
                        className="w-24 h-24 bg-yellow-500/20 rounded-full border-4 border-yellow-500/50 flex items-center justify-center active:bg-yellow-500/40 transition-colors"
                        onTouchStart={(e) => { e.preventDefault(); handleInput('straight'); }}
                    >
                        <div className="w-16 h-16 rounded-full border-2 border-white/50 bg-white/10" />
                    </button>
                    <button
                        className="w-20 h-20 bg-white/10 rounded-full border-2 border-white/30 flex items-center justify-center active:bg-white/30 transition-colors"
                        onTouchStart={(e) => { e.preventDefault(); handleInput('right'); }}
                    >
                        <Play className="w-10 h-10 text-white" />
                    </button>
                </div>
            )}

            {status === 'game_over' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur z-20 animate-in zoom-in duration-300">
                    <div className="mb-6">
                        {winner === 'user' ?
                            <Trophy size={100} className="text-yellow-400 animate-bounce" /> :
                            <Trophy size={100} className="text-gray-600" />
                        }
                    </div>

                    <h2 className="text-6xl font-black italic mb-4 text-center">
                        {winner === 'user' ?
                            <span className="text-green-500">VICTORY!</span> :
                            <span className="text-red-500">DEFEAT</span>
                        }
                    </h2>

                    <p className="text-gray-400 text-xl mb-1 font-medium">
                        {winner === 'user' ? "You chased down the target!" : "You failed to chase the target."}
                    </p>
                    <p className="text-2xl font-bold text-white mb-8">
                        Score: {score}/{wickets} <span className="text-sm text-gray-500">(Target: {target})</span>
                    </p>

                    <button onClick={() => setStatus('menu')} className="bg-white text-black hover:bg-gray-200 px-10 py-4 rounded-full font-black text-xl flex items-center gap-2">
                        <RotateCcw size={20} /> PLAY AGAIN
                    </button>
                </div>
            )}

        </div>
    );
};

export default CricketGame;
